import JSZip from "jszip";

/**
 * Remplissage d'un modèle Word (.docx) par des balises `{{…}}`.
 *
 * Un .docx est une archive de fichiers XML : le texte vit dans des `<w:t>`
 * portés par des « runs » `<w:r>`. On remplace les balises directement dans
 * ce XML, ce qui préserve à l'identique la mise en page, les styles, les
 * en-têtes et les pieds de page du modèle d'origine.
 *
 * Syntaxe des balises :
 *   {{cle}}            la valeur du champ
 *   {{cle|XXX}}        idem ; si le champ est vide, « XXX » est écrit à la place
 *                      et le surlignage de la trame est conservé
 *   {{cle=Option}}     ☒ si l'option est retenue, ☐ sinon
 *
 * Le surlignage sert, dans les trames institutionnelles, à signaler ce qui
 * reste à compléter : une zone remplie le perd, une zone restée sur son texte
 * de repli le garde. Un brouillon exporté montre donc d'un coup d'œil ce qui
 * manque encore.
 */

/** Ce que le document doit savoir des champs pour se remplir. */
export type SourceFusion = {
  /** Balise connue ? Une balise inconnue est laissée telle quelle, bien visible. */
  connait(cle: string): boolean;
  /** Texte à écrire ; `undefined` si le champ n'est pas renseigné. */
  texte(cle: string): string | undefined;
  /** L'option est-elle retenue pour ce champ ? */
  coche(cle: string, option: string): boolean;
};

const CASE_COCHEE = "☒";
const CASE_VIDE = "☐";

/** Parties d'un .docx susceptibles de porter du texte. */
const PARTIES = /^word\/(document|header\d*|footer\d*|footnotes|endnotes)\.xml$/;

const PARAGRAPHE = /<w:p[\s>][\s\S]*?<\/w:p>/g;
const RUN = /<w:r(?:\s[^>]*)?>[\s\S]*?<\/w:r>/g;
const TEXTE = /(<w:t(?:\s[^>]*)?>)([^<]*)(<\/w:t>)/g;
const BALISE = /\{\{([^{}]+)\}\}/g;
const SURLIGNAGE = /<w:highlight\s[^>]*\/>/g;
/** Contrôle de contenu le plus interne : aucun autre `<w:sdt>` à l'intérieur. */
const CONTROLE = /<w:sdt>(?:(?!<w:sdt[\s>])[\s\S])*?<\/w:sdt>/g;

function echapperXml(texte: string): string {
  return texte
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function decoderXml(texte: string): string {
  return texte
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, "&");
}

/** Toute balise `<w:t>` réécrite doit conserver ses espaces de bord. */
function ouverturePreservee(ouverture: string): string {
  return ouverture.includes("xml:space")
    ? ouverture
    : ouverture.replace("<w:t", '<w:t xml:space="preserve"');
}

/**
 * Word découpe volontiers une balise saisie à la main en plusieurs runs
 * (correcteur orthographique, historique des révisions) : `{{nom_` dans un
 * run, `centre}}` dans le suivant. On recolle chaque balise dans le run où
 * elle commence avant de la remplacer.
 *
 * Chaque caractère du paragraphe appartient à un `<w:t>` ; ceux d'une balise
 * à cheval sont réattribués au premier, le reste ne bouge pas.
 */
function recollerBalises(paragraphe: string): string {
  if (!paragraphe.includes("{")) return paragraphe;

  const noeuds = [...paragraphe.matchAll(TEXTE)].map((m) => ({
    debut: m.index,
    fin: m.index + m[0].length,
    ouverture: m[1],
    texte: m[2],
  }));
  if (noeuds.length < 2) return paragraphe;

  const complet = noeuds.map((n) => n.texte).join("");
  const proprietaire: number[] = [];
  noeuds.forEach((n, i) => {
    for (let k = 0; k < n.texte.length; k++) proprietaire.push(i);
  });

  let aRecoller = false;
  for (const m of complet.matchAll(BALISE)) {
    const debut = m.index;
    const fin = debut + m[0].length;
    const premier = proprietaire[debut];
    if (proprietaire[fin - 1] === premier) continue;
    aRecoller = true;
    for (let k = debut; k < fin; k++) proprietaire[k] = premier;
  }
  if (!aRecoller) return paragraphe;

  const textes = noeuds.map(() => "");
  for (let k = 0; k < complet.length; k++) textes[proprietaire[k]] += complet[k];

  let resultat = "";
  let curseur = 0;
  noeuds.forEach((n, i) => {
    resultat += paragraphe.slice(curseur, n.debut);
    const ouverture = textes[i] === n.texte ? n.ouverture : ouverturePreservee(n.ouverture);
    resultat += `${ouverture}${textes[i]}</w:t>`;
    curseur = n.fin;
  });
  return resultat + paragraphe.slice(curseur);
}

