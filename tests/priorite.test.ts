import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { SECONDES_PAR_JOUR } from "../src/lib/format";
import {
  comparerMissionsPriorite,
  couleurBarreDelai,
  meriteBlocPriorite,
  missionsATraiter,
  niveauDelai,
} from "../src/lib/priorite";

const maintenant = 1_789_372_800; // 14 sept. 2026 00:00 UTC, assez proche du « aujourd'hui » des tests
const dans = (jours: number) => maintenant + jours * SECONDES_PAR_JOUR;
const tache = (p: Partial<{ statut: string; priorite: string; echeance: number | null }>) => ({
  statut: p.statut ?? "a_faire",
  priorite: p.priorite ?? "normale",
  echeance: p.echeance === undefined ? dans(3) : p.echeance,
});

describe("niveauDelai", () => {
  it("signale le retard, le délai court, et ignore le lointain", () => {
    assert.equal(niveauDelai(maintenant - SECONDES_PAR_JOUR, maintenant), "retard");
    assert.equal(niveauDelai(dans(7), maintenant), "court");
    assert.equal(niveauDelai(dans(8), maintenant), null);
    assert.equal(niveauDelai(null, maintenant), null);
  });
});

describe("couleurBarreDelai", () => {
  it("pose le corail sur le retard et l'or sur le délai court", () => {
    assert.equal(couleurBarreDelai("retard"), "rgb(var(--corail))");
    assert.equal(couleurBarreDelai("court"), "rgb(var(--or))");
    assert.equal(couleurBarreDelai(null), null);
  });
});

describe("meriteBlocPriorite", () => {
  it("écarte les terminées et les peu importantes, même en retard", () => {
    assert.equal(meriteBlocPriorite(tache({ statut: "terminee" }), maintenant), false);
    assert.equal(
      meriteBlocPriorite(tache({ priorite: "basse", echeance: maintenant - 10 }), maintenant),
      false,
    );
  });

  it("garde une mission importante, même sans échéance", () => {
    assert.equal(meriteBlocPriorite(tache({ priorite: "haute", echeance: null }), maintenant), true);
  });

  it("ne garde une mission normale que si l'échéance est dans les 21 jours", () => {
    assert.equal(meriteBlocPriorite(tache({ echeance: dans(21) }), maintenant), true);
    assert.equal(meriteBlocPriorite(tache({ echeance: dans(22) }), maintenant), false);
    assert.equal(meriteBlocPriorite(tache({ echeance: null }), maintenant), false);
  });
});

describe("missionsATraiter", () => {
  it("trie retard, puis délai court, puis horizon, puis importante sans date", () => {
    const lignes = [
      { id: "lointaine", tache: tache({ echeance: dans(40) }) },
      { id: "haute", tache: tache({ priorite: "haute", echeance: null }) },
      { id: "semaine", tache: tache({ echeance: dans(4) }) },
      { id: "retard", tache: tache({ echeance: maintenant - SECONDES_PAR_JOUR }) },
      { id: "basse", tache: tache({ priorite: "basse", echeance: maintenant - 5 }) },
    ];
    assert.deepEqual(
      missionsATraiter(lignes, maintenant).map((l) => l.id),
      ["retard", "semaine", "haute"],
    );
  });

  it("place l'importante avant la normale à échéance égale", () => {
    const jour = dans(10);
    const cmp = comparerMissionsPriorite(
      tache({ priorite: "haute", echeance: jour }),
      tache({ priorite: "normale", echeance: jour }),
      maintenant,
    );
    assert.ok(cmp < 0);
  });
});
