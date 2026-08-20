import Link from "next/link";

export function EtatVide({
  titre,
  texte,
  action,
  etapes,
}: {
  titre: string;
  texte: string;
  action?: { href?: string; onClickLabel?: string; libelle: string };
  etapes?: string[];
}) {
  return (
    <div className="carte px-6 py-10 text-center sm:px-10">
      <p className="font-titre text-lg font-bold">{titre}</p>
      <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-attenue">{texte}</p>
      {etapes && etapes.length > 0 && (
        <ol className="mx-auto mt-6 max-w-sm space-y-2 text-left text-sm">
          {etapes.map((e, i) => (
            <li key={e} className="flex gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent-voile text-xs font-bold text-accent-appuye">
                {i + 1}
              </span>
              <span className="pt-0.5">{e}</span>
            </li>
          ))}
        </ol>
      )}
      {action?.href && (
        <div className="mt-6">
          <Link href={action.href} className="bouton">
            {action.libelle}
          </Link>
        </div>
      )}
    </div>
  );
}

export function EntetePage({
  surtitre,
  titre,
  description,
  actions,
}: {
  surtitre?: string;
  titre: string;
  description?: string;
  actions?: React.ReactNode;
}) {
  return (
    <header className="flex flex-wrap items-start justify-between gap-3">
      <div className="min-w-0">
        {surtitre && <p className="sur-titre">{surtitre}</p>}
        <h1 className="mt-1 font-titre text-3xl font-bold">{titre}</h1>
        {description && <p className="mt-1 max-w-2xl text-sm text-attenue">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </header>
  );
}

export function Badge({
  children,
  tone = "neutre",
}: {
  children: React.ReactNode;
  tone?: "neutre" | "ok" | "warn" | "alert" | "info";
}) {
  const cls = {
    neutre: "bg-creux text-attenue",
    ok: "bg-reussite-voile text-reussite",
    warn: "bg-attention-voile text-attention",
    alert: "bg-alerte-voile text-alerte",
    info: "bg-info-voile text-info",
  }[tone];
  return <span className={`etiquette ${cls}`}>{children}</span>;
}

export function Kpi({
  libelle,
  valeur,
  detail,
  alerte,
  href,
}: {
  libelle: string;
  valeur: string | number;
  detail?: string;
  alerte?: boolean;
  href?: string;
}) {
  const inner = (
    <>
      <p className="sur-titre">{libelle}</p>
      <p className={`chiffres mt-2 font-titre text-3xl font-bold ${alerte ? "text-alerte" : ""}`}>
        {valeur}
      </p>
      {detail && <p className="mt-0.5 text-xs text-attenue">{detail}</p>}
    </>
  );
  if (href) {
    return (
      <Link href={href} className="carte-active p-4">
        {inner}
      </Link>
    );
  }
  return <div className="carte p-4">{inner}</div>;
}

export function Tableau({
  colonnes,
  children,
}: {
  colonnes: string[];
  children: React.ReactNode;
}) {
  return (
    <div className="carte overflow-x-auto">
      <table className="tableau-pro">
        <thead>
          <tr>
            {colonnes.map((c) => (
              <th key={c}>{c}</th>
            ))}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}
