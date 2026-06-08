const { createModuleLogger } = require("./logger");

const log = createModuleLogger("nominatim.js");
const NOMINATIM_BASE = "https://nominatim.openstreetmap.org";
const USER_AGENT = "weather-informer-app/1.0 (educational)";

async function geocodeCity(city) {
  const url = new URL(`${NOMINATIM_BASE}/search`);
  url.searchParams.set("q", city);
  url.searchParams.set("format", "json");
  url.searchParams.set("limit", "1");
  url.searchParams.set("accept-language", "ru");

  log.info(`Исходящий запрос: GET ${NOMINATIM_BASE}/search | city="${city}"`);

  let response;
  try {
    response = await fetch(url, {
      headers: { "User-Agent": USER_AGENT },
      signal: AbortSignal.timeout(8000)
    });
  } catch (error) {
    log.error("Сбой сети при геокодинге Nominatim", error);
    throw error;
  }

  log.info(`Ответ Nominatim: HTTP ${response.status}`);

  if (!response.ok) {
    const error = new Error("Nominatim request failed");
    error.statusCode = response.status;
    log.error(`Nominatim вернул HTTP ${response.status}`, error);
    throw error;
  }

  const results = await response.json();
  if (!Array.isArray(results) || results.length === 0) {
    const error = new Error("Город не найден");
    error.statusCode = 404;
    log.warn(`Город не найден: "${city}"`);
    throw error;
  }

  const place = results[0];
  const name =
    place.address?.city ||
    place.address?.town ||
    place.address?.village ||
    place.address?.state ||
    place.display_name?.split(",")[0] ||
    city;

  log.info(`Геокодинг успешен: ${name} (${place.lat}, ${place.lon})`);

  return {
    name: String(name).trim(),
    lat: Number(place.lat),
    lon: Number(place.lon),
    displayName: place.display_name
  };
}

module.exports = { geocodeCity };
