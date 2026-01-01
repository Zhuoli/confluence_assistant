import { z } from 'zod';

/**
 * Configuration schema using Zod validation
 */
export const ConfigSchema = z
  .object({
    // Model Provider Configuration
    modelProvider: z
      .enum(['claude', 'openai', 'oci-openai'])
      .default('oci-openai')
      .describe('AI model provider (claude, openai, or oci-openai)'),

    modelName: z
      .string()
      .optional()
      .describe('Optional custom model name'),

    // Anthropic Configuration
    anthropicApiKey: z
      .string()
      .default('')
      .describe('Anthropic API key for Claude'),

    // OpenAI Configuration
    openaiApiKey: z
      .string()
      .default('')
      .describe('OpenAI API key'),

    // OCI OpenAI Configuration
    ociCompartmentId: z
      .string()
      .default('')
      .describe('OCI Compartment ID for OCI OpenAI'),

    ociEndpoint: z
      .string()
      .default('')
      .describe('OCI Generative AI endpoint URL'),

    ociConfigPath: z
      .string()
      .optional()
      .describe('Path to OCI config file (defaults to ~/.oci/config)'),

    ociProfile: z
      .string()
      .optional()
      .describe('OCI profile name (defaults to DEFAULT)'),

    // OCI MCP Configuration (for Oracle Cloud resource management)
    ociMcpEnabled: z
      .boolean()
      .default(false)
      .describe('Enable OCI MCP server for Oracle Cloud resource management'),

    ociMcpRegion: z
      .string()
      .default('')
      .describe('OCI region for resource management (e.g., us-phoenix-1, us-ashburn-1)'),

    ociMcpCompartmentId: z
      .string()
      .default('')
      .describe('OCI Compartment ID for resource management'),

    ociMcpTenancyId: z
      .string()
      .default('')
      .describe('OCI Tenancy ID (OCID)'),

    ociMcpConfigPath: z
      .string()
      .optional()
      .describe('Path to OCI config file for MCP (defaults to ociConfigPath or ~/.oci/config)'),

    ociMcpProfile: z
      .string()
      .optional()
      .describe('OCI profile name for MCP (defaults to ociProfile or DEFAULT)'),

    // Atlassian MCP Configuration
    atlassianMcpEnabled: z
      .boolean()
      .default(false)
      .describe('Enable Atlassian MCP server for Jira/Confluence access'),

    // Jira Configuration (optional - only required when Atlassian MCP enabled)
    jiraUrl: z
      .string()
      .default('')
      .describe('Jira instance URL (e.g., https://jira.company.com)'),

    jiraUsername: z
      .string()
      .default('')
      .describe('Jira username (usually email)'),

    jiraApiToken: z
      .string()
      .default('')
      .describe('Jira API token (Personal Access Token)'),

    // Confluence Configuration (optional - only required when Atlassian MCP enabled)
    confluenceUrl: z
      .string()
      .default('')
      .describe('Confluence instance URL (e.g., https://confluence.company.com)'),

    confluenceUsername: z
      .string()
      .default('')
      .describe('Confluence username (usually email)'),

    confluenceApiToken: z
      .string()
      .default('')
      .describe('Confluence API token (Personal Access Token)'),

    confluenceSpaceKey: z
      .string()
      .default('')
      .describe('Default Confluence space key'),

    // User Configuration
    userDisplayName: z
      .string()
      .default('')
      .describe('User display name'),

    userEmail: z
      .string()
      .email()
      .optional()
      .or(z.literal(''))
      .describe('User email address'),
  })
  .refine(
    (data) => {
      // Validate provider-specific API keys
      if (data.modelProvider === 'claude') {
        return data.anthropicApiKey.length > 0;
      } else if (data.modelProvider === 'openai') {
        return data.openaiApiKey.length > 0;
      } else if (data.modelProvider === 'oci-openai') {
        return data.ociCompartmentId.length > 0 && data.ociEndpoint.length > 0;
      }
      return false;
    },
    {
      message: 'API key or credentials required for selected provider',
      path: ['anthropicApiKey', 'openaiApiKey', 'ociCompartmentId', 'ociEndpoint'],
    }
  )
  .refine(
    (data) => {
      // Validate OCI MCP configuration when enabled
      if (data.ociMcpEnabled) {
        return (
          data.ociMcpRegion.length > 0 &&
          data.ociMcpCompartmentId.length > 0 &&
          data.ociMcpTenancyId.length > 0
        );
      }
      return true;
    },
    {
      message: 'OCI MCP requires region, compartment ID, and tenancy ID when enabled',
      path: ['ociMcpRegion', 'ociMcpCompartmentId', 'ociMcpTenancyId'],
    }
  )
  .refine(
    (data) => {
      // Validate Atlassian MCP (Jira/Confluence) configuration when enabled
      if (data.atlassianMcpEnabled) {
        // Validate Jira fields
        const hasValidJira =
          data.jiraUrl.length > 0 &&
          data.jiraUsername.length > 0 &&
          data.jiraApiToken.length > 0;

        // Validate Confluence fields
        const hasValidConfluence =
          data.confluenceUrl.length > 0 &&
          data.confluenceUsername.length > 0 &&
          data.confluenceApiToken.length > 0;

        return hasValidJira && hasValidConfluence;
      }
      return true;
    },
    {
      message: 'Atlassian MCP requires valid Jira and Confluence credentials when enabled',
      path: ['atlassianMcpEnabled'],
    }
  );

export type Config = z.infer<typeof ConfigSchema>;

/**
 * Validates configuration and provides detailed error messages
 */
export function validateConfig(config: Partial<Config>): Config {
  try {
    return ConfigSchema.parse(config);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors = error.errors.map((err) => `${err.path.join('.')}: ${err.message}`);
      throw new Error(`Configuration errors:\n  - ${errors.join('\n  - ')}`);
    }
    throw error;
  }
}
