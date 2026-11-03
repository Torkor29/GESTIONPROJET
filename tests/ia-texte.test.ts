import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { ficheEtudePourIA, lireMissionsProposees, texteDeNote } from "../src/lib/ia-texte";

describe("texteDeNote", () => {
  it("rend le texte d'une note BlockNote, listes et sous-blocs compris", () => {
    const contenu = JSON.stringify([
      { type: "heading", content: [{ type: "text", text: "Réunion" }], children: [] },
      { type: "bulletListItem", content: [{ type: "text", text: "Relancer " }, { type: "text", text: "le CPP" }], children: [
        { type: "paragraph", content: [{ type: "text", text: "avant vendredi" }], children: [] },
      ] },
    ]);
    assert.equal(texteDeNote(contenu), "Réunion\n- Relancer le CPP\n  avant vendredi");
  });
  it("supporte un contenu illisible ou vide", () => {
    assert.equal(texteDeNote("pas du json"), "");
    assert.equal(texteDeNote("[]"), "");
  });
});

describe("lireMissionsProposees", () => {
  it("lit le tableau même entouré de texte ou d'un bloc de code", () => {
    const r = lireMissionsProposees('Voici :\n```json\n[{"titre":"Relancer le CPP","echeance":"2026-11-20","notes":""},{"titre":""},{"titre":"Archiver","echeance":"demain"}]\n```');
    assert.deepEqual(r, [
      { titre: "Relancer le CPP", echeance: "2026-11-20", notes: "" },
      { titre: "Archiver", echeance: null, notes: "" },
    ]);
  });
  it("rend une liste vide sur une réponse inexploitable", () => {
    assert.deepEqual(lireMissionsProposees("Je ne sais pas."), []);
  });
});

describe("ficheEtudePourIA", () => {
  it("n'envoie que les champs renseignés", () => {
    assert.equal(ficheEtudePourIA({ Acronyme: "RAMBO", Promoteur: null, "ID-RCB": " " }), "Acronyme : RAMBO");
  });
});
