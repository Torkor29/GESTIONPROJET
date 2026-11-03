import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { debutDuJour, delaiRelatif, regrouperEcheances, type Echeance } from "../src/lib/echeances";

const J = 86400;
const maintenant = debutDuJour(Math.floor(new Date(2026, 10, 3, 10).getTime() / 1000)) + 10 * 3600;
const e = (cle: string, jours: number): Echeance => ({
  cle,
  nature: "mission",
  titre: cle,
  date: debutDuJour(maintenant) + jours * J,
  href: "#",
});

describe("regrouperEcheances", () => {
  it("range par horizon, dans l'ordre chronologique", () => {
    const h = regrouperEcheances([e("loin", 60), e("demain", 1), e("hier", -1), e("j10", 10), e("ajd", 0)], maintenant);
    assert.deepEqual(
      h.map((x) => [x.cle, x.echeances.map((y) => y.cle)]),
      [
        ["retard", ["hier"]],
        ["semaine", ["ajd", "demain"]],
        ["mois", ["j10"]],
        ["plus_tard", ["loin"]],
      ],
    );
  });

  it("n'affiche ni les horizons vides ni ce qui dépasse la limite", () => {
    assert.deepEqual(regrouperEcheances([e("tres-loin", 200)], maintenant), []);
    assert.equal(regrouperEcheances([e("j70", 70)], maintenant, 56).length, 0);
  });
});

describe("delaiRelatif", () => {
  it("parle en jours", () => {
    assert.equal(delaiRelatif(debutDuJour(maintenant), maintenant), "aujourd'hui");
    assert.equal(delaiRelatif(debutDuJour(maintenant) + J, maintenant), "demain");
    assert.equal(delaiRelatif(debutDuJour(maintenant) - 3 * J, maintenant), "il y a 3 j");
    assert.equal(delaiRelatif(debutDuJour(maintenant) + 12 * J, maintenant), "dans 12 j");
  });
});
