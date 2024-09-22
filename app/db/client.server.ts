import { drizzle } from "drizzle-orm/mysql2";
import * as schema from "./schema";
import mysql from 'mysql2/promise';

export const connection = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
});

export default drizzle(connection, { schema, mode: "default" });