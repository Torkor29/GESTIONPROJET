import { Icone } from "@/components/icones";
import { NOM_COURT, NOM_PRODUIT } from "@/lib/site";

/**
 * Marque : le carré accent + le nom.
 *
 * `complete` affiche « Vigie Clinique ». `courte` n'affiche que « Vigie »,
 * pour les espaces serrés (barre latérale de l'application).
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
      className={`flex items-center gap-2 font-titre font-bold tracking-tight sm:gap-2.5 ${
        petite ? "text-sm" : "text-[15px]"
      }`}
    >
      <span
        className={`flex items-center justify-center rounded-[10px] bg-accent text-sur-accent ${
          petite ? "h-6 w-6" : "h-8 w-8 shadow-douce"
        }`}
      >
        <Icone nom="eclair" className={petite ? "h-3.5 w-3.5" : "h-4 w-4"} />
      </span>
      <span className="whitespace-nowrap">{complete ? NOM_PRODUIT : NOM_COURT}</span>
    </span>
  );
}