type Resolution = { texte: string; repli: boolean };

/** Valeur d'une balise, ou `null` si elle ne correspond à aucun champ connu. */
function evaluer(expression: string, source: SourceFusion): Resolution | null {
  const brute = decoderXml(expression).trim();
  const barre = brute.indexOf("|");

  // Un « = » dans le texte de repli ne fait pas de la balise une case à cocher.
  const egal = brute.indexOf("=");
  if (egal > 0 && (barre < 0 || egal < barre)) {
    const cle = brute.slice(0, egal).trim();
    if (!source.connait(cle)) return null;
    const coche = source.coche(cle, brute.slice(egal + 1).trim());
    return { texte: coche ? CASE_COCHEE : CASE_VIDE, repli: false };
  }

  const cle = (barre >= 0 ? brute.slice(0, barre) : brute).trim();
  if (!source.connait(cle)) return null;

  const texte = source.texte(cle);
  if (texte !== undefined) return { texte, repli: false };

  const repli = barre >= 0 ? brute.slice(barre + 1) : "";
  return { texte: repli, repli: repli !== "" };
}

/**
 * Marque provisoire d'un retour à la ligne saisi dans une valeur. Le
 * caractère U+0001 est interdit en XML : il ne peut pas venir du modèle.
 */
const SAUT = "\u0001";

/** Éléments qui enveloppent des runs dans un paragraphe, et qu'une coupure casserait. */
const OUVERTURE_CONTENEUR = /<w:(?:sdt|hyperlink|smartTag|customXml|fldSimple)[\s>]/g;
const FERMETURE_CONTENEUR = /<\/w:(?:sdt|hyperlink|smartTag|customXml|fldSimple)>/g;

/**
 * Texte prêt à glisser dans un `<w:t>` : échappé, tabulations traduites en
 * éléments Word, retours à la ligne marqués pour être traités au niveau du
 * paragraphe — un `\n` brut dans un `<w:t>` s'afficherait comme une espace.
 */
function versRuns(texte: string, proprietes: string): string {
  return texte
    .split(/\r?\n/)
    .map((ligne) =>
      ligne
        .split("\t")
        .map(echapperXml)
        .join('</w:t><w:tab/><w:t xml:space="preserve">'),
    )
    .join(`</w:t></w:r>${SAUT}<w:r>${proprietes}<w:t xml:space="preserve">`);
}

function remplirRun(run: string, source: SourceFusion): string {
  if (!run.includes("{{")) return run;

  let modifie = false;
  let resteACompleter = false;
  const proprietes = /^<w:r(?:\s[^>]*)?>(<w:rPr>[\s\S]*?<\/w:rPr>)?/.exec(run)?.[1] ?? "";

  const nouveau = run.replace(TEXTE, (tout, ouverture: string, contenu: string) => {
    if (!contenu.includes("{{")) return tout;
    let change = false;
    const texte = contenu.replace(BALISE, (balise, expression: string) => {
      const r = evaluer(expression, source);
      if (r === null) return balise;
      change = true;
      if (r.repli) resteACompleter = true;
      return versRuns(r.texte, proprietes);
    });
    if (!change) return tout;
    modifie = true;
    return `${ouverturePreservee(ouverture)}${texte}</w:t>`;
  });

  if (!modifie) return run;
  return resteACompleter ? nouveau : nouveau.replace(SURLIGNAGE, "");
}

/**
 * Traduit les retours à la ligne d'une valeur en nouveaux paragraphes, qui
 * reprennent la mise en forme du paragraphe d'origine.
 *
 * Un simple saut de ligne (`<w:br/>`) ferait l'affaire en apparence, mais
 * dans un paragraphe justifié Word étire la ligne qui le précède jusqu'à la
 * marge : un RIB sur trois lignes s'étalerait mot par mot sur la page. Le
 * saut de ligne ne reste qu'à l'intérieur d'un contrôle de contenu ou d'un
 * lien, qu'on ne peut pas couper en deux paragraphes sans les casser.
 */
