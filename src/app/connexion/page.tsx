import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { aucunCompte, estConnecte } from "@/lib/auth";
import { CadreCompte, EnTeteCompte, LiensCompte } from "@/components/public/cadre-compte";
import FormulaireConnexion from "./formulaire";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { robots: { index: false, follow: false } };

export default async function PageConnexion() {
  if (await estConnecte()) redirect("/bord");
  // Installation neuve : il n'y a encore personne, on va créer le compte.
  if (aucunCompte()) redirect("/inscription");

  return (
    <CadreCompte>
      <EnTeteCompte
        titre="Connexion"
        intro="Retrouvez votre espace de travail."
      />
      <div className="mt-8">
        <FormulaireConnexion />
      </div>
      <LiensCompte actuel="connexion" />
    </CadreCompte>
  );
}
