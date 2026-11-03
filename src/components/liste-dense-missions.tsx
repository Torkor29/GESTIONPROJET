"use client";

import { useMemo, useState, useTransition } from "react";
import { definirStatutMissions } from "@/actions/taches";
import SelecteurStatut from "./selecteur-statut";
import CarteMission from "./carte-mission";
import Modale from "./modale";
import type { ComponentProps } from "react";
import { LIBELLES_STATUT_MISSION } from "@/lib/constantes";
import { formaterDate } from "@/lib/format";

export type LigneDense = {
  id: number;
  titre: string;
  type: string | null;
  etudes: { sigle: string; couleur: string }[];
  statut: string;
  priorite: string;
  echeance: number | null;
  assigneNom: string | null;
  etapes: { faites: number; total: number };
  peutEcrire: boolean;
  /** De quoi afficher la mission entière dans la fenêtre de détail. */
  carte: Omit<ComponentProps<typeof CarteMission>, "etudes" | "membres" | "comptes">;
};

type Partage = Pick<ComponentProps<typeof CarteMission>, "etudes" | "membres" | "comptes">;

type Tri = "titre" | "etude" | "statut" | "echeance" | "assigne";

const ORDRE_STATUT: Record<string, number> = { a_faire: 0, en_cours: 1, terminee: 2 };

/**
 * Vue liste des missions : une ligne par mission, colonnes triables, et
 * sélection multiple pour changer le statut de plusieurs missions d'un coup.
 */
