from typing import List, Dict, Any, Optional
from .jira_api import JiraClient
from .config import Config


class JiraService:
    """Service for interacting with Jira via REST API"""

    def __init__(self, config: Config):
        self.config = config
        self.client = JiraClient(config)

    def get_my_issues(self, max_results: int = 50) -> List[Dict[str, Any]]:
        """
        Get all issues assigned to the configured user

        Args:
            max_results: Maximum number of results

        Returns:
            List of issues
        """
        return self.client.get_my_issues(max_results=max_results)

    def get_my_sprint_issues(
        self,
        include_future: bool = False,
        max_results: int = 50
    ) -> List[Dict[str, Any]]:
        """
        Get Sprint issues assigned to the configured user

        Args:
            include_future: Include future sprints
            max_results: Maximum number of results

        Returns:
            List of Sprint issues
        """
        return self.client.get_sprint_issues(
            include_future_sprints=include_future,
            max_results=max_results
        )

    def get_board_issues(
        self,
        board_id: Optional[int] = None,
        max_results: int = 50
    ) -> List[Dict[str, Any]]:
        """
        Get issues from a board assigned to the user

        Args:
            board_id: Optional board ID
            max_results: Maximum number of results

        Returns:
            List of board issues
        """
        return self.client.get_board_issues(
            board_id=board_id,
            max_results=max_results
        )

    def get_boards(self) -> List[Dict[str, Any]]:
        """
        Get all boards the user has access to

        Returns:
            List of boards
        """
        return self.client.get_all_boards()

    def format_issues_summary(self, issues: List[Dict[str, Any]]) -> str:
        """
        Format issues into a human-readable summary

        Args:
            issues: List of Jira issues

        Returns:
            Formatted string summary
        """
        return self.client.format_issues_summary(issues)
