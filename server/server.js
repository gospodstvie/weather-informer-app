const path = require("path");
const express = require("express");
require("dotenv").config();

const app = express();
const PORT = Number(process.env.PORT) || 5500;
const OPENWEATHER_API_KEY = process.env.OPENWEATHER_API_KEY;
const OPENWEATHER_BASE = "https://api.openweathermap.org/data/2.5";
const OPENWEATHER_ONECALL = "https://api.openweathermap.org/data/3.0/onecall";

if (!OPENWEATHER_API_KEY) {
  console.error("OPENWEATHER_API_KEY is not set in .env");
  process.exit(1);
}

app.use(express.static(path.join(__dirname, "..", "client")));

async function fetchOpenWeather(endpoint, city) {
  const url = new URL(`${OPENWEATHER_BASE}/${endpoint}`);
  url.searchParams.set("q", city);
  url.searchParams.set("appid", OPENWEATHER_API_KEY);
  url.searchParams.set("units", "metric");
  url.searchParams.set("lang", "ru");

  const response = await fetch(url);
  const data = await response.json();

  if (!response.ok) {
    const error = new Error(data?.message || "OpenWeather request failed");
    error.statusCode = response.status;
    throw error;
  }

  return data;
}

app.get("/api/weather", async (req, res) => {
  const city = req.query.q?.toString().trim();
  if (!city) {
    res.status(400).json({ message: "Query param q is required." });
    return;
  }

  try {
    const data = await fetchOpenWeather("weather", city);
    res.json(data);
  } catch (error) {
    res.status(error.statusCode || 500).json({ message: error.message });
  }
});

app.get("/api/forecast", async (req, res) => {
  const city = req.query.q?.toString().trim();
  if (!city) {
    res.status(400).json({ message: "Query param q is required." });
    return;
  }

  try {
    const data = await fetchOpenWeather("forecast", city);
    res.json(data);
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
    const url = new URL(OPENWEATHER_ONECALL);
    url.searchParams.set("lat", lat);
    url.searchParams.set("lon", lon);
    url.searchParams.set("exclude", "minutely,hourly,daily,alerts");
    url.searchParams.set("appid", OPENWEATHER_API_KEY);
    url.searchParams.set("units", "metric");
    url.searchParams.set("lang", "ru");

    const response = await fetch(url);
    const data = await response.json();
    if (!response.ok) {
      const error = new Error(data?.message || "UV request failed");
      error.statusCode = response.status;
      throw error;
    }

    res.json({ uvi: data?.current?.uvi ?? null });
  } catch (error) {
    res.status(error.statusCode || 500).json({ message: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server started on http://localhost:${PORT}`);
});

