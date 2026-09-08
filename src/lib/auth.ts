import { createHmac, randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import { cookies, headers } from "next/headers";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { utilisateurs, type Utilisateur } from "@/db/schema";
import { LONGUEUR_MOT_DE_PASSE } from "@/lib/constantes";

const NOM_COOKIE = "gp_session";
const DUREE_SESSION = 60 * 60 * 24 * 30; // 30 jours

export { LONGUEUR_MOT_DE_PASSE };

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

/* -------------------------------------------------------------------------- */
/*  Mots de passe                                                             */
/* -------------------------------------------------------------------------- */

/**
 * Empreinte scrypt avec un sel tiré au hasard pour chaque compte : deux
 * personnes ayant le même mot de passe n'ont pas la même empreinte, et une
 * table pré-calculée ne sert à rien.
 */
export function hacherMotDePasse(clair: string): string {
  const sel = randomBytes(16).toString("hex");
  return `${sel}:${scryptSync(clair, sel, 64).toString("hex")}`;
}

/** Comparaison à temps constant : la durée du calcul ne révèle rien. */
export function motDePasseCorrespond(clair: string, stocke: string): boolean {
  const [sel, empreinte] = stocke.split(":");
  if (!sel || !empreinte) return false;

  const attendue = Buffer.from(empreinte, "hex");
  const calculee = scryptSync(clair, sel, attendue.length);
  return attendue.length === calculee.length && timingSafeEqual(attendue, calculee);
}

/* -------------------------------------------------------------------------- */
/*  Jetons de session                                                         */
/* -------------------------------------------------------------------------- */

function signer(charge: string): string {
  return createHmac("sha256", cleSession()).update(charge).digest("base64url");
}

/** Le jeton porte désormais l'identifiant de la personne connectée. */
function creerJeton(utilisateurId: number): string {
  const expiration = Math.floor(Date.now() / 1000) + DUREE_SESSION;
  const charge = `${utilisateurId}.${expiration}.${randomBytes(16).toString("base64url")}`;
  return `${charge}.${signer(charge)}`;
}

/**
 * Vérifie la signature puis l'expiration, et rend l'identifiant porté par le
 * jeton. Les jetons de l'ancien format (sans identifiant) sont rejetés : les
 * sessions ouvertes avant la mise à jour demandent une reconnexion.
 */
export function lireJeton(jeton: string | undefined): number | null {
  if (!jeton) return null;

  const morceaux = jeton.split(".");
  if (morceaux.length !== 4) return null;

  const [id, expiration, alea, signature] = morceaux;
  const attendue = signer(`${id}.${expiration}.${alea}`);

  const a = Buffer.from(signature);
  const b = Buffer.from(attendue);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;

  if (Number(expiration) <= Math.floor(Date.now() / 1000)) return null;

  const utilisateurId = Number(id);
  return Number.isInteger(utilisateurId) && utilisateurId > 0 ? utilisateurId : null;
}

/**
 * Le cookie ne doit être marqué « secure » que si *cette* requête est en
 * HTTPS. Se fier à `DOMAINE` cassait la connexion : dès que le nom était
 * renseigné, le témoin n'était plus envoyé en HTTP (accès par IP, certificat
 * pas encore prêt, développement local avec un `.env` de production).
 *
 * Caddy pose `X-Forwarded-Proto`. En son absence, on ne force pas `secure` :
 * un cookie non marqué circule aussi en HTTPS, alors que l'inverse bloque.
 */
async function cookieSecurise(): Promise<boolean> {
  try {
    const h = await headers();
    const proto = (h.get("x-forwarded-proto") ?? h.get("x-forwarded-protocol") ?? "")
      .split(",")[0]
      .trim()
      .toLowerCase();
    return proto === "https";
  } catch {
    return false;
  }
}

function optionsCookie(securise: boolean) {
  return {
    httpOnly: true as const,
    sameSite: "lax" as const,
    secure: securise,
    path: "/",
  };
}

/**
 * En-tête Set-Cookie qui expire le témoin. Le navigateur n'efface un cookie
 * que si le chemin — et, en HTTPS, l'attribut Secure — correspondent à ceux
 * de la pose. On envoie donc les deux variantes.
 */
function enTeteCookieVide(securise: boolean): string {
  const parts = [
    `${NOM_COOKIE}=`,
    "Path=/",
    "Max-Age=0",
    "Expires=Thu, 01 Jan 1970 00:00:00 GMT",
    "HttpOnly",
    "SameSite=Lax",
  ];
  if (securise) parts.push("Secure");
  return parts.join("; ");
}

export async function ouvrirSession(utilisateurId: number): Promise<void> {
  const boite = await cookies();
  boite.set(NOM_COOKIE, creerJeton(utilisateurId), {
    ...optionsCookie(await cookieSecurise()),
    maxAge: DUREE_SESSION,
  });
}

export async function fermerSession(): Promise<void> {
  const boite = await cookies();
  boite.set(NOM_COOKIE, "", {
    ...optionsCookie(await cookieSecurise()),
    maxAge: 0,
    expires: new Date(0),
  });
}

/** Adresse publique vue par le navigateur, derrière un reverse proxy. */
export function originePublique(requete: Request): string {
  const url = new URL(requete.url);
  const proto = (requete.headers.get("x-forwarded-proto") ?? url.protocol.replace(":", ""))
    .split(",")[0]
    .trim()
    .toLowerCase();
  const hote = (
    requete.headers.get("x-forwarded-host") ??
    requete.headers.get("host") ??
    url.host
  )
    .split(",")[0]
    .trim();
  return `${proto === "https" ? "https" : "http"}://${hote}`;
}

/** Expire le cookie de session sur une réponse HTTP (les deux variantes Secure). */
export function expirerCookieSession(enTetes: Headers): void {
  enTetes.append("Set-Cookie", enTeteCookieVide(true));
  enTetes.append("Set-Cookie", enTeteCookieVide(false));
}

/* -------------------------------------------------------------------------- */
/*  Lecture de la session                                                     */
/* -------------------------------------------------------------------------- */

/**
 * La personne connectée, ou `null`. Un jeton signé ne suffit pas : le compte
 * doit toujours exister et être actif, sinon une désactivation ne prendrait
 * effet qu'à l'expiration du cookie.
 */
export async function utilisateurActuel(): Promise<Utilisateur | null> {
  const boite = await cookies();
  const id = lireJeton(boite.get(NOM_COOKIE)?.value);
  if (id === null) return null;

  const compte = db.select().from(utilisateurs).where(eq(utilisateurs.id, id)).get();
  return compte && compte.actif ? compte : null;
}

export async function estConnecte(): Promise<boolean> {
  return (await utilisateurActuel()) !== null;
}

/**
 * À appeler en tête de chaque Server Action et de chaque route API : les
 * layouts ne les protègent pas, elles sont joignables directement.
 */
export async function exigerSession(): Promise<Utilisateur> {
  const compte = await utilisateurActuel();
  if (!compte) throw new Error("Session expirée. Reconnectez-vous.");
  return compte;
}

/** Vrai tant qu'aucun compte n'existe : l'installation n'a pas encore de propriétaire. */
export function aucunCompte(): boolean {
  return db.select({ id: utilisateurs.id }).from(utilisateurs).limit(1).all().length === 0;
}

export { NOM_COOKIE };
