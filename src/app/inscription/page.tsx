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
          premier ? (
            <>
              C&apos;est le premier compte de cette installation. Il faut la clé
              d&apos;installation, celle du fichier <code className="font-mono">.env</code>{" "}
              sur le serveur.
            </>
          ) : (
            <>
              La clé d&apos;installation — valeur{" "}
              <code className="font-mono">MOT_DE_PASSE</code> du fichier{" "}
              <code className="font-mono">.env</code> — ouvre un compte. Un
              collègue sans cette clé se fait inviter depuis Paramètres → Équipe.
            </>
          )
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
