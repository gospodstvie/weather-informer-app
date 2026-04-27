const weatherApi = (() => {
  const API_KEY = "45d69cf7f72aa1539c5d5b6373418997";
  const WEATHER_BASE_URL = "https://api.openweathermap.org/data/2.5/weather";
  const FORECAST_BASE_URL = "https://api.openweathermap.org/data/2.5/forecast";

  async function fetchWeather(city) {
    const url = `${WEATHER_BASE_URL}?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=metric&lang=ru`;
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
    const url = `${FORECAST_BASE_URL}?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=metric&lang=ru`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error("Не удалось получить прогноз. Попробуйте позже.");
    }

    const forecastData = await response.json();
    return normalizeForecast(forecastData);
  }

  async function fetchUvIndex() {
    return null;
  }

  async function fetchWeatherBundle(city) {
    const weatherData = await fetchWeather(city);
    const [forecastData, uvIndex] = await Promise.all([fetchForecast(city), fetchUvIndex()]);

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
