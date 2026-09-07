import type { NextConfig } from "next";

/**
 * Hôtes publics derrière lesquels Next.js tourne (Caddy, ou un proxy commun).
 * Sans cette liste, une action de formulaire — connexion comprise — peut être
 * refusée : l'origine vue par le navigateur ne correspond pas à l'hôte interne.
 */
function originesActions(): string[] {
  const brut = (process.env.DOMAINE ?? "").trim();
  if (!brut || brut.startsWith(":")) return [];
  const hote = brut.replace(/^https?:\/\//, "").replace(/\/.*$/, "").replace(/:\d+$/, "");
  if (!hote) return [];
  return hote.startsWith("www.") ? [hote, hote.slice(4)] : [hote, `www.${hote}`];
}

const nextConfig: NextConfig = {
  // Génère un serveur autonome dans .next/standalone : l'image Docker finale
  // n'a alors pas besoin des node_modules complets.
  output: "standalone",
  serverExternalPackages: ["better-sqlite3", "exceljs"],
  experimental: {
    serverActions: {
      allowedOrigins: originesActions(),
    },
  },

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
