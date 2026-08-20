/** Identifiants humains : QUERY-0001, SUBJ-00125, DEV-014. */

export function formaterCode(prefixe: string, n: number, largeur = 4): string {
  return `${prefixe}-${String(n).padStart(largeur, "0")}`;
}

export function extraireNumero(code: string | null | undefined): number {
  if (!code) return 0;
  const m = code.match(/(\d+)$/);
  return m ? Number(m[1]) : 0;
}

export function prochainParmi(prefixe: string, codes: string[], largeur = 4): string {
  const max = codes.reduce((m, c) => Math.max(m, extraireNumero(c)), 0);
  return formaterCode(prefixe, max + 1, largeur);
}
