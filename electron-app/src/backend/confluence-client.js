const axios = require('axios');

class ConfluenceClient {
    constructor(config) {
        this.baseURL = config.CONFLUENCE_URL;
        this.username = config.CONFLUENCE_USERNAME;
        this.apiToken = config.CONFLUENCE_API_TOKEN;
        this.spaceKey = config.CONFLUENCE_SPACE_KEY;

        this.client = axios.create({
            baseURL: this.baseURL,
            auth: {
                username: this.username,
                password: this.apiToken
            },
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        });
    }

    async searchPages(query, spaceKey = null, maxResults = 10) {
        try {
            let cql = `type=page AND text~"${query}"`;

            if (spaceKey || this.spaceKey) {
                cql += ` AND space="${spaceKey || this.spaceKey}"`;
            }

            const response = await this.client.get('/rest/api/content/search', {
                params: {
                    cql,
                    limit: maxResults,
                    expand: 'space,version'
                }
            });

            return response.data.results;
        } catch (error) {
            throw new Error(`Failed to search Confluence: ${error.message}`);
        }
    }

    async getPageContent(pageId) {
        try {
            const response = await this.client.get(`/rest/api/content/${pageId}`, {
                params: {
                    expand: 'body.storage,version,space'
                }
            });

            return response.data;
        } catch (error) {
            throw new Error(`Failed to get page content: ${error.message}`);
        }
    }

    async getRecentPages(spaceKey = null, maxResults = 10) {
        try {
            let cql = 'type=page ORDER BY lastModified DESC';

            if (spaceKey || this.spaceKey) {
                cql = `type=page AND space="${spaceKey || this.spaceKey}" ORDER BY lastModified DESC`;
            }

            const response = await this.client.get('/rest/api/content/search', {
                params: {
                    cql,
                    limit: maxResults,
                    expand: 'space,version'
                }
            });

            return response.data.results;
        } catch (error) {
            throw new Error(`Failed to get recent pages: ${error.message}`);
        }
    }

    formatPages(pages) {
        if (!pages || pages.length === 0) {
            return 'No pages found.';
        }

        let result = `Found ${pages.length} page(s):\n\n`;

        pages.forEach((page, index) => {
            result += `${index + 1}. ${page.title}\n`;
            result += `   Space: ${page.space?.name || 'Unknown'}\n`;
            result += `   URL: ${this.baseURL}${page._links.webui}\n\n`;
        });

        return result;
    }

    stripHtml(html) {
        // Basic HTML tag removal
        return html
            .replace(/<[^>]*>/g, '')
            .replace(/&nbsp;/g, ' ')
            .replace(/&amp;/g, '&')
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>')
            .replace(/&quot;/g, '"')
            .replace(/\s+/g, ' ')
            .trim();
    }
}

module.exports = ConfluenceClient;
