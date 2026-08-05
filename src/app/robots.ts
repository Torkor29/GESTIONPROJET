import type { MetadataRoute } from "next";

// La page de présentation est publique et destinée à être indexée ; tout le
// reste est derrière authentification et n'a rien à faire dans un index.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: ["/presentation", "/connexion"],
      disallow: ["/api/", "/etudes", "/missions", "/documents", "/faq", "/pages", "/temps"],
    },
  };
}
