import test from "node:test";
import assert from "node:assert/strict";
import { aPermission, modulesAutorises } from "./permissions";
import { actionsPossibles, prochainStatutQuery, queryOuverte } from "./queries-workflow";

test("un ARC ne peut pas administrer l'instance", () => {
  assert.equal(aPermission("arc", "admin", "modifier"), false);
  assert.equal(aPermission("arc", "monitoring", "creer"), true);
  assert.equal(aPermission("super_admin", "admin", "supprimer"), true);
});

test("un Data Manager gère les queries, pas le monitoring", () => {
  assert.equal(aPermission("data_manager", "queries", "creer"), true);
  assert.equal(aPermission("data_manager", "monitoring", "creer"), false);
  assert.equal(aPermission("data_manager", "monitoring", "lire"), true);
});

test("un investigateur ne supprime pas les études", () => {
  assert.equal(aPermission("investigateur", "etudes", "supprimer"), false);
  assert.equal(aPermission("investigateur", "queries", "modifier"), true);
});

test("lecture seule n'écrit pas", () => {
  assert.equal(aPermission("lecture_seule", "sujets", "creer"), false);
  assert.equal(aPermission("lecture_seule", "sujets", "lire"), true);
});

test("cp est un alias de chef de projet", () => {
  assert.equal(aPermission("cp", "capa", "creer"), true);
  assert.ok(modulesAutorises("chef_projet").includes("reporting"));
});

test("cycle de vie d'une query", () => {
  assert.deepEqual(prochainStatutQuery("open", "repondre"), { ok: true, statut: "answered" });
  assert.deepEqual(prochainStatutQuery("answered", "resoudre"), { ok: true, statut: "resolved" });
  assert.deepEqual(prochainStatutQuery("resolved", "fermer"), { ok: true, statut: "closed" });
  assert.equal(prochainStatutQuery("closed", "repondre").ok, false);
  assert.equal(prochainStatutQuery("answered", "rouvrir").ok, true);
  assert.ok(queryOuverte("open"));
  assert.equal(queryOuverte("closed"), false);
  assert.deepEqual(actionsPossibles("open"), ["repondre"]);
});
