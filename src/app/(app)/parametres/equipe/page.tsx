import Link from "next/link";
import { redirect } from "next/navigation";
import { and, desc, eq, isNull } from "drizzle-orm";
import { db } from "@/db";
import { invitations, utilisateurs } from "@/db/schema";
import { utilisateurActuel } from "@/lib/auth";
import GestionEquipe from "@/components/gestion-equipe";

export const dynamic = "force-dynamic";

export default async function PageEquipe() {
  const compte = await utilisateurActuel();
  if (!compte) redirect("/connexion");

  const [membres, enAttente] = await Promise.all([
    db
      .select({
        id: utilisateurs.id,
        nom: utilisateurs.nom,
        email: utilisateurs.email,
        role: utilisateurs.role,
      })
      .from(utilisateurs)
      .where(eq(utilisateurs.actif, true))
      .orderBy(utilisateurs.nom),
    db
      .select({
        id: invitations.id,
        email: invitations.email,
        role: invitations.role,
        jeton: invitations.jeton,
        expireLe: invitations.expireLe,
      })
      .from(invitations)
      .where(isNull(invitations.utiliseeLe))
      .orderBy(desc(invitations.creeLe)),
  ]);

  // Une invitation périmée ne sert plus à rien : on ne l'affiche pas.
  const maintenant = Math.floor(Date.now() / 1000);
  const valides = enAttente.filter((i) => i.expireLe > maintenant);

  return (
    <div className="space-y-8">
      <header>
        <p className="sur-titre">
          <Link href="/parametres" className="transition-colors hover:text-accent">
            Paramètres
          </Link>{" "}
          · Équipe
        </p>
        <h1 className="mt-1.5 font-titre text-3xl font-bold">Équipe</h1>
        <p className="mt-2 max-w-2xl text-attenue">
          Invitez vos collègues à créer un compte sur cette installation. Le lien
          d&apos;invitation se copie et se transmet par vos propres moyens —
          l&apos;application n&apos;envoie aucun courrier, et ne confie donc
          aucune adresse à un tiers.
        </p>
      </header>

      <GestionEquipe membres={membres} invitationsEnCours={valides} />
    </div>
  );
}
