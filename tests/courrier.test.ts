import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { redigerCourrierAttribution } from "../src/lib/courrier-attribution";
import { doitPrevenirAttribution, estBoiteGmail, lireCompteSmtp } from "../src/lib/courrier";
import { formaterDate } from "../src/lib/format";

describe("estBoiteGmail", () => {
  it("reconnaît gmail.com et googlemail.com, sans tenir compte de la casse", () => {
    assert.equal(estBoiteGmail("marie.dupont@gmail.com"), true);
    assert.equal(estBoiteGmail("Marie.Dupont@Gmail.COM"), true);
    assert.equal(estBoiteGmail("marie@googlemail.com"), true);
    assert.equal(estBoiteGmail("marie@chu-brest.fr"), false);
    assert.equal(estBoiteGmail("marie@gmail.com.evil.example"), false);
  });
});

describe("lireCompteSmtp", () => {
  it("déduit smtp.gmail.com:587 d'une adresse Gmail", () => {
    const compte = lireCompteSmtp({
      SMTP_USER: "  marie.dupont@gmail.com  ",
      SMTP_MOT_DE_PASSE: "abcd efgh ijkl mnop",
    });
    assert.deepEqual(compte, {
      hote: "smtp.gmail.com",
      port: 587,
      utilisateur: "marie.dupont@gmail.com",
      motDePasse: "abcdefghijklmnop",
      de: "marie.dupont@gmail.com",
    });
  });

  it("n'est pas configuré sans mot de passe, ni sans adresse", () => {
    assert.equal(lireCompteSmtp({ SMTP_USER: "marie@gmail.com" }), null);
    assert.equal(lireCompteSmtp({ SMTP_MOT_DE_PASSE: "abcdefghijklmnop" }), null);
    assert.equal(lireCompteSmtp({}), null);
  });

  it("refuse une messagerie hors Gmail sans hôte", () => {
    assert.equal(
      lireCompteSmtp({
        SMTP_USER: "arc@chu-brest.fr",
        SMTP_MOT_DE_PASSE: "secret",
      }),
      null,
    );
  });

  it("accepte une autre messagerie dès que l'hôte est donné", () => {
    const compte = lireCompteSmtp({
      SMTP_USER: "arc@chu-brest.fr",
      SMTP_MOT_DE_PASSE: "secret",
      SMTP_HOTE: "smtp.chu-brest.fr",
      SMTP_PORT: "465",
      SMTP_DE: "vigie@chu-brest.fr",
    });
    assert.deepEqual(compte, {
      hote: "smtp.chu-brest.fr",
      port: 465,
      utilisateur: "arc@chu-brest.fr",
      motDePasse: "secret",
      de: "vigie@chu-brest.fr",
    });
  });

  it("laisse forcer l'hôte Gmail (Workspace sur un autre domaine)", () => {
    const compte = lireCompteSmtp({
      SMTP_USER: "arc@chu-brest.fr",
      SMTP_MOT_DE_PASSE: "abcdefghijklmnop",
      SMTP_HOTE: "smtp.gmail.com",
    });
    assert.equal(compte?.hote, "smtp.gmail.com");
    assert.equal(compte?.port, 587);
  });

  it("reprend le port 587 si la valeur n'est pas un entier positif", () => {
    const compte = lireCompteSmtp({
      SMTP_USER: "marie@gmail.com",
      SMTP_MOT_DE_PASSE: "abcdefghijklmnop",
      SMTP_PORT: "abc",
    });
    assert.equal(compte?.port, 587);
  });
});

describe("doitPrevenirAttribution", () => {
  it("n'écrit que si la personne change, et n'est pas soi-même", () => {
    assert.equal(doitPrevenirAttribution(2, null, 1), true);
    assert.equal(doitPrevenirAttribution(2, 3, 1), true);
    assert.equal(doitPrevenirAttribution(2, 2, 1), false);
    assert.equal(doitPrevenirAttribution(1, null, 1), false);
    assert.equal(doitPrevenirAttribution(null, 2, 1), false);
    assert.equal(doitPrevenirAttribution(null, null, 1), false);
  });
});

describe("redigerCourrierAttribution", () => {
  const echeance = 1_788_998_400;

  it("porte le titre, l'étude, l'échéance, la priorité, le commentaire et le lien", () => {
    const { sujet, texte } = redigerCourrierAttribution({
      destinataireNom: "Jean Martin",
      parNom: "Marie Dupont",
      titre: "Déclaration de fin d'étude à l'ANSM",
      notes: "Penser au CERFA.",
      priorite: "haute",
      echeance,
      etudes: [{ nom: "Étude Alpha", code: "ALP-01" }],
      href: "https://projets.example.fr/etudes/4?section=missions",
    });

    assert.equal(sujet, "Mission attribuée : Déclaration de fin d'étude à l'ANSM");
    assert.match(texte, /Bonjour Jean Martin/);
    assert.match(texte, /Marie Dupont vous a attribué une mission/);
    assert.match(texte, /Mission : Déclaration de fin d'étude à l'ANSM/);
    assert.match(texte, /Étude : ALP-01 — Étude Alpha/);
    assert.match(texte, new RegExp(`Échéance : ${formaterDate(echeance)}`));
    assert.match(texte, /Priorité : Haute/);
    assert.match(texte, /Commentaire :\nPenser au CERFA\./);
    assert.match(texte, /https:\/\/projets\.example\.fr\/etudes\/4\?section=missions/);
    assert.match(texte, /Vigie Clinique/);
  });

  it("omet le commentaire vide et aligne plusieurs études", () => {
    const { texte } = redigerCourrierAttribution({
      destinataireNom: "Jean Martin",
      parNom: "Marie Dupont",
      titre: "Relance promoteur",
      notes: "   ",
      priorite: "normale",
      echeance: null,
      etudes: [
        { nom: "Alpha", code: "ALP-01" },
        { nom: "Beta", code: null },
      ],
      href: "https://projets.example.fr/missions",
    });

    assert.doesNotMatch(texte, /Commentaire/);
    assert.match(texte, /Études :\n  ALP-01 — Alpha\n  Beta/);
    assert.match(texte, /Échéance : —/);
    assert.match(texte, /https:\/\/projets\.example\.fr\/missions/);
  });
});
