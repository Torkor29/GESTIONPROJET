"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { evenementsQuery, queries } from "@/db/schema";
import { exigerAcces } from "@/lib/acces";
import { enregistrerAudit } from "@/lib/audit";
import { TYPES_QUERY } from "@/lib/constantes";
import { exigerPermission } from "@/lib/gardes";
import { prochainParmi } from "@/lib/ids";
import { notifier } from "@/lib/notifications";
import { type ActionQuery, prochainStatutQuery } from "@/lib/queries-workflow";
import { type EtatFormulaire, messageErreur } from "./etat";

const maintenant = () => Math.floor(Date.now() / 1000);

export async function creerQuery(_p: EtatFormulaire, donnees: FormData): Promise<EtatFormulaire> {
  try {
    const compte = await exigerPermission("queries", "creer");
    const etudeId = Number(donnees.get("etudeId"));
    const description = String(donnees.get("description") ?? "").trim();
    const type = String(donnees.get("type") ?? "clarification");
    if (!etudeId) return { erreur: "Étude obligatoire." };
    if (!description) return { erreur: "Décrivez la query." };
    if (!(type in TYPES_QUERY)) return { erreur: "Type de query inconnu." };
    await exigerAcces("etudes", etudeId, compte.id);

    const existants = db.select({ code: queries.code }).from(queries).where(eq(queries.etudeId, etudeId)).all();
    const code = prochainParmi("QUERY", existants.map((q) => q.code));

    const cree = db
      .insert(queries)
      .values({
        proprietaireId: compte.id,
        code,
        etudeId,
        centreId: Number(donnees.get("centreId")) || null,
        sujetId: Number(donnees.get("sujetId")) || null,
        type,
        description,
        statut: "open",
        auteurId: compte.id,
      })
      .returning({ id: queries.id })
      .get();

    db.insert(evenementsQuery)
      .values({
        queryId: cree.id,
        auteurId: compte.id,
        action: "creation",
        nouveauStatut: "open",
        commentaire: description,
      })
      .run();

    enregistrerAudit({
      utilisateurId: compte.id,
      action: "creation",
      objetType: "query",
      objetId: cree.id,
      etudeId,
      nouvelleValeur: { code, statut: "open" },
    });

    const dest = Number(donnees.get("notifierId"));
    if (dest) {
      notifier({
        utilisateurId: dest,
        type: "query",
        titre: `${code} nécessite votre réponse`,
        message: description.slice(0, 180),
        lien: `/data-management/queries/${cree.id}`,
        objetType: "query",
        objetId: cree.id,
      });
    }

    revalidatePath("/", "layout");
    return { succes: 1 };
  } catch (e) {
    return { erreur: messageErreur(e) };
  }
}

export async function agirSurQuery(
  id: number,
  action: ActionQuery,
  commentaire?: string,
): Promise<{ ok: true } | { ok: false; erreur: string }> {
  try {
    const perm = action === "repondre" ? "modifier" : "modifier";
    const compte = await exigerPermission("queries", perm);
    const q = db.select().from(queries).where(eq(queries.id, id)).get();
    if (!q) return { ok: false, erreur: "Query introuvable." };
    await exigerAcces("etudes", q.etudeId, compte.id);

    const suivant = prochainStatutQuery(q.statut, action);
    if (!suivant.ok) return suivant;

    const patch: Record<string, unknown> = {
      statut: suivant.statut,
      modifieLe: maintenant(),
    };
    if (action === "repondre") {
      patch.reponse = commentaire ?? q.reponse;
      patch.reponduPar = compte.id;
      patch.reponduLe = maintenant();
    }
    if (action === "resoudre") {
      patch.resoluPar = compte.id;
      patch.resoluLe = maintenant();
    }
    if (action === "fermer") {
      patch.fermeLe = maintenant();
    }

    db.update(queries).set(patch).where(eq(queries.id, id)).run();
    db.insert(evenementsQuery)
      .values({
        queryId: id,
        auteurId: compte.id,
        action,
        ancienStatut: q.statut,
        nouveauStatut: suivant.statut,
        commentaire: commentaire ?? null,
      })
      .run();

    enregistrerAudit({
      utilisateurId: compte.id,
      action,
      objetType: "query",
      objetId: id,
      etudeId: q.etudeId,
      ancienneValeur: { statut: q.statut },
      nouvelleValeur: { statut: suivant.statut },
    });

    if (q.auteurId && q.auteurId !== compte.id) {
      notifier({
        utilisateurId: q.auteurId,
        type: "query",
        titre: `${q.code} : ${q.statut} → ${suivant.statut}`,
        message: commentaire?.slice(0, 180),
        lien: `/data-management/queries/${id}`,
        objetType: "query",
        objetId: id,
      });
    }

    revalidatePath("/", "layout");
    return { ok: true };
  } catch (e) {
    return { ok: false, erreur: messageErreur(e) };
  }
}
