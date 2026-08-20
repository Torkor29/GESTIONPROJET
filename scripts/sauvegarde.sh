#!/usr/bin/env bash
#
# Sauvegarde complète : base de données + fichiers téléversés.
#
#   ./scripts/sauvegarde.sh              # écrit dans ./sauvegardes
#   ./scripts/sauvegarde.sh /mnt/backup  # écrit ailleurs
#
# La base est copiée avec « VACUUM INTO », qui produit un fichier cohérent même
# pendant que l'application écrit. Ne copiez jamais le .db à la main : avec le
# mode WAL, une copie brute peut être incomplète.

set -euo pipefail

DESTINATION="${1:-./sauvegardes}"
RACINE="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
HORODATAGE="$(date +%Y-%m-%d_%Hh%M)"
CONSERVER_JOURS="${CONSERVER_JOURS:-30}"

cd "$RACINE"
mkdir -p "$DESTINATION"

if ! docker compose ps --status running --services 2>/dev/null | grep -qx app; then
  echo "Erreur : le conteneur « app » ne tourne pas. Lancez d'abord : docker compose up -d" >&2
  exit 1
fi

echo "→ Copie cohérente de la base…"
docker compose exec -T app node -e "
  const Database = require('better-sqlite3');
  const db = new Database(process.env.CHEMIN_BASE);
  db.exec(\"VACUUM INTO '/donnees/copie-sauvegarde.db'\");
  db.close();
"

echo "→ Archivage de la base et des fichiers…"
ARCHIVE="$DESTINATION/gestionprojet_$HORODATAGE.tar.gz"
tar -czf "$ARCHIVE" \
  -C "$RACINE/donnees" \
  --transform 's|^copie-sauvegarde.db|gestionprojet.db|' \
  copie-sauvegarde.db \
  $([ -d "$RACINE/donnees/uploads" ] && echo uploads)

# Le fichier a été créé dans le conteneur : l'utilisateur hôte n'a souvent
# pas le droit de le supprimer. On le retire côté conteneur.
docker compose exec -T app rm -f /donnees/copie-sauvegarde.db \
  || sudo rm -f "$RACINE/donnees/copie-sauvegarde.db" \
  || true

echo "→ Suppression des sauvegardes de plus de $CONSERVER_JOURS jours…"
find "$DESTINATION" -name 'gestionprojet_*.tar.gz' -type f -mtime "+$CONSERVER_JOURS" -delete

echo "✅ Sauvegarde terminée : $ARCHIVE ($(du -h "$ARCHIVE" | cut -f1))"
