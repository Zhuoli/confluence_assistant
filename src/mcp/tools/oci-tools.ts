import type { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { CallToolRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import { OCIClient } from '../../api/oci-client.js';
import type { Config } from '../../config/index.js';
import { OCI_TOOLS } from '../oci-types.js';

/**
 * Register all OCI MCP tools with the server
 */
export function registerOCITools(server: Server, config: Config) {
  const ociClient = new OCIClient(config);

  // Tool 1: test_oci_connection
  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    if (request.params.name === 'test_oci_connection') {
      try {
        const result = await ociClient.testConnection();

        if (result.success) {
          return {
            content: [{ type: 'text', text: `✓ ${result.message}` }],
          };
        } else {
          return {
            content: [{ type: 'text', text: `✗ ${result.message}` }],
          };
        }
      } catch (error) {
        return {
          content: [{ type: 'text', text: `Error testing OCI connection: ${error}` }],
        };
      }
    }

    // Tool 2: list_oci_compartments
    if (request.params.name === 'list_oci_compartments') {
      try {
        const compartments = await ociClient.listCompartments();
        const formatted = compartments.map((c) => ociClient.formatCompartment(c));

        if (formatted.length === 0) {
          return {
            content: [{ type: 'text', text: 'No compartments found.' }],
          };
        }

        let result = `Found ${formatted.length} compartment(s):\n\n`;
        formatted.forEach((comp, i) => {
          result += `${i + 1}. ${comp.name}\n`;
          result += `   ID: ${comp.id}\n`;
          result += `   State: ${comp.lifecycleState}\n`;
          if (comp.description) {
            result += `   Description: ${comp.description}\n`;
          }
          result += `   Created: ${comp.timeCreated}\n\n`;
        });

        return { content: [{ type: 'text', text: result }] };
      } catch (error) {
        return {
          content: [{ type: 'text', text: `Error listing compartments: ${error}` }],
        };
      }
    }

    // Tool 3: list_oci_instances
    if (request.params.name === 'list_oci_instances') {
      const { compartment_id } = request.params.arguments as any;

      try {
        const instances = await ociClient.listInstances(compartment_id);
        const formatted = instances.map((inst) => ociClient.formatInstance(inst));

        if (formatted.length === 0) {
          return {
            content: [{ type: 'text', text: 'No instances found.' }],
          };
        }

        let result = `Found ${formatted.length} instance(s):\n\n`;
        formatted.forEach((inst, i) => {
          result += `${i + 1}. ${inst.displayName}\n`;
          result += `   ID: ${inst.id}\n`;
          result += `   State: ${inst.lifecycleState}\n`;
          result += `   Shape: ${inst.shape}\n`;
          result += `   Availability Domain: ${inst.availabilityDomain}\n`;
          result += `   Created: ${inst.timeCreated}\n\n`;
        });

        return { content: [{ type: 'text', text: result }] };
      } catch (error) {
        return {
          content: [{ type: 'text', text: `Error listing instances: ${error}` }],
        };
      }
    }

    // Tool 4: get_oci_instance
    if (request.params.name === 'get_oci_instance') {
      const { instance_id } = request.params.arguments as any;

      if (!instance_id) {
        return {
          content: [{ type: 'text', text: "Error: 'instance_id' is required" }],
        };
      }

      try {
        const instance = await ociClient.getInstance(instance_id);
        const formatted = ociClient.formatInstance(instance);

        const result =
          `Instance Details:\n\n` +
          `Name: ${formatted.displayName}\n` +
          `ID: ${formatted.id}\n` +
          `State: ${formatted.lifecycleState}\n` +
          `Shape: ${formatted.shape}\n` +
          `Availability Domain: ${formatted.availabilityDomain}\n` +
          `Created: ${formatted.timeCreated}\n`;

        return { content: [{ type: 'text', text: result }] };
      } catch (error) {
        return {
          content: [{ type: 'text', text: `Error getting instance: ${error}` }],
        };
      }
    }

    // Tool 5: list_oke_clusters
    if (request.params.name === 'list_oke_clusters') {
      const { compartment_id } = request.params.arguments as any;

      try {
        const clusters = await ociClient.listOKEClusters(compartment_id);
        const formatted = clusters.map((cluster) => ociClient.formatOKECluster(cluster));

        if (formatted.length === 0) {
          return {
            content: [{ type: 'text', text: 'No OKE clusters found.' }],
          };
        }

        let result = `Found ${formatted.length} OKE cluster(s):\n\n`;
        formatted.forEach((cluster, i) => {
          result += `${i + 1}. ${cluster.name}\n`;
          result += `   ID: ${cluster.id}\n`;
          result += `   State: ${cluster.lifecycleState}\n`;
          result += `   Kubernetes Version: ${cluster.kubernetesVersion}\n`;
          result += `   VCN ID: ${cluster.vcnId}\n`;
          result += `   Created: ${cluster.timeCreated}\n\n`;
        });

        return { content: [{ type: 'text', text: result }] };
      } catch (error) {
        return {
          content: [{ type: 'text', text: `Error listing OKE clusters: ${error}` }],
        };
      }
    }

    // Tool 6: get_oke_cluster
    if (request.params.name === 'get_oke_cluster') {
      const { cluster_id } = request.params.arguments as any;

      if (!cluster_id) {
        return {
          content: [{ type: 'text', text: "Error: 'cluster_id' is required" }],
        };
      }

      try {
        const cluster = await ociClient.getOKECluster(cluster_id);
        const formatted = ociClient.formatOKECluster(cluster);

        const result =
          `OKE Cluster Details:\n\n` +
          `Name: ${formatted.name}\n` +
          `ID: ${formatted.id}\n` +
          `State: ${formatted.lifecycleState}\n` +
          `Kubernetes Version: ${formatted.kubernetesVersion}\n` +
          `VCN ID: ${formatted.vcnId}\n` +
          `Created: ${formatted.timeCreated}\n`;

        return { content: [{ type: 'text', text: result }] };
      } catch (error) {
        return {
          content: [{ type: 'text', text: `Error getting OKE cluster: ${error}` }],
        };
      }
    }

    // Tool 7: list_oke_node_pools
    if (request.params.name === 'list_oke_node_pools') {
      const { cluster_id } = request.params.arguments as any;

      if (!cluster_id) {
        return {
          content: [{ type: 'text', text: "Error: 'cluster_id' is required" }],
        };
      }

      try {
        const nodePools = await ociClient.listNodePools(cluster_id);

        if (nodePools.length === 0) {
          return {
            content: [{ type: 'text', text: 'No node pools found for this cluster.' }],
          };
        }

        let result = `Found ${nodePools.length} node pool(s):\n\n`;
        nodePools.forEach((pool, i) => {
          result += `${i + 1}. ${pool.name}\n`;
          result += `   ID: ${pool.id}\n`;
          result += `   State: ${pool.lifecycleState}\n`;
          result += `   Kubernetes Version: ${pool.kubernetesVersion}\n`;
          result += `   Node Shape: ${pool.nodeShape}\n`;
          if (pool.nodeConfigDetails?.size) {
            result += `   Size: ${pool.nodeConfigDetails.size} nodes\n`;
          }
          result += `\n`;
        });

        return { content: [{ type: 'text', text: result }] };
      } catch (error) {
        return {
          content: [{ type: 'text', text: `Error listing node pools: ${error}` }],
        };
      }
    }

    // Tool 8: list_oci_bastions
    if (request.params.name === 'list_oci_bastions') {
      const { compartment_id } = request.params.arguments as any;

      try {
        const bastions = await ociClient.listBastions(compartment_id);
        const formatted = bastions.map((bastion) => ociClient.formatBastion(bastion));

        if (formatted.length === 0) {
          return {
            content: [{ type: 'text', text: 'No bastions found.' }],
          };
        }

        let result = `Found ${formatted.length} bastion(s):\n\n`;
        formatted.forEach((bastion, i) => {
          result += `${i + 1}. ${bastion.name}\n`;
          result += `   ID: ${bastion.id}\n`;
          result += `   State: ${bastion.lifecycleState}\n`;
          result += `   Target Subnet: ${bastion.targetSubnetId}\n`;
          result += `   Created: ${bastion.timeCreated}\n\n`;
        });

        return { content: [{ type: 'text', text: result }] };
      } catch (error) {
        return {
          content: [{ type: 'text', text: `Error listing bastions: ${error}` }],
        };
      }
    }

    // Tool 9: get_oci_bastion
    if (request.params.name === 'get_oci_bastion') {
      const { bastion_id } = request.params.arguments as any;

      if (!bastion_id) {
        return {
          content: [{ type: 'text', text: "Error: 'bastion_id' is required" }],
        };
      }

      try {
        const bastion = await ociClient.getBastion(bastion_id);
        const formatted = ociClient.formatBastion(bastion);

        const result =
          `Bastion Details:\n\n` +
          `Name: ${formatted.name}\n` +
          `ID: ${formatted.id}\n` +
          `State: ${formatted.lifecycleState}\n` +
          `Target Subnet: ${formatted.targetSubnetId}\n` +
          `Created: ${formatted.timeCreated}\n`;

        return { content: [{ type: 'text', text: result }] };
      } catch (error) {
        return {
          content: [{ type: 'text', text: `Error getting bastion: ${error}` }],
        };
      }
    }

    // Tool 10: list_bastion_sessions
    if (request.params.name === 'list_bastion_sessions') {
      const { bastion_id } = request.params.arguments as any;

      if (!bastion_id) {
        return {
          content: [{ type: 'text', text: "Error: 'bastion_id' is required" }],
        };
      }

      try {
        const sessions = await ociClient.listBastionSessions(bastion_id);

        if (sessions.length === 0) {
          return {
            content: [{ type: 'text', text: 'No active sessions found for this bastion.' }],
          };
        }

        let result = `Found ${sessions.length} session(s):\n\n`;
        sessions.forEach((session, i) => {
          result += `${i + 1}. ${session.displayName}\n`;
          result += `   ID: ${session.id}\n`;
          result += `   State: ${session.lifecycleState}\n`;
          result += `   Type: ${session.sessionType}\n`;
          result += `   Created: ${session.timeCreated}\n\n`;
        });

        return { content: [{ type: 'text', text: result }] };
      } catch (error) {
        return {
          content: [{ type: 'text', text: `Error listing bastion sessions: ${error}` }],
        };
      }
    }

    // Return null if tool not handled
    return { content: [{ type: 'text', text: 'Unknown tool' }] };
  });
}
