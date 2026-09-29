import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import { describe, it } from "node:test";
import JSZip from "jszip";
import { balisesDuModele, remplirDocx, type SourceFusion } from "../src/lib/fusion-docx";
import {
  MODELES_PUBLIPOSTAGE,
  champsDuModele,
  completude,
  formaterPourDocument,
  modelePublipostage,
  sourceFusion,
  titreSuggere,
} from "../src/lib/publipostage";

const W = 'xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main" xmlns:w14="http://schemas.microsoft.com/office/word/2010/wordml"';
const SURLIGNE = '<w:rPr><w:highlight w:val="yellow"/></w:rPr>';

/** Un .docx réduit à son strict nécessaire : le corps du document. */
async function docx(corps: string): Promise<Buffer> {
  const archive = new JSZip();
  archive.file("word/document.xml", `<w:document ${W}><w:body>${corps}</w:body></w:document>`);
  return archive.generateAsync({ type: "nodebuffer" });
}

async function corpsDe(fichier: Buffer): Promise<string> {
  const xml = await (await JSZip.loadAsync(fichier)).file("word/document.xml")!.async("string");
  return xml.slice(xml.indexOf("<w:body>") + 8, xml.indexOf("</w:body>"));
}

function source(valeurs: Record<string, string | string[]>): SourceFusion {
  return {
    connait: (cle) => cle in valeurs || cle.startsWith("vide"),
    texte: (cle) => {
      const v = valeurs[cle];
      return v === undefined ? undefined : Array.isArray(v) ? v.join(", ") : v;
    },
    coche: (cle, option) => {
      const v = valeurs[cle];
      return Array.isArray(v) ? v.includes(option) : v === option;
    },
  };
}

async function remplir(corps: string, valeurs: Record<string, string | string[]>) {
  return corpsDe(await remplirDocx(await docx(corps), source(valeurs)));
}

describe("remplirDocx", () => {
  it("remplace une balise et retire le surlignage de la zone remplie", async () => {
    const sortie = await remplir(`<w:p><w:r>${SURLIGNE}<w:t>{{centre|XXX}}</w:t></w:r></w:p>`, {
      centre: "CH de Quimper",
    });
    assert.ok(sortie.includes(">CH de Quimper</w:t>"));
    assert.ok(!sortie.includes("w:highlight"));
  });

  it("garde le texte de repli et le surlignage tant que le champ est vide", async () => {
    const sortie = await remplir(`<w:p><w:r>${SURLIGNE}<w:t>{{vide|XXX}}</w:t></w:r></w:p>`, {});
    assert.ok(sortie.includes(">XXX</w:t>"));
    assert.ok(sortie.includes("w:highlight"));
  });

  it("échappe les caractères réservés du XML", async () => {
    const sortie = await remplir("<w:p><w:r><w:t>{{nom}}</w:t></w:r></w:p>", { nom: "Durand & <Fils>" });
    assert.ok(sortie.includes("Durand &amp; &lt;Fils&gt;"));
  });

  it("recolle une balise que Word a coupée en plusieurs runs", async () => {
    const sortie = await remplir(
      "<w:p><w:r><w:t>Service de {{ser</w:t></w:r><w:proofErr/><w:r><w:t>vice}} !</w:t></w:r></w:p>",
      { service: "Cardiologie" },
    );
    assert.ok(sortie.includes("Service de Cardiologie"));
    assert.ok(sortie.includes("> !</w:t>"));
    assert.ok(!sortie.includes("{{"));
  });

  it("coche une case Word et recale son état interne", async () => {
    const cases = ["RIPH1", "RIPH2"]
      .map(
        (o) =>
          `<w:sdt><w:sdtPr><w14:checkbox><w14:checked w14:val="0"/></w14:checkbox></w:sdtPr><w:sdtContent><w:r><w:t>{{categorie=${o}}}</w:t></w:r></w:sdtContent></w:sdt>`,
      )
      .join("");
    const sortie = await remplir(`<w:p>${cases}</w:p>`, { categorie: "RIPH2" });
    assert.match(sortie, /checked w14:val="0"\/>.*☐.*checked w14:val="1"\/>.*☒/s);
  });

  it("coupe une valeur sur plusieurs lignes en paragraphes de même mise en forme", async () => {
    const sortie = await remplir(
      '<w:p><w:pPr><w:jc w:val="both"/></w:pPr><w:r><w:t>{{rib}}</w:t></w:r></w:p>',
      { rib: "IBAN : FR76\nBIC : ABCD" },
    );
    assert.equal(sortie.match(/<w:p>|<w:p /g)?.length, 2);
    assert.equal(sortie.match(/<w:jc w:val="both"\/>/g)?.length, 2);
    assert.ok(!sortie.includes("<w:br/>"));
  });

  it("garde un simple saut de ligne à l'intérieur d'un contrôle de contenu", async () => {
    const sortie = await remplir(
      "<w:p><w:sdt><w:sdtContent><w:r><w:t>{{adresse}}</w:t></w:r></w:sdtContent></w:sdt></w:p>",
      { adresse: "2 avenue Foch\nBrest" },
    );
    assert.equal(sortie.match(/<w:p>/g)?.length, 1);
    assert.ok(sortie.includes("<w:br/>"));
  });

  it("laisse visible une balise qui ne correspond à aucun champ", async () => {
    const sortie = await remplir("<w:p><w:r><w:t>{{inconnue}}</w:t></w:r></w:p>", {});
    assert.ok(sortie.includes("{{inconnue}}"));
  });
});

