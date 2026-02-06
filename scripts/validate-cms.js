import { createClient } from '@sanity/client';
import process from 'node:process';

try {
  process.loadEnvFile();
} catch (e) {
  // .env might not exist
}

const client = createClient({
  projectId: process.env.VITE_SANITY_PROJECT_ID || 'azuef2ua',
  dataset: process.env.VITE_SANITY_DATASET || 'production',
  apiVersion: '2024-01-21',
  useCdn: false,
});

async function validateCMS() {
  console.log('🔍 Validating CMS content integrity...');

  const queries = {
    articles: '*[_type == "article"]',
    industries: '*[_type == "industry"]',
    locations: '*[_type == "location"]',
    projects: '*[_type == "caseStudy"]',
  };

  let hasErrors = false;

  for (const [name, query] of Object.entries(queries)) {
    try {
      const data = await client.fetch(query);
      console.log(`📊 ${name}: Found ${data.length} items.`);

      if (data.length === 0) {
        console.error(`❌ Error: CMS returned 0 ${name}. This might break the build or SEO.`);
        hasErrors = true;
      }
    } catch (err) {
      console.error(`❌ Error fetching ${name}:`, err.message);
      hasErrors = true;
    }
  }

  if (hasErrors) {
    console.error('🛑 CMS Validation failed. Build aborted to prevent deploying broken content.');
    process.exit(1);
  }

  console.log('✅ CMS Content looks good!');
}

validateCMS();
