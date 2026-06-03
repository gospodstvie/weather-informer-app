const weatherUi = (() => {
  function createWeatherCard(data, type, timezoneOffsetSeconds = 0) {
    const weather = data.weather[0];
    const iconChar = weather.icon || "🌤️";
    const tempRounded = Math.round(data.main.temp);
    const dateLabel = formatDateLabel(data.dt, type, timezoneOffsetSeconds);
    const popPercent = Math.round((data.pop || 0) * 100);
    const visibilityKm = data.visibility ? (data.visibility / 1000).toFixed(1) : "—";
    const windSpeed = data.wind?.speed != null ? `${Math.round(data.wind.speed)} км/ч` : "—";

    return `
      <article class="forecast-item forecast-item-${type}">
        <p class="forecast-time">${dateLabel}</p>
        <span class="forecast-icon" role="img" aria-label="${weather.description}">${iconChar}</span>
        <p class="forecast-temp">${tempRounded}°C</p>
        <p class="forecast-desc">${weather.description}</p>
        <p class="forecast-meta">Осадки: ${popPercent}%</p>
        <p class="forecast-meta">Ветер: ${windSpeed}</p>
        <p class="forecast-meta">Видимость: ${visibilityKm} км</p>
      </article>
    `;
  }

  function renderHourlyForecast(forecastData, container) {
    const nowMs = Date.now();
    const maxMs = nowMs + 24 * 60 * 60 * 1000;
    const hourlyData = (forecastData.list || []).filter((item) => {
      const itemMs = item.dt * 1000;
      return itemMs >= nowMs && itemMs <= maxMs;
    });

    if (!hourlyData.length) {
      container.innerHTML = "<p class='empty-block'>Нет данных для почасового прогноза.</p>";
      return;
    }

    const timezoneOffsetSeconds = Number(forecastData?.city?.timezone) || 0;
    container.innerHTML = hourlyData
      .map((item) => createWeatherCard(item, "hourly", timezoneOffsetSeconds))
      .join("");
  }

  function renderFiveDayForecast(forecastData, container) {
    const timezoneOffsetSeconds = Number(forecastData?.city?.timezone) || 0;
    const dailyData =
      forecastData.daily?.length > 0
        ? forecastData.daily
        : pickDailyFromHourly(forecastData.list || [], timezoneOffsetSeconds);
    if (!dailyData.length) {
      container.innerHTML = "<p class='empty-block'>Нет данных для 5-дневного прогноза.</p>";
      return;
    }

    container.innerHTML = dailyData
      .map((item) => createWeatherCard(item, "daily", timezoneOffsetSeconds))
      .join("");
  }

  function renderCurrentMetrics(weatherData, uvIndex, container) {
    const pressureHpa = Math.round(weatherData.main.pressure);
    const humidity = weatherData.main.humidity;
    const feelsLike = Math.round(weatherData.main.feels_like ?? weatherData.main.temp);
    const windSpeed =
      weatherData.wind?.speed != null ? `${Math.round(weatherData.wind.speed)} км/ч` : "—";
    const timezoneOffsetSeconds = Number(weatherData.timezone) || 0;
    const sunrise =
      weatherData.sys?.sunrise != null
        ? formatClock(weatherData.sys.sunrise, timezoneOffsetSeconds)
        : "—";
    const sunset =
      weatherData.sys?.sunset != null
        ? formatClock(weatherData.sys.sunset, timezoneOffsetSeconds)
        : "—";
    const uvLabel = uvIndex != null ? uvIndex.toFixed(1) : "—";

    container.innerHTML = `
      <div class="metric-item"><span>Ощущается:</span><strong>${feelsLike}°C</strong></div>
      <div class="metric-item"><span>Влажность:</span><strong>${humidity ?? "—"}%</strong></div>
      <div class="metric-item"><span>Ветер:</span><strong>${windSpeed}</strong></div>
      <div class="metric-item"><span>UV-индекс:</span><strong>${uvLabel}</strong></div>
      <div class="metric-item"><span>Давление:</span><strong>${pressureHpa} гПа</strong></div>
      <div class="metric-item"><span>Восход:</span><strong>${sunrise}</strong></div>
      <div class="metric-item"><span>Закат:</span><strong>${sunset}</strong></div>
    `;
  }

  function pickDailyFromHourly(hourlyList, timezoneOffsetSeconds) {
    const dailyMap = new Map();

    hourlyList.forEach((item) => {
      const dayKey = toCityDate(item.dt, timezoneOffsetSeconds).toLocaleDateString("ru-RU");
      if (!dailyMap.has(dayKey) && dailyMap.size < 5) {
        dailyMap.set(dayKey, item);
      }
    });

    return Array.from(dailyMap.values());
  }

  function applyDynamicThemeByIconAndTime(timeData) {
    document.body.classList.remove("theme-day", "theme-night");
    const nowUnixSeconds = Math.floor(Date.now() / 1000);
    const dt = Number(timeData?.dt) || nowUnixSeconds;
    const sunrise = Number(timeData?.sunrise);
    const sunset = Number(timeData?.sunset);

    const hasValidTimeData =
      Number.isFinite(dt) &&
      Number.isFinite(sunrise) &&
      Number.isFinite(sunset) &&
      sunrise < sunset;

    const isNightBySunTime = hasValidTimeData ? dt < sunrise || dt >= sunset : false;
    document.body.classList.add(isNightBySunTime ? "theme-night" : "theme-day");
  }

  function renderFavoriteCities(favoriteCities, container, onCityClick, onRemoveClick) {
    if (!favoriteCities.length) {
      container.innerHTML = "<p class='empty-block'>Избранных городов пока нет.</p>";
      return;
    }

    container.innerHTML = favoriteCities
      .map(
        (city) => `
          <div class="favorite-city-item">
            <button class="favorite-city-open" data-city="${city}" type="button">${city}</button>
            <button class="favorite-city-remove" data-city="${city}" aria-label="Удалить ${city}" type="button">✕</button>
          </div>
        `
      )
      .join("");

    container.querySelectorAll(".favorite-city-open").forEach((button) => {
      button.addEventListener("click", () => onCityClick(button.dataset.city));
    });

    container.querySelectorAll(".favorite-city-remove").forEach((button) => {
      button.addEventListener("click", () => onRemoveClick(button.dataset.city));
    });
  }

  function renderCharts(forecastData, canvasElement) {
    if (!window.Chart || !canvasElement) {
      return;
    }

    const nowMs = Date.now();
    const maxMs = nowMs + 24 * 60 * 60 * 1000;
    const next24Items = (forecastData.list || []).filter((item) => {
      const itemMs = item.dt * 1000;
      return itemMs >= nowMs && itemMs <= maxMs;
    });

    const timezoneOffsetSeconds = Number(forecastData?.city?.timezone) || 0;
    const labels = next24Items.map((item) => formatClock(item.dt, timezoneOffsetSeconds));
    const tempData = next24Items.map((item) => Math.round(item.main.temp));

    const existingChart = window.__weatherTempChart;
    if (existingChart) {
      existingChart.destroy();
    }

    window.__weatherTempChart = new window.Chart(canvasElement, {
      type: "line",
      data: {
        labels,
        datasets: [
          {
            label: "Температура (24 часа)",
            data: tempData,
            borderColor: "rgba(255, 255, 255, 0.95)",
            backgroundColor: "rgba(255, 255, 255, 0.25)",
            fill: true,
            tension: 0.35,
            pointRadius: 3
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            labels: {
              color: "#f5f8ff"
            }
          }
        },
        scales: {
          x: {
            ticks: {
              color: "#f5f8ff"
            },
            grid: {
              color: "rgba(255, 255, 255, 0.2)"
            }
          },
          y: {
            ticks: {
              color: "#f5f8ff",
              callback(value) {
                return `${value}°`;
              }
            },
            grid: {
              color: "rgba(255, 255, 255, 0.2)"
            }
          }
        }
      }
    });
  }

  function formatDateLabel(dt, type, timezoneOffsetSeconds = 0) {
    const date = toCityDate(dt, timezoneOffsetSeconds);
    if (type === "hourly") {
      return date.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" });
    }

    return date.toLocaleDateString("ru-RU", {
      weekday: "short",
      day: "2-digit",
      month: "2-digit"
    });
  }

  function formatClock(unixSeconds, timezoneOffsetSeconds = 0) {
    return toCityDate(unixSeconds, timezoneOffsetSeconds).toLocaleTimeString("ru-RU", {
      hour: "2-digit",
      minute: "2-digit"
    });
  }

  function toCityDate(unixSeconds, timezoneOffsetSeconds = 0) {
    const utcMs = unixSeconds * 1000;
    const clientOffsetMs = new Date().getTimezoneOffset() * 60 * 1000;
    return new Date(utcMs + timezoneOffsetSeconds * 1000 + clientOffsetMs);
  }

  return {
    createWeatherCard,
    renderHourlyForecast,
    renderFiveDayForecast,
    renderCurrentMetrics,
    applyDynamicThemeByIconAndTime,
    renderFavoriteCities,
    renderCharts
  };
})();

window.weatherUi = weatherUi;
