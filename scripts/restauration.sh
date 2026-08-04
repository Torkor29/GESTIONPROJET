#!/usr/bin/env bash
#
# Restaure une sauvegarde produite par sauvegarde.sh.
#
#   ./scripts/restauration.sh ./sauvegardes/gestionprojet_2026-08-04_09h00.tar.gz
#
# L'application est arrêtée le temps de la restauration, et les données
# actuelles sont mises de côté avant d'être remplacées.

set -euo pipefail

ARCHIVE="${1:-}"
RACINE="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

if [ -z "$ARCHIVE" ] || [ ! -f "$ARCHIVE" ]; then
  echo "Usage : $0 <chemin/vers/sauvegarde.tar.gz>" >&2
  exit 1
fi

cd "$RACINE"

echo "Cette opération va remplacer les données actuelles par celles de :"
echo "  $ARCHIVE"
read -r -p "Confirmer ? (tapez oui) : " reponse
[ "$reponse" = "oui" ] || { echo "Annulé."; exit 1; }

echo "→ Arrêt de l'application…"
docker compose stop app

if [ -d ./donnees ]; then
  MISE_DE_COTE="./donnees.avant-restauration.$(date +%Y-%m-%d_%Hh%M)"
  echo "→ Données actuelles mises de côté dans $MISE_DE_COTE"
  mv ./donnees "$MISE_DE_COTE"
fi

echo "→ Extraction de la sauvegarde…"
mkdir -p ./donnees
tar -xzf "$ARCHIVE" -C ./donnees

echo "→ Redémarrage…"
docker compose up -d app

echo "✅ Restauration terminée."
