"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { inviter, revoquerInvitation } from "@/actions/invitations";
import { LIBELLES_ROLE } from "@/lib/constantes";
import { Icone } from "@/components/icones";

export type LigneInvitation = {
  id: number;
  email: string;
  role: string;
  jeton: string;
  expireLe: number;
};

export type LigneMembre = {
  id: number;
  nom: string;
  email: string;
  role: string;
};

function BoutonInviter() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="bouton" disabled={pending}>
      {pending ? "Création…" : "Créer l'invitation"}
    </button>
  );
}

/**
 * Le lien n'est pas envoyé par courrier : on le copie et on le transmet
 * par ses propres moyens. (Une messagerie SMTP, si elle est configurée,
 * ne sert qu'à prévenir d'une mission attribuée.)
 */
function LienACopier({ jeton }: { jeton: string }) {
  const [copie, setCopie] = useState(false);

  const copier = async () => {
    // `origin` est lu dans le navigateur : le lien porte le domaine réellement
    // utilisé, sans qu'aucune adresse ait à être configurée quelque part.
    const lien = `${window.location.origin}/invitation/${jeton}`;
    try {
      await navigator.clipboard.writeText(lien);
    } catch {
      // Le presse-papiers est refusé hors HTTPS : on montre le lien à la place.
      window.prompt("Copiez ce lien :", lien);
      return;
    }
    setCopie(true);
    setTimeout(() => setCopie(false), 2500);
  };

  return (
    <button type="button" onClick={copier} className="bouton-discret !py-2 text-xs">
      {copie ? "Lien copié ✓" : "Copier le lien"}
    </button>
  );
}

export default function GestionEquipe({
  membres,
  invitationsEnCours,
}: {
  membres: LigneMembre[];
  invitationsEnCours: LigneInvitation[];
}) {
  const [etat, action] = useActionState(inviter, {});
  const [email, setEmail] = useState("");

  return (
    <div className="space-y-8">
      <section>
        <h2 className="sur-titre mb-3">Inviter quelqu&apos;un</h2>
        <form action={action} className="carte space-y-4 p-5">
          <div className="grid gap-4 sm:grid-cols-[1fr_auto]">
            <div>
              <label htmlFor="email" className="mb-1.5 block text-sm font-medium">
                Adresse électronique
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="champ"
                placeholder="collegue@chu-brest.fr"
              />
            </div>
            <div>
              <label htmlFor="role" className="mb-1.5 block text-sm font-medium">
                Métier
              </label>
              <select id="role" name="role" defaultValue="arc" className="champ sm:w-56">
                {Object.entries(LIBELLES_ROLE).map(([cle, libelle]) => (
                  <option key={cle} value={cle}>
                    {libelle}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {etat.erreur && (
            <p role="alert" className="text-sm text-alerte">
              {etat.erreur}
            </p>
          )}
          {etat.message && <p className="text-sm text-reussite">{etat.message}</p>}

          <BoutonInviter />
        </form>
      </section>

      {invitationsEnCours.length > 0 && (
        <section>
          <h2 className="sur-titre mb-3">Invitations en attente</h2>
          <ul className="space-y-2">
            {invitationsEnCours.map((i) => (
              <li
                key={i.id}
                className="carte flex flex-wrap items-center justify-between gap-3 p-4"
              >
                <span className="min-w-0">
                  <span className="block truncate text-sm font-medium">{i.email}</span>
                  <span className="block text-xs text-efface">
                    {LIBELLES_ROLE[i.role]} · expire le{" "}
                    {new Date(i.expireLe * 1000).toLocaleDateString("fr-FR")}
                  </span>
                </span>
                <span className="flex shrink-0 items-center gap-2">
                  <LienACopier jeton={i.jeton} />
                  <form action={revoquerInvitation}>
                    <input type="hidden" name="id" value={i.id} />
                    <button
                      type="submit"
                      title="Révoquer cette invitation"
                      aria-label="Révoquer cette invitation"
                      className="flex h-9 w-9 items-center justify-center rounded-xl text-attenue transition-all duration-200 hover:bg-creux hover:text-alerte active:scale-95"
                    >
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={1.75}
                        strokeLinecap="round"
                        className="h-4 w-4"
                        aria-hidden
                      >
                        <path d="M6 6l12 12M18 6L6 18" />
                      </svg>
                    </button>
                  </form>
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section>
        <h2 className="sur-titre mb-3">Comptes de cette installation</h2>
        <ul className="space-y-2">
          {membres.map((m) => (
            <li key={m.id} className="carte flex items-center gap-3 p-4">
              <span
                aria-hidden
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent-voile font-titre text-xs font-bold text-accent-appuye"
              >
                {m.nom
                  .split(/\s+/)
                  .filter(Boolean)
                  .slice(0, 2)
                  .map((x) => x[0]?.toUpperCase() ?? "")
                  .join("")}
              </span>
              <span className="min-w-0">
                <span className="block truncate text-sm font-semibold">{m.nom}</span>
                <span className="block truncate text-xs text-efface">
                  {m.email} · {LIBELLES_ROLE[m.role]}
                </span>
              </span>
            </li>
          ))}
        </ul>
      </section>

      <p className="flex items-start gap-2.5 text-sm text-attenue">
        <Icone nom="bouclier" className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
        Créer un compte ne donne accès à rien : chacun ne voit que ses propres
        études, et celles auxquelles il a été convié depuis la fiche de
        l&apos;étude.
      </p>
    </div>
  );
}
