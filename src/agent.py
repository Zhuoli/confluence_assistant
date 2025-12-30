import anthropic
from typing import Optional, List
from .config import Config
from .jira_service import JiraService
from .confluence_service import ConfluenceService


class AtlassianAgent:
    """AI Agent for interacting with Jira and Confluence"""

    def __init__(self, config: Config):
        self.config = config
        self.jira_service = JiraService(config)
        self.confluence_service = ConfluenceService(config)
        self.claude = anthropic.Anthropic(api_key=config.anthropic_api_key)

    def get_jira_issues(
        self,
        board_id: Optional[int] = None,
        sprint_only: bool = True,
        max_results: int = 50
    ) -> str:
        """
        Fetch Jira issues assigned to the user

        Args:
            board_id: Optional board ID
            sprint_only: Only get sprint issues
            max_results: Maximum number of results

        Returns:
            Formatted summary of issues
        """
        print(f"\nFetching Jira issues for {self.config.user_email}...")

        if sprint_only:
            issues = self.jira_service.get_my_sprint_issues(max_results=max_results)
        elif board_id:
            issues = self.jira_service.get_board_issues(board_id=board_id, max_results=max_results)
        else:
            issues = self.jira_service.get_my_issues(max_results=max_results)

        summary = self.jira_service.format_issues_summary(issues)
        return summary

    def search_confluence(
        self,
        query: str,
        space_key: Optional[str] = None,
        max_results: int = 10
    ) -> str:
        """
        Search Confluence pages

        Args:
            query: Search query
            space_key: Optional space key
            max_results: Maximum number of results

        Returns:
            Formatted summary of pages
        """
        print(f"\nSearching Confluence for: '{query}'...")

        pages = self.confluence_service.search_pages(
            query=query,
            space_key=space_key,
            max_results=max_results
        )

        summary = self.confluence_service.format_pages_summary(pages)
        return summary

    def read_confluence_page(
        self,
        page_id: Optional[str] = None,
        title: Optional[str] = None,
        space_key: Optional[str] = None
    ) -> str:
        """
        Read a Confluence page

        Args:
            page_id: Page ID
            title: Page title
            space_key: Space key

        Returns:
            Page content as text
        """
        print(f"\nReading Confluence page...")

        content = self.confluence_service.get_page_content(
            page_id=page_id,
            title=title,
            space_key=space_key,
            as_text=True
        )

        return content

    def get_recent_confluence_pages(
        self,
        space_key: Optional[str] = None,
        max_results: int = 10
    ) -> str:
        """
        Get recently updated Confluence pages

        Args:
            space_key: Optional space key
            max_results: Maximum number of results

        Returns:
            Formatted summary of pages
        """
        print(f"\nFetching recent Confluence pages...")

        pages = self.confluence_service.get_recent_pages(
            space_key=space_key,
            max_results=max_results
        )

        summary = self.confluence_service.format_pages_summary(pages)
        return summary

    def analyze_with_claude(
        self,
        content: str,
        user_question: Optional[str] = None,
        content_type: str = "data"
    ) -> str:
        """
        Use Claude to analyze content

        Args:
            content: Content to analyze
            user_question: Optional question to ask
            content_type: Type of content (jira, confluence, data)

        Returns:
            Claude's analysis
        """
        if not user_question:
            if content_type == "jira":
                user_question = "Please summarize these Jira issues, highlighting priorities and any potential blockers."
            elif content_type == "confluence":
                user_question = "Please summarize this Confluence page content."
            else:
                user_question = "Please analyze this content and provide insights."

        prompt = f"""{content}

{user_question}"""

        message = self.claude.messages.create(
            model="claude-3-5-sonnet-20241022",
            max_tokens=4000,
            messages=[
                {"role": "user", "content": prompt}
            ]
        )

        return message.content[0].text

    def run_jira_workflow(
        self,
        board_id: Optional[int] = None,
        sprint_only: bool = True,
        analyze: bool = True,
        question: Optional[str] = None
    ):
        """
        Run Jira workflow: fetch issues and optionally analyze with Claude

        Args:
            board_id: Optional board ID
            sprint_only: Only get sprint issues
            analyze: Whether to analyze with Claude
            question: Optional question for Claude
        """
        try:
            issues_summary = self.get_jira_issues(
                board_id=board_id,
                sprint_only=sprint_only
            )

            print("\n" + "=" * 60)
            print("JIRA ISSUES")
            print("=" * 60)
            print(issues_summary)

            if analyze:
                print("\n" + "=" * 60)
                print("CLAUDE'S ANALYSIS")
                print("=" * 60)
                analysis = self.analyze_with_claude(
                    issues_summary,
                    user_question=question,
                    content_type="jira"
                )
                print(analysis)
                print("=" * 60)

        except Exception as e:
            print(f"\nError: {e}")
            raise

    def run_confluence_search(
        self,
        query: str,
        space_key: Optional[str] = None,
        analyze: bool = False,
        question: Optional[str] = None
    ):
        """
        Run Confluence search workflow

        Args:
            query: Search query
            space_key: Optional space key
            analyze: Whether to analyze with Claude
            question: Optional question for Claude
        """
        try:
            pages_summary = self.search_confluence(
                query=query,
                space_key=space_key
            )

            print("\n" + "=" * 60)
            print("CONFLUENCE SEARCH RESULTS")
            print("=" * 60)
            print(pages_summary)

            if analyze:
                print("\n" + "=" * 60)
                print("CLAUDE'S ANALYSIS")
                print("=" * 60)
                analysis = self.analyze_with_claude(
                    pages_summary,
                    user_question=question,
                    content_type="confluence"
                )
                print(analysis)
                print("=" * 60)

        except Exception as e:
            print(f"\nError: {e}")
            raise

    def run_confluence_read(
        self,
        page_id: Optional[str] = None,
        title: Optional[str] = None,
        space_key: Optional[str] = None,
        analyze: bool = True,
        question: Optional[str] = None
    ):
        """
        Run Confluence read workflow: read a page and optionally analyze

        Args:
            page_id: Page ID
            title: Page title
            space_key: Space key
            analyze: Whether to analyze with Claude
            question: Optional question for Claude
        """
        try:
            content = self.read_confluence_page(
                page_id=page_id,
                title=title,
                space_key=space_key
            )

            print("\n" + "=" * 60)
            print("CONFLUENCE PAGE CONTENT")
            print("=" * 60)
            print(content[:1000] + ("..." if len(content) > 1000 else ""))

            if analyze:
                print("\n" + "=" * 60)
                print("CLAUDE'S ANALYSIS")
                print("=" * 60)
                analysis = self.analyze_with_claude(
                    content,
                    user_question=question,
                    content_type="confluence"
                )
                print(analysis)
                print("=" * 60)

        except Exception as e:
            print(f"\nError: {e}")
            raise
