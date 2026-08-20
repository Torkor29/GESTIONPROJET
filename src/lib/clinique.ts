import "server-only";
import { and, asc, desc, eq, like, or, sql } from "drizzle-orm";
import { db } from "@/db";
import {
  centres,
  codages,
  ecarts,
  evenementsIndesirables,
  evenementsQuery,
  etudes,
  formulairesCrf,
  jalons,
  journauxAudit,
  modelesVisite,
  notifications,
  plansDataManagement,
  queries,
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
import { etudeAccessible, idsEtudesAccessibles } from "@/lib/acces";
import { utilisateurActuel } from "@/lib/auth";
import { cache } from "react";
import { queryOuverte } from "@/lib/queries-workflow";

const moi = cache(async (): Promise<number> => {
  const compte = await utilisateurActuel();
  if (!compte) throw new Error("Session expirée. Reconnectez-vous.");
  return compte.id;
});

function etudeOk(etudeId: number | null | undefined, utilisateurId: number) {
  if (!etudeId) return sql`1=1`;
  return sql`${etudeId} in ${idsEtudesAccessibles(utilisateurId)}`;
}

export async function listerCentres(filtre: { etudeId?: number } = {}) {
  const id = await moi();
  return db
    .select({
      centre: centres,
      etudeNom: etudes.nom,
      etudeCode: etudes.code,
      etudeCouleur: etudes.couleur,
    })
    .from(centres)
    .innerJoin(etudes, eq(centres.etudeId, etudes.id))
    .where(
      and(
        etudeAccessible(etudes.id, id),
        filtre.etudeId ? eq(centres.etudeId, filtre.etudeId) : undefined,
      ),
    )
    .orderBy(asc(centres.etudeId), asc(centres.numero));
}

export async function centreParId(idCentre: number) {
  const id = await moi();
  const [ligne] = await db
    .select()
    .from(centres)
    .where(and(eq(centres.id, idCentre), etudeOk(undefined, id), sql`${centres.etudeId} in ${idsEtudesAccessibles(id)}`))
    .limit(1);
  return ligne ?? null;
}

export async function inclusionsParCentre(etudeId?: number) {
  const id = await moi();
  return db
    .select({
      centreId: sujets.centreId,
      n: sql<number>`count(*)`.as("n"),
      inclus: sql<number>`sum(case when ${sujets.statut} not in ('screen_failure','pre_screening','screening') then 1 else 0 end)`.as(
        "inclus",
      ),
    })
    .from(sujets)
    .where(
      and(
        sql`${sujets.etudeId} in ${idsEtudesAccessibles(id)}`,
        etudeId ? eq(sujets.etudeId, etudeId) : undefined,
      ),
    )
    .groupBy(sujets.centreId);
}

export async function listerSujets(filtre: { etudeId?: number; centreId?: number; q?: string } = {}) {
  const id = await moi();
  const conditions = [sql`${sujets.etudeId} in ${idsEtudesAccessibles(id)}`];
  if (filtre.etudeId) conditions.push(eq(sujets.etudeId, filtre.etudeId));
  if (filtre.centreId) conditions.push(eq(sujets.centreId, filtre.centreId));
  if (filtre.q) conditions.push(like(sujets.subjectId, `%${filtre.q}%`));

  return db
    .select({
      sujet: sujets,
      etudeNom: etudes.nom,
      etudeCode: etudes.code,
      centreNom: centres.nom,
      centreNumero: centres.numero,
    })
    .from(sujets)
    .innerJoin(etudes, eq(sujets.etudeId, etudes.id))
    .leftJoin(centres, eq(sujets.centreId, centres.id))
    .where(and(...conditions))
    .orderBy(asc(sujets.subjectId));
}

export async function sujetParId(idSujet: number) {
  const id = await moi();
  const [ligne] = await db
    .select({
      sujet: sujets,
      etude: etudes,
      centre: centres,
    })
    .from(sujets)
    .innerJoin(etudes, eq(sujets.etudeId, etudes.id))
    .leftJoin(centres, eq(sujets.centreId, centres.id))
    .where(and(eq(sujets.id, idSujet), etudeAccessible(etudes.id, id)))
    .limit(1);
  return ligne ?? null;
}

export async function visitesDuSujet(sujetId: number) {
  const id = await moi();
  return db
    .select()
    .from(visitesSujet)
    .where(
      and(eq(visitesSujet.sujetId, sujetId), sql`${visitesSujet.etudeId} in ${idsEtudesAccessibles(id)}`),
    )
    .orderBy(asc(visitesSujet.datePrevue), asc(visitesSujet.id));
}

export async function modelesDEtude(etudeId: number) {
  const id = await moi();
  return db
    .select()
    .from(modelesVisite)
    .where(and(eq(modelesVisite.etudeId, etudeId), sql`${etudeId} in ${idsEtudesAccessibles(id)}`))
    .orderBy(asc(modelesVisite.ordre));
}

export async function listerVisitesSujet(filtre: {
  etudeId?: number;
  centreId?: number;
  statut?: string;
} = {}) {
  const id = await moi();
  return db
    .select({
      visite: visitesSujet,
      subjectId: sujets.subjectId,
      etudeCode: etudes.code,
      centreNumero: centres.numero,
    })
    .from(visitesSujet)
    .innerJoin(etudes, eq(visitesSujet.etudeId, etudes.id))
    .leftJoin(sujets, eq(visitesSujet.sujetId, sujets.id))
    .leftJoin(centres, eq(visitesSujet.centreId, centres.id))
    .where(
      and(
        etudeAccessible(etudes.id, id),
        filtre.etudeId ? eq(visitesSujet.etudeId, filtre.etudeId) : undefined,
        filtre.centreId ? eq(visitesSujet.centreId, filtre.centreId) : undefined,
        filtre.statut ? eq(visitesSujet.statut, filtre.statut) : undefined,
      ),
    )
    .orderBy(asc(visitesSujet.datePrevue));
}

export async function listerQueries(filtre: {
  etudeId?: number;
  statut?: string;
  q?: string;
} = {}) {
  const id = await moi();
  return db
    .select({
      query: queries,
      etudeCode: etudes.code,
      etudeNom: etudes.nom,
      subjectId: sujets.subjectId,
      centreNumero: centres.numero,
      auteurNom: utilisateurs.nom,
    })
    .from(queries)
    .innerJoin(etudes, eq(queries.etudeId, etudes.id))
    .leftJoin(sujets, eq(queries.sujetId, sujets.id))
    .leftJoin(centres, eq(queries.centreId, centres.id))
    .leftJoin(utilisateurs, eq(queries.auteurId, utilisateurs.id))
    .where(
      and(
        etudeAccessible(etudes.id, id),
        filtre.etudeId ? eq(queries.etudeId, filtre.etudeId) : undefined,
        filtre.statut ? eq(queries.statut, filtre.statut) : undefined,
        filtre.q
          ? or(like(queries.code, `%${filtre.q}%`), like(queries.description, `%${filtre.q}%`))
          : undefined,
      ),
    )
    .orderBy(desc(queries.creeLe));
}

export async function queryParId(idQuery: number) {
  const id = await moi();
  const [ligne] = await db
    .select({
      query: queries,
      etude: etudes,
      sujet: sujets,
      centre: centres,
    })
    .from(queries)
    .innerJoin(etudes, eq(queries.etudeId, etudes.id))
    .leftJoin(sujets, eq(queries.sujetId, sujets.id))
    .leftJoin(centres, eq(queries.centreId, centres.id))
    .where(and(eq(queries.id, idQuery), etudeAccessible(etudes.id, id)))
    .limit(1);
  return ligne ?? null;
}

export async function historiqueQuery(queryId: number) {
  return db
    .select({
      evenement: evenementsQuery,
      auteurNom: utilisateurs.nom,
    })
    .from(evenementsQuery)
    .leftJoin(utilisateurs, eq(evenementsQuery.auteurId, utilisateurs.id))
    .where(eq(evenementsQuery.queryId, queryId))
    .orderBy(asc(evenementsQuery.creeLe));
}

export async function listerRevues(filtre: { etudeId?: number } = {}) {
  const id = await moi();
  return db
    .select({
      revue: revuesDonnees,
      etudeCode: etudes.code,
      subjectId: sujets.subjectId,
    })
    .from(revuesDonnees)
    .innerJoin(etudes, eq(revuesDonnees.etudeId, etudes.id))
    .leftJoin(sujets, eq(revuesDonnees.sujetId, sujets.id))
    .where(
      and(
        etudeAccessible(etudes.id, id),
        filtre.etudeId ? eq(revuesDonnees.etudeId, filtre.etudeId) : undefined,
      ),
    )
    .orderBy(asc(revuesDonnees.statut), desc(revuesDonnees.creeLe));
}

export async function listerCrf(etudeId?: number) {
  const id = await moi();
  return db
    .select({
      formulaire: formulairesCrf,
      etudeCode: etudes.code,
    })
    .from(formulairesCrf)
    .innerJoin(etudes, eq(formulairesCrf.etudeId, etudes.id))
    .where(
      and(
        etudeAccessible(etudes.id, id),
        etudeId ? eq(formulairesCrf.etudeId, etudeId) : undefined,
      ),
    )
    .orderBy(asc(formulairesCrf.ordre));
}

export async function detailCrf(formulaireId: number) {
  const formulaire = db.select().from(formulairesCrf).where(eq(formulairesCrf.id, formulaireId)).get();
  if (!formulaire) return null;
  const id = await moi();
  const etude = db.select().from(etudes).where(and(eq(etudes.id, formulaire.etudeId), etudeAccessible(etudes.id, id))).get();
  if (!etude) return null;
  const sections = db
    .select()
    .from(sectionsCrf)
    .where(eq(sectionsCrf.formulaireId, formulaireId))
    .orderBy(asc(sectionsCrf.ordre))
    .all();
  const vars = sections.length
    ? db
        .select()
        .from(variablesCrf)
        .where(
          sql`${variablesCrf.sectionId} in (${sql.raw(sections.map((s) => s.id).join(",") || "0")})`,
        )
        .all()
    : [];
  return { formulaire, etude, sections, variables: vars };
}

export async function listerDmp() {
  const id = await moi();
  return db
    .select({
      plan: plansDataManagement,
      etudeCode: etudes.code,
      etudeNom: etudes.nom,
    })
    .from(plansDataManagement)
    .innerJoin(etudes, eq(plansDataManagement.etudeId, etudes.id))
    .where(etudeAccessible(etudes.id, id))
    .orderBy(desc(plansDataManagement.datePlan));
}

export async function listerCodages() {
  const id = await moi();
  return db
    .select({
      codage: codages,
      etudeCode: etudes.code,
      subjectId: sujets.subjectId,
    })
    .from(codages)
    .innerJoin(etudes, eq(codages.etudeId, etudes.id))
    .leftJoin(sujets, eq(codages.sujetId, sujets.id))
    .where(etudeAccessible(etudes.id, id))
    .orderBy(asc(codages.statut));
}

export async function listerJalons(etudeId?: number) {
  const id = await moi();
  return db
    .select({ jalon: jalons, etudeCode: etudes.code })
    .from(jalons)
    .innerJoin(etudes, eq(jalons.etudeId, etudes.id))
    .where(
      and(etudeAccessible(etudes.id, id), etudeId ? eq(jalons.etudeId, etudeId) : undefined),
    )
    .orderBy(asc(jalons.datePrevue));
}

export async function listerEi() {
  const id = await moi();
  return db
    .select({
      ei: evenementsIndesirables,
      etudeCode: etudes.code,
      subjectId: sujets.subjectId,
      centreNumero: centres.numero,
    })
    .from(evenementsIndesirables)
    .innerJoin(etudes, eq(evenementsIndesirables.etudeId, etudes.id))
    .leftJoin(sujets, eq(evenementsIndesirables.sujetId, sujets.id))
    .leftJoin(centres, eq(evenementsIndesirables.centreId, centres.id))
    .where(etudeAccessible(etudes.id, id))
    .orderBy(desc(evenementsIndesirables.dateDebut));
}

export async function listerNotifications(utilisateurId: number, limite = 30) {
  return db
    .select()
    .from(notifications)
    .where(eq(notifications.utilisateurId, utilisateurId))
    .orderBy(desc(notifications.creeLe))
    .limit(limite);
}

export async function listerAudit(filtre: { etudeId?: number; objetType?: string } = {}) {
  const id = await moi();
  return db
    .select({
      journal: journauxAudit,
      auteurNom: utilisateurs.nom,
    })
    .from(journauxAudit)
    .leftJoin(utilisateurs, eq(journauxAudit.utilisateurId, utilisateurs.id))
    .where(
      and(
        filtre.etudeId
          ? eq(journauxAudit.etudeId, filtre.etudeId)
          : sql`${journauxAudit.etudeId} in ${idsEtudesAccessibles(id)} or ${journauxAudit.etudeId} is null`,
        filtre.objetType ? eq(journauxAudit.objetType, filtre.objetType) : undefined,
      ),
    )
    .orderBy(desc(journauxAudit.creeLe))
    .limit(200);
}

export async function rechercher(q: string) {
  const id = await moi();
  const terme = `%${q.trim()}%`;
  if (q.trim().length < 2) return [];

  const res: { type: string; titre: string; sousTitre: string; href: string }[] = [];

  const e = db
    .select()
    .from(etudes)
    .where(
      and(
        etudeAccessible(etudes.id, id),
        or(like(etudes.nom, terme), like(etudes.code, terme), like(etudes.promoteur, terme)),
      ),
    )
    .limit(8)
    .all();
  for (const x of e) {
    res.push({
      type: "Étude",
      titre: x.code ?? x.nom,
      sousTitre: x.nom,
      href: `/etudes/${x.id}`,
    });
  }

  const s = db
    .select({ sujet: sujets, etudeCode: etudes.code })
    .from(sujets)
    .innerJoin(etudes, eq(sujets.etudeId, etudes.id))
    .where(and(etudeAccessible(etudes.id, id), like(sujets.subjectId, terme)))
    .limit(8)
    .all();
  for (const x of s) {
    res.push({
      type: "Sujet",
      titre: x.sujet.subjectId,
      sousTitre: x.etudeCode ?? "",
      href: `/sujets/${x.sujet.id}`,
    });
  }

  const qs = db
    .select({ query: queries, etudeCode: etudes.code })
    .from(queries)
    .innerJoin(etudes, eq(queries.etudeId, etudes.id))
    .where(
      and(
        etudeAccessible(etudes.id, id),
        or(like(queries.code, terme), like(queries.description, terme)),
      ),
    )
    .limit(8)
    .all();
  for (const x of qs) {
    res.push({
      type: "Query",
      titre: x.query.code,
      sousTitre: x.query.description.slice(0, 80),
      href: `/data-management/queries/${x.query.id}`,
    });
  }

  const c = db
    .select({ centre: centres, etudeCode: etudes.code })
    .from(centres)
    .innerJoin(etudes, eq(centres.etudeId, etudes.id))
    .where(
      and(
        etudeAccessible(etudes.id, id),
        or(like(centres.nom, terme), like(centres.numero, terme)),
      ),
    )
    .limit(8)
    .all();
  for (const x of c) {
    res.push({
      type: "Centre",
      titre: `${x.centre.numero} — ${x.centre.nom}`,
      sousTitre: x.etudeCode ?? "",
      href: `/centres/${x.centre.id}`,
    });
  }

  const t = db
    .select({ tache: taches, etudeCode: etudes.code })
    .from(taches)
    .leftJoin(etudes, eq(taches.etudeId, etudes.id))
    .where(and(like(taches.titre, terme)))
    .limit(8)
    .all();
  for (const x of t) {
    res.push({
      type: "Tâche",
      titre: x.tache.titre,
      sousTitre: x.etudeCode ?? "",
      href: "/missions",
    });
  }

  return res.slice(0, 20);
}

export async function kpisGlobaux() {
  const id = await moi();
  const maintenant = Math.floor(Date.now() / 1000);

  const nEtudes =
    db
      .select({ n: sql<number>`count(*)` })
      .from(etudes)
      .where(and(etudeAccessible(etudes.id, id), sql`${etudes.statut} = 'active'`))
      .get()?.n ?? 0;

  const nQueries =
    db
      .select({ n: sql<number>`count(*)` })
      .from(queries)
      .where(
        and(
          sql`${queries.etudeId} in ${idsEtudesAccessibles(id)}`,
          sql`${queries.statut} in ('open','answered','reopened')`,
        ),
      )
      .get()?.n ?? 0;

  const nTachesRetard =
    db
      .select({ n: sql<number>`count(*)` })
      .from(taches)
      .where(
        and(
          sql`(${taches.proprietaireId} = ${id} or ${taches.etudeId} in ${idsEtudesAccessibles(id)})`,
          sql`${taches.statut} != 'terminee'`,
          sql`${taches.echeance} is not null and ${taches.echeance} < ${maintenant}`,
        ),
      )
      .get()?.n ?? 0;

  const nSujets =
    db
      .select({ n: sql<number>`count(*)` })
      .from(sujets)
      .where(
        and(
          sql`${sujets.etudeId} in ${idsEtudesAccessibles(id)}`,
          sql`${sujets.statut} not in ('screen_failure','pre_screening')`,
        ),
      )
      .get()?.n ?? 0;

  const nVisitesRetard =
    db
      .select({ n: sql<number>`count(*)` })
      .from(visitesSujet)
      .where(
        and(
          sql`${visitesSujet.etudeId} in ${idsEtudesAccessibles(id)}`,
          sql`${visitesSujet.statut} in ('prevue','confirmee','en_retard')`,
          sql`${visitesSujet.datePrevue} is not null and ${visitesSujet.datePrevue} < ${maintenant}`,
        ),
      )
      .get()?.n ?? 0;

  const nMonitoring =
    db
      .select({ n: sql<number>`count(*)` })
      .from(visites)
      .where(
        and(
          sql`${visites.etudeId} in ${idsEtudesAccessibles(id)}`,
          sql`${visites.statut} = 'planifiee'`,
        ),
      )
      .get()?.n ?? 0;

  const nDeviations =
    db
      .select({ n: sql<number>`count(*)` })
      .from(ecarts)
      .where(
        and(
          sql`${ecarts.etudeId} in ${idsEtudesAccessibles(id)}`,
          sql`${ecarts.statut} != 'clos'`,
        ),
      )
      .get()?.n ?? 0;

  return {
    nEtudes: Number(nEtudes),
    nQueries: Number(nQueries),
    nTachesRetard: Number(nTachesRetard),
    nSujets: Number(nSujets),
    nVisitesRetard: Number(nVisitesRetard),
    nMonitoring: Number(nMonitoring),
    nDeviations: Number(nDeviations),
  };
}

export { queryOuverte };
