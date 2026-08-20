import { eq } from "drizzle-orm";
import { db } from "@/db";
import {
  actionsCorrectives,
  centres,
  codages,
  documents,
  ecarts,
  evenementsIndesirables,
  evenementsQuery,
  etudes,
  formulairesCrf,
  itemsChecklistMonitoring,
  jalons,
  membresEtude,
  modelesVisite,
  notifications,
  parametresApp,
  plansDataManagement,
  queries,
  resultatsChecklistMonitoring,
  revuesDonnees,
  sectionsCrf,
  sujets,
  taches,
  utilisateurs,
  valeursCrf,
  variablesCrf,
  visites,
  visitesSujet,
} from "@/db/schema";
import { hacherMotDePasse } from "@/lib/auth";
import { CHECKLIST_MONITORING_DEFAUT } from "@/lib/constantes";
import { COMPTES_DEMO, MOT_DE_PASSE_DEMO } from "@/lib/demo";

export { COMPTES_DEMO, MOT_DE_PASSE_DEMO };

const j = (decalageJours: number, heures = 9) => {
  const d = new Date();
  d.setHours(heures, 0, 0, 0);
  d.setDate(d.getDate() + decalageJours);
  return Math.floor(d.getTime() / 1000);
};

function dejaChargee(): boolean {
  const ligne = db
    .select()
    .from(parametresApp)
    .where(eq(parametresApp.cle, "demo_chargee"))
    .get();
  return ligne?.valeur === "1";
}

function marquerChargee(valeur: "1" | "0") {
  const existante = db
    .select()
    .from(parametresApp)
    .where(eq(parametresApp.cle, "demo_chargee"))
    .get();
  if (existante) {
    db.update(parametresApp)
      .set({ valeur, modifieLe: Math.floor(Date.now() / 1000) })
      .where(eq(parametresApp.cle, "demo_chargee"))
      .run();
  } else {
    db.insert(parametresApp).values({ cle: "demo_chargee", valeur }).run();
  }
}

/** Supprime uniquement les objets marqués comme démonstration. */
export function supprimerDonneesDemo(): void {
  const etudesDemo = db.select({ id: etudes.id }).from(etudes).where(eq(etudes.estDemo, true)).all();
  for (const e of etudesDemo) {
    db.delete(etudes).where(eq(etudes.id, e.id)).run();
  }
  const usersDemo = db
    .select({ id: utilisateurs.id })
    .from(utilisateurs)
    .where(eq(utilisateurs.estDemo, true))
    .all();
  for (const u of usersDemo) {
    db.delete(utilisateurs).where(eq(utilisateurs.id, u.id)).run();
  }
  marquerChargee("0");
}

export function chargerDonneesDemo(options: { forcer?: boolean } = {}): {
  chargee: boolean;
  message: string;
} {
  const demoExistante =
    db.select({ id: etudes.id }).from(etudes).where(eq(etudes.estDemo, true)).all().length > 0;
  if ((dejaChargee() || demoExistante) && !options.forcer) {
    return { chargee: false, message: "Les données de démonstration sont déjà présentes." };
  }
  if (options.forcer || demoExistante) supprimerDonneesDemo();
  insererJeu();
  marquerChargee("1");
  return { chargee: true, message: "Jeu de démonstration chargé." };
}

export function chargerDonneesDemoSiBesoin(): void {
  if (process.env.CHARGER_DEMO === "1" && !dejaChargee()) {
    chargerDonneesDemo();
  }
}

