import { LIBELLES_PRIORITE, LIBELLES_STATUT_ETUDE, LIBELLES_STATUT_TACHE } from "@/lib/format";

const COULEURS_STATUT_TACHE: Record<string, string> = {
  a_faire: "bg-stone-500/15 text-stone-600 dark:text-stone-300",
  en_cours: "bg-blue-500/15 text-blue-600 dark:text-blue-300",
  terminee: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-300",
};

const COULEURS_PRIORITE: Record<string, string> = {
  basse: "bg-stone-500/15 text-stone-600 dark:text-stone-300",
  normale: "bg-amber-500/15 text-amber-600 dark:text-amber-300",
  haute: "bg-red-500/15 text-red-600 dark:text-red-300",
};

const COULEURS_STATUT_ETUDE: Record<string, string> = {
  active: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-300",
  en_pause: "bg-amber-500/15 text-amber-600 dark:text-amber-300",
  terminee: "bg-blue-500/15 text-blue-600 dark:text-blue-300",
  archivee: "bg-stone-500/15 text-stone-600 dark:text-stone-300",
};

export function EtiquetteStatutTache({ statut }: { statut: string }) {
  return (
    <span className={`etiquette ${COULEURS_STATUT_TACHE[statut] ?? COULEURS_STATUT_TACHE.a_faire}`}>
      {LIBELLES_STATUT_TACHE[statut] ?? statut}
    </span>
  );
}

export function EtiquettePriorite({ priorite }: { priorite: string }) {
  if (priorite === "normale") return null;
  return (
    <span className={`etiquette ${COULEURS_PRIORITE[priorite] ?? COULEURS_PRIORITE.normale}`}>
      {LIBELLES_PRIORITE[priorite] ?? priorite}
    </span>
  );
}

export function EtiquetteStatutEtude({ statut }: { statut: string }) {
  return (
    <span className={`etiquette ${COULEURS_STATUT_ETUDE[statut] ?? COULEURS_STATUT_ETUDE.active}`}>
      {LIBELLES_STATUT_ETUDE[statut] ?? statut}
    </span>
  );
}

export function PastilleEtude({ couleur, nom }: { couleur: string; nom?: string }) {
  return (
    <span className="inline-flex items-center gap-2 text-sm">
      <span
        aria-hidden
        className="h-2.5 w-2.5 shrink-0 rounded-full"
        style={{ backgroundColor: couleur }}
      />
      {nom && <span className="truncate">{nom}</span>}
    </span>
  );
}
