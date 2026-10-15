/**
 * Assistant réglementaire : un modèle de langage interrogé par API, au format
 * OpenAI (`/chat/completions`).
 *
 * Il n'a **aucun accès aux données de Vigie** : la route qui l'interroge ne
 * lit pas la base et n'envoie que la conversation tapée par la personne. Rien
 * n'est enregistré côté serveur ; la conversation vit dans l'onglet ouvert.
 *
 * Le fournisseur se change par le `.env`, sans toucher au code.
 */

export type MessageAssistant = { role: "user" | "assistant"; content: string };

export type ConfigAssistant = { url: string; cle: string; modele: string };

const URL_PAR_DEFAUT = "https://api.orcarouter.ai/v1";
const MODELE_PAR_DEFAUT = "deepseek/deepseek-v4-flash-free";

/** Configuration lue dans l'environnement, ou `null` si l'assistant n'est pas activé. */
export function lireConfigAssistant(
  env: Record<string, string | undefined> = process.env,
): ConfigAssistant | null {
  const cle = (env.ASSISTANT_CLE_API ?? "").trim();
  if (!cle) return null;
  return {
    url: ((env.ASSISTANT_URL ?? "").trim() || URL_PAR_DEFAUT).replace(/\/+$/, ""),
    cle,
    modele: (env.ASSISTANT_MODELE ?? "").trim() || MODELE_PAR_DEFAUT,
  };
}

export const CONSIGNES_ASSISTANT = `Tu es l'assistant réglementaire de Vigie Clinique, un outil de gestion de projets de recherche clinique utilisé par des ARC, TEC et chefs de projet en France.

Ton rôle : aider sur la réglementation et les pratiques de la recherche clinique — loi Jardé et RIPH (catégories 1, 2, 3), Code de la santé publique, règlement européen 536/2014 et CTIS, dispositifs médicaux (règlements 2017/745 et 2017/746), CPP, ANSM, bonnes pratiques cliniques (ICH E6), RGPD et méthodologies de référence CNIL (MR-001, MR-003, MR-004…), assurance, vigilance et déclaration des EIG, conventions, archivage, monitoring. Tu aides aussi à rédiger des courriers, des mails et des documents.

Règles :
- Réponds en français, clairement et de façon structurée.
- Quand tu cites une règle, donne sa source (article, texte, guide) si tu la connais. Si tu n'es pas sûr, dis-le, et renvoie vers le texte officiel, l'ANSM, la CNIL ou le promoteur.
- Les textes évoluent : rappelle de vérifier la version en vigueur pour toute décision engageante.
- Tu n'as accès à aucune donnée de l'utilisateur : ni études, ni missions, ni patients. Ne prétends jamais le contraire.
- Si on te transmet des données patients ou des informations nominatives, ne les reprends pas et rappelle qu'elles ne doivent pas être saisies ici.`;

/** Plafonds d'une conversation : au-delà, on garde les messages les plus récents. */
export const LONGUEUR_MAX_MESSAGE = 8_000;
const MESSAGES_MAX = 20;
const LONGUEUR_MAX_TOTALE = 40_000;

/**
 * Valide la conversation reçue du navigateur : rôles connus, textes non vides
 * et bornés, un dernier message de la personne. Rend `null` si elle est
 * inexploitable.
 */
export function nettoyerConversation(brut: unknown): MessageAssistant[] | null {
  if (!Array.isArray(brut)) return null;
  const messages: MessageAssistant[] = [];
  for (const m of brut) {
    if (!m || typeof m !== "object") return null;
    const { role, content } = m as Record<string, unknown>;
    if ((role !== "user" && role !== "assistant") || typeof content !== "string") return null;
    const texte = content.trim();
    if (!texte) continue;
    if (texte.length > LONGUEUR_MAX_MESSAGE) return null;
    messages.push({ role, content: texte });
  }

  let gardes = messages.slice(-MESSAGES_MAX);
  while (gardes.length > 1 && gardes.reduce((n, m) => n + m.content.length, 0) > LONGUEUR_MAX_TOTALE) {
    gardes = gardes.slice(1);
  }
  // L'historique doit commencer par une question, et se terminer par une.
  while (gardes.length > 0 && gardes[0].role !== "user") gardes = gardes.slice(1);
  if (gardes.length === 0 || gardes[gardes.length - 1].role !== "user") return null;
  return gardes;
}

/**
 * Extrait le texte d'un bloc de flux SSE au format OpenAI. Rend les morceaux
 * de réponse trouvés et ce qui reste à compléter par le bloc suivant.
 */
export function lireFluxSse(tampon: string): { morceaux: string[]; reste: string; fini: boolean } {
  const lignes = tampon.split("\n");
  const reste = lignes.pop() ?? "";
  const morceaux: string[] = [];
  let fini = false;
  for (const ligne of lignes) {
    const l = ligne.trim();
    if (!l.startsWith("data:")) continue;
    const donnee = l.slice(5).trim();
    if (donnee === "[DONE]") {
      fini = true;
      continue;
    }
    try {
      const texte = JSON.parse(donnee)?.choices?.[0]?.delta?.content;
      if (typeof texte === "string" && texte) morceaux.push(texte);
    } catch {
      // Ligne incomplète ou commentaire du fournisseur : ignorée.
    }
  }
  return { morceaux, reste, fini };
}
