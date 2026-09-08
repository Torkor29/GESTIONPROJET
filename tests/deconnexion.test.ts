import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { expirerCookieSession, NOM_COOKIE, originePublique } from "../src/lib/auth";

describe("originePublique", () => {
  it("prend le schéma et l'hôte vus par le proxy", () => {
    const requete = new Request("http://app:3000/deconnexion", {
      headers: {
        "x-forwarded-proto": "https",
        "x-forwarded-host": "vigie.exemple.fr",
      },
    });
    assert.equal(originePublique(requete), "https://vigie.exemple.fr");
  });

  it("retombe sur l'URL de la requête sans en-têtes de proxy", () => {
    const requete = new Request("http://localhost:3001/deconnexion");
    assert.equal(originePublique(requete), "http://localhost:3001");
  });
});

describe("expirerCookieSession", () => {
  it("envoie les deux variantes Secure pour que le navigateur efface le témoin", () => {
    const enTetes = new Headers();
    expirerCookieSession(enTetes);
    const poses = enTetes.getSetCookie();
    assert.equal(poses.length, 2);
    assert.ok(poses.every((c) => c.startsWith(`${NOM_COOKIE}=`)));
    assert.ok(poses.every((c) => c.includes("Path=/") && c.includes("Max-Age=0")));
    assert.ok(poses.some((c) => c.includes("Secure")));
    assert.ok(poses.some((c) => !c.includes("Secure")));
  });
});
