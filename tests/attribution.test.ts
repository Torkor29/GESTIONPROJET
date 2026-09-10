import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { droitsSurMission, missionEstVisiblePour } from "../src/lib/attribution";

const proprio = 1;
const invitee = 2;
const autre = 3;
const etude = 10;

describe("missionEstVisiblePour", () => {
  it("le propriétaire de l'étude voit toutes les missions, attribuées ou non", () => {
    assert.equal(
      missionEstVisiblePour({
        utilisateurId: proprio,
        proprietaireId: proprio,
        assigneA: invitee,
        etudeId: etude,
        idsEtudesPossedees: [etude],
      }),
      true,
    );
    assert.equal(
      missionEstVisiblePour({
        utilisateurId: proprio,
        proprietaireId: proprio,
        assigneA: null,
        etudeId: etude,
        idsEtudesPossedees: [etude],
      }),
      true,
    );
  });

  it("une personne conviée ne voit que les missions qui lui sont attribuées", () => {
    assert.equal(
      missionEstVisiblePour({
        utilisateurId: invitee,
        proprietaireId: proprio,
        assigneA: invitee,
        etudeId: etude,
        idsEtudesPossedees: [],
      }),
      true,
    );
    assert.equal(
      missionEstVisiblePour({
        utilisateurId: invitee,
        proprietaireId: proprio,
        assigneA: null,
        etudeId: etude,
        idsEtudesPossedees: [],
      }),
      false,
    );
    assert.equal(
      missionEstVisiblePour({
        utilisateurId: invitee,
        proprietaireId: proprio,
        assigneA: autre,
        etudeId: etude,
        idsEtudesPossedees: [],
      }),
      false,
    );
  });

  it("une mission sans étude reste chez son auteur", () => {
    assert.equal(
      missionEstVisiblePour({
        utilisateurId: proprio,
        proprietaireId: proprio,
        assigneA: null,
        etudeId: null,
        idsEtudesPossedees: [],
      }),
      true,
    );
    assert.equal(
      missionEstVisiblePour({
        utilisateurId: invitee,
        proprietaireId: proprio,
        assigneA: null,
        etudeId: null,
        idsEtudesPossedees: [],
      }),
      false,
    );
  });
});

describe("droitsSurMission", () => {
  it("le propriétaire gère, la personne attribuée en écriture avance sans réattribuer", () => {
    const duProprio = droitsSurMission({
      utilisateurId: proprio,
      proprietaireId: proprio,
      etudeId: etude,
      etudeProprietaireId: proprio,
      assigneA: invitee,
      niveauPartage: null,
    });
    assert.deepEqual(duProprio, { peutGerer: true, peutEcrire: true });

    const deLInvitee = droitsSurMission({
      utilisateurId: invitee,
      proprietaireId: proprio,
      etudeId: etude,
      etudeProprietaireId: proprio,
      assigneA: invitee,
      niveauPartage: "ecriture",
    });
    assert.deepEqual(deLInvitee, { peutGerer: false, peutEcrire: true });
  });

  it("un accès en lecture ne permet pas d'avancer la mission", () => {
    const lecture = droitsSurMission({
      utilisateurId: invitee,
      proprietaireId: proprio,
      etudeId: etude,
      etudeProprietaireId: proprio,
      assigneA: invitee,
      niveauPartage: "lecture",
    });
    assert.deepEqual(lecture, { peutGerer: false, peutEcrire: false });
  });
});
