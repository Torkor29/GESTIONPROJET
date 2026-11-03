"use client";

import { useState, useTransition } from "react";
import { redigerIA } from "@/actions/ia";
import { TYPES_REDACTION, type TypeRedaction } from "@/lib/ia-texte";
import { Icone } from "./icones";
import Modale from "./modale";

const EXEMPLES: Record<TypeRedaction, string> = {
  relance: "Relancer le promoteur : convention non signée depuis 3 semaines, besoin d'un retour avant le 20.",
  cpp: "Transmission de l'amendement substantiel n°2 : modification des critères d'inclusion, nouvelle note d'information.",
  suivi_visite: "Visite du 12/11 au CH Morlaix : 2 consentements à re-signer, classeur investigateur à compléter, prochaine visite en janvier.",
  libre: "Ce que doit contenir le document…",
};

/**
 * Rédaction assistée : mail de relance, courrier CPP, lettre de suivi de
 * visite. La fiche de l'étude (acronyme, titre, promoteur, identifiants,
 * dates) est jointe à la demande ; le reste vient des points saisis.
 */
export default function RedactionIA({ etudeId, disponible }: { etudeId: number; disponible: boolean }) {
  const [ouverte, setOuverte] = useState(false);
  const [type, setType] = useState<TypeRedaction>("relance");
  const [points, setPoints] = useState("");
  const [texte, setTexte] = useState("");
  const [erreur, setErreur] = useState<string | null>(null);
  const [copie, setCopie] = useState(false);
  const [enCours, demarrer] = useTransition();

  return (
    <>
      <button type="button" onClick={() => setOuverte(true)} className="bouton-discret">
        <Icone nom="etincelles" className="h-4 w-4" />
        Rédiger
      </button>
      <Modale ouverte={ouverte} onFermer={() => setOuverte(false)} titre="Rédiger avec l'IA" large>
        {!disponible ? (
          <p className="text-sm text-attenue">
            L&apos;IA n&apos;est pas activée sur ce serveur : renseignez ASSISTANT_CLE_API dans le fichier .env.
          </p>
        ) : (
          <div className="space-y-4">
            <div className="segments">
              {(Object.keys(TYPES_REDACTION) as TypeRedaction[]).map((t) => (
                <button
                  key={t}
                  type="button"
                  aria-current={type === t ? "page" : undefined}
                  onClick={() => setType(t)}
                  className="segment"
                >
                  {TYPES_REDACTION[t].libelle}
                </button>
              ))}
            </div>
            <div>
              <label htmlFor="points-ia" className="mb-1.5 block text-sm font-medium">
                Points à aborder
              </label>
              <textarea
                id="points-ia"
                value={points}
                onChange={(e) => setPoints(e.target.value)}
                rows={4}
                placeholder={EXEMPLES[type]}
                className="champ resize-y"
              />
              <p className="mt-1 text-xs text-efface">
                La fiche de l&apos;étude (acronyme, titre, promoteur, identifiants, dates) et ces points
                sont envoyés au fournisseur du modèle. Pas de données patients.
              </p>
            </div>
            <button
              type="button"
              disabled={enCours}
              onClick={() => {
                setErreur(null);
                demarrer(async () => {
                  const r = await redigerIA(etudeId, type, points);
                  if (r.ok) setTexte(r.texte);
                  else setErreur(r.erreur);
                });
              }}
              className="bouton"
            >
              <Icone nom="etincelles" className="h-4 w-4" />
              {enCours ? "Rédaction en cours…" : texte ? "Rédiger à nouveau" : "Rédiger"}
            </button>
            {erreur && <p className="rounded-md bg-alerte-voile px-3 py-2 text-sm text-alerte">{erreur}</p>}
            {texte && (
              <div className="border-t border-ligne pt-4">
                <textarea
                  value={texte}
                  onChange={(e) => setTexte(e.target.value)}
                  rows={14}
                  aria-label="Texte rédigé"
                  className="champ resize-y text-sm leading-relaxed"
                />
                <div className="mt-2 flex gap-2">
                  <button
                    type="button"
                    onClick={async () => {
                      await navigator.clipboard.writeText(texte).catch(() => {});
                      setCopie(true);
                      setTimeout(() => setCopie(false), 2000);
                    }}
                    className="bouton-discret"
                  >
                    {copie ? "Copié ✓" : "Copier"}
                  </button>
                  <p className="self-center text-xs text-efface">Relisez avant envoi : l&apos;IA peut se tromper.</p>
                </div>
              </div>
            )}
          </div>
        )}
      </Modale>
    </>
  );
}
