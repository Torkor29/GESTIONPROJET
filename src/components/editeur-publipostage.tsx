"use client";

import { useEffect, useId, useMemo, useRef, useState, useTransition } from "react";
import { enregistrerPublipostage } from "@/actions/publipostage";
import { type EtatFormulaire, VIDE } from "@/actions/etat";
import type { Etude, Publipostage } from "@/db/schema";
import { STATUTS_PUBLIPOSTAGE } from "@/lib/constantes";
import { versChampDate } from "@/lib/format";
import {
  type Champ,
  type ModelePublipostage,
  type Valeurs,
  champsDuModele,
  completude,
  estRempli,
  lireValeurs,
  modelePublipostage,
} from "@/lib/publipostage";

/** Relit le formulaire tel qu'il est à l'écran, pour la complétude en direct. */
function lireFormulaire(form: HTMLFormElement, modele: ModelePublipostage): Valeurs {
  const donnees = new FormData(form);
  const valeurs: Valeurs = {};
  for (const champ of champsDuModele(modele)) {
    const nom = `champ_${champ.cle}`;
    if (champ.type === "cases") {
      const coches = donnees.getAll(nom).map(String);
      if (coches.length > 0) valeurs[champ.cle] = coches;
    } else {
      const v = String(donnees.get(nom) ?? "").trim();
      if (v) valeurs[champ.cle] = v;
    }
  }
  return valeurs;
}

/** Nom de fichier annoncé par le serveur, pour enregistrer le téléchargement sous ce nom. */
function nomDepuisEntete(entete: string | null, repli: string): string {
  if (!entete) return repli;
  const utf8 = /filename\*=UTF-8''([^;]+)/i.exec(entete);
  if (utf8) {
    try {
      return decodeURIComponent(utf8[1]);
    } catch {
      // Encodage inattendu : on retombe sur le nom ASCII.
    }
  }
  const ascii = /filename="([^"]+)"/i.exec(entete);
  return ascii ? ascii[1] : repli;
}

/** Signale le changement au formulaire, comme le ferait une saisie clavier. */
function signalerSaisie(element: HTMLElement) {
  element.dispatchEvent(new Event("input", { bubbles: true }));
}

function ChampSaisie({ champ, valeur, id }: { champ: Champ; valeur: Valeurs[string] | undefined; id: string }) {
  const nom = `champ_${champ.cle}`;
  const texte = typeof valeur === "string" ? valeur : "";
  const commun = { id, name: nom, className: "champ", placeholder: champ.exemple };

  switch (champ.type) {
    case "texte_long":
      return <textarea {...commun} rows={3} defaultValue={texte} />;
    case "date":
      return <input {...commun} type="date" defaultValue={texte} />;
    case "montant":
      return <input {...commun} inputMode="decimal" defaultValue={texte} />;
    case "nombre":
      return <input {...commun} inputMode="numeric" defaultValue={texte} />;
    case "email":
      return <input {...commun} type="email" defaultValue={texte} />;
    case "telephone":
      return <input {...commun} type="tel" defaultValue={texte} />;

    case "choix": {
      const options = champ.options ?? [];
      // Peu d'options : des boutons radio, lisibles d'un coup d'œil. Au-delà,
      // une liste déroulante évite un mur de cases.
      if (options.length > 5) {
        return (
          <select id={id} name={nom} defaultValue={texte} className="champ">
            <option value="">—</option>
            {options.map((o) => (
              <option key={o} value={o}>
                {o}
              </option>
            ))}
          </select>
        );
      }
      return (
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 pt-1">
          {options.map((o) => (
            <label key={o} className="inline-flex cursor-pointer items-center gap-2 text-sm">
              <input
                type="radio"
                name={nom}
                value={o}
                defaultChecked={texte === o}
                className="accent-accent"
              />
              {o}
            </label>
          ))}
          <button
            type="button"
            onClick={(e) => {
              const groupe = e.currentTarget.form?.querySelectorAll<HTMLInputElement>(
                `input[type="radio"][name="${nom}"]`,
              );
              groupe?.forEach((r) => {
                r.checked = false;
              });
              if (e.currentTarget.form) signalerSaisie(e.currentTarget.form);
            }}
            className="text-xs text-efface underline-offset-2 hover:text-encre hover:underline"
          >
            effacer
          </button>
        </div>
      );
    }

    case "cases": {
      const coches = Array.isArray(valeur) ? valeur : [];
      return (
        <div className="grid gap-x-4 gap-y-2 pt-1 sm:grid-cols-2">
          {(champ.options ?? []).map((o) => (
            <label key={o} className="inline-flex cursor-pointer items-start gap-2 text-sm">
              <input
                type="checkbox"
                name={nom}
                value={o}
                defaultChecked={coches.includes(o)}
                className="mt-0.5 accent-accent"
              />
              {o}
            </label>
          ))}
        </div>
      );
    }

    default:
      return <input {...commun} defaultValue={texte} />;
  }
}

