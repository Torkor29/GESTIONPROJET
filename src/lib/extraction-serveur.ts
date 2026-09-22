import "server-only";
import {
  filtrerMissions,
  grouperParEtude,
  lignesEtapes,
  lignesSuivi,
  lireFiltresExtraction,
  syntheseParEtude,
  syntheseSuivi,
  type ParamsExtraction,
} from "./extraction-missions";
import { toutesLesTaches } from "./requetes";

/**
 * Charge les missions visibles, applique les filtres d'extraction, et prépare
 * les trois vues du suivi : lignes, étapes, synthèse.
 */
export async function suiviMissions(params: ParamsExtraction) {
  const { filtres, archives } = lireFiltresExtraction(params);
  const [actives, archivees] = await Promise.all([
    toutesLesTaches(undefined, false),
    archives ? toutesLesTaches(undefined, true) : Promise.resolve([]),
  ]);
  const source = archives ? [...actives, ...archivees] : actives;
  const filtrees = filtrerMissions(source, filtres);
  const maintenant = Math.floor(Date.now() / 1000);
  const lignes = lignesSuivi(filtrees, maintenant);

  const assignees = [
    ...new Map(
      source
        .filter((m) => m.tache.assigneA && m.assigneNom)
        .map((m) => [m.tache.assigneA as number, m.assigneNom as string]),
    ).entries(),
  ].sort((a, b) => a[1].localeCompare(b[1], "fr", { sensitivity: "base" }));

  return {
    lignes,
    etapes: lignesEtapes(filtrees),
    synthese: syntheseSuivi(lignes),
    parEtude: syntheseParEtude(lignes),
    groupes: grouperParEtude(lignes),
    assignees,
    archives,
  };
}
