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
        intro={
          <>
            Pas de courrier envoyé : il faut la clé d&apos;installation
            (valeur <code className="font-mono">MOT_DE_PASSE</code> du fichier{" "}
            <code className="font-mono">.env</code> sur le serveur) et
            l&apos;adresse du compte.
          </>
        }
      />
      <div className="mt-8">
        <FormulaireMotDePasseOublie />
      </div>
      <LiensCompte actuel="oublie" />
    </CadreCompte>
  );
}
