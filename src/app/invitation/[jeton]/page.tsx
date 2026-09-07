import Link from "next/link";
import { redirect } from "next/navigation";
import { invitationValide } from "@/actions/invitations";
import { estConnecte } from "@/lib/auth";
import { LIBELLES_ROLE } from "@/lib/constantes";
import { Marque } from "@/components/marque";
import FormulaireInvitation from "./formulaire";

export const dynamic = "force-dynamic";

export default async function PageInvitation({
  params,
}: {
  params: Promise<{ jeton: string }>;
}) {
  if (await estConnecte()) redirect("/bord");

  const { jeton } = await params;
  const invitation = await invitationValide(jeton);

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6 py-16">
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-0 h-[400px] w-[700px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent/10 blur-[100px]"
      />

      <div className="relative w-full max-w-sm animate-apparait">
        <div className="text-center">
          <Link href="/" className="inline-flex" aria-label="Vigie Clinique — accueil">
            <Marque />
          </Link>
        </div>

        {invitation ? (
          <>
            <div className="mt-6 text-center">
              <h1 className="font-titre text-2xl font-bold">Bienvenue</h1>
              <p className="mt-1.5 text-sm text-attenue">
                Vous avez été invité en tant que{" "}
                <strong className="text-encre">{LIBELLES_ROLE[invitation.role]}</strong>.
                Choisissez un mot de passe pour créer votre compte.
              </p>
            </div>
            <div className="mt-8">
              <FormulaireInvitation jeton={jeton} email={invitation.email} />
            </div>
          </>
        ) : (
          <div className="carte mt-6 p-6 text-center !shadow-douce">
            <h1 className="font-titre text-xl font-bold">Invitation expirée</h1>
            <p className="mt-2 text-sm text-attenue">
              Ce lien n&apos;est plus valable — il a déjà servi, ou il a plus de
              sept jours. Demandez-en un nouveau à la personne qui vous a invité.
            </p>
            <Link href="/connexion" className="bouton-discret mt-5 inline-flex">
              Aller à la connexion
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}
