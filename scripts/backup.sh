#!/usr/bin/env bash
# Резервное копирование данных приложения (Спринт 4)
# СУБД нет — сохраняется JSON-дамп избранных городов и архив media (data/uploads)

set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

if [[ -f "$ROOT/.env" ]]; then
  set -a
  # shellcheck disable=SC1091
  source "$ROOT/.env"
  set +a
fi

BACKUP_ROOT="${BACKUP_DIR:-$ROOT/backups}"
STAMP="$(date +%Y%m%d_%H%M%S)"
DEST="$BACKUP_ROOT/backup_${STAMP}"

mkdir -p "$DEST" "$ROOT/data" "$ROOT/data/uploads"

if [[ ! -f "$ROOT/data/favorites.json" ]]; then
  echo '[]' >"$ROOT/data/favorites.json"
fi

cp "$ROOT/data/favorites.json" "$DEST/favorites.json"

if command -v tar >/dev/null 2>&1; then
  tar -czf "$DEST/media.tar.gz" -C "$ROOT/data" uploads
else
  echo "tar не найден — копируем uploads каталогом"
  cp -r "$ROOT/data/uploads" "$DEST/uploads"
fi

cat >"$DEST/manifest.json" <<EOF
{
  "app": "weather-informer",
  "created": "${STAMP}",
  "files": ["favorites.json", "media.tar.gz"]
}
EOF

echo "[backup] Создана резервная копия: $DEST"
echo "[backup] favorites.json + media (data/uploads)"
