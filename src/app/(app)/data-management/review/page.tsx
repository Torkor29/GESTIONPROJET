import { EntetePage, EtatVide, Tableau } from "@/components/ui";
import { listerRevues } from "@/lib/clinique";

export const dynamic = "force-dynamic";

export default async function PageReview() {
  const lignes = await listerRevues();
  return (
    <div className="space-y-5">
      <EntetePage
        titre="Data Review"
        description="Données manquantes, incohérences, valeurs aberrantes — issues des contrôles automatiques et des revues manuelles."
      />
      {lignes.length === 0 ? (
        <EtatVide
          titre="Rien à revoir pour le moment."
          texte="Les contrôles signaleront ici les champs vides, les hors-limites et les revues manuelles."
        />
      ) : (
        <Tableau colonnes={["Étude", "Sujet", "Type", "Description", "Statut"]}>
          {lignes.map((l) => (
            <tr key={l.revue.id}>
              <td>{l.etudeCode}</td>
              <td>{l.subjectId ?? "—"}</td>
              <td>{l.revue.type}</td>
              <td>{l.revue.description}</td>
              <td>{l.revue.statut}</td>
            </tr>
          ))}
        </Tableau>
      )}
    </div>
  );
}
