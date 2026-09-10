import CarteMission from "./carte-mission";
import { droitsSurMission } from "@/lib/attribution";
import type { CompteChoix, MembreAttribution } from "@/lib/attribution";
import type { Etude, SousTache, Tache } from "@/db/schema";

export type LigneMission = {
  tache: Tache;
  etudeNom?: string | null;
  etudeCode?: string | null;
  etudeCouleur?: string | null;
  etudeProprietaireId?: number | null;
  assigneNom?: string | null;
  sousTaches?: SousTache[];
  minutes?: number;
  minutesParEtape?: Record<number, number>;
  chronoEnCours?: boolean;
  chronoSousTacheId?: number | null;
  peutGerer?: boolean;
  peutEcrire?: boolean;
};

export default function TableauMissions({
  lignes,
  etudes,
  afficherEtude = true,
  message = "Aucune mission.",
  membres = [],
  comptes = [],
  utilisateurId,
  niveauxPartage = {},
}: {
  lignes: LigneMission[];
  etudes: Pick<Etude, "id" | "nom">[];
  afficherEtude?: boolean;
  message?: string;
  membres?: MembreAttribution[];
  comptes?: CompteChoix[];
  utilisateurId?: number;
  niveauxPartage?: Record<number, string>;
}) {
  if (lignes.length === 0) {
    return <p className="rounded-2xl border border-dashed border-ligne bg-creux/30 p-10 text-center text-sm text-attenue">{message}</p>;
  }

  return (
    <div className="space-y-3">
      {lignes.map((ligne) => {
        const calcules =
          utilisateurId != null
            ? droitsSurMission({
                utilisateurId,
                proprietaireId: ligne.tache.proprietaireId,
                etudeId: ligne.tache.etudeId,
                etudeProprietaireId: ligne.etudeProprietaireId,
                assigneA: ligne.tache.assigneA,
                niveauPartage:
                  ligne.tache.etudeId != null ? niveauxPartage[ligne.tache.etudeId] : null,
              })
            : { peutGerer: ligne.peutGerer ?? true, peutEcrire: ligne.peutEcrire ?? true };
        return (
        <CarteMission
          key={ligne.tache.id}
          tache={ligne.tache}
          etudeNom={ligne.etudeNom}
          etudeCode={ligne.etudeCode}
          etudeCouleur={ligne.etudeCouleur}
          assigneNom={ligne.assigneNom}
          sousTaches={ligne.sousTaches ?? []}
          minutes={ligne.minutes ?? 0}
          minutesParEtape={ligne.minutesParEtape ?? {}}
          chronoEnCours={ligne.chronoEnCours ?? false}
          chronoSousTacheId={ligne.chronoSousTacheId ?? null}
          etudes={etudes}
          afficherEtude={afficherEtude}
          membres={membres}
          comptes={comptes}
          peutGerer={ligne.peutGerer ?? calcules.peutGerer}
          peutEcrire={ligne.peutEcrire ?? calcules.peutEcrire}
        />
        );
      })}
    </div>
  );
}
