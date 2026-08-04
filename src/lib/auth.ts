import { createHmac, randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

const NOM_COOKIE = "gp_session";
const DUREE_SESSION = 60 * 60 * 24 * 30; // 30 jours

function motDePasseAttendu(): string {
  const mdp = process.env.MOT_DE_PASSE;
  if (!mdp) {
    throw new Error(
      "MOT_DE_PASSE n'est pas défini. Renseignez-le dans le fichier .env avant de démarrer.",
    );
  }
  return mdp;
}

function cleSession(): string {
  const cle = process.env.SECRET_SESSION;
  if (!cle || cle.length < 32) {
    throw new Error(
      "SECRET_SESSION doit être défini et faire au moins 32 caractères. " +
        "Générez-en un avec : openssl rand -hex 32",
    );
  }
  return cle;
}

/** Comparaison à temps constant, pour ne rien laisser fuir sur la durée du calcul. */
export function motDePasseValide(saisie: string): boolean {
  const attendu = motDePasseAttendu();
  // scrypt ramène les deux entrées à une longueur fixe : timingSafeEqual exige
  // des buffers de même taille, et le coût de calcul freine les essais en masse.
  const sel = "gestionprojet";
  const a = scryptSync(saisie, sel, 32);
  const b = scryptSync(attendu, sel, 32);
  return timingSafeEqual(a, b);
}

function signer(charge: string): string {
  return createHmac("sha256", cleSession()).update(charge).digest("base64url");
}

function creerJeton(): string {
  const expiration = Math.floor(Date.now() / 1000) + DUREE_SESSION;
  const charge = `${expiration}.${randomBytes(16).toString("base64url")}`;
  return `${charge}.${signer(charge)}`;
}

/**
 * Vérifie un jeton de session : signature d'abord, puis expiration.
 * Utilisable côté Edge comme côté Node (n'utilise que node:crypto).
 */
export function jetonValide(jeton: string | undefined): boolean {
  if (!jeton) return false;
  const morceaux = jeton.split(".");
  if (morceaux.length !== 3) return false;

  const [expiration, alea, signature] = morceaux;
  const attendue = signer(`${expiration}.${alea}`);

  const a = Buffer.from(signature);
  const b = Buffer.from(attendue);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return false;

  return Number(expiration) > Math.floor(Date.now() / 1000);
}

/**
 * Le cookie ne doit être marqué « secure » que si le site est réellement servi
 * en HTTPS — sinon le navigateur le refuse et la connexion échoue en boucle.
 *
 * DOMAINE est renseigné quand un vrai nom de domaine est configuré : Caddy sert
 * alors le site en HTTPS. Sans domaine (accès par IP en HTTP), on retombe sur
 * un cookie non sécurisé, seul moyen que la connexion fonctionne.
 */
function cookieSecurise(): boolean {
  const domaine = (process.env.DOMAINE ?? "").trim();
  return domaine !== "" && !domaine.startsWith(":");
}

export async function ouvrirSession(): Promise<void> {
  const boite = await cookies();
  boite.set(NOM_COOKIE, creerJeton(), {
    httpOnly: true,
    sameSite: "lax",
    secure: cookieSecurise(),
    path: "/",
    maxAge: DUREE_SESSION,
  });
}

export async function fermerSession(): Promise<void> {
  const boite = await cookies();
  boite.delete(NOM_COOKIE);
}

export async function estConnecte(): Promise<boolean> {
  const boite = await cookies();
  return jetonValide(boite.get(NOM_COOKIE)?.value);
}

/**
 * À appeler en tête de chaque Server Action et de chaque route API : les
 * layouts ne les protègent pas, elles sont joignables directement.
 */
export async function exigerSession(): Promise<void> {
  if (!(await estConnecte())) {
    throw new Error("Session expirée. Reconnectez-vous.");
  }
}

export { NOM_COOKIE };