function insererJeu() {
  const hash = hacherMotDePasse(MOT_DE_PASSE_DEMO);

  const idsUsers: Record<string, number> = {};
  for (const c of COMPTES_DEMO) {
    const existant = db
      .select({ id: utilisateurs.id })
      .from(utilisateurs)
      .where(eq(utilisateurs.email, c.email))
      .get();
    if (existant) {
      idsUsers[c.role + c.email] = existant.id;
      idsUsers[c.email] = existant.id;
      continue;
    }
    const cree = db
      .insert(utilisateurs)
      .values({
        email: c.email,
        nom: c.nom,
        motDePasse: hash,
        role: c.role,
        superAdmin: c.superAdmin,
        estDemo: true,
        actif: true,
      })
      .returning({ id: utilisateurs.id })
      .get();
    idsUsers[c.email] = cree.id;
  }

  const idCp = idsUsers["julia.martin@demo.vigie.local"];
  const idDm = idsUsers["lucas.bernard@demo.vigie.local"];
  const idArc = idsUsers["lea.moreau@demo.vigie.local"];
  const idInv = idsUsers["nicolas.petit@demo.vigie.local"];
  const idLect = idsUsers["claire.dupont@demo.vigie.local"];

  const aurora = db
    .insert(etudes)
    .values({
      proprietaireId: idCp,
      nom: "[DÉMO] AURORA — sédation par isoflurane en réanimation",
      code: "AURORA",
      client: "Promoteur académique (démonstration)",
      description:
        "Étude de démonstration. Aucun patient réel. Données fictives et anonymisées destinées à tester l'outil.",
      couleur: "#0d9488",
      statut: "active",
      promoteur: "CHU de démonstration",
      investigateur: "Pr Nicolas Petit",
      phase: "III",
      indication: "Sédation en réanimation",
      populationCible: "Adultes ventilés, 18 ans et plus",
      nbCentresPrevu: 8,
      nbSujetsPrevu: 120,
      chefProjetId: idCp,
      arcReferentId: idArc,
      dataManagerId: idDm,
      versionProtocole: "v2.1 du 12/03/2026",
      idRcb: "2026-A01234-56",
      numeroCtis: "2026-501234-22-00",
      numeroCpp: "CPP-OUEST-26-014",
      dateDebut: j(-180),
      dateFin: j(200),
      reglementations: JSON.stringify(["riph1", "ich_e6r3", "cnil_mr001"]),
      estDemo: true,
      onboardingEtape: 7,
    })
    .returning({ id: etudes.id })
    .get();

  const canna = db
    .insert(etudes)
    .values({
      proprietaireId: idCp,
      nom: "[DÉMO] CANNA-BICH — cannabidiol et douleurs neuropathiques",
      code: "CANNA-BICH",
      client: "BioPharm Démo",
      description:
        "Étude de démonstration clairement identifiée. Sert notamment à tester la recherche globale (tapez CANNA-BICH).",
      couleur: "#7c3aed",
      statut: "active",
      promoteur: "BioPharm Démo SAS",
      investigateur: "Dr Léa Moreau",
      phase: "II",
      indication: "Douleurs neuropathiques périphériques",
      populationCible: "Adultes, 18-75 ans",
      nbCentresPrevu: 3,
      nbSujetsPrevu: 45,
      chefProjetId: idCp,
      arcReferentId: idArc,
      dataManagerId: idDm,
      versionProtocole: "v1.0 du 02/01/2026",
      idRcb: "2026-A00098-11",
      dateDebut: j(-90),
      dateFin: j(270),
      reglementations: JSON.stringify(["riph2", "ich_e6r3"]),
      estDemo: true,
      onboardingEtape: 7,
    })
    .returning({ id: etudes.id })
    .get();

  const etudeId = aurora.id;

  for (const uid of [idCp, idDm, idArc, idInv, idLect]) {
    for (const eid of [etudeId, canna.id]) {
      db.insert(membresEtude)
        .values({
          etudeId: eid,
          utilisateurId: uid,
          role:
            uid === idCp
              ? "chef_projet"
              : uid === idDm
                ? "data_manager"
                : uid === idArc
                  ? "arc"
                  : uid === idInv
                    ? "investigateur"
                    : "lecture_seule",
        })
        .run();
    }
  }

  const c1 = db
    .insert(centres)
    .values({
      proprietaireId: idCp,
      etudeId,
      numero: "01",
      nom: "CHU de Brest — Réanimation médicale",
      etablissement: "CHU de Brest",
      investigateurPrincipal: "Pr Nicolas Petit",
      investigateurId: idInv,
      email: "recherche.reanimation@demo.vigie.local",
      telephone: "02 98 00 00 01",
      statut: "actif",
      dateActivation: j(-160),
      objectifInclusion: 40,
      risque: "modere",
    })
    .returning({ id: centres.id })
    .get();

  const c2 = db
    .insert(centres)
    .values({
      proprietaireId: idCp,
      etudeId,
      numero: "02",
      nom: "CHU de Rennes — Réanimation chirurgicale",
      etablissement: "CHU de Rennes",
      investigateurPrincipal: "Dr Anne Le Gall",
      email: "recherche.rennes@demo.vigie.local",
      statut: "actif",
      dateActivation: j(-140),
      objectifInclusion: 50,
      risque: "eleve",
      notes: "Inclusion en deçà de la courbe — à revoir en visite.",
    })
    .returning({ id: centres.id })
    .get();

  const c3 = db
    .insert(centres)
    .values({
      proprietaireId: idCp,
      etudeId,
      numero: "03",
      nom: "CH de Quimper — Soins critiques",
      etablissement: "CH de Quimper",
      investigateurPrincipal: "Dr Yves Le Roux",
      statut: "en_mise_en_place",
      objectifInclusion: 30,
      risque: "faible",
    })
    .returning({ id: centres.id })
    .get();

  db.insert(centres)
    .values({
      proprietaireId: idCp,
      etudeId: canna.id,
      numero: "01",
      nom: "Centre de la douleur — Brest",
      etablissement: "CHU de Brest",
      investigateurPrincipal: "Dr Léa Moreau",
      statut: "actif",
      dateActivation: j(-80),
      objectifInclusion: 20,
      risque: "faible",
    })
    .run();

  const modeles = [
    { code: "SCR", nom: "Screening", type: "screening", ordre: 1, min: -7, max: 0 },
    { code: "J0", nom: "Inclusion / J0", type: "inclusion", ordre: 2, min: 0, max: 0 },
    { code: "J1", nom: "Visite J1", type: "traitement", ordre: 3, min: 1, max: 1 },
    { code: "J7", nom: "Visite J7", type: "traitement", ordre: 4, min: 5, max: 9 },
    { code: "J28", nom: "Fin de traitement", type: "fin_traitement", ordre: 5, min: 26, max: 30 },
    { code: "M3", nom: "Follow-up M3", type: "suivi", ordre: 6, min: 80, max: 100 },
  ];
  const idsModeles: number[] = [];
  for (const m of modeles) {
    const cree = db
      .insert(modelesVisite)
      .values({
        etudeId,
        code: m.code,
        nom: m.nom,
        type: m.type,
        ordre: m.ordre,
        fenetreMinJours: m.min,
        fenetreMaxJours: m.max,
      })
      .returning({ id: modelesVisite.id })
      .get();
    idsModeles.push(cree.id);
  }

  const form = db
    .insert(formulairesCrf)
    .values({
      etudeId,
      code: "VS",
      nom: "Signes vitaux",
      ordre: 1,
      description: "Pression, fréquence, température — formulaire de démonstration.",
    })
    .returning({ id: formulairesCrf.id })
    .get();
  const sec = db
    .insert(sectionsCrf)
    .values({ formulaireId: form.id, nom: "Mesures", ordre: 1 })
    .returning({ id: sectionsCrf.id })
    .get();
  const vars = [
    { code: "SYS", nom: "Pression systolique (mmHg)", type: "nombre", min: 70, max: 220, obl: true },
    { code: "DIA", nom: "Pression diastolique (mmHg)", type: "nombre", min: 40, max: 130, obl: true },
    { code: "FC", nom: "Fréquence cardiaque", type: "nombre", min: 30, max: 200, obl: true },
    { code: "TEMP", nom: "Température (°C)", type: "nombre", min: 34, max: 42, obl: false },
  ];
  const idsVars: number[] = [];
  vars.forEach((v, i) => {
    const cree = db
      .insert(variablesCrf)
      .values({
        sectionId: sec.id,
        code: v.code,
        nom: v.nom,
        type: v.type,
        min: v.min,
        max: v.max,
        obligatoire: v.obl,
        ordre: i + 1,
      })
      .returning({ id: variablesCrf.id })
      .get();
    idsVars.push(cree.id);
  });

  db.insert(plansDataManagement)
    .values({
      etudeId,
      version: "1.2",
      datePlan: j(-100),
      responsableId: idDm,
      statut: "valide",
      valideLe: j(-90),
      validePar: idCp,
      notes: "DMP de démonstration. Pas un document réglementaire opposable.",
    })
    .run();

  for (const [i, item] of CHECKLIST_MONITORING_DEFAUT.entries()) {
    db.insert(itemsChecklistMonitoring)
      .values({
        etudeId,
        cle: item.cle,
        libelle: item.libelle,
        categorie: item.categorie,
        ordre: i + 1,
      })
      .run();
  }

  const statutsSujet = [
    "inclus",
    "en_cours",
    "en_cours",
    "screen_failure",
    "en_cours",
    "suivi",
    "en_cours",
    "sortie_etude",
    "inclus",
    "en_cours",
  ];
  const idsSujets: { id: number; centreId: number; code: string }[] = [];
  for (let i = 1; i <= 18; i++) {
    const centreId = i <= 10 ? c1.id : i <= 16 ? c2.id : c3.id;
    const code = `SUBJ-${String(10000 + i).slice(1)}`;
    const statut = statutsSujet[(i - 1) % statutsSujet.length];
    const cree = db
      .insert(sujets)
      .values({
        proprietaireId: idCp,
        etudeId,
        centreId,
        subjectId: code,
        statut,
        dateScreening: j(-150 + i * 4),
        dateInclusion: statut === "screen_failure" ? null : j(-148 + i * 4),
        bras: i % 2 === 0 ? "A" : "B",
        statutDonnees: i % 5 === 0 ? "queries_ouvertes" : i % 7 === 0 ? "en_retard" : "a_jour",
      })
      .returning({ id: sujets.id })
      .get();
    idsSujets.push({ id: cree.id, centreId, code });
  }

  const idsVisitesSujet: number[] = [];
  for (const s of idsSujets.slice(0, 12)) {
    idsModeles.forEach((mid, idx) => {
      const prevue = j(-140 + idsSujets.indexOf(s) * 4 + modeles[idx].min);
      let statut = "realisee";
      if (idx >= 4) statut = prevue < j(0) ? "en_retard" : "prevue";
      if (s.code.endsWith("004") && idx > 0) return;
      const cree = db
        .insert(visitesSujet)
        .values({
          etudeId,
          sujetId: s.id,
          centreId: s.centreId,
          modeleId: mid,
          nom: modeles[idx].nom,
          datePrevue: prevue,
          dateReelle: statut === "realisee" ? prevue + 3600 : null,
          statut,
        })
        .returning({ id: visitesSujet.id })
        .get();
      idsVisitesSujet.push(cree.id);

      if (statut === "realisee") {
        idsVars.forEach((vid, vi) => {
          const manquante = s.code.endsWith("005") && vi === 3;
          const aberrante = s.code.endsWith("007") && vi === 0;
          db.insert(valeursCrf)
            .values({
              visiteSujetId: cree.id,
              variableId: vid,
              valeur: manquante ? null : aberrante ? "260" : String(110 - vi * 10),
              statut: manquante ? "vide" : aberrante ? "a_revoir" : "saisie",
              saisiPar: idInv,
              saisiLe: prevue,
            })
            .run();
        });
      }
    });
  }

  const q1 = db
    .insert(queries)
    .values({
      proprietaireId: idDm,
      code: "QUERY-0001",
      etudeId,
      centreId: c1.id,
      sujetId: idsSujets[4].id,
      visiteSujetId: idsVisitesSujet[0],
      formulaireId: form.id,
      variableId: idsVars[3],
      type: "manquant",
      description: "Température non renseignée à la visite J0.",
      statut: "open",
      auteurId: idDm,
    })
    .returning({ id: queries.id })
    .get();
  db.insert(evenementsQuery)
    .values({
      queryId: q1.id,
      auteurId: idDm,
      action: "creation",
      nouveauStatut: "open",
      commentaire: "Donnée manquante détectée à la revue.",
    })
    .run();

  const q2 = db
    .insert(queries)
    .values({
      proprietaireId: idDm,
      code: "QUERY-0002",
      etudeId,
      centreId: c1.id,
      sujetId: idsSujets[6].id,
      type: "aberrant",
      description: "Pression systolique 260 mmHg — confirmer ou corriger.",
      statut: "answered",
      auteurId: idDm,
      reponse: "Erreur de saisie, valeur réelle 126 mmHg. Corrigé dans le CRF.",
      reponduPar: idInv,
      reponduLe: j(-2),
    })
    .returning({ id: queries.id })
    .get();
  db.insert(evenementsQuery)
    .values({
      queryId: q2.id,
      auteurId: idInv,
      action: "repondre",
      ancienStatut: "open",
      nouveauStatut: "answered",
      commentaire: "Erreur de saisie, valeur réelle 126 mmHg.",
    })
    .run();

  db.insert(queries)
    .values({
      proprietaireId: idDm,
      code: "QUERY-0003",
      etudeId,
      centreId: c2.id,
      sujetId: idsSujets[11].id,
      type: "clarification",
      description: "Date d'inclusion antérieure à la date de consentement — merci de justifier.",
      statut: "reopened",
      auteurId: idDm,
    })
    .run();

  db.insert(queries)
    .values({
      proprietaireId: idDm,
      code: "QUERY-0004",
      etudeId,
      centreId: c1.id,
      sujetId: idsSujets[0].id,
      type: "incoherent",
      description: "Poids incohérent entre screening et J0.",
      statut: "resolved",
      auteurId: idDm,
      resoluPar: idDm,
      resoluLe: j(-5),
    })
    .run();

  db.insert(revuesDonnees)
    .values({
      etudeId,
      sujetId: idsSujets[4].id,
      variableId: idsVars[3],
      type: "manquant",
      statut: "a_faire",
      description: "TEMP manquante — SUBJ-00005 / J0",
      assigneeId: idDm,
    })
    .run();
  db.insert(revuesDonnees)
    .values({
      etudeId,
      sujetId: idsSujets[6].id,
      variableId: idsVars[0],
      type: "aberrant",
      statut: "en_cours",
      description: "SYS = 260 mmHg — SUBJ-00007",
      assigneeId: idDm,
    })
    .run();

  db.insert(codages)
    .values({
      etudeId,
      sujetId: idsSujets[0].id,
      type: "evenement",
      termeSource: "Maux de tête au réveil",
      statut: "a_coder",
      dictionnaire: "MedDRA (non fourni — à coder dans l'outil promoteur)",
    })
    .run();

  const vMon = db
    .insert(visites)
    .values({
      proprietaireId: idArc,
      etudeId,
      type: "routine",
      centre: "01 — CHU de Brest",
      centreId: c1.id,
      monitorNom: "Léa Moreau",
      arcId: idArc,
      datePrevue: j(1),
      statut: "planifiee",
      dureeMinutes: 360,
    })
    .returning({ id: visites.id })
    .get();

  db.insert(visites)
    .values({
      proprietaireId: idArc,
      etudeId,
      type: "routine",
      centre: "02 — CHU de Rennes",
      centreId: c2.id,
      monitorNom: "Léa Moreau",
      arcId: idArc,
      datePrevue: j(-14),
      dateRealisee: j(-14),
      statut: "rapport_redige",
      dureeMinutes: 420,
      rapport: "Inclusion en retard. Deux consentements à revérifier. Lettre de suivi à envoyer.",
    })
    .run();

  const items = db.select().from(itemsChecklistMonitoring).where(eq(itemsChecklistMonitoring.etudeId, etudeId)).all();
  for (const it of items) {
    db.insert(resultatsChecklistMonitoring)
      .values({
        visiteId: vMon.id,
        itemId: it.id,
        statut: "a_verifier",
      })
      .run();
  }

  const ecart = db
    .insert(ecarts)
    .values({
      proprietaireId: idArc,
      etudeId,
      reference: "DEV-001",
      titre: "Visite J7 réalisée hors fenêtre",
      description: "Sujet SUBJ-00003 : visite J7 à J11 (fenêtre J5–J9).",
      centre: "01",
      categorie: "protocole",
      gravite: "mineur",
      dateConstat: j(-20),
      statut: "en_cours",
      sujetId: idsSujets[2].id,
      impact: "Pas d'impact sécurité identifié. Donnée à documenter.",
      actionCorrective: "Revoir le calendrier avec le TEC du centre.",
      responsableId: idArc,
    })
    .returning({ id: ecarts.id })
    .get();

  db.insert(actionsCorrectives)
    .values({
      proprietaireId: idArc,
      etudeId,
      ecartId: ecart.id,
      nature: "corrective",
      titre: "Former le TEC du centre 01 au calendrier des visites",
      responsable: "Léa Moreau",
      echeance: j(10),
      statut: "en_cours",
      origine: "déviation DEV-001",
    })
    .run();

  db.insert(evenementsIndesirables)
    .values({
      proprietaireId: idArc,
      etudeId,
      centreId: c1.id,
      sujetId: idsSujets[1].id,
      code: "AE-0001",
      type: "ae",
      terme: "Hypotension transitoire",
      dateDebut: j(-40),
      dateFin: j(-39),
      gravite: "moderee",
      seriousness: "non_serieux",
      expectedness: "attendu",
      causalite: "possible",
      statut: "resolu",
      description:
        "Suivi projet. Ceci n'est pas une déclaration réglementaire. Les EIG se déclarent dans le système de vigilance du promoteur.",
    })
    .run();

  db.insert(jalons)
    .values([
      {
        proprietaireId: idCp,
        etudeId,
        nom: "Première inclusion (FPI)",
        type: "inclusion",
        datePrevue: j(-148),
        dateReelle: j(-148),
        statut: "atteint",
      },
      {
        proprietaireId: idCp,
        etudeId,
        nom: "Fin de période d'inclusion",
        type: "inclusion",
        datePrevue: j(40),
        statut: "a_venir",
        responsableId: idCp,
      },
      {
        proprietaireId: idCp,
        etudeId,
        nom: "Database lock",
        type: "gel_base",
        datePrevue: j(180),
        statut: "a_venir",
        responsableId: idDm,
      },
      {
        proprietaireId: idCp,
        etudeId,
        nom: "Fin d'étude",
        type: "fin_etude",
        datePrevue: j(200),
        statut: "a_venir",
      },
    ])
    .run();

  db.insert(taches)
    .values([
      {
        proprietaireId: idCp,
        etudeId,
        titre: "Relancer le centre 02 sur les inclusions",
        statut: "en_cours",
        priorite: "haute",
        assigneeId: idArc,
        echeance: j(-1),
        source: "monitoring",
      },
      {
        proprietaireId: idDm,
        etudeId,
        titre: "Clôturer QUERY-0002 après vérification CRF",
        statut: "a_faire",
        priorite: "normale",
        assigneeId: idDm,
        echeance: j(3),
        source: "query",
        objetType: "query",
        objetId: q2.id,
      },
      {
        proprietaireId: idCp,
        etudeId,
        titre: "Préparer le COPIL de septembre",
        statut: "a_faire",
        priorite: "normale",
        assigneeId: idCp,
        echeance: j(12),
        source: "manuel",
      },
    ])
    .run();

  db.insert(documents)
    .values([
      {
        proprietaireId: idCp,
        etudeId,
        nom: "[DÉMO] Protocole AURORA v2.1",
        categorie: "protocole",
        version: "2.1",
        nomFichier: "demo-protocole.txt",
        nomOriginal: "Protocole-AURORA-v2.1.pdf",
        taille: 12,
        typeMime: "text/plain",
        statut: "en_vigueur",
        zone: "tmf_central",
        dateDocument: j(-80),
      },
      {
        proprietaireId: idCp,
        etudeId,
        nom: "[DÉMO] Assurance — expire bientôt",
        categorie: "assurance",
        version: "2026",
        nomFichier: "demo-assurance.txt",
        nomOriginal: "Attestation-assurance.pdf",
        taille: 8,
        typeMime: "text/plain",
        statut: "en_vigueur",
        expiration: j(20),
        zone: "tmf_central",
      },
    ])
    .run();

  for (const uid of [idCp, idDm, idArc, idInv]) {
    db.insert(notifications)
      .values({
        utilisateurId: uid,
        type: "demo",
        titre: "Jeu de démonstration chargé",
        message:
          "Les données préfixées [DÉMO] sont fictives. Vous pouvez les réinitialiser depuis Administration.",
        lien: "/administration",
      })
      .run();
  }

  db.insert(notifications)
    .values({
      utilisateurId: idDm,
      type: "query",
      titre: "QUERY-0001 nécessite une réponse",
      message: "Température manquante — SUBJ-00005.",
      lien: "/data-management/queries",
      objetType: "query",
      objetId: q1.id,
    })
    .run();

  db.insert(notifications)
    .values({
      utilisateurId: idArc,
      type: "monitoring",
      titre: "Visite de monitoring demain — centre 01",
      message: "CHU de Brest, visite de routine.",
      lien: "/visites",
      objetType: "visite",
      objetId: vMon.id,
    })
    .run();

  db.insert(notifications)
    .values({
      utilisateurId: idCp,
      type: "tache",
      titre: "Tâche en retard",
      message: "Relancer le centre 02 sur les inclusions.",
      lien: "/missions",
    })
    .run();
}
