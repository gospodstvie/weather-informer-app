const form = document.getElementById("weather-form");
const cityInput = document.getElementById("city-input");
const statusMessage = document.getElementById("status-message");
const resultBlock = document.getElementById("weather-result");
const cityName = document.getElementById("city-name");
const weatherIcon = document.getElementById("weather-icon");
const temperature = document.getElementById("temperature");
const description = document.getElementById("description");
const weatherMetrics = document.getElementById("weather-metrics");
const hourlyForecast = document.getElementById("hourly-forecast");
const fiveDayForecast = document.getElementById("five-day-forecast");
const temperatureChart = document.getElementById("temperature-chart");
const addFavoriteButton = document.getElementById("add-favorite-button");
const favoritesList = document.getElementById("favorites-list");

let activeCity = "";

const weatherThemeMap = {
  Clear: "theme-clear",
  Rain: "theme-rain",
  Clouds: "theme-clouds",
  Snow: "theme-snow",
  Thunderstorm: "theme-thunderstorm",
  Drizzle: "theme-drizzle",
  Mist: "theme-mist",
  Smoke: "theme-mist",
  Haze: "theme-mist",
  Dust: "theme-mist",
  Fog: "theme-mist"
};

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const city = cityInput.value.trim();
  if (!city) {
    showStatus("Введите название города.");
    return;
  }

  showStatus("Загрузка прогноза...");
  resultBlock.classList.add("hidden");

  try {
    await loadWeatherByCity(city);
    showStatus("");
  } catch (error) {
    showStatus(error.message);
    resetTheme();
  }
});

if (addFavoriteButton) {
  addFavoriteButton.addEventListener("click", () => {
    if (!activeCity) {
      showStatus("Сначала получите прогноз для города.");
      return;
    }

    weatherState.addCity(activeCity);
    renderFavorites();
    showStatus(`Город ${activeCity} добавлен в избранное.`);
  });
}

renderFavorites();

async function fetchWeather(city) {
  if (window.weatherApi?.fetchWeather) {
    return window.weatherApi.fetchWeather(city);
  }

  const url = `/api/weather?q=${encodeURIComponent(city)}`;
  const response = await fetch(url);

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error("Город не найден. Проверьте название и попробуйте снова.");
    }
    throw new Error("Не удалось получить данные о погоде. Попробуйте позже.");
  }

  return response.json();
}

function renderWeather(data, uvIndex = null) {
  const weather = data.weather[0];
  const tempRounded = Math.round(data.main.temp);

  cityName.textContent = data.name;
  temperature.textContent = `${tempRounded}°C`;
  description.textContent = weather.description;

  const iconUrl = `https://openweathermap.org/img/wn/${weather.icon}@2x.png`;
  weatherIcon.src = iconUrl;
  weatherIcon.alt = weather.description;

  applyTheme(weather.main);
  if (window.weatherUi?.applyDynamicThemeByIconAndTime) {
    window.weatherUi.applyDynamicThemeByIconAndTime({
      dt: data.dt,
      sunrise: data.sys?.sunrise,
      sunset: data.sys?.sunset,
      timezone: data.timezone
    });
  }

  if (window.weatherUi?.renderCurrentMetrics && weatherMetrics) {
    window.weatherUi.renderCurrentMetrics(data, uvIndex, weatherMetrics);
  }

  resultBlock.classList.remove("hidden");
}

function showStatus(message) {
  statusMessage.textContent = message;
}

function applyTheme(weatherMain) {
  document.body.className = "";
  const nextTheme = weatherThemeMap[weatherMain] || "theme-default";
  document.body.classList.add(nextTheme);
}

function resetTheme() {
  document.body.className = "";
  document.body.classList.add("theme-default");
}

async function loadWeatherByCity(city) {
  activeCity = city;

  if (window.weatherApi?.fetchWeatherBundle) {
    const weatherBundle = await window.weatherApi.fetchWeatherBundle(city);
    renderWeather(weatherBundle.weatherData, weatherBundle.uvIndex);
    renderForecastBlocks(weatherBundle.forecastData);
    return;
  }

  const weatherData = await fetchWeather(city);
  renderWeather(weatherData);
}

function renderForecastBlocks(forecastData) {
  if (!window.weatherUi) {
    return;
  }

  if (hourlyForecast) {
    window.weatherUi.renderHourlyForecast(forecastData, hourlyForecast);
  }

  if (fiveDayForecast) {
    window.weatherUi.renderFiveDayForecast(forecastData, fiveDayForecast);
  }

  if (temperatureChart) {
    window.weatherUi.renderCharts(forecastData, temperatureChart);
  }
}

function renderFavorites() {
  if (!window.weatherUi || !window.weatherState || !favoritesList) {
    return;
  }

  const favoriteCities = window.weatherState.getCurrentFavorites();
  window.weatherUi.renderFavoriteCities(
    favoriteCities,
    favoritesList,
    (city) => {
      cityInput.value = city;
      showStatus("Загрузка прогноза...");
      resultBlock.classList.add("hidden");
      loadWeatherByCity(city)
        .then(() => {
          showStatus("");
        })
        .catch((error) => {
          showStatus(error.message);
          resetTheme();
        });
    },
    (city) => {
      window.weatherState.removeCity(city);
      renderFavorites();
    }
  );
}

