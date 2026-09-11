import "server-only";
import nodemailer from "nodemailer";
import { lireCompteSmtp } from "./courrier";
import { NOM_PRODUIT } from "./site";

/**
 * Envoie un courrier par la boîte configurée (Gmail ou autre SMTP).
 * Sans configuration, ne fait rien et le signale : l'appelant décide
 * s'il avertit ou s'il passe.
 */
export async function envoyerCourrier(opts: {
  a: string;
  sujet: string;
  texte: string;
}): Promise<{ ok: true } | { ok: false; raison: "absent" | "echec" }> {
  const compte = lireCompteSmtp();
  if (!compte) return { ok: false, raison: "absent" };

  try {
    const transport = nodemailer.createTransport({
      host: compte.hote,
      port: compte.port,
      secure: compte.port === 465,
      auth: { user: compte.utilisateur, pass: compte.motDePasse },
      connectionTimeout: 10_000,
      greetingTimeout: 10_000,
      socketTimeout: 15_000,
    });
    await transport.sendMail({
      from: `"${NOM_PRODUIT}" <${compte.de}>`,
      to: opts.a,
      subject: opts.sujet,
      text: opts.texte,
    });
    transport.close();
    return { ok: true };
  } catch (e) {
    console.error("Envoi du courrier impossible :", e instanceof Error ? e.message : e);
    return { ok: false, raison: "echec" };
  }
}
