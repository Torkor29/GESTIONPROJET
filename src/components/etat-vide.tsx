import { Icone, type NomIcone } from "./icones";

/**
 * Liste vide : une icône, ce qui manque, et à quoi sert l'endroit. Un simple
 * « Aucun… » ne dit pas quoi faire ensuite.
 */
export default function EtatVide({
  icone,
  message,
  aide,
  children,
}: {
  icone: NomIcone;
  message: string;
  /** Une phrase sur ce qu'on range ici, pour un premier usage. */
  aide?: string;
  /** Action proposée : un bouton de création, un lien. */
  children?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center rounded-xl border border-dashed border-ligne-forte bg-relief/60 px-6 py-10 text-center">
      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-creux text-efface">
        <Icone nom={icone} className="h-5 w-5" />
      </span>
      <p className="mt-3 text-sm font-medium text-encre">{message}</p>
      {aide && <p className="mt-1 max-w-sm text-[13px] text-attenue">{aide}</p>}
      {children && <div className="mt-4">{children}</div>}
    </div>
  );
}
