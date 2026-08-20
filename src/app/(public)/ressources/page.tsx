import type { Metadata } from "next";
import { HubPublic } from "@/components/article-public";
import { articlesDe } from "@/lib/contenu-public";

export const metadata: Metadata = {
  title: "Ressources et listes de contrôle — Vigie",
  description:
    "Aide-mémoire d'unité : ouverture de centre, clôture d'étude, trame de compte rendu de visite de monitoring, questions avant un database lock.",
  alternates: { canonical: "/ressources" },
};

export default function PageRessources() {
  return (
    <HubPublic
      categorie="ressources"
      titre="Listes à adapter, pas des SOP opposables"
      intro="Des aide-mémoire pour l'ouverture d'un centre, la clôture, le compte rendu de visite et la réunion de lock. Recopiez-les dans une SOP d'établissement si vous le souhaitez, datez-les, faites-les relire. Sur ce site, elles n'ont aucune valeur réglementaire."
      articles={articlesDe("ressources")}
    />
  );
}
