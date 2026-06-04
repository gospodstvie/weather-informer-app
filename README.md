# Погодный информер

**Команда:** 9/3-РПО-2023/2, Бадмаев Богдан  
**Репозиторий (ветка `psevdo-fork`):** https://github.com/gospodstvie/weather-informer-app/tree/psevdo-fork

Веб-приложение для просмотра текущей погоды и прогноза по выбранному городу с динамической темой интерфейса.

---

## Возможности

- Поиск города и отображение текущей погоды
- Почасовой прогноз (24 ч), прогноз на 5 дней, график температуры
- Тема интерфейса по типу погоды и режим день/ночь
- Избранные города (localStorage)
- REST API с интерактивной документацией Swagger UI

---

## Стек технологий

| Слой | Технологии |
|------|------------|
| Frontend | HTML5, CSS3, Vanilla JavaScript, Chart.js |
| Backend | Node.js, Express |
| Внешние API | Open-Meteo, Nominatim (OpenStreetMap) |
| Документация API | OpenAPI 3.0, Swagger UI |

---

## Структура проекта

```
weather-informer-app/
├── client/           # Фронтенд (HTML, CSS, JS)
├── server/           # Express, прокси API, нормализация данных
├── docs/
│   ├── openapi.json  # Спецификация API
│   └── ADMIN.md      # Руководство администратора
├── .env.example      # Шаблон переменных окружения
├── Dockerfile
└── docker-compose.yml
```

---

## Быстрый старт (локально)

**Требования:** Node.js 18+, npm.

```bash
git clone https://github.com/gospodstvie/weather-informer-app.git
cd weather-informer-app
git checkout psevdo-fork
npm install
```

Создайте `.env` из шаблона:

```bash
copy .env.example .env
```

Запуск:

```bash
npm start
```

| URL | Назначение |
|-----|------------|
| http://localhost:5500/ | Веб-интерфейс |
| http://localhost:5500/api-docs | Swagger UI (документация API) |

---

## Запуск в Docker

```bash
copy .env.example .env
docker compose up --build -d
```

Приложение будет доступно на порту из `.env` (по умолчанию `5500`).

Остановка:

```bash
docker compose down
```

---

## Карта переменных окружения

Файл `.env` не коммитится в Git. Используйте `.env.example` как эталон.

| Переменная | Тип | Назначение | Пример (безопасный) |
|------------|-----|------------|---------------------|
| `PORT` | number | TCP-порт HTTP-сервера Express | `5500` |

Секреты (API-ключи) не требуются: Open-Meteo и Nominatim работают без регистрации.

---

## API (кратко)

| Метод | Путь | Описание |
|-------|------|----------|
| GET | `/api/geocode?q=` | Координаты города |
| GET | `/api/weather?q=` | Текущая погода |
| GET | `/api/forecast?lat=&lon=` | Прогноз (или `?q=город`) |
| GET | `/api/uv?lat=&lon=` | UV-индекс |

Полная спецификация, примеры ответов и коды ошибок — в **Swagger UI**: `/api-docs`  
Исходник спецификации: `docs/openapi.json`

---

## Разработка

```bash
npm run lint          # ESLint
npm run format        # Prettier
npm run format:check  # Проверка форматирования
```

---

## Документация

- [Руководство администратора](docs/ADMIN.md) — требования, деплой, Nginx, аварийное восстановление
- [OpenAPI](docs/openapi.json) — машиночитаемая спецификация API

---

## Модули фронтенда

- `api.js` — запросы к backend
- `state.js` — избранные города (localStorage)
- `ui.js` — отрисовка, темы, графики
- `script.js` — контроллер UI

---

## Техническое задание (кратко)

Система показывает температуру, описание погоды, прогноз по городу, обновляет тему интерфейса в зависимости от погоды и времени суток.
