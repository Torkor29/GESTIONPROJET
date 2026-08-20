"use client";

import SelecteurStatutGenerique from "./selecteur-statut-generique";
import { modifierStatutSujet, modifierStatutVisiteSujet } from "@/actions/sujets";
import { STATUTS_SUJET, STATUTS_VISITE_SUJET } from "@/lib/constantes";

const COULEURS_VISITE: Record<string, string> = {
  prevue: "text-attenue",
  confirmee: "text-info",
  realisee: "text-reussite",
  annulee: "text-efface",
  en_retard: "text-alerte",
};

const PASTILLES_VISITE: Record<string, string> = {
  prevue: "bg-ligne-forte",
  confirmee: "bg-info",
  realisee: "bg-reussite",
  annulee: "bg-efface",
  en_retard: "bg-alerte",
};

const COULEURS_SUJET: Record<string, string> = {
  pre_screening: "text-attenue",
  screening: "text-info",
  inclus: "text-reussite",
  screen_failure: "text-alerte",
  en_cours: "text-accent-appuye",
  fin_traitement: "text-info",
  suivi: "text-attenue",
  termine: "text-reussite",
  sortie_etude: "text-alerte",
};

const PASTILLES_SUJET: Record<string, string> = {
  pre_screening: "bg-ligne-forte",
  screening: "bg-info",
  inclus: "bg-reussite",
  screen_failure: "bg-alerte",
  en_cours: "bg-accent",
  fin_traitement: "bg-info",
  suivi: "bg-ligne-forte",
  termine: "bg-reussite",
  sortie_etude: "bg-alerte",
};

export function SelecteurStatutVisiteSujet({ id, statut }: { id: number; statut: string }) {
  return (
    <SelecteurStatutGenerique
      id={id}
      statut={statut}
      libelles={STATUTS_VISITE_SUJET}
      couleurs={COULEURS_VISITE}
      pastilles={PASTILLES_VISITE}
      enregistrer={modifierStatutVisiteSujet}
      etiquette="Statut de la visite protocolaire"
    />
  );
}

export function SelecteurStatutSujet({ id, statut }: { id: number; statut: string }) {
  return (
    <SelecteurStatutGenerique
      id={id}
      statut={statut}
      libelles={STATUTS_SUJET}
      couleurs={COULEURS_SUJET}
      pastilles={PASTILLES_SUJET}
      enregistrer={modifierStatutSujet}
      etiquette="Statut du sujet"
    />
  );
}
