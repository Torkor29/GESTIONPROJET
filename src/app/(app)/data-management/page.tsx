import Link from "next/link";
import { EntetePage, EtatVide, Kpi } from "@/components/ui";
import { kpisGlobaux, listerDmp, listerQueries, listerRevues } from "@/lib/clinique";
import { queryOuverte } from "@/lib/queries-workflow";

export const dynamic = "force-dynamic";

export default async function PageDataManagement() {
  const [kpis, queries, revues, dmp] = await Promise.all([
    kpisGlobaux(),
    listerQueries(),
    listerRevues(),
    listerDmp(),
  ]);
  const ouvertes = queries.filter((q) => queryOuverte(q.query.statut));
  const aFaire = revues.filter((r) => r.revue.statut === "a_faire");

  return (
    <div className="space-y-6">
      <EntetePage
        titre="Data Management"
        description="Ce qui demande votre attention : queries, données manquantes, revue et DMP."
      />
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Kpi libelle="Queries ouvertes" valeur={ouvertes.length} alerte={ouvertes.length > 0} href="/data-management/queries" />
        <Kpi libelle="Revues à faire" valeur={aFaire.length} href="/data-management/review" />
        <Kpi libelle="DMP" valeur={dmp.length} href="/data-management" />
        <Kpi libelle="Sujets" valeur={kpis.nSujets} href="/sujets" />
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <section className="carte p-5">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-titre font-bold">Queries ouvertes</h2>
            <Link href="/data-management/queries" className="text-sm text-accent">
              Toutes
            </Link>
          </div>
          {ouvertes.length === 0 ? (
            <p className="text-sm text-attenue">Aucune query ouverte.</p>
          ) : (
            <ul className="space-y-2 text-sm">
              {ouvertes.slice(0, 6).map((q) => (
                <li key={q.query.id}>
                  <Link href={`/data-management/queries/${q.query.id}`} className="hover:text-accent">
                    {q.query.code} — {q.query.description}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
        <section className="carte p-5">
          <h2 className="mb-3 font-titre font-bold">Plans de data management</h2>
          {dmp.length === 0 ? (
            <EtatVide
              titre="Aucun DMP saisi"
              texte="Enregistrez la version, la date et le responsable du Data Management Plan."
            />
          ) : (
            <ul className="space-y-2 text-sm">
              {dmp.map((d) => (
                <li key={d.plan.id}>
                  {d.etudeCode} · v{d.plan.version} · {d.plan.statut}
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
