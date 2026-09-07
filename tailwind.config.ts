import type { Config } from "tailwindcss";

/** Raccourci : une variable CSS exprimée en canaux RGB, ouverte à l'opacité. */
const teinte = (nom: string) => `rgb(var(--${nom}) / <alpha-value>)`;

export default {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        creux: teinte("creux"),
        surface: teinte("surface"),
        relief: teinte("relief"),

        ligne: teinte("ligne"),
        "ligne-forte": teinte("ligne-forte"),

        encre: teinte("encre"),
        attenue: teinte("attenue"),
        efface: teinte("efface"),

        accent: teinte("accent"),
        "accent-appuye": teinte("accent-appuye"),
        "accent-voile": teinte("accent-voile"),
        "sur-accent": teinte("sur-accent"),

        reussite: teinte("reussite"),
        "reussite-voile": teinte("reussite-voile"),
        attention: teinte("attention"),
        "attention-voile": teinte("attention-voile"),
        alerte: teinte("alerte"),
        "alerte-voile": teinte("alerte-voile"),
        info: teinte("info"),
        "info-voile": teinte("info-voile"),

        // Anciens noms, conservés le temps que tous les écrans passent à la
        // nouvelle charte. À retirer une fois la refonte des écrans terminée.
        raised: teinte("relief"),
        line: teinte("ligne"),
        ink: teinte("encre"),
        muted: teinte("attenue"),
      },

      fontFamily: {
        sans: ["var(--police-texte)", "ui-sans-serif", "system-ui", "sans-serif"],
        titre: ["var(--police-titre)", "var(--police-texte)", "ui-sans-serif", "sans-serif"],
      },

      boxShadow: {
        posee: "var(--ombre-posee)",
        douce: "var(--ombre-douce)",
        elevee: "var(--ombre-elevee)",
      },

      transitionTimingFunction: {
        // Léger dépassement en fin de course : le mouvement paraît vivant
        // sans être bondissant.
        souple: "cubic-bezier(0.32, 1.25, 0.5, 1)",
      },

      keyframes: {
        apparait: {
          from: { opacity: "0", transform: "translateY(8px)" },
          to: { opacity: "1", transform: "none" },
        },
      },

      animation: {
        apparait: "apparait 0.45s cubic-bezier(0.22, 1, 0.36, 1) both",
      },
    },
  },
  plugins: [],
} satisfies Config;
