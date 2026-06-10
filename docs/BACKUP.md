# Резервное копирование и восстановление (Спринт 4)

## Что сохраняется

| Компонент | Путь | Описание |
|-----------|------|----------|
| Данные приложения | `data/favorites.json` | Избранные города (JSON вместо SQL-дампа) |
| Медиа/вложения | `data/uploads/` | Пользовательские файлы (при наличии) |

СУБД в проекте **не используется**.

## Скрипты

| Скрипт | Платформа |
|--------|-----------|
| `scripts/backup.sh` | Git Bash / Linux |
| `scripts/restore.sh` | Git Bash / Linux |
| `scripts/backup.ps1` | Windows PowerShell |
| `scripts/restore.ps1` | Windows PowerShell |

Секреты читаются из `.env` (`BACKUP_DIR` — опционально). Пароли в скриптах не зашиты.

## Резервная копия

```powershell
# Windows
powershell -ExecutionPolicy Bypass -File scripts/backup.ps1

# Git Bash
bash scripts/backup.sh
```

Создаётся папка `backups/backup_YYYYMMDD_HHMMSS/` с:
- `favorites.json`
- `media.tar.gz` или `media.zip`
- `manifest.json`

## Восстановление

```powershell
# Симуляция аварии — удалить данные
Remove-Item data\favorites.json -Force
Remove-Item data\uploads\* -Recurse -Force

# Восстановление
powershell -ExecutionPolicy Bypass -File scripts/restore.ps1 -BackupPath backups\backup_YYYYMMDD_HHMMSS
```

Перезапустите `npm start` и обновите страницу — избранные города вернутся.

## Fire drill (для отчёта)

1. Добавьте города в избранное через UI.
2. Запустите `backup.ps1` — скриншот папки `backups/`.
3. Удалите `data/favorites.json`.
4. Запустите `restore.ps1` — скриншот терминала или UI с восстановленными городами.
