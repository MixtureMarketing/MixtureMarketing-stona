const fs = require('fs');
const path = require('path');

const SOURCE_FILE = path.join(__dirname, '../data/content.ts');
const TARGET_DIR = path.join(__dirname, '../data/content');

const MAPPING = {
  'layout.ts': ['NAVBAR_CONTENT', 'FOOTER_CONTENT'],
  'hero.ts': ['HERO_CONTENT', 'LEAD_MAGNET_CONTENT'],
  'home.ts': [
    'WHY_US_CONTENT',
    'CLIENTS_CONTENT',
    'OFFERS_CONTENT',
    'SERVICES_CONTENT',
    'PORTFOLIO_CONTENT',
  ],
  'legal.ts': ['TERMS_CONTENT', 'PRIVACY_POLICY_CONTENT'],
  'services-web.ts': [
    'WEB_DEV_CONTENT',
    'ECOMMERCE_CONTENT',
    'CUSTOM_WEB_APP_CONTENT',
    'CORPORATE_WEBSITE_CONTENT',
    'PREMIUM_WEBSITES_CONTENT',
    'LANDING_PAGE_CONTENT',
  ],
  'services-marketing.ts': [
    'MARKETING_CONTENT',
    'SEO_CONTENT',
    'GOOGLE_ADS_CONTENT',
    'META_ADS_CONTENT',
    'ANALYTICS_CONTENT',
  ],
  'services-design.ts': [
    'DESIGN_BRANDING_CONTENT',
    'BRAND_IDENTITY_CONTENT',
    'UI_UX_DESIGN_CONTENT',
    'PRINT_DESIGN_CONTENT',
    'VISUAL_AUDIT_CONTENT',
    'VISUAL_CONTENT_CONTENT',
  ],
  'knowledge-base.ts': ['KNOWLEDGE_BASE_CONTENT'],
  'tools.ts': ['AI_GENERATOR_CONTENT'],
  'contact.ts': ['CONTACT_PAGE_CONTENT'],
};

// Reverse mapping for easy lookup
const VAR_TO_FILE = {};
Object.entries(MAPPING).forEach(([file, vars]) => {
  vars.forEach((v) => (VAR_TO_FILE[v] = file));
});

function splitContent() {
  if (!fs.existsSync(SOURCE_FILE)) {
    console.error(`❌ Source file not found: ${SOURCE_FILE}`);
    return;
  }

  const content = fs.readFileSync(SOURCE_FILE, 'utf8');
  const lines = content.split('\n');

  const fileBuffers = {};
  Object.keys(MAPPING).forEach((file) => (fileBuffers[file] = []));

  let currentVar = null;
  let currentBlock = [];
  let bracketCount = 0;
  let inBlock = false;

  for (const line of lines) {
    // Detect start of a constant
    const match = line.match(/^export const (\w+) = \{/);

    if (match) {
      if (inBlock) {
        // Error state: nested export or missing bracket
        console.error(`⚠️  Warning: Found new export ${match[1]} while inside ${currentVar}`);
      }
      currentVar = match[1];
      inBlock = true;
      bracketCount = 0;
      currentBlock = [];
    }

    if (inBlock) {
      currentBlock.push(line);

      // Count brackets to find end of object
      const openBrackets = (line.match(/\{/g) || []).length;
      const closeBrackets = (line.match(/\}/g) || []).length;
      bracketCount += openBrackets - closeBrackets;

      // Check if block ended (bracket count back to 0, semicolon usually at end)
      if (
        bracketCount === 0 &&
        (line.trim().endsWith('};') || line.trim() === '};' || line.trim() === '}')
      ) {
        inBlock = false;

        // Save block to appropriate file buffer
        const targetFile = VAR_TO_FILE[currentVar];
        if (targetFile) {
          fileBuffers[targetFile].push(currentBlock.join('\n'));
          console.log(`✅ Extracted ${currentVar} -> ${targetFile}`);
        } else {
          console.log(`ℹ️  Skipped unmapped variable: ${currentVar}`);
        }
        currentVar = null;
        currentBlock = [];
      }
    }
  }

  // Write files
  Object.entries(fileBuffers).forEach(([filename, blocks]) => {
    if (blocks.length > 0) {
      const filePath = path.join(TARGET_DIR, filename);
      // Add standard comment header if needed, but keeping it simple for now
      const fileContent = blocks.join('\n\n');
      fs.writeFileSync(filePath, fileContent, 'utf8');
      console.log(`💾 Saved ${filename}`);
    }
  });

  // Generate index.ts (Barrel file)
  const indexContent = Object.keys(MAPPING)
    .filter((file) => fileBuffers[file].length > 0)
    .map((file) => `export * from './content/${file.replace('.ts', '')}';`)
    .join('\n');

  // We will output this to console to verify, user can then overwrite data/content.ts
  console.log('\n--- Suggested content for data/content.ts ---');
  console.log(indexContent);
}

splitContent();
