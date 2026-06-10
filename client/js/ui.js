const weatherUi = (() => {
  function iconVariant(data) {
    return data?.is_day === 0 ? "night" : "day";
  }

  function renderIconHtml(iconKey, description, options = {}) {
    if (window.weatherIcons?.render) {
      return window.weatherIcons.render(iconKey || "partly-cloudy", description, options);
    }
    return "🌤️";
  }

  function createWeatherCard(data, type, timezoneOffsetSeconds = 0) {
    const weather = data.weather[0];
    const iconHtml = renderIconHtml(weather.icon, weather.description, {
      size: 52,
      variant: iconVariant(data)
    });
    const tempRounded = Math.round(data.main.temp);
    const dateLabel = formatDateLabel(data.dt, type, timezoneOffsetSeconds);
    const popPercent = Math.round((data.pop || 0) * 100);
    const windSpeed = data.wind?.speed != null ? `${Math.round(data.wind.speed)} км/ч` : "—";

    const metaBlock =
      type === "hourly"
        ? `<p class="forecast-meta">${popPercent}% · ${windSpeed}</p>`
        : `<p class="forecast-meta">${popPercent}% осадков</p>`;

    const nightClass = data.is_day === 0 ? " forecast-item-night" : "";

    return `
      <article class="forecast-item forecast-item-${type}${nightClass}">
        <p class="forecast-time">${dateLabel}</p>
        <span class="forecast-icon" role="img" aria-label="${weather.description}">${iconHtml}</span>
        <p class="forecast-temp">${tempRounded}°</p>
        <p class="forecast-desc">${weather.description}</p>
        ${metaBlock}
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
      <div class="metric-item"><span class="metric-icon">🌡️</span><span>Ощущается</span><strong>${feelsLike}°</strong></div>
      <div class="metric-item"><span class="metric-icon">💧</span><span>Влажность</span><strong>${humidity ?? "—"}%</strong></div>
      <div class="metric-item"><span class="metric-icon">💨</span><span>Ветер</span><strong>${windSpeed}</strong></div>
      <div class="metric-item"><span class="metric-icon">☀️</span><span>UV</span><strong>${uvLabel}</strong></div>
      <div class="metric-item"><span class="metric-icon">📊</span><span>Давление</span><strong>${pressureHpa}</strong></div>
      <div class="metric-item"><span class="metric-icon">🌅</span><span>Восход</span><strong>${sunrise}</strong></div>
      <div class="metric-item"><span class="metric-icon">🌇</span><span>Закат</span><strong>${sunset}</strong></div>
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
    const isNightByIsDay = timeData?.is_day === 0;
    const isNight = hasValidTimeData ? isNightBySunTime : isNightByIsDay;
    document.body.classList.add(isNight ? "theme-night" : "theme-day");
  }

  function renderFavoriteCities(favoriteCities, container, onCityClick, onRemoveClick) {
    if (!favoriteCities.length) {
      container.innerHTML = "";
      return;
    }

    container.innerHTML = favoriteCities
      .map(
        (city) => `
          <button class="chip chip-city" data-city="${city}" type="button">
            ${city}
            <span class="chip-remove" data-remove="${city}" aria-label="Удалить ${city}" role="button">×</span>
          </button>
        `
      )
      .join("");

    container.querySelectorAll(".chip-city").forEach((button) => {
      button.addEventListener("click", (event) => {
        if (event.target.closest("[data-remove]")) {
          return;
        }
        onCityClick(button.dataset.city);
      });
    });

    container.querySelectorAll("[data-remove]").forEach((button) => {
      button.addEventListener("click", (event) => {
        event.stopPropagation();
        onRemoveClick(button.dataset.remove);
      });
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

    const styles = getComputedStyle(document.body);
    const lineColor = styles.getPropertyValue("--chart-line").trim() || "#f97316";
    const fillColor = styles.getPropertyValue("--chart-fill").trim() || "rgba(249,115,22,0.2)";
    const gridColor = styles.getPropertyValue("--chart-grid").trim() || "rgba(30,41,59,0.08)";
    const tickColor = styles.getPropertyValue("--text-secondary").trim() || "#64748b";

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
            borderColor: lineColor,
            backgroundColor: fillColor,
            fill: true,
            tension: 0.4,
            pointRadius: 4,
            pointBackgroundColor: lineColor,
            pointBorderColor: "#fff",
            pointBorderWidth: 2
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false }
        },
        scales: {
          x: {
            ticks: { color: tickColor, maxTicksLimit: 8 },
            grid: { color: gridColor }
          },
          y: {
            ticks: {
              color: tickColor,
              callback(value) {
                return `${value}°`;
              }
            },
            grid: { color: gridColor }
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

  function formatCityDateTime(unixSeconds, timezoneOffsetSeconds = 0) {
    const date = toCityDate(unixSeconds, timezoneOffsetSeconds);
    const datePart = date.toLocaleDateString("ru-RU", {
      weekday: "long",
      day: "numeric",
      month: "long"
    });
    const timePart = date.toLocaleTimeString("ru-RU", {
      hour: "2-digit",
      minute: "2-digit"
    });
    return `${datePart} — ${timePart}`;
  }

  return {
    createWeatherCard,
    renderHourlyForecast,
    renderFiveDayForecast,
    renderCurrentMetrics,
    applyDynamicThemeByIconAndTime,
    renderFavoriteCities,
    renderCharts,
    formatCityDateTime
  };
})();

window.weatherUi = weatherUi;
