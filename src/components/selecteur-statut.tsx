"use client";

import { definirStatutTache } from "@/actions/taches";
import { LIBELLES_STATUT_MISSION } from "@/lib/constantes";
import SelecteurStatutGenerique from "./selecteur-statut-generique";

const COULEURS: Record<string, string> = {
  a_faire: "text-alerte",
  en_cours: "text-info",
  terminee: "text-reussite",
};

const PASTILLES: Record<string, string> = {
  a_faire: "bg-alerte",
  en_cours: "bg-info",
  terminee: "bg-reussite",
};

/**
 * Statut d'une mission, changeable depuis la carte sans ouvrir le formulaire.
 */
export default function SelecteurStatut({
  id,
  statut,
  verrouille = false,
}: {
  id: number;
  statut: string;
  /** Le statut suit les étapes : on l'affiche, on ne le change plus à la main. */
  verrouille?: boolean;
}) {
  return (
    <SelecteurStatutGenerique
      id={id}
      statut={statut}
      libelles={LIBELLES_STATUT_MISSION}
      couleurs={COULEURS}
      pastilles={PASTILLES}
      enregistrer={definirStatutTache}
      etiquette="Statut de la mission"
      verrouille={verrouille}
      titreVerrou="Le statut suit les étapes : en cours tant qu'il en reste, terminée quand toutes sont cochées."
    />
  );
}
