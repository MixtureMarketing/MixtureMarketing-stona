import fs from 'fs';
import path from 'path';

const inputPath = 'data/articles-content.ts';
const outputDir = 'data/content/articles';

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

const content = fs.readFileSync(inputPath, 'utf8');
const lines = content.split('\n');

let currentFile = '';
let currentContent = [];
let exportName = '';

const nameMap = {
  REACT_ARTICLE_CONTENT: 'react.ts',
  NEXTJS_ARTICLE_CONTENT: 'nextjs.ts',
  NODE_ARTICLE_CONTENT: 'node.ts',
  TYPESCRIPT_ARTICLE_CONTENT: 'typescript.ts',
  BACKEND_COMPENDIUM_CONTENT: 'backend-compendium.ts',
  DATABASE_COMPENDIUM_CONTENT: 'database-compendium.ts',
  DOCKER_ARTICLE_CONTENT: 'docker.ts',
  DEVOPS_ARTICLE_CONTENT: 'devops.ts',
  POSTGRES_ARTICLE_CONTENT: 'postgres.ts',
  VUE_ARTICLE_CONTENT: 'vue.ts',
  PYTHON_ARTICLE_CONTENT: 'python.ts',
  LARAVEL_ARTICLE_CONTENT: 'laravel.ts',
  GO_ARTICLE_CONTENT: 'go.ts',
  MONGO_ARTICLE_CONTENT: 'mongo.ts',
  REDIS_ARTICLE_CONTENT: 'redis.ts',
  ELASTICSEARCH_ARTICLE_CONTENT: 'elasticsearch.ts',
  FRONTEND_ARTICLE_CONTENT: 'frontend.ts',
  CICD_ARTICLE_CONTENT: 'cicd.ts',
  CWV_ARTICLE_CONTENT: 'cwv.ts',
  GOOGLE_ADS_ARTICLE_CONTENT: 'google-ads.ts',
  HEADLESS_ARTICLE_CONTENT: 'headless.ts',
  CDN_ARTICLE_CONTENT: 'cdn.ts',
  IMAGE_FORMATS_ARTICLE_CONTENT: 'image-formats.ts',
  UX_AUDIT_ARTICLE_CONTENT: 'ux-audit.ts',
  TAILWIND_ARTICLE_CONTENT: 'tailwind.ts',
  WAF_ARTICLE_CONTENT: 'waf.ts',
  EDGE_COMPUTING_ARTICLE_CONTENT: 'edge-computing.ts',
  SST_ARTICLE_CONTENT: 'sst.ts',
};

for (const line of lines) {
  const match = line.match(/^export const (\w+_CONTENT) = {/);
  if (match) {
    if (exportName) {
      // Save previous
      const fileName = nameMap[exportName];
      if (fileName) {
        fs.writeFileSync(path.join(outputDir, fileName), currentContent.join('\n'));
        console.log(`Saved ${fileName}`);
      }
    }
    exportName = match[1];
    currentContent = [line];
  } else if (exportName) {
    currentContent.push(line);
  }
}

// Save last
if (exportName) {
  const fileName = nameMap[exportName];
  if (fileName) {
    fs.writeFileSync(path.join(outputDir, fileName), currentContent.join('\n'));
    console.log(`Saved ${fileName}`);
  }
}
