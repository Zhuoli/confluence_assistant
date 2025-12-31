/**
 * OCI MCP Tool types and schema definitions
 */

import type { MCPTool, ToolSchema } from './types.js';

// OCI Tool Schemas
export const OCI_TOOLS: MCPTool[] = [
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
    description: 'Get details of a specific OKE cluster',
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
    name: 'list_oke_node_pools',
    description: 'List node pools for an OKE cluster',
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
];
