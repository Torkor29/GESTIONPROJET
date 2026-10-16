import DiscussionAssistant from "@/components/discussion-assistant";
import { lireConfigAssistant } from "@/lib/assistant";

export const dynamic = "force-dynamic";

export default function PageAssistant() {
  const actif = lireConfigAssistant() !== null;

  return (
    <div className="mx-auto max-w-3xl">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="sur-titre">Réglementaire</p>
          <h1 className="mt-1.5 font-titre text-3xl font-bold">Assistant</h1>
        </div>
        <details className="group relative text-sm">
          <summary className="cursor-pointer list-none rounded-full border border-ligne px-3.5 py-1.5 text-xs text-attenue transition hover:border-encre/40 hover:text-encre">
            Ce qu&apos;il voit, ce qu&apos;il ne voit pas
          </summary>
          <div className="absolute right-0 z-10 mt-2 w-80 rounded-3xl border border-ligne bg-relief p-4 text-xs leading-relaxed text-attenue shadow-elevee">
            <p>
              L&apos;assistant n&apos;a accès à <strong className="text-encre">aucune donnée de Vigie</strong> :
              ni études, ni missions, ni documents. Seule votre question part chez un fournisseur
              extérieur de modèle de langage ; rien n&apos;est conservé sur le serveur.
            </p>
            <p className="mt-2">
              N&apos;y saisissez <strong className="text-encre">aucune donnée patient</strong> ni
              information confidentielle. Les réponses peuvent être inexactes ou dépassées :
              vérifiez toujours le texte officiel avant de vous engager.
            </p>
          </div>
        </details>
      </header>

      {actif ? (
        <DiscussionAssistant />
      ) : (
        <p className="carte mt-8 p-8 text-center text-sm text-attenue">
          L&apos;assistant n&apos;est pas activé sur ce serveur. L&apos;administrateur doit
          renseigner <code>ASSISTANT_CLE_API</code> dans le fichier <code>.env</code>.
        </p>
      )}
    </div>
  );
}
