const weatherState = (() => {
  const FAVORITES_STORAGE_KEY = "favoriteCities";

  function getCurrentFavorites() {
    try {
      const savedData = localStorage.getItem(FAVORITES_STORAGE_KEY);
      if (!savedData) {
        return [];
      }

      const favoriteCities = JSON.parse(savedData);
      return Array.isArray(favoriteCities) ? favoriteCities : [];
    } catch (error) {
      return [];
    }
  }

  function saveFavorites(favoriteCities) {
    localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(favoriteCities));
  }

  function addCity(city) {
    const cityName = city.trim();
    if (!cityName) {
      return getCurrentFavorites();
    }

    const favoriteCities = getCurrentFavorites();
    const hasCity = favoriteCities.some(
      (savedCity) => savedCity.toLowerCase() === cityName.toLowerCase()
    );

    if (!hasCity) {
      favoriteCities.push(cityName);
      saveFavorites(favoriteCities);
    }

    return favoriteCities;
  }

  function removeCity(city) {
    const cityName = city.trim().toLowerCase();
    const favoriteCities = getCurrentFavorites().filter(
      (savedCity) => savedCity.toLowerCase() !== cityName
    );

    saveFavorites(favoriteCities);
    return favoriteCities;
  }

  return {
    addCity,
    removeCity,
    getCurrentFavorites
  };
})();

window.weatherState = weatherState;
