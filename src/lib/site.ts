/**
 * Adresse publique du site.
 *
 * `DOMAINE` est déjà la variable qui pilote Caddy et le cookie de session ;
 * on la réutilise plutôt que d'en introduire une seconde qui pourrait la
 * contredire. Sans domaine configuré, on retombe sur l'adresse locale : les
 * liens absolus du plan du site restent alors cohérents en développement.
 */
export const SITE_URL = process.env.DOMAINE
  ? `https://${process.env.DOMAINE}`
  : "http://localhost:3000";
