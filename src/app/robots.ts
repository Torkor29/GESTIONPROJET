import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

// Les pages publiques — présentation, référentiels, données, mentions — sont
// destinées à être lues et indexées. Tout ce qui est derrière authentification
// n'a rien à faire dans un index : on l'exclut nommément plutôt que par un
// `Disallow: /` qui emporterait aussi l'accueil.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/api/",
        "/bord",
        "/etudes",
        "/missions",
        "/checklists",
        "/documents",
        "/faq",
        "/pages",
        "/temps",
        "/visites",
        "/ecarts",
        "/actions",
        "/portefeuille",
        "/budget",
        "/indicateurs",
        "/parametres",
        "/centres",
        "/sujets",
        "/data-management",
        "/administration",
        "/safety",
        "/calendrier",
        "/calendrier-global",
        "/invitation/",
      ],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
