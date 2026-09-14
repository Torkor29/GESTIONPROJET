import { creerPage } from "@/actions/pages";
import { formaterDate } from "@/lib/format";
import { pagesLibres } from "@/lib/requetes";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function PageNotes() {
  const notes = await pagesLibres();

  return (
    <div className="space-y-5">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-titre text-3xl font-bold">Notes</h1>
          <p className="mt-1 max-w-xl text-sm text-attenue">
            Un pense-bête, une liste, un brouillon — les mêmes pages que dans un dossier
            d&apos;étude, sans les rattacher à une étude.
          </p>
        </div>
        <form action={creerPage}>
          <input type="hidden" name="titre" value="Nouvelle note" />
          <input type="hidden" name="icone" value="📝" />
          <button type="submit" className="bouton">
            Nouvelle note
          </button>
        </form>
      </header>

      {notes.length === 0 ? (
        <p className="carte p-8 text-center text-sm text-attenue">
          Aucune note pour l&apos;instant. Créez-en une pour un rappel, un brouillon ou ce que
          vous ne rangez pas dans une étude.
        </p>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {notes.map((p) => (
            <Link
              key={p.id}
              href={`/pages/${p.id}`}
              className="carte flex items-start gap-3 p-4 transition hover:border-accent/50"
            >
              <span aria-hidden className="text-xl leading-none">
                {p.icone}
              </span>
              <div className="min-w-0">
                <p className="truncate font-medium">{p.titre}</p>
                <p className="mt-0.5 text-xs text-attenue">
                  modifiée le {formaterDate(p.modifieLe)}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
