import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { etudesModifiables } from "../src/lib/attribution";
import { avancement, cleType, normaliserAcronyme, statutDeduit } from "../src/lib/missions";

describe("statutDeduit", () => {
  it("n'est terminée que quand toutes les études qui comptent le sont", () => {
    assert.equal(statutDeduit(["terminee", "terminee"]), "terminee");
    assert.equal(statutDeduit(["terminee", "sans_objet"]), "terminee");
    assert.equal(statutDeduit(["terminee", "a_faire"]), "en_cours");
  });

  it("reste non démarrée tant qu'aucune étude n'a bougé", () => {
    assert.equal(statutDeduit(["a_faire", "a_faire"]), "a_faire");
    assert.equal(statutDeduit(["a_faire", "sans_objet"]), "a_faire");
  });

  it("passe en cours dès qu'une étude démarre", () => {
    assert.equal(statutDeduit(["en_cours", "a_faire"]), "en_cours");
  });
});

describe("avancement", () => {
  it("sort les études sans objet du calcul", () => {
    assert.deepEqual(
      avancement([{ statut: "terminee" }, { statut: "sans_objet" }, { statut: "a_faire" }]),
      { faites: 1, total: 2, pourcentage: 50 },
    );
  });
});

describe("saisies libres", () => {
  it("regroupe les types sans tenir compte de la casse ni des espaces", () => {
    assert.equal(cleType(" Archivage "), cleType("archivage"));
    assert.equal(cleType(null), "");
  });

  it("normalise un acronyme tapé à la volée", () => {
    assert.equal(normaliserAcronyme("  papaye  2 "), "PAPAYE 2");
  });
});

describe("etudesModifiables", () => {
  const etudesLiees = [
    { id: 1, proprietaireId: 10 },
    { id: 2, proprietaireId: 20 },
  ];

  it("donne toutes les études à qui porte la mission", () => {
    const base = { peutEcrire: true, assigneA: null, etudesLiees };
    assert.deepEqual(etudesModifiables({ ...base, utilisateurId: 30, proprietaireId: 30 }), [1, 2]);
    assert.deepEqual(
      etudesModifiables({ ...base, utilisateurId: 40, proprietaireId: 30, pilote: true }),
      [1, 2],
    );
  });

  it("limite le propriétaire d'une étude du lot à la sienne", () => {
    assert.deepEqual(
      etudesModifiables({
        utilisateurId: 10,
        proprietaireId: 30,
        assigneA: null,
        peutEcrire: true,
        etudesLiees,
      }),
      [1],
    );
  });

  it("ne rend rien en lecture seule", () => {
    assert.deepEqual(
      etudesModifiables({
        utilisateurId: 30,
        proprietaireId: 30,
        assigneA: null,
        peutEcrire: false,
        etudesLiees,
      }),
      [],
    );
  });
});
