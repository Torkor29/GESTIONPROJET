import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { sigleEtude } from "../src/lib/format";

describe("sigleEtude", () => {
  it("prend l'acronyme s'il est renseigné", () => {
    assert.equal(
      sigleEtude({
        nom: "Comparaison d'une stratégie de sédation inhalée",
        code: "SEDINH",
      }),
      "SEDINH",
    );
  });

  it("ignore un acronyme vide ou composé d'espaces", () => {
    assert.equal(sigleEtude({ nom: "Newsletter", code: "  " }), "Newsletter");
    assert.equal(sigleEtude({ nom: "Newsletter", code: null }), "Newsletter");
    assert.equal(sigleEtude({ nom: "Newsletter" }), "Newsletter");
  });
});
