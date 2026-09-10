import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { depuisChampDate } from "../src/lib/format";
import {
  grilleTimeline,
  lienTimeline,
  missionsPourTimeline,
  type MissionTimeline,
} from "../src/lib/timeline";

const maintenant = Math.floor(new Date(2026, 8, 10, 12, 0, 0).getTime() / 1000); // mercredi 10 sept.

function sec(iso: string): number {
  const n = depuisChampDate(iso);
  assert.ok(n !== null);
  return n;
}

function mission(
  id: number,
  iso: string,
  extra: Partial<MissionTimeline> = {},
): MissionTimeline {
  return {
    id,
    titre: `Mission ${id}`,
    echeance: sec(iso),
    couleur: "#ef4444",
    href: "/missions",
    ...extra,
  };
}

describe("lienTimeline", () => {
  it("pointe l'onglet Missions d'une étude unique", () => {
    assert.equal(lienTimeline([4]), "/etudes/4?section=missions");
  });

  it("renvoie le suivi s'il n'y a pas exactement une étude", () => {
    assert.equal(lienTimeline([]), "/missions");
    assert.equal(lienTimeline([1, 2]), "/missions");
  });
});

describe("missionsPourTimeline", () => {
  it("écarte les missions terminées et celles sans échéance", () => {
    const lignes = missionsPourTimeline([
      {
        tache: { id: 1, titre: "Sans date", statut: "a_faire", echeance: null, couleur: null },
        etudesLiees: [{ id: 10, code: "INA" }],
        etudeCouleur: "#6366f1",
      },
      {
        tache: {
          id: 2,
          titre: "Finie",
          statut: "terminee",
          echeance: sec("2026-09-10"),
          couleur: null,
        },
        etudesLiees: [{ id: 10, code: "INA" }],
        etudeCouleur: "#6366f1",
      },
      {
        tache: {
          id: 3,
          titre: "Ouverte",
          statut: "a_faire",
          echeance: sec("2026-09-12"),
          couleur: "#10b981",
        },
        etudesLiees: [{ id: 10, code: "INA" }],
        etudeCouleur: "#6366f1",
      },
    ]);
    assert.equal(lignes.length, 1);
    assert.equal(lignes[0].id, 3);
    assert.equal(lignes[0].couleur, "#10b981");
    assert.equal(lignes[0].etudeCode, "INA");
    assert.equal(lignes[0].href, "/etudes/10?section=missions");
  });

  it("reprend la couleur de l'étude si la mission n'en a pas", () => {
    const [m] = missionsPourTimeline([
      {
        tache: {
          id: 1,
          titre: "Héritée",
          statut: "en_cours",
          echeance: sec("2026-09-11"),
          couleur: null,
        },
        etudesLiees: [{ id: 8, code: "LIB" }],
        etudeCouleur: "#0ea5e9",
      },
    ]);
    assert.equal(m.couleur, "#0ea5e9");
  });
});

describe("grilleTimeline", () => {
  it("sépare les retards, pose aujourd'hui, ignore au-delà des quatre semaines", () => {
    const grille = grilleTimeline(
      [
        mission(1, "2026-09-09"), // hier → retard
        mission(2, "2026-09-10"), // aujourd'hui
        mission(3, "2026-09-14"), // lundi suivant, dans la fenêtre
        mission(4, "2026-10-06"), // après les 28 jours (lundi 7 sept. + 28 j = 5 oct.)
        mission(5, "2026-10-04"), // dernier jour affiché (dimanche)
      ],
      maintenant,
    );

    assert.deepEqual(
      grille.retard.map((m) => m.id),
      [1],
    );
    assert.equal(grille.jours[0].iso, "2026-09-07");
    assert.equal(grille.jours.length, 28);
    assert.equal(grille.jours[grille.jours.length - 1].iso, "2026-10-04");

    const aujourdhui = grille.jours.find((j) => j.aujourdhui);
    assert.equal(aujourdhui?.iso, "2026-09-10");
    assert.deepEqual(
      (grille.parJour.get("2026-09-10") ?? []).map((m) => m.id),
      [2],
    );
    assert.deepEqual(
      (grille.parJour.get("2026-09-14") ?? []).map((m) => m.id),
      [3],
    );
    assert.deepEqual(
      (grille.parJour.get("2026-10-04") ?? []).map((m) => m.id),
      [5],
    );
    assert.equal(grille.parJour.has("2026-10-06"), false);
    assert.ok(!grille.retard.some((m) => m.id === 4));
  });
});
