import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Génère un serveur autonome dans .next/standalone : l'image Docker finale
  // n'a alors pas besoin des node_modules complets.
  output: "standalone",
  serverExternalPackages: ["better-sqlite3", "exceljs"],

  async redirects() {
    return [
      // La présentation vivait sur /presentation et l'adresse a pu être
      // diffusée ou soumise à un annuaire. Redirection permanente : les
      // robots reportent alors la page d'accueil sur l'ancienne adresse au
      // lieu de la traiter comme disparue.
      { source: "/presentation", destination: "/", permanent: true },
    ];
  },
};

export default nextConfig;
