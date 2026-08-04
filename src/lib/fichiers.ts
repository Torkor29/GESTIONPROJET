import "server-only";
import path from "node:path";

/** Dossier où atterrissent les fichiers déposés dans l'éditeur. */
export function dossierUploads(): string {
  return process.env.DOSSIER_UPLOADS ?? path.join(process.cwd(), "data", "uploads");
}

export const TAILLE_MAX_OCTETS = 25 * 1024 * 1024; // 25 Mo

/**
 * Réduit un nom de fichier à un jeu de caractères sûr. Toute notion de chemin
 * disparaît : impossible de remonter l'arborescence avec « ../ ».
 */
export function nomSur(nomBrut: string): string {
  const base = path.basename(nomBrut);
  const nettoye = base
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9._-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^[.-]+/, "")
    .slice(0, 100);
  return nettoye || "fichier";
}

const TYPES_PAR_EXTENSION: Record<string, string> = {
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".webp": "image/webp",
  ".svg": "image/svg+xml",
  ".avif": "image/avif",
  ".pdf": "application/pdf",
  ".txt": "text/plain",
  ".csv": "text/csv",
  ".zip": "application/zip",
  ".mp4": "video/mp4",
  ".webm": "video/webm",
  ".mp3": "audio/mpeg",
  ".wav": "audio/wav",
  ".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ".xlsx": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
};

export function typeMime(nom: string): string {
  return TYPES_PAR_EXTENSION[path.extname(nom).toLowerCase()] ?? "application/octet-stream";
}

/**
 * Construit l'en-tête Content-Disposition en préservant le nom d'origine.
 *
 * `encodeURIComponent` laisse passer ' ( ) * , que la RFC 5987 n'autorise pas :
 * un nom comme « Avis CPP (signé).pdf » casse alors l'analyse et le navigateur
 * enregistre le fichier sous le nom « download ». On complète donc l'encodage,
 * et on ajoute un repli ASCII pour les navigateurs qui ignorent `filename*`.
 */
export function enteteContentDisposition(
  disposition: "inline" | "attachment",
  nomOriginal: string,
): string {
  const repliAscii = nomOriginal
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\x20-\x7e]/g, "_")
    .replace(/["\\]/g, "_");

  const encode = encodeURIComponent(nomOriginal).replace(
    /['()*]/g,
    (c) => `%${c.charCodeAt(0).toString(16).toUpperCase()}`,
  );

  return `${disposition}; filename="${repliAscii}"; filename*=UTF-8''${encode}`;
}
