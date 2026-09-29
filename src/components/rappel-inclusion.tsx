import Link from "next/link";
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

  return (
    <section className="bloc-app anime-bloc">
      <div className="mb-3 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <h2 className="font-titre text-xl font-bold">Fin d&apos;inclusion</h2>
        <p className="text-xs text-attenue">moins de 5 mois · jaune &lt; 4 · rouge &lt; 3</p>
      </div>
      <ul className="flex flex-wrap gap-1.5">
        {lignes.map((l) => (
          <li key={l.id}>
            <Link
              href={`/etudes/${l.id}`}
              title={l.nom}
              className={`${STYLES[l.niveau]} inline-flex items-baseline gap-2 px-2.5 py-1 text-sm no-underline`}
            >
              <span className="font-bold tracking-tight">{l.code || l.nom}</span>
              <span className="chiffres text-sm">{l.delai}</span>
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
