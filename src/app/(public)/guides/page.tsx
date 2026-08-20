import type { Metadata } from "next";
import { HubPublic } from "@/components/article-public";
import { articlesDe } from "@/lib/contenu-public";

export const metadata: Metadata = {
  title: "Guides d'utilisation — Vigie, recherche clinique",
  description:
    "Guides pratiques : démarrer une étude, ouvrir un centre, suivre un Subject ID, gérer les queries, le monitoring, le TMF, les CAPA et les droits d'accès.",
  alternates: { canonical: "/guides" },
};

export default function PageGuides() {
  return (
    <HubPublic
      categorie="guides"
      titre="Guides pour prendre l'outil en main"
      intro="Ces guides décrivent le fil opérationnel : créer l'étude, ouvrir un centre, identifier un sujet sans collecter son nom, faire vivre une query, documenter une visite de monitoring, classer un TMF, suivre une CAPA, inviter quelqu'un. Ils ne remplacent pas le protocole de l'essai ni une SOP d'établissement."
      articles={articlesDe("guides")}
    />
  );
}
