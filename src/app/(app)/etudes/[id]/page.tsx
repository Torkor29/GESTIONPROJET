import Link from "next/link";
import { notFound } from "next/navigation";
import { creerPage } from "@/actions/pages";
import { retirerCouverture, supprimerEtude } from "@/actions/etudes";
import { demarrerChrono } from "@/actions/temps";
import Checklist from "@/components/checklist";
import { EtiquetteStatutEtude } from "@/components/etiquettes";
import FormulaireDocument from "@/components/formulaire-document";
import FormulaireEtude from "@/components/formulaire-etude";
import FormulaireFaq from "@/components/formulaire-faq";
import FormulaireTache from "@/components/formulaire-tache";
import ListeDocuments from "@/components/liste-documents";
import ListeFaq from "@/components/liste-faq";
import TableauMissions from "@/components/tableau-missions";
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
  pagesDEtude,
  progression,
  tachesDEtude,
} from "@/lib/requetes";

export const dynamic = "force-dynamic";

const SECTIONS = [
  { cle: "apercu", libelle: "Aperçu" },
  { cle: "missions", libelle: "Missions" },
  { cle: "checklist", libelle: "Réglementaire" },
  { cle: "documents", libelle: "Documents" },
  { cle: "pages", libelle: "Pages" },
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
  const { section = "apercu" } = await searchParams;
  const etudeId = Number(id);

  const etude = await etudeParId(etudeId);
  if (!etude) notFound();

  const [pages, missions, temps, documents, checklist, faq, toutesEtudes] = await Promise.all([
    pagesDEtude(etudeId),
    tachesDEtude(etudeId),
    entreesTemps({ etudeId }),
    documentsDEtude(etudeId),
    checklistDEtude(etudeId),
    faqDEtude(etudeId),
    listerEtudes({ avecArchivees: true }),
  ]);

  const maintenant = Math.floor(Date.now() / 1000);
  const minutesTotal = temps.reduce((t, l) => t + dureeMinutes(l.entree), 0);
  const valorise = etude.tarifHoraire ? heuresDecimales(minutesTotal) * etude.tarifHoraire : null;
  const ouvertes = missions.filter((t) => t.statut !== "terminee");
  const enRetard = ouvertes.filter((t) => t.echeance && t.echeance < maintenant);
  const prog = progression(checklist);

  const reglements = lireReglementations(etude.reglementations)
    .map((c) => referentiel(c))
    .filter((r) => r !== undefined);

  const lien = (cle: string) => `/etudes/${etudeId}?section=${cle}`;
  const compteurs: Record<string, number> = {
    missions: ouvertes.length,
    checklist: prog.total - prog.faits,
    documents: documents.length,
    pages: pages.length,
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

        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2.5">
              <span
                aria-hidden
                className="h-3.5 w-3.5 shrink-0 rounded-full"
                style={{ backgroundColor: etude.couleur }}
              />
              {etude.code && (
                <span className="text-sm font-semibold tracking-wide text-attenue">
                  {etude.code}
                </span>
              )}
              <h1 className="font-titre text-3xl font-bold">{etude.nom}</h1>
              <EtiquetteStatutEtude statut={etude.statut} />
            </div>

            {etude.description && <p className="mt-2 max-w-2xl text-sm">{etude.description}</p>}

            <div className="mt-2 flex flex-wrap gap-1.5">
              {reglements.map((r) => (
                <span key={r.cle} className="etiquette bg-accent/10 text-accent">
                  {r.nom.split("—")[0].trim()}
                </span>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <form action={demarrerChrono}>
              <input type="hidden" name="etudeId" value={etude.id} />
              <button type="submit" className="bouton">
                ⏱ Démarrer
              </button>
            </form>
            <FormulaireEtude etude={etude} libelle="Modifier" variante="discret" />
          </div>
        </div>
      </header>

      {/* ------------------------------------------------------- Sections */}
      <nav className="flex flex-wrap gap-1.5 border-b border-ligne pb-2">
        {SECTIONS.map((s) => (
          <Link
            key={s.cle}
            href={lien(s.cle)}
            aria-current={section === s.cle ? "page" : undefined}
            className={`rounded-lg px-3 py-1.5 text-sm transition
                        ${
                          section === s.cle
                            ? "bg-accent/10 font-medium text-accent"
                            : "text-attenue hover:bg-creux hover:text-encre"
                        }`}
          >
            {s.libelle}
            {compteurs[s.cle] > 0 && (
              <span className="chiffres ml-1.5 text-xs opacity-70">{compteurs[s.cle]}</span>
            )}
          </Link>
        ))}
      </nav>

      {/* --------------------------------------------------------- Aperçu */}
      {section === "apercu" && (
        <div className="space-y-6">
          <dl className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <div className="carte p-3">
              <dt className="text-xs uppercase tracking-wide text-attenue">Conformité</dt>
              <dd className="chiffres mt-1 text-lg font-semibold">
                {prog.total > 0 ? `${prog.pourcentage} %` : "—"}
              </dd>
              {prog.total > 0 && (
                <dd className="mt-1 h-1.5 overflow-hidden rounded-full bg-creux">
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${prog.pourcentage}%`, backgroundColor: etude.couleur }}
                  />
                </dd>
              )}
            </div>
            <div className="carte p-3">
              <dt className="text-xs uppercase tracking-wide text-attenue">Missions ouvertes</dt>
              <dd className="chiffres mt-1 text-lg font-semibold">
                {ouvertes.length}
                {enRetard.length > 0 && (
                  <span className="ml-2 text-sm font-medium text-alerte">
                    {enRetard.length} en retard
                  </span>
                )}
              </dd>
            </div>
            <div className="carte p-3">
              <dt className="text-xs uppercase tracking-wide text-attenue">Temps total</dt>
              <dd className="chiffres mt-1 text-lg font-semibold">{formaterDuree(minutesTotal)}</dd>
              {valorise !== null && (
                <dd className="chiffres mt-0.5 text-xs text-attenue">{formaterMontant(valorise)}</dd>
              )}
            </div>
            <div className="carte p-3">
              <dt className="text-xs uppercase tracking-wide text-attenue">Documents</dt>
              <dd className="chiffres mt-1 text-lg font-semibold">{documents.length}</dd>
            </div>
          </dl>

          <section className="carte p-5">
            <h2 className="mb-3 font-semibold">Identification</h2>
            <dl className="grid gap-x-6 gap-y-3 text-sm sm:grid-cols-2">
              {[
                ["Promoteur", etude.promoteur],
                ["Investigateur coordonnateur", etude.investigateur],
                ["ID-RCB", etude.idRcb],
                ["N° CTIS / EudraCT / NCT", etude.numeroCtis],
                ["Référence CPP", etude.numeroCpp],
                ["Partenaire ou financeur", etude.client],
                ["Date de début", etude.dateDebut ? formaterDate(etude.dateDebut) : null],
                ["Date de fin prévue", etude.dateFin ? formaterDate(etude.dateFin) : null],
              ].map(([libelle, valeur]) => (
                <div key={libelle as string}>
                  <dt className="text-xs uppercase tracking-wide text-attenue">{libelle}</dt>
                  <dd className={valeur ? "mt-0.5" : "mt-0.5 text-attenue"}>{valeur || "—"}</dd>
                </div>
              ))}
            </dl>

            {etude.imageCouverture && (
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

          {enRetard.length > 0 && (
            <section>
              <h2 className="mb-2 font-semibold text-alerte">Missions en retard</h2>
              <TableauMissions
                lignes={enRetard.map((t) => ({ tache: t }))}
                etudes={toutesEtudes}
                afficherEtude={false}
              />
            </section>
          )}

          <section className="border-t border-ligne pt-6">
            <details>
              <summary className="cursor-pointer text-sm text-attenue hover:text-alerte">
                Supprimer cette étude
              </summary>
              <div className="carte mt-3 border-alerte/30 p-4">
                <p className="text-sm">
                  La suppression retire définitivement l&apos;étude, ses{" "}
                  <strong>{pages.length} page(s)</strong>, <strong>{missions.length} mission(s)</strong>,{" "}
                  <strong>{documents.length} document(s)</strong>,{" "}
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
        </div>
      )}

      {/* ------------------------------------------------------- Missions */}
      {section === "missions" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-titre text-lg font-bold">Missions</h2>
            <FormulaireTache
              etudes={toutesEtudes}
              etudeIdParDefaut={etude.id}
              libelle="+ Nouvelle mission"
              variante="discret"
            />
          </div>
          <TableauMissions
            lignes={missions.map((t) => ({ tache: t }))}
            etudes={toutesEtudes}
            afficherEtude={false}
            message="Aucune mission sur cette étude."
          />
        </div>
      )}

      {/* --------------------------------------------------- Réglementaire */}
      {section === "checklist" && <Checklist etudeId={etude.id} lignes={checklist} />}

      {/* ------------------------------------------------------ Documents */}
      {section === "documents" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-titre text-lg font-bold">Documents</h2>
            <FormulaireDocument
              etudes={toutesEtudes}
              etudeIdParDefaut={etude.id}
              libelle="+ Ajouter un document"
              variante="discret"
            />
          </div>
          <ListeDocuments
            lignes={documents.map((d) => ({ document: d }))}
            etudes={toutesEtudes}
            afficherEtude={false}
            message="Aucun document déposé pour cette étude."
          />
        </div>
      )}

      {/* ---------------------------------------------------------- Pages */}
      {section === "pages" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-titre text-lg font-bold">Pages</h2>
            <form action={creerPage}>
              <input type="hidden" name="etudeId" value={etude.id} />
              <button type="submit" className="bouton-discret">
                + Nouvelle page
              </button>
            </form>
          </div>

          {pages.length === 0 ? (
            <p className="carte p-8 text-center text-sm text-attenue">
              Aucune page. Créez-en une pour vos comptes rendus de visite, vos notes de réunion ou
              vos modes opératoires.
            </p>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {pages.map((p) => (
                <Link
                  key={p.id}
                  href={`/pages/${p.id}`}
                  className="carte flex items-start gap-3 p-4 transition hover:border-accent/50"
                >
                  <span aria-hidden className="text-xl leading-none">
                    {p.icone}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate font-medium">{p.titre}</p>
                    <p className="mt-0.5 text-xs text-attenue">
                      modifiée le {formaterDate(p.modifieLe)}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}
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
              {temps.slice(0, 20).map(({ entree, tacheTitre }) => (
                <li key={entree.id} className="flex items-center justify-between gap-3 px-4 py-2.5">
                  <div className="min-w-0">
                    <p className="truncate text-sm">
                      {entree.description ?? tacheTitre ?? "Sans description"}
                    </p>
                    <p className="text-xs text-attenue">{formaterDate(entree.debut)}</p>
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
