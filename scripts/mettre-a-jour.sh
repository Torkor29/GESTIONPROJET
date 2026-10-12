#!/usr/bin/env bash
#
# Mise à jour de l'application : sauvegarde, récupération du code, reconstruction.
#
#   ./scripts/mettre-a-jour.sh
#
# Détecte seule le mode d'installation. Si le réseau « web » du portier commun
# existe (voir deploiement/README.md), l'application est relancée derrière lui,
# avec docker-compose.derriere-proxy.yml ; sinon, en mode autonome avec son
# propre Caddy. Se tromper de commande à cet endroit coupe le site : en mode
# portier, un « docker compose up » nu sort l'application du réseau « web » et
# le portier répond alors 502.

set -euo pipefail

RACINE="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$RACINE"

if docker network inspect web >/dev/null 2>&1; then
  echo "→ Portier commun détecté : relance derrière le proxy."
  FICHIERS=(-f docker-compose.yml -f docker-compose.derriere-proxy.yml)
else
  echo "→ Installation autonome."
  FICHIERS=(-f docker-compose.yml)
fi

if docker compose "${FICHIERS[@]}" ps --status running --services 2>/dev/null | grep -qx app; then
  ./scripts/sauvegarde.sh
else
  echo "→ Application arrêtée : sauvegarde impossible, on continue sans."
fi

git pull --ff-only
docker compose "${FICHIERS[@]}" up -d --build --remove-orphans
docker compose "${FICHIERS[@]}" ps
