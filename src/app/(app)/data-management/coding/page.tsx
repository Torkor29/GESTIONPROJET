import { EntetePage, EtatVide, Tableau } from "@/components/ui";
import { listerCodages } from "@/lib/clinique";

export const dynamic = "force-dynamic";

export default async function PageCoding() {
  const lignes = await listerCodages();
  return (
    <div className="space-y-5">
      <EntetePage
        titre="Coding"
        description="File d'attente de termes à coder. Aucun dictionnaire propriétaire (MedDRA, WhoDrug, etc.) n'est fourni avec l'outil : le code se saisit après coding dans le système de référence de l'étude."
      />
      <div className="carte border-attention/30 bg-attention-voile/30 p-4 text-sm">
        Architecture prévue : médicament, événement, pathologie. Pas d&apos;intégration
        automatique à un dictionnaire commercial.
      </div>
      {lignes.length === 0 ? (
        <EtatVide
          titre="Aucun terme en attente de coding."
          texte="Les termes saisis en clair (EI, traitements concomitants) apparaîtront ici."
        />
      ) : (
        <Tableau colonnes={["Étude", "Sujet", "Type", "Terme source", "Code", "Statut"]}>
          {lignes.map((l) => (
            <tr key={l.codage.id}>
              <td>{l.etudeCode}</td>
              <td>{l.subjectId ?? "—"}</td>
              <td>{l.codage.type}</td>
              <td>{l.codage.termeSource}</td>
              <td>{l.codage.code ?? "—"}</td>
              <td>{l.codage.statut}</td>
            </tr>
          ))}
        </Tableau>
      )}
    </div>
  );
}
