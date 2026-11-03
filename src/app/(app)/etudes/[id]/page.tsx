import Link from "next/link";
import { notFound } from "next/navigation";
import { retirerCouverture, supprimerEtude } from "@/actions/etudes";
import { comptesDisponibles, invitesDeLEtude } from "@/actions/partages";
import { demarrerChrono } from "@/actions/temps";
import { utilisateurActuel } from "@/lib/auth";
import Checklist from "@/components/checklist";
import { Icone } from "@/components/icones";
import { EtiquetteStatutEtude } from "@/components/etiquettes";
import FormulaireEtude from "@/components/formulaire-etude";
import PartageEtude from "@/components/partage-etude";
import FormulaireFaq from "@/components/formulaire-faq";
import FormulaireTache from "@/components/formulaire-tache";
import FormulairePenseBete from "@/components/formulaire-pense-bete";
import ListePenseBete from "@/components/liste-pense-bete";
import ListeFaq from "@/components/liste-faq";
import TableauMissions from "@/components/tableau-missions";
import { ChampFinInclusion } from "@/components/rappel-inclusion";
import { formaterDate, formaterDuree, formaterMontant, heuresDecimales } from "@/lib/format";
import { lireReglementations, referentiel } from "@/lib/referentiels";
import {
  checklistDEtude,
  documentsDEtude,
  dureeMinutes,
  entreesTemps,
  etudeParId,
  faqDEtude,
  listerEtudes,
  membresPourAttribution,
  niveauxPartage,
  pagesDEtude,
  progression,
  tachesDEtude,
  toutesLesConventions,
  toutesLesVisites,
} from "@/lib/requetes";
import ListeEcheances from "@/components/liste-echeances";
import type { Echeance } from "@/lib/echeances";
import {
  STATUTS_CONVENTION_OUVERTS,
  STATUTS_VISITE_OUVERTS,
  TYPES_CONVENTION,
  TYPES_VISITE,
} from "@/lib/constantes";

export const dynamic = "force-dynamic";

const SECTIONS = [
  { cle: "apercu", libelle: "Aperçu" },
  { cle: "missions", libelle: "Missions" },
  { cle: "pense-bete", libelle: "Notes" },
  { cle: "faq", libelle: "FAQ" },
  { cle: "temps", libelle: "Temps" },
] as const;

