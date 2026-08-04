import type { Config } from "drizzle-kit";

export default {
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dialect: "sqlite",
  dbCredentials: {
    url: process.env.CHEMIN_BASE ?? "./data/gestionprojet.db",
  },
} satisfies Config;
