/**
 * Démarrage du serveur : lance la tournée horaire des rappels par courrier.
 * Elle tourne dans l'application elle-même, sans tâche planifiée à installer
 * sur la machine.
 */
export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;
  if (process.env.NEXT_PHASE === "phase-production-build") return;
  const { demarrerRappels } = await import("./lib/envoi-rappels");
  demarrerRappels();
}
