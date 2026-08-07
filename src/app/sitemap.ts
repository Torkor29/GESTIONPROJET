import type { MetadataRoute } from "next";
import { REFERENTIELS } from "@/lib/referentiels";
import { SITE_URL } from "@/lib/site";

/**
 * Plan du site, limité aux pages publiques.
 *
 * Il n'existait pas : `/sitemap.xml` répondait 404, ce qui prive un robot du
 * seul moyen simple de découvrir les pages autres que l'accueil.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const fixes: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, changeFrequency: "monthly", priority: 1 },
    { url: `${SITE_URL}/reglementaire`, changeFrequency: "monthly", priority: 0.9 },
    { url: `${SITE_URL}/donnees`, changeFrequency: "yearly", priority: 0.7 },
    { url: `${SITE_URL}/mentions-legales`, changeFrequency: "yearly", priority: 0.3 },
  ];

  // La page de connexion n'est volontairement pas listée : c'est un
  // formulaire de quelques mots, et l'annoncer tirerait vers le bas
  // l'appréciation d'un moteur qui échantillonne le plan du site.

  // Chaque référentiel porte la date à laquelle son contenu a été vérifié :
  // c'est exactement la date de dernière modification utile ici.
  const pagesReferentiels: MetadataRoute.Sitemap = REFERENTIELS.map((r) => ({
    url: `${SITE_URL}/reglementaire/${r.cle}`,
    lastModified: new Date(r.verifieLe),
    changeFrequency: "monthly",
    priority: 0.8,
  }));

  return [...fixes, ...pagesReferentiels];
}
