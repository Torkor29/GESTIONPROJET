import { NOM_COURT, NOM_PRODUIT } from "@/lib/site";

/**
 * Marque : un point circulaire et le nom en serif, graisse 400.
 */
export function Marque({
  complete = true,
  petite = false,
}: {
  complete?: boolean;
  petite?: boolean;
}) {
  return (
    <span
      aria-label={NOM_PRODUIT}
      className={`flex items-center gap-2.5 tracking-[-0.02em] ${
        petite ? "text-sm" : "text-lg"
      }`}
    >
      <span
        className={`shrink-0 rounded-full bg-encre ${petite ? "h-2 w-2" : "h-2.5 w-2.5"}`}
        aria-hidden
      />
      <span className="whitespace-nowrap font-titre font-normal">
        {complete ? NOM_PRODUIT : NOM_COURT}
      </span>
    </span>
  );
}
