import { demarrerChrono } from "@/actions/temps";
import { Icone } from "./icones";
import NoteLigneMission from "./note-ligne-mission";
import { SelecteurStatutLigne } from "./selecteur-statut";
import { avancement, type LigneEtudeMission } from "@/lib/missions";

/** Barre d'avancement d'une mission multi-études : « 7/20 ». */
export function AvancementMission({ lignes }: { lignes: { statut: string }[] }) {
  const a = avancement(lignes);
  return (
    <span className="inline-flex min-w-0 items-center gap-2" title={`${a.faites} étude(s) terminée(s) sur ${a.total}`}>
      <span className="h-1.5 w-16 shrink-0 overflow-hidden rounded-full bg-creux">
        <span
          className="block h-full rounded-full bg-reussite"
          style={{ width: `${a.pourcentage}%` }}
        />
      </span>
      <span className="chiffres shrink-0 text-xs text-attenue">
        {a.faites}/{a.total}
      </span>
    </span>
  );
}

/**
 * Les études d'une mission multi-études, chacune avec son statut et son
 * commentaire, modifiables sur place. Repliée par défaut : sur vingt études,
 * le tableau des missions resterait sinon illisible.
 */
export default function EtudesMission({
  tacheId,
  lignes,
  ouvert = false,
  terminee = false,
}: {
  tacheId: number;
  lignes: LigneEtudeMission[];
  ouvert?: boolean;
  terminee?: boolean;
}) {
  return (
    <details open={ouvert} className="group/etudes mt-1.5">
      <summary className="inline-flex cursor-pointer list-none items-center gap-2 text-xs text-attenue hover:text-encre">
        <span aria-hidden className="transition-transform group-open/etudes:rotate-90">
          ▸
        </span>
        {lignes.length > 1 ? `Détail des ${lignes.length} études` : "Détail de l'étude"}
      </summary>

      <ul className="mt-2 divide-y divide-ligne rounded-xl border border-ligne bg-surface/50">
        {lignes.map((l) => {
          const nom = l.etudeCode ?? l.etudeNom;
          return (
            <li
              key={l.id}
              // Le commentaire passe sous l'étude et son statut : la colonne
              // « Mission » est trop étroite pour tout tenir sur une ligne.
              className="grid grid-cols-[minmax(4.5rem,7rem)_1fr_auto] items-center gap-x-2 px-2.5 py-1.5"
            >
              <span
                className="etiquette max-w-full truncate"
                style={{ backgroundColor: `${l.etudeCouleur}22`, color: l.etudeCouleur }}
                title={l.etudeNom}
              >
                {nom}
              </span>
              <SelecteurStatutLigne id={l.id} statut={l.statut} etude={nom} />
              {!terminee && l.statut !== "terminee" && l.statut !== "sans_objet" ? (
                <form action={demarrerChrono}>
                  <input type="hidden" name="etudeId" value={l.etudeId} />
                  <input type="hidden" name="tacheId" value={tacheId} />
                  <button
                    type="submit"
                    title={`Démarrer le chronomètre sur ${nom}`}
                    aria-label={`Démarrer le chronomètre sur ${nom}`}
                    className="flex h-7 w-7 items-center justify-center rounded-lg text-efface transition hover:bg-relief hover:text-accent"
                  >
                    <Icone nom="chrono" className="h-3.5 w-3.5" />
                  </button>
                </form>
              ) : (
                <span className="w-7" />
              )}
              <span className="col-span-3 -mx-1.5">
                <NoteLigneMission id={l.id} notes={l.notes} etude={nom} />
              </span>
            </li>
          );
        })}
      </ul>
    </details>
  );
}
