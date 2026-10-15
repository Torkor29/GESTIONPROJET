import { NextResponse } from "next/server";
import { CONSIGNES_ASSISTANT, lireConfigAssistant, lireFluxSse, nettoyerConversation } from "@/lib/assistant";
import { utilisateurActuel } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Relais vers le modèle. Volontairement sans accès à la base : seule la
 * session est vérifiée, et seule la conversation tapée part chez le
 * fournisseur. Rien n'est conservé.
 */

const FENETRE_MS = 60 * 60 * 1000;
const QUESTIONS_PAR_HEURE = 40;
const historique = new Map<number, number[]>();

/** Plafond par personne, pour ménager le quota partagé du fournisseur. */
function autorise(utilisateurId: number): boolean {
  const maintenant = Date.now();
  const recentes = (historique.get(utilisateurId) ?? []).filter((t) => maintenant - t < FENETRE_MS);
  if (recentes.length >= QUESTIONS_PAR_HEURE) {
    historique.set(utilisateurId, recentes);
    return false;
  }
  recentes.push(maintenant);
  historique.set(utilisateurId, recentes);
  return true;
}

function erreur(message: string, statut: number) {
  return NextResponse.json({ erreur: message }, { status: statut });
}

export async function POST(requete: Request) {
  const compte = await utilisateurActuel();
  if (!compte) return erreur("Session expirée. Reconnectez-vous.", 401);

  const config = lireConfigAssistant();
  if (!config) return erreur("L'assistant n'est pas activé sur ce serveur.", 503);

  let corps: unknown;
  try {
    corps = await requete.json();
  } catch {
    return erreur("Requête illisible.", 400);
  }
  const messages = nettoyerConversation((corps as { messages?: unknown })?.messages);
  if (!messages) return erreur("Question vide ou trop longue.", 400);

  if (!autorise(compte.id)) {
    return erreur("Beaucoup de questions en une heure : réessayez un peu plus tard.", 429);
  }

  let amont: Response;
  try {
    amont = await fetch(`${config.url}/chat/completions`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${config.cle}` },
      body: JSON.stringify({
        model: config.modele,
        stream: true,
        temperature: 0.3,
        messages: [{ role: "system", content: CONSIGNES_ASSISTANT }, ...messages],
      }),
      signal: AbortSignal.timeout(180_000),
    });
  } catch {
    return erreur("Le service de l'assistant ne répond pas. Réessayez dans un instant.", 502);
  }

  if (!amont.ok || !amont.body) {
    console.error("Assistant :", amont.status, await amont.text().catch(() => ""));
    if (amont.status === 429) {
      return erreur("Le quota gratuit de l'assistant est atteint pour le moment. Réessayez plus tard.", 429);
    }
    return erreur("Le service de l'assistant a refusé la demande. Réessayez plus tard.", 502);
  }

  const lecteur = amont.body.getReader();
  const decodeur = new TextDecoder();
  const encodeur = new TextEncoder();
  let tampon = "";

  const flux = new ReadableStream<Uint8Array>({
    // Un appel à `pull` doit transmettre quelque chose ou clore le flux : s'il
    // rend la main sans rien envoyer, il n'est plus rappelé et la réponse
    // reste suspendue. Or les modèles qui « réfléchissent » envoient d'abord
    // de nombreux blocs sans texte de réponse : on lit donc jusqu'au premier
    // texte ou jusqu'à la fin.
    async pull(controleur) {
      for (;;) {
        const { done, value } = await lecteur.read();
        if (done) {
          controleur.close();
          return;
        }
        tampon += decodeur.decode(value, { stream: true });
        const lu = lireFluxSse(tampon);
        tampon = lu.reste;
        for (const m of lu.morceaux) controleur.enqueue(encodeur.encode(m));
        if (lu.fini) {
          controleur.close();
          void lecteur.cancel().catch(() => {});
          return;
        }
        if (lu.morceaux.length > 0) return;
      }
    },
    cancel() {
      void lecteur.cancel().catch(() => {});
    },
  });

  return new Response(flux, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      // no-transform : ni Next ni le proxy ne compressent la réponse, ce qui
      // la retiendrait jusqu'à la fin au lieu de l'afficher au fil de l'eau.
      "Cache-Control": "no-store, no-transform",
      "X-Accel-Buffering": "no",
    },
  });
}
