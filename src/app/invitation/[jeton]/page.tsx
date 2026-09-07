import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { invitationValide } from "@/actions/invitations";
import { estConnecte } from "@/lib/auth";
import { LIBELLES_ROLE } from "@/lib/constantes";
import { CadreCompte, EnTeteCompte } from "@/components/public/cadre-compte";
import FormulaireInvitation from "./formulaire";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { robots: { index: false, follow: false } };

export default async function PageInvitation({
  params,
}: {
  params: Promise<{ jeton: string }>;
}) {
  if (await estConnecte()) redirect("/bord");

  const { jeton } = await params;
  const invitation = await invitationValide(jeton);

  return (
    <CadreCompte>
      {invitation ? (
        <>
          <EnTeteCompte
            titre="Bienvenue"
            intro={
              <>
                Vous avez été invité en tant que{" "}
                <strong className="text-encre">{LIBELLES_ROLE[invitation.role]}</strong>.
                Choisissez un mot de passe pour créer votre compte.
              </>
            }
          />
          <div className="mt-8">
            <FormulaireInvitation jeton={jeton} email={invitation.email} />
          </div>
        </>
      ) : (
        <>
          <EnTeteCompte titre="Invitation expirée" />
          <div className="carte mt-6 p-6 text-center !shadow-douce">
            <p className="text-[14px] leading-[1.35] text-attenue">
              Ce lien n&apos;est plus valable — il a déjà servi, ou il a plus de
              sept jours. Demandez-en un nouveau à la personne qui vous a invité.
            </p>
            <Link href="/connexion" className="bouton-discret mt-5 inline-flex">
              Aller à la connexion
            </Link>
          </div>
        </>
      )}
    </CadreCompte>
  );
}
