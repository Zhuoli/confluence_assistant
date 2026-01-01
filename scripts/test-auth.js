#!/usr/bin/env node

/**
 * Authentication Test Utility
 *
 * Tests authentication for Atlassian and OCI services without MCP protocol.
 * Verifies credentials and connectivity directly using API clients.
 *
 * Usage:
 *   node scripts/test-auth.js atlassian
 *   node scripts/test-auth.js oci
 */

import axios from 'axios';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { config } from 'dotenv';
import os from 'os';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

// Load environment variables
config({ path: join(projectRoot, '.env') });

// ANSI color codes
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

/**
 * Test Atlassian (Jira & Confluence) Authentication
 */
async function testAtlassianAuth() {
  log('\n🔐 Testing Atlassian Authentication', 'blue');
  log('=====================================\n', 'blue');

  const jiraUrl = process.env.JIRA_URL;
  const jiraUsername = process.env.JIRA_USERNAME;
  const jiraToken = process.env.JIRA_API_TOKEN;

  const confluenceUrl = process.env.CONFLUENCE_URL;
  const confluenceUsername = process.env.CONFLUENCE_USERNAME;
  const confluenceToken = process.env.CONFLUENCE_API_TOKEN;

  // Check configuration
  log('📋 Configuration Check:', 'cyan');
  if (!jiraUrl || !jiraUsername || !jiraToken) {
    log('❌ Jira credentials missing in .env file', 'red');
    log('   Required: JIRA_URL, JIRA_USERNAME, JIRA_API_TOKEN', 'yellow');
  } else {
    log(`✅ Jira URL: ${jiraUrl}`, 'green');
    log(`✅ Jira Username: ${jiraUsername}`, 'green');
    log(`✅ Jira Token: ${jiraToken.substring(0, 10)}...`, 'green');
  }

  if (!confluenceUrl || !confluenceUsername || !confluenceToken) {
    log('❌ Confluence credentials missing in .env file', 'red');
    log('   Required: CONFLUENCE_URL, CONFLUENCE_USERNAME, CONFLUENCE_API_TOKEN', 'yellow');
  } else {
    log(`✅ Confluence URL: ${confluenceUrl}`, 'green');
    log(`✅ Confluence Username: ${confluenceUsername}`, 'green');
    log(`✅ Confluence Token: ${confluenceToken.substring(0, 10)}...`, 'green');
  }

  // Test Jira Authentication
  log('\n📋 Test 1: Jira Authentication', 'cyan');
  if (jiraUrl && jiraUsername && jiraToken) {
    try {
      const authHeader = Buffer.from(`${jiraUsername}:${jiraToken}`).toString('base64');
      const response = await axios.get(`${jiraUrl}/rest/api/3/myself`, {
        headers: {
          'Authorization': `Basic ${authHeader}`,
          'Accept': 'application/json',
        },
        timeout: 10000,
      });

      log(`✅ Jira authentication successful!`, 'green');
      log(`   User: ${response.data.displayName} (${response.data.emailAddress})`, 'green');
      log(`   Account ID: ${response.data.accountId}`, 'green');
    } catch (error) {
      log(`❌ Jira authentication failed`, 'red');
      if (error.response) {
        log(`   Status: ${error.response.status} ${error.response.statusText}`, 'red');
        if (error.response.status === 401) {
          log(`   Error: Invalid credentials`, 'red');
        } else if (error.response.status === 404) {
          log(`   Error: URL not found - check JIRA_URL`, 'red');
        }
      } else if (error.code === 'ENOTFOUND') {
        log(`   Error: Cannot resolve hostname - check JIRA_URL`, 'red');
      } else {
        log(`   Error: ${error.message}`, 'red');
      }
    }
  } else {
    log('⏭️  Skipped - missing credentials', 'yellow');
  }

  // Test Confluence Authentication
  log('\n📋 Test 2: Confluence Authentication', 'cyan');
  if (confluenceUrl && confluenceUsername && confluenceToken) {
    try {
      const authHeader = Buffer.from(`${confluenceUsername}:${confluenceToken}`).toString('base64');
      const response = await axios.get(`${confluenceUrl}/rest/api/user/current`, {
        headers: {
          'Authorization': `Basic ${authHeader}`,
          'Accept': 'application/json',
        },
        timeout: 10000,
      });

      log(`✅ Confluence authentication successful!`, 'green');
      log(`   User: ${response.data.displayName} (${response.data.username})`, 'green');
      log(`   User Key: ${response.data.userKey}`, 'green');
    } catch (error) {
      log(`❌ Confluence authentication failed`, 'red');
      if (error.response) {
        log(`   Status: ${error.response.status} ${error.response.statusText}`, 'red');
        if (error.response.status === 401) {
          log(`   Error: Invalid credentials`, 'red');
        } else if (error.response.status === 404) {
          log(`   Error: URL not found - check CONFLUENCE_URL`, 'red');
        }
      } else if (error.code === 'ENOTFOUND') {
        log(`   Error: Cannot resolve hostname - check CONFLUENCE_URL`, 'red');
      } else {
        log(`   Error: ${error.message}`, 'red');
      }
    }
  } else {
    log('⏭️  Skipped - missing credentials', 'yellow');
  }
}

