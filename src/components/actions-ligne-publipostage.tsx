"use client";

import { dupliquerPublipostage, supprimerPublipostage } from "@/actions/publipostage";

const CLASSE =
  "rounded-lg px-2 py-1 text-xs font-medium text-attenue transition-colors hover:bg-relief";

/**
 * Dupliquer et supprimer depuis le tableau. La suppression demande une
 * confirmation : une fiche de cinquante champs ne doit pas disparaître sur un
 * clic égaré.
 */
export default function ActionsLignePublipostage({ id, titre }: { id: number; titre: string }) {
  return (
    <>
      <form action={dupliquerPublipostage}>
        <input type="hidden" name="id" value={id} />
        <button type="submit" title="Crée une copie identique, en brouillon" className={`${CLASSE} hover:text-encre`}>
          Dupliquer
        </button>
      </form>
      <form
        action={supprimerPublipostage}
        onSubmit={(e) => {
          if (!window.confirm(`Supprimer définitivement « ${titre} » ?`)) e.preventDefault();
        }}
      >
        <input type="hidden" name="id" value={id} />
        <button type="submit" title="Supprimer ce document" className={`${CLASSE} hover:text-alerte`}>
          Supprimer
        </button>
      </form>
    </>
  );
}
