import fs from 'fs';
import path from 'path';
import { getPool } from './config/database';

async function runMigration() {
  console.log('Starting migration 003...');
  const filePath = path.resolve(__dirname, '../../database/migrations/003_auth_security_upgrades.sql');
  const sqlContent = fs.readFileSync(filePath, 'utf8');

  // Split by GO statement (case insensitive)
  const blocks = sqlContent.split(/\bGO\b/i);

  const pool = await getPool();
  console.log('Connected to SQL Server successfully.');

  for (let i = 0; i < blocks.length; i++) {
    const rawQuery = blocks[i].trim();
    if (!rawQuery) continue;

    // Remove USE shoppingdb if present, since our database config already selects the database
    let query = rawQuery.replace(/USE\s+shoppingdb\s*;?/gi, '');
    query = query.replace(/SET\s+QUOTED_IDENTIFIER\s+(ON|OFF)\s*;?/gi, '');
    
    if (!query.trim()) continue;

    try {
      console.log(`Executing SQL block ${i + 1}...`);
      const result = await pool.request().query(query);
      if (result.recordset) {
        console.log('Result:', result.recordset);
      } else {
        console.log('Block executed successfully.');
      }
    } catch (err) {
      console.error(`❌ Error in SQL block ${i + 1}:`, err);
      throw err;
    }
  }

  console.log('🎉 Migration 003 completed successfully.');
  process.exit(0);
}

runMigration().catch(err => {
  console.error('❌ Migration failed:', err);
  process.exit(1);
});
