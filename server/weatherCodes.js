const WEATHER_BY_CODE = {
  0: { main: "Clear", description: "Ясно", icon: "☀️" },
  1: { main: "Clear", description: "Преимущественно ясно", icon: "🌤️" },
  2: { main: "Clouds", description: "Переменная облачность", icon: "⛅" },
  3: { main: "Clouds", description: "Пасмурно", icon: "☁️" },
  45: { main: "Mist", description: "Туман", icon: "🌫️" },
  48: { main: "Mist", description: "Изморозь", icon: "🌫️" },
  51: { main: "Drizzle", description: "Морось", icon: "🌦️" },
  53: { main: "Drizzle", description: "Морось", icon: "🌦️" },
  55: { main: "Drizzle", description: "Сильная морось", icon: "🌧️" },
  56: { main: "Drizzle", description: "Ледяная морось", icon: "🌧️" },
  57: { main: "Drizzle", description: "Сильная ледяная морось", icon: "🌧️" },
  61: { main: "Rain", description: "Небольшой дождь", icon: "🌧️" },
  63: { main: "Rain", description: "Дождь", icon: "🌧️" },
  65: { main: "Rain", description: "Сильный дождь", icon: "🌧️" },
  66: { main: "Rain", description: "Ледяной дождь", icon: "🌧️" },
  67: { main: "Rain", description: "Сильный ледяной дождь", icon: "🌧️" },
  71: { main: "Snow", description: "Небольшой снег", icon: "🌨️" },
  73: { main: "Snow", description: "Снег", icon: "❄️" },
  75: { main: "Snow", description: "Сильный снег", icon: "❄️" },
  77: { main: "Snow", description: "Снежная крупа", icon: "❄️" },
  80: { main: "Rain", description: "Ливень", icon: "🌦️" },
  81: { main: "Rain", description: "Ливень", icon: "🌧️" },
  82: { main: "Rain", description: "Сильный ливень", icon: "⛈️" },
  85: { main: "Snow", description: "Снегопад", icon: "🌨️" },
  86: { main: "Snow", description: "Сильный снегопад", icon: "🌨️" },
  95: { main: "Thunderstorm", description: "Гроза", icon: "⛈️" },
  96: { main: "Thunderstorm", description: "Гроза с градом", icon: "⛈️" },
  99: { main: "Thunderstorm", description: "Сильная гроза с градом", icon: "⛈️" }
};

function mapWeatherCode(code, isDay = true) {
  const entry = WEATHER_BY_CODE[code] || {
    main: "Clouds",
    description: "Переменная погода",
    icon: isDay ? "🌤️" : "🌙"
  };

  return {
    id: code,
    main: entry.main,
    description: entry.description,
    icon: entry.icon
  };
}

module.exports = { mapWeatherCode };
