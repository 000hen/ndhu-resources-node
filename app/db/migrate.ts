import "dotenv/config";
import { migrate } from 'drizzle-orm/mysql2/migrator';
import db, { connection } from './client.server';
import path from "path";
import { fileURLToPath } from 'url';

console.log("[Migration] Migration Start");

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const migrationPath = path.join(__dirname, "..", "..", './migrations');

console.log("[Migration] Migration Path, migrationPath=" + migrationPath);

await migrate(db, { migrationsFolder: migrationPath });

console.log("[Migration] Disconnect to MySQL Server");
await connection.end();

console.log("[Migration] Migration Applied");