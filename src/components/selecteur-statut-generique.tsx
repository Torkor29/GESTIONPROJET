"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { createPortal } from "react-dom";

/**
 * Statut modifiable depuis un tableau, sans ouvrir de formulaire.
 *
 * Pas de `<select>` natif : la liste système est illisible, et sans chevron
 * on ne devine pas que le libellé se clique. On compose une pastille et un
 * menu arrondi, comme le reste de l'outil.
 *
 * L'enregistrement passe par une transition plutôt que par `<form action>` :
 * React 19 réinitialise un formulaire après son action, ce qui ferait
 * réapparaître l'ancien statut à l'écran juste après l'enregistrement.
 */
export default function SelecteurStatutGenerique({
  id,
  statut,
  libelles,
  couleurs,
  pastilles,
  enregistrer,
  etiquette,
  verrouille = false,
  titreVerrou,
}: {
  id: number;
  statut: string;
  libelles: Record<string, string>;
  /** Couleur du texte par statut, en classes utilitaires. */
  couleurs: Record<string, string>;
  /** Couleur de la pastille par statut. */
  pastilles: Record<string, string>;
  /** Action serveur qui enregistre le nouveau statut. */
  enregistrer: (id: number, statut: string) => Promise<void>;
  /** Libellé accessible du sélecteur, par exemple « Statut de l'écart ». */
  etiquette: string;
  /** Le statut suit autre chose (des étapes) : on l'affiche, on ne le change plus. */
  verrouille?: boolean;
  titreVerrou?: string;
}) {
  const [valeur, setValeur] = useState(statut);
  const [ouvert, setOuvert] = useState(false);
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);
  const [enCours, demarrer] = useTransition();
  const declencheur = useRef<HTMLButtonElement>(null);
  const menu = useRef<HTMLDivElement>(null);

  useEffect(() => setValeur(statut), [statut]);

  useEffect(() => {
    if (!ouvert) return;

    const fermer = (e: MouseEvent) => {
      const cible = e.target as Node;
      if (declencheur.current?.contains(cible) || menu.current?.contains(cible)) return;
      setOuvert(false);
    };
    const clavier = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      e.preventDefault();
      e.stopPropagation();
      setOuvert(false);
    };
    const auDefilement = () => setOuvert(false);

    document.addEventListener("mousedown", fermer);
    document.addEventListener("keydown", clavier, true);
    window.addEventListener("scroll", auDefilement, true);
    window.addEventListener("resize", auDefilement);
    return () => {
      document.removeEventListener("mousedown", fermer);
      document.removeEventListener("keydown", clavier, true);
      window.removeEventListener("scroll", auDefilement, true);
      window.removeEventListener("resize", auDefilement);
    };
  }, [ouvert]);

  const libelle = libelles[valeur] ?? valeur;
  const couleur = couleurs[valeur] ?? "text-attenue";
  const pastille = pastilles[valeur] ?? "bg-efface";

  function choisir(choix: string) {
    setOuvert(false);
    if (choix === valeur) return;
    setValeur(choix);
    demarrer(async () => {
      try {
        await enregistrer(id, choix);
      } catch {
        setValeur(statut);
      }
    });
  }

  function basculer() {
    if (verrouille || enCours) return;
    if (ouvert) {
      setOuvert(false);
      return;
    }
    const r = declencheur.current?.getBoundingClientRect();
    if (r) {
      const largeur = 188;
      const n = Object.keys(libelles).length;
      const hauteur = n * 40 + 10;
      const bas = window.innerHeight - r.bottom;
      const top = bas < hauteur && r.top > hauteur ? r.top - hauteur - 6 : r.bottom + 6;
      let left = r.left;
      if (left + largeur > window.innerWidth - 8) left = Math.max(8, window.innerWidth - largeur - 8);
      setPos({ top, left });
    }
    setOuvert(true);
  }

  const pastilleEl = (
    <span aria-hidden className={`h-2 w-2 shrink-0 rounded-full ${pastille}`} />
  );

  return (
    <>
      <span className="impression-seule inline-flex items-center gap-1.5 text-xs font-medium">
        {pastilleEl}
        <span className={couleur}>{libelle}</span>
      </span>

      {verrouille ? (
        <span
          className="sans-impression inline-flex items-center gap-1.5 text-xs font-medium"
          title={titreVerrou}
        >
          {pastilleEl}
          <span className={couleur}>{libelle}</span>
        </span>
      ) : (
        <span className="sans-impression relative inline-flex">
          <button
            ref={declencheur}
            type="button"
            disabled={enCours}
            aria-haspopup="listbox"
            aria-expanded={ouvert}
            aria-label={etiquette}
            title="Changer le statut"
            onClick={basculer}
            className={`inline-flex items-center gap-1.5 rounded-full border border-ligne bg-relief py-0.5 pl-2 pr-1.5
                        text-xs font-medium shadow-posee transition
                        hover:border-encre/35 hover:bg-creux
                        focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-encre
                        disabled:opacity-60 ${ouvert ? "border-encre/40 bg-creux" : ""}`}
          >
            {pastilleEl}
            <span className={couleur}>{libelle}</span>
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              className={`h-3 w-3 text-efface transition-transform duration-200 ${ouvert ? "rotate-180" : ""}`}
              aria-hidden
            >
              <path d="M6 9l6 6 6-6" />
            </svg>
          </button>
        </span>
      )}

      {ouvert &&
        pos &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            ref={menu}
            role="listbox"
            aria-label={etiquette}
            style={{ top: pos.top, left: pos.left }}
            className="fixed z-50 min-w-[11.5rem] animate-apparait rounded-2xl border border-ligne bg-relief p-1 shadow-elevee"
          >
            {Object.entries(libelles).map(([v, l]) => {
              const choisi = v === valeur;
              return (
                <button
                  key={v}
                  type="button"
                  role="option"
                  aria-selected={choisi}
                  onClick={() => choisir(v)}
                  className={`flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-sm transition
                              ${choisi ? "bg-accent-voile" : "hover:bg-creux"}`}
                >
                  <span
                    aria-hidden
                    className={`h-2 w-2 shrink-0 rounded-full ${pastilles[v] ?? "bg-efface"}`}
                  />
                  <span className={`flex-1 font-medium ${couleurs[v] ?? "text-encre"}`}>{l}</span>
                  {choisi && (
                    <span aria-hidden className="text-xs text-accent-appuye">
                      ✓
                    </span>
                  )}
                </button>
              );
            })}
          </div>,
          document.body,
        )}
    </>
  );
}
