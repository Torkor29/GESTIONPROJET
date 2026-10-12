import Link from "next/link";
import { notFound } from "next/navigation";
import { dupliquerPublipostage, supprimerPublipostage } from "@/actions/publipostage";
import EditeurPublipostage from "@/components/editeur-publipostage";
import { formaterDateHeure } from "@/lib/format";
import { type Valeurs, completerDepuisEtude, modelePublipostage } from "@/lib/publipostage";
import { listerEtudes, publipostageParId } from "@/lib/requetes";

export const dynamic = "force-dynamic";

export default async function PageDocumentPublipostage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const ligne = await publipostageParId(Number(id));
  if (!ligne) notFound();

  const doc = ligne.publipostage;
  const modele = modelePublipostage(doc.modele);
  const etudes = await listerEtudes({ avecArchivees: true });

  // Ce que chaque fiche étude peut apporter au document : l'éditeur s'en sert
  // pour « Reprendre les infos de l'étude », y compris après un changement
  // d'étude non encore enregistré.
  const suggestions: Record<number, Valeurs> = modele
    ? Object.fromEntries(etudes.map((e) => [e.id, completerDepuisEtude(modele, {}, e)]))
    : {};

  return (
    <div className="space-y-5">
      <header className="space-y-2">
        <Link
          href="/publipostage"
          className="sans-impression inline-flex items-center gap-1 text-sm text-attenue hover:text-encre"
        >
          ← Publipostage
        </Link>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <h1 className="font-titre text-2xl font-bold sm:text-3xl">{doc.titre}</h1>
            <p className="mt-1 text-sm text-attenue">
              {modele ? `${modele.nom} · ${modele.reference}` : "Modèle retiré"}
              {ligne.etudeNom && (
                <>
                  {" · "}
                  <Link href={`/etudes/${doc.etudeId}`} className="hover:text-encre hover:underline">
                    {ligne.etudeCode ?? ligne.etudeNom}
                  </Link>
                </>
              )}
              {" · "}modifié le {formaterDateHeure(doc.modifieLe)}
            </p>
          </div>

          <div className="sans-impression flex flex-wrap gap-2">
            <form action={dupliquerPublipostage}>
              <input type="hidden" name="id" value={doc.id} />
              <button
                type="submit"
                className="bouton-fantome"
                title="Crée une copie en brouillon — pour un autre centre, par exemple"
              >
                Dupliquer
              </button>
            </form>
          </div>
        </div>
      </header>

      {modele ? (
        <EditeurPublipostage
          document={doc}
          etudes={etudes.map((e) => ({ id: e.id, nom: e.nom, code: e.code }))}
          suggestions={suggestions}
        />
      ) : (
        <p className="carte p-8 text-center text-sm text-attenue">
          Le modèle « {doc.modele} » n&apos;existe plus dans cette installation : le document ne
          peut plus être complété ni exporté.
        </p>
      )}

      <section className="sans-impression border-t border-ligne pt-6">
        <details>
          <summary className="cursor-pointer text-sm text-attenue hover:text-alerte">
            Supprimer ce document
          </summary>
          <div className="carte mt-3 border-alerte/30 p-4">
            <p className="text-sm">
              Les champs saisis et le suivi du document seront définitivement perdus. Les fichiers
              Word ou PDF déjà téléchargés ne sont pas concernés.
            </p>
            <form action={supprimerPublipostage} className="mt-3">
              <input type="hidden" name="id" value={doc.id} />
              <input type="hidden" name="retour" value="liste" />
              <button
                type="submit"
                className="rounded-lg border border-alerte/40 px-3.5 py-2 text-sm font-medium text-alerte transition hover:bg-alerte/10"
              >
                Supprimer définitivement
              </button>
            </form>
          </div>
        </details>
      </section>
    </div>
  );
}
