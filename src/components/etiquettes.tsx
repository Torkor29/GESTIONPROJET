import { LIBELLES_PRIORITE, LIBELLES_STATUT_ETUDE, LIBELLES_STATUT_TACHE, sigleEtude } from "@/lib/format";

/**
 * Les étiquettes puisent dans les quatre couleurs de statut de la charte
 * plutôt que dans la palette Tailwind brute : elles suivent ainsi le thème
 * clair comme sombre sans variante à écrire.
 */
const NEUTRE = "bg-creux text-attenue";

const COULEURS_STATUT_TACHE: Record<string, string> = {
  a_faire: NEUTRE,
  en_cours: "bg-info-voile text-info",
  terminee: "bg-reussite-voile text-reussite",
};

const COULEURS_PRIORITE: Record<string, string> = {
  basse: NEUTRE,
  normale: "bg-attention-voile text-attention",
  haute: "bg-alerte-voile text-alerte",
};

const COULEURS_STATUT_ETUDE: Record<string, string> = {
  active: "bg-reussite-voile text-reussite",
  en_pause: "bg-attention-voile text-attention",
  terminee: "bg-info-voile text-info",
  archivee: NEUTRE,
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

export function PastilleEtude({
  couleur,
  nom,
  code,
}: {
  couleur: string;
  nom?: string;
  code?: string | null;
}) {
  const sigle = nom ? sigleEtude({ nom, code }) : undefined;
  return (
    <span className="inline-flex min-w-0 items-center gap-2 text-sm" title={nom && nom !== sigle ? nom : undefined}>
      <span
        aria-hidden
        className="h-2.5 w-2.5 shrink-0 rounded-full ring-2 ring-inset ring-black/5"
        style={{ backgroundColor: couleur }}
      />
      {sigle && <span className="truncate font-medium">{sigle}</span>}
    </span>
  );
}
