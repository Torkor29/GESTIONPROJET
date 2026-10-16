"use client";

import { type ReactNode, useEffect, useRef, useState } from "react";
import type { MessageAssistant } from "@/lib/assistant";

/** Gras `**…**` et code `…` en ligne, sans jamais injecter de HTML. */
function enLigne(texte: string): ReactNode[] {
  return texte.split(/(\*\*[^*]+\*\*|`[^`]+`)/g).map((morceau, i) => {
    if (morceau.startsWith("**") && morceau.endsWith("**") && morceau.length > 4) {
      return (
        <strong key={i} className="font-semibold text-encre">
          {morceau.slice(2, -2)}
        </strong>
      );
    }
    if (morceau.startsWith("`") && morceau.endsWith("`") && morceau.length > 2) {
      return (
        <code key={i} className="rounded-md bg-creux px-1.5 py-0.5 text-[0.85em]">
          {morceau.slice(1, -1)}
        </code>
      );
    }
    return morceau;
  });
}

/** Cellules d'une ligne de tableau Markdown : « | a | b | ». */
function cellules(ligne: string): string[] {
  return ligne.trim().replace(/^\|/, "").replace(/\|$/, "").split("|").map((c) => c.trim());
}

const SEPARATEUR_TABLEAU = /^\s*\|?\s*:?-{2,}:?\s*(\|\s*:?-{2,}:?\s*)*\|?\s*$/;

/** Mise en forme des réponses : titres, listes, tableaux, séparateurs, paragraphes. */
function Reponse({ texte }: { texte: string }) {
  const blocs: ReactNode[] = [];
  let liste: { ordonnee: boolean; items: string[] } | null = null;
  let tableau: string[][] | null = null;

  const fermerListe = () => {
    if (!liste) return;
    const Balise = liste.ordonnee ? "ol" : "ul";
    blocs.push(
      <Balise
        key={blocs.length}
        className={`${liste.ordonnee ? "list-decimal" : "list-disc"} space-y-1.5 pl-5 marker:text-accent`}
      >
        {liste.items.map((item, i) => (
          <li key={i} className="pl-1">
            {enLigne(item)}
          </li>
        ))}
      </Balise>,
    );
    liste = null;
  };

  const fermerTableau = () => {
    if (!tableau) return;
    const [entete, ...corps] = tableau;
    blocs.push(
      <div key={blocs.length} className="overflow-x-auto rounded-2xl border border-ligne">
        <table className="w-full text-left text-[13px]">
          <thead className="bg-creux">
            <tr>
              {entete.map((c, i) => (
                <th key={i} scope="col" className="px-3 py-2 font-semibold text-encre">
                  {enLigne(c)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {corps.map((ligne, i) => (
              <tr key={i} className="border-t border-ligne align-top">
                {ligne.map((c, j) => (
                  <td key={j} className="px-3 py-2">
                    {enLigne(c)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>,
    );
    tableau = null;
  };

  for (const ligne of texte.split("\n")) {
    if (ligne.trim().startsWith("|")) {
      fermerListe();
      if (SEPARATEUR_TABLEAU.test(ligne)) continue;
      if (!tableau) tableau = [];
      tableau.push(cellules(ligne));
      continue;
    }
    fermerTableau();

    const puce = /^\s*[-*•]\s+(.*)$/.exec(ligne);
    const numero = /^\s*\d+[.)]\s+(.*)$/.exec(ligne);
    const titre = /^#{1,4}\s+(.*)$/.exec(ligne);
    if (/^\s*([-*_])\s*\1\s*\1[\s\-*_]*$/.test(ligne)) {
      fermerListe();
      blocs.push(<hr key={blocs.length} className="border-ligne" />);
      continue;
    }
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
        <p key={blocs.length} className="pt-1 font-titre text-base font-bold text-encre">
          {enLigne(titre[1])}
        </p>,
      );
    } else if (ligne.trim()) {
      blocs.push(<p key={blocs.length}>{enLigne(ligne)}</p>);
    }
  }
  fermerListe();
  fermerTableau();
  return <div className="space-y-3">{blocs}</div>;
}

/** Pastille de l'assistant : une étincelle sur un dégradé doux. */
function Pastille({ grande = false }: { grande?: boolean }) {
  const taille = grande ? "h-16 w-16" : "h-8 w-8";
  const icone = grande ? "h-8 w-8" : "h-4 w-4";
  return (
    <span
      className={`${taille} grid shrink-0 place-items-center rounded-full bg-gradient-to-br from-pervenche via-ciel to-menthe text-encre shadow-douce`}
      aria-hidden
    >
      <svg viewBox="0 0 24 24" className={icone} fill="currentColor">
        <path d="M12 2.5c.4 3.9 1.6 6.6 3.4 8.1 1.6 1.4 3.9 2.1 6.1 2.4-2.2.3-4.5 1-6.1 2.4-1.8 1.5-3 4.2-3.4 8.1-.4-3.9-1.6-6.6-3.4-8.1-1.6-1.4-3.9-2.1-6.1-2.4 2.2-.3 4.5-1 6.1-2.4 1.8-1.5 3-4.2 3.4-8.1Z" />
      </svg>
    </span>
  );
}

function Frappe() {
  return (
    <span className="inline-flex items-center gap-1 py-2" aria-label="L'assistant réfléchit">
      {[0, 150, 300].map((delai) => (
        <span
          key={delai}
          className="h-2 w-2 animate-bounce rounded-full bg-attenue/60"
          style={{ animationDelay: `${delai}ms` }}
        />
      ))}
    </span>
  );
}

function BoutonCopier({ texte }: { texte: string }) {
  const [copie, setCopie] = useState(false);
  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(texte);
          setCopie(true);
          setTimeout(() => setCopie(false), 1500);
        } catch {
          // Presse-papiers refusé : rien à faire.
        }
      }}
      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs text-efface transition hover:bg-creux hover:text-encre"
    >
      <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
        {copie ? (
          <path d="M5 12.5l4.5 4.5L19 7.5" strokeLinecap="round" strokeLinejoin="round" />
        ) : (
          <>
            <rect x="9" y="9" width="11" height="11" rx="2.5" />
            <path d="M15 9V6.5A2.5 2.5 0 0 0 12.5 4h-6A2.5 2.5 0 0 0 4 6.5v6A2.5 2.5 0 0 0 6.5 15H9" />
          </>
        )}
      </svg>
      {copie ? "Copié" : "Copier"}
    </button>
  );
}

const SUGGESTIONS = [
  {
    theme: "Réglementation",
    question: "Quelle est la différence entre une RIPH 2 et une RIPH 3 ?",
    teinte: "bg-pervenche",
  },
  {
    theme: "Soumission",
    question: "Quels documents faut-il pour une soumission au CPP ?",
    teinte: "bg-menthe",
  },
  {
    theme: "Rédaction",
    question: "Rédige un mail de relance à un investigateur pour une signature de convention.",
    teinte: "bg-or",
  },
  {
    theme: "Données",
    question: "Quand une étude relève-t-elle de la MR-001 plutôt que de la MR-003 ?",
    teinte: "bg-corail",
  },
];

export default function DiscussionAssistant() {
  const [messages, setMessages] = useState<MessageAssistant[]>([]);
  const [saisie, setSaisie] = useState("");
  const [enCours, setEnCours] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);
  const fin = useRef<HTMLDivElement>(null);
  const zone = useRef<HTMLTextAreaElement>(null);
  const arret = useRef<AbortController | null>(null);

  useEffect(() => {
    if (messages.length > 0) fin.current?.scrollIntoView({ block: "end", behavior: "smooth" });
  }, [messages]);

  // La zone de saisie grandit avec le texte, jusqu'à une hauteur raisonnable.
  useEffect(() => {
    const el = zone.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 200)}px`;
  }, [saisie]);

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
      if (!controleur.signal.aborted) {
        setErreur(e instanceof Error ? e.message : "L'assistant n'a pas pu répondre.");
        setMessages(conversation.slice(0, -1));
        setSaisie(texte);
      }
    } finally {
      setEnCours(false);
      arret.current = null;
      zone.current?.focus();
    }
  }

  const vide = messages.length === 0;

  return (
    <div className="flex min-h-[calc(100vh-14rem)] flex-col">
      {vide ? (
        <div className="flex flex-1 flex-col items-center justify-center py-8 text-center animate-apparait">
          <Pastille grande />
          <h2 className="mt-5 font-titre text-2xl font-bold sm:text-3xl">
            Une question de réglementation ?
          </h2>
          <p className="mt-2 max-w-md text-sm text-attenue">
            Loi Jardé, CTIS, CPP, RGPD, bonnes pratiques… ou un courrier à rédiger.
          </p>
          <div className="mt-8 grid w-full gap-3 sm:grid-cols-2">
            {SUGGESTIONS.map((s) => (
              <button
                key={s.question}
                type="button"
                onClick={() => void envoyer(s.question)}
                className="group rounded-3xl border border-ligne bg-relief p-4 text-left shadow-posee transition duration-300 ease-souple
                           hover:-translate-y-0.5 hover:border-encre/20 hover:shadow-douce
                           focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-encre"
              >
                <span className="inline-flex items-center gap-2 text-[11px] font-medium uppercase tracking-wider text-efface">
                  <span className={`h-2 w-2 rounded-full ${s.teinte}`} aria-hidden />
                  {s.theme}
                </span>
                <span className="mt-2 block text-sm leading-snug text-encre">{s.question}</span>
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="flex-1 space-y-6 pb-6 pt-2">
          {messages.map((m, i) =>
            m.role === "user" ? (
              <div key={i} className="flex justify-end animate-apparait">
                <div className="max-w-[85%] whitespace-pre-wrap rounded-3xl rounded-br-lg bg-encre px-4 py-3 text-sm leading-relaxed text-surface">
                  {m.content}
                </div>
              </div>
            ) : (
              <div key={i} className="flex gap-3 animate-apparait">
                <Pastille />
                <div className="min-w-0 flex-1 pt-1">
                  <div className="text-sm leading-relaxed text-encre/90">
                    {m.content ? <Reponse texte={m.content} /> : <Frappe />}
                  </div>
                  {m.content && !(enCours && i === messages.length - 1) && (
                    <div className="mt-2 -ml-2.5">
                      <BoutonCopier texte={m.content} />
                    </div>
                  )}
                </div>
              </div>
            ),
          )}
          <div ref={fin} />
        </div>
      )}

      <div className="sticky bottom-0 -mx-1 bg-gradient-to-t from-surface via-surface to-surface/0 px-1 pb-20 pt-6">
        {erreur && (
          <p role="alert" className="mb-3 rounded-2xl bg-alerte-voile/40 px-4 py-2.5 text-sm text-encre">
            {erreur}
          </p>
        )}

        <form
          onSubmit={(e) => {
            e.preventDefault();
            void envoyer(saisie);
          }}
          className="flex items-end gap-2 rounded-[28px] border border-ligne bg-relief p-2 pl-5 shadow-elevee transition-colors focus-within:border-encre/40"
        >
          <label htmlFor="question" className="sr-only">
            Votre question
          </label>
          <textarea
            id="question"
            ref={zone}
            rows={1}
            value={saisie}
            maxLength={8000}
            onChange={(e) => setSaisie(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                void envoyer(saisie);
              }
            }}
            placeholder="Posez votre question…"
            className="max-h-[200px] flex-1 resize-none bg-transparent py-2.5 text-sm text-encre outline-none placeholder:text-efface"
          />
          {enCours ? (
            <button
              type="button"
              onClick={() => arret.current?.abort()}
              title="Arrêter"
              aria-label="Arrêter la réponse"
              className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-encre text-surface transition hover:opacity-80"
            >
              <span className="h-3 w-3 rounded-[3px] bg-current" />
            </button>
          ) : (
            <button
              type="submit"
              disabled={!saisie.trim()}
              title="Envoyer"
              aria-label="Envoyer"
              className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-accent text-sur-accent transition
                         hover:opacity-90 active:scale-95 disabled:bg-creux disabled:text-efface"
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden>
                <path d="M12 19V5M5.5 11.5 12 5l6.5 6.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          )}
        </form>

        <div className="mt-2.5 flex flex-wrap items-center justify-between gap-2 px-2 text-xs text-efface">
          <span className="inline-flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-attention" aria-hidden />
            Aucune donnée patient ici · réponses à vérifier sur le texte officiel
          </span>
          {!vide && !enCours && (
            <button
              type="button"
              onClick={() => {
                setMessages([]);
                setErreur(null);
              }}
              className="rounded-full px-2.5 py-1 transition hover:bg-creux hover:text-encre"
            >
              + Nouvelle conversation
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
