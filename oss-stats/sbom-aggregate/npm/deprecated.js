import fs from 'fs';
import path from 'path';
import fetch from 'node-fetch';
import csv from 'csv-parser';
import { createObjectCsvWriter } from 'csv-writer';
import pLimit from 'p-limit';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create output directory if it doesn't exist
const inputDir = '/Users/sprak/Documents/mojaloop/SBOM-04:2025/csv';
//const outputDir = '/Users/sprak/Documents/mojaloop/SBOM-04:2025/sbom-publish';
const outputDir = '/Users/sprak/Documents/mojaloop/SBOM-04:2025/SBOM-04-2025';

if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
}

// Concurrency limit — tweak this if needed
const limit = pLimit(10);

const ML_REPO_LIST = [
    "account-lookup-bc-sbom",
    "accounts-and-balances-bc-sbom",
    "alias-oracle-sbom",
    "als-consent-oracle-sbom",
    "als-oracle-pathfinder-sbom",
    "api-snippets-sbom",
    "apm-agent-nodejs-opentracing-sbom",
    "apm-agent-nodejs-sbom",
    "auditing-bc-sbom",
    "auth-service-sbom",
    "beneficiary-management-system-svc-sbom",
    "beneficiary-registration-portal-frontend-sbom",
    "bulk-api-adapter-sbom",
    "business-operations-framework-docs-sbom",
    "callback-handler-simulator-svc-sbom",
    "central-event-processor-sbom",
    "central-ledger-sbom",
    "central-object-store-sbom",
    "central-services-auth-sbom",
    "central-services-database-sbom",
    "central-services-error-handling-sbom",
    "central-services-health-sbom",
    "central-services-logger-sbom",
    "central-services-metrics-sbom",
    "central-services-shared-sbom",
    "central-services-stream-sbom",
    "central-settlement-sbom",
    "cert-management-bc-sbom",
    "ci-config-orb-build-sbom",
    "contrib-fido-test-ui-sbom",
    "contrib-mojawallet-demo-sbom",
    "contrib-pisp-demo-svc-sbom",
    "database-lib-sbom",
    "documentation-sbom",
    "email-notifier-sbom",
    "event-sdk-sbom",
    "event-sidecar-sbom",
    "event-stream-processor-sbom",
    "finance-portal-lib-sbom",
    "finance-portal-ui-sbom",
    "foreign-exchange-bc-sbom",
    "fx-converter-template-sbom",
    "gsp-connector-sbom",
    "haproxy-helm-charts-sbom",
    "image-watcher-svc-sbom",
    "interop-apis-bc-sbom",
    "logging-bc-sbom",
    "merchant-registry-svc-sbom",
    "mifos-core-connector-sbom",
    "ml-api-adapter-sbom",
    "ml-core-test-harness-sbom",
    "ml-iso-hackathon-sbom",
    "ml-number-sbom",
    "ml-operator-sbom",
    "ml-oss-sandbox-sbom",
    "ml-testing-toolkit-client-lib-sbom",
    "ml-testing-toolkit-sbom",
    "ml-testing-toolkit-shared-lib-sbom",
    "mojaloop-adapter-sbom",
    "mojaloop-business-docs-sbom",
    "mojaloop-specification-sbom",
    "mojaloop.github.io-sbom",
    "node-version-checker-sbom",
    "object-store-lib-sbom",
    "operator-settlement-sbom",
    "oracle-shared-library-sbom",
    "participants-bc-sbom",
    "payment-token-adapter-sbom",
    "pisp-project-sbom",
    "platform-configuration-bc-sbom",
    "platform-shared-lib-sbom",
    "platform-shared-tools-sbom",
    "poc-architecture-sbom",
    "quoting-bc-sbom",
    "reference-architecture-doc-sbom",
    "reporting-bc-sbom",
    "reporting-events-processor-svc-sbom",
    "reporting-hub-bop-api-svc-sbom",
    "reporting-hub-bop-experience-api-svc-sbom",
    "reporting-sbom",
    "role-assignment-service-sbom",
    "scheduling-bc-sbom",
    "sdk-core-connector-openpayments-api-svc-sbom",
    "sdk-core-connector-rafiki-api-svc-sbom",
    "sdk-standard-components-sbom",
    "security-bc-sbom",
    "security-rbac-tests-sbom",
    "security-role-perm-operator-svc-sbom",
    "settlement-management-sbom",
    "settlements-bc-sbom",
    "simulator-kafka-sbom",
    "simulator-sbom",
    "testing-toolkit-test-cases-sbom",
    "thirdparty-api-bc-sbom",
    "thirdparty-api-svc-sbom",
    "thirdparty-sdk-sbom",
    "transaction-requests-service-sbom",
    "transfers-bc-sbom",
    "typescript-bc-template-sbom",
    "typescript-svc-template-sbom"
  ];

