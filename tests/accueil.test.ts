import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  lireWidgetsAccueil,
  widgetVisible,
  WIDGETS_PAR_DEFAUT,
} from "../src/lib/accueil";

describe("lireWidgetsAccueil", () => {
  it("affiche tout tant qu'aucune préférence n'est enregistrée", () => {
    assert.deepEqual(lireWidgetsAccueil(null), WIDGETS_PAR_DEFAUT);
    assert.deepEqual(lireWidgetsAccueil(undefined), WIDGETS_PAR_DEFAUT);
    assert.deepEqual(lireWidgetsAccueil(""), WIDGETS_PAR_DEFAUT);
  });

  it("écarte un JSON illisible ou d'un autre type", () => {
    assert.deepEqual(lireWidgetsAccueil("{"), WIDGETS_PAR_DEFAUT);
    assert.deepEqual(lireWidgetsAccueil('"timeline"'), WIDGETS_PAR_DEFAUT);
    assert.deepEqual(lireWidgetsAccueil("{}"), WIDGETS_PAR_DEFAUT);
  });

  it("garde une liste vide : l'accueil peut être volontairement rangé", () => {
    assert.deepEqual(lireWidgetsAccueil("[]"), []);
  });

  it("ne retient que les clés connues, dans l'ordre enregistré", () => {
    assert.deepEqual(lireWidgetsAccueil('["timeline","inconnu","chiffres"]'), [
      "timeline",
      "chiffres",
    ]);
  });
});

describe("widgetVisible", () => {
  it("suit la liste retenue", () => {
    assert.equal(widgetVisible(["timeline"], "timeline"), true);
    assert.equal(widgetVisible(["timeline"], "chiffres"), false);
    assert.equal(widgetVisible([], "timeline"), false);
  });
});
