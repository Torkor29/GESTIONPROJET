import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { aucunCompte, estConnecte } from "@/lib/auth";
import { CadreCompte, EnTeteCompte, LiensCompte } from "@/components/public/cadre-compte";
import FormulaireMotDePasseOublie from "./formulaire";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { robots: { index: false, follow: false } };

export default async function PageMotDePasseOublie() {
  if (await estConnecte()) redirect("/bord");
  if (aucunCompte()) redirect("/inscription");

  return (
    <CadreCompte>
      <EnTeteCompte
        titre="Mot de passe oublié"
        intro="Indiquez l'adresse du compte et choisissez un nouveau mot de passe. Aucun courrier n'est envoyé."
      />
      <div className="mt-8">
        <FormulaireMotDePasseOublie />
      </div>
      <LiensCompte actuel="oublie" />
    </CadreCompte>
  );
}
