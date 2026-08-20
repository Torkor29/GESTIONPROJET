import { EntetePage, EtatVide } from "@/components/ui";
import { detailCrf, listerCrf } from "@/lib/clinique";

export const dynamic = "force-dynamic";

export default async function PageCrf() {
  const formulaires = await listerCrf();
  const details = await Promise.all(formulaires.map((f) => detailCrf(f.formulaire.id)));

  return (
    <div className="space-y-5">
      <EntetePage
        titre="CRF / eCRF"
        description="Formulaires, sections, variables, types et contraintes. Structure de l'étude — pas un EDC promoteur."
      />
      {formulaires.length === 0 ? (
        <EtatVide
          titre="Aucun formulaire CRF n'est encore défini."
          texte="Définissez les formulaires de l'étude (signes vitaux, inclusion, etc.) pour rattacher les queries aux variables."
        />
      ) : (
        <div className="space-y-4">
          {details.map((d) =>
            d ? (
              <article key={d.formulaire.id} className="carte p-5">
                <p className="text-xs text-efface">{d.etude.code}</p>
                <h2 className="font-titre text-lg font-bold">
                  {d.formulaire.code} — {d.formulaire.nom}
                </h2>
                {d.formulaire.description && (
                  <p className="mt-1 text-sm text-attenue">{d.formulaire.description}</p>
                )}
                <ul className="mt-3 space-y-3">
                  {d.sections.map((s) => (
                    <li key={s.id}>
                      <p className="text-sm font-semibold">{s.nom}</p>
                      <ul className="mt-1 text-sm text-attenue">
                        {d.variables
                          .filter((v) => v.sectionId === s.id)
                          .map((v) => (
                            <li key={v.id}>
                              <span className="font-mono text-xs">{v.code}</span> · {v.nom} · {v.type}
                              {v.obligatoire ? " · obligatoire" : ""}
                              {v.min != null ? ` · min ${v.min}` : ""}
                              {v.max != null ? ` · max ${v.max}` : ""}
                            </li>
                          ))}
                      </ul>
                    </li>
                  ))}
                </ul>
              </article>
            ) : null,
          )}
        </div>
      )}
    </div>
  );
}
