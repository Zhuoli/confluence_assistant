/**
 * Shared types for Jira and Confluence API clients
 */

// Jira Types
export interface JiraIssue {
  key: string;
  fields: {
    summary: string;
    description?: string | null;
    status: { name: string };
    priority?: { name: string };
    assignee?: { displayName: string; emailAddress: string } | null;
    issuetype: { name: string };
    created: string;
    updated: string;
    labels?: string[];
    customfield_10016?: number; // Story points
    customfield_10020?: any; // Sprint field
    [key: string]: any;
  };
  [key: string]: any;
}

export interface FormattedJiraIssue {
  key: string;
  summary: string;
  status: string;
  priority: string;
  assignee: string;
  issue_type: string;
  created: string;
  updated: string;
  description: string;
  labels: string[];
  sprint: string | null;
  story_points: number | null;
  url: string;
}

export interface JiraSearchResult {
  issues: JiraIssue[];
  total: number;
  maxResults: number;
  startAt: number;
}

// Confluence Types
export interface ConfluencePage {
  id: string;
  type: string;
  status: string;
  title: string;
  space?: {
    key: string;
    name: string;
  };
  version?: {
    number: number;
  };
  body?: {
    storage?: {
      value: string;
      representation: string;
    };
  };
  _links?: {
    webui?: string;
    self?: string;
  };
  [key: string]: any;
}

export interface ConfluenceSearchResult {
  results: ConfluencePage[];
  size: number;
  totalSize: number;
}

export interface FormattedConfluencePage {
  id: string;
  title: string;
  space_key: string | null;
  space_name: string | null;
  url: string;
  last_updated: string | null;
  content_preview: string | null;
}
