import { useState } from 'react';

export const useWeather = () => {
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchWeather = async (cityName) => {
    setLoading(true);
    setError('');
    
    try {
 а
      const geoResponse = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(cityName)}&count=1&language=ru&format=json`
      );
      
      const geoData = await geoResponse.json();
      
      if (!geoData.results || geoData.results.length === 0) {
        throw new Error('Город не найден. Попробуйте другой запрос.');
      }
      
      const location = geoData.results[0];
      const { latitude, longitude, name, country } = location;
      
      
      const weatherResponse = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,pressure_msl,wind_speed_10m,wind_direction_10m,weather_code&timezone=auto&forecast_days=1`
      );
      
      const weatherData = await weatherResponse.json();
      
   
      const formattedData = {
        location: {
          name: name,
          country: country,
          latitude: latitude,
          longitude: longitude
        },
        current: {
          temp_c: Math.round(weatherData.current.temperature_2m),
          feelslike_c: Math.round(weatherData.current.apparent_temperature),
          humidity: weatherData.current.relative_humidity_2m,
          pressure_mb: weatherData.current.pressure_msl,
          wind_kph: Math.round(weatherData.current.wind_speed_10m * 3.6),
          wind_degree: weatherData.current.wind_direction_10m,
          condition: {
            text: getWeatherDescription(weatherData.current.weather_code),
            code: weatherData.current.weather_code
          },
          last_updated: new Date().toLocaleString('ru-RU')
        }
      };
      
      setWeatherData(formattedData);
    } catch (err) {
      setError(err.message);
      setWeatherData(null);
    } finally {
      setLoading(false);
    }
  };

  const getWeatherDescription = (code) => {
    const weatherCodes = {
      0: 'Ясно',
      1: 'Преимущественно ясно',
      2: 'Переменная облачность',
      3: 'Пасмурно',
      45: 'Туман',
      48: 'Туман с инеем',
      51: 'Лекая морось',
      53: 'Умеренная морось',
      55: 'Сильная морось',
      56: 'Ледяная морось',
      57: 'Сильная ледяная морось',
      61: 'Небольшой дождь',
      63: 'Умеренный дождь',
      65: 'Сильный дождь',
      66: 'Ледяной дождь',
      67: 'Сильный ледяной дождь',
      71: 'Небольшой снег',
      73: 'Умеренный снег',
      75: 'Сильный снег',
      77: 'Снежные зерна',
      80: 'Небольшие ливни',
      81: 'Умеренные ливни',
      82: 'Сильные ливни',
      85: 'Небольшие снегопады',
      86: 'Сильные снегопады',
      95: 'Гроза',
      96: 'Гроза с градом',
      99: 'Сильная гроза с градом'
    };
    return weatherCodes[code] || 'Неизвестно';
  };

  const getWeatherIcon = (code) => {
    const iconCodes = {
      0: '☀️',   
      1: '🌤️',   
      2: '⛅',   
      3: '☁️',   
      45: '🌫️',  
      48: '🌫️',  
      51: '🌧️',  
      53: '🌧️',  
      55: '🌧️',  
      61: '🌦️',  
      63: '🌧️',  
      65: '🌧️',  
      71: '🌨️',  
      73: '🌨️',  
      75: '🌨️',  
      80: '🌦️',  
      81: '🌧️', 
      82: '🌧️',  
      85: '🌨️', 
      86: '🌨️',  
      95: '⛈️',   
      96: '⛈️',   
      99: '⛈️'    
    };
    return iconCodes[code] || '🌈';
  };

  const getWindDirection = (degree) => {
    const directions = ['С', 'СВ', 'В', 'ЮВ', 'Ю', 'ЮЗ', 'З', 'СЗ'];
    return directions[Math.round(degree / 45) % 8] || '—';
  };

  const updateBackground = (weatherCode) => {

    document.body.className = '';
    

    if (weatherCode === 0) {
      document.body.classList.add('sunny');
    } else if (weatherCode >= 1 && weatherCode <= 3) {
      document.body.classList.add('cloudy');
    } else if (weatherCode >= 51 && weatherCode <= 67) {
      document.body.classList.add('rainy');
    } else if (weatherCode >= 71 && weatherCode <= 86) {
      document.body.classList.add('snowy');
    } else if (weatherCode >= 95 && weatherCode <= 99) {
      document.body.classList.add('stormy');
    } else if (weatherCode >= 45 && weatherCode <= 48) {
      document.body.classList.add('foggy');
    }
  };

  return {
    weatherData,
    loading,
    error,
    fetchWeather,
    getWeatherIcon,
    getWindDirection,
    updateBackground
  };
};