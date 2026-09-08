import Link from "next/link";
import { EtiquetteStatutEtude } from "@/components/etiquettes";
import { formaterDate } from "@/lib/format";
import { libelleDelaiInclusion, niveauFinInclusion, type LigneInclusion } from "@/lib/inclusion";

const STYLES: Record<LigneInclusion["niveau"], string> = {
  rouge: "rappel-inclusion rappel-inclusion-rouge",
  jaune: "rappel-inclusion rappel-inclusion-jaune",
  ok: "rappel-inclusion",
  absent: "rappel-inclusion rappel-inclusion-absent",
};

export default function RappelInclusion({ lignes }: { lignes: LigneInclusion[] }) {
  if (lignes.length === 0) return null;

  const urgentes = lignes.filter((l) => l.niveau === "rouge" || l.niveau === "jaune").length;

  return (
    <section className="bloc-app anime-bloc">
      <div className="mb-1 flex flex-wrap items-end justify-between gap-3">
        <h2 className="font-titre text-xl font-bold">Fin d&apos;inclusion</h2>
        {urgentes > 0 && (
          <p className="text-sm text-attenue">
            {urgentes} délai{urgentes > 1 ? "s" : ""} sous 4 mois
          </p>
        )}
      </div>
      <p className="mb-4 max-w-2xl text-sm text-attenue">
        Pour les études encore ouvertes. Moins de 4 mois avant la date prévue : jaune. Moins de
        3 mois, ou déjà dépassée : rouge — une MS est souvent à prévoir.
      </p>
      <ul className="space-y-2">
        {lignes.map((l) => (
          <li key={l.id}>
            <Link href={`/etudes/${l.id}`} className={`${STYLES[l.niveau]} block p-4 no-underline`}>
              <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                <span className="flex min-w-0 items-center gap-2">
                  {l.code && (
                    <span className="text-xs font-bold tracking-tight text-attenue">{l.code}</span>
                  )}
                  <span className="truncate font-titre text-sm font-bold">{l.nom}</span>
                </span>
                <EtiquetteStatutEtude statut={l.statut} />
              </div>
              <p className="mt-1 text-sm">{l.delai}</p>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

const CLASSES_DATE: Record<LigneInclusion["niveau"], string> = {
  rouge: "mt-0.5 rounded-md bg-corail/50 px-2 py-0.5",
  jaune: "mt-0.5 rounded-md bg-or/80 px-2 py-0.5",
  ok: "mt-0.5",
  absent: "mt-0.5 text-attenue",
};

/** Date de fin d'inclusion, colorée comme sur le tableau de bord. */
export function ChampFinInclusion({
  date,
  statut,
}: {
  date: number | null;
  statut: string;
}) {
  const pertinent = statut === "active" || statut === "en_pause";
  const niveau = pertinent ? niveauFinInclusion(date) : date ? "ok" : "absent";
  const texte =
    date == null ? "—" : pertinent ? libelleDelaiInclusion(date) : formaterDate(date);

  return (
    <div className="sm:col-span-2">
      <dt className="text-xs uppercase tracking-wide text-attenue">
        Date de fin d&apos;inclusion prévue
      </dt>
      <dd className={CLASSES_DATE[niveau]}>{texte}</dd>
    </div>
  );
}
