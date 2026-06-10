const WEATHER_BY_CODE = {
  0: { main: "Clear", description: "Ясно", icon: "clear" },
  1: { main: "Clear", description: "Преимущественно ясно", icon: "partly-clear" },
  2: { main: "Clouds", description: "Переменная облачность", icon: "partly-cloudy" },
  3: { main: "Clouds", description: "Пасмурно", icon: "overcast" },
  45: { main: "Mist", description: "Туман", icon: "fog" },
  48: { main: "Mist", description: "Изморозь", icon: "fog" },
  51: { main: "Drizzle", description: "Морось", icon: "drizzle" },
  53: { main: "Drizzle", description: "Морось", icon: "drizzle" },
  55: { main: "Drizzle", description: "Сильная морось", icon: "drizzle" },
  56: { main: "Drizzle", description: "Ледяная морось", icon: "drizzle" },
  57: { main: "Drizzle", description: "Сильная ледяная морось", icon: "drizzle" },
  61: { main: "Rain", description: "Небольшой дождь", icon: "rain" },
  63: { main: "Rain", description: "Дождь", icon: "rain" },
  65: { main: "Rain", description: "Сильный дождь", icon: "heavy-rain" },
  66: { main: "Rain", description: "Ледяной дождь", icon: "rain" },
  67: { main: "Rain", description: "Сильный ледяной дождь", icon: "heavy-rain" },
  71: { main: "Snow", description: "Небольшой снег", icon: "snow" },
  73: { main: "Snow", description: "Снег", icon: "snow" },
  75: { main: "Snow", description: "Сильный снег", icon: "snow" },
  77: { main: "Snow", description: "Снежная крупа", icon: "snow" },
  80: { main: "Rain", description: "Ливень", icon: "rain" },
  81: { main: "Rain", description: "Ливень", icon: "heavy-rain" },
  82: { main: "Rain", description: "Сильный ливень", icon: "heavy-rain" },
  85: { main: "Snow", description: "Снегопад", icon: "snow" },
  86: { main: "Snow", description: "Сильный снегопад", icon: "snow" },
  95: { main: "Thunderstorm", description: "Гроза", icon: "thunder" },
  96: { main: "Thunderstorm", description: "Гроза с градом", icon: "thunder" },
  99: { main: "Thunderstorm", description: "Сильная гроза с градом", icon: "thunder" }
};

function mapWeatherCode(code, isDay = true) {
  const entry = WEATHER_BY_CODE[code] || {
    main: "Clouds",
    description: "Переменная погода",
    icon: isDay ? "partly-cloudy" : "night"
  };

  let icon = entry.icon;
  if (!isDay && entry.icon === "clear") {
    icon = "night";
  }

  return {
    id: code,
    main: entry.main,
    description: entry.description,
    icon
  };
}

module.exports = { mapWeatherCode };