/**
 * Saisie d'un document de publipostage : les champs du modèle à gauche, le
 * suivi et les exports à droite.
 *
 * L'enregistrement passe par une transition et non par `<form action>` :
 * React 19 réinitialise un formulaire après son action, ce qui ferait
 * clignoter une cinquantaine de champs à chaque enregistrement.
 */
export default function EditeurPublipostage({
  document: doc,
  etudes,
  suggestions,
}: {
  document: Publipostage;
  etudes: Pick<Etude, "id" | "nom" | "code">[];
  /** Par étude, les valeurs que sa fiche peut apporter au document. */
  suggestions: Record<number, Valeurs>;
}) {
  const uid = useId();
  const modele = modelePublipostage(doc.modele)!;
  const formulaire = useRef<HTMLFormElement>(null);
  const champEnvoi = useRef<HTMLInputElement>(null);
  const champRetour = useRef<HTMLInputElement>(null);

  const enregistrees = useMemo(() => lireValeurs(doc.valeurs), [doc.valeurs]);
  const [valeurs, setValeurs] = useState<Valeurs>(enregistrees);
  const [modifie, setModifie] = useState(false);
  const [etat, setEtat] = useState<EtatFormulaire>(VIDE);
  const [enregistreA, setEnregistreA] = useState<string | null>(null);
  const [exportEnCours, setExportEnCours] = useState<string | null>(null);
  const [enCours, demarrer] = useTransition();

  const avancement = completude(modele, valeurs);

  // Quitter la page avec des modifications non enregistrées demande confirmation.
  useEffect(() => {
    if (!modifie) return;
    const retenir = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", retenir);
    return () => window.removeEventListener("beforeunload", retenir);
  }, [modifie]);

  // Ctrl+S / Cmd+S enregistre, comme dans Word.
  useEffect(() => {
    const auClavier = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        formulaire.current?.requestSubmit();
      }
    };
    window.addEventListener("keydown", auClavier);
    return () => window.removeEventListener("keydown", auClavier);
  }, []);

  /** Enregistre, puis enchaîne éventuellement une autre étape. */
  const enregistrer = (ensuite?: () => Promise<void>) => {
    const form = formulaire.current;
    if (!form) return;
    const donnees = new FormData(form);
    demarrer(async () => {
      const resultat = await enregistrerPublipostage(VIDE, donnees);
      setEtat(resultat);
      if (resultat.erreur) return;
      setModifie(false);
      setEnregistreA(
        new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }),
      );
      if (ensuite) await ensuite();
    });
  };

  /**
   * Télécharge l'export. Passer par fetch plutôt que par un simple lien
   * permet d'afficher l'attente (la conversion PDF prend quelques secondes)
   * et un message lisible si elle échoue.
   */
  const telecharger = async (format: "docx" | "pdf") => {
    setExportEnCours(format);
    try {
      const reponse = await fetch(`/api/publipostage/${doc.id}?format=${format}`);
      if (!reponse.ok) {
        setEtat({ erreur: (await reponse.text()) || "L'export a échoué." });
        return;
      }
      const contenu = await reponse.blob();
      const lien = window.document.createElement("a");
      lien.href = URL.createObjectURL(contenu);
      lien.download = nomDepuisEntete(
        reponse.headers.get("Content-Disposition"),
        `document.${format}`,
      );
      // Un lien hors du document voit son nom de fichier ignoré par certains
      // navigateurs : on l'accroche le temps du clic.
      window.document.body.appendChild(lien);
      lien.click();
      lien.remove();
      setTimeout(() => URL.revokeObjectURL(lien.href), 10_000);
    } catch {
      setEtat({ erreur: "Le serveur ne répond pas. Réessayez dans un instant." });
    } finally {
      setExportEnCours(null);
    }
  };

  // Un export reflète ce qui est en base : s'il reste des modifications, on
  // les enregistre d'abord plutôt que d'exporter une version périmée.
  const exporter = (format: "docx" | "pdf") => {
    if (modifie) enregistrer(() => telecharger(format));
    else void telecharger(format);
  };

  const quandSaisie = () => {
    if (!formulaire.current) return;
    setModifie(true);
    setValeurs(lireFormulaire(formulaire.current, modele));
  };

  /**
   * Remplit, à l'écran, les champs encore vides avec les informations de
   * l'étude choisie. Rien n'est écrasé et rien n'est enregistré d'office :
   * on voit ce qui a été repris avant de valider.
   */
  const reprendreEtude = () => {
    const form = formulaire.current;
    if (!form) return;
    const choix = form.elements.namedItem("etudeId");
    const etudeId = choix instanceof HTMLSelectElement ? Number(choix.value) : 0;
    const apports = etudeId ? suggestions[etudeId] : undefined;
    if (!apports) return;

    let repris = 0;
    for (const [cle, valeur] of Object.entries(apports)) {
      const champ = form.elements.namedItem(`champ_${cle}`);
      const saisissable =
        champ instanceof HTMLInputElement || champ instanceof HTMLTextAreaElement;
      if (saisissable && typeof valeur === "string" && champ.value.trim() === "") {
        champ.value = valeur;
        repris += 1;
      }
    }

    if (repris > 0) quandSaisie();
    setEtat({
      avertissement:
        repris > 0
          ? `${repris} champ${repris > 1 ? "s" : ""} repris de la fiche étude. Pensez à enregistrer.`
          : "Rien à reprendre : les champs que l'étude peut remplir le sont déjà.",
    });
  };

  const aujourdhui = versChampDate(Math.floor(Date.now() / 1000));

  return (
    <form
      ref={formulaire}
      onSubmit={(e) => {
        e.preventDefault();
        enregistrer();
      }}
      // L'évènement « input » remonte de tous les champs, cases et listes
      // comprises : un seul écouteur suffit à suivre la saisie.
      onInput={quandSaisie}
      className="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_19rem]"
    >
      <input type="hidden" name="id" value={doc.id} />

      {/* ------------------------------------------------ Champs du modèle */}
      <div className="space-y-4">
        {modele.sections.map((section) => {
          const attendus = section.champs.filter((c) => !c.facultatif);
          const faits = attendus.filter((c) => estRempli(valeurs[c.cle])).length;
          return (
            <fieldset key={section.titre} className="carte p-5">
              <legend className="sr-only">{section.titre}</legend>
              <div className="mb-4 flex items-baseline justify-between gap-3">
                <h2 className="font-titre text-lg font-bold">{section.titre}</h2>
                {attendus.length > 0 && (
                  <span
                    className={`chiffres shrink-0 text-xs ${faits === attendus.length ? "text-reussite" : "text-attenue"}`}
                  >
                    {faits}/{attendus.length}
                  </span>
                )}
              </div>
              {section.description && (
                <p className="-mt-2 mb-4 text-sm text-attenue">{section.description}</p>
              )}

              <div className="grid gap-4 sm:grid-cols-2">
                {section.champs.map((champ) => {
                  const id = `${uid}-${champ.cle}`;
                  const large =
                    champ.large || champ.type === "texte_long" || champ.type === "cases";
                  const manquant = !champ.facultatif && !estRempli(valeurs[champ.cle]);
                  const groupe = champ.type === "choix" || champ.type === "cases";
                  return (
                    <div key={champ.cle} className={large ? "sm:col-span-2" : undefined}>
                      {groupe ? (
                        <p className="mb-1.5 text-sm font-medium">
                          {champ.libelle}
                          {manquant && <Temoin />}
                        </p>
                      ) : (
                        <label htmlFor={id} className="mb-1.5 block text-sm font-medium">
                          {champ.libelle}
                          {champ.facultatif && (
                            <span className="font-normal text-efface"> (facultatif)</span>
                          )}
                          {manquant && <Temoin />}
                        </label>
                      )}
                      <ChampSaisie champ={champ} valeur={enregistrees[champ.cle]} id={id} />
                      {champ.aide && <p className="mt-1 text-xs text-attenue">{champ.aide}</p>}
                    </div>
                  );
                })}
              </div>
            </fieldset>
          );
        })}
      </div>

      {/* ----------------------------------------------- Suivi et exports */}
      <aside className="space-y-4 lg:sticky lg:top-6">
        <div className="carte space-y-4 p-4">
          <div>
            <div className="flex items-baseline justify-between">
              <p className="sur-titre">Complété</p>
              <p className="chiffres text-sm font-semibold">{avancement.pourcentage} %</p>
            </div>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-creux">
              <div
                className={`h-full rounded-full transition-all duration-300 ${avancement.pourcentage === 100 ? "bg-reussite" : "bg-accent"}`}
                style={{ width: `${avancement.pourcentage}%` }}
              />
            </div>
            <p className="mt-1 text-xs text-attenue">
              {avancement.remplis} champ{avancement.remplis > 1 ? "s" : ""} sur {avancement.total}
              {avancement.remplis < avancement.total && " — les champs à compléter portent un point orange"}
            </p>
          </div>

          <button type="submit" className="bouton w-full" disabled={enCours}>
            {enCours ? "Enregistrement…" : "Enregistrer"}
          </button>
          <p className="-mt-2 text-center text-xs text-attenue" aria-live="polite">
            {modifie
              ? "Modifications non enregistrées"
              : enregistreA
                ? `Enregistré à ${enregistreA}`
                : "Ctrl+S pour enregistrer"}
          </p>

          <div className="grid grid-cols-2 gap-2">
            {(["docx", "pdf"] as const).map((format) => (
              <button
                key={format}
                type="button"
                onClick={() => exporter(format)}
                disabled={enCours || exportEnCours !== null}
                className="bouton-discret px-2"
              >
                {exportEnCours === format
                  ? format === "pdf"
                    ? "Conversion…"
                    : "Préparation…"
                  : format === "docx"
                    ? "Word"
                    : "PDF"}
              </button>
            ))}
          </div>

          {etat.erreur && (
            <p role="alert" className="text-sm text-alerte">
              {etat.erreur}
            </p>
          )}
          {!etat.erreur && etat.avertissement && (
            <p role="status" className="text-sm text-attenue">
              {etat.avertissement}
            </p>
          )}
        </div>

        <div className="carte space-y-3 p-4">
          <p className="sur-titre">Suivi du circuit</p>

          <div>
            <label htmlFor={`${uid}-statut`} className="mb-1.5 block text-sm font-medium">
              Statut
            </label>
            <select
              id={`${uid}-statut`}
              name="statut"
              defaultValue={doc.statut}
              className="champ"
              onChange={(e) => {
                // Passer à « envoyé » ou à un retour date l'étape du jour,
                // si la date n'est pas déjà renseignée.
                const statut = e.target.value;
                const envoi = ["envoye_coordo", "corrections", "valide", "signe"].includes(statut);
                const retour = ["corrections", "valide", "signe"].includes(statut);
                if (envoi && champEnvoi.current && !champEnvoi.current.value) {
                  champEnvoi.current.value = aujourdhui;
                }
                if (retour && champRetour.current && !champRetour.current.value) {
                  champRetour.current.value = aujourdhui;
                }
              }}
            >
              {Object.entries(STATUTS_PUBLIPOSTAGE).map(([cle, l]) => (
                <option key={cle} value={cle}>
                  {l}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor={`${uid}-destinataire`} className="mb-1.5 block text-sm font-medium">
              Envoyé à
            </label>
            <input
              id={`${uid}-destinataire`}
              name="destinataire"
              defaultValue={doc.destinataire ?? ""}
              className="champ"
              placeholder="Nom du coordo, service…"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label htmlFor={`${uid}-envoi`} className="mb-1.5 block text-xs font-medium">
                Envoyé le
              </label>
              <input
                // Clé sur la valeur en base : une date posée par le serveur
                // lors d'un changement de statut s'affiche sans recharger.
                key={`envoi-${doc.envoyeLe ?? ""}`}
                ref={champEnvoi}
                id={`${uid}-envoi`}
                name="envoyeLe"
                type="date"
                defaultValue={versChampDate(doc.envoyeLe)}
                className="champ px-2"
              />
            </div>
            <div>
              <label htmlFor={`${uid}-retour`} className="mb-1.5 block text-xs font-medium">
                Retour le
              </label>
              <input
                key={`retour-${doc.retourLe ?? ""}`}
                ref={champRetour}
                id={`${uid}-retour`}
                name="retourLe"
                type="date"
                defaultValue={versChampDate(doc.retourLe)}
                className="champ px-2"
              />
            </div>
          </div>

          <div>
            <label htmlFor={`${uid}-notes`} className="mb-1.5 block text-sm font-medium">
              Notes de suivi
            </label>
            <textarea
              id={`${uid}-notes`}
              name="notes"
              rows={3}
              defaultValue={doc.notes ?? ""}
              className="champ"
              placeholder="Relance faite le…, corrections demandées…"
            />
          </div>
        </div>

        <div className="carte space-y-3 p-4">
          <p className="sur-titre">Document</p>
          <div>
            <label htmlFor={`${uid}-titre`} className="mb-1.5 block text-sm font-medium">
              Titre
            </label>
            <input
              // Le titre proposé suit les champs : quand le serveur le
              // recalcule, le champ doit l'afficher, sinon l'enregistrement
              // suivant renverrait l'ancien.
              key={`titre-${doc.titre}`}
              id={`${uid}-titre`}
              name="titre"
              defaultValue={doc.titre}
              className="champ"
            />
            <p className="mt-1 text-xs text-attenue">Sert aussi de nom au fichier exporté.</p>
          </div>
          <div>
            <label htmlFor={`${uid}-etude`} className="mb-1.5 block text-sm font-medium">
              Étude
            </label>
            <select
              id={`${uid}-etude`}
              name="etudeId"
              defaultValue={doc.etudeId ? String(doc.etudeId) : ""}
              className="champ"
            >
              <option value="">Sans étude</option>
              {etudes.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.code ? `${e.code} — ${e.nom}` : e.nom}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={reprendreEtude}
              className="mt-1.5 text-xs text-accent underline-offset-2 hover:underline"
            >
              Reprendre les infos de l&apos;étude dans les champs vides
            </button>
          </div>
        </div>
      </aside>
    </form>
  );
}

/** Point discret signalant un champ attendu encore vide. */
function Temoin() {
  return (
    <>
      <span
        aria-hidden
        title="À compléter"
        className="ml-1.5 inline-block h-1.5 w-1.5 -translate-y-0.5 rounded-full bg-attention"
      />
      <span className="sr-only"> (à compléter)</span>
    </>
  );
}
