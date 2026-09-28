/**
 * Vérifie que chaque trame Word du dossier `modeles/` correspond à sa
 * définition dans src/lib/modeles-publipostage.ts :
 *   — toute balise renvoie à un champ ou à une valeur calculée ;
 *   — toute case `{{cle=Option}}` renvoie à une option existante du champ.
 *
 * À lancer après avoir retouché une trame ou ses champs :
 *   npm run modeles:verifier
 */
import fs from "node:fs/promises";
import path from "node:path";
import { balisesDuModele } from "../src/lib/fusion-docx";
import { MODELES_PUBLIPOSTAGE, champsDuModele } from "../src/lib/publipostage";

async function verifier(): Promise<number> {
  let erreurs = 0;

  for (const modele of MODELES_PUBLIPOSTAGE) {
    const trame = await fs.readFile(path.join(process.cwd(), "modeles", modele.fichier));
    const balises = await balisesDuModele(trame);
    const champs = new Map(champsDuModele(modele).map((c) => [c.cle, c]));
    const calcules = new Set(Object.keys(modele.calcules ?? {}));
    const utilises = new Set<string>();
    const problemes: string[] = [];

    for (const balise of balises) {
      const barre = balise.indexOf("|");
      const egal = balise.indexOf("=");
      const estCase = egal > 0 && (barre < 0 || egal < barre);
      const cle = balise.slice(0, estCase ? egal : barre >= 0 ? barre : undefined).trim();
      utilises.add(cle);

      if (!champs.has(cle) && !calcules.has(cle)) {
        problemes.push(`balise {{${balise}}} : aucun champ « ${cle} »`);
        continue;
      }
      if (estCase) {
        const option = balise.slice(egal + 1).trim();
        const champ = champs.get(cle);
        if (!champ?.options?.includes(option)) {
          problemes.push(`case {{${balise}}} : « ${option} » n'est pas une option du champ`);
        }
      }
    }

    // Un champ sans balise n'est pas une erreur — il peut ne servir qu'à un
    // calcul — mais il vaut d'être signalé.
    const sansBalise = [...champs.keys()].filter((c) => !utilises.has(c));

    console.log(`\n${modele.nom} (${modele.fichier}) — ${balises.length} balises`);
    for (const p of problemes) console.log(`  ✗ ${p}`);
    if (sansBalise.length > 0) {
      console.log(`  · champs sans balise (utilisés par un calcul ?) : ${sansBalise.join(", ")}`);
    }
    if (problemes.length === 0) console.log("  ✓ trame et définition concordent");
    erreurs += problemes.length;
  }

  return erreurs;
}

verifier().then((erreurs) => {
  process.exitCode = erreurs > 0 ? 1 : 0;
});
