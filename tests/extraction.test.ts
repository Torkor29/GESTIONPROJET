import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { SECONDES_PAR_JOUR } from "../src/lib/format";
import {
  detailEtapes,
  COLONNES_SUIVI,
  filtrerMissions,
  grouperParEtude,
  joursDelai,
  libelleDelai,
  libelleEtudes,
  lignesEtapes,
  lignesSuivi,
  lireFiltresExtraction,
  syntheseParEtude,
  syntheseSuivi,
  valeurSuivi,
  type MissionPourExtraction,
} from "../src/lib/extraction-missions";

const maintenant = 1_789_372_800;
const tache = (
  extra: Partial<MissionPourExtraction["tache"]> = {},
): MissionPourExtraction["tache"] => ({
  id: extra.id ?? 1,
  titre: extra.titre ?? "Newsletter",
  notes: extra.notes ?? null,
  statut: extra.statut ?? "a_faire",
  priorite: extra.priorite ?? "normale",
  echeance: extra.echeance === undefined ? maintenant + 3 * SECONDES_PAR_JOUR : extra.echeance,
  assigneA: extra.assigneA === undefined ? null : extra.assigneA,
  creeLe: extra.creeLe ?? maintenant,
  modifieLe: extra.modifieLe ?? maintenant,
  termineeLe: extra.termineeLe ?? null,
  archiveeLe: extra.archiveeLe ?? null,
  etudeId: extra.etudeId === undefined ? 10 : extra.etudeId,
});

describe("libelleEtudes", () => {
  it("prend les acronymes s'ils existent", () => {
    const { sigles, noms } = libelleEtudes({
      tache: tache(),
      etudesLiees: [
        { id: 1, nom: "Sédation inhalée", code: "SEDINH" },
        { id: 2, nom: "Liberté", code: "LIBERTY" },
      ],
    });
    assert.equal(sigles, "SEDINH · LIBERTY");
    assert.equal(noms, "Sédation inhalée · Liberté");
  });
});

describe("joursDelai", () => {
  it("compte le retard, le reste, et ignore une mission terminée", () => {
    assert.equal(joursDelai(maintenant - 2 * SECONDES_PAR_JOUR, maintenant, false), 2);
    assert.equal(joursDelai(maintenant + 5 * SECONDES_PAR_JOUR, maintenant, false), -5);
    assert.equal(joursDelai(maintenant - SECONDES_PAR_JOUR, maintenant, true), null);
    assert.equal(joursDelai(null, maintenant, false), null);
  });
});

describe("libelleDelai", () => {
  it("formule le retard et le reste en français", () => {
    assert.equal(libelleDelai(3), "3 j de retard");
    assert.equal(libelleDelai(-4), "dans 4 j");
    assert.equal(libelleDelai(0), "aujourd'hui");
    assert.equal(libelleDelai(null), "");
  });
});

describe("detailEtapes", () => {
  it("aligne chaque étape avec sa coche", () => {
    assert.equal(
      detailEtapes([
        { titre: "Relancer", faite: true },
        { titre: "Déposer", faite: false },
      ]),
      "✓ Relancer\n○ Déposer",
    );
  });
});

describe("filtrerMissions", () => {
  const lignes: MissionPourExtraction[] = [
    {
      tache: tache({ id: 1, statut: "en_cours", assigneA: 2, etudeId: 10 }),
      etudesLiees: [{ id: 10, nom: "A", code: "AA" }],
      assigneNom: "Marie",
    },
    {
      tache: tache({ id: 2, statut: "a_faire", assigneA: null, etudeId: 11, echeance: maintenant - SECONDES_PAR_JOUR }),
      etudesLiees: [{ id: 11, nom: "B", code: "BB" }],
    },
  ];

  it("filtre par étude, statut et attribution", () => {
    assert.equal(filtrerMissions(lignes, { etudeId: 10 }).length, 1);
    assert.equal(filtrerMissions(lignes, { statut: "a_faire" })[0].tache.id, 2);
    assert.equal(filtrerMissions(lignes, { assigneA: "non" })[0].tache.id, 2);
    assert.equal(filtrerMissions(lignes, { assigneA: 2 })[0].tache.id, 1);
  });
});

describe("lignesSuivi", () => {
  it("porte l'intitulé, le statut, le retard et les étapes", () => {
    const [ligne] = lignesSuivi(
      [
        {
          tache: tache({
            titre: "Newsletter",
            statut: "en_cours",
            echeance: maintenant - SECONDES_PAR_JOUR,
            notes: "Penser au CERFA",
          }),
          etudesLiees: [{ id: 1, nom: "Sédation", code: "SEDINH" }],
          assigneNom: "Camille",
          sousTaches: [
            { titre: "Relancer", faite: true },
            { titre: "Déposer", faite: false },
          ],
          minutes: 90,
        },
      ],
      maintenant,
    );
    assert.equal(ligne.titre, "Newsletter");
    assert.equal(ligne.etude, "SEDINH");
    assert.equal(ligne.statut, "En cours");
    assert.equal(ligne.assignee, "Camille");
    assert.equal(ligne.enRetard, true);
    assert.equal(ligne.etapesResume, "1/2");
    assert.match(ligne.etapesDetail, /Relancer/);
    assert.equal(ligne.commentaire, "Penser au CERFA");
    assert.equal(ligne.temps, "1 h 30");
  });
});

