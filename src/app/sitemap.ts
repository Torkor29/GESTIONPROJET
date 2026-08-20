import type { MetadataRoute } from "next";
import { cheminArticle, tousLesArticles } from "@/lib/contenu-public";
import { REFERENTIELS } from "@/lib/referentiels";
import { SITE_URL } from "@/lib/site";

const PAGES_FIXES: { chemin: string; priorite: number; freq: MetadataRoute.Sitemap[number]["changeFrequency"] }[] = [
  { chemin: "/", priorite: 1, freq: "weekly" },
  { chemin: "/a-propos", priorite: 0.9, freq: "monthly" },
  { chemin: "/fonctionnement", priorite: 0.8, freq: "monthly" },
  { chemin: "/methodologie", priorite: 0.8, freq: "monthly" },
  { chemin: "/comparatif", priorite: 0.7, freq: "monthly" },
  { chemin: "/equipe", priorite: 0.6, freq: "monthly" },
  { chemin: "/metiers", priorite: 0.8, freq: "monthly" },
  { chemin: "/guides", priorite: 0.8, freq: "monthly" },
  { chemin: "/cas-usage", priorite: 0.7, freq: "monthly" },
  { chemin: "/actualites", priorite: 0.8, freq: "weekly" },
  { chemin: "/ressources", priorite: 0.7, freq: "monthly" },
  { chemin: "/glossaire", priorite: 0.8, freq: "monthly" },
  { chemin: "/reglementaire", priorite: 0.9, freq: "monthly" },
  { chemin: "/questions-frequentes", priorite: 0.8, freq: "monthly" },
  { chemin: "/aide", priorite: 0.7, freq: "monthly" },
  { chemin: "/changelog", priorite: 0.5, freq: "monthly" },
  { chemin: "/donnees", priorite: 0.7, freq: "yearly" },
  { chemin: "/securite", priorite: 0.6, freq: "yearly" },
  { chemin: "/hebergement", priorite: 0.6, freq: "yearly" },
  { chemin: "/confidentialite", priorite: 0.5, freq: "yearly" },
  { chemin: "/cgu", priorite: 0.4, freq: "yearly" },
  { chemin: "/accessibilite", priorite: 0.4, freq: "yearly" },
  { chemin: "/contact", priorite: 0.5, freq: "yearly" },
  { chemin: "/mentions-legales", priorite: 0.3, freq: "yearly" },
  { chemin: "/plan-du-site", priorite: 0.4, freq: "monthly" },
  { chemin: "/connexion", priorite: 0.5, freq: "monthly" },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const fixes: MetadataRoute.Sitemap = PAGES_FIXES.map((p) => ({
    url: `${SITE_URL}${p.chemin}`,
    changeFrequency: p.freq,
    priority: p.priorite,
  }));

  const articles: MetadataRoute.Sitemap = tousLesArticles().map((a) => ({
    url: `${SITE_URL}${cheminArticle(a)}`,
    lastModified: a.date ? new Date(a.date) : undefined,
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  const pagesReferentiels: MetadataRoute.Sitemap = REFERENTIELS.map((r) => ({
    url: `${SITE_URL}/reglementaire/${r.cle}`,
    lastModified: new Date(r.verifieLe),
    changeFrequency: "monthly",
    priority: 0.8,
  }));

  return [...fixes, ...articles, ...pagesReferentiels];
}