function couperParagraphe(paragraphe: string): string {
  const pPr = /^<w:p(?:\s[^>]*)?>(<w:pPr>[\s\S]*?<\/w:pPr>)?/.exec(paragraphe)?.[1] ?? "";
  // Un saut de section vit dans les propriétés du dernier paragraphe de la
  // section : seul le dernier morceau le garde.
  const pPrSansSection = pPr.replace(/<w:sectPr[\s\S]*?<\/w:sectPr>/, "");
  const morceaux = paragraphe.split(SAUT);

  let resultat = pPr ? morceaux[0].replace(pPr, pPrSansSection) : morceaux[0];
  let conteneursOuverts = 0;
  for (let i = 1; i < morceaux.length; i++) {
    const precedent = morceaux[i - 1];
    conteneursOuverts +=
      (precedent.match(OUVERTURE_CONTENEUR)?.length ?? 0) -
      (precedent.match(FERMETURE_CONTENEUR)?.length ?? 0);
    if (conteneursOuverts > 0) {
      resultat += `<w:r><w:br/></w:r>${morceaux[i]}`;
    } else {
      const dernier = i === morceaux.length - 1;
      resultat += `</w:p><w:p>${dernier ? pPr : pPrSansSection}${morceaux[i]}`;
    }
  }
  return resultat;
}

/**
 * Les cases à cocher de Word sont des contrôles de contenu dont l'état vit
 * dans un attribut, à côté du glyphe affiché. On recale l'attribut sur le
 * glyphe produit, sans quoi un clic dans Word basculerait la case à l'envers.
 */
function synchroniserCases(xml: string): string {
  return xml.replace(CONTROLE, (controle) => {
    if (!controle.includes("<w14:checkbox>")) return controle;
    const contenu = controle.slice(controle.indexOf("<w:sdtContent>"));
    const etat = contenu.includes(CASE_COCHEE) ? "1" : contenu.includes(CASE_VIDE) ? "0" : null;
    if (etat === null) return controle;
    return controle.replace(/<w14:checked w14:val="[^"]*"\s*\/>/, `<w14:checked w14:val="${etat}"/>`);
  });
}

function remplirParagraphe(paragraphe: string, source: SourceFusion): string {
  if (!paragraphe.includes("{")) return paragraphe;
  const rempli = recollerBalises(paragraphe).replace(RUN, (run) => remplirRun(run, source));
  return rempli.includes(SAUT) ? couperParagraphe(rempli) : rempli;
}

function remplirPartie(xml: string, source: SourceFusion): string {
  const rempli = xml.replace(PARAGRAPHE, (p) => remplirParagraphe(p, source));
  return rempli.includes("<w14:checkbox>") ? synchroniserCases(rempli) : rempli;
}

/** Remplit un modèle et rend le .docx complété. */
export async function remplirDocx(modele: Buffer, source: SourceFusion): Promise<Buffer> {
  const archive = await JSZip.loadAsync(modele);

  for (const nom of Object.keys(archive.files)) {
    if (!PARTIES.test(nom)) continue;
    const fichier = archive.file(nom);
    if (!fichier) continue;
    const xml = await fichier.async("string");
    if (!xml.includes("{")) continue;
    archive.file(nom, remplirPartie(xml, source));
  }

  return archive.generateAsync({
    type: "nodebuffer",
    compression: "DEFLATE",
    mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  });
}

/**
 * Balises présentes dans un modèle, telles qu'écrites (`cle`, `cle|repli`,
 * `cle=Option`) : sert à vérifier qu'il colle à sa définition.
 */
export async function balisesDuModele(modele: Buffer): Promise<string[]> {
  const archive = await JSZip.loadAsync(modele);
  const trouvees = new Set<string>();

  for (const nom of Object.keys(archive.files)) {
    if (!PARTIES.test(nom)) continue;
    const xml = (await archive.file(nom)?.async("string")) ?? "";
    const recolle = xml.replace(PARAGRAPHE, recollerBalises);
    for (const m of recolle.matchAll(TEXTE)) {
      for (const b of m[2].matchAll(BALISE)) trouvees.add(decoderXml(b[1]).trim());
    }
  }
  return [...trouvees].sort();
}
