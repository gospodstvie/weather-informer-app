const path = require("path");
const express = require("express");
require("dotenv").config();

const { geocodeCity } = require("./nominatim");
const { fetchOpenMeteo } = require("./openMeteo");
const { normalizeCurrent, normalizeForecast } = require("./normalize");

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
    "wind_speed_10m"
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

app.use(express.static(path.join(__dirname, "..", "client")));

app.get("/api/geocode", async (req, res) => {
  const city = req.query.q?.toString().trim();
  if (!city) {
    res.status(400).json({ message: "Query param q is required." });
    return;
  }

  try {
    const geo = await geocodeCity(city);
    res.json(geo);
  } catch (error) {
    res.status(error.statusCode || 500).json({ message: error.message });
  }
});

app.get("/api/weather", async (req, res) => {
  const city = req.query.q?.toString().trim();
  if (!city) {
    res.status(400).json({ message: "Query param q is required." });
    return;
  }

  try {
    const geo = await geocodeCity(city);
    const meteo = await fetchMeteoForecast(geo.lat, geo.lon);
    res.json(normalizeCurrent(geo, meteo));
  } catch (error) {
    res.status(error.statusCode || 500).json({ message: error.message });
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
      res.status(400).json({
        message: "Query params lat and lon are required (or q for city name)."
      });
      return;
    }

    const meteo = await fetchMeteoForecast(latitude, longitude);
    res.json(normalizeForecast(meteo));
  } catch (error) {
    res.status(error.statusCode || 500).json({ message: error.message });
  }
});

app.get("/api/uv", async (req, res) => {
  const lat = req.query.lat?.toString().trim();
  const lon = req.query.lon?.toString().trim();

  if (!lat || !lon) {
    res.status(400).json({ message: "Query params lat and lon are required." });
    return;
  }

  try {
    const meteo = await fetchMeteoForecast(lat, lon);
    const uvi = meteo.current?.uv_index ?? meteo.daily?.uv_index_max?.[0] ?? null;
    res.json({ uvi });
  } catch (error) {
    res.status(error.statusCode || 500).json({ message: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server started on http://localhost:${PORT}`);
  console.log("Weather: Open-Meteo | Geocoding: Nominatim (OpenStreetMap)");
});
