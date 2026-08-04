import Link from "next/link";
import { notFound } from "next/navigation";
import { creerPage } from "@/actions/pages";
import { supprimerEtude } from "@/actions/etudes";
import { demarrerChrono } from "@/actions/temps";
import { EtiquetteStatutEtude } from "@/components/etiquettes";
import FormulaireEtude from "@/components/formulaire-etude";
import FormulaireTache from "@/components/formulaire-tache";
import ListeTaches from "@/components/liste-taches";
import { formaterDate, formaterDuree, formaterMontant, heuresDecimales } from "@/lib/format";
import {
  dureeMinutes,
  entreesTemps,
  etudeParId,
  listerEtudes,
  pagesDEtude,
  tachesDEtude,
} from "@/lib/requetes";

export const dynamic = "force-dynamic";

export default async function PageEtude({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const etudeId = Number(id);
  const etude = await etudeParId(etudeId);
  if (!etude) notFound();

  const [pages, taches, temps, toutesEtudes] = await Promise.all([
    pagesDEtude(etudeId),
    tachesDEtude(etudeId),
    entreesTemps({ etudeId }),
    listerEtudes({ avecArchivees: true }),
  ]);

  const minutesTotal = temps.reduce((t, l) => t + dureeMinutes(l.entree), 0);
  const valorise = etude.tarifHoraire ? heuresDecimales(minutesTotal) * etude.tarifHoraire : null;
  const ouvertes = taches.filter((t) => t.statut !== "terminee");
  const terminees = taches.filter((t) => t.statut === "terminee");

  return (
    <div className="space-y-8">
      <header>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="flex items-center gap-2.5">
              <span
                aria-hidden
                className="h-3.5 w-3.5 shrink-0 rounded-full"
                style={{ backgroundColor: etude.couleur }}
              />
              <h1 className="text-2xl font-semibold">{etude.nom}</h1>
              <EtiquetteStatutEtude statut={etude.statut} />
            </div>
            {etude.client && <p className="mt-1 text-sm text-muted">{etude.client}</p>}
            {etude.description && <p className="mt-2 max-w-2xl text-sm">{etude.description}</p>}
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

        <dl className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="carte p-3">
            <dt className="text-xs uppercase tracking-wide text-muted">Temps total</dt>
            <dd className="chiffres mt-1 text-lg font-semibold">{formaterDuree(minutesTotal)}</dd>
          </div>
          <div className="carte p-3">
            <dt className="text-xs uppercase tracking-wide text-muted">Valorisé</dt>
            <dd className="chiffres mt-1 text-lg font-semibold">
              {valorise !== null ? formaterMontant(valorise) : "—"}
            </dd>
          </div>
          <div className="carte p-3">
            <dt className="text-xs uppercase tracking-wide text-muted">Tâches ouvertes</dt>
            <dd className="chiffres mt-1 text-lg font-semibold">{ouvertes.length}</dd>
          </div>
          <div className="carte p-3">
            <dt className="text-xs uppercase tracking-wide text-muted">Pages</dt>
            <dd className="chiffres mt-1 text-lg font-semibold">{pages.length}</dd>
          </div>
        </dl>
      </header>

      <section>
        <div className="mb-3 flex items-center justify-between gap-3">
          <h2 className="font-semibold">Pages</h2>
          <form action={creerPage}>
            <input type="hidden" name="etudeId" value={etude.id} />
            <button type="submit" className="bouton-discret">
              + Nouvelle page
            </button>
          </form>
        </div>

        {pages.length === 0 ? (
          <p className="carte p-8 text-center text-sm text-muted">
            Aucune page. Créez-en une pour rédiger vos notes, comptes rendus ou méthodes.
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
                  <p className="mt-0.5 text-xs text-muted">
                    modifiée le {formaterDate(p.modifieLe)}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      <section>
        <div className="mb-3 flex items-center justify-between gap-3">
          <h2 className="font-semibold">Tâches</h2>
          <FormulaireTache
            etudes={toutesEtudes}
            etudeIdParDefaut={etude.id}
            libelle="+ Nouvelle tâche"
            variante="discret"
          />
        </div>

        <ListeTaches
          lignes={ouvertes.map((t) => ({ tache: t }))}
          etudes={toutesEtudes}
          afficherEtude={false}
          message="Aucune tâche en cours sur cette étude."
        />

        {terminees.length > 0 && (
          <details className="mt-3">
            <summary className="cursor-pointer text-sm text-muted hover:text-ink">
              {terminees.length} tâche{terminees.length > 1 ? "s" : ""} terminée
              {terminees.length > 1 ? "s" : ""}
            </summary>
            <div className="mt-3">
              <ListeTaches
                lignes={terminees.map((t) => ({ tache: t }))}
                etudes={toutesEtudes}
                afficherEtude={false}
              />
            </div>
          </details>
        )}
      </section>

      <section>
        <div className="mb-3 flex items-center justify-between gap-3">
          <h2 className="font-semibold">Temps récent</h2>
          <Link
            href={`/temps?etude=${etude.id}`}
            className="text-sm text-accent hover:underline"
          >
            Tout voir et exporter
          </Link>
        </div>

        {temps.length === 0 ? (
          <p className="carte p-8 text-center text-sm text-muted">
            Aucun temps saisi sur cette étude.
          </p>
        ) : (
          <ul className="carte divide-y divide-line">
            {temps.slice(0, 8).map(({ entree, tacheTitre }) => (
              <li key={entree.id} className="flex items-center justify-between gap-3 px-4 py-2.5">
                <div className="min-w-0">
                  <p className="truncate text-sm">
                    {tacheTitre ?? entree.description ?? "Sans description"}
                  </p>
                  <p className="text-xs text-muted">{formaterDate(entree.debut)}</p>
                </div>
                <span className="chiffres shrink-0 text-sm font-medium">
                  {formaterDuree(dureeMinutes(entree))}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="border-t border-line pt-6">
        <details>
          <summary className="cursor-pointer text-sm text-muted hover:text-red-500">
            Supprimer cette étude
          </summary>
          <div className="carte mt-3 border-red-500/30 p-4">
            <p className="text-sm">
              La suppression retire définitivement l&apos;étude, ses{" "}
              <strong>{pages.length} page(s)</strong>, ses{" "}
              <strong>{taches.length} tâche(s)</strong> et ses{" "}
              <strong>{temps.length} saisie(s) de temps</strong>. C&apos;est irréversible.
            </p>
            <form action={supprimerEtude} className="mt-3">
              <input type="hidden" name="id" value={etude.id} />
              <button
                type="submit"
                className="rounded-lg border border-red-500/40 px-3.5 py-2 text-sm font-medium text-red-500 transition hover:bg-red-500/10"
              >
                Supprimer définitivement
              </button>
            </form>
          </div>
        </details>
      </section>
    </div>
  );
}
