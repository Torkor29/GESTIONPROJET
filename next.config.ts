import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Génère un serveur autonome dans .next/standalone : l'image Docker finale
  // n'a alors pas besoin des node_modules complets.
  output: "standalone",
  serverExternalPackages: ["better-sqlite3", "exceljs"],
};

export default nextConfig;
