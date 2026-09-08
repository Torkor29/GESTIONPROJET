import CarteMission from "./carte-mission";
import type { Etude, SousTache, Tache } from "@/db/schema";

export type LigneMission = {
  tache: Tache;
  etudeNom?: string | null;
  etudeCode?: string | null;
  etudeCouleur?: string | null;
  sousTaches?: SousTache[];
  minutes?: number;
  minutesParEtape?: Record<number, number>;
  chronoEnCours?: boolean;
  chronoSousTacheId?: number | null;
};

export default function TableauMissions({
  lignes,
  etudes,
  afficherEtude = true,
  message = "Aucune mission.",
}: {
  lignes: LigneMission[];
  etudes: Pick<Etude, "id" | "nom">[];
  afficherEtude?: boolean;
  message?: string;
}) {
  if (lignes.length === 0) {
    return <p className="rounded-2xl border border-dashed border-ligne bg-creux/30 p-10 text-center text-sm text-attenue">{message}</p>;
  }

  return (
    <div className="space-y-3">
      {lignes.map((ligne) => (
        <CarteMission
          key={ligne.tache.id}
          tache={ligne.tache}
          etudeNom={ligne.etudeNom}
          etudeCode={ligne.etudeCode}
          etudeCouleur={ligne.etudeCouleur}
          sousTaches={ligne.sousTaches ?? []}
          minutes={ligne.minutes ?? 0}
          minutesParEtape={ligne.minutesParEtape ?? {}}
          chronoEnCours={ligne.chronoEnCours ?? false}
          chronoSousTacheId={ligne.chronoSousTacheId ?? null}
          etudes={etudes}
          afficherEtude={afficherEtude}
        />
      ))}
    </div>
  );
}
