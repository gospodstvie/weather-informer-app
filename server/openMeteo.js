const { createModuleLogger } = require("./logger");

const log = createModuleLogger("openMeteo.js");
const OPEN_METEO_PRIMARY = "https://api.open-meteo.com";
const OPEN_METEO_MIRROR = "https://nodata-api.open-meteo.com";

async function fetchOpenMeteo(path, searchParams) {
  const bases = [OPEN_METEO_PRIMARY, OPEN_METEO_MIRROR];
  let lastError = null;

  for (const base of bases) {
    const url = new URL(`${base}${path}`);
    Object.entries(searchParams).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        url.searchParams.set(key, String(value));
      }
    });

    const safeUrl = `${url.origin}${url.pathname}`;
    log.info(`Исходящий запрос: GET ${safeUrl} | params: lat=${searchParams.latitude}, lon=${searchParams.longitude}`);

    try {
      const response = await fetch(url);
      log.info(`Ответ Open-Meteo: HTTP ${response.status} (${base})`);

      if (!response.ok) {
        lastError = new Error(`Open-Meteo ${response.status} (${base})`);
        log.warn(`Сбой запроса к ${base}: HTTP ${response.status}`);
        continue;
      }

      return response.json();
    } catch (error) {
      lastError = error;
      log.error(`Ошибка сети при обращении к ${base}`, error);
    }
  }

  const fatal = lastError || new Error("Open-Meteo request failed");
  log.error("Все точки доступа Open-Meteo недоступны", fatal);
  throw fatal;
}

module.exports = { fetchOpenMeteo };
