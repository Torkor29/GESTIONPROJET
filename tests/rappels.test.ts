import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { type MissionARappeler, SECONDES_JOUR, rappelsAEnvoyer, redigerRappel } from "../src/lib/rappels";

const AUJ = 1_800_000_000 - (1_800_000_000 % SECONDES_JOUR);
const j = (n: number) => AUJ + n * SECONDES_JOUR;

const base: MissionARappeler = {
  id: 1,
  titre: "Déclaration de fin d'étude",
  statut: "a_faire",
  archiveeLe: null,
  echeance: null,
  rappelLe: null,
  rappelEnvoyeLe: null,
  rappelEcheanceEnvoyeLe: null,
  rappelJours: 3,
};

describe("rappels", () => {
  it("rappel choisi : dû le jour dit, pas avant, une seule fois", () => {
    assert.deepEqual(rappelsAEnvoyer({ ...base, rappelLe: j(1) }, AUJ), []);
    assert.deepEqual(rappelsAEnvoyer({ ...base, rappelLe: j(0) }, AUJ), ["choisi"]);
    assert.deepEqual(rappelsAEnvoyer({ ...base, rappelLe: j(-2) }, AUJ), ["choisi"]);
    assert.deepEqual(rappelsAEnvoyer({ ...base, rappelLe: j(0), rappelEnvoyeLe: AUJ }, AUJ), []);
  });

  it("rappel d'échéance : dans la fenêtre de N jours, jamais pour une échéance passée", () => {
    assert.deepEqual(rappelsAEnvoyer({ ...base, echeance: j(4) }, AUJ), []);
    assert.deepEqual(rappelsAEnvoyer({ ...base, echeance: j(3) }, AUJ), ["echeance"]);
    assert.deepEqual(rappelsAEnvoyer({ ...base, echeance: j(0) }, AUJ), ["echeance"]);
    assert.deepEqual(rappelsAEnvoyer({ ...base, echeance: j(-1) }, AUJ), []);
    assert.deepEqual(rappelsAEnvoyer({ ...base, echeance: j(1), rappelJours: 0 }, AUJ), []);
  });

  it("rien pour une mission terminée ou archivée", () => {
    const due = { ...base, rappelLe: j(0), echeance: j(1) };
    assert.deepEqual(rappelsAEnvoyer({ ...due, statut: "terminee" }, AUJ), []);
    assert.deepEqual(rappelsAEnvoyer({ ...due, archiveeLe: AUJ }, AUJ), []);
  });

  it("un seul courrier quand les deux tombent le même jour", () => {
    assert.deepEqual(rappelsAEnvoyer({ ...base, rappelLe: j(0), echeance: j(2) }, AUJ), ["choisi"]);
  });

  it("le courrier annonce la mission et sa date", () => {
    const { sujet, texte } = redigerRappel({
      destinataireNom: "Julie",
      titre: "Soumission CPP",
      echeance: j(3),
      etudes: [{ nom: "Étude Efficace", code: "EFFICACE" }],
      href: "https://exemple.fr/missions",
      aujourdhui: AUJ,
    });
    assert.match(sujet, /^Rappel : Soumission CPP — pour le \d{2}\/\d{2}\/\d{4}$/);
    assert.match(texte, /Attention, vous avez une mission pour le .* \(dans 3 jours\)/);
    assert.match(texte, /Étude : EFFICACE — Étude Efficace/);
  });
});
