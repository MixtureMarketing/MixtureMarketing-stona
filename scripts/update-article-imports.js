import fs from 'fs';
import path from 'path';

const articlesDir = 'components/articles';
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

const files = fs.readdirSync(articlesDir);

for (const file of files) {
  if (file.endsWith('.tsx')) {
    const filePath = path.join(articlesDir, file);
    let content = fs.readFileSync(filePath, 'utf8');

    // Pattern 1: import { X as CONTENT } from '../../data/articles-content';
    // Pattern 2: import { X } from '../../data/articles-content';

    const importRegex =
      /import\s+\{\s*(\w+)(\s+as\s+\w+)?\s*\}\s+from\s+'\.\.\/\.\.\/data\/articles-content';/g;

    content = content.replace(importRegex, (match, p1, p2) => {
      const fileName = nameMap[p1];
      if (fileName) {
        return `import { ${p1}${p2 || ''} } from '../../data/content/articles/${fileName.replace('.ts', '')}';`;
      }
      return match;
    });

    fs.writeFileSync(filePath, content);
    console.log(`Updated ${file}`);
  }
}
