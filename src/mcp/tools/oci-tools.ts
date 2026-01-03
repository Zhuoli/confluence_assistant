import type { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { CallToolRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import { OCIClient } from '../../api/oci-client.js';
import type { Config } from '../../config/index.js';
import { OCI_TOOLS } from '../oci-types.js';

/**
 * Register all OCI MCP tools with the server
 *
 * This includes:
 * - Connection & Identity tools
 * - Compute instance tools
 * - OKE (Kubernetes) cluster tools
 * - OKE node pool tools
 * - OKE work request tools
 * - OKE addon tools
 * - Bastion tools
 * - DevOps project tools
 * - DevOps build pipeline tools
 * - DevOps deployment tools
 * - DevOps artifact tools
 * - DevOps repository tools
 * - DevOps trigger tools
 * - DevOps connection tools
 * - DevOps environment tools
 * - Container Registry tools
 */
export function registerOCITools(server: Server, config: Config) {
  const ociClient = new OCIClient(config);

  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const toolName = request.params.name;
    const args = request.params.arguments as any;

    try {
      // ========================================
      // Connection & Identity Tools
      // ========================================

      if (toolName === 'test_oci_connection') {
        const result = await ociClient.testConnection();
        return {
          content: [{ type: 'text', text: result.success ? `✓ ${result.message}` : `✗ ${result.message}` }],
        };
      }

      if (toolName === 'list_oci_compartments') {
        const compartments = await ociClient.listCompartments();
        const formatted = compartments.map((c) => ociClient.formatCompartment(c));

        if (formatted.length === 0) {
          return { content: [{ type: 'text', text: 'No compartments found.' }] };
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
      }

      // ========================================
      // Compute Instance Tools
      // ========================================

      if (toolName === 'list_oci_instances') {
        const instances = await ociClient.listInstances(args.compartment_id);
        const formatted = instances.map((inst) => ociClient.formatInstance(inst));

        if (formatted.length === 0) {
          return { content: [{ type: 'text', text: 'No instances found.' }] };
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
      }

      if (toolName === 'get_oci_instance') {
        if (!args.instance_id) {
          return { content: [{ type: 'text', text: "Error: 'instance_id' is required" }] };
        }

        const instance = await ociClient.getInstance(args.instance_id);
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
      }

      // ========================================
      // OKE Cluster Tools
      // ========================================

      if (toolName === 'list_oke_clusters') {
        const clusters = await ociClient.listOKEClusters(args.compartment_id);
        const formatted = clusters.map((cluster) => ociClient.formatOKECluster(cluster));

        if (formatted.length === 0) {
          return { content: [{ type: 'text', text: 'No OKE clusters found.' }] };
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
      }

      if (toolName === 'get_oke_cluster') {
        if (!args.cluster_id) {
          return { content: [{ type: 'text', text: "Error: 'cluster_id' is required" }] };
        }

        const cluster = await ociClient.getOKECluster(args.cluster_id);
        const formatted = ociClient.formatOKECluster(cluster);

        let result =
          `OKE Cluster Details:\n\n` +
          `Name: ${formatted.name}\n` +
          `ID: ${formatted.id}\n` +
          `State: ${formatted.lifecycleState}\n` +
          `Kubernetes Version: ${formatted.kubernetesVersion}\n` +
          `VCN ID: ${formatted.vcnId}\n`;

        if (formatted.endpointPublicIp) {
          result += `Public Endpoint: ${formatted.endpointPublicIp}\n`;
        }
        if (formatted.endpointPrivateIp) {
          result += `Private Endpoint: ${formatted.endpointPrivateIp}\n`;
        }
        result += `Created: ${formatted.timeCreated}\n`;

        return { content: [{ type: 'text', text: result }] };
      }

      if (toolName === 'create_oke_kubeconfig') {
        if (!args.cluster_id) {
          return { content: [{ type: 'text', text: "Error: 'cluster_id' is required" }] };
        }

        const kubeconfig = await ociClient.createOKEKubeconfig(args.cluster_id);
        return {
          content: [{
            type: 'text',
            text: `Kubeconfig generated successfully.\n\nSave this to ~/.kube/config or use with KUBECONFIG environment variable:\n\n${kubeconfig}`,
          }],
        };
      }

      // ========================================
      // OKE Node Pool Tools
      // ========================================

      if (toolName === 'list_oke_node_pools') {
        if (!args.cluster_id) {
          return { content: [{ type: 'text', text: "Error: 'cluster_id' is required" }] };
        }

        const nodePools = await ociClient.listNodePools(args.cluster_id, args.compartment_id);

        if (nodePools.length === 0) {
          return { content: [{ type: 'text', text: 'No node pools found for this cluster.' }] };
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
      }

      if (toolName === 'get_oke_node_pool') {
        if (!args.node_pool_id) {
          return { content: [{ type: 'text', text: "Error: 'node_pool_id' is required" }] };
        }

        const nodePool = await ociClient.getNodePool(args.node_pool_id);
        const formatted = ociClient.formatNodePool(nodePool);

        let result =
          `Node Pool Details:\n\n` +
          `Name: ${formatted.name}\n` +
          `ID: ${formatted.id}\n` +
          `State: ${formatted.lifecycleState}\n` +
          `Kubernetes Version: ${formatted.kubernetesVersion}\n` +
          `Node Shape: ${formatted.nodeShape}\n`;

        if (formatted.nodeShapeConfig) {
          result += `Shape Config: ${JSON.stringify(formatted.nodeShapeConfig)}\n`;
        }
        result += `Size: ${formatted.size || 'N/A'} nodes\n`;
        result += `Created: ${formatted.timeCreated}\n`;

        return { content: [{ type: 'text', text: result }] };
      }

      if (toolName === 'scale_oke_node_pool') {
        if (!args.node_pool_id) {
          return { content: [{ type: 'text', text: "Error: 'node_pool_id' is required" }] };
        }
        if (args.size === undefined) {
          return { content: [{ type: 'text', text: "Error: 'size' is required" }] };
        }

        const result = await ociClient.scaleNodePool(args.node_pool_id, args.size);
        return {
          content: [{
            type: 'text',
            text: `${result.message}\nWork Request ID: ${result.workRequestId}\n\nUse 'get_oke_work_request' to monitor progress.`,
          }],
        };
      }

      // ========================================
      // OKE Virtual Node Pool Tools
      // ========================================

      if (toolName === 'list_oke_virtual_node_pools') {
        if (!args.cluster_id) {
          return { content: [{ type: 'text', text: "Error: 'cluster_id' is required" }] };
        }

        const virtualNodePools = await ociClient.listVirtualNodePools(args.cluster_id, args.compartment_id);

        if (virtualNodePools.length === 0) {
          return { content: [{ type: 'text', text: 'No virtual node pools found for this cluster.' }] };
        }

        let result = `Found ${virtualNodePools.length} virtual node pool(s):\n\n`;
        virtualNodePools.forEach((pool: any, i: number) => {
          result += `${i + 1}. ${pool.displayName}\n`;
          result += `   ID: ${pool.id}\n`;
          result += `   State: ${pool.lifecycleState}\n`;
          result += `   Size: ${pool.size || 'N/A'}\n\n`;
        });

        return { content: [{ type: 'text', text: result }] };
      }

      if (toolName === 'get_oke_virtual_node_pool') {
        if (!args.virtual_node_pool_id) {
          return { content: [{ type: 'text', text: "Error: 'virtual_node_pool_id' is required" }] };
        }

        const virtualNodePool = await ociClient.getVirtualNodePool(args.virtual_node_pool_id);

        const result =
          `Virtual Node Pool Details:\n\n` +
          `Name: ${virtualNodePool.displayName}\n` +
          `ID: ${virtualNodePool.id}\n` +
          `State: ${virtualNodePool.lifecycleState}\n` +
          `Cluster ID: ${virtualNodePool.clusterId}\n` +
          `Size: ${virtualNodePool.size || 'N/A'}\n` +
          `Created: ${virtualNodePool.timeCreated}\n`;

        return { content: [{ type: 'text', text: result }] };
      }

      // ========================================
      // OKE Work Request Tools
      // ========================================

      if (toolName === 'list_oke_work_requests') {
        const workRequests = await ociClient.listOKEWorkRequests(args.compartment_id, args.cluster_id);

        if (workRequests.length === 0) {
          return { content: [{ type: 'text', text: 'No OKE work requests found.' }] };
        }

        let result = `Found ${workRequests.length} work request(s):\n\n`;
        workRequests.forEach((wr: any, i: number) => {
          result += `${i + 1}. ${wr.operationType}\n`;
          result += `   ID: ${wr.id}\n`;
          result += `   Status: ${wr.status}\n`;
          result += `   % Complete: ${wr.percentComplete}%\n`;
          result += `   Started: ${wr.timeStarted || 'N/A'}\n\n`;
        });

        return { content: [{ type: 'text', text: result }] };
      }

      if (toolName === 'get_oke_work_request') {
        if (!args.work_request_id) {
          return { content: [{ type: 'text', text: "Error: 'work_request_id' is required" }] };
        }

        const workRequest = await ociClient.getOKEWorkRequest(args.work_request_id);

        const result =
          `OKE Work Request Details:\n\n` +
          `ID: ${workRequest.id}\n` +
          `Operation: ${workRequest.operationType}\n` +
          `Status: ${workRequest.status}\n` +
          `% Complete: ${workRequest.percentComplete}%\n` +
          `Started: ${workRequest.timeStarted || 'N/A'}\n` +
          `Finished: ${workRequest.timeFinished || 'In Progress'}\n`;

        return { content: [{ type: 'text', text: result }] };
      }

      // ========================================
      // OKE Addon Tools
      // ========================================

      if (toolName === 'list_oke_addon_options') {
        if (!args.kubernetes_version) {
          return { content: [{ type: 'text', text: "Error: 'kubernetes_version' is required" }] };
        }

        const addonOptions = await ociClient.listAddonOptions(args.kubernetes_version);

        if (addonOptions.length === 0) {
          return { content: [{ type: 'text', text: 'No addon options found for this Kubernetes version.' }] };
        }

        let result = `Available addons for Kubernetes ${args.kubernetes_version}:\n\n`;
        addonOptions.forEach((addon: any, i: number) => {
          result += `${i + 1}. ${addon.name}\n`;
          result += `   Description: ${addon.description || 'N/A'}\n`;
          result += `   Required: ${addon.isRequired ? 'Yes' : 'No'}\n\n`;
        });

        return { content: [{ type: 'text', text: result }] };
      }

      if (toolName === 'list_oke_cluster_addons') {
        if (!args.cluster_id) {
          return { content: [{ type: 'text', text: "Error: 'cluster_id' is required" }] };
        }

        const addons = await ociClient.listClusterAddons(args.cluster_id);

        if (addons.length === 0) {
          return { content: [{ type: 'text', text: 'No addons installed on this cluster.' }] };
        }

        let result = `Installed addons:\n\n`;
        addons.forEach((addon: any, i: number) => {
          result += `${i + 1}. ${addon.name}\n`;
          result += `   Version: ${addon.version || 'N/A'}\n`;
          result += `   State: ${addon.lifecycleState}\n\n`;
        });

        return { content: [{ type: 'text', text: result }] };
      }

      if (toolName === 'get_oke_cluster_addon') {
        if (!args.cluster_id || !args.addon_name) {
          return { content: [{ type: 'text', text: "Error: 'cluster_id' and 'addon_name' are required" }] };
        }

        const addon = await ociClient.getClusterAddon(args.cluster_id, args.addon_name);

        const result =
          `Addon Details:\n\n` +
          `Name: ${addon.name}\n` +
          `Version: ${addon.version || 'N/A'}\n` +
          `State: ${addon.lifecycleState}\n` +
          `Configuration: ${JSON.stringify(addon.configurations || {}, null, 2)}\n`;

        return { content: [{ type: 'text', text: result }] };
      }

      // ========================================
      // Bastion Tools
      // ========================================

      if (toolName === 'list_oci_bastions') {
        const bastions = await ociClient.listBastions(args.compartment_id);
        const formatted = bastions.map((bastion) => ociClient.formatBastion(bastion));

        if (formatted.length === 0) {
          return { content: [{ type: 'text', text: 'No bastions found.' }] };
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
      }

      if (toolName === 'get_oci_bastion') {
        if (!args.bastion_id) {
          return { content: [{ type: 'text', text: "Error: 'bastion_id' is required" }] };
        }

        const bastion = await ociClient.getBastion(args.bastion_id);
        const formatted = ociClient.formatBastion(bastion);

        const result =
          `Bastion Details:\n\n` +
          `Name: ${formatted.name}\n` +
          `ID: ${formatted.id}\n` +
          `State: ${formatted.lifecycleState}\n` +
          `Target Subnet: ${formatted.targetSubnetId}\n` +
          `Created: ${formatted.timeCreated}\n`;

        return { content: [{ type: 'text', text: result }] };
      }

      if (toolName === 'list_bastion_sessions') {
        if (!args.bastion_id) {
          return { content: [{ type: 'text', text: "Error: 'bastion_id' is required" }] };
        }

        const sessions = await ociClient.listBastionSessions(args.bastion_id);

        if (sessions.length === 0) {
          return { content: [{ type: 'text', text: 'No active sessions found for this bastion.' }] };
        }

        let result = `Found ${sessions.length} session(s):\n\n`;
        sessions.forEach((session: any, i: number) => {
          result += `${i + 1}. ${session.displayName}\n`;
          result += `   ID: ${session.id}\n`;
          result += `   State: ${session.lifecycleState}\n`;
          result += `   Type: ${session.sessionType}\n`;
          result += `   Created: ${session.timeCreated}\n\n`;
        });

        return { content: [{ type: 'text', text: result }] };
      }

      // ========================================
      // DevOps Project Tools
      // ========================================

      if (toolName === 'list_devops_projects') {
        const projects = await ociClient.listDevopsProjects(args.compartment_id, args.name);

        if (projects.length === 0) {
          return { content: [{ type: 'text', text: 'No DevOps projects found.' }] };
        }

        let result = `Found ${projects.length} DevOps project(s):\n\n`;
        projects.forEach((project: any, i: number) => {
          result += `${i + 1}. ${project.name}\n`;
          result += `   ID: ${project.id}\n`;
          result += `   State: ${project.lifecycleState}\n`;
          if (project.description) {
            result += `   Description: ${project.description}\n`;
          }
          result += `   Created: ${project.timeCreated}\n\n`;
        });

        return { content: [{ type: 'text', text: result }] };
      }

      if (toolName === 'get_devops_project') {
        if (!args.project_id) {
          return { content: [{ type: 'text', text: "Error: 'project_id' is required" }] };
        }

        const project = await ociClient.getDevopsProject(args.project_id);
        const formatted = ociClient.formatDevopsProject(project);

        const result =
          `DevOps Project Details:\n\n` +
          `Name: ${formatted.name}\n` +
          `ID: ${formatted.id}\n` +
          `State: ${formatted.lifecycleState}\n` +
          `Description: ${formatted.description || 'N/A'}\n` +
          `Namespace: ${formatted.namespace || 'N/A'}\n` +
          `Created: ${formatted.timeCreated}\n`;

        return { content: [{ type: 'text', text: result }] };
      }

      // ========================================
      // DevOps Build Pipeline Tools
      // ========================================

      if (toolName === 'list_devops_build_pipelines') {
        if (!args.project_id) {
          return { content: [{ type: 'text', text: "Error: 'project_id' is required" }] };
        }

        const pipelines = await ociClient.listBuildPipelines(args.project_id, args.display_name);

        if (pipelines.length === 0) {
          return { content: [{ type: 'text', text: 'No build pipelines found.' }] };
        }

        let result = `Found ${pipelines.length} build pipeline(s):\n\n`;
        pipelines.forEach((pipeline: any, i: number) => {
          result += `${i + 1}. ${pipeline.displayName}\n`;
          result += `   ID: ${pipeline.id}\n`;
          result += `   State: ${pipeline.lifecycleState}\n`;
          if (pipeline.description) {
            result += `   Description: ${pipeline.description}\n`;
          }
          result += `   Created: ${pipeline.timeCreated}\n\n`;
        });

        return { content: [{ type: 'text', text: result }] };
      }

      if (toolName === 'get_devops_build_pipeline') {
        if (!args.build_pipeline_id) {
          return { content: [{ type: 'text', text: "Error: 'build_pipeline_id' is required" }] };
        }

        const pipeline = await ociClient.getBuildPipeline(args.build_pipeline_id);
        const formatted = ociClient.formatBuildPipeline(pipeline);

        const result =
          `Build Pipeline Details:\n\n` +
          `Name: ${formatted.displayName}\n` +
          `ID: ${formatted.id}\n` +
          `State: ${formatted.lifecycleState}\n` +
          `Description: ${formatted.description || 'N/A'}\n` +
          `Project ID: ${formatted.projectId}\n` +
          `Created: ${formatted.timeCreated}\n`;

        return { content: [{ type: 'text', text: result }] };
      }

      if (toolName === 'list_devops_build_pipeline_stages') {
        if (!args.build_pipeline_id) {
          return { content: [{ type: 'text', text: "Error: 'build_pipeline_id' is required" }] };
        }

        const stages = await ociClient.listBuildPipelineStages(args.build_pipeline_id);

        if (stages.length === 0) {
          return { content: [{ type: 'text', text: 'No build pipeline stages found.' }] };
        }

        let result = `Found ${stages.length} stage(s):\n\n`;
        stages.forEach((stage: any, i: number) => {
          result += `${i + 1}. ${stage.displayName}\n`;
          result += `   ID: ${stage.id}\n`;
          result += `   Type: ${stage.buildPipelineStageType}\n`;
          result += `   State: ${stage.lifecycleState}\n\n`;
        });

        return { content: [{ type: 'text', text: result }] };
      }

      if (toolName === 'get_devops_build_pipeline_stage') {
        if (!args.build_pipeline_stage_id) {
          return { content: [{ type: 'text', text: "Error: 'build_pipeline_stage_id' is required" }] };
        }

        const stage = await ociClient.getBuildPipelineStage(args.build_pipeline_stage_id);

        const result =
          `Build Pipeline Stage Details:\n\n` +
          `Name: ${stage.displayName}\n` +
          `ID: ${stage.id}\n` +
          `Type: ${stage.buildPipelineStageType}\n` +
          `State: ${stage.lifecycleState}\n` +
          `Description: ${stage.description || 'N/A'}\n` +
          `Created: ${stage.timeCreated}\n`;

        return { content: [{ type: 'text', text: result }] };
      }

      // ========================================
      // DevOps Build Run Tools
      // ========================================

      if (toolName === 'list_devops_build_runs') {
        if (!args.project_id) {
          return { content: [{ type: 'text', text: "Error: 'project_id' is required" }] };
        }

        const buildRuns = await ociClient.listBuildRuns(
          args.project_id,
          args.build_pipeline_id,
          args.lifecycle_state,
          args.limit
        );

        if (buildRuns.length === 0) {
          return { content: [{ type: 'text', text: 'No build runs found.' }] };
        }

        let result = `Found ${buildRuns.length} build run(s):\n\n`;
        buildRuns.forEach((run: any, i: number) => {
          result += `${i + 1}. ${run.displayName || 'Unnamed'}\n`;
          result += `   ID: ${run.id}\n`;
          result += `   State: ${run.lifecycleState}\n`;
          result += `   Created: ${run.timeCreated}\n\n`;
        });

        return { content: [{ type: 'text', text: result }] };
      }

      if (toolName === 'get_devops_build_run') {
        if (!args.build_run_id) {
          return { content: [{ type: 'text', text: "Error: 'build_run_id' is required" }] };
        }

        const buildRun = await ociClient.getBuildRun(args.build_run_id);
        const formatted = ociClient.formatBuildRun(buildRun);

        let result =
          `Build Run Details:\n\n` +
          `Name: ${formatted.displayName || 'Unnamed'}\n` +
          `ID: ${formatted.id}\n` +
          `State: ${formatted.lifecycleState}\n` +
          `Pipeline ID: ${formatted.buildPipelineId}\n`;

        if (formatted.commitInfo) {
          result += `Commit: ${formatted.commitInfo.commitHash || 'N/A'}\n`;
          result += `Branch: ${formatted.commitInfo.repositoryBranch || 'N/A'}\n`;
        }
        result += `Created: ${formatted.timeCreated}\n`;
        result += `Updated: ${formatted.timeUpdated}\n`;

        return { content: [{ type: 'text', text: result }] };
      }

      if (toolName === 'trigger_devops_build_run') {
        if (!args.build_pipeline_id) {
          return { content: [{ type: 'text', text: "Error: 'build_pipeline_id' is required" }] };
        }

        const buildRun = await ociClient.triggerBuildRun(
          args.build_pipeline_id,
          args.display_name,
          args.commit_info_commit_hash,
          args.commit_info_repository_branch,
          args.build_run_arguments
        );

        const result =
          `Build run triggered successfully!\n\n` +
          `ID: ${buildRun.id}\n` +
          `Name: ${buildRun.displayName}\n` +
          `State: ${buildRun.lifecycleState}\n\n` +
          `Use 'get_devops_build_run' to monitor progress.`;

        return { content: [{ type: 'text', text: result }] };
      }

      if (toolName === 'cancel_devops_build_run') {
        if (!args.build_run_id) {
          return { content: [{ type: 'text', text: "Error: 'build_run_id' is required" }] };
        }

        const buildRun = await ociClient.cancelBuildRun(args.build_run_id, args.reason);

        return {
          content: [{ type: 'text', text: `Build run cancelled. Current state: ${buildRun.lifecycleState}` }],
        };
      }

      if (toolName === 'get_devops_build_run_logs') {
        if (!args.build_run_id) {
          return { content: [{ type: 'text', text: "Error: 'build_run_id' is required" }] };
        }

        const logs = await ociClient.getBuildRunLogs(args.build_run_id, args.stage_name);
        return { content: [{ type: 'text', text: logs }] };
      }

      // ========================================
      // DevOps Deploy Pipeline Tools
      // ========================================

      if (toolName === 'list_devops_deploy_pipelines') {
        if (!args.project_id) {
          return { content: [{ type: 'text', text: "Error: 'project_id' is required" }] };
        }

        const pipelines = await ociClient.listDeployPipelines(args.project_id, args.display_name);

        if (pipelines.length === 0) {
          return { content: [{ type: 'text', text: 'No deploy pipelines found.' }] };
        }

        let result = `Found ${pipelines.length} deploy pipeline(s):\n\n`;
        pipelines.forEach((pipeline: any, i: number) => {
          result += `${i + 1}. ${pipeline.displayName}\n`;
          result += `   ID: ${pipeline.id}\n`;
          result += `   State: ${pipeline.lifecycleState}\n`;
          if (pipeline.description) {
            result += `   Description: ${pipeline.description}\n`;
          }
          result += `   Created: ${pipeline.timeCreated}\n\n`;
        });

        return { content: [{ type: 'text', text: result }] };
      }

      if (toolName === 'get_devops_deploy_pipeline') {
        if (!args.deploy_pipeline_id) {
          return { content: [{ type: 'text', text: "Error: 'deploy_pipeline_id' is required" }] };
        }

        const pipeline = await ociClient.getDeployPipeline(args.deploy_pipeline_id);
        const formatted = ociClient.formatDeployPipeline(pipeline);

        const result =
          `Deploy Pipeline Details:\n\n` +
          `Name: ${formatted.displayName}\n` +
          `ID: ${formatted.id}\n` +
          `State: ${formatted.lifecycleState}\n` +
          `Description: ${formatted.description || 'N/A'}\n` +
          `Project ID: ${formatted.projectId}\n` +
          `Created: ${formatted.timeCreated}\n`;

        return { content: [{ type: 'text', text: result }] };
      }

      if (toolName === 'list_devops_deploy_stages') {
        if (!args.deploy_pipeline_id) {
          return { content: [{ type: 'text', text: "Error: 'deploy_pipeline_id' is required" }] };
        }

        const stages = await ociClient.listDeployStages(args.deploy_pipeline_id);

        if (stages.length === 0) {
          return { content: [{ type: 'text', text: 'No deploy stages found.' }] };
        }

        let result = `Found ${stages.length} stage(s):\n\n`;
        stages.forEach((stage: any, i: number) => {
          result += `${i + 1}. ${stage.displayName}\n`;
          result += `   ID: ${stage.id}\n`;
          result += `   Type: ${stage.deployStageType}\n`;
          result += `   State: ${stage.lifecycleState}\n\n`;
        });

        return { content: [{ type: 'text', text: result }] };
      }

      if (toolName === 'get_devops_deploy_stage') {
        if (!args.deploy_stage_id) {
          return { content: [{ type: 'text', text: "Error: 'deploy_stage_id' is required" }] };
        }

        const stage = await ociClient.getDeployStage(args.deploy_stage_id);

        const result =
          `Deploy Stage Details:\n\n` +
          `Name: ${stage.displayName}\n` +
          `ID: ${stage.id}\n` +
          `Type: ${stage.deployStageType}\n` +
          `State: ${stage.lifecycleState}\n` +
          `Description: ${stage.description || 'N/A'}\n` +
          `Created: ${stage.timeCreated}\n`;

        return { content: [{ type: 'text', text: result }] };
      }

      // ========================================
      // DevOps Deployment Tools
      // ========================================

      if (toolName === 'list_devops_deployments') {
        if (!args.project_id) {
          return { content: [{ type: 'text', text: "Error: 'project_id' is required" }] };
        }

        const deployments = await ociClient.listDeployments(
          args.project_id,
          args.deploy_pipeline_id,
          args.lifecycle_state,
          args.limit
        );

        if (deployments.length === 0) {
          return { content: [{ type: 'text', text: 'No deployments found.' }] };
        }

        let result = `Found ${deployments.length} deployment(s):\n\n`;
        deployments.forEach((deployment: any, i: number) => {
          result += `${i + 1}. ${deployment.displayName || 'Unnamed'}\n`;
          result += `   ID: ${deployment.id}\n`;
          result += `   State: ${deployment.lifecycleState}\n`;
          result += `   Created: ${deployment.timeCreated}\n\n`;
        });

        return { content: [{ type: 'text', text: result }] };
      }

      if (toolName === 'get_devops_deployment') {
        if (!args.deployment_id) {
          return { content: [{ type: 'text', text: "Error: 'deployment_id' is required" }] };
        }

        const deployment = await ociClient.getDeployment(args.deployment_id);
        const formatted = ociClient.formatDeployment(deployment);

        const result =
          `Deployment Details:\n\n` +
          `Name: ${formatted.displayName || 'Unnamed'}\n` +
          `ID: ${formatted.id}\n` +
          `State: ${formatted.lifecycleState}\n` +
          `Type: ${formatted.deploymentType}\n` +
          `Pipeline ID: ${formatted.deployPipelineId}\n` +
          `Created: ${formatted.timeCreated}\n` +
          `Updated: ${formatted.timeUpdated}\n`;

        return { content: [{ type: 'text', text: result }] };
      }

      if (toolName === 'trigger_devops_deployment') {
        if (!args.deploy_pipeline_id) {
          return { content: [{ type: 'text', text: "Error: 'deploy_pipeline_id' is required" }] };
        }

        const deployment = await ociClient.triggerDeployment(
          args.deploy_pipeline_id,
          args.display_name,
          args.deployment_arguments,
          args.deploy_artifact_override_arguments
        );

        const result =
          `Deployment triggered successfully!\n\n` +
          `ID: ${deployment.id}\n` +
          `Name: ${deployment.displayName}\n` +
          `State: ${deployment.lifecycleState}\n\n` +
          `Use 'get_devops_deployment' to monitor progress.`;

        return { content: [{ type: 'text', text: result }] };
      }

      if (toolName === 'approve_devops_deployment') {
        if (!args.deployment_id || !args.stage_id || !args.action) {
          return { content: [{ type: 'text', text: "Error: 'deployment_id', 'stage_id', and 'action' are required" }] };
        }

        const deployment = await ociClient.approveDeployment(
          args.deployment_id,
          args.stage_id,
          args.action,
          args.reason
        );

        return {
          content: [{ type: 'text', text: `Deployment ${args.action.toLowerCase()}d. Current state: ${deployment.lifecycleState}` }],
        };
      }

      if (toolName === 'cancel_devops_deployment') {
        if (!args.deployment_id) {
          return { content: [{ type: 'text', text: "Error: 'deployment_id' is required" }] };
        }

        const deployment = await ociClient.cancelDeployment(args.deployment_id, args.reason);

        return {
          content: [{ type: 'text', text: `Deployment cancelled. Current state: ${deployment.lifecycleState}` }],
        };
      }

      if (toolName === 'get_devops_deployment_logs') {
        if (!args.deployment_id) {
          return { content: [{ type: 'text', text: "Error: 'deployment_id' is required" }] };
        }

        const logs = await ociClient.getDeploymentLogs(args.deployment_id, args.stage_name);
        return { content: [{ type: 'text', text: logs }] };
      }

      // ========================================
      // DevOps Artifact Tools
      // ========================================

      if (toolName === 'list_devops_artifacts') {
        if (!args.project_id) {
          return { content: [{ type: 'text', text: "Error: 'project_id' is required" }] };
        }

        const artifacts = await ociClient.listDeployArtifacts(args.project_id, args.display_name);

        if (artifacts.length === 0) {
          return { content: [{ type: 'text', text: 'No deploy artifacts found.' }] };
        }

        let result = `Found ${artifacts.length} artifact(s):\n\n`;
        artifacts.forEach((artifact: any, i: number) => {
          result += `${i + 1}. ${artifact.displayName}\n`;
          result += `   ID: ${artifact.id}\n`;
          result += `   Type: ${artifact.deployArtifactType}\n`;
          result += `   State: ${artifact.lifecycleState}\n\n`;
        });

        return { content: [{ type: 'text', text: result }] };
      }

      if (toolName === 'get_devops_artifact') {
        if (!args.artifact_id) {
          return { content: [{ type: 'text', text: "Error: 'artifact_id' is required" }] };
        }

        const artifact = await ociClient.getDeployArtifact(args.artifact_id);

        const result =
          `Deploy Artifact Details:\n\n` +
          `Name: ${artifact.displayName}\n` +
          `ID: ${artifact.id}\n` +
          `Type: ${artifact.deployArtifactType}\n` +
          `State: ${artifact.lifecycleState}\n` +
          `Description: ${artifact.description || 'N/A'}\n` +
          `Created: ${artifact.timeCreated}\n`;

        return { content: [{ type: 'text', text: result }] };
      }

      // ========================================
      // DevOps Repository Tools
      // ========================================

      if (toolName === 'list_devops_repositories') {
        if (!args.project_id) {
          return { content: [{ type: 'text', text: "Error: 'project_id' is required" }] };
        }

        const repositories = await ociClient.listRepositories(args.project_id, args.name);

        if (repositories.length === 0) {
          return { content: [{ type: 'text', text: 'No code repositories found.' }] };
        }

        let result = `Found ${repositories.length} repository(ies):\n\n`;
        repositories.forEach((repo: any, i: number) => {
          result += `${i + 1}. ${repo.name}\n`;
          result += `   ID: ${repo.id}\n`;
          result += `   State: ${repo.lifecycleState}\n`;
          result += `   Default Branch: ${repo.defaultBranch || 'N/A'}\n\n`;
        });

        return { content: [{ type: 'text', text: result }] };
      }

      if (toolName === 'get_devops_repository') {
        if (!args.repository_id) {
          return { content: [{ type: 'text', text: "Error: 'repository_id' is required" }] };
        }

        const repository = await ociClient.getRepository(args.repository_id);
        const formatted = ociClient.formatRepository(repository);

        const result =
          `Repository Details:\n\n` +
          `Name: ${formatted.name}\n` +
          `ID: ${formatted.id}\n` +
          `State: ${formatted.lifecycleState}\n` +
          `Default Branch: ${formatted.defaultBranch || 'N/A'}\n` +
          `HTTP URL: ${formatted.httpUrl || 'N/A'}\n` +
          `SSH URL: ${formatted.sshUrl || 'N/A'}\n` +
          `Description: ${formatted.description || 'N/A'}\n` +
          `Created: ${formatted.timeCreated}\n`;

        return { content: [{ type: 'text', text: result }] };
      }

      if (toolName === 'list_devops_repository_refs') {
        if (!args.repository_id) {
          return { content: [{ type: 'text', text: "Error: 'repository_id' is required" }] };
        }

        const refs = await ociClient.listRepositoryRefs(args.repository_id, args.ref_type);

        if (refs.length === 0) {
          return { content: [{ type: 'text', text: 'No refs found.' }] };
        }

        let result = `Found ${refs.length} ref(s):\n\n`;
        refs.forEach((ref: any, i: number) => {
          result += `${i + 1}. ${ref.refName}\n`;
          result += `   Type: ${ref.refType}\n`;
          result += `   Commit: ${ref.commitId || 'N/A'}\n\n`;
        });

        return { content: [{ type: 'text', text: result }] };
      }

      if (toolName === 'list_devops_repository_commits') {
        if (!args.repository_id) {
          return { content: [{ type: 'text', text: "Error: 'repository_id' is required" }] };
        }

        const commits = await ociClient.listRepositoryCommits(
          args.repository_id,
          args.ref_name,
          args.limit
        );

        if (commits.length === 0) {
          return { content: [{ type: 'text', text: 'No commits found.' }] };
        }

        let result = `Found ${commits.length} commit(s):\n\n`;
        commits.forEach((commit: any, i: number) => {
          result += `${i + 1}. ${commit.commitMessage?.split('\n')[0] || 'No message'}\n`;
          result += `   SHA: ${commit.commitId}\n`;
          result += `   Author: ${commit.authorName || 'Unknown'}\n`;
          result += `   Date: ${commit.timeCreated}\n\n`;
        });

        return { content: [{ type: 'text', text: result }] };
      }

      if (toolName === 'get_devops_repository_commit') {
        if (!args.repository_id || !args.commit_id) {
          return { content: [{ type: 'text', text: "Error: 'repository_id' and 'commit_id' are required" }] };
        }

        const commit = await ociClient.getRepositoryCommit(args.repository_id, args.commit_id);

        const result =
          `Commit Details:\n\n` +
          `SHA: ${commit.commitId}\n` +
          `Message: ${commit.commitMessage || 'N/A'}\n` +
          `Author: ${commit.authorName || 'Unknown'} <${commit.authorEmail || 'N/A'}>\n` +
          `Date: ${commit.timeCreated}\n` +
          `Parent: ${commit.parentCommitIds?.join(', ') || 'N/A'}\n`;

        return { content: [{ type: 'text', text: result }] };
      }

      // ========================================
      // DevOps Trigger Tools
      // ========================================

      if (toolName === 'list_devops_triggers') {
        if (!args.project_id) {
          return { content: [{ type: 'text', text: "Error: 'project_id' is required" }] };
        }

        const triggers = await ociClient.listTriggers(args.project_id, args.display_name);

        if (triggers.length === 0) {
          return { content: [{ type: 'text', text: 'No triggers found.' }] };
        }

        let result = `Found ${triggers.length} trigger(s):\n\n`;
        triggers.forEach((trigger: any, i: number) => {
          result += `${i + 1}. ${trigger.displayName}\n`;
          result += `   ID: ${trigger.id}\n`;
          result += `   Type: ${trigger.triggerSource}\n`;
          result += `   State: ${trigger.lifecycleState}\n\n`;
        });

        return { content: [{ type: 'text', text: result }] };
      }

      if (toolName === 'get_devops_trigger') {
        if (!args.trigger_id) {
          return { content: [{ type: 'text', text: "Error: 'trigger_id' is required" }] };
        }

        const trigger = await ociClient.getTrigger(args.trigger_id);

        const result =
          `Trigger Details:\n\n` +
          `Name: ${trigger.displayName}\n` +
          `ID: ${trigger.id}\n` +
          `Type: ${trigger.triggerSource}\n` +
          `State: ${trigger.lifecycleState}\n` +
          `Description: ${trigger.description || 'N/A'}\n` +
          `Created: ${trigger.timeCreated}\n`;

        return { content: [{ type: 'text', text: result }] };
      }

      // ========================================
      // DevOps Connection Tools
      // ========================================

      if (toolName === 'list_devops_connections') {
        if (!args.project_id) {
          return { content: [{ type: 'text', text: "Error: 'project_id' is required" }] };
        }

        const connections = await ociClient.listConnections(args.project_id, args.connection_type);

        if (connections.length === 0) {
          return { content: [{ type: 'text', text: 'No connections found.' }] };
        }

        let result = `Found ${connections.length} connection(s):\n\n`;
        connections.forEach((conn: any, i: number) => {
          result += `${i + 1}. ${conn.displayName}\n`;
          result += `   ID: ${conn.id}\n`;
          result += `   Type: ${conn.connectionType}\n`;
          result += `   State: ${conn.lifecycleState}\n\n`;
        });

        return { content: [{ type: 'text', text: result }] };
      }

      if (toolName === 'get_devops_connection') {
        if (!args.connection_id) {
          return { content: [{ type: 'text', text: "Error: 'connection_id' is required" }] };
        }

        const connection = await ociClient.getConnection(args.connection_id);

        const result =
          `Connection Details:\n\n` +
          `Name: ${connection.displayName}\n` +
          `ID: ${connection.id}\n` +
          `Type: ${connection.connectionType}\n` +
          `State: ${connection.lifecycleState}\n` +
          `Description: ${connection.description || 'N/A'}\n` +
          `Created: ${connection.timeCreated}\n`;

        return { content: [{ type: 'text', text: result }] };
      }

      // ========================================
      // DevOps Environment Tools
      // ========================================

      if (toolName === 'list_devops_environments') {
        if (!args.project_id) {
          return { content: [{ type: 'text', text: "Error: 'project_id' is required" }] };
        }

        const environments = await ociClient.listEnvironments(args.project_id, args.display_name);

        if (environments.length === 0) {
          return { content: [{ type: 'text', text: 'No environments found.' }] };
        }

        let result = `Found ${environments.length} environment(s):\n\n`;
        environments.forEach((env: any, i: number) => {
          result += `${i + 1}. ${env.displayName}\n`;
          result += `   ID: ${env.id}\n`;
          result += `   Type: ${env.deployEnvironmentType}\n`;
          result += `   State: ${env.lifecycleState}\n\n`;
        });

        return { content: [{ type: 'text', text: result }] };
      }

      if (toolName === 'get_devops_environment') {
        if (!args.environment_id) {
          return { content: [{ type: 'text', text: "Error: 'environment_id' is required" }] };
        }

        const environment = await ociClient.getEnvironment(args.environment_id);

        const result =
          `Environment Details:\n\n` +
          `Name: ${environment.displayName}\n` +
          `ID: ${environment.id}\n` +
          `Type: ${environment.deployEnvironmentType}\n` +
          `State: ${environment.lifecycleState}\n` +
          `Description: ${environment.description || 'N/A'}\n` +
          `Created: ${environment.timeCreated}\n`;

        return { content: [{ type: 'text', text: result }] };
      }

      // ========================================
      // Container Registry Tools
      // ========================================

      if (toolName === 'list_container_repositories') {
        const repositories = await ociClient.listContainerRepositories(args.compartment_id, args.display_name);

        if (repositories.length === 0) {
          return { content: [{ type: 'text', text: 'No container repositories found.' }] };
        }

        let result = `Found ${repositories.length} container repository(ies):\n\n`;
        repositories.forEach((repo: any, i: number) => {
          result += `${i + 1}. ${repo.displayName}\n`;
          result += `   ID: ${repo.id}\n`;
          result += `   State: ${repo.lifecycleState}\n`;
          result += `   Image Count: ${repo.imageCount || 0}\n\n`;
        });

        return { content: [{ type: 'text', text: result }] };
      }

      if (toolName === 'get_container_repository') {
        if (!args.repository_id) {
          return { content: [{ type: 'text', text: "Error: 'repository_id' is required" }] };
        }

        const repository = await ociClient.getContainerRepository(args.repository_id);

        const result =
          `Container Repository Details:\n\n` +
          `Name: ${repository.displayName}\n` +
          `ID: ${repository.id}\n` +
          `State: ${repository.lifecycleState}\n` +
          `Image Count: ${repository.imageCount || 0}\n` +
          `Is Public: ${repository.isPublic ? 'Yes' : 'No'}\n` +
          `Created: ${repository.timeCreated}\n`;

        return { content: [{ type: 'text', text: result }] };
      }

      if (toolName === 'list_container_images') {
        const images = await ociClient.listContainerImages(
          args.compartment_id,
          args.repository_name,
          args.display_name
        );

        if (images.length === 0) {
          return { content: [{ type: 'text', text: 'No container images found.' }] };
        }

        let result = `Found ${images.length} container image(s):\n\n`;
        images.forEach((image: any, i: number) => {
          result += `${i + 1}. ${image.displayName}\n`;
          result += `   ID: ${image.id}\n`;
          result += `   Repository: ${image.repositoryName}\n`;
          result += `   Digest: ${image.digest?.substring(0, 20)}...\n`;
          result += `   Created: ${image.timeCreated}\n\n`;
        });

        return { content: [{ type: 'text', text: result }] };
      }

      if (toolName === 'get_container_image') {
        if (!args.image_id) {
          return { content: [{ type: 'text', text: "Error: 'image_id' is required" }] };
        }

        const image = await ociClient.getContainerImage(args.image_id);
        const formatted = ociClient.formatContainerImage(image);

        const result =
          `Container Image Details:\n\n` +
          `Name: ${formatted.displayName}\n` +
          `ID: ${formatted.id}\n` +
          `Repository: ${formatted.repositoryName}\n` +
          `Version: ${formatted.version || 'N/A'}\n` +
          `Digest: ${formatted.digest}\n` +
          `Created: ${formatted.timeCreated}\n`;

        return { content: [{ type: 'text', text: result }] };
      }

      if (toolName === 'delete_container_image') {
        if (!args.image_id) {
          return { content: [{ type: 'text', text: "Error: 'image_id' is required" }] };
        }

        await ociClient.deleteContainerImage(args.image_id);
        return { content: [{ type: 'text', text: 'Container image deleted successfully.' }] };
      }

      // ========================================
      // DevOps Work Request Tools
      // ========================================

      if (toolName === 'list_devops_work_requests') {
        const workRequests = await ociClient.listDevopsWorkRequests(args.compartment_id, args.project_id);

        if (workRequests.length === 0) {
          return { content: [{ type: 'text', text: 'No DevOps work requests found.' }] };
        }

        let result = `Found ${workRequests.length} work request(s):\n\n`;
        workRequests.forEach((wr: any, i: number) => {
          result += `${i + 1}. ${wr.operationType}\n`;
          result += `   ID: ${wr.id}\n`;
          result += `   Status: ${wr.status}\n`;
          result += `   % Complete: ${wr.percentComplete}%\n\n`;
        });

        return { content: [{ type: 'text', text: result }] };
      }

      if (toolName === 'get_devops_work_request') {
        if (!args.work_request_id) {
          return { content: [{ type: 'text', text: "Error: 'work_request_id' is required" }] };
        }

        const workRequest = await ociClient.getDevopsWorkRequest(args.work_request_id);

        const result =
          `DevOps Work Request Details:\n\n` +
          `ID: ${workRequest.id}\n` +
          `Operation: ${workRequest.operationType}\n` +
          `Status: ${workRequest.status}\n` +
          `% Complete: ${workRequest.percentComplete}%\n` +
          `Started: ${workRequest.timeStarted || 'N/A'}\n` +
          `Finished: ${workRequest.timeFinished || 'In Progress'}\n`;

        return { content: [{ type: 'text', text: result }] };
      }

      // Unknown tool
      return { content: [{ type: 'text', text: `Unknown tool: ${toolName}` }] };

    } catch (error) {
      return {
        content: [{ type: 'text', text: `Error executing ${toolName}: ${error}` }],
      };
    }
  });
}
