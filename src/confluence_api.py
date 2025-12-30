from typing import List, Dict, Any, Optional
from atlassian import Confluence
from .config import Config


class ConfluenceClient:
    """Client for interacting with Confluence via REST API"""

    def __init__(self, config: Config):
        self.config = config
        self.client = Confluence(
            url=config.confluence_url,
            username=config.confluence_username,
            password=config.confluence_api_token,
            cloud=False  # Set to False for self-hosted/enterprise instances
        )
        self.space_key = config.confluence_space_key

    def search_pages(
        self,
        query: str,
        space_key: Optional[str] = None,
        max_results: int = 20
    ) -> List[Dict[str, Any]]:
        """
        Search for Confluence pages

        Args:
            query: Search query
            space_key: Optional space key to search in. Uses configured space if not provided
            max_results: Maximum number of results

        Returns:
            List of matching pages
        """
        search_space = space_key or self.space_key

        try:
            # Use CQL (Confluence Query Language) for searching
            cql = f'type=page AND text~"{query}"'

            if search_space:
                cql += f' AND space="{search_space}"'

            results = self.client.cql(cql, limit=max_results)
            return results.get('results', [])
        except Exception as e:
            raise RuntimeError(f"Failed to search Confluence pages: {e}")

    def get_page_by_title(
        self,
        title: str,
        space_key: Optional[str] = None
    ) -> Optional[Dict[str, Any]]:
        """
        Get a page by its title

        Args:
            title: Page title
            space_key: Optional space key. Uses configured space if not provided

        Returns:
            Page data or None if not found
        """
        search_space = space_key or self.space_key

        try:
            page = self.client.get_page_by_title(
                space=search_space,
                title=title,
                expand='body.storage,version,space'
            )
            return page
        except Exception as e:
            print(f"Warning: Could not find page '{title}': {e}")
            return None

    def get_page_by_id(self, page_id: str) -> Dict[str, Any]:
        """
        Get a page by its ID

        Args:
            page_id: Page ID

        Returns:
            Page data
        """
        try:
            page = self.client.get_page_by_id(
                page_id=page_id,
                expand='body.storage,version,space'
            )
            return page
        except Exception as e:
            raise RuntimeError(f"Failed to get page: {e}")

    def get_page_content(
        self,
        page_id: Optional[str] = None,
        title: Optional[str] = None,
        space_key: Optional[str] = None
    ) -> str:
        """
        Get the content of a page

        Args:
            page_id: Page ID
            title: Page title (alternative to page_id)
            space_key: Space key (required if using title)

        Returns:
            Page content as HTML
        """
        if page_id:
            page = self.get_page_by_id(page_id)
        elif title:
            page = self.get_page_by_title(title, space_key)
            if not page:
                raise ValueError(f"Page '{title}' not found")
        else:
            raise ValueError("Either page_id or title must be provided")

        return page.get('body', {}).get('storage', {}).get('value', '')

    def get_space_pages(
        self,
        space_key: Optional[str] = None,
        max_results: int = 50
    ) -> List[Dict[str, Any]]:
        """
        Get all pages in a space

        Args:
            space_key: Optional space key. Uses configured space if not provided
            max_results: Maximum number of results

        Returns:
            List of pages
        """
        search_space = space_key or self.space_key

        try:
            pages = self.client.get_all_pages_from_space(
                space=search_space,
                start=0,
                limit=max_results,
                expand='version,space'
            )
            return pages
        except Exception as e:
            raise RuntimeError(f"Failed to get space pages: {e}")

    def get_recent_pages(
        self,
        space_key: Optional[str] = None,
        max_results: int = 10
    ) -> List[Dict[str, Any]]:
        """
        Get recently updated pages in a space

        Args:
            space_key: Optional space key. Uses configured space if not provided
            max_results: Maximum number of results

        Returns:
            List of recently updated pages
        """
        search_space = space_key or self.space_key

        try:
            cql = 'type=page ORDER BY lastModified DESC'
            if search_space:
                cql = f'type=page AND space="{search_space}" ORDER BY lastModified DESC'

            results = self.client.cql(cql, limit=max_results)
            return results.get('results', [])
        except Exception as e:
            raise RuntimeError(f"Failed to get recent pages: {e}")

    def format_page(self, page: Dict[str, Any]) -> Dict[str, Any]:
        """
        Format a Confluence page into a simpler structure

        Args:
            page: Raw Confluence page data

        Returns:
            Formatted page dictionary
        """
        # Handle both search results and direct page API responses
        if 'content' in page:
            # This is from a search result
            content = page['content']
            page_id = content.get('id')
            title = content.get('title')
            space = content.get('space', {}).get('key', 'Unknown')
        else:
            # This is from direct API call
            page_id = page.get('id')
            title = page.get('title')
            space = page.get('space', {}).get('key', 'Unknown')

        version = page.get('version', {}).get('number', 1)
        last_modified = page.get('version', {}).get('when') or page.get('history', {}).get('lastUpdated', {}).get('when')

        return {
            'id': page_id,
            'title': title,
            'space': space,
            'version': version,
            'last_modified': last_modified,
            'url': f"{self.config.confluence_url}/pages/viewpage.action?pageId={page_id}"
        }

    def format_pages_summary(self, pages: List[Dict[str, Any]]) -> str:
        """
        Format pages into a human-readable summary

        Args:
            pages: List of Confluence pages

        Returns:
            Formatted string summary
        """
        if not pages:
            return "No pages found."

        formatted_pages = [self.format_page(page) for page in pages]

        summary = f"Found {len(formatted_pages)} page(s):\n\n"

        for i, page in enumerate(formatted_pages, 1):
            summary += f"{i}. {page['title']}\n"
            summary += f"   Space: {page['space']} | Version: {page['version']}\n"
            if page.get('last_modified'):
                summary += f"   Last Modified: {page['last_modified']}\n"
            summary += f"   URL: {page['url']}\n\n"

        return summary

    def convert_html_to_text(self, html: str) -> str:
        """
        Convert HTML content to plain text (basic implementation)

        Args:
            html: HTML content

        Returns:
            Plain text
        """
        import re

        # Remove HTML tags
        text = re.sub(r'<[^>]+>', '', html)

        # Decode common HTML entities
        text = text.replace('&nbsp;', ' ')
        text = text.replace('&amp;', '&')
        text = text.replace('&lt;', '<')
        text = text.replace('&gt;', '>')
        text = text.replace('&quot;', '"')

        # Remove extra whitespace
        text = re.sub(r'\s+', ' ', text)

        return text.strip()
