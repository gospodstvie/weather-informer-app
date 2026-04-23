const API_KEY = "45d69cf7f72aa1539c5d5b6373418997";
const BASE_URL = "https://api.openweathermap.org/data/2.5/weather";

const form = document.getElementById("weather-form");
const cityInput = document.getElementById("city-input");
const statusMessage = document.getElementById("status-message");
const resultBlock = document.getElementById("weather-result");
const cityName = document.getElementById("city-name");
const weatherIcon = document.getElementById("weather-icon");
const temperature = document.getElementById("temperature");
const description = document.getElementById("description");

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
    const weatherData = await fetchWeather(city);
    renderWeather(weatherData);
    showStatus("");
  } catch (error) {
    showStatus(error.message);
    resetTheme();
  }
});

async function fetchWeather(city) {
  const url = `${BASE_URL}?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=metric&lang=ru`;
  const response = await fetch(url);

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error("Город не найден. Проверьте название и попробуйте снова.");
    }
    throw new Error("Не удалось получить данные о погоде. Попробуйте позже.");
  }

  return response.json();
}

function renderWeather(data) {
  const weather = data.weather[0];
  const tempRounded = Math.round(data.main.temp);

  cityName.textContent = data.name;
  temperature.textContent = `${tempRounded}°C`;
  description.textContent = weather.description;

  const iconUrl = `https://openweathermap.org/img/wn/${weather.icon}@2x.png`;
  weatherIcon.src = iconUrl;
  weatherIcon.alt = weather.description;

  applyTheme(weather.main);
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
