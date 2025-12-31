import axios, { AxiosInstance } from 'axios';
import axiosRetry from 'axios-retry';
import type { Config } from '../config/index.js';
import type { JiraIssue, FormattedJiraIssue, JiraSearchResult } from './types.js';

/**
 * Jira REST API client
 */
export class JiraClient {
  private client: AxiosInstance;
  private userEmail: string;

  constructor(private config: Config) {
    this.client = axios.create({
      baseURL: `${config.jiraUrl}/rest/api/3`,
      auth: {
        username: config.jiraUsername,
        password: config.jiraApiToken,
      },
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    });

    // Add retry logic for transient failures
    axiosRetry(this.client, {
      retries: 3,
      retryDelay: axiosRetry.exponentialDelay,
      retryCondition: (error) => {
        return axiosRetry.isNetworkOrIdempotentRequestError(error) || error.response?.status === 429;
      },
    });

    this.userEmail = config.userEmail || config.jiraUsername;
  }

  /**
   * Search for Jira tickets using JQL
   */
  async searchJiraTickets(jql: string, maxResults: number = 50): Promise<JiraIssue[]> {
    try {
      const response = await this.client.get<JiraSearchResult>('/search', {
        params: {
          jql,
          maxResults,
          fields: '*all',
        },
      });
      return response.data.issues;
    } catch (error) {
      throw new Error(`Failed to search Jira tickets: ${error}`);
    }
  }

  /**
   * Get issues assigned to the current user
   */
  async getMyIssues(maxResults: number = 50, additionalJql?: string): Promise<JiraIssue[]> {
    let jql = `assignee = "${this.userEmail}"`;

    if (additionalJql) {
      jql += ` AND ${additionalJql}`;
    }

    jql += ' ORDER BY priority DESC, updated DESC';

    return this.searchJiraTickets(jql, maxResults);
  }

  /**
   * Get issues assigned to the user in active sprints
   */
  async getSprintIssues(
    includeFutureSprints: boolean = false,
    maxResults: number = 50
  ): Promise<JiraIssue[]> {
    let sprintFilter = 'sprint in openSprints()';

    if (includeFutureSprints) {
      sprintFilter = 'sprint in openSprints() OR sprint in futureSprints()';
    }

    return this.getMyIssues(maxResults, sprintFilter);
  }

  /**
   * Create a new Jira ticket
   */
  async createJiraTicket(
    projectKey: string,
    summary: string,
    description: string,
    issueType: string = 'Task',
    extraFields: Record<string, any> = {}
  ): Promise<JiraIssue> {
    try {
      const fields = {
        project: { key: projectKey },
        summary,
        description,
        issuetype: { name: issueType },
        ...extraFields,
      };

      const response = await this.client.post<JiraIssue>('/issue', { fields });
      return response.data;
    } catch (error) {
      throw new Error(`Failed to create Jira ticket: ${error}`);
    }
  }

  /**
   * Update a Jira ticket
   */
  async updateJiraTicket(issueKey: string, fields: Record<string, any>): Promise<JiraIssue> {
    try {
      // Update the issue
      await this.client.put(`/issue/${issueKey}`, { fields });

      // Fetch and return the updated issue
      const response = await this.client.get<JiraIssue>(`/issue/${issueKey}`);
      return response.data;
    } catch (error) {
      throw new Error(`Failed to update Jira ticket: ${error}`);
    }
  }

  /**
   * Add a comment to a Jira ticket
   */
  async addJiraComment(issueKey: string, comment: string): Promise<any> {
    try {
      const response = await this.client.post(`/issue/${issueKey}/comment`, {
        body: comment,
      });
      return response.data;
    } catch (error) {
      throw new Error(`Failed to add comment to Jira ticket: ${error}`);
    }
  }

  /**
   * Format a Jira issue into a simpler structure
   */
  formatIssue(issue: JiraIssue): FormattedJiraIssue {
    const fields = issue.fields;

    return {
      key: issue.key,
      summary: fields.summary,
      status: fields.status?.name || 'Unknown',
      priority: fields.priority?.name || 'None',
      assignee: fields.assignee?.displayName || 'Unassigned',
      issue_type: fields.issuetype?.name || 'Unknown',
      created: fields.created,
      updated: fields.updated,
      description: fields.description || 'No description',
      labels: fields.labels || [],
      sprint: this.extractSprintName(fields),
      story_points: fields.customfield_10016 || null,
      url: `${this.config.jiraUrl}/browse/${issue.key}`,
    };
  }

  /**
   * Extract sprint name from issue fields
   */
  private extractSprintName(fields: any): string | null {
    const sprintField = fields.customfield_10020; // Common sprint field

    if (sprintField && Array.isArray(sprintField) && sprintField.length > 0) {
      const sprint = sprintField[sprintField.length - 1]; // Get the latest sprint

      if (typeof sprint === 'object' && sprint.name) {
        return sprint.name;
      } else if (typeof sprint === 'string') {
        // Parse sprint string format: "com.atlassian.greenhopper.service.sprint.Sprint@...name=Sprint 1,..."
        const match = sprint.match(/name=([^,\]]+)/);
        if (match) {
          return match[1];
        }
      }
    }

    return null;
  }

  /**
   * Format multiple issues summary
   */
  formatIssuesSummary(issues: JiraIssue[]): string {
    const formatted = issues.map((issue) => this.formatIssue(issue));

    if (formatted.length === 0) {
      return 'No issues found.';
    }

    return formatted
      .map((issue) => {
        const lines = [
          `📌 ${issue.key}: ${issue.summary}`,
          `   Status: ${issue.status} | Priority: ${issue.priority}`,
          `   Assignee: ${issue.assignee}`,
        ];

        if (issue.sprint) {
          lines.push(`   Sprint: ${issue.sprint}`);
        }

        if (issue.story_points) {
          lines.push(`   Story Points: ${issue.story_points}`);
        }

        lines.push(`   ${issue.url}`);

        return lines.join('\n');
      })
      .join('\n\n');
  }
}
