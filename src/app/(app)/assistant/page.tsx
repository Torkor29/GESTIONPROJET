import DiscussionAssistant from "@/components/discussion-assistant";
import { lireConfigAssistant } from "@/lib/assistant";

export const dynamic = "force-dynamic";

export default function PageAssistant() {
  const actif = lireConfigAssistant() !== null;

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <header>
        <p className="sur-titre">Réglementaire</p>
        <h1 className="mt-1.5 font-titre text-3xl font-bold">Assistant</h1>
        <p className="mt-2 text-attenue">
          Questions de réglementation et de pratique en recherche clinique, aide à la
          rédaction. L&apos;assistant n&apos;a accès à aucune donnée de Vigie : ni études,
          ni missions, ni documents.
        </p>
      </header>

      <div className="rounded-2xl border border-alerte/40 bg-alerte-voile p-4 text-sm">
        <p className="font-medium text-alerte">Ne saisissez ici aucune donnée patient ni information confidentielle.</p>
        <p className="mt-1 text-attenue">
          Vos questions partent chez un fournisseur extérieur de modèle de langage. Les
          réponses peuvent être inexactes ou dépassées : vérifiez toujours auprès du texte
          officiel avant de vous engager.
        </p>
      </div>

      {actif ? (
        <DiscussionAssistant />
      ) : (
        <p className="carte p-8 text-center text-sm text-attenue">
          L&apos;assistant n&apos;est pas activé sur ce serveur. L&apos;administrateur doit
          renseigner <code>ASSISTANT_CLE_API</code> dans le fichier <code>.env</code>.
        </p>
      )}
    </div>
  );
}
