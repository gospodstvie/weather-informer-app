const { mapWeatherCode } = require("./weatherCodes");

function localIsoToUnix(iso, utcOffsetSeconds) {
  const [datePart, timePart = "00:00"] = iso.split("T");
  const [year, month, day] = datePart.split("-").map(Number);
  const [hour, minute] = timePart.split(":").map(Number);
  const utcMs = Date.UTC(year, month - 1, day, hour, minute || 0) - utcOffsetSeconds * 1000;
  return Math.floor(utcMs / 1000);
}

function buildForecastItem({
  timeIso,
  temp,
  weatherCode,
  pop,
  visibility,
  windSpeed,
  utcOffsetSeconds,
  isDay
}) {
  const weather = mapWeatherCode(weatherCode, isDay);

  return {
    dt: localIsoToUnix(timeIso, utcOffsetSeconds),
    dt_txt: timeIso,
    main: { temp, feels_like: temp },
    weather: [weather],
    wind: { speed: windSpeed ?? 0 },
    pop: pop != null ? pop / 100 : 0,
    visibility: visibility != null ? Math.round(visibility * 1000) : null
  };
}

function normalizeCurrent(geo, meteo) {
  const current = meteo.current;
  const utcOffsetSeconds = meteo.utc_offset_seconds ?? 0;
  const weatherCode = current.weather_code;
  const isDay = current.is_day === 1;
  const weather = mapWeatherCode(weatherCode, isDay);
  const nowUnix = localIsoToUnix(current.time, utcOffsetSeconds);

  let sunrise = null;
  let sunset = null;
  if (meteo.daily?.sunrise?.[0] && meteo.daily?.sunset?.[0]) {
    sunrise = localIsoToUnix(meteo.daily.sunrise[0], utcOffsetSeconds);
    sunset = localIsoToUnix(meteo.daily.sunset[0], utcOffsetSeconds);
  }

  return {
    name: geo.name,
    coord: { lat: geo.lat, lon: geo.lon },
    timezone: utcOffsetSeconds,
    dt: nowUnix,
    main: {
      temp: current.temperature_2m,
      feels_like: current.apparent_temperature ?? current.temperature_2m,
      pressure: current.pressure_msl,
      humidity: current.relative_humidity_2m
    },
    weather: [weather],
    wind: {
      speed: current.wind_speed_10m ?? 0,
      deg: current.wind_direction_10m ?? null
    },
    visibility:
      meteo.hourly?.visibility?.[0] != null ? Math.round(meteo.hourly.visibility[0] * 1000) : null,
    sys: { sunrise, sunset },
    uvi: current.uv_index ?? null
  };
}

function normalizeForecast(meteo) {
  const utcOffsetSeconds = meteo.utc_offset_seconds ?? 0;
  const hourly = meteo.hourly || {};
  const times = hourly.time || [];
  const nowUnix = meteo.current
    ? localIsoToUnix(meteo.current.time, utcOffsetSeconds)
    : Math.floor(Date.now() / 1000);

  const list = times
    .map((timeIso, index) => {
      const itemUnix = localIsoToUnix(timeIso, utcOffsetSeconds);
      if (itemUnix < nowUnix) {
        return null;
      }

      return buildForecastItem({
        timeIso,
        temp: hourly.temperature_2m?.[index],
        weatherCode: hourly.weather_code?.[index] ?? 0,
        pop: hourly.precipitation_probability?.[index],
        visibility: hourly.visibility?.[index],
        windSpeed: hourly.wind_speed_10m?.[index],
        utcOffsetSeconds,
        isDay: true
      });
    })
    .filter(Boolean);

  const daily = meteo.daily || {};
  const dailyTimes = daily.time || [];
  const dailyList = dailyTimes.slice(0, 5).map((dateIso, index) =>
    buildForecastItem({
      timeIso: `${dateIso}T12:00`,
      temp:
        daily.temperature_2m_max?.[index] != null && daily.temperature_2m_min?.[index] != null
          ? (daily.temperature_2m_max[index] + daily.temperature_2m_min[index]) / 2
          : daily.temperature_2m_max?.[index],
      weatherCode: daily.weather_code?.[index] ?? 0,
      pop: daily.precipitation_probability_max?.[index],
      visibility: null,
      windSpeed: daily.wind_speed_10m_max?.[index],
      utcOffsetSeconds,
      isDay: true
    })
  );

  return {
    city: { timezone: utcOffsetSeconds, name: meteo.timezone },
    list,
    daily: dailyList
  };
}

module.exports = { normalizeCurrent, normalizeForecast, localIsoToUnix };
