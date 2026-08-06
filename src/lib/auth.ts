import { createHmac, randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
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

/**
 * Clé d'installation : le `MOT_DE_PASSE` du fichier .env. Elle n'ouvre plus
 * l'application — elle n'autorise que la création du tout premier compte, pour
 * qu'un inconnu tombant sur l'adresse avant vous ne puisse pas s'en emparer.
 */
export function cleInstallationValide(saisie: string): boolean {
  const attendue = process.env.MOT_DE_PASSE ?? "";
  if (!attendue) {
    throw new Error(
      "MOT_DE_PASSE n'est pas défini dans le fichier .env. Il sert de clé " +
        "d'installation pour créer le premier compte.",
    );
  }
  const sel = "vigie-installation";
  const a = scryptSync(saisie, sel, 32);
  const b = scryptSync(attendue, sel, 32);
  return timingSafeEqual(a, b);
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

export async function ouvrirSession(utilisateurId: number): Promise<void> {
  const boite = await cookies();
  boite.set(NOM_COOKIE, creerJeton(utilisateurId), {
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

/** Vrai tant qu'aucun compte n'existe : seul moment où l'inscription est ouverte. */
export function aucunCompte(): boolean {
  return db.select({ id: utilisateurs.id }).from(utilisateurs).limit(1).all().length === 0;
}

export { NOM_COOKIE };
