import { EntetePage, EtatVide, Tableau } from "@/components/ui";
import { listerEi } from "@/lib/clinique";
import { TYPES_EI } from "@/lib/constantes";
import { formaterDate } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function PageSafety() {
  const lignes = await listerEi();
  return (
    <div className="space-y-5">
      <EntetePage
        titre="Safety / vigilance"
        description="Suivi de projet des événements. Ce module n'est pas une base de pharmacovigilance : pas de CIOMS, pas de déclaration SUSAR automatisée, pas de prétention de conformité réglementaire."
      />
      <div className="carte border-attention/30 bg-attention-voile/30 p-4 text-sm leading-relaxed">
        Les EIG se déclarent dans le système de vigilance du promoteur. Vigie
        permet seulement de ne pas les perdre de vue dans le suivi d&apos;étude.
      </div>
      {lignes.length === 0 ? (
        <EtatVide
          titre="Aucun événement saisi."
          texte="Enregistrez un AE/SAE pour le rattacher au sujet et au centre — à titre de suivi, pas de déclaration."
        />
      ) : (
        <Tableau colonnes={["ID", "Type", "Terme", "Sujet", "Gravité", "Statut", "Début"]}>
          {lignes.map((l) => (
            <tr key={l.ei.id}>
              <td className="font-semibold">{l.ei.code}</td>
              <td>{TYPES_EI[l.ei.type] ?? l.ei.type}</td>
              <td>{l.ei.terme}</td>
              <td>{l.subjectId ?? "—"}</td>
              <td>{l.ei.gravite ?? "—"}</td>
              <td>{l.ei.statut}</td>
              <td className="chiffres">{formaterDate(l.ei.dateDebut)}</td>
            </tr>
          ))}
        </Tableau>
      )}
    </div>
  );
}
