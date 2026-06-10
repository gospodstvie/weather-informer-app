const path = require("path");
const express = require("express");
const swaggerUi = require("swagger-ui-express");
require("dotenv").config();

const openApiSpec = require("../docs/openapi.json");
const { logger, createModuleLogger } = require("./logger");
const { geocodeCity } = require("./nominatim");
const { fetchOpenMeteo } = require("./openMeteo");
const { normalizeCurrent, normalizeForecast } = require("./normalize");
const {
  ensureDataLayout,
  readFavorites,
  addFavorite,
  removeFavorite
} = require("./dataStore");

const log = createModuleLogger("server.js");
const app = express();
const PORT = Number(process.env.PORT) || 5500;

const FORECAST_PARAMS = {
  current: [
    "temperature_2m",
    "relative_humidity_2m",
    "apparent_temperature",
    "weather_code",
    "wind_speed_10m",
    "wind_direction_10m",
    "pressure_msl",
    "uv_index",
    "is_day"
  ].join(","),
  hourly: [
    "temperature_2m",
    "precipitation_probability",
    "weather_code",
    "visibility",
    "wind_speed_10m",
    "is_day"
  ].join(","),
  daily: [
    "weather_code",
    "temperature_2m_max",
    "temperature_2m_min",
    "sunrise",
    "sunset",
    "uv_index_max",
    "precipitation_probability_max",
    "wind_speed_10m_max"
  ].join(","),
  timezone: "auto",
  forecast_days: "7"
};

async function fetchMeteoForecast(lat, lon) {
  return fetchOpenMeteo("/v1/forecast", {
    latitude: lat,
    longitude: lon,
    ...FORECAST_PARAMS
  });
}

function handleApiError(res, error, context) {
  const status = error.statusCode || 500;
  const message =
    status === 500 && error.message === "fetch failed"
      ? "Сервис погоды временно недоступен. Проверьте интернет и попробуйте снова."
      : error.message;

  if (status >= 500) {
    log.error(`${context}: ${message}`, error);
  } else if (status === 404) {
    log.warn(`${context}: ${message}`);
  } else {
    log.warn(`${context}: ${message}`);
  }

  res.status(status).json({ message });
}

app.use((req, res, next) => {
  const started = Date.now();
  res.on("finish", () => {
    const duration = Date.now() - started;
    const entry = `${req.method} ${req.originalUrl} → HTTP ${res.statusCode} (${duration}ms)`;
    if (res.statusCode >= 500) {
      log.error(`HTTP ${entry}`);
    } else if (res.statusCode >= 400) {
      log.warn(`HTTP ${entry}`);
    } else {
      log.info(`HTTP ${entry}`);
    }
  });
  next();
});

ensureDataLayout();

app.use(express.json());
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(openApiSpec));
app.use(express.static(path.join(__dirname, "..", "client")));

app.get("/api/favorites", (_req, res) => {
  res.json(readFavorites());
});

app.post("/api/favorites", (req, res) => {
  const city = req.body?.city?.toString().trim();
  if (!city) {
    log.warn("POST /api/favorites: пустое имя города");
    res.status(400).json({ message: "Field city is required." });
    return;
  }

  const favorites = addFavorite(city);
  log.info(`Избранное: добавлен город "${city}"`);
  res.status(201).json(favorites);
});

app.delete("/api/favorites", (req, res) => {
  const city = req.query.city?.toString().trim();
  if (!city) {
    res.status(400).json({ message: "Query param city is required." });
    return;
  }

  const favorites = removeFavorite(city);
  log.info(`Избранное: удалён город "${city}"`);
  res.json(favorites);
});

app.get("/api/geocode", async (req, res) => {
  const city = req.query.q?.toString().trim();
  if (!city) {
    log.warn("GET /api/geocode: отсутствует параметр q");
    res.status(400).json({ message: "Query param q is required." });
    return;
  }

  try {
    const geo = await geocodeCity(city);
    res.json(geo);
  } catch (error) {
    handleApiError(res, error, "GET /api/geocode");
  }
});

app.get("/api/weather", async (req, res) => {
  const city = req.query.q?.toString().trim();
  if (!city) {
    log.warn("GET /api/weather: отсутствует параметр q");
    res.status(400).json({ message: "Query param q is required." });
    return;
  }

  try {
    log.info(`Запрос погоды для города: "${city}"`);
    const geo = await geocodeCity(city);
    const meteo = await fetchMeteoForecast(geo.lat, geo.lon);
    log.info(`Погода получена: ${geo.name}, ${meteo.current?.temperature_2m}°C`);
    res.json(normalizeCurrent(geo, meteo));
  } catch (error) {
    handleApiError(res, error, "GET /api/weather");
  }
});

app.get("/api/forecast", async (req, res) => {
  const lat = req.query.lat?.toString().trim();
  const lon = req.query.lon?.toString().trim();
  const city = req.query.q?.toString().trim();

  try {
    let latitude = lat;
    let longitude = lon;

    if (city && (!latitude || !longitude)) {
      const geo = await geocodeCity(city);
      latitude = String(geo.lat);
      longitude = String(geo.lon);
    }

    if (!latitude || !longitude) {
      log.warn("GET /api/forecast: не заданы lat/lon или q");
      res.status(400).json({
        message: "Query params lat and lon are required (or q for city name)."
      });
      return;
    }

    log.info(`Запрос прогноза: lat=${latitude}, lon=${longitude}`);
    const meteo = await fetchMeteoForecast(latitude, longitude);
    res.json(normalizeForecast(meteo));
  } catch (error) {
    handleApiError(res, error, "GET /api/forecast");
  }
});

app.get("/api/uv", async (req, res) => {
  const lat = req.query.lat?.toString().trim();
  const lon = req.query.lon?.toString().trim();

  if (!lat || !lon) {
    log.warn("GET /api/uv: отсутствуют lat/lon");
    res.status(400).json({ message: "Query params lat and lon are required." });
    return;
  }

  try {
    const meteo = await fetchMeteoForecast(lat, lon);
    const uvi = meteo.current?.uv_index ?? meteo.daily?.uv_index_max?.[0] ?? null;
    res.json({ uvi });
  } catch (error) {
    handleApiError(res, error, "GET /api/uv");
  }
});

app.listen(PORT, () => {
  log.info(`Сервер запущен: http://localhost:${PORT}`);
  log.info(`Документация API: http://localhost:${PORT}/api-docs`);
  log.info(`Логи: папка logs/, ротация ${process.env.LOG_MAX_SIZE_MB || 5} МБ, до ${process.env.LOG_MAX_FILES || 5} файлов`);
  logger.info("Инициализация подсистемы логирования завершена", { module: "logger.js" });
});
