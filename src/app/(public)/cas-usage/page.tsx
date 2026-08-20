import type { Metadata } from "next";
import { HubPublic } from "@/components/article-public";
import { articlesDe } from "@/lib/contenu-public";

export const metadata: Metadata = {
  title: "Cas d'usage — Vigie en recherche clinique",
  description:
    "Oncologie, promotion interne académique, dispositifs médicaux MDR, études de performances IVDR, unité de recherche clinique hospitalière : comment Vigie s'insère dans le travail réel.",
  alternates: { canonical: "/cas-usage" },
};

export default function PageCasUsage() {
  return (
    <HubPublic
      categorie="cas-usage"
      titre="Des situations d'unité, pas des captures d'écran marketing"
      intro="Un essai d'oncologie, une RIPH promotion interne, une investigation de dispositif, une étude de performances IVD ou le portefeuille d'une URC ne se pilotent pas avec le même accent. Les pages suivantes racontent le besoin opérationnel. Aucun résultat médical n'y est présenté ; les études citées en démonstration sont fictives."
      articles={articlesDe("cas-usage")}
    />
  );
}
