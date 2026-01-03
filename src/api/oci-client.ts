import * as common from 'oci-common';
import * as core from 'oci-core';
import * as identity from 'oci-identity';
import * as containerengine from 'oci-containerengine';
import * as bastion from 'oci-bastion';
import * as devops from 'oci-devops';
import * as artifacts from 'oci-artifacts';
import type { Config } from '../config/index.js';
import * as os from 'os';
import * as path from 'path';

/**
 * Expand tilde (~) in file paths to home directory
 */
function expandPath(filepath: string | undefined): string | undefined {
  if (!filepath) return filepath;
  if (filepath.startsWith('~/') || filepath === '~') {
    return path.join(os.homedir(), filepath.slice(1));
  }
  return filepath;
}

/**
 * OCI Client using Session Token Authentication
 *
 * This client provides comprehensive access to OCI services including:
 * - Compute instances
 * - OKE (Oracle Kubernetes Engine) clusters and node pools
 * - OCI DevOps (build pipelines, deployments, artifacts)
 * - Container Registry (OCIR)
 * - Bastion hosts
 *
 * Session tokens must be created using: oci session authenticate --profile-name <profile> --region <region>
 */
export class OCIClient {
  private provider: common.SessionAuthDetailProvider;
  private region: string;
  private compartmentId: string;
  private tenancyId: string;

  // Service clients (lazy-loaded)
  private computeClient?: core.ComputeClient;
  private identityClient?: identity.IdentityClient;
  private containerEngineClient?: containerengine.ContainerEngineClient;
  private bastionClient?: bastion.BastionClient;
  private devopsClient?: devops.DevopsClient;
  private artifactsClient?: artifacts.ArtifactsClient;

  constructor(private config: Config) {
    if (!config.ociMcpEnabled) {
      throw new Error('OCI MCP is not enabled. Set OCI_MCP_ENABLED=true in your .env file');
    }

    // Validate required configuration
    if (!config.ociMcpRegion || !config.ociMcpCompartmentId || !config.ociMcpTenancyId) {
      throw new Error(
        'OCI MCP configuration is incomplete. Required: OCI_MCP_REGION, OCI_MCP_COMPARTMENT_ID, OCI_MCP_TENANCY_ID'
      );
    }

    this.region = config.ociMcpRegion;
    this.compartmentId = config.ociMcpCompartmentId;
    this.tenancyId = config.ociMcpTenancyId;

    // Determine config file path and expand tilde if present
    const rawConfigPath =
      config.ociMcpConfigPath ||
      config.ociConfigPath ||
      path.join(os.homedir(), '.oci', 'config');
    const configPath = expandPath(rawConfigPath) || rawConfigPath;

    // Determine profile name
    const profile = config.ociMcpProfile || config.ociProfile || 'DEFAULT';

    try {
      // Initialize Session Token authentication provider (specifically for session tokens)
      // SessionAuthDetailProvider handles security_token_file from the config profile
      this.provider = new common.SessionAuthDetailProvider(configPath, profile);

      console.error(`✓ OCI MCP Client initialized with Session Token authentication`);
      console.error(`  - Profile: ${profile}`);
      console.error(`  - Config: ${configPath}`);
      console.error(`  - Region: ${this.region}`);
      console.error(`  - Compartment: ${this.compartmentId}`);
    } catch (error) {
      throw new Error(
        `Failed to initialize OCI Session Token authentication: ${error}\n\n` +
          `Ensure you have created a session token using:\n` +
          `  oci session authenticate --profile-name ${profile} --region ${this.region}\n`
      );
    }
  }

  // ========================================
  // Service Client Getters (Lazy-loaded)
  // ========================================

  private getComputeClient(): core.ComputeClient {
    if (!this.computeClient) {
      this.computeClient = new core.ComputeClient({
        authenticationDetailsProvider: this.provider,
      });
      this.computeClient.region = common.Region.fromRegionId(this.region);
    }
    return this.computeClient;
  }

  private getIdentityClient(): identity.IdentityClient {
    if (!this.identityClient) {
      this.identityClient = new identity.IdentityClient({
        authenticationDetailsProvider: this.provider,
      });
      this.identityClient.region = common.Region.fromRegionId(this.region);
    }
    return this.identityClient;
  }

  private getContainerEngineClient(): containerengine.ContainerEngineClient {
    if (!this.containerEngineClient) {
      this.containerEngineClient = new containerengine.ContainerEngineClient({
        authenticationDetailsProvider: this.provider,
      });
      this.containerEngineClient.region = common.Region.fromRegionId(this.region);
    }
    return this.containerEngineClient;
  }

  private getBastionClient(): bastion.BastionClient {
    if (!this.bastionClient) {
      this.bastionClient = new bastion.BastionClient({
        authenticationDetailsProvider: this.provider,
      });
      this.bastionClient.region = common.Region.fromRegionId(this.region);
    }
    return this.bastionClient;
  }

