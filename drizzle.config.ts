import type { Config } from "drizzle-kit";

export default {
    dialect: "mysql",
    schema: "./app/db/schema.ts",
    out: "./migrations",
} satisfies Config;