describe("syntheseSuivi", () => {
  it("compte les statuts et les retards", () => {
    const s = syntheseSuivi(
      lignesSuivi(
        [
          { tache: tache({ id: 1, statut: "a_faire", echeance: maintenant - SECONDES_PAR_JOUR }) },
          { tache: tache({ id: 2, statut: "en_cours", echeance: maintenant + 10 * SECONDES_PAR_JOUR }) },
          { tache: tache({ id: 3, statut: "terminee", echeance: maintenant - SECONDES_PAR_JOUR }) },
        ],
        maintenant,
      ),
    );
    assert.deepEqual(s, { total: 3, aFaire: 1, enCours: 1, terminees: 1, enRetard: 1 });
  });
});

describe("lignesEtapes", () => {
  it("une ligne par étape, rattachée à la mission", () => {
    const etapes = lignesEtapes([
      {
        tache: tache({ titre: "Newsletter" }),
        etudesLiees: [{ nom: "Sédation", code: "SEDINH" }],
        sousTaches: [
          { titre: "Relancer", faite: true },
          { titre: "Déposer", faite: false },
        ],
      },
    ]);
    assert.equal(etapes.length, 2);
    assert.equal(etapes[0].mission, "Newsletter");
    assert.equal(etapes[0].etat, "Faite");
    assert.equal(etapes[1].etat, "À faire");
  });
});

describe("filtrerMissions dates", () => {
  it("garde les missions sans échéance quand on filtre par dates", () => {
    const lignes: MissionPourExtraction[] = [
      { tache: tache({ id: 1, echeance: null }) },
      { tache: tache({ id: 2, echeance: maintenant }) },
    ];
    const gardees = filtrerMissions(lignes, { du: maintenant + SECONDES_PAR_JOUR });
    assert.equal(gardees.length, 1);
    assert.equal(gardees[0].tache.id, 1);
  });
});

describe("lireFiltresExtraction", () => {
  it("lit les filtres d'URL, archives comprises", () => {
    const { filtres, archives } = lireFiltresExtraction({
      etude: "10",
      statut: "en_cours",
      assigne: "non",
      du: "2026-09-01",
      au: "2026-09-30",
      archives: "1",
    });
    assert.equal(archives, true);
    assert.equal(filtres.etudeId, 10);
    assert.equal(filtres.statut, "en_cours");
    assert.equal(filtres.assigneA, "non");
    assert.ok(filtres.du && filtres.au && filtres.au > filtres.du);
  });
});

describe("valeurSuivi", () => {
  it("écrit OUI pour un booléen vrai, vide sinon", () => {
    const [ligne] = lignesSuivi([{ tache: tache({ echeance: maintenant - SECONDES_PAR_JOUR }) }], maintenant);
    assert.equal(valeurSuivi(ligne, "enRetard"), "OUI");
    assert.equal(valeurSuivi(ligne, "archivee"), "");
    assert.ok(COLONNES_SUIVI.some((c) => c.cle === "titre"));
    assert.ok(COLONNES_SUIVI.some((c) => c.cle === "statut"));
  });
});

describe("syntheseParEtude", () => {
  it("compte par acronyme", () => {
    const par = syntheseParEtude(
      lignesSuivi(
        [
          {
            tache: tache({ id: 1, titre: "A" }),
            etudesLiees: [{ nom: "Sédation", code: "SEDINH" }],
          },
          {
            tache: tache({ id: 2, titre: "B" }),
            etudesLiees: [{ nom: "Sédation", code: "SEDINH" }],
          },
        ],
        maintenant,
      ),
    );
    assert.equal(par.length, 1);
    assert.equal(par[0].etude, "SEDINH");
    assert.equal(par[0].synthese.total, 2);
  });
});

describe("grouperParEtude", () => {
  it("range les missions sous leur acronyme", () => {
    const groupes = grouperParEtude(
      lignesSuivi(
        [
          {
            tache: tache({ id: 1, titre: "A" }),
            etudesLiees: [{ nom: "Sédation", code: "SEDINH" }],
          },
          {
            tache: tache({ id: 2, titre: "B" }),
            etudesLiees: [{ nom: "Liberté", code: "LIBERTY" }],
          },
        ],
        maintenant,
      ),
    );
    assert.deepEqual(
      groupes.map((g) => [g.etude, g.lignes.map((l) => l.titre)]),
      [
        ["LIBERTY", ["B"]],
        ["SEDINH", ["A"]],
      ],
    );
  });
});
