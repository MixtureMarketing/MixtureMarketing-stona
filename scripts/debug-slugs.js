import { createClient } from '@sanity/client';
import process from 'node:process';

try {
  process.loadEnvFile();
} catch (e) {}

const client = createClient({
  projectId: process.env.VITE_SANITY_PROJECT_ID || 'azuef2ua',
  dataset: process.env.VITE_SANITY_DATASET || 'production',
  apiVersion: '2024-01-21',
  useCdn: false,
});

async function checkSlugs() {
  const industries = await client.fetch('*[_type == "industry"]{ "slug": slug.current, name }');
  console.log('Industries in Sanity:');
  console.log(JSON.stringify(industries, null, 2));
}

checkSlugs();
