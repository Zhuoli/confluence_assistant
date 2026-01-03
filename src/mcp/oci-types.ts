/**
 * OCI MCP Tool types and schema definitions
 * Expanded for OKE cluster operations and OCI DevOps pipelines
 */

import type { MCPTool, ToolSchema } from './types.js';

// OCI Tool Schemas
export const OCI_TOOLS: MCPTool[] = [
  // ========================================
  // Connection & Identity Tools
  // ========================================
  {
    name: 'test_oci_connection',
    description: 'Test OCI connection and validate authentication',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
  {
    name: 'list_oci_compartments',
    description: 'List all compartments in the OCI tenancy',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },

  // ========================================
  // Compute Instance Tools
  // ========================================
  {
    name: 'list_oci_instances',
    description: 'List compute instances in a compartment',
    inputSchema: {
      type: 'object',
      properties: {
        compartment_id: {
          type: 'string',
          description: 'Optional compartment ID (uses default if not provided)',
        },
      },
    },
  },
  {
    name: 'get_oci_instance',
    description: 'Get details of a specific compute instance',
    inputSchema: {
      type: 'object',
      properties: {
        instance_id: {
          type: 'string',
          description: 'Instance OCID',
        },
      },
      required: ['instance_id'],
    },
  },

  // ========================================
  // OKE Cluster Tools
  // ========================================
  {
    name: 'list_oke_clusters',
    description: 'List OKE (Oracle Kubernetes Engine) clusters in a compartment',
    inputSchema: {
      type: 'object',
      properties: {
        compartment_id: {
          type: 'string',
          description: 'Optional compartment ID (uses default if not provided)',
        },
      },
    },
  },
  {
    name: 'get_oke_cluster',
    description: 'Get details of a specific OKE cluster including endpoints, metadata, and configuration',
    inputSchema: {
      type: 'object',
      properties: {
        cluster_id: {
          type: 'string',
          description: 'Cluster OCID',
        },
      },
      required: ['cluster_id'],
    },
  },
  {
    name: 'create_oke_kubeconfig',
    description: 'Generate kubeconfig content for an OKE cluster to use with kubectl',
    inputSchema: {
      type: 'object',
      properties: {
        cluster_id: {
          type: 'string',
          description: 'Cluster OCID',
        },
      },
      required: ['cluster_id'],
    },
  },

  // ========================================
  // OKE Node Pool Tools
  // ========================================
  {
    name: 'list_oke_node_pools',
    description: 'List node pools for an OKE cluster',
    inputSchema: {
      type: 'object',
      properties: {
        cluster_id: {
          type: 'string',
          description: 'Cluster OCID',
        },
        compartment_id: {
          type: 'string',
          description: 'Optional compartment ID (uses default if not provided)',
        },
      },
      required: ['cluster_id'],
    },
  },
  {
    name: 'get_oke_node_pool',
    description: 'Get detailed information about a specific node pool',
    inputSchema: {
      type: 'object',
      properties: {
        node_pool_id: {
          type: 'string',
          description: 'Node pool OCID',
        },
      },
      required: ['node_pool_id'],
    },
  },
  {
    name: 'scale_oke_node_pool',
    description: 'Scale the number of nodes in an OKE node pool',
    inputSchema: {
      type: 'object',
      properties: {
        node_pool_id: {
          type: 'string',
          description: 'Node pool OCID',
        },
        size: {
          type: 'number',
          description: 'New target size (number of nodes)',
        },
      },
      required: ['node_pool_id', 'size'],
    },
  },

  // ========================================
  // OKE Virtual Node Pool Tools
  // ========================================
  {
    name: 'list_oke_virtual_node_pools',
    description: 'List virtual node pools for an OKE cluster (serverless Kubernetes)',
    inputSchema: {
      type: 'object',
      properties: {
        cluster_id: {
          type: 'string',
          description: 'Cluster OCID',
        },
        compartment_id: {
          type: 'string',
          description: 'Optional compartment ID (uses default if not provided)',
        },
      },
      required: ['cluster_id'],
    },
  },
  {
    name: 'get_oke_virtual_node_pool',
    description: 'Get detailed information about a virtual node pool',
    inputSchema: {
      type: 'object',
      properties: {
        virtual_node_pool_id: {
          type: 'string',
          description: 'Virtual node pool OCID',
        },
      },
      required: ['virtual_node_pool_id'],
    },
  },

  // ========================================
  // OKE Work Request Tools (for async operations)
  // ========================================
  {
    name: 'list_oke_work_requests',
    description: 'List work requests (async operations) for OKE in a compartment',
    inputSchema: {
      type: 'object',
      properties: {
        compartment_id: {
          type: 'string',
          description: 'Optional compartment ID (uses default if not provided)',
        },
        cluster_id: {
          type: 'string',
          description: 'Optional cluster ID to filter work requests',
        },
      },
    },
  },
  {
    name: 'get_oke_work_request',
    description: 'Get details and status of a specific OKE work request',
    inputSchema: {
      type: 'object',
      properties: {
        work_request_id: {
          type: 'string',
          description: 'Work request OCID',
        },
      },
      required: ['work_request_id'],
    },
  },

  // ========================================
  // OKE Addon Tools
  // ========================================
  {
    name: 'list_oke_addon_options',
    description: 'List available addon options for OKE clusters (e.g., dashboard, metrics-server)',
    inputSchema: {
      type: 'object',
      properties: {
        kubernetes_version: {
          type: 'string',
          description: 'Kubernetes version to get addon options for',
        },
      },
      required: ['kubernetes_version'],
    },
  },
  {
    name: 'list_oke_cluster_addons',
    description: 'List addons installed on a specific OKE cluster',
    inputSchema: {
      type: 'object',
      properties: {
        cluster_id: {
          type: 'string',
          description: 'Cluster OCID',
        },
      },
      required: ['cluster_id'],
    },
  },
  {
    name: 'get_oke_cluster_addon',
    description: 'Get details of a specific addon on an OKE cluster',
    inputSchema: {
      type: 'object',
      properties: {
        cluster_id: {
          type: 'string',
          description: 'Cluster OCID',
        },
        addon_name: {
          type: 'string',
          description: 'Name of the addon',
        },
      },
      required: ['cluster_id', 'addon_name'],
    },
  },

  // ========================================
  // Bastion Tools
  // ========================================
  {
    name: 'list_oci_bastions',
    description: 'List bastion hosts in a compartment',
    inputSchema: {
      type: 'object',
      properties: {
        compartment_id: {
          type: 'string',
          description: 'Optional compartment ID (uses default if not provided)',
        },
      },
    },
  },
  {
    name: 'get_oci_bastion',
    description: 'Get details of a specific bastion host',
    inputSchema: {
      type: 'object',
      properties: {
        bastion_id: {
          type: 'string',
          description: 'Bastion OCID',
        },
      },
      required: ['bastion_id'],
    },
  },
  {
    name: 'list_bastion_sessions',
    description: 'List active sessions for a bastion host',
    inputSchema: {
      type: 'object',
      properties: {
        bastion_id: {
          type: 'string',
          description: 'Bastion OCID',
        },
      },
      required: ['bastion_id'],
    },
  },

  // ========================================
  // DevOps Project Tools
  // ========================================
  {
    name: 'list_devops_projects',
    description: 'List OCI DevOps projects in a compartment',
    inputSchema: {
      type: 'object',
      properties: {
        compartment_id: {
          type: 'string',
          description: 'Optional compartment ID (uses default if not provided)',
        },
        name: {
          type: 'string',
          description: 'Optional filter by project name',
        },
      },
    },
  },
  {
    name: 'get_devops_project',
    description: 'Get details of a specific DevOps project',
    inputSchema: {
      type: 'object',
      properties: {
        project_id: {
          type: 'string',
          description: 'DevOps project OCID',
        },
      },
      required: ['project_id'],
    },
  },

  // ========================================
  // DevOps Build Pipeline Tools
  // ========================================
  {
    name: 'list_devops_build_pipelines',
    description: 'List build pipelines in a DevOps project',
    inputSchema: {
      type: 'object',
      properties: {
        project_id: {
          type: 'string',
          description: 'DevOps project OCID',
        },
        display_name: {
          type: 'string',
          description: 'Optional filter by display name',
        },
      },
      required: ['project_id'],
    },
  },
  {
    name: 'get_devops_build_pipeline',
    description: 'Get details of a specific build pipeline including stages',
    inputSchema: {
      type: 'object',
      properties: {
        build_pipeline_id: {
          type: 'string',
          description: 'Build pipeline OCID',
        },
      },
      required: ['build_pipeline_id'],
    },
  },
  {
    name: 'list_devops_build_pipeline_stages',
    description: 'List stages in a build pipeline',
    inputSchema: {
      type: 'object',
      properties: {
        build_pipeline_id: {
          type: 'string',
          description: 'Build pipeline OCID',
        },
      },
      required: ['build_pipeline_id'],
    },
  },
  {
    name: 'get_devops_build_pipeline_stage',
    description: 'Get details of a specific build pipeline stage',
    inputSchema: {
      type: 'object',
      properties: {
        build_pipeline_stage_id: {
          type: 'string',
          description: 'Build pipeline stage OCID',
        },
      },
      required: ['build_pipeline_stage_id'],
    },
  },

  // ========================================
  // DevOps Build Run Tools
  // ========================================
  {
    name: 'list_devops_build_runs',
    description: 'List build runs (pipeline executions) in a project',
    inputSchema: {
      type: 'object',
      properties: {
        project_id: {
          type: 'string',
          description: 'DevOps project OCID',
        },
        build_pipeline_id: {
          type: 'string',
          description: 'Optional filter by specific build pipeline',
        },
        lifecycle_state: {
          type: 'string',
          description: 'Optional filter by state: ACCEPTED, IN_PROGRESS, SUCCEEDED, FAILED, CANCELING, CANCELED',
        },
        limit: {
          type: 'number',
          description: 'Maximum number of results to return (default 20)',
        },
      },
      required: ['project_id'],
    },
  },
  {
    name: 'get_devops_build_run',
    description: 'Get details of a specific build run including status and outputs',
    inputSchema: {
      type: 'object',
      properties: {
        build_run_id: {
          type: 'string',
          description: 'Build run OCID',
        },
      },
      required: ['build_run_id'],
    },
  },
  {
    name: 'trigger_devops_build_run',
    description: 'Trigger a new build run for a build pipeline',
    inputSchema: {
      type: 'object',
      properties: {
        build_pipeline_id: {
          type: 'string',
          description: 'Build pipeline OCID to run',
        },
        display_name: {
          type: 'string',
          description: 'Optional display name for the build run',
        },
        commit_info_commit_hash: {
          type: 'string',
          description: 'Optional git commit hash to build',
        },
        commit_info_repository_branch: {
          type: 'string',
          description: 'Optional git branch to build',
        },
        build_run_arguments: {
          type: 'object',
          description: 'Optional build arguments as key-value pairs',
        },
      },
      required: ['build_pipeline_id'],
    },
  },
  {
    name: 'cancel_devops_build_run',
    description: 'Cancel a running build run',
    inputSchema: {
      type: 'object',
      properties: {
        build_run_id: {
          type: 'string',
          description: 'Build run OCID to cancel',
        },
        reason: {
          type: 'string',
          description: 'Optional cancellation reason',
        },
      },
      required: ['build_run_id'],
    },
  },
  {
    name: 'get_devops_build_run_logs',
    description: 'Get logs from a build run stage',
    inputSchema: {
      type: 'object',
      properties: {
        build_run_id: {
          type: 'string',
          description: 'Build run OCID',
        },
        stage_name: {
          type: 'string',
          description: 'Optional stage name to get logs for',
        },
      },
      required: ['build_run_id'],
    },
  },

  // ========================================
  // DevOps Deploy Pipeline Tools
  // ========================================
  {
    name: 'list_devops_deploy_pipelines',
    description: 'List deployment pipelines in a DevOps project',
    inputSchema: {
      type: 'object',
      properties: {
        project_id: {
          type: 'string',
          description: 'DevOps project OCID',
        },
        display_name: {
          type: 'string',
          description: 'Optional filter by display name',
        },
      },
      required: ['project_id'],
    },
  },
  {
    name: 'get_devops_deploy_pipeline',
    description: 'Get details of a specific deployment pipeline including stages',
    inputSchema: {
      type: 'object',
      properties: {
        deploy_pipeline_id: {
          type: 'string',
          description: 'Deploy pipeline OCID',
        },
      },
      required: ['deploy_pipeline_id'],
    },
  },
  {
    name: 'list_devops_deploy_stages',
    description: 'List stages in a deployment pipeline',
    inputSchema: {
      type: 'object',
      properties: {
        deploy_pipeline_id: {
          type: 'string',
          description: 'Deploy pipeline OCID',
        },
      },
      required: ['deploy_pipeline_id'],
    },
  },
  {
    name: 'get_devops_deploy_stage',
    description: 'Get details of a specific deployment stage',
    inputSchema: {
      type: 'object',
      properties: {
        deploy_stage_id: {
          type: 'string',
          description: 'Deploy stage OCID',
        },
      },
      required: ['deploy_stage_id'],
    },
  },

  // ========================================
  // DevOps Deployment Tools
  // ========================================
  {
    name: 'list_devops_deployments',
    description: 'List deployments in a project',
    inputSchema: {
      type: 'object',
      properties: {
        project_id: {
          type: 'string',
          description: 'DevOps project OCID',
        },
        deploy_pipeline_id: {
          type: 'string',
          description: 'Optional filter by specific deploy pipeline',
        },
        lifecycle_state: {
          type: 'string',
          description: 'Optional filter by state: ACCEPTED, IN_PROGRESS, SUCCEEDED, FAILED, CANCELING, CANCELED',
        },
        limit: {
          type: 'number',
          description: 'Maximum number of results to return (default 20)',
        },
      },
      required: ['project_id'],
    },
  },
  {
    name: 'get_devops_deployment',
    description: 'Get details of a specific deployment including status and artifacts',
    inputSchema: {
      type: 'object',
      properties: {
        deployment_id: {
          type: 'string',
          description: 'Deployment OCID',
        },
      },
      required: ['deployment_id'],
    },
  },
  {
    name: 'trigger_devops_deployment',
    description: 'Trigger a new deployment for a deploy pipeline',
    inputSchema: {
      type: 'object',
      properties: {
        deploy_pipeline_id: {
          type: 'string',
          description: 'Deploy pipeline OCID to run',
        },
        display_name: {
          type: 'string',
          description: 'Optional display name for the deployment',
        },
        deployment_arguments: {
          type: 'object',
          description: 'Optional deployment arguments as key-value pairs',
        },
        deploy_artifact_override_arguments: {
          type: 'object',
          description: 'Optional artifact override arguments',
        },
      },
      required: ['deploy_pipeline_id'],
    },
  },
  {
    name: 'approve_devops_deployment',
    description: 'Approve a deployment stage that requires approval',
    inputSchema: {
      type: 'object',
      properties: {
        deployment_id: {
          type: 'string',
          description: 'Deployment OCID',
        },
        stage_id: {
          type: 'string',
          description: 'Approval stage OCID',
        },
        action: {
          type: 'string',
          description: 'Approval action: APPROVE or REJECT',
          enum: ['APPROVE', 'REJECT'],
        },
        reason: {
          type: 'string',
          description: 'Optional reason for the approval/rejection',
        },
      },
      required: ['deployment_id', 'stage_id', 'action'],
    },
  },
  {
    name: 'cancel_devops_deployment',
    description: 'Cancel a running deployment',
    inputSchema: {
      type: 'object',
      properties: {
        deployment_id: {
          type: 'string',
          description: 'Deployment OCID to cancel',
        },
        reason: {
          type: 'string',
          description: 'Optional cancellation reason',
        },
      },
      required: ['deployment_id'],
    },
  },
  {
    name: 'get_devops_deployment_logs',
    description: 'Get logs from a deployment stage',
    inputSchema: {
      type: 'object',
      properties: {
        deployment_id: {
          type: 'string',
          description: 'Deployment OCID',
        },
        stage_name: {
          type: 'string',
          description: 'Optional stage name to get logs for',
        },
      },
      required: ['deployment_id'],
    },
  },

  // ========================================
  // DevOps Artifact Tools
  // ========================================
  {
    name: 'list_devops_artifacts',
    description: 'List deploy artifacts in a DevOps project',
    inputSchema: {
      type: 'object',
      properties: {
        project_id: {
          type: 'string',
          description: 'DevOps project OCID',
        },
        display_name: {
          type: 'string',
          description: 'Optional filter by display name',
        },
      },
      required: ['project_id'],
    },
  },
  {
    name: 'get_devops_artifact',
    description: 'Get details of a specific deploy artifact',
    inputSchema: {
      type: 'object',
      properties: {
        artifact_id: {
          type: 'string',
          description: 'Deploy artifact OCID',
        },
      },
      required: ['artifact_id'],
    },
  },

  // ========================================
  // DevOps Code Repository Tools
  // ========================================
  {
    name: 'list_devops_repositories',
    description: 'List code repositories in a DevOps project',
    inputSchema: {
      type: 'object',
      properties: {
        project_id: {
          type: 'string',
          description: 'DevOps project OCID',
        },
        name: {
          type: 'string',
          description: 'Optional filter by repository name',
        },
      },
      required: ['project_id'],
    },
  },
  {
    name: 'get_devops_repository',
    description: 'Get details of a specific code repository',
    inputSchema: {
      type: 'object',
      properties: {
        repository_id: {
          type: 'string',
          description: 'Repository OCID',
        },
      },
      required: ['repository_id'],
    },
  },
  {
    name: 'list_devops_repository_refs',
    description: 'List branches and tags in a code repository',
    inputSchema: {
      type: 'object',
      properties: {
        repository_id: {
          type: 'string',
          description: 'Repository OCID',
        },
        ref_type: {
          type: 'string',
          description: 'Optional filter by ref type: BRANCH or TAG',
          enum: ['BRANCH', 'TAG'],
        },
      },
      required: ['repository_id'],
    },
  },
  {
    name: 'list_devops_repository_commits',
    description: 'List commits in a code repository',
    inputSchema: {
      type: 'object',
      properties: {
        repository_id: {
          type: 'string',
          description: 'Repository OCID',
        },
        ref_name: {
          type: 'string',
          description: 'Branch or tag name to list commits from',
        },
        limit: {
          type: 'number',
          description: 'Maximum number of commits to return (default 20)',
        },
      },
      required: ['repository_id'],
    },
  },
  {
    name: 'get_devops_repository_commit',
    description: 'Get details of a specific commit',
    inputSchema: {
      type: 'object',
      properties: {
        repository_id: {
          type: 'string',
          description: 'Repository OCID',
        },
        commit_id: {
          type: 'string',
          description: 'Commit SHA',
        },
      },
      required: ['repository_id', 'commit_id'],
    },
  },

  // ========================================
  // DevOps Trigger Tools
  // ========================================
  {
    name: 'list_devops_triggers',
    description: 'List triggers in a DevOps project',
    inputSchema: {
      type: 'object',
      properties: {
        project_id: {
          type: 'string',
          description: 'DevOps project OCID',
        },
        display_name: {
          type: 'string',
          description: 'Optional filter by display name',
        },
      },
      required: ['project_id'],
    },
  },
  {
    name: 'get_devops_trigger',
    description: 'Get details of a specific trigger',
    inputSchema: {
      type: 'object',
      properties: {
        trigger_id: {
          type: 'string',
          description: 'Trigger OCID',
        },
      },
      required: ['trigger_id'],
    },
  },

  // ========================================
  // DevOps Connection Tools
  // ========================================
  {
    name: 'list_devops_connections',
    description: 'List external connections (GitHub, GitLab, etc.) in a DevOps project',
    inputSchema: {
      type: 'object',
      properties: {
        project_id: {
          type: 'string',
          description: 'DevOps project OCID',
        },
        connection_type: {
          type: 'string',
          description: 'Optional filter by connection type: GITHUB_ACCESS_TOKEN, GITLAB_ACCESS_TOKEN, etc.',
        },
      },
      required: ['project_id'],
    },
  },
  {
    name: 'get_devops_connection',
    description: 'Get details of a specific external connection',
    inputSchema: {
      type: 'object',
      properties: {
        connection_id: {
          type: 'string',
          description: 'Connection OCID',
        },
      },
      required: ['connection_id'],
    },
  },

  // ========================================
  // DevOps Environment Tools
  // ========================================
  {
    name: 'list_devops_environments',
    description: 'List deployment environments (OKE, Instance Group, Function) in a DevOps project',
    inputSchema: {
      type: 'object',
      properties: {
        project_id: {
          type: 'string',
          description: 'DevOps project OCID',
        },
        display_name: {
          type: 'string',
          description: 'Optional filter by display name',
        },
      },
      required: ['project_id'],
    },
  },
  {
    name: 'get_devops_environment',
    description: 'Get details of a specific deployment environment',
    inputSchema: {
      type: 'object',
      properties: {
        environment_id: {
          type: 'string',
          description: 'Environment OCID',
        },
      },
      required: ['environment_id'],
    },
  },

  // ========================================
  // Container Registry / Artifacts Tools
  // ========================================
  {
    name: 'list_container_repositories',
    description: 'List container image repositories in a compartment (OCIR)',
    inputSchema: {
      type: 'object',
      properties: {
        compartment_id: {
          type: 'string',
          description: 'Optional compartment ID (uses default if not provided)',
        },
        display_name: {
          type: 'string',
          description: 'Optional filter by repository name',
        },
      },
    },
  },
  {
    name: 'get_container_repository',
    description: 'Get details of a specific container repository',
    inputSchema: {
      type: 'object',
      properties: {
        repository_id: {
          type: 'string',
          description: 'Container repository OCID',
        },
      },
      required: ['repository_id'],
    },
  },
  {
    name: 'list_container_images',
    description: 'List container images in a repository',
    inputSchema: {
      type: 'object',
      properties: {
        compartment_id: {
          type: 'string',
          description: 'Optional compartment ID (uses default if not provided)',
        },
        repository_name: {
          type: 'string',
          description: 'Optional repository name filter',
        },
        display_name: {
          type: 'string',
          description: 'Optional filter by image display name',
        },
      },
    },
  },
  {
    name: 'get_container_image',
    description: 'Get details of a specific container image including tags and digests',
    inputSchema: {
      type: 'object',
      properties: {
        image_id: {
          type: 'string',
          description: 'Container image OCID',
        },
      },
      required: ['image_id'],
    },
  },
  {
    name: 'delete_container_image',
    description: 'Delete a container image from the registry',
    inputSchema: {
      type: 'object',
      properties: {
        image_id: {
          type: 'string',
          description: 'Container image OCID to delete',
        },
      },
      required: ['image_id'],
    },
  },

  // ========================================
  // DevOps Work Request Tools
  // ========================================
  {
    name: 'list_devops_work_requests',
    description: 'List work requests (async operations) for DevOps in a compartment',
    inputSchema: {
      type: 'object',
      properties: {
        compartment_id: {
          type: 'string',
          description: 'Optional compartment ID (uses default if not provided)',
        },
        project_id: {
          type: 'string',
          description: 'Optional project ID to filter work requests',
        },
      },
    },
  },
  {
    name: 'get_devops_work_request',
    description: 'Get details and status of a specific DevOps work request',
    inputSchema: {
      type: 'object',
      properties: {
        work_request_id: {
          type: 'string',
          description: 'Work request OCID',
        },
      },
      required: ['work_request_id'],
    },
  },
];
