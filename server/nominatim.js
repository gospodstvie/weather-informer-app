const NOMINATIM_BASE = "https://nominatim.openstreetmap.org";
const USER_AGENT = "weather-informer-app/1.0 (educational)";

async function geocodeCity(city) {
  const url = new URL(`${NOMINATIM_BASE}/search`);
  url.searchParams.set("q", city);
  url.searchParams.set("format", "json");
  url.searchParams.set("limit", "1");
  url.searchParams.set("accept-language", "ru");

  const response = await fetch(url, {
    headers: { "User-Agent": USER_AGENT }
  });

  if (!response.ok) {
    const error = new Error("Nominatim request failed");
    error.statusCode = response.status;
    throw error;
  }

  const results = await response.json();
  if (!Array.isArray(results) || results.length === 0) {
    const error = new Error("Город не найден");
    error.statusCode = 404;
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

  return {
    name: String(name).trim(),
    lat: Number(place.lat),
    lon: Number(place.lon),
    displayName: place.display_name
  };
}

module.exports = { geocodeCity };
