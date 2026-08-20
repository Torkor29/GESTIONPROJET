import fs from "node:fs";
import path from "node:path";
import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import * as schema from "./schema";

const chemin = process.env.CHEMIN_BASE ?? path.join(process.cwd(), "data", "gestionprojet.db");
fs.mkdirSync(path.dirname(chemin), { recursive: true });

const sqlite = new Database(chemin);
// WAL : lectures et écritures simultanées sans blocage, et base bien plus
// robuste en cas de coupure de courant sur le VPS.
sqlite.pragma("journal_mode = WAL");
sqlite.pragma("foreign_keys = ON");
sqlite.pragma("busy_timeout = 5000");

export const db = drizzle(sqlite, { schema });

// Les migrations tournent au démarrage : un `docker compose up` suffit à
// mettre la base à jour, il n'y a aucune commande à lancer à la main.
const dossierMigrations = path.join(process.cwd(), "drizzle");
if (fs.existsSync(dossierMigrations)) {
  migrate(db, { migrationsFolder: dossierMigrations });
}

if (process.env.CHARGER_DEMO === "1") {
  // Différé : le seed importe `db`, qui n'est exporté qu'une fois ce module fini.
  setImmediate(() => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    require("./seed").chargerDonneesDemoSiBesoin();
  });
}

export { schema };
