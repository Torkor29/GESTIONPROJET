import { demarrerChrono, supprimerTemps } from "@/actions/temps";
import FormulaireTemps from "@/components/formulaire-temps";
import MenuExport from "@/components/menu-export";
import { PastilleEtude } from "@/components/etiquettes";
import {
  formaterDate,
  formaterDuree,
  formaterHeure,
  formaterMontant,
  heuresDecimales,
} from "@/lib/format";
import { CHOIX_PERIODE, resoudrePeriode } from "@/lib/periode";
import { dureeMinutes, entreesTemps, listerEtudes, totauxParEtude } from "@/lib/requetes";

export const dynamic = "force-dynamic";

export default async function PageTemps({
  searchParams,
}: {
  searchParams: Promise<{ periode?: string; du?: string; au?: string; etude?: string }>;
}) {
  const params = await searchParams;
  const periode = resoudrePeriode(params);
  const etudeId = params.etude ? Number(params.etude) : null;

  const filtres = { du: periode.du, au: periode.au, etudeId };

  const [lignes, etudes, totaux] = await Promise.all([
    entreesTemps(filtres),
    listerEtudes({ avecArchivees: true }),
    totauxParEtude(filtres),
  ]);

  const minutesTotal = totaux.reduce((t, r) => t + r.minutes, 0);
  const montantTotal = totaux.reduce(
    (t, r) => t + (r.tarif ? heuresDecimales(r.minutes) * r.tarif : 0),
    0,
  );

  // Les paramètres du filtre sont repassés tels quels à l'export : le fichier
  // Excel contient exactement ce qui est affiché.
  const parametresExport = new URLSearchParams();
  if (params.periode) parametresExport.set("periode", params.periode);
  if (params.du) parametresExport.set("du", params.du);
  if (params.au) parametresExport.set("au", params.au);
  if (params.etude) parametresExport.set("etude", params.etude);

  // Regroupement par jour pour l'affichage.
  const parJour = new Map<number, typeof lignes>();
  for (const l of lignes) {
    const jour = new Date(l.entree.debut * 1000);
    jour.setHours(0, 0, 0, 0);
    const cle = Math.floor(jour.getTime() / 1000);
    parJour.set(cle, [...(parJour.get(cle) ?? []), l]);
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-titre text-3xl font-bold">Temps</h1>
        <div className="flex flex-wrap gap-2">
          <MenuExport
            base="/api/export"
            parametres={Object.fromEntries(parametresExport.entries())}
          />
          <FormulaireTemps etudes={etudes} libelle="Ajouter du temps" />
        </div>
      </header>

      <section className="carte p-4">
        <h2 className="mb-3 text-sm font-medium">Démarrer un chronomètre</h2>
        <form action={demarrerChrono} className="flex flex-wrap items-end gap-3">
          <div className="min-w-48 flex-1">
            <label htmlFor="chrono-etude" className="mb-1.5 block text-xs text-attenue">
              Étude
            </label>
            <select id="chrono-etude" name="etudeId" className="champ" defaultValue={etudeId ?? ""}>
              <option value="">Sans étude</option>
              {etudes.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.nom}
                </option>
              ))}
            </select>
          </div>
          <div className="min-w-48 flex-[2]">
            <label htmlFor="chrono-description" className="mb-1.5 block text-xs text-attenue">
              Sur quoi travaillez-vous ?
            </label>
            <input
              id="chrono-description"
              name="description"
              placeholder="Facultatif"
              className="champ"
            />
          </div>
          <button type="submit" className="bouton">
            Démarrer
          </button>
        </form>
      </section>

      <form method="get" className="sans-impression carte flex flex-wrap items-end gap-3 p-4">
        <div>
          <label htmlFor="periode" className="mb-1.5 block text-xs text-attenue">
            Période
          </label>
          <select id="periode" name="periode" defaultValue={periode.cle} className="champ">
            {CHOIX_PERIODE.map((p) => (
              <option key={p.cle} value={p.cle}>
                {p.libelle}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="du" className="mb-1.5 block text-xs text-attenue">
            Du
          </label>
          <input id="du" name="du" type="date" defaultValue={params.du ?? ""} className="champ" />
        </div>

        <div>
          <label htmlFor="au" className="mb-1.5 block text-xs text-attenue">
            Au
          </label>
          <input id="au" name="au" type="date" defaultValue={params.au ?? ""} className="champ" />
        </div>

        <div className="min-w-48">
          <label htmlFor="etude" className="mb-1.5 block text-xs text-attenue">
            Étude
          </label>
          <select id="etude" name="etude" defaultValue={params.etude ?? ""} className="champ">
            <option value="">Toutes</option>
            {etudes.map((e) => (
              <option key={e.id} value={e.id}>
                {e.nom}
              </option>
            ))}
          </select>
        </div>

        <button type="submit" className="bouton-discret">
          Filtrer
        </button>
      </form>

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="carte p-4">
          <p className="text-xs uppercase tracking-wide text-attenue">Total</p>
          <p className="chiffres mt-1 text-2xl font-semibold">{formaterDuree(minutesTotal)}</p>
          <p className="chiffres mt-0.5 text-xs text-attenue">
            {heuresDecimales(minutesTotal).toLocaleString("fr-FR")} h décimales
          </p>
        </div>
        <div className="carte p-4">
          <p className="text-xs uppercase tracking-wide text-attenue">Valorisé</p>
          <p className="chiffres mt-1 text-2xl font-semibold">
            {montantTotal > 0 ? formaterMontant(montantTotal) : "—"}
          </p>
          <p className="mt-0.5 text-xs text-attenue">selon les tarifs horaires</p>
        </div>
        <div className="carte p-4">
          <p className="text-xs uppercase tracking-wide text-attenue">Saisies</p>
          <p className="chiffres mt-1 text-2xl font-semibold">{lignes.length}</p>
          <p className="mt-0.5 text-xs text-attenue">{periode.libelle.toLowerCase()}</p>
        </div>
      </div>

      {totaux.length > 1 && (
        <section className="carte p-4">
          <h2 className="mb-3 text-sm font-medium">Répartition par étude</h2>
          <ul className="space-y-2">
            {totaux.map((r) => (
              <li key={r.etudeId} className="flex items-center justify-between gap-3">
                <PastilleEtude couleur={r.couleur} nom={r.nom} />
                <span className="chiffres shrink-0 text-sm">
                  {formaterDuree(r.minutes)}
                  <span className="ml-2 text-attenue">
                    {Math.round((r.minutes / Math.max(1, minutesTotal)) * 100)} %
                  </span>
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {lignes.length === 0 ? (
        <p className="carte p-10 text-center text-sm text-attenue">
          Aucune saisie sur cette période.
        </p>
      ) : (
        <div className="space-y-5">
          {[...parJour.entries()]
            .sort((a, b) => b[0] - a[0])
            .map(([jour, entrees]) => {
              const minutesJour = entrees.reduce((t, l) => t + dureeMinutes(l.entree), 0);
              return (
                <section key={jour}>
                  <div className="mb-2 flex items-baseline justify-between gap-3 px-1">
                    <h2 className="text-sm font-medium">{formaterDate(jour)}</h2>
                    <span className="chiffres text-sm text-attenue">
                      {formaterDuree(minutesJour)}
                    </span>
                  </div>

                  <ul className="carte divide-y divide-ligne">
                    {entrees.map(({ entree, etudeNom, etudeCouleur, tacheTitre, etapeTitre }) => (
                      <li
                        key={entree.id}
                        className="group flex items-center gap-3 px-4 py-2.5"
                      >
                        <span
                          aria-hidden
                          className="h-2.5 w-2.5 shrink-0 rounded-full"
                          style={{ backgroundColor: etudeCouleur ?? "#a8a29e" }}
                        />

                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm">
                            {entree.description ?? etapeTitre ?? tacheTitre ?? "Sans description"}
                          </p>
                          <p className="truncate text-xs text-attenue">
                            {etudeNom ?? "Sans étude"}
                            {tacheTitre && (entree.description || etapeTitre) ? ` · ${tacheTitre}` : ""}
                            {etapeTitre && entree.description && entree.description !== etapeTitre
                              ? ` · ${etapeTitre}`
                              : ""}
                          </p>
                        </div>

                        <span className="chiffres hidden shrink-0 text-xs text-attenue sm:block">
                          {formaterHeure(entree.debut)} – {formaterHeure(entree.fin)}
                        </span>

                        <span className="chiffres w-20 shrink-0 text-right text-sm font-medium">
                          {formaterDuree(dureeMinutes(entree))}
                        </span>

                        <div className="flex shrink-0 items-center gap-0.5 opacity-0 transition focus-within:opacity-100 group-hover:opacity-100">
                          <FormulaireTemps
                            entree={entree}
                            etudes={etudes}
                            libelle="✎"
                            variante="icone"
                          />
                          <form action={supprimerTemps}>
                            <input type="hidden" name="id" value={entree.id} />
                            <button
                              type="submit"
                              title="Supprimer la saisie"
                              aria-label="Supprimer la saisie"
                              className="rounded-lg px-2 py-1 text-sm text-attenue transition hover:bg-creux hover:text-alerte"
                            >
                              ✕
                            </button>
                          </form>
                        </div>
                      </li>
                    ))}
                  </ul>
                </section>
              );
            })}
        </div>
      )}
    </div>
  );
}