  private getDevopsClient(): devops.DevopsClient {
    if (!this.devopsClient) {
      this.devopsClient = new devops.DevopsClient({
        authenticationDetailsProvider: this.provider,
      });
      this.devopsClient.region = common.Region.fromRegionId(this.region);
    }
    return this.devopsClient;
  }

  private getArtifactsClient(): artifacts.ArtifactsClient {
    if (!this.artifactsClient) {
      this.artifactsClient = new artifacts.ArtifactsClient({
        authenticationDetailsProvider: this.provider,
      });
      this.artifactsClient.region = common.Region.fromRegionId(this.region);
    }
    return this.artifactsClient;
  }

  // ========================================
  // Connection & Identity Methods
  // ========================================

  async testConnection(): Promise<{ success: boolean; message: string }> {
    try {
      const identityClient = this.getIdentityClient();
      const response = await identityClient.getCompartment({
        compartmentId: this.compartmentId,
      });

      return {
        success: true,
        message: `Successfully connected to OCI. Compartment: ${response.compartment.name}`,
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to connect to OCI: ${error}`,
      };
    }
  }

  async listCompartments(): Promise<any[]> {
    try {
      const identityClient = this.getIdentityClient();
      const response = await identityClient.listCompartments({
        compartmentId: this.tenancyId,
        compartmentIdInSubtree: true,
      });

      return response.items || [];
    } catch (error) {
      throw new Error(`Failed to list compartments: ${error}`);
    }
  }

  // ========================================
  // Compute Instance Methods
  // ========================================

  async listInstances(compartmentId?: string): Promise<any[]> {
    try {
      const computeClient = this.getComputeClient();
      const targetCompartmentId = compartmentId || this.compartmentId;

      const response = await computeClient.listInstances({
        compartmentId: targetCompartmentId,
      });

      return response.items || [];
    } catch (error) {
      throw new Error(`Failed to list instances: ${error}`);
    }
  }

  async getInstance(instanceId: string): Promise<any> {
    try {
      const computeClient = this.getComputeClient();
      const response = await computeClient.getInstance({
        instanceId,
      });

      return response.instance;
    } catch (error) {
      throw new Error(`Failed to get instance: ${error}`);
    }
  }

  // ========================================
  // OKE Cluster Methods
  // ========================================

  async listOKEClusters(compartmentId?: string): Promise<any[]> {
    try {
      const containerEngineClient = this.getContainerEngineClient();
      const targetCompartmentId = compartmentId || this.compartmentId;

      const response = await containerEngineClient.listClusters({
        compartmentId: targetCompartmentId,
      });

      return response.items || [];
    } catch (error) {
      throw new Error(`Failed to list OKE clusters: ${error}`);
    }
  }

  async getOKECluster(clusterId: string): Promise<any> {
    try {
      const containerEngineClient = this.getContainerEngineClient();
      const response = await containerEngineClient.getCluster({
        clusterId,
      });

      return response.cluster;
    } catch (error) {
      throw new Error(`Failed to get OKE cluster: ${error}`);
    }
  }

  async createOKEKubeconfig(clusterId: string): Promise<string> {
    try {
      const containerEngineClient = this.getContainerEngineClient();
      const response = await containerEngineClient.createKubeconfig({
        clusterId,
      });

      // Read the stream content
      const chunks: Buffer[] = [];
      for await (const chunk of response.value as any) {
        chunks.push(Buffer.from(chunk));
      }
      return Buffer.concat(chunks).toString('utf-8');
    } catch (error) {
      throw new Error(`Failed to create kubeconfig: ${error}`);
    }
  }

  // ========================================
  // OKE Node Pool Methods
  // ========================================

  async listNodePools(clusterId: string, compartmentId?: string): Promise<any[]> {
    try {
      const containerEngineClient = this.getContainerEngineClient();
      const response = await containerEngineClient.listNodePools({
        compartmentId: compartmentId || this.compartmentId,
        clusterId,
      });

      return response.items || [];
    } catch (error) {
      throw new Error(`Failed to list node pools: ${error}`);
    }
  }

  async getNodePool(nodePoolId: string): Promise<any> {
    try {
      const containerEngineClient = this.getContainerEngineClient();
      const response = await containerEngineClient.getNodePool({
        nodePoolId,
      });

      return response.nodePool;
    } catch (error) {
      throw new Error(`Failed to get node pool: ${error}`);
    }
  }

  async scaleNodePool(nodePoolId: string, size: number): Promise<any> {
    try {
      const containerEngineClient = this.getContainerEngineClient();

      // First get the current node pool to get its config
      const currentPool = await this.getNodePool(nodePoolId);

      const response = await containerEngineClient.updateNodePool({
        nodePoolId,
        updateNodePoolDetails: {
          nodeConfigDetails: {
            size,
            placementConfigs: currentPool.nodeConfigDetails?.placementConfigs,
          },
        },
      });

      return {
        workRequestId: response.opcWorkRequestId,
        message: `Node pool scaling initiated to ${size} nodes`,
      };
    } catch (error) {
      throw new Error(`Failed to scale node pool: ${error}`);
    }
  }

  // ========================================
  // OKE Virtual Node Pool Methods
  // ========================================

  async listVirtualNodePools(clusterId: string, compartmentId?: string): Promise<any[]> {
    try {
      const containerEngineClient = this.getContainerEngineClient();
      const response = await containerEngineClient.listVirtualNodePools({
        compartmentId: compartmentId || this.compartmentId,
        clusterId,
      });

      return response.items || [];
    } catch (error) {
      throw new Error(`Failed to list virtual node pools: ${error}`);
    }
  }

  async getVirtualNodePool(virtualNodePoolId: string): Promise<any> {
    try {
      const containerEngineClient = this.getContainerEngineClient();
      const response = await containerEngineClient.getVirtualNodePool({
        virtualNodePoolId,
      });

      return response.virtualNodePool;
    } catch (error) {
      throw new Error(`Failed to get virtual node pool: ${error}`);
    }
  }

  // ========================================
  // OKE Work Request Methods
  // ========================================

  async listOKEWorkRequests(compartmentId?: string, clusterId?: string): Promise<any[]> {
    try {
      const containerEngineClient = this.getContainerEngineClient();
      const request: containerengine.requests.ListWorkRequestsRequest = {
        compartmentId: compartmentId || this.compartmentId,
      };
      if (clusterId) {
        request.clusterId = clusterId;
      }
      const response = await containerEngineClient.listWorkRequests(request);

      return response.items || [];
    } catch (error) {
      throw new Error(`Failed to list OKE work requests: ${error}`);
    }
  }

  async getOKEWorkRequest(workRequestId: string): Promise<any> {
    try {
      const containerEngineClient = this.getContainerEngineClient();
      const response = await containerEngineClient.getWorkRequest({
        workRequestId,
      });

      return response.workRequest;
    } catch (error) {
      throw new Error(`Failed to get OKE work request: ${error}`);
    }
  }

  // ========================================
  // OKE Addon Methods
  // ========================================

  async listAddonOptions(kubernetesVersion: string): Promise<any[]> {
    try {
      const containerEngineClient = this.getContainerEngineClient();
      const response = await containerEngineClient.listAddonOptions({
        kubernetesVersion,
      });

      return response.items || [];
    } catch (error) {
      throw new Error(`Failed to list addon options: ${error}`);
    }
  }

  async listClusterAddons(clusterId: string): Promise<any[]> {
    try {
      const containerEngineClient = this.getContainerEngineClient();
      const response = await containerEngineClient.listAddons({
        clusterId,
      });

      return response.items || [];
    } catch (error) {
      throw new Error(`Failed to list cluster addons: ${error}`);
    }
  }

  async getClusterAddon(clusterId: string, addonName: string): Promise<any> {
    try {
      const containerEngineClient = this.getContainerEngineClient();
      const response = await containerEngineClient.getAddon({
        clusterId,
        addonName,
      });

      return response.addon;
    } catch (error) {
      throw new Error(`Failed to get cluster addon: ${error}`);
    }
  }

  // ========================================
  // Bastion Methods
  // ========================================

  async listBastions(compartmentId?: string): Promise<any[]> {
    try {
      const bastionClient = this.getBastionClient();
      const targetCompartmentId = compartmentId || this.compartmentId;

      const response = await bastionClient.listBastions({
        compartmentId: targetCompartmentId,
      });

      return response.items || [];
    } catch (error) {
      throw new Error(`Failed to list bastions: ${error}`);
    }
  }

  async getBastion(bastionId: string): Promise<any> {
    try {
      const bastionClient = this.getBastionClient();
      const response = await bastionClient.getBastion({
        bastionId,
      });

      return response.bastion;
    } catch (error) {
      throw new Error(`Failed to get bastion: ${error}`);
    }
  }

  async listBastionSessions(bastionId: string): Promise<any[]> {
    try {
      const bastionClient = this.getBastionClient();
      const response = await bastionClient.listSessions({
        bastionId,
      });

      return response.items || [];
    } catch (error) {
      throw new Error(`Failed to list bastion sessions: ${error}`);
    }
  }

  // ========================================
  // DevOps Project Methods
  // ========================================

  async listDevopsProjects(compartmentId?: string, name?: string): Promise<any[]> {
    try {
      const devopsClient = this.getDevopsClient();
      const request: devops.requests.ListProjectsRequest = {
        compartmentId: compartmentId || this.compartmentId,
      };
      if (name) {
        request.name = name;
      }
      const response = await devopsClient.listProjects(request);

      return response.projectCollection?.items || [];
    } catch (error) {
      throw new Error(`Failed to list DevOps projects: ${error}`);
    }
  }

  async getDevopsProject(projectId: string): Promise<any> {
    try {
      const devopsClient = this.getDevopsClient();
      const response = await devopsClient.getProject({
        projectId,
      });

      return response.project;
    } catch (error) {
      throw new Error(`Failed to get DevOps project: ${error}`);
    }
  }

  // ========================================
  // DevOps Build Pipeline Methods
  // ========================================

  async listBuildPipelines(projectId: string, displayName?: string): Promise<any[]> {
    try {
      const devopsClient = this.getDevopsClient();
      const request: devops.requests.ListBuildPipelinesRequest = {
        projectId,
      };
      if (displayName) {
        request.displayName = displayName;
      }
      const response = await devopsClient.listBuildPipelines(request);

      return response.buildPipelineCollection?.items || [];
    } catch (error) {
      throw new Error(`Failed to list build pipelines: ${error}`);
    }
  }

  async getBuildPipeline(buildPipelineId: string): Promise<any> {
    try {
      const devopsClient = this.getDevopsClient();
      const response = await devopsClient.getBuildPipeline({
        buildPipelineId,
      });

      return response.buildPipeline;
    } catch (error) {
      throw new Error(`Failed to get build pipeline: ${error}`);
    }
  }

  async listBuildPipelineStages(buildPipelineId: string): Promise<any[]> {
    try {
      const devopsClient = this.getDevopsClient();
      const response = await devopsClient.listBuildPipelineStages({
        buildPipelineId,
      });

      return response.buildPipelineStageCollection?.items || [];
    } catch (error) {
      throw new Error(`Failed to list build pipeline stages: ${error}`);
    }
  }

  async getBuildPipelineStage(buildPipelineStageId: string): Promise<any> {
    try {
      const devopsClient = this.getDevopsClient();
      const response = await devopsClient.getBuildPipelineStage({
        buildPipelineStageId,
      });

      return response.buildPipelineStage;
    } catch (error) {
      throw new Error(`Failed to get build pipeline stage: ${error}`);
    }
  }

  // ========================================
  // DevOps Build Run Methods
  // ========================================

  async listBuildRuns(
    projectId: string,
    buildPipelineId?: string,
    lifecycleState?: string,
    limit?: number
  ): Promise<any[]> {
    try {
      const devopsClient = this.getDevopsClient();
      const request: devops.requests.ListBuildRunsRequest = {
        projectId,
        limit: limit || 20,
      };
      if (buildPipelineId) {
        request.buildPipelineId = buildPipelineId;
      }
      if (lifecycleState) {
        request.lifecycleState = lifecycleState as devops.models.BuildRun.LifecycleState;
      }
      const response = await devopsClient.listBuildRuns(request);

      return response.buildRunSummaryCollection?.items || [];
    } catch (error) {
      throw new Error(`Failed to list build runs: ${error}`);
    }
  }

  async getBuildRun(buildRunId: string): Promise<any> {
    try {
      const devopsClient = this.getDevopsClient();
      const response = await devopsClient.getBuildRun({
        buildRunId,
      });

      return response.buildRun;
    } catch (error) {
      throw new Error(`Failed to get build run: ${error}`);
    }
  }

  async triggerBuildRun(
    buildPipelineId: string,
    displayName?: string,
    commitHash?: string,
    branch?: string,
    buildRunArguments?: Record<string, string>
  ): Promise<any> {
    try {
      const devopsClient = this.getDevopsClient();

      const createBuildRunDetails: devops.models.CreateBuildRunDetails = {
        buildPipelineId,
        displayName: displayName || `Build run triggered at ${new Date().toISOString()}`,
      };

      if (commitHash || branch) {
        createBuildRunDetails.commitInfo = {
          commitHash: commitHash,
          repositoryBranch: branch,
          repositoryUrl: '', // Required but can be empty for OCI DevOps repos
        };
      }

      if (buildRunArguments && Object.keys(buildRunArguments).length > 0) {
        createBuildRunDetails.buildRunArguments = {
          items: Object.entries(buildRunArguments).map(([name, value]) => ({
            name,
            value,
          })),
        };
      }

      const response = await devopsClient.createBuildRun({
        createBuildRunDetails,
      });

      return response.buildRun;
    } catch (error) {
      throw new Error(`Failed to trigger build run: ${error}`);
    }
  }

  async cancelBuildRun(buildRunId: string, reason?: string): Promise<any> {
    try {
      const devopsClient = this.getDevopsClient();
      const response = await devopsClient.cancelBuildRun({
        buildRunId,
        cancelBuildRunDetails: {
          reason: reason || 'Cancelled by user',
        },
      });

      return response.buildRun;
    } catch (error) {
      throw new Error(`Failed to cancel build run: ${error}`);
    }
  }

  async getBuildRunLogs(buildRunId: string, stageName?: string): Promise<string> {
    try {
      // Get the build run to find its stages
      const buildRun = await this.getBuildRun(buildRunId);

      // Build a summary with available information
      let logs = `Build Run: ${buildRun.displayName || buildRunId}\n`;
      logs += `Status: ${buildRun.lifecycleState}\n`;
      logs += `Progress: ${buildRun.buildRunProgress?.timeStarted || 'N/A'} - ${buildRun.buildRunProgress?.timeFinished || 'In Progress'}\n\n`;

      if (buildRun.buildRunProgress?.buildPipelineStageRunProgress) {
        const stageProgress = buildRun.buildRunProgress.buildPipelineStageRunProgress;
        for (const [stageId, progress] of Object.entries(stageProgress)) {
          if (!stageName || progress.stageDisplayName === stageName) {
            logs += `Stage: ${progress.stageDisplayName || stageId}\n`;
            logs += `  Status: ${progress.status}\n`;
            logs += `  Started: ${progress.timeStarted || 'N/A'}\n`;
            logs += `  Finished: ${progress.timeFinished || 'In Progress'}\n`;
            if ((progress as any).steps) {
              logs += `  Steps:\n`;
              for (const step of (progress as any).steps) {
                logs += `    - ${step.name}: ${step.status}\n`;
              }
            }
            logs += '\n';
          }
        }
      }

      return logs;
    } catch (error) {
      throw new Error(`Failed to get build run logs: ${error}`);
    }
  }

  // ========================================
  // DevOps Deploy Pipeline Methods
  // ========================================

  async listDeployPipelines(projectId: string, displayName?: string): Promise<any[]> {
    try {
      const devopsClient = this.getDevopsClient();
      const request: devops.requests.ListDeployPipelinesRequest = {
        projectId,
      };
      if (displayName) {
        request.displayName = displayName;
      }
      const response = await devopsClient.listDeployPipelines(request);

      return response.deployPipelineCollection?.items || [];
    } catch (error) {
      throw new Error(`Failed to list deploy pipelines: ${error}`);
    }
  }

  async getDeployPipeline(deployPipelineId: string): Promise<any> {
    try {
      const devopsClient = this.getDevopsClient();
      const response = await devopsClient.getDeployPipeline({
        deployPipelineId,
      });

      return response.deployPipeline;
    } catch (error) {
      throw new Error(`Failed to get deploy pipeline: ${error}`);
    }
  }

  async listDeployStages(deployPipelineId: string): Promise<any[]> {
    try {
      const devopsClient = this.getDevopsClient();
      const response = await devopsClient.listDeployStages({
        deployPipelineId,
      });

      return response.deployStageCollection?.items || [];
    } catch (error) {
      throw new Error(`Failed to list deploy stages: ${error}`);
    }
  }

  async getDeployStage(deployStageId: string): Promise<any> {
    try {
      const devopsClient = this.getDevopsClient();
      const response = await devopsClient.getDeployStage({
        deployStageId,
      });

      return response.deployStage;
    } catch (error) {
      throw new Error(`Failed to get deploy stage: ${error}`);
    }
  }

  // ========================================
  // DevOps Deployment Methods
  // ========================================

  async listDeployments(
    projectId: string,
    deployPipelineId?: string,
    lifecycleState?: string,
    limit?: number
  ): Promise<any[]> {
    try {
      const devopsClient = this.getDevopsClient();
      const request: devops.requests.ListDeploymentsRequest = {
        projectId,
        limit: limit || 20,
      };
      if (deployPipelineId) {
        request.deployPipelineId = deployPipelineId;
      }
      if (lifecycleState) {
        request.lifecycleState = lifecycleState as devops.models.Deployment.LifecycleState;
      }
      const response = await devopsClient.listDeployments(request);

      return response.deploymentCollection?.items || [];
    } catch (error) {
      throw new Error(`Failed to list deployments: ${error}`);
    }
  }

  async getDeployment(deploymentId: string): Promise<any> {
    try {
      const devopsClient = this.getDevopsClient();
      const response = await devopsClient.getDeployment({
        deploymentId,
      });

      return response.deployment;
    } catch (error) {
      throw new Error(`Failed to get deployment: ${error}`);
    }
  }

  async triggerDeployment(
    deployPipelineId: string,
    displayName?: string,
    deploymentArguments?: Record<string, string>,
    artifactOverrides?: any
  ): Promise<any> {
    try {
      const devopsClient = this.getDevopsClient();

      const createDeploymentDetails: any = {
        deployPipelineId,
        deploymentType: 'PIPELINE_DEPLOYMENT',
        displayName: displayName || `Deployment triggered at ${new Date().toISOString()}`,
      };

      if (deploymentArguments && Object.keys(deploymentArguments).length > 0) {
        createDeploymentDetails.deploymentArguments = {
          items: Object.entries(deploymentArguments).map(([name, value]) => ({
            name,
            value,
          })),
        };
      }

      if (artifactOverrides) {
        createDeploymentDetails.deployArtifactOverrideArguments = artifactOverrides;
      }

      const response = await devopsClient.createDeployment({
        createDeploymentDetails,
      });

      return response.deployment;
    } catch (error) {
      throw new Error(`Failed to trigger deployment: ${error}`);
    }
  }

  async approveDeployment(
    deploymentId: string,
    stageId: string,
    action: 'APPROVE' | 'REJECT',
    reason?: string
  ): Promise<any> {
    try {
      const devopsClient = this.getDevopsClient();
      const response = await devopsClient.approveDeployment({
        deploymentId,
        approveDeploymentDetails: {
          deployStageId: stageId,
          action: action as devops.models.ApproveDeploymentDetails.Action,
          reason: reason || `${action}d by user`,
        },
      });

      return response.deployment;
    } catch (error) {
      throw new Error(`Failed to approve/reject deployment: ${error}`);
    }
  }

  async cancelDeployment(deploymentId: string, reason?: string): Promise<any> {
    try {
      const devopsClient = this.getDevopsClient();
      const response = await devopsClient.cancelDeployment({
        deploymentId,
        cancelDeploymentDetails: {
          reason: reason || 'Cancelled by user',
        },
      });

      return response.deployment;
    } catch (error) {
      throw new Error(`Failed to cancel deployment: ${error}`);
    }
  }

  async getDeploymentLogs(deploymentId: string, stageName?: string): Promise<string> {
    try {
      // Get the deployment to find its stages
      const deployment = await this.getDeployment(deploymentId);

      // Build a summary with available information
      let logs = `Deployment: ${deployment.displayName || deploymentId}\n`;
      logs += `Status: ${deployment.lifecycleState}\n`;
      logs += `Progress: ${deployment.deploymentExecutionProgress?.timeStarted || 'N/A'} - ${deployment.deploymentExecutionProgress?.timeFinished || 'In Progress'}\n\n`;

      if (deployment.deploymentExecutionProgress?.deployStageExecutionProgress) {
        const stageProgress = deployment.deploymentExecutionProgress.deployStageExecutionProgress;
        for (const [stageId, progress] of Object.entries(stageProgress)) {
          if (!stageName || progress.deployStageDisplayName === stageName) {
            logs += `Stage: ${progress.deployStageDisplayName || stageId}\n`;
            logs += `  Status: ${progress.status}\n`;
            logs += `  Started: ${progress.timeStarted || 'N/A'}\n`;
            logs += `  Finished: ${progress.timeFinished || 'In Progress'}\n`;
            logs += '\n';
          }
        }
      }

      return logs;
    } catch (error) {
      throw new Error(`Failed to get deployment logs: ${error}`);
    }
  }

  // ========================================
  // DevOps Artifact Methods
  // ========================================

  async listDeployArtifacts(projectId: string, displayName?: string): Promise<any[]> {
    try {
      const devopsClient = this.getDevopsClient();
      const request: devops.requests.ListDeployArtifactsRequest = {
        projectId,
      };
      if (displayName) {
        request.displayName = displayName;
      }
      const response = await devopsClient.listDeployArtifacts(request);

      return response.deployArtifactCollection?.items || [];
    } catch (error) {
      throw new Error(`Failed to list deploy artifacts: ${error}`);
    }
  }

  async getDeployArtifact(deployArtifactId: string): Promise<any> {
    try {
      const devopsClient = this.getDevopsClient();
      const response = await devopsClient.getDeployArtifact({
        deployArtifactId,
      });

      return response.deployArtifact;
    } catch (error) {
      throw new Error(`Failed to get deploy artifact: ${error}`);
    }
  }

  // ========================================
  // DevOps Repository Methods
  // ========================================

  async listRepositories(projectId: string, name?: string): Promise<any[]> {
    try {
      const devopsClient = this.getDevopsClient();
      const request: devops.requests.ListRepositoriesRequest = {
        projectId,
      };
      if (name) {
        request.name = name;
      }
      const response = await devopsClient.listRepositories(request);

      return response.repositoryCollection?.items || [];
    } catch (error) {
      throw new Error(`Failed to list repositories: ${error}`);
    }
  }

  async getRepository(repositoryId: string): Promise<any> {
    try {
      const devopsClient = this.getDevopsClient();
      const response = await devopsClient.getRepository({
        repositoryId,
      });

      return response.repository;
    } catch (error) {
      throw new Error(`Failed to get repository: ${error}`);
    }
  }

  async listRepositoryRefs(repositoryId: string, refType?: 'BRANCH' | 'TAG'): Promise<any[]> {
    try {
      const devopsClient = this.getDevopsClient();
      const request: devops.requests.ListRefsRequest = {
        repositoryId,
      };
      if (refType) {
        request.refType = refType as devops.requests.ListRefsRequest.RefType;
      }
      const response = await devopsClient.listRefs(request);

      return response.repositoryRefCollection?.items || [];
    } catch (error) {
      throw new Error(`Failed to list repository refs: ${error}`);
    }
  }

  async listRepositoryCommits(
    repositoryId: string,
    refName?: string,
    limit?: number
  ): Promise<any[]> {
    try {
      const devopsClient = this.getDevopsClient();
      const request: devops.requests.ListCommitsRequest = {
        repositoryId,
        limit: limit || 20,
      };
      if (refName) {
        request.refName = refName;
      }
      const response = await devopsClient.listCommits(request);

      return response.repositoryCommitCollection?.items || [];
    } catch (error) {
      throw new Error(`Failed to list repository commits: ${error}`);
    }
  }

  async getRepositoryCommit(repositoryId: string, commitId: string): Promise<any> {
    try {
      const devopsClient = this.getDevopsClient();
      const response = await devopsClient.getCommit({
        repositoryId,
        commitId,
      });

      return response.repositoryCommit;
    } catch (error) {
      throw new Error(`Failed to get repository commit: ${error}`);
    }
  }

  // ========================================
  // DevOps Trigger Methods
  // ========================================

  async listTriggers(projectId: string, displayName?: string): Promise<any[]> {
    try {
      const devopsClient = this.getDevopsClient();
      const request: devops.requests.ListTriggersRequest = {
        projectId,
      };
      if (displayName) {
        request.displayName = displayName;
      }
      const response = await devopsClient.listTriggers(request);

      return response.triggerCollection?.items || [];
    } catch (error) {
      throw new Error(`Failed to list triggers: ${error}`);
    }
  }

  async getTrigger(triggerId: string): Promise<any> {
    try {
      const devopsClient = this.getDevopsClient();
      const response = await devopsClient.getTrigger({
        triggerId,
      });

      return response.trigger;
    } catch (error) {
      throw new Error(`Failed to get trigger: ${error}`);
    }
  }

  // ========================================
  // DevOps Connection Methods
  // ========================================

  async listConnections(projectId: string, connectionType?: string): Promise<any[]> {
    try {
      const devopsClient = this.getDevopsClient();
      const request: devops.requests.ListConnectionsRequest = {
        projectId,
      };
      if (connectionType) {
        request.connectionType = connectionType as devops.requests.ListConnectionsRequest.ConnectionType;
      }
      const response = await devopsClient.listConnections(request);

      return response.connectionCollection?.items || [];
    } catch (error) {
      throw new Error(`Failed to list connections: ${error}`);
    }
  }

  async getConnection(connectionId: string): Promise<any> {
    try {
      const devopsClient = this.getDevopsClient();
      const response = await devopsClient.getConnection({
        connectionId,
      });

      return response.connection;
    } catch (error) {
      throw new Error(`Failed to get connection: ${error}`);
    }
  }

  // ========================================
  // DevOps Environment Methods
  // ========================================

  async listEnvironments(projectId: string, displayName?: string): Promise<any[]> {
    try {
      const devopsClient = this.getDevopsClient();
      const request: devops.requests.ListDeployEnvironmentsRequest = {
        projectId,
      };
      if (displayName) {
        request.displayName = displayName;
      }
      const response = await devopsClient.listDeployEnvironments(request);

      return response.deployEnvironmentCollection?.items || [];
    } catch (error) {
      throw new Error(`Failed to list environments: ${error}`);
    }
  }

  async getEnvironment(deployEnvironmentId: string): Promise<any> {
    try {
      const devopsClient = this.getDevopsClient();
      const response = await devopsClient.getDeployEnvironment({
        deployEnvironmentId,
      });

      return response.deployEnvironment;
    } catch (error) {
      throw new Error(`Failed to get environment: ${error}`);
    }
  }

  // ========================================
  // Container Registry Methods
  // ========================================

  async listContainerRepositories(compartmentId?: string, displayName?: string): Promise<any[]> {
    try {
      const artifactsClient = this.getArtifactsClient();
      const request: artifacts.requests.ListContainerRepositoriesRequest = {
        compartmentId: compartmentId || this.compartmentId,
      };
      if (displayName) {
        request.displayName = displayName;
      }
      const response = await artifactsClient.listContainerRepositories(request);

      return response.containerRepositoryCollection?.items || [];
    } catch (error) {
      throw new Error(`Failed to list container repositories: ${error}`);
    }
  }

  async getContainerRepository(repositoryId: string): Promise<any> {
    try {
      const artifactsClient = this.getArtifactsClient();
      const response = await artifactsClient.getContainerRepository({
        repositoryId,
      });

      return response.containerRepository;
    } catch (error) {
      throw new Error(`Failed to get container repository: ${error}`);
    }
  }

  async listContainerImages(
    compartmentId?: string,
    repositoryName?: string,
    displayName?: string
  ): Promise<any[]> {
    try {
      const artifactsClient = this.getArtifactsClient();
      const request: artifacts.requests.ListContainerImagesRequest = {
        compartmentId: compartmentId || this.compartmentId,
      };
      if (repositoryName) {
        request.repositoryName = repositoryName;
      }
      if (displayName) {
        request.displayName = displayName;
      }
      const response = await artifactsClient.listContainerImages(request);

      return response.containerImageCollection?.items || [];
    } catch (error) {
      throw new Error(`Failed to list container images: ${error}`);
    }
  }

  async getContainerImage(imageId: string): Promise<any> {
    try {
      const artifactsClient = this.getArtifactsClient();
      const response = await artifactsClient.getContainerImage({
        imageId,
      });

      return response.containerImage;
    } catch (error) {
      throw new Error(`Failed to get container image: ${error}`);
    }
  }

  async deleteContainerImage(imageId: string): Promise<void> {
    try {
      const artifactsClient = this.getArtifactsClient();
      await artifactsClient.deleteContainerImage({
        imageId,
      });
    } catch (error) {
      throw new Error(`Failed to delete container image: ${error}`);
    }
  }

  // ========================================
  // DevOps Work Request Methods
  // ========================================

  async listDevopsWorkRequests(compartmentId?: string, projectId?: string): Promise<any[]> {
    try {
      const devopsClient = this.getDevopsClient();
      const request: devops.requests.ListWorkRequestsRequest = {
        compartmentId: compartmentId || this.compartmentId,
      };
      if (projectId) {
        request.projectId = projectId;
      }
      const response = await devopsClient.listWorkRequests(request);

      return response.workRequestCollection?.items || [];
    } catch (error) {
      throw new Error(`Failed to list DevOps work requests: ${error}`);
    }
  }

  async getDevopsWorkRequest(workRequestId: string): Promise<any> {
    try {
      const devopsClient = this.getDevopsClient();
      const response = await devopsClient.getWorkRequest({
        workRequestId,
      });

      return response.workRequest;
    } catch (error) {
      throw new Error(`Failed to get DevOps work request: ${error}`);
    }
  }

  // ========================================
  // Formatting Methods
  // ========================================

  formatInstance(instance: any): any {
    return {
      id: instance.id,
      displayName: instance.displayName,
      lifecycleState: instance.lifecycleState,
      availabilityDomain: instance.availabilityDomain,
      shape: instance.shape,
      timeCreated: instance.timeCreated,
    };
  }

  formatOKECluster(cluster: any): any {
    return {
      id: cluster.id,
      name: cluster.name,
      lifecycleState: cluster.lifecycleState,
      kubernetesVersion: cluster.kubernetesVersion,
      vcnId: cluster.vcnId,
      timeCreated: cluster.timeCreated,
      endpointPublicIp: cluster.endpoints?.publicEndpoint,
      endpointPrivateIp: cluster.endpoints?.privateEndpoint,
    };
  }

  formatCompartment(compartment: any): any {
    return {
      id: compartment.id,
      name: compartment.name,
      description: compartment.description,
      lifecycleState: compartment.lifecycleState,
      timeCreated: compartment.timeCreated,
    };
  }

  formatBastion(bastion: any): any {
    return {
      id: bastion.id,
      name: bastion.name,
      lifecycleState: bastion.lifecycleState,
      targetSubnetId: bastion.targetSubnetId,
      timeCreated: bastion.timeCreated,
    };
  }

  formatNodePool(nodePool: any): any {
    return {
      id: nodePool.id,
      name: nodePool.name,
      lifecycleState: nodePool.lifecycleState,
      kubernetesVersion: nodePool.kubernetesVersion,
      nodeShape: nodePool.nodeShape,
      nodeShapeConfig: nodePool.nodeShapeConfig,
      size: nodePool.nodeConfigDetails?.size,
      timeCreated: nodePool.timeCreated,
    };
  }

  formatDevopsProject(project: any): any {
    return {
      id: project.id,
      name: project.name,
      description: project.description,
      lifecycleState: project.lifecycleState,
      namespace: project.namespace,
      notificationConfig: project.notificationConfig,
      timeCreated: project.timeCreated,
    };
  }

  formatBuildPipeline(pipeline: any): any {
    return {
      id: pipeline.id,
      displayName: pipeline.displayName,
      description: pipeline.description,
      lifecycleState: pipeline.lifecycleState,
      projectId: pipeline.projectId,
      timeCreated: pipeline.timeCreated,
    };
  }

  formatBuildRun(buildRun: any): any {
    return {
      id: buildRun.id,
      displayName: buildRun.displayName,
      lifecycleState: buildRun.lifecycleState,
      buildPipelineId: buildRun.buildPipelineId,
      buildRunSource: buildRun.buildRunSource,
      commitInfo: buildRun.commitInfo,
      timeCreated: buildRun.timeCreated,
      timeUpdated: buildRun.timeUpdated,
    };
  }

  formatDeployPipeline(pipeline: any): any {
    return {
      id: pipeline.id,
      displayName: pipeline.displayName,
      description: pipeline.description,
      lifecycleState: pipeline.lifecycleState,
      projectId: pipeline.projectId,
      timeCreated: pipeline.timeCreated,
    };
  }

  formatDeployment(deployment: any): any {
    return {
      id: deployment.id,
      displayName: deployment.displayName,
      lifecycleState: deployment.lifecycleState,
      deployPipelineId: deployment.deployPipelineId,
      deploymentType: deployment.deploymentType,
      timeCreated: deployment.timeCreated,
      timeUpdated: deployment.timeUpdated,
    };
  }

  formatRepository(repository: any): any {
    return {
      id: repository.id,
      name: repository.name,
      description: repository.description,
      lifecycleState: repository.lifecycleState,
      defaultBranch: repository.defaultBranch,
      httpUrl: repository.httpUrl,
      sshUrl: repository.sshUrl,
      timeCreated: repository.timeCreated,
    };
  }

  formatContainerImage(image: any): any {
    return {
      id: image.id,
      displayName: image.displayName,
      repositoryName: image.repositoryName,
      version: image.version,
      digest: image.digest,
      timeCreated: image.timeCreated,
      compartmentId: image.compartmentId,
    };
  }
}
