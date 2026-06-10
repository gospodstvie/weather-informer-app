const fs = require("fs");
const path = require("path");

const DATA_DIR = path.join(__dirname, "..", "data");
const UPLOADS_DIR = path.join(DATA_DIR, "uploads");
const FAVORITES_FILE = path.join(DATA_DIR, "favorites.json");

function ensureDataLayout() {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
  if (!fs.existsSync(FAVORITES_FILE)) {
    fs.writeFileSync(FAVORITES_FILE, "[]\n", "utf8");
  }
}

function readFavorites() {
  ensureDataLayout();
  try {
    const raw = fs.readFileSync(FAVORITES_FILE, "utf8");
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeFavorites(cities) {
  ensureDataLayout();
  const normalized = cities
    .map((city) => String(city).trim())
    .filter(Boolean);
  fs.writeFileSync(FAVORITES_FILE, `${JSON.stringify(normalized, null, 2)}\n`, "utf8");
  return normalized;
}

function addFavorite(city) {
  const cityName = String(city).trim();
  if (!cityName) {
    return readFavorites();
  }

  const favorites = readFavorites();
  const exists = favorites.some((item) => item.toLowerCase() === cityName.toLowerCase());
  if (!exists) {
    favorites.push(cityName);
    writeFavorites(favorites);
  }
  return favorites;
}

function removeFavorite(city) {
  const cityName = String(city).trim().toLowerCase();
  const favorites = readFavorites().filter((item) => item.toLowerCase() !== cityName);
  writeFavorites(favorites);
  return favorites;
}

module.exports = {
  DATA_DIR,
  UPLOADS_DIR,
  FAVORITES_FILE,
  ensureDataLayout,
  readFavorites,
  writeFavorites,
  addFavorite,
  removeFavorite
};
