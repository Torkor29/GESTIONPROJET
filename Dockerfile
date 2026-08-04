# syntax=docker/dockerfile:1

# ---------------------------------------------------------------- dépendances
# better-sqlite3 est un module natif : il se compile à l'installation, d'où la
# présence des outils de build dans cette étape uniquement.
FROM node:22-bookworm-slim AS deps
WORKDIR /app

RUN apt-get update \
 && apt-get install -y --no-install-recommends python3 make g++ ca-certificates \
 && rm -rf /var/lib/apt/lists/*

COPY package.json package-lock.json ./
RUN npm ci

# --------------------------------------------------------------- construction
FROM node:22-bookworm-slim AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# ------------------------------------------------------------------ exécution
FROM node:22-bookworm-slim AS runner
WORKDIR /app

ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3000 \
    HOSTNAME=0.0.0.0 \
    CHEMIN_BASE=/donnees/gestionprojet.db \
    DOSSIER_UPLOADS=/donnees/uploads

# L'application ne tourne pas en root.
RUN groupadd --system --gid 1001 app \
 && useradd --system --uid 1001 --gid app app \
 && mkdir -p /donnees \
 && chown -R app:app /donnees

# La sortie « standalone » embarque le serveur et uniquement les modules
# réellement utilisés : l'image reste légère.
COPY --from=builder --chown=app:app /app/.next/standalone ./
COPY --from=builder --chown=app:app /app/.next/static ./.next/static
COPY --from=builder --chown=app:app /app/public ./public
# Les migrations sont appliquées au démarrage par src/db/index.ts.
COPY --from=builder --chown=app:app /app/drizzle ./drizzle

USER app
EXPOSE 3000
VOLUME ["/donnees"]

HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:3000/connexion').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

CMD ["node", "server.js"]