async function checkPackageStatus(packageName, version) {
    try {
        console.log(`📡 Checking status for: ${packageName}@${version}`);
        
        // First try npm registry
        const npmResponse = await fetch(`https://registry.npmjs.org/${packageName}`);
        if (npmResponse.ok) {
            const data = await npmResponse.json();
            
            // Check if this specific version exists and is deprecated
            if (data.versions && data.versions[version]) {
                const versionData = data.versions[version];
                if (versionData.deprecated) {
                    console.log(`⚠️ Version ${version} is deprecated in npm: ${packageName}`);
                    return {
                        deprecated_status: 'DEPRECATED',
                        publish_details: data.time?.[version] || '',
                        reason: versionData.deprecated
                    };
                }
                
                console.log(`✅ Package is active in npm: ${packageName}@${version}`);
                return {
                    deprecated_status: 'active',
                    publish_details: data.time?.[version] || '',
                    reason: 'Active in npm registry'
                };
            }
        }

        // If it's a Mojaloop package, check if it's a private package
        if (packageName.startsWith('@mojaloop/')) {
            console.log(`🔍 Checking Mojaloop package: ${packageName}`);
            const repoName = packageName.replace('@mojaloop/', '');
            
            // Try to get package info from GitHub
            const githubResponse = await fetch(`https://api.github.com/repos/mojaloop/${repoName}`);
            if (githubResponse.ok) {
                const repoData = await githubResponse.json();
                if (!repoData.archived) {
                    return {
                        deprecated_status: 'active',
                        publish_details: repoData.updated_at || '',
                        reason: 'Active Mojaloop package (private)'
                    };
                } else {
                    return {
                        deprecated_status: 'DEPRECATED',
                        publish_details: repoData.updated_at || '',
                        reason: 'Archived Mojaloop package'
                    };
                }
            }
        }

        // If we get here, the package wasn't found in npm or isn't a recognized Mojaloop package
        console.log(`📦 Package not found in registries: ${packageName}`);
        return {
            deprecated_status: 'unknown',
            publish_details: '',
            reason: 'Package not found in npm registry or Mojaloop repositories'
        };
    } catch (err) {
        console.error(`❌ Error checking ${packageName}@${version}:`, err.message);
        return {
            deprecated_status: 'unknown',
            publish_details: '',
            reason: `Error: ${err.message}`
        };
    }
}

async function processCsv(repo) {
    const inputFile = path.join(inputDir, `${repo}.csv`);
    const outputFile = path.join(outputDir, `${repo}_processed.csv`);

    if (!fs.existsSync(inputFile)) {
        console.log(`⚠️ Input file not found: ${inputFile}`);
        return;
    }

    console.log(`\n🔍 Processing ${repo}...`);
    
    const records = [];
    const headers = [];

    await new Promise((resolve, reject) => {
        fs.createReadStream(inputFile)
            .pipe(csv())
            .on('headers', (h) => headers.push(...h))
            .on('data', (row) => records.push(row))
            .on('end', resolve)
            .on('error', reject);
    });

    const csvWriter = createObjectCsvWriter({
        path: outputFile,
        header: [
            ...headers.map(h => ({ id: h, title: h })),
            { id: 'publish_details', title: 'publish_details' },
            { id: 'deprecated_status', title: 'deprecated_status' },
            { id: 'reason', title: 'reason' }
        ]
    });

    for (const row of records) {
        const bomRef = row['bom_ref'];
        if (!bomRef) {
            console.log(`⚠️ Skipping record - missing bom_ref`);
            row.deprecated_status = 'unknown';
            row.publish_details = '';
            row.reason = 'Missing bom_ref';
            continue;
        }

        const parts = bomRef.split('|');
        const packageInfo = parts[parts.length - 1];
        const lastAtIndex = packageInfo.lastIndexOf('@');
        
        if (lastAtIndex === -1) {
            row.deprecated_status = 'unknown';
            row.publish_details = '';
            row.reason = 'Invalid package format';
            continue;
        }
        
        const packageName = packageInfo.substring(0, lastAtIndex);
        const version = packageInfo.substring(lastAtIndex + 1);
        
        const { deprecated_status, publish_details, reason } = await checkPackageStatus(packageName, version);
        row.deprecated_status = deprecated_status;
        row.publish_details = publish_details;
        row.reason = reason;
    }

    await csvWriter.writeRecords(records);
    console.log(`\n✅ Finished processing: ${repo} -> ${outputFile}`);
}

console.log(`🚀 Starting to process ${ML_REPO_LIST.length} repositories...`);

try {
    await Promise.all(
        ML_REPO_LIST.map(repo => limit(() => processCsv(repo)))
    );
    console.log('✨ All repositories processed successfully!');
} catch (error) {
    console.error('❌ Error during processing:', error);
}
