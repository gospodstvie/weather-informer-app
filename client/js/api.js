const weatherApi = (() => {
  const WEATHER_BASE_URL = "/api/weather";
  const FORECAST_BASE_URL = "/api/forecast";

  async function fetchWeather(city) {
    const url = `${WEATHER_BASE_URL}?q=${encodeURIComponent(city)}`;
    const response = await fetch(url);

    if (!response.ok) {
      const payload = await response.json().catch(() => ({}));
      if (response.status === 404) {
        throw new Error(
          payload.message || "Город не найден. Проверьте название и попробуйте снова."
        );
      }
      throw new Error(payload.message || "Не удалось получить данные о погоде. Попробуйте позже.");
    }

    return response.json();
  }

  async function fetchForecast(lat, lon) {
    const url = `${FORECAST_BASE_URL}?lat=${encodeURIComponent(lat)}&lon=${encodeURIComponent(lon)}`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error("Не удалось получить прогноз. Попробуйте позже.");
    }

    return response.json();
  }

  async function fetchWeatherBundle(city) {
    const weatherData = await fetchWeather(city);
    const forecastData = await fetchForecast(weatherData.coord.lat, weatherData.coord.lon);

    return {
      weatherData,
      forecastData,
      uvIndex: weatherData.uvi ?? null
    };
  }

  return {
    fetchWeather,
    fetchForecast,
    fetchWeatherBundle
  };
})();

window.weatherApi = weatherApi;
