const weatherState = (() => {
  let favoriteCities = [];

  async function loadFavorites() {
    try {
      const response = await fetch("/api/favorites");
      if (!response.ok) {
        return favoriteCities;
      }

      const data = await response.json();
      favoriteCities = Array.isArray(data) ? data : [];
    } catch {
      /* сервер недоступен — оставляем текущий кэш */
    }

    return favoriteCities;
  }

  function getCurrentFavorites() {
    return favoriteCities;
  }

  async function addCity(city) {
    const cityName = city.trim();
    if (!cityName) {
      return favoriteCities;
    }

    const response = await fetch("/api/favorites", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ city: cityName })
    });

    if (!response.ok) {
      throw new Error("Не удалось сохранить город в избранное.");
    }

    favoriteCities = await response.json();
    return favoriteCities;
  }

  async function removeCity(city) {
    const cityName = encodeURIComponent(city.trim());
    const response = await fetch(`/api/favorites?city=${cityName}`, {
      method: "DELETE"
    });

    if (!response.ok) {
      throw new Error("Не удалось удалить город из избранного.");
    }

    favoriteCities = await response.json();
    return favoriteCities;
  }

  return {
    loadFavorites,
    addCity,
    removeCity,
    getCurrentFavorites
  };
})();

window.weatherState = weatherState;
