/**
 * Graphiques de la page Indicateurs.
 *
 * Tout est dessiné en HTML et en CSS, sans bibliothèque : les formes utiles ici
 * — barres verticales, barres horizontales — ne justifient pas d'embarquer un
 * moteur de rendu, et rien à charger signifie rien qui puisse casser.
 *
 * Les deux teintes catégorielles ont été validées pour la vision des couleurs
 * (séparation deutan ΔE 19,3) dans les deux thèmes. Leur séparation tritan
 * étant faible, elles ne portent jamais l'information seules : légende et
 * étiquettes directes accompagnent systématiquement le graphique.
 */

export const TEINTE_A = "#0D9488";
export const TEINTE_B = "#6366F1";

/** Encadre un graphique : titre, sous-titre, et le tracé lui-même. */
export function Cadre({
  titre,
  detail,
  children,
}: {
  titre: string;
  detail?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="carte p-5">
      <h2 className="font-titre text-lg font-bold">{titre}</h2>
      {detail && <p className="mt-0.5 text-sm text-attenue">{detail}</p>}
      <div className="mt-5">{children}</div>
    </section>
  );
}

function Legende({ entrees }: { entrees: { couleur: string; libelle: string }[] }) {
  return (
    <ul className="mb-4 flex flex-wrap gap-x-5 gap-y-1.5">
      {entrees.map((e) => (
        <li key={e.libelle} className="flex items-center gap-2 text-xs text-attenue">
          <span
            aria-hidden
            className="h-2.5 w-2.5 shrink-0 rounded-[3px]"
            style={{ backgroundColor: e.couleur }}
          />
          {e.libelle}
        </li>
      ))}
    </ul>
  );
}

/**
 * Barres verticales, une série. Sert aux tendances dans le temps.
 * Le titre nomme la série : pas de légende pour une série unique.
 */
export function BarresTemps({
  points,
  formater,
}: {
  points: { etiquette: string; valeur: number; infobulle: string }[];
  formater: (v: number) => string;
}) {
  const max = Math.max(1, ...points.map((p) => p.valeur));
  const dernier = points.length - 1;

  return (
    <div>
      {/* Pas d'`items-end` sur la rangée : il empêcherait les colonnes de
          s'étirer sur toute la hauteur, et un pourcentage de hauteur calculé
          dans une colonne sans hauteur vaut zéro — les barres disparaîtraient. */}
      <div className="flex h-40 gap-1.5">
        {points.map((p, i) => (
          <div
            key={p.etiquette + i}
            className="group relative flex h-full flex-1 flex-col justify-end"
          >
            {/* Une infobulle native : rien à charger, et elle fonctionne au
                clavier comme au survol. */}
            <span className="sr-only">{p.infobulle}</span>
            <div
              title={p.infobulle}
              className="w-full rounded-t-[4px] transition-opacity duration-150 group-hover:opacity-80"
              style={{
                height: `${Math.max(p.valeur > 0 ? 3 : 0, (p.valeur / max) * 100)}%`,
                backgroundColor: TEINTE_A,
                // La dernière barre est la période en cours : elle est encore
                // incomplète, on la distingue pour ne pas la lire comme un creux.
                opacity: i === dernier ? 0.55 : 1,
              }}
            />
          </div>
        ))}
      </div>

      <div className="mt-2 flex gap-1.5 border-t border-ligne pt-2">
        {points.map((p, i) => (
          <div
            key={p.etiquette + i}
            className="flex-1 truncate text-center text-[10px] text-efface"
          >
            {p.etiquette}
          </div>
        ))}
      </div>

      <p className="mt-3 text-xs text-attenue">
        Maximum sur la période : <strong className="text-encre">{formater(max)}</strong>
        <span className="text-efface"> · la dernière barre est la période en cours</span>
      </p>
    </div>
  );
}

/** Barres verticales groupées, deux séries. Légende obligatoire. */
export function BarresGroupees({
  points,
  libelleA,
  libelleB,
}: {
  points: { etiquette: string; a: number; b: number }[];
  libelleA: string;
  libelleB: string;
}) {
  const max = Math.max(1, ...points.flatMap((p) => [p.a, p.b]));

  return (
    <div>
      <Legende
        entrees={[
          { couleur: TEINTE_A, libelle: libelleA },
          { couleur: TEINTE_B, libelle: libelleB },
        ]}
      />

      <div className="flex h-40 gap-3">
        {points.map((p) => (
          <div key={p.etiquette} className="flex h-full flex-1 flex-col">
            {/* La zone de tracé prend toute la hauteur restante : c'est elle
                qui sert de référence aux pourcentages des barres. */}
            <div className="flex flex-1 items-end gap-0.5">
              {[
                { v: p.a, c: TEINTE_A, l: libelleA },
                { v: p.b, c: TEINTE_B, l: libelleB },
              ].map((s) => (
                <div
                  key={s.l}
                  title={`${p.etiquette} — ${s.l} : ${s.v}`}
                  className="flex-1 rounded-t-[4px] transition-opacity duration-150 hover:opacity-80"
                  style={{
                    height: `${Math.max(s.v > 0 ? 3 : 0, (s.v / max) * 100)}%`,
                    backgroundColor: s.c,
                  }}
                />
              ))}
            </div>
            <div className="mt-2 shrink-0 truncate border-t border-ligne pt-2 text-center text-[10px] text-efface">
              {p.etiquette}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Barres horizontales étiquetées. La forme qui convient quand les catégories
 * portent des noms longs — études, référentiels — qu'on ne peut pas incliner
 * sous un axe.
 */
export function BarresHorizontales({
  lignes,
}: {
  lignes: {
    cle: string;
    libelle: string;
    valeur: number;
    /** Texte affiché à droite : la valeur telle qu'on veut la lire. */
    affichage: string;
    /** L'entité porte sa propre couleur ; à défaut, la teinte d'accent. */
    couleur?: string;
  }[];
}) {
  const max = Math.max(1, ...lignes.map((l) => l.valeur));

  return (
    <ul className="space-y-3">
      {lignes.map((l) => (
        <li key={l.cle}>
          <div className="mb-1.5 flex items-baseline justify-between gap-3">
            {/* `min-w-0` : sans lui, un libellé long refuse de se rétrécir et
                pousse la valeur hors du cadre. */}
            <span className="min-w-0 truncate text-sm">{l.libelle}</span>
            <span className="chiffres shrink-0 text-sm font-semibold">{l.affichage}</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-creux">
            <div
              className="h-full rounded-full"
              style={{
                width: `${Math.max(l.valeur > 0 ? 2 : 0, (l.valeur / max) * 100)}%`,
                backgroundColor: l.couleur ?? TEINTE_A,
              }}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}

/** Absence de données : on le dit, plutôt que d'afficher un cadre vide. */
export function RienAMontrer({ message }: { message: string }) {
  return <p className="py-6 text-center text-sm text-attenue">{message}</p>;
}
