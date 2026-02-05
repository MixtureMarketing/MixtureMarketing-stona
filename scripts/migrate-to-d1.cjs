const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const inputFile = path.join(__dirname, '../serwer322648_mixture (1).sql');

console.log('Starting Step-by-Step Table Migration...');

const sql = fs.readFileSync(inputFile, 'utf8');
const insertRegex = /INSERT INTO `(\w+)` \(([^)]+)\) VALUES\s*([\s\S]+?);/g;

let match;
while ((match = insertRegex.exec(sql)) !== null) {
    const tableName = match[1];
    if (tableName === 'performance_metrics') continue; // Skip for now

    const columns = match[2].split(',').map(c => `"${c.trim().replace(/`/g, '')}"`).join(', ');
    let values = match[3].trim();

    let cleanValues = values
        .replace(/\\'/g, "''")
        .replace(/\\"/g, '"')
        .replace(/\\r\\n/g, '\n')
        .replace(/\\n/g, '\n');

    const tempSqlFile = path.join(__dirname, `../temp_${tableName}.sql`);
    const finalSql = `PRAGMA foreign_keys = OFF;\nINSERT INTO "${tableName}" (${columns}) VALUES ${cleanValues};\nPRAGMA foreign_keys = ON;`;
    
    fs.writeFileSync(tempSqlFile, finalSql);

    console.log(`Importing table "${tableName}"...`);
    try {
        execSync(`npx wrangler d1 execute mixture-db --remote --file=./temp_${tableName}.sql`, { stdio: 'inherit' });
        console.log(`✅ Table "${tableName}" imported successfully.`);
    } catch (err) {
        console.error(`❌ Failed to import table "${tableName}".`);
    }
    
    // Clean up
    fs.unlinkSync(tempSqlFile);
}

console.log('Migration step-by-step finished!');
