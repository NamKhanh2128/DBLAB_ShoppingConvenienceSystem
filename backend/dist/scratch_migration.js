"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const database_1 = require("./config/database");
async function runMigration() {
    console.log('Starting migration 003...');
    const filePath = path_1.default.resolve(__dirname, '../../database/migrations/003_auth_security_upgrades.sql');
    const sqlContent = fs_1.default.readFileSync(filePath, 'utf8');
    // Split by GO statement (case insensitive)
    const blocks = sqlContent.split(/\bGO\b/i);
    const pool = await (0, database_1.getPool)();
    console.log('Connected to SQL Server successfully.');
    for (let i = 0; i < blocks.length; i++) {
        const rawQuery = blocks[i].trim();
        if (!rawQuery)
            continue;
        // Remove USE shoppingdb if present, since our database config already selects the database
        let query = rawQuery.replace(/USE\s+shoppingdb\s*;?/gi, '');
        query = query.replace(/SET\s+QUOTED_IDENTIFIER\s+(ON|OFF)\s*;?/gi, '');
        if (!query.trim())
            continue;
        try {
            console.log(`Executing SQL block ${i + 1}...`);
            const result = await pool.request().query(query);
            if (result.recordset) {
                console.log('Result:', result.recordset);
            }
            else {
                console.log('Block executed successfully.');
            }
        }
        catch (err) {
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