/**
 * Test Oracle Cloud Infrastructure Authentication
 */
async function testOCIAuth() {
  log('\n🔐 Testing OCI Authentication', 'blue');
  log('==============================\n', 'blue');

  try {
    // Dynamically import OCI SDK
    const common = await import('oci-common');
    const identity = await import('oci-identity');

    const region = process.env.OCI_MCP_REGION;
    const compartmentId = process.env.OCI_MCP_COMPARTMENT_ID;
    const tenancyId = process.env.OCI_MCP_TENANCY_ID;
    const configPath = process.env.OCI_MCP_CONFIG_PATH || path.join(os.homedir(), '.oci', 'config');
    const profile = process.env.OCI_MCP_PROFILE || 'DEFAULT';

    // Check configuration
    log('📋 Configuration Check:', 'cyan');
    if (!region || !compartmentId || !tenancyId) {
      log('❌ OCI credentials missing in .env file', 'red');
      log('   Required: OCI_MCP_REGION, OCI_MCP_COMPARTMENT_ID, OCI_MCP_TENANCY_ID', 'yellow');
      return;
    }

    log(`✅ Region: ${region}`, 'green');
    log(`✅ Compartment ID: ${compartmentId}`, 'green');
    log(`✅ Tenancy ID: ${tenancyId}`, 'green');
    log(`✅ Config Path: ${configPath}`, 'green');
    log(`✅ Profile: ${profile}`, 'green');

    // Test OCI Authentication
    log('\n📋 Test 1: OCI Session Token Validation', 'cyan');
    try {
      const provider = new common.ConfigFileAuthenticationDetailsProvider(configPath, profile);

      const identityClient = new identity.IdentityClient({
        authenticationDetailsProvider: provider,
      });
      identityClient.region = region;

      log('⏳ Fetching compartment details...', 'yellow');
      const response = await identityClient.getCompartment({
        compartmentId: compartmentId,
      });

      log(`✅ OCI authentication successful!`, 'green');
      log(`   Compartment: ${response.compartment.name}`, 'green');
      log(`   Description: ${response.compartment.description || 'N/A'}`, 'green');
      log(`   State: ${response.compartment.lifecycleState}`, 'green');
    } catch (error) {
      log(`❌ OCI authentication failed`, 'red');
      if (error.message.includes('ENOENT')) {
        log(`   Error: Config file not found at ${configPath}`, 'red');
        log(`   Solution: Run the following command:`, 'yellow');
        log(`   oci session authenticate --profile-name ${profile} --region ${region}`, 'cyan');
      } else if (error.message.includes('NotAuthenticated') || error.statusCode === 401) {
        log(`   Error: Session token expired or invalid`, 'red');
        log(`   Solution: Refresh your session token:`, 'yellow');
        log(`   oci session authenticate --profile-name ${profile} --region ${region}`, 'cyan');
      } else if (error.statusCode === 404) {
        log(`   Error: Compartment not found or not accessible`, 'red');
        log(`   Check: Verify your compartment ID and permissions`, 'yellow');
      } else {
        log(`   Error: ${error.message}`, 'red');
      }
    }

    // Test Tenancy Access
    log('\n📋 Test 2: OCI Tenancy Access', 'cyan');
    try {
      const provider = new common.ConfigFileAuthenticationDetailsProvider(configPath, profile);
      const identityClient = new identity.IdentityClient({
        authenticationDetailsProvider: provider,
      });
      identityClient.region = region;

      log('⏳ Fetching tenancy details...', 'yellow');
      const response = await identityClient.getTenancy({
        tenancyId: tenancyId,
      });

      log(`✅ Tenancy access successful!`, 'green');
      log(`   Tenancy: ${response.tenancy.name}`, 'green');
      log(`   Home Region: ${response.tenancy.homeRegionKey}`, 'green');
    } catch (error) {
      log(`❌ Tenancy access failed: ${error.message}`, 'red');
    }
  } catch (error) {
    log(`❌ Failed to load OCI SDK: ${error.message}`, 'red');
    log(`   Make sure OCI SDK is installed: npm install`, 'yellow');
  }
}

// Main execution
const testType = process.argv[2];

if (!testType) {
  log('\nUsage: node scripts/test-auth.js <test-type>', 'yellow');
  log('\nAvailable test types:', 'yellow');
  log('  - atlassian  (Test Jira and Confluence authentication)', 'yellow');
  log('  - oci        (Test Oracle Cloud Infrastructure authentication)', 'yellow');
  log('  - all        (Test all authentication methods)\n', 'yellow');
  process.exit(1);
}

async function runTests() {
  if (testType === 'atlassian' || testType === 'all') {
    await testAtlassianAuth();
  }

  if (testType === 'oci' || testType === 'all') {
    await testOCIAuth();
  }

  log('\n✅ Authentication tests completed!\n', 'green');
}

runTests().catch(error => {
  log(`\n❌ Test failed: ${error.message}`, 'red');
  process.exit(1);
});
