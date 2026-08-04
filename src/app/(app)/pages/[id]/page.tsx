import Link from "next/link";
import { notFound } from "next/navigation";
import { supprimerPage } from "@/actions/pages";
import EditeurCharge from "@/components/editeur-charge";
import TitrePage from "@/components/titre-page";
import { formaterDateHeure } from "@/lib/format";
import { etudeParId, pageParId } from "@/lib/requetes";

export const dynamic = "force-dynamic";

export default async function PageDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const page = await pageParId(Number(id));
  if (!page) notFound();

  const etude = page.etudeId ? await etudeParId(page.etudeId) : null;

  return (
    <article className="mx-auto max-w-3xl">
      <nav className="mb-6 flex items-center justify-between gap-3 text-sm">
        <div className="flex min-w-0 items-center gap-1.5 text-muted">
          {etude ? (
            <>
              <Link href="/etudes" className="hover:text-ink">
                Études
              </Link>
              <span aria-hidden>/</span>
              <Link href={`/etudes/${etude.id}`} className="truncate hover:text-ink">
                {etude.nom}
              </Link>
            </>
          ) : (
            <Link href="/etudes" className="hover:text-ink">
              Pages libres
            </Link>
          )}
        </div>

        <form action={supprimerPage}>
          <input type="hidden" name="id" value={page.id} />
          <button
            type="submit"
            className="shrink-0 rounded-lg px-2 py-1 text-sm text-muted transition hover:bg-line/60 hover:text-red-500"
          >
            Supprimer
          </button>
        </form>
      </nav>

      <TitrePage pageId={page.id} titreInitial={page.titre} iconeInitiale={page.icone} />

      <p className="mt-1 text-xs text-muted">
        Modifiée le {formaterDateHeure(page.modifieLe)}
      </p>

      <div className="mt-6">
        <EditeurCharge pageId={page.id} contenuInitial={page.contenu} />
      </div>
    </article>
  );
}
