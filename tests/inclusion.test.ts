import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { depuisChampDate } from "../src/lib/format";
import {
  ajouterMois,
  libelleDelaiInclusion,
  lignesRappelInclusion,
  niveauFinInclusion,
} from "../src/lib/inclusion";

const auj = new Date(2026, 8, 8); // 8 septembre 2026

function sec(iso: string): number {
  const n = depuisChampDate(iso);
  assert.ok(n !== null);
  return n;
}

describe("ajouterMois", () => {
  it("ajoute des mois calendaires", () => {
    assert.equal(ajouterMois("2026-09-08", 3), "2026-12-08");
    assert.equal(ajouterMois("2026-09-08", 4), "2027-01-08");
  });

  it("rabat le 31 sur le dernier jour du mois cible", () => {
    assert.equal(ajouterMois("2026-01-31", 1), "2026-02-28");
  });
});

describe("niveauFinInclusion", () => {
  it("signale l'absence de date", () => {
    assert.equal(niveauFinInclusion(null, auj), "absent");
  });

  it("passe en rouge sous 3 mois, y compris une date déjà dépassée", () => {
    assert.equal(niveauFinInclusion(sec("2026-11-07"), auj), "rouge");
    assert.equal(niveauFinInclusion(sec("2026-12-07"), auj), "rouge");
    assert.equal(niveauFinInclusion(sec("2026-08-01"), auj), "rouge");
    assert.equal(niveauFinInclusion(sec("2026-09-08"), auj), "rouge");
  });

  it("passe en jaune entre 3 mois inclus et 4 mois exclus", () => {
    assert.equal(niveauFinInclusion(sec("2026-12-08"), auj), "jaune");
    assert.equal(niveauFinInclusion(sec("2027-01-07"), auj), "jaune");
  });

  it("reste calme à 4 mois et au-delà", () => {
    assert.equal(niveauFinInclusion(sec("2027-01-08"), auj), "ok");
    assert.equal(niveauFinInclusion(sec("2027-09-08"), auj), "ok");
  });
});

describe("libelleDelaiInclusion", () => {
  it("décrit le délai restant ou dépassé", () => {
    assert.match(libelleDelaiInclusion(sec("2026-09-08"), auj), /dernier jour/);
    assert.match(libelleDelaiInclusion(sec("2026-09-09"), auj), /demain/);
    assert.match(libelleDelaiInclusion(sec("2026-12-08"), auj), /encore 3 mois/);
    assert.match(libelleDelaiInclusion(sec("2026-08-08"), auj), /dépassée depuis 1 mois/);
  });
});

describe("lignesRappelInclusion", () => {
  it("ne retient que les études ouvertes à moins de 5 mois, urgences d'abord", () => {
    const lignes = lignesRappelInclusion(
      [
        { id: 1, nom: "Loin", code: "LOIN", statut: "active", dateFinInclusion: sec("2027-09-08") },
        { id: 2, nom: "Rouge", code: "RG", statut: "active", dateFinInclusion: sec("2026-10-01") },
        { id: 3, nom: "Jaune", code: "JN", statut: "en_pause", dateFinInclusion: sec("2026-12-20") },
        { id: 4, nom: "Sans date", code: null, statut: "active", dateFinInclusion: null },
        { id: 5, nom: "Finie", code: "FN", statut: "terminee", dateFinInclusion: sec("2026-10-01") },
        { id: 6, nom: "Archivée", code: "AR", statut: "archivee", dateFinInclusion: sec("2026-10-01") },
        { id: 7, nom: "Cinq mois", code: "M5", statut: "active", dateFinInclusion: sec("2027-02-08") },
        { id: 8, nom: "Sous cinq", code: "S5", statut: "active", dateFinInclusion: sec("2027-02-07") },
      ],
      auj,
    );

    assert.deepEqual(
      lignes.map((l) => l.code),
      ["RG", "JN", "S5"],
    );
    assert.equal(lignes[0].niveau, "rouge");
    assert.equal(lignes[1].niveau, "jaune");
    assert.equal(lignes[2].niveau, "ok");
    assert.equal(lignes[0].delai, "01/10/2026");
  });
});