export default async function PageEtude({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ section?: string }>;
}) {
  const { id } = await params;
  const { section: sectionBrute = "apercu" } = await searchParams;
  const etudeId = Number(id);
  const section =
    sectionBrute === "documents" || sectionBrute === "pages" ? "pense-bete" : sectionBrute;

  const etude = await etudeParId(etudeId);
  if (!etude) notFound();

  const [pages, missions, temps, documents, checklist, faq, toutesEtudes, visites, conventions] = await Promise.all([
    pagesDEtude(etudeId),
    tachesDEtude(etudeId),
    entreesTemps({ etudeId }),
    documentsDEtude(etudeId),
    checklistDEtude(etudeId),
    faqDEtude(etudeId),
    listerEtudes({ avecArchivees: true }),
    toutesLesVisites({ etudeId }),
    toutesLesConventions({ etudeId }),
  ]);

  // Le partage n'est proposé qu'au propriétaire ; les personnes conviées
  // voient l'étude sans pouvoir en élargir l'accès.
  const compte = await utilisateurActuel();
  const estProprietaire = compte !== null && etude.proprietaireId === compte.id;
  const [invites, comptes, membres, niveaux] = estProprietaire
    ? await Promise.all([
        invitesDeLEtude(etudeId),
        comptesDisponibles(compte.id),
        membresPourAttribution(),
        Promise.resolve({} as Record<number, string>),
      ])
    : [[], [], [], await niveauxPartage()];

  const maintenant = Math.floor(Date.now() / 1000);
  const minutesTotal = temps.reduce((t, l) => t + dureeMinutes(l.entree), 0);
  const valorise = etude.tarifHoraire ? heuresDecimales(minutesTotal) * etude.tarifHoraire : null;
  const ouvertes = missions.filter((t) => t.statut !== "terminee");
  const enRetard = ouvertes.filter((t) => t.echeance && t.echeance < maintenant);
  const lien = (cle: string) => `/etudes/${etudeId}?section=${cle}`;
  const prog = progression(checklist);

  // Fiche : on ne montre que ce qui est renseigné, et l'on propose de
  // compléter le reste plutôt que d'aligner des tirets.
  const champsFiche: [string, string | null][] = [
    ["Promoteur", etude.promoteur],
    ["Investigateur coordonnateur", etude.investigateur],
    ["ID-RCB", etude.idRcb],
    ["N° CTIS / EudraCT / NCT", etude.numeroCtis],
    ["Référence CPP", etude.numeroCpp],
    ["Partenaire ou financeur", etude.client],
    ["Début", etude.dateDebut ? formaterDate(etude.dateDebut) : null],
    ["Fin prévue", etude.dateFin ? formaterDate(etude.dateFin) : null],
  ];
  const champsRenseignes = champsFiche.filter((c): c is [string, string] => Boolean(c[1]));
  const manquants = champsFiche.length - champsRenseignes.length;

  const echeances: Echeance[] = [
    ...ouvertes
      .filter((t) => t.echeance)
      .map((t) => ({
        cle: `m${t.id}`,
        nature: "mission" as const,
        titre: t.titre,
        detail: t.assigneNom ?? t.type ?? null,
        date: t.echeance!,
        href: lien("missions"),
      })),
    ...visites
      .filter((v) => v.visite.datePrevue && !v.visite.dateRealisee && STATUTS_VISITE_OUVERTS.includes(v.visite.statut))
      .map((v) => ({
        cle: `v${v.visite.id}`,
        nature: "visite" as const,
        titre: TYPES_VISITE[v.visite.type] ?? "Visite",
        detail: v.visite.centre,
        date: v.visite.datePrevue!,
        href: `/visites?etude=${etudeId}`,
      })),
    ...conventions
      .filter((c) => c.convention.dateEcheance && STATUTS_CONVENTION_OUVERTS.includes(c.convention.statut))
      .map((c) => ({
        cle: `c${c.convention.id}`,
        nature: "convention" as const,
        titre: `${TYPES_CONVENTION[c.convention.type] ?? "Convention"}${c.convention.reference ? ` ${c.convention.reference}` : ""}`,
        detail: c.convention.partie,
        date: c.convention.dateEcheance!,
        href: `/budget?etude=${etudeId}`,
      })),
    ...(etude.dateFinInclusion && etude.dateFinInclusion >= maintenant
      ? [{ cle: "fin-inclusion", nature: "jalon" as const, titre: "Fin des inclusions", date: etude.dateFinInclusion, href: lien("apercu") }]
      : []),
    ...(etude.dateFin && etude.dateFin >= maintenant
      ? [{ cle: "fin-etude", nature: "jalon" as const, titre: "Fin de l'étude", date: etude.dateFin, href: lien("apercu") }]
      : []),
  ];

  const reglements = lireReglementations(etude.reglementations)
    .map((c) => referentiel(c))
    .filter((r) => r !== undefined);

  const compteurs: Record<string, number> = {
    missions: ouvertes.length,
    checklist: prog.total - prog.faits,
    documents: pages.length,
    "pense-bete": pages.length,
    faq: faq.length,
  };

  return (
    <div className="space-y-6">
      {/* ------------------------------------------------------- En-tête */}
      <header>
        {etude.imageCouverture && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={etude.imageCouverture}
            alt=""
            className="mb-4 h-40 w-full rounded-xl object-cover"
          />
        )}

        <nav aria-label="Fil d'Ariane" className="mb-3 flex items-center gap-1.5 text-[13px] text-efface">
          <Link href="/etudes" className="hover:text-encre">
            Études
          </Link>
          <span aria-hidden>/</span>
          <span className="font-medium text-attenue">{etude.code ?? etude.nom}</span>
        </nav>

        <div className="flex flex-wrap items-start justify-between gap-x-8 gap-y-4">
          <div className="min-w-0 flex-1 basis-[28rem]">
            <div className="flex flex-wrap items-center gap-2">
              <span
                aria-hidden
                className="h-3 w-3 shrink-0 rounded-[4px]"
                style={{ backgroundColor: etude.couleur }}
              />
              {etude.code && (
                <span className="text-[13px] font-semibold tracking-wide text-encre">
                  {etude.code}
                </span>
              )}
              <EtiquetteStatutEtude statut={etude.statut} />
              {reglements.map((r) => (
                <span key={r.cle} className="etiquette bg-info-voile text-info">
                  {r.nom.split("—")[0].trim()}
                </span>
              ))}
            </div>
            <h1 className="mt-2 max-w-4xl">{etude.nom}</h1>
            {etude.description && (
              <p className="mt-2 max-w-2xl text-sm text-attenue">{etude.description}</p>
            )}
          </div>

          <div className="flex shrink-0 flex-wrap items-center gap-2">
            {estProprietaire && (
              <PartageEtude etudeId={etude.id} invites={invites} comptes={comptes} />
            )}
            {estProprietaire && (
              <FormulaireEtude etude={etude} libelle="Modifier" variante="discret" />
            )}
            {/* Seul le propriétaire gère les accès : une personne conviée en
                écriture modifie le contenu, pas la liste des invités. */}
            <form action={demarrerChrono}>
              <input type="hidden" name="etudeId" value={etude.id} />
              <button type="submit" className="bouton">
                <Icone nom="chrono" className="h-4 w-4" />
                Chronométrer
              </button>
            </form>
          </div>
        </div>
      </header>

      {/* ------------------------------------------------------- Sections */}
      <nav aria-label="Sections du dossier" className="onglets">
        {SECTIONS.map((s) => (
          <Link
            key={s.cle}
            href={lien(s.cle)}
            aria-current={section === s.cle ? "page" : undefined}
            className="onglet"
          >
            {s.libelle}
            {compteurs[s.cle] > 0 && <span className="onglet-compte">{compteurs[s.cle]}</span>}
          </Link>
        ))}
      </nav>

      {/* --------------------------------------------------------- Aperçu */}
      {section === "apercu" && (
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
          {/* ------------------------------------- Colonne principale */}
          <div className="min-w-0 space-y-6">
            <section className="bloc-app">
              <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
                <h2 className="text-base">Échéances</h2>
                <p className="text-xs text-attenue">
                  Missions, visites, conventions et dates clés de l&apos;étude
                </p>
              </div>
              <ListeEcheances
                echeances={echeances}
                maintenant={maintenant}
                vide="Aucune échéance à venir. Ajoutez une mission datée, ou planifiez une visite."
              />
            </section>

            <section className="bloc-app">
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <h2 className="text-base">
                  Missions ouvertes
                  <span className="chiffres ml-2 text-sm font-normal text-efface">{ouvertes.length}</span>
                </h2>
                <Link href={lien("missions")} className="text-[13px] font-medium text-accent-appuye hover:underline">
                  Toutes les missions
                </Link>
              </div>
              {ouvertes.length === 0 ? (
                <div className="rounded-lg border border-dashed border-ligne-forte px-4 py-6 text-center">
                  <p className="text-sm text-attenue">Aucune mission ouverte sur cette étude.</p>
                  <div className="mt-3 inline-flex">
                    <FormulaireTache
                      etudes={toutesEtudes}
                      etudeIdParDefaut={etude.id}
                      libelle="Créer une mission"
                      variante="discret"
                      membres={membres}
                      comptes={comptes}
                      peutAttribuer={estProprietaire}
                    />
                  </div>
                </div>
              ) : (
                <ul className="divide-y divide-ligne">
                  {ouvertes.slice(0, 6).map((t) => {
                    const retard = Boolean(t.echeance && t.echeance < maintenant);
                    const etapes = t.sousTaches ?? [];
                    return (
                      <li key={t.id} className="flex items-center gap-3 py-2.5">
                        <span
                          aria-hidden
                          className={`h-2 w-2 shrink-0 rounded-full ${t.statut === "en_cours" ? "bg-info" : "bg-efface"}`}
                        />
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-medium">{t.titre}</span>
                          <span className="block truncate text-xs text-attenue">
                            {t.statut === "en_cours" ? "En cours" : "Non démarrée"}
                            {etapes.length > 0 &&
                              ` · ${etapes.filter((e) => e.faite).length}/${etapes.length} étapes`}
                            {t.assigneNom ? ` · ${t.assigneNom}` : ""}
                          </span>
                        </span>
                        <span className={`chiffres shrink-0 text-xs ${retard ? "font-medium text-alerte" : "text-efface"}`}>
                          {t.echeance ? formaterDate(t.echeance) : "Sans échéance"}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              )}
              {ouvertes.length > 6 && (
                <Link href={lien("missions")} className="mt-2 block text-xs text-efface hover:text-encre">
                  + {ouvertes.length - 6} autre{ouvertes.length - 6 > 1 ? "s" : ""}
                </Link>
              )}
            </section>
          </div>

          {/* ------------------------------------------ Colonne latérale */}
          <aside className="min-w-0 space-y-4">
            <section className="bloc-app space-y-4">
              <dl className="grid grid-cols-3 gap-2 text-center">
                <div>
                  <dt className="text-[11px] text-efface">Missions</dt>
                  <dd className="chiffres text-lg font-semibold">{ouvertes.length}</dd>
                  {enRetard.length > 0 && (
                    <dd className="text-[11px] font-medium text-alerte">{enRetard.length} en retard</dd>
                  )}
                </div>
                <div>
                  <dt className="text-[11px] text-efface">Temps</dt>
                  <dd className="chiffres text-lg font-semibold">{formaterDuree(minutesTotal)}</dd>
                  {valorise !== null && (
                    <dd className="chiffres text-[11px] text-attenue">{formaterMontant(valorise)}</dd>
                  )}
                </div>
                <div>
                  <dt className="text-[11px] text-efface">Notes</dt>
                  <dd className="chiffres text-lg font-semibold">{pages.length}</dd>
                </div>
              </dl>
            </section>

            <section className="bloc-app">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-sm">Fiche de l&apos;étude</h2>
                {estProprietaire && manquants > 0 && (
                  <FormulaireEtude etude={etude} libelle={`Compléter (${manquants})`} variante="discret" />
                )}
              </div>
              <dl className="space-y-2.5 text-sm">
                {champsRenseignes.map(([libelle, valeur]) => (
                  <div key={libelle}>
                    <dt className="text-[11px] text-efface">{libelle}</dt>
                    <dd className="break-words">{valeur}</dd>
                  </div>
                ))}
                <ChampFinInclusion date={etude.dateFinInclusion} statut={etude.statut} />
              </dl>
              {champsRenseignes.length === 0 && (
                <p className="text-xs text-attenue">
                  Promoteur, investigateur, identifiants réglementaires : rien n&apos;est encore
                  renseigné.
                </p>
              )}
              {etude.imageCouverture && estProprietaire && (
                <form action={retirerCouverture} className="mt-4 border-t border-ligne pt-3">
                  <input type="hidden" name="id" value={etude.id} />
                  <button
                    type="submit"
                    className="text-xs text-attenue underline-offset-2 hover:text-alerte hover:underline"
                  >
                    Retirer l&apos;image de couverture
                  </button>
                </form>
              )}
            </section>

            <section className="bloc-app">
              <div className="mb-2 flex items-center justify-between">
                <h2 className="text-sm">Dernières notes</h2>
                <Link href={lien("pense-bete")} className="text-[13px] font-medium text-accent-appuye hover:underline">
                  Tout voir
                </Link>
              </div>
              {pages.length === 0 ? (
                <p className="text-xs text-attenue">Aucune note : comptes rendus, contacts, modes opératoires…</p>
              ) : (
                <ul className="space-y-1">
                  {[...pages]
                    .sort((x, y) => y.modifieLe - x.modifieLe)
                    .slice(0, 4)
                    .map((pg) => (
                      <li key={pg.id}>
                        <Link
                          href={`/pages/${pg.id}`}
                          className="-mx-2 flex items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-creux"
                        >
                          <span aria-hidden>{pg.icone}</span>
                          <span className="min-w-0 flex-1 truncate">{pg.titre}</span>
                          <span className="chiffres shrink-0 text-[11px] text-efface">
                            {formaterDate(pg.modifieLe)}
                          </span>
                        </Link>
                      </li>
                    ))}
                </ul>
              )}
            </section>
          </aside>

          <div className="lg:col-span-2">
          {estProprietaire && (
          <section className="border-t border-ligne pt-6">
            <details>
              <summary className="cursor-pointer text-sm text-attenue hover:text-alerte">
                Supprimer cette étude
              </summary>
              <div className="carte mt-3 border-alerte/30 p-4">
                <p className="text-sm">
                  La suppression retire définitivement l&apos;étude, ses{" "}
                  <strong>{pages.length} page(s)</strong>, <strong>{missions.length} mission(s)</strong>,{" "}
                  <strong>{documents.length} fichier(s)</strong>,{" "}
                  <strong>{checklist.length} ligne(s) de checklist</strong>,{" "}
                  <strong>{faq.length} question(s)</strong> et{" "}
                  <strong>{temps.length} saisie(s) de temps</strong>. C&apos;est irréversible.
                </p>
                <form action={supprimerEtude} className="mt-3">
                  <input type="hidden" name="id" value={etude.id} />
                  <button
                    type="submit"
                    className="rounded-lg border border-alerte/40 px-3.5 py-2 text-sm font-medium text-alerte transition hover:bg-alerte/10"
                  >
                    Supprimer définitivement
                  </button>
                </form>
              </div>
            </details>
          </section>
          )}
          </div>
        </div>
      )}

      {/* ------------------------------------------------------- Missions */}
      {section === "missions" && (
        <div className="bloc-app space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="font-titre text-lg font-bold">Missions</h2>
            <div className="flex flex-wrap items-center gap-2">
              <Link
                href={`/missions?vue=archives&etude=${etude.id}`}
                className="text-sm font-medium text-accent transition-opacity hover:opacity-70"
              >
                Archives
              </Link>
              {estProprietaire && (
                <FormulaireTache
                  etudes={toutesEtudes}
                  etudeIdParDefaut={etude.id}
                  libelle="+ Nouvelle mission"
                  variante="discret"
                  membres={membres}
                  comptes={comptes}
                  peutAttribuer
                />
              )}
            </div>
          </div>
          <TableauMissions
            lignes={missions.map((t) => ({
              tache: t,
              assigneNom: t.assigneNom,
              sousTaches: t.sousTaches,
              minutes: t.minutes,
              minutesParEtape: t.minutesParEtape,
              chronoEnCours: t.chronoEnCours,
              chronoSousTacheId: t.chronoSousTacheId,
              etudeProprietaireId: etude.proprietaireId,
              etudesLiees: t.etudesLiees,
            }))}
            etudes={toutesEtudes}
            afficherEtude={false}
            message={
              estProprietaire
                ? "Aucune mission sur cette étude."
                : "Aucune mission ne vous est attribuée sur cette étude."
            }
            membres={membres}
            comptes={comptes}
            utilisateurId={compte?.id}
            pilote={compte?.accesToutesEtudes}
            niveauxPartage={niveaux}
          />
        </div>
      )}

      {/* --------------------------------------------------- Réglementaire */}
      {section === "checklist" && <Checklist etudeId={etude.id} lignes={checklist} />}

      {/* ------------------------------------------------------ Pense-bête */}
      {section === "pense-bete" && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="font-titre text-lg font-bold">Notes</h2>
            <FormulairePenseBete
              categories={[...new Set(pages.map((p) => p.categorie).filter(Boolean))]}
              etudeIdParDefaut={etude.id}
              libelle="Nouvelle note"
              variante="discret"
            />
          </div>
          <ListePenseBete
            pages={pages}
            etudeIdParDefaut={etude.id}
            message="Aucune page. Créez-en une pour un compte rendu, une liste ou ce qu'il ne faut pas oublier."
          />
        </div>
      )}

      {/* ------------------------------------------------------------ FAQ */}
      {section === "faq" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-titre text-lg font-bold">FAQ de l&apos;étude</h2>
            <FormulaireFaq
              etudes={toutesEtudes}
              etudeIdParDefaut={etude.id}
              libelle="+ Nouvelle question"
              variante="discret"
            />
          </div>
          <ListeFaq
            lignes={faq.map((f) => ({ entree: f }))}
            etudes={toutesEtudes}
            afficherPortee={false}
            message="Aucune question propre à cette étude. La FAQ générale reste accessible depuis le menu."
          />
        </div>
      )}

      {/* ----------------------------------------------------------- Temps */}
      {section === "temps" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-titre text-lg font-bold">Temps saisi</h2>
            <Link href={`/temps?etude=${etude.id}`} className="bouton-discret">
              Détail et export
            </Link>
          </div>

          {temps.length === 0 ? (
            <p className="carte p-8 text-center text-sm text-attenue">
              Aucun temps saisi sur cette étude.
            </p>
          ) : (
            <ul className="carte divide-y divide-ligne">
              {temps.slice(0, 20).map(({ entree, tacheTitre, etapeTitre }) => (
                <li key={entree.id} className="flex items-center justify-between gap-3 px-4 py-2.5">
                  <div className="min-w-0">
                    <p className="truncate text-sm">
                      {entree.description ?? etapeTitre ?? tacheTitre ?? "Sans description"}
                    </p>
                    <p className="text-xs text-attenue">
                      {formaterDate(entree.debut)}
                      {etapeTitre ? ` · ${etapeTitre}` : tacheTitre ? ` · ${tacheTitre}` : ""}
                    </p>
                  </div>
                  <span className="chiffres shrink-0 text-sm font-medium">
                    {formaterDuree(dureeMinutes(entree))}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
