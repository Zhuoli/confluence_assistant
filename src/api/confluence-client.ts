import axios, { AxiosInstance } from 'axios';
import axiosRetry from 'axios-retry';
import type { Config } from '../config/index.js';
import type { ConfluencePage, ConfluenceSearchResult, FormattedConfluencePage } from './types.js';

/**
 * Confluence REST API client
 */
export class ConfluenceClient {
  private client: AxiosInstance;
  private spaceKey: string;

  constructor(private config: Config) {
    this.client = axios.create({
      baseURL: `${config.confluenceUrl}/rest/api`,
      auth: {
        username: config.confluenceUsername,
        password: config.confluenceApiToken,
      },
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    });

    // Add retry logic
    axiosRetry(this.client, {
      retries: 3,
      retryDelay: axiosRetry.exponentialDelay,
      retryCondition: (error) => {
        return axiosRetry.isNetworkOrIdempotentRequestError(error) || error.response?.status === 429;
      },
    });

    this.spaceKey = config.confluenceSpaceKey;
  }

  /**
   * Search for Confluence pages using CQL
   */
  async searchConfluencePages(
    query: string,
    spaceKey?: string,
    maxResults: number = 20
  ): Promise<ConfluencePage[]> {
    const searchSpace = spaceKey || this.spaceKey;

    try {
      // Use CQL (Confluence Query Language) for searching
      let cql = `type=page AND text~"${query}"`;

      if (searchSpace) {
        cql += ` AND space="${searchSpace}"`;
      }

      const response = await this.client.get<ConfluenceSearchResult>('/content/search', {
        params: {
          cql,
          limit: maxResults,
          expand: 'space,version,body.storage',
        },
      });

      return response.data.results;
    } catch (error) {
      throw new Error(`Failed to search Confluence pages: ${error}`);
    }
  }

  /**
   * Get a page by its title
   */
  async getPageByTitle(title: string, spaceKey?: string): Promise<ConfluencePage | null> {
    const searchSpace = spaceKey || this.spaceKey;

    try {
      const response = await this.client.get<{ results: ConfluencePage[] }>('/content', {
        params: {
          type: 'page',
          spaceKey: searchSpace,
          title,
          expand: 'body.storage,version,space',
        },
      });

      if (response.data.results && response.data.results.length > 0) {
        return response.data.results[0];
      }

      return null;
    } catch (error) {
      console.warn(`Could not find page '${title}': ${error}`);
      return null;
    }
  }

  /**
   * Get a page by its ID
   */
  async getPageById(pageId: string): Promise<ConfluencePage> {
    try {
      const response = await this.client.get<ConfluencePage>(`/content/${pageId}`, {
        params: {
          expand: 'body.storage,version,space',
        },
      });

      return response.data;
    } catch (error) {
      throw new Error(`Failed to get page: ${error}`);
    }
  }

  /**
   * Get page content (body)
   */
  async getPageContent(pageId?: string, title?: string, spaceKey?: string): Promise<string> {
    let page: ConfluencePage | null = null;

    if (pageId) {
      page = await this.getPageById(pageId);
    } else if (title) {
      page = await this.getPageByTitle(title, spaceKey);
    }

    if (!page) {
      throw new Error('Page not found');
    }

    return page.body?.storage?.value || '';
  }

  /**
   * Create a new Confluence page
   */
  async createConfluencePage(
    title: string,
    body: string,
    spaceKey?: string,
    parentId?: string
  ): Promise<ConfluencePage> {
    const space = spaceKey || this.spaceKey;

    try {
      const pageData: any = {
        type: 'page',
        title,
        space: { key: space },
        body: {
          storage: {
            value: body,
            representation: 'storage',
          },
        },
      };

      if (parentId) {
        pageData.ancestors = [{ id: parentId }];
      }

      const response = await this.client.post<ConfluencePage>('/content', pageData);
      return response.data;
    } catch (error) {
      throw new Error(`Failed to create Confluence page: ${error}`);
    }
  }

  /**
   * Update a Confluence page
   */
  async updateConfluencePage(
    pageId: string,
    title?: string,
    body?: string
  ): Promise<ConfluencePage> {
    try {
      // First, get the current page to obtain the current version
      const currentPage = await this.getPageById(pageId);

      const updateData: any = {
        version: {
          number: (currentPage.version?.number || 0) + 1,
        },
        type: 'page',
      };

      if (title) {
        updateData.title = title;
      }

      if (body) {
        updateData.body = {
          storage: {
            value: body,
            representation: 'storage',
          },
        };
      }

      const response = await this.client.put<ConfluencePage>(`/content/${pageId}`, updateData);
      return response.data;
    } catch (error) {
      throw new Error(`Failed to update Confluence page: ${error}`);
    }
  }

  /**
   * Get recently updated pages
   */
  async getRecentPages(spaceKey?: string, maxResults: number = 10): Promise<ConfluencePage[]> {
    const searchSpace = spaceKey || this.spaceKey;

    try {
      let cql = 'type=page ORDER BY lastModified DESC';

      if (searchSpace) {
        cql = `type=page AND space="${searchSpace}" ORDER BY lastModified DESC`;
      }

      const response = await this.client.get<ConfluenceSearchResult>('/content/search', {
        params: {
          cql,
          limit: maxResults,
          expand: 'space,version',
        },
      });

      return response.data.results;
    } catch (error) {
      throw new Error(`Failed to get recent pages: ${error}`);
    }
  }

  /**
   * Format a Confluence page into a simpler structure
   */
  formatPage(page: ConfluencePage): FormattedConfluencePage {
    return {
      id: page.id,
      title: page.title,
      space_key: page.space?.key || null,
      space_name: page.space?.name || null,
      url: page._links?.webui
        ? `${this.config.confluenceUrl}${page._links.webui}`
        : `${this.config.confluenceUrl}/pages/viewpage.action?pageId=${page.id}`,
      last_updated: page.version ? new Date().toISOString() : null,
      content_preview: this.getContentPreview(page.body?.storage?.value),
    };
  }

  /**
   * Get a preview of page content (first 200 characters)
   */
  private getContentPreview(html?: string): string | null {
    if (!html) return null;

    // Simple HTML stripping (basic version)
    const text = html.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();

    if (text.length > 200) {
      return text.substring(0, 200) + '...';
    }

    return text;
  }

  /**
   * Format multiple pages summary
   */
  formatPagesSummary(pages: ConfluencePage[]): string {
    const formatted = pages.map((page) => this.formatPage(page));

    if (formatted.length === 0) {
      return 'No pages found.';
    }

    return formatted
      .map((page) => {
        const lines = [`📄 ${page.title}`];

        if (page.space_name) {
          lines.push(`   Space: ${page.space_name} (${page.space_key})`);
        }

        if (page.content_preview) {
          lines.push(`   Preview: ${page.content_preview}`);
        }

        lines.push(`   ${page.url}`);

        return lines.join('\n');
      })
      .join('\n\n');
  }
}
