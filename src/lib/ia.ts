import "server-only";
import { lireConfigAssistant } from "./assistant";

/**
 * Appels ponctuels au modèle (hors conversation de l'Assistant) : résumer une
 * note, en tirer des missions, rédiger un courrier. Même fournisseur que
 * l'Assistant, configuré par le `.env`.
 *
 * Contrairement à l'Assistant, ces appels envoient du contenu de Vigie (le
 * texte d'une note, la fiche d'une étude) : l'interface le dit à chaque fois.
 */

export const CONSIGNES_COMMUNES = `Tu travailles pour Vigie Clinique, outil de gestion de projets de recherche clinique (ARC, TEC, chefs de projet, en France).
Réponds en français, avec un ton professionnel et sobre.
Ne reprends jamais de données nominatives de patients (nom, initiales, date de naissance, numéro de dossier) : si le texte en contient, omets-les.
N'invente aucun fait, date ou chiffre absent du texte fourni : laisse un repère entre crochets, par exemple [date à préciser].`;

const FENETRE_MS = 60 * 60 * 1000;
const APPELS_PAR_HEURE = 60;
const historique = new Map<number, number[]>();

function autorise(utilisateurId: number): boolean {
  const maintenant = Date.now();
  const recents = (historique.get(utilisateurId) ?? []).filter((t) => maintenant - t < FENETRE_MS);
  if (recents.length >= APPELS_PAR_HEURE) return false;
  recents.push(maintenant);
  historique.set(utilisateurId, recents);
  return true;
}

export function iaDisponible(): boolean {
  return lireConfigAssistant() !== null;
}

export class ErreurIA extends Error {}

/** Un appel, une réponse complète (sans flux). Lève `ErreurIA` avec un message affichable. */
export async function completerIA(
  utilisateurId: number,
  consignes: string,
  demande: string,
): Promise<string> {
  const config = lireConfigAssistant();
  if (!config) throw new ErreurIA("L'IA n'est pas activée sur ce serveur (clé ASSISTANT_CLE_API absente du .env).");
  if (!autorise(utilisateurId)) throw new ErreurIA("Beaucoup de demandes en une heure : réessayez un peu plus tard.");

  let reponse: Response;
  try {
    reponse = await fetch(`${config.url}/chat/completions`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${config.cle}` },
      body: JSON.stringify({
        model: config.modele,
        temperature: 0.3,
        messages: [
          { role: "system", content: `${CONSIGNES_COMMUNES}\n\n${consignes}` },
          { role: "user", content: demande },
        ],
      }),
      signal: AbortSignal.timeout(180_000),
    });
  } catch {
    throw new ErreurIA("Le service d'IA ne répond pas. Réessayez dans un instant.");
  }
  if (!reponse.ok) {
    console.error("IA :", reponse.status, await reponse.text().catch(() => ""));
    throw new ErreurIA(
      reponse.status === 429
        ? "Le quota du service d'IA est atteint pour le moment. Réessayez plus tard."
        : "Le service d'IA a refusé la demande. Réessayez plus tard.",
    );
  }
  const corps = (await reponse.json().catch(() => null)) as {
    choices?: { message?: { content?: string } }[];
  } | null;
  const texte = corps?.choices?.[0]?.message?.content?.trim();
  if (!texte) throw new ErreurIA("Le service d'IA a rendu une réponse vide. Réessayez.");
  // Certains modèles « qui réfléchissent » laissent leur raisonnement en tête.
  return texte.replace(/^<think>[\s\S]*?<\/think>\s*/i, "").trim();
}