export default function ListeDenseMissions({
  lignes,
  maintenant,
  partage,
}: {
  lignes: LigneDense[];
  maintenant: number;
  partage: Partage;
}) {
  const [detailId, setDetailId] = useState<number | null>(null);
  const detail = lignes.find((l) => l.id === detailId);
  const [tri, setTri] = useState<{ cle: Tri; sens: 1 | -1 }>({ cle: "echeance", sens: 1 });
  const [choisies, setChoisies] = useState<Set<number>>(new Set());
  const [enCours, demarrer] = useTransition();
  const [message, setMessage] = useState<string | null>(null);

  const triees = useMemo(() => {
    const valeur = (l: LigneDense): string | number => {
      switch (tri.cle) {
        case "titre":
          return l.titre.toLocaleLowerCase("fr");
        case "etude":
          return l.etudes[0]?.sigle.toLocaleLowerCase("fr") ?? "~";
        case "statut":
          return ORDRE_STATUT[l.statut] ?? 9;
        case "assigne":
          return l.assigneNom?.toLocaleLowerCase("fr") ?? "~";
        default:
          // Sans échéance : en fin de liste, quel que soit le sens.
          return l.echeance ?? (tri.sens === 1 ? Number.MAX_SAFE_INTEGER : 0);
      }
    };
    return [...lignes].sort((a, b) => {
      const x = valeur(a);
      const y = valeur(b);
      return (x < y ? -1 : x > y ? 1 : 0) * tri.sens;
    });
  }, [lignes, tri]);

  const modifiables = triees.filter((l) => l.peutEcrire);
  const toutCoche = modifiables.length > 0 && modifiables.every((l) => choisies.has(l.id));

  const trier = (cle: Tri) =>
    setTri((t) => (t.cle === cle ? { cle, sens: t.sens === 1 ? -1 : 1 } : { cle, sens: 1 }));

  const Entete = ({ cle, children, className = "" }: { cle: Tri; children: React.ReactNode; className?: string }) => (
    <th scope="col" className={`px-3 py-2.5 ${className}`} aria-sort={tri.cle === cle ? (tri.sens === 1 ? "ascending" : "descending") : "none"}>
      <button type="button" onClick={() => trier(cle)} className="sur-titre inline-flex items-center gap-1 hover:text-encre">
        {children}
        <span aria-hidden className={tri.cle === cle ? "text-encre" : "opacity-0"}>
          {tri.sens === 1 ? "↑" : "↓"}
        </span>
      </button>
    </th>
  );

  const appliquer = (statut: string) => {
    const ids = [...choisies];
    demarrer(async () => {
      const bilan = await definirStatutMissions(ids, statut);
      setChoisies(new Set());
      setMessage(
        `${bilan.faites} mission${bilan.faites > 1 ? "s" : ""} passée${bilan.faites > 1 ? "s" : ""} en « ${LIBELLES_STATUT_MISSION[statut]} »` +
          (bilan.refusees > 0 ? ` · ${bilan.refusees} laissée${bilan.refusees > 1 ? "s" : ""} (droits ou étapes)` : ""),
      );
    });
  };

  if (lignes.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-ligne-forte bg-relief/50 p-10 text-center text-sm text-attenue">
        Aucune mission ne correspond à ces filtres.
      </p>
    );
  }

  return (
    <div className="space-y-2">
      <Modale
        ouverte={detail !== undefined}
        onFermer={() => setDetailId(null)}
        titre={detail?.titre ?? "Mission"}
        large
      >
        {detail && <CarteMission key={detail.id} {...detail.carte} {...partage} />}
      </Modale>
      <div
        className={`flex min-h-10 flex-wrap items-center gap-2 rounded-lg px-3 py-1.5 text-sm transition-colors ${
          choisies.size > 0 ? "bg-accent-voile" : ""
        }`}
      >
        {choisies.size > 0 ? (
          <>
            <span className="font-medium text-accent-appuye">
              {choisies.size} sélectionnée{choisies.size > 1 ? "s" : ""}
            </span>
            <span className="text-attenue">· passer en</span>
            {Object.entries(LIBELLES_STATUT_MISSION).map(([v, l]) => (
              <button
                key={v}
                type="button"
                disabled={enCours}
                onClick={() => appliquer(v)}
                className="bouton-discret !min-h-7 !px-2.5 !py-0.5 text-xs"
              >
                {l}
              </button>
            ))}
            <button
              type="button"
              onClick={() => setChoisies(new Set())}
              className="ml-auto text-xs text-attenue hover:text-encre"
            >
              Désélectionner
            </button>
          </>
        ) : (
          <span className="text-xs text-efface">
            {message ?? "Cochez des missions pour changer leur statut d'un coup. Cliquez un en-tête pour trier."}
          </span>
        )}
      </div>

      <div className="relative overflow-x-auto rounded-xl border border-ligne bg-relief shadow-posee">
        <table className="w-full min-w-[52rem] border-collapse text-sm">
          <thead>
            <tr className="border-b border-ligne bg-creux/50 text-left">
              <th scope="col" className="w-10 px-3 py-2.5">
                <input
                  type="checkbox"
                  aria-label="Tout sélectionner"
                  checked={toutCoche}
                  onChange={() =>
                    setChoisies(toutCoche ? new Set() : new Set(modifiables.map((l) => l.id)))
                  }
                  className="h-4 w-4 accent-accent"
                />
              </th>
              <Entete cle="titre">Mission</Entete>
              <Entete cle="etude" className="w-40">Étude</Entete>
              <Entete cle="statut" className="w-40">Statut</Entete>
              <Entete cle="echeance" className="w-32">Échéance</Entete>
              <Entete cle="assigne" className="w-40">Attribuée à</Entete>
            </tr>
          </thead>
          <tbody>
            {triees.map((l) => {
              const retard = l.statut !== "terminee" && l.echeance !== null && l.echeance < maintenant;
              const coche = choisies.has(l.id);
              return (
                <tr
                  key={l.id}
                  onClick={(ev) => {
                    // Un clic sur la ligne ouvre la mission, sauf sur ses contrôles.
                    if ((ev.target as HTMLElement).closest("button, input, a, [role=listbox]")) return;
                    setDetailId(l.id);
                  }}
                  className={`cursor-pointer border-b border-ligne last:border-0 ${coche ? "bg-accent-voile/40" : "hover:bg-creux/50"}`}
                >
                  <td className="px-3 py-2">
                    <input
                      type="checkbox"
                      aria-label={`Sélectionner ${l.titre}`}
                      disabled={!l.peutEcrire}
                      checked={coche}
                      onChange={() =>
                        setChoisies((c) => {
                          const n = new Set(c);
                          if (n.has(l.id)) n.delete(l.id);
                          else n.add(l.id);
                          return n;
                        })
                      }
                      className="h-4 w-4 accent-accent disabled:opacity-30"
                    />
                  </td>
                  <td className="px-3 py-2">
                    {/* Le titre ouvre la mission entière : étapes, temps, modification. */}
                    <button
                      type="button"
                      onClick={() => setDetailId(l.id)}
                      className={`block text-left font-medium hover:text-accent-appuye hover:underline ${l.statut === "terminee" ? "text-attenue line-through" : ""}`}
                    >
                      {l.titre}
                    </button>
                    <span className="block text-xs text-efface">
                      {[
                        l.type,
                        l.priorite === "haute" ? "Importante" : null,
                        l.etapes.total > 0 ? `${l.etapes.faites}/${l.etapes.total} étapes` : null,
                      ]
                        .filter(Boolean)
                        .join(" · ")}
                    </span>
                  </td>
                  <td className="px-3 py-2">
                    <span className="flex flex-wrap gap-1">
                      {l.etudes.slice(0, 3).map((e) => (
                        <span
                          key={e.sigle}
                          className="etiquette"
                          style={{ backgroundColor: `${e.couleur}22`, color: e.couleur }}
                        >
                          {e.sigle}
                        </span>
                      ))}
                      {l.etudes.length > 3 && <span className="etiquette">+{l.etudes.length - 3}</span>}
                      {l.etudes.length === 0 && <span className="text-efface">—</span>}
                    </span>
                  </td>
                  <td className="px-3 py-2">
                    <SelecteurStatut
                      id={l.id}
                      statut={l.statut}
                      verrouille={!l.peutEcrire || l.etapes.total > 0}
                    />
                  </td>
                  <td className={`chiffres px-3 py-2 ${retard ? "font-medium text-alerte" : "text-attenue"}`}>
                    {l.echeance ? formaterDate(l.echeance) : "—"}
                  </td>
                  <td className="truncate px-3 py-2 text-attenue">{l.assigneNom ?? "—"}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
