from typing import List, Dict, Any, Optional
from .confluence_api import ConfluenceClient
from .config import Config


class ConfluenceService:
    """Service for interacting with Confluence via REST API"""

    def __init__(self, config: Config):
        self.config = config
        self.client = ConfluenceClient(config)

    def search_pages(
        self,
        query: str,
        space_key: Optional[str] = None,
        max_results: int = 20
    ) -> List[Dict[str, Any]]:
        """
        Search for pages in Confluence

        Args:
            query: Search query
            space_key: Optional space key
            max_results: Maximum number of results

        Returns:
            List of matching pages
        """
        return self.client.search_pages(
            query=query,
            space_key=space_key,
            max_results=max_results
        )

    def get_page(
        self,
        page_id: Optional[str] = None,
        title: Optional[str] = None,
        space_key: Optional[str] = None
    ) -> Optional[Dict[str, Any]]:
        """
        Get a specific page

        Args:
            page_id: Page ID
            title: Page title (alternative to page_id)
            space_key: Space key (required if using title)

        Returns:
            Page data
        """
        if page_id:
            return self.client.get_page_by_id(page_id)
        elif title:
            return self.client.get_page_by_title(title, space_key)
        else:
            raise ValueError("Either page_id or title must be provided")

    def get_page_content(
        self,
        page_id: Optional[str] = None,
        title: Optional[str] = None,
        space_key: Optional[str] = None,
        as_text: bool = True
    ) -> str:
        """
        Get the content of a page

        Args:
            page_id: Page ID
            title: Page title
            space_key: Space key
            as_text: Convert HTML to plain text

        Returns:
            Page content
        """
        html_content = self.client.get_page_content(
            page_id=page_id,
            title=title,
            space_key=space_key
        )

        if as_text:
            return self.client.convert_html_to_text(html_content)

        return html_content

    def get_space_pages(
        self,
        space_key: Optional[str] = None,
        max_results: int = 50
    ) -> List[Dict[str, Any]]:
        """
        Get all pages in a space

        Args:
            space_key: Optional space key
            max_results: Maximum number of results

        Returns:
            List of pages
        """
        return self.client.get_space_pages(
            space_key=space_key,
            max_results=max_results
        )

    def get_recent_pages(
        self,
        space_key: Optional[str] = None,
        max_results: int = 10
    ) -> List[Dict[str, Any]]:
        """
        Get recently updated pages

        Args:
            space_key: Optional space key
            max_results: Maximum number of results

        Returns:
            List of recently updated pages
        """
        return self.client.get_recent_pages(
            space_key=space_key,
            max_results=max_results
        )

    def format_pages_summary(self, pages: List[Dict[str, Any]]) -> str:
        """
        Format pages into a human-readable summary

        Args:
            pages: List of Confluence pages

        Returns:
            Formatted string summary
        """
        return self.client.format_pages_summary(pages)
