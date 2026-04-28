const weatherApi = (() => {
  const WEATHER_BASE_URL = "/api/weather";
  const FORECAST_BASE_URL = "/api/forecast";
  const UV_BASE_URL = "/api/uv";

  async function fetchWeather(city) {
    const url = `${WEATHER_BASE_URL}?q=${encodeURIComponent(city)}`;
    const response = await fetch(url);

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error("Город не найден. Проверьте название и попробуйте снова.");
      }
      throw new Error("Не удалось получить данные о погоде. Попробуйте позже.");
    }

    return response.json();
  }

  async function fetchForecast(city) {
    const url = `${FORECAST_BASE_URL}?q=${encodeURIComponent(city)}`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error("Не удалось получить прогноз. Попробуйте позже.");
    }

    const forecastData = await response.json();
    return normalizeForecast(forecastData);
  }

  async function fetchUvIndex(lat, lon) {
    const url = `${UV_BASE_URL}?lat=${encodeURIComponent(lat)}&lon=${encodeURIComponent(lon)}`;

    try {
      const response = await fetch(url);
      if (!response.ok) {
        return null;
      }

      const uvData = await response.json();
      return uvData?.uvi ?? null;
    } catch (error) {
      return null;
    }
  }

  async function fetchWeatherBundle(city) {
    const weatherData = await fetchWeather(city);
    const [forecastData, uvIndex] = await Promise.all([
      fetchForecast(city),
      fetchUvIndex(weatherData.coord.lat, weatherData.coord.lon)
    ]);

    return {
      weatherData,
      forecastData,
      uvIndex
    };
  }

  function normalizeForecast(forecastData) {
    const nextList = (forecastData.list || []).map((item) => ({
      dt: item.dt,
      dt_txt: item.dt_txt,
      main: item.main,
      weather: item.weather,
      wind: item.wind,
      pop: item.pop ?? 0,
      visibility: item.visibility ?? null
    }));

    return {
      ...forecastData,
      list: nextList
    };
  }

  return {
    fetchWeather,
    fetchForecast,
    fetchUvIndex,
    fetchWeatherBundle
  };
})();

window.weatherApi = weatherApi;

