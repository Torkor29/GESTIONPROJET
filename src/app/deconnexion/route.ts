import { NextResponse } from "next/server";
import { expirerCookieSession, originePublique } from "@/lib/auth";

export const dynamic = "force-dynamic";

/**
 * POST plutôt qu'une Server Action : le Set-Cookie part sur une vraie
 * redirection HTTP, avec le même Path (et Secure) que lors de la connexion.
 * Sinon le témoin reste, /connexion voit encore la session et renvoie au bord.
 */
export async function POST(requete: Request) {
  const reponse = NextResponse.redirect(`${originePublique(requete)}/connexion`, 303);
  reponse.headers.set("Cache-Control", "no-store");
  expirerCookieSession(reponse.headers);
  return reponse;
}
