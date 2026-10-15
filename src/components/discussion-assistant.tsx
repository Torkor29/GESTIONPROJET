"use client";

import { type ReactNode, useEffect, useRef, useState } from "react";
import type { MessageAssistant } from "@/lib/assistant";

/** Gras `**…**` et code `…` en ligne, sans jamais injecter de HTML. */
function enLigne(texte: string): ReactNode[] {
  return texte.split(/(\*\*[^*]+\*\*|`[^`]+`)/g).map((morceau, i) => {
    if (morceau.startsWith("**") && morceau.endsWith("**") && morceau.length > 4) {
      return <strong key={i}>{morceau.slice(2, -2)}</strong>;
    }
    if (morceau.startsWith("`") && morceau.endsWith("`") && morceau.length > 2) {
      return (
        <code key={i} className="rounded bg-creux px-1 text-[0.9em]">
          {morceau.slice(1, -1)}
        </code>
      );
    }
    return morceau;
  });
}

/** Mise en forme minimale des réponses : titres, listes, paragraphes. */
function Reponse({ texte }: { texte: string }) {
  const blocs: ReactNode[] = [];
  let liste: { ordonnee: boolean; items: string[] } | null = null;

  const fermerListe = () => {
    if (!liste) return;
    const Balise = liste.ordonnee ? "ol" : "ul";
    blocs.push(
      <Balise key={blocs.length} className={`${liste.ordonnee ? "list-decimal" : "list-disc"} space-y-1 pl-5`}>
        {liste.items.map((item, i) => (
          <li key={i}>{enLigne(item)}</li>
        ))}
      </Balise>,
    );
    liste = null;
  };

  for (const ligne of texte.split("\n")) {
    const puce = /^\s*[-*•]\s+(.*)$/.exec(ligne);
    const numero = /^\s*\d+[.)]\s+(.*)$/.exec(ligne);
    const titre = /^#{1,4}\s+(.*)$/.exec(ligne);
    if (puce || numero) {
      const ordonnee = Boolean(numero);
      if (liste && liste.ordonnee !== ordonnee) fermerListe();
      if (!liste) liste = { ordonnee, items: [] };
      liste.items.push((puce ?? numero)![1]);
      continue;
    }
    fermerListe();
    if (titre) {
      blocs.push(
        <p key={blocs.length} className="font-semibold">
          {enLigne(titre[1])}
        </p>,
      );
    } else if (ligne.trim()) {
      blocs.push(<p key={blocs.length}>{enLigne(ligne)}</p>);
    }
  }
  fermerListe();
  return <div className="space-y-2">{blocs}</div>;
}

const EXEMPLES = [
  "Quelle est la différence entre une RIPH 2 et une RIPH 3 ?",
  "Quels documents faut-il pour une soumission au CPP ?",
  "Rédige un mail de relance à un investigateur pour une signature de convention.",
];

export default function DiscussionAssistant() {
  const [messages, setMessages] = useState<MessageAssistant[]>([]);
  const [saisie, setSaisie] = useState("");
  const [enCours, setEnCours] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);
  const fin = useRef<HTMLDivElement>(null);
  const arret = useRef<AbortController | null>(null);

  useEffect(() => {
    fin.current?.scrollIntoView({ block: "end" });
  }, [messages]);

  async function envoyer(question: string) {
    const texte = question.trim();
    if (!texte || enCours) return;
    const conversation: MessageAssistant[] = [...messages, { role: "user", content: texte }];
    setMessages([...conversation, { role: "assistant", content: "" }]);
    setSaisie("");
    setErreur(null);
    setEnCours(true);

    const controleur = new AbortController();
    arret.current = controleur;
    try {
      const reponse = await fetch("/api/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: conversation }),
        signal: controleur.signal,
      });
      if (!reponse.ok || !reponse.body) {
        const corps = await reponse.json().catch(() => null);
        throw new Error(corps?.erreur ?? "L'assistant n'a pas pu répondre.");
      }
      const lecteur = reponse.body.getReader();
      const decodeur = new TextDecoder();
      let cumul = "";
      for (;;) {
        const { done, value } = await lecteur.read();
        if (done) break;
        cumul += decodeur.decode(value, { stream: true });
        setMessages([...conversation, { role: "assistant", content: cumul }]);
      }
      if (!cumul.trim()) throw new Error("L'assistant n'a renvoyé aucune réponse. Réessayez.");
    } catch (e) {
      if (controleur.signal.aborted) {
        // Arrêt demandé : on garde ce qui est déjà arrivé.
      } else {
        setErreur(e instanceof Error ? e.message : "L'assistant n'a pas pu répondre.");
        setMessages(conversation.slice(0, -1));
        setSaisie(texte);
      }
    } finally {
      setEnCours(false);
      arret.current = null;
    }
  }

  return (
    <div className="space-y-4">
      {messages.length === 0 ? (
        <div className="carte space-y-3 p-5">
          <p className="text-sm text-attenue">Quelques exemples pour commencer :</p>
          <div className="flex flex-wrap gap-2">
            {EXEMPLES.map((ex) => (
              <button key={ex} type="button" onClick={() => void envoyer(ex)} className="bouton-discret text-left">
                {ex}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {messages.map((m, i) =>
            m.role === "user" ? (
              <div key={i} className="ml-auto max-w-[85%] whitespace-pre-wrap rounded-2xl bg-accent-voile px-4 py-3 text-sm">
                {m.content}
              </div>
            ) : (
              <div key={i} className="carte max-w-[95%] px-4 py-3 text-sm leading-relaxed">
                {m.content ? <Reponse texte={m.content} /> : <span className="text-attenue">Réflexion…</span>}
              </div>
            ),
          )}
          <div ref={fin} />
        </div>
      )}

      {erreur && (
        <p role="alert" className="text-sm text-alerte">
          {erreur}
        </p>
      )}

      <form
        onSubmit={(e) => {
          e.preventDefault();
          void envoyer(saisie);
        }}
        className="space-y-2"
      >
        <label htmlFor="question" className="sr-only">
          Votre question
        </label>
        <textarea
          id="question"
          rows={3}
          value={saisie}
          maxLength={8000}
          onChange={(e) => setSaisie(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              void envoyer(saisie);
            }
          }}
          placeholder="Posez votre question… (Entrée pour envoyer, Maj+Entrée pour aller à la ligne)"
          className="champ resize-y"
        />
        <div className="flex flex-wrap justify-end gap-2">
          {messages.length > 0 && !enCours && (
            <button type="button" onClick={() => setMessages([])} className="bouton-discret">
              Nouvelle conversation
            </button>
          )}
          {enCours ? (
            <button type="button" onClick={() => arret.current?.abort()} className="bouton-discret">
              Arrêter
            </button>
          ) : (
            <button type="submit" className="bouton" disabled={!saisie.trim()}>
              Envoyer
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
