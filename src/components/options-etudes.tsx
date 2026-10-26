import { sigleEtude } from "@/lib/format";

type EtudeOption = { id: number; nom: string; code?: string | null };

/**
 * Les études d'une liste déroulante, par acronyme seul et dans l'ordre
 * alphabétique : les intitulés complets, longs d'une ligne et demie,
 * rendaient la liste illisible. L'intitulé reste en infobulle.
 */
export default function OptionsEtudes({ etudes }: { etudes: readonly EtudeOption[] }) {
  const triees = [...etudes].sort((a, b) =>
    sigleEtude(a).localeCompare(sigleEtude(b), "fr", { sensitivity: "base", numeric: true }),
  );
  return (
    <>
      {triees.map((e) => (
        <option key={e.id} value={e.id} title={e.nom}>
          {sigleEtude(e)}
        </option>
      ))}
    </>
  );
}
