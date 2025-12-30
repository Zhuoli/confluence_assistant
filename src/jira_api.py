from typing import List, Dict, Any, Optional
from atlassian import Jira
from .config import Config


class JiraClient:
    """Client for interacting with Jira via REST API"""

    def __init__(self, config: Config):
        self.config = config
        self.client = Jira(
            url=config.jira_url,
            username=config.jira_username,
            password=config.jira_api_token,
            cloud=False  # Set to False for self-hosted/enterprise instances
        )
        self.user_email = config.user_email

    def get_my_issues(
        self,
        max_results: int = 50,
        additional_jql: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        """
        Get issues assigned to the current user

        Args:
            max_results: Maximum number of results to return
            additional_jql: Optional additional JQL filters

        Returns:
            List of issues
        """
        # Base JQL to find issues assigned to user
        jql = f'assignee = "{self.user_email}"'

        if additional_jql:
            jql += f' AND {additional_jql}'

        jql += ' ORDER BY priority DESC, updated DESC'

        try:
            results = self.client.jql(jql, limit=max_results)
            return results.get('issues', [])
        except Exception as e:
            raise RuntimeError(f"Failed to fetch Jira issues: {e}")

    def get_sprint_issues(
        self,
        include_future_sprints: bool = False,
        max_results: int = 50
    ) -> List[Dict[str, Any]]:
        """
        Get issues assigned to the user in active sprints

        Args:
            include_future_sprints: Whether to include future sprints
            max_results: Maximum number of results

        Returns:
            List of sprint issues
        """
        sprint_filter = "sprint in openSprints()"
        if include_future_sprints:
            sprint_filter = "sprint in openSprints() OR sprint in futureSprints()"

        return self.get_my_issues(
            max_results=max_results,
            additional_jql=sprint_filter
        )

    def get_board_issues(
        self,
        board_id: Optional[int] = None,
        max_results: int = 50
    ) -> List[Dict[str, Any]]:
        """
        Get issues from a specific board assigned to the user

        Args:
            board_id: Optional board ID. If not provided, gets from all boards
            max_results: Maximum number of results

        Returns:
            List of board issues
        """
        if board_id:
            try:
                # Get issues from specific board
                issues = self.client.get_issues_for_board(
                    board_id=board_id,
                    jql=f'assignee = "{self.user_email}"',
                    max_results=max_results
                )
                return issues.get('issues', [])
            except Exception as e:
                raise RuntimeError(f"Failed to fetch board issues: {e}")
        else:
            # Get all issues assigned to user
            return self.get_my_issues(max_results=max_results)

    def get_all_boards(self) -> List[Dict[str, Any]]:
        """
        Get all boards the user has access to

        Returns:
            List of boards
        """
        try:
            response = self.client.get_all_boards()
            return response.get('values', [])
        except Exception as e:
            raise RuntimeError(f"Failed to fetch boards: {e}")

    def format_issue(self, issue: Dict[str, Any]) -> Dict[str, Any]:
        """
        Format a Jira issue into a simpler structure

        Args:
            issue: Raw Jira issue

        Returns:
            Formatted issue dictionary
        """
        fields = issue.get('fields', {})

        return {
            'key': issue.get('key'),
            'summary': fields.get('summary'),
            'status': fields.get('status', {}).get('name'),
            'priority': fields.get('priority', {}).get('name', 'None'),
            'assignee': fields.get('assignee', {}).get('displayName') if fields.get('assignee') else 'Unassigned',
            'issue_type': fields.get('issuetype', {}).get('name'),
            'created': fields.get('created'),
            'updated': fields.get('updated'),
            'description': fields.get('description', 'No description'),
            'labels': fields.get('labels', []),
            'sprint': self._extract_sprint_name(fields),
            'story_points': fields.get('customfield_10016'),  # Common story points field
            'url': f"{self.config.jira_url}/browse/{issue.get('key')}"
        }

    def _extract_sprint_name(self, fields: Dict[str, Any]) -> Optional[str]:
        """Extract sprint name from issue fields"""
        sprint_field = fields.get('customfield_10020')  # Common sprint field
        if sprint_field and isinstance(sprint_field, list) and len(sprint_field) > 0:
            sprint = sprint_field[-1]  # Get the latest sprint
            if isinstance(sprint, dict):
                return sprint.get('name')
            elif isinstance(sprint, str):
                # Parse sprint string format
                import re
                match = re.search(r'name=([^,\]]+)', sprint)
                if match:
                    return match.group(1)
        return None

    def format_issues_summary(self, issues: List[Dict[str, Any]]) -> str:
        """
        Format issues into a human-readable summary

        Args:
            issues: List of Jira issues

        Returns:
            Formatted string summary
        """
        if not issues:
            return "No issues found."

        formatted_issues = [self.format_issue(issue) for issue in issues]

        summary = f"Found {len(formatted_issues)} issue(s):\n\n"

        for i, issue in enumerate(formatted_issues, 1):
            summary += f"{i}. [{issue['key']}] {issue['summary']}\n"
            summary += f"   Status: {issue['status']} | Priority: {issue['priority']}\n"
            summary += f"   Type: {issue['issue_type']}\n"

            if issue.get('sprint'):
                summary += f"   Sprint: {issue['sprint']}\n"

            if issue.get('story_points'):
                summary += f"   Story Points: {issue['story_points']}\n"

            summary += f"   URL: {issue['url']}\n\n"

        return summary
