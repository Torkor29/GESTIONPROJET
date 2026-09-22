import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  categoriesProposees,
  grouperParCategorie,
  nomCategorie,
  SANS_CATEGORIE,
} from "../src/lib/pense-bete";

describe("nomCategorie", () => {
  it("reprend le libellé saisi, et range le vide à part", () => {
    assert.equal(nomCategorie("Réunions"), "Réunions");
    assert.equal(nomCategorie("  "), SANS_CATEGORIE);
    assert.equal(nomCategorie(null), SANS_CATEGORIE);
  });
});

describe("grouperParCategorie", () => {
  it("regroupe par nom, alphabetiquement, le sans-catégorie à la fin", () => {
    const groupes = grouperParCategorie([
      { id: 1, categorie: "" },
      { id: 2, categorie: "Réunions" },
      { id: 3, categorie: "  À retenir " },
      { id: 4, categorie: "Réunions" },
    ]);
    assert.deepEqual(
      groupes.map((g) => [g.nom, g.pages.map((p) => p.id)]),
      [
        ["À retenir", [3]],
        ["Réunions", [2, 4]],
        [SANS_CATEGORIE, [1]],
      ],
    );
  });
});

describe("categoriesProposees", () => {
  it("garde les catégories déjà utilisées et complète par les suggestions", () => {
    const liste = categoriesProposees(["Réunions", "réunions", "Perso"]);
    assert.ok(liste.includes("Réunions"));
    assert.ok(liste.includes("Perso"));
    assert.ok(liste.includes("À retenir"));
    assert.equal(liste.filter((c) => c.toLocaleLowerCase("fr") === "réunions").length, 1);
  });
});
