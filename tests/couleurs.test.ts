import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { couleurAffichee, lireCouleur, PALETTE_COULEURS } from "../src/lib/couleurs";

describe("lireCouleur", () => {
  it("n'accepte que la palette", () => {
    assert.equal(lireCouleur("#10b981"), "#10b981");
    assert.equal(lireCouleur(" #EF4444 "), "#ef4444");
    assert.equal(lireCouleur("etude"), null);
    assert.equal(lireCouleur("#ffffff"), null);
    assert.equal(lireCouleur(""), null);
  });
});

describe("couleurAffichee", () => {
  it("préfère la mission, sinon l'étude, sinon la première de la palette", () => {
    assert.equal(couleurAffichee("#ec4899", "#6366f1"), "#ec4899");
    assert.equal(couleurAffichee(null, "#0ea5e9"), "#0ea5e9");
    assert.equal(couleurAffichee("etude", "#0ea5e9"), "#0ea5e9");
    assert.equal(couleurAffichee(null, null), PALETTE_COULEURS[0]);
  });
});