describe("modèles de publipostage", () => {
  for (const modele of MODELES_PUBLIPOSTAGE) {
    it(`${modele.nom} : chaque balise de la trame renvoie à un champ ou à une option`, async () => {
      const trame = await fs.readFile(path.join(process.cwd(), "modeles", modele.fichier));
      const champs = new Map(champsDuModele(modele).map((c) => [c.cle, c]));
      const calcules = Object.keys(modele.calcules ?? {});

      for (const balise of await balisesDuModele(trame)) {
        const [avant] = balise.split("|");
        const [cle, option] = avant.split("=").map((s) => s.trim());
        assert.ok(champs.has(cle) || calcules.includes(cle), `balise sans champ : {{${balise}}}`);
        if (option !== undefined) {
          assert.ok(champs.get(cle)?.options?.includes(option), `option inconnue : {{${balise}}}`);
        }
      }
    });
  }

  it("écrit dates et montants à la française", () => {
    assert.equal(formaterPourDocument({ cle: "d", libelle: "", type: "date" }, "2026-09-28"), "28/09/2026");
    assert.equal(
      formaterPourDocument({ cle: "d", libelle: "", type: "date", dateLongue: true }, "2026-09-28"),
      "28 septembre 2026",
    );
    assert.equal(
      formaterPourDocument({ cle: "m", libelle: "", type: "montant" }, "12500,5"),
      "12 500,50 €",
    );
    assert.equal(formaterPourDocument({ cle: "t", libelle: "", type: "texte" }, "  "), undefined);
  });

  it("déduit la qualification de l'article 2 et les mentions du préambule", () => {
    const convention = modelePublipostage("convention_centre_associe")!;
    const s = sourceFusion(convention, {
      categorie: "RIPH2",
      textes_applicables: ["Loi RIPH (2012-300)"],
    });
    assert.match(s.texte("qualification_recherche")!, /risques et contraintes minimes/);
    assert.equal(s.texte("visa_riph"), "");
    assert.equal(s.texte("visa_ec"), " (Non applicable)");
    // Sans réponse, la trame garde sa mention d'origine.
    assert.equal(sourceFusion(convention, {}).texte("visa_ec"), undefined);
  });

  it("propose un titre à partir des champs qui identifient le document", () => {
    const convention = modelePublipostage("convention_centre_associe")!;
    assert.equal(
      titreSuggere(convention, { acronyme: "PAPAYE", centre_nom: "CH de Quimper" }),
      "Convention centre associé — PAPAYE — CH de Quimper",
    );
  });

  it("ne compte pas les champs facultatifs dans la complétude", () => {
    const fiche = modelePublipostage("fiche_qualification")!;
    const vide = completude(fiche, {});
    const avecFacultatif = completude(fiche, { encadrant_nom: "Dr X" });
    assert.equal(vide.remplis, 0);
    assert.equal(avecFacultatif.remplis, 0);
    assert.equal(completude(fiche, { porteur_nom: "Dr Y" }).remplis, 1);
  });
});
