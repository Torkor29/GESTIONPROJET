"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { genererPourCentres } from "@/actions/publipostage";
import { VIDE } from "@/actions/etat";
import { type Champ, type Valeurs, lireCollageCentres } from "@/lib/publipostage";

function BoutonGenerer({ nombre }: { nombre: number }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="bouton" disabled={pending || nombre === 0}>
      {pending
        ? "Génération…"
        : `Générer ${nombre} document${nombre > 1 ? "s" : ""}`}
    </button>
  );
}

/**
 * Déclinaison d'un document pour plusieurs centres : une ligne par centre,
 * saisie ici ou collée depuis Excel. Les champs communs viennent du document
 * enregistré ; la génération crée un document par centre.
 */
export default function GenerateurCentres({
  documentId,
  colonnes,
}: {
  documentId: number;
  colonnes: Champ[];
}) {
  const [centres, setCentres] = useState<Valeurs[]>([{}]);
  const [collage, setCollage] = useState("");
  const [etat, action] = useActionState(genererPourCentres, VIDE);

  const remplis = centres.filter((c) => Object.values(c).some((v) => String(v).trim() !== ""));

  function modifier(index: number, cle: string, valeur: string) {
    setCentres((avant) => avant.map((c, i) => (i === index ? { ...c, [cle]: valeur } : c)));
  }

  function importer() {
    const lus = lireCollageCentres(collage, colonnes);
    if (lus.length === 0) return;
    setCentres((avant) => [...avant.filter((c) => Object.keys(c).length > 0), ...lus]);
    setCollage("");
  }

  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="id" value={documentId} />
      <input type="hidden" name="centres" value={JSON.stringify(remplis)} />

      <p className="text-sm text-attenue">
        Enregistrez d&apos;abord la partie commune du document. Chaque ligne ci-dessous
        devient un document à part, avec son propre suivi ; les champs du centre
        laissés vides restent à compléter dans chaque document.
      </p>

      <div className="overflow-x-auto rounded-xl border border-ligne">
        <table className="w-full min-w-max text-sm">
          <thead>
            <tr className="bg-creux text-left">
              <th scope="col" className="sur-titre w-8 px-2 py-2">#</th>
              {colonnes.map((c) => (
                <th key={c.cle} scope="col" className="sur-titre px-2 py-2 font-medium">
                  {c.libelle}
                </th>
              ))}
              <th scope="col" className="w-8 px-2 py-2">
                <span className="sr-only">Retirer</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {centres.map((centre, i) => (
              <tr key={i} className="border-t border-ligne align-top">
                <td className="px-2 py-2 text-attenue">{i + 1}</td>
                {colonnes.map((c) => (
                  <td key={c.cle} className="px-1 py-1">
                    {c.type === "texte_long" ? (
                      <textarea
                        aria-label={`${c.libelle}, centre ${i + 1}`}
                        rows={2}
                        value={String(centre[c.cle] ?? "")}
                        onChange={(e) => modifier(i, c.cle, e.target.value)}
                        placeholder={c.exemple}
                        className="champ min-w-48 resize-y"
                      />
                    ) : (
                      <input
                        aria-label={`${c.libelle}, centre ${i + 1}`}
                        type={c.type === "nombre" ? "number" : "text"}
                        value={String(centre[c.cle] ?? "")}
                        onChange={(e) => modifier(i, c.cle, e.target.value)}
                        placeholder={c.exemple}
                        className="champ min-w-40"
                      />
                    )}
                  </td>
                ))}
                <td className="px-1 py-2">
                  <button
                    type="button"
                    onClick={() => setCentres((avant) => avant.filter((_, j) => j !== i))}
                    className="rounded-lg px-2 py-1 text-attenue transition hover:bg-creux hover:text-alerte"
                    aria-label={`Retirer le centre ${i + 1}`}
                  >
                    ×
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <button
        type="button"
        onClick={() => setCentres((avant) => [...avant, {}])}
        className="bouton-discret"
      >
        + Ajouter un centre
      </button>

      <details className="rounded-xl border border-ligne p-3">
        <summary className="cursor-pointer text-sm font-medium">Coller depuis Excel</summary>
        <p className="mt-2 text-xs text-attenue">
          Une ligne par centre, colonnes dans cet ordre : {colonnes.map((c) => c.libelle).join(" · ")}.
          Une ligne d&apos;en-têtes est ignorée.
        </p>
        <textarea
          aria-label="Centres collés depuis Excel"
          rows={4}
          value={collage}
          onChange={(e) => setCollage(e.target.value)}
          className="champ mt-2 resize-y font-mono text-xs"
        />
        <button type="button" onClick={importer} className="bouton-discret mt-2" disabled={!collage.trim()}>
          Ajouter au tableau
        </button>
      </details>

      {etat.erreur && (
        <p role="alert" className="text-sm text-alerte">
          {etat.erreur}
        </p>
      )}

      <div className="flex justify-end">
        <BoutonGenerer nombre={remplis.length} />
      </div>
    </form>
  );
}
