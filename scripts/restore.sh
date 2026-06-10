#!/usr/bin/env bash
# Восстановление данных из резервной копии (Спринт 4)

set -euo pipefail

if [[ $# -lt 1 ]]; then
  echo "Использование: $0 <путь_к_папке_backup_YYYYMMDD_HHMMSS>"
  echo "Пример: $0 ../backups/backup_20260608_120000"
  exit 1
fi

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
BACKUP_PATH="$(cd "$1" && pwd)"

if [[ ! -f "$BACKUP_PATH/favorites.json" ]]; then
  echo "[restore] Ошибка: favorites.json не найден в $BACKUP_PATH"
  exit 1
fi

mkdir -p "$ROOT/data" "$ROOT/data/uploads"

cp "$BACKUP_PATH/favorites.json" "$ROOT/data/favorites.json"
echo "[restore] Восстановлен favorites.json"

if [[ -f "$BACKUP_PATH/media.tar.gz" ]]; then
  rm -rf "$ROOT/data/uploads"
  mkdir -p "$ROOT/data/uploads"
  tar -xzf "$BACKUP_PATH/media.tar.gz" -C "$ROOT/data"
  echo "[restore] Распакован media.tar.gz → data/uploads"
elif [[ -d "$BACKUP_PATH/uploads" ]]; then
  rm -rf "$ROOT/data/uploads"
  cp -r "$BACKUP_PATH/uploads" "$ROOT/data/uploads"
  echo "[restore] Скопирован каталог uploads"
fi

echo "[restore] Восстановление завершено. Перезапустите сервер: npm start"
