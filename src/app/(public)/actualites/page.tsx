import type { Metadata } from "next";
import { HubPublic } from "@/components/article-public";
import { articlesDe } from "@/lib/contenu-public";

export const metadata: Metadata = {
  title: "Articles — gestion de projet en recherche clinique",
  description:
    "Articles de fond : tableur contre outil dédié, cycle des queries, Subject ID et RGPD, checklists réglementaires, monitoring basé sur le risque, auto-hébergement à l'hôpital.",
  alternates: { canonical: "/actualites" },
};

export default function PageActualites() {
  return (
    <HubPublic
      categorie="actualites"
      titre="Notes de terrain, pas un blog promotionnel"
      intro="Ces textes expliquent des choix de conception : pourquoi pas de nom de patient, pourquoi cinq états de query, pourquoi des checklists datées plutôt que « conformes », pourquoi un serveur interne. Ils s'adressent aux équipes de recherche clinique et aux informaticiens d'établissement."
      articles={articlesDe("actualites")}
    />
  );
}
