import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { dansLaPurge, datePourPurge, estArchivee } from "../src/lib/archives";
import { depuisChampDate } from "../src/lib/format";

function sec(iso: string): number {
  const n = depuisChampDate(iso);
  assert.ok(n !== null);
  return n;
}

describe("estArchivee", () => {
  it("ne range que ce qui a une date d'archivage", () => {
    assert.equal(estArchivee(null), false);
    assert.equal(estArchivee(undefined), false);
    assert.equal(estArchivee(sec("2026-09-10")), true);
  });
});

describe("datePourPurge", () => {
  it("préfère la date de fin, sinon l'archivage", () => {
    assert.equal(datePourPurge(sec("2026-09-01"), sec("2026-09-10")), sec("2026-09-01"));
    assert.equal(datePourPurge(null, sec("2026-09-10")), sec("2026-09-10"));
    assert.equal(datePourPurge(null, null), null);
  });
});

describe("dansLaPurge", () => {
  const avant = sec("2026-09-15");

  it("sans date, tout ce qui est déjà archivé part", () => {
    assert.equal(dansLaPurge({ termineeLe: sec("2026-12-01"), archiveeLe: sec("2026-12-02") }, null), true);
  });

  it("retire ce qui est terminé le jour saisi ou avant", () => {
    assert.equal(dansLaPurge({ termineeLe: sec("2026-09-15"), archiveeLe: sec("2026-09-20") }, avant), true);
    assert.equal(dansLaPurge({ termineeLe: sec("2026-09-14"), archiveeLe: null }, avant), true);
    assert.equal(dansLaPurge({ termineeLe: sec("2026-09-16"), archiveeLe: sec("2026-09-16") }, avant), false);
  });

  it("sans date de fin, s'appuie sur l'archivage", () => {
    assert.equal(dansLaPurge({ termineeLe: null, archiveeLe: sec("2026-09-10") }, avant), true);
    assert.equal(dansLaPurge({ termineeLe: null, archiveeLe: sec("2026-09-16") }, avant), false);
  });
});
