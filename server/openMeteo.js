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

    try {
      const response = await fetch(url);
      if (!response.ok) {
        lastError = new Error(`Open-Meteo ${response.status} (${base})`);
        continue;
      }
      return response.json();
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError || new Error("Open-Meteo request failed");
}

module.exports = { fetchOpenMeteo };
