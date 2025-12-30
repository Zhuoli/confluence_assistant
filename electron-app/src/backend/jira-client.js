const axios = require('axios');

class JiraClient {
    constructor(config) {
        this.baseURL = config.JIRA_URL;
        this.username = config.JIRA_USERNAME;
        this.apiToken = config.JIRA_API_TOKEN;
        this.userEmail = config.USER_EMAIL || config.JIRA_USERNAME;

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

    async getMyIssues(maxResults = 50) {
        try {
            const jql = `assignee = "${this.userEmail}" ORDER BY priority DESC, updated DESC`;

            const response = await this.client.get('/rest/api/2/search', {
                params: {
                    jql,
                    maxResults,
                    fields: 'summary,status,priority,assignee,issuetype,created,updated,description,labels'
                }
            });

            return response.data.issues;
        } catch (error) {
            throw new Error(`Failed to fetch Jira issues: ${error.message}`);
        }
    }

    async getSprintIssues(maxResults = 50) {
        try {
            const jql = `assignee = "${this.userEmail}" AND sprint in openSprints() ORDER BY priority DESC`;

            const response = await this.client.get('/rest/api/2/search', {
                params: {
                    jql,
                    maxResults,
                    fields: 'summary,status,priority,assignee,issuetype,created,updated,description,labels'
                }
            });

            return response.data.issues;
        } catch (error) {
            throw new Error(`Failed to fetch sprint issues: ${error.message}`);
        }
    }

    formatIssues(issues) {
        if (!issues || issues.length === 0) {
            return 'No issues found.';
        }

        let result = `Found ${issues.length} issue(s):\n\n`;

        issues.forEach((issue, index) => {
            const fields = issue.fields;
            result += `${index + 1}. [${issue.key}] ${fields.summary}\n`;
            result += `   Status: ${fields.status.name} | Priority: ${fields.priority?.name || 'None'}\n`;
            result += `   Type: ${fields.issuetype.name}\n`;
            result += `   URL: ${this.baseURL}/browse/${issue.key}\n\n`;
        });

        return result;
    }
}

module.exports = JiraClient;
