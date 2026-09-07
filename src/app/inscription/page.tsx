import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { aucunCompte, estConnecte } from "@/lib/auth";
import { CadreCompte, EnTeteCompte, LiensCompte } from "@/components/public/cadre-compte";
import FormulaireInscription from "./formulaire";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { robots: { index: false, follow: false } };

export default async function PageInscription() {
  if (await estConnecte()) redirect("/bord");

  const premier = aucunCompte();

  return (
    <CadreCompte largeur="md">
      <EnTeteCompte
        titre={premier ? "Créer le premier compte" : "Créer un compte"}
        intro={
          premier
            ? "Nom, adresse, mot de passe : ensuite vous êtes dans l'espace de travail."
            : "Nom, adresse, mot de passe. Un collègue peut aussi être invité depuis Paramètres → Équipe."
        }
      />
      <div className="mt-8">
        <FormulaireInscription />
      </div>
      {premier ? (
        <Link href="/" className="lien-fleche mt-8 justify-center text-efface">
          Découvrir Vigie Clinique
        </Link>
      ) : (
        <LiensCompte actuel="inscription" />
      )}
    </CadreCompte>
  );
}
