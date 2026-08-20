import type { Metadata } from "next";
import { HubPublic } from "@/components/article-public";
import { articlesDe } from "@/lib/contenu-public";

export const metadata: Metadata = {
  title: "Métiers de la recherche clinique — Vigie",
  description:
    "Chef de projet, ARC, data manager, TEC, investigateur, promoteur : ce que chaque métier voit dans Vigie, outil de gestion de projet en recherche clinique hospitalière.",
  alternates: { canonical: "/metiers" },
};

export default function PageMetiers() {
  return (
    <HubPublic
      categorie="metiers"
      titre="Chaque métier a sa vue, pas le même bruit"
      intro="Un investigateur n'a pas besoin du portefeuille de l'unité. Un data manager n'a pas besoin du calendrier de toutes les visites ARC. Vigie part du métier déclaré, puis des études auxquelles on vous a convié. Les pages ci-dessous décrivent le quotidien de chaque rôle, sans prétendre qu'un logiciel remplace la formation."
      articles={articlesDe("metiers")}
    />
  );
}
