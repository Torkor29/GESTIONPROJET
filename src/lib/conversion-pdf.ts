import "server-only";
import { execFile } from "node:child_process";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";

/**
 * Conversion .docx → PDF par LibreOffice, sans interface.
 *
 * Refaire la mise en page d'un document Word à la main (en HTML imprimé, ou
 * avec une bibliothèque PDF) perdrait les tableaux, les en-têtes et les
 * logos des trames institutionnelles. LibreOffice lit le .docx tel quel et
 * le rend fidèlement ; il est installé dans l'image Docker.
 */

export class PdfIndisponible extends Error {}

const DELAI_MAX_MS = 90_000;

function executer(binaire: string, args: string[]): Promise<void> {
  return new Promise((resoudre, rejeter) => {
    execFile(binaire, args, { timeout: DELAI_MAX_MS }, (erreur) => {
      if (!erreur) return resoudre();
      if ((erreur as NodeJS.ErrnoException).code === "ENOENT") {
        return rejeter(
          new PdfIndisponible(
            "La conversion en PDF passe par LibreOffice, absent de cette installation. " +
              "Téléchargez la version Word, ou installez LibreOffice sur le serveur.",
          ),
        );
      }
      rejeter(erreur);
    });
  });
}

export async function convertirEnPdf(docx: Buffer): Promise<Buffer> {
  const dossier = await mkdtemp(path.join(os.tmpdir(), "vigie-pdf-"));
  try {
    const entree = path.join(dossier, "document.docx");
    await writeFile(entree, docx);

    await executer(process.env.CHEMIN_LIBREOFFICE || "soffice", [
      "--headless",
      "--norestore",
      "--nolockcheck",
      // Un profil par conversion : deux exports simultanés ne se battent pas
      // pour le même verrou, et le profil ne dépend pas d'un HOME inscriptible.
      `-env:UserInstallation=file://${path.join(dossier, "profil")}`,
      "--convert-to",
      "pdf",
      "--outdir",
      dossier,
      entree,
    ]);

    try {
      return await readFile(path.join(dossier, "document.pdf"));
    } catch {
      throw new Error("LibreOffice n'a pas produit de PDF. Le document Word reste téléchargeable.");
    }
  } finally {
    await rm(dossier, { recursive: true, force: true });
  }
}
