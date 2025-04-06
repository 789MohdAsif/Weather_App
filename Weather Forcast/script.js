// 🌤️ DOM elements
const cityInput = document.querySelector('.City-input');
const searchBtn = document.querySelector('.search-btn');

const weatherInfo = document.querySelector('.weather-info');
const notFoundSection = document.querySelector('.not-found');
const searchCity = document.querySelector('.search-city');

const countryTxt = document.querySelector('.country-txt');
const tempTxt = document.querySelector('.temp-text');
const conditionTxt = document.querySelector('.condition-txt');
const humidityTxt = document.querySelector('.humidity-value-txt');
const windTxt = document.querySelectorAll('.wind-value-txt')[0];
const weatherSummaryImg = document.querySelector('.weather-summary-img');
const currentDate = document.querySelector('.current-date-txt');
const forecastContainer = document.querySelector('.forecast-items-container');

// 🗝️ API key (OpenWeatherMap)
const apiKey = '17bc1a338e4fa4e2401c4c89ed5db84d';

// 🎯 Event Listeners for manual city search
searchBtn.addEventListener('click', () => {
  if (cityInput.value.trim() !== '') {
    updateWeatherByCity(cityInput.value.trim());
    cityInput.value = '';
    cityInput.blur();
  }
});

cityInput.addEventListener('keydown', (event) => {
  if (event.key === 'Enter' && cityInput.value.trim() !== '') {
    updateWeatherByCity(cityInput.value.trim());
    cityInput.value = '';
    cityInput.blur();
  }
});

// 🌍 Try to get user's current location on page load
window.addEventListener('load', () => {
  if ('geolocation' in navigator) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        updateWeatherByCoords(latitude, longitude);
      },
      (error) => {
        console.warn("Geolocation blocked or failed, showing search UI.");
        showDisplaySection(searchCity);
      }
    );
  } else {
    console.warn("Geolocation not supported.");
    showDisplaySection(searchCity);
  }
});

// 📦 Fetch API data (for city or coordinates)
async function getFetchData(endpoint, query) {
  const apiUrl = `https://api.openweathermap.org/data/2.5/${endpoint}?${query}&appid=${apiKey}&units=metric`;
  const response = await fetch(apiUrl);
  return response.json();
}

// 🔄 Update UI by city name (used when user searches)
async function updateWeatherByCity(city) {
  const weatherData = await getFetchData('weather', `q=${city}`);
  const forecastData = await getFetchData('forecast', `q=${city}`);

  if (weatherData.cod != 200 || forecastData.cod != "200") {
    showDisplaySection(notFoundSection);
    return;
  }

  updateWeatherUI(weatherData, forecastData);
}

// 📍 Update UI using coordinates (used by GPS)
async function updateWeatherByCoords(lat, lon) {
  const weatherData = await getFetchData('weather', `lat=${lat}&lon=${lon}`);
  const forecastData = await getFetchData('forecast', `lat=${lat}&lon=${lon}`);

  if (weatherData.cod != 200 || forecastData.cod != "200") {
    showDisplaySection(notFoundSection);
    return;
  }

  updateWeatherUI(weatherData, forecastData);
}

// 🌐 Shared function to update UI with weather + forecast
function updateWeatherUI(weatherData, forecastData) {
  const {
    name: city,
    main: { temp, humidity },
    weather,
    wind: { speed },
    sys: { country: countryCode },
  } = weatherData;

  const icon = getWeatherIcon(weather[0].main);
  const date = new Date();
  const formattedDate = `${date.toLocaleDateString('en-US', {
    weekday: 'short',
  })}, ${date.getDate()} ${date.toLocaleDateString('en-US', {
    month: 'long',
  })}`;

  // 🌡️ Weather details
  countryTxt.textContent = `${city}, ${countryCode}`;
  tempTxt.textContent = `${temp.toFixed(1)} °C`; // More accurate decimal
  conditionTxt.textContent = weather[0].main;
  humidityTxt.textContent = `${humidity}%`;
  windTxt.textContent = `${speed} m/s`;
  weatherSummaryImg.src = `assets/weather/${icon}.svg`;
  currentDate.textContent = formattedDate;

  updateForecast(forecastData.list);
  showDisplaySection(weatherInfo);
}

// 🔮 Update 5-day forecast
function updateForecast(forecastList) {
  // We pick only 12:00 PM items for daily forecast
  const dailyForecast = forecastList.filter(item =>
    item.dt_txt.includes("12:00:00")
  ).slice(0, 5);

  forecastContainer.innerHTML = '';

  dailyForecast.forEach(day => {
    const date = new Date(day.dt_txt);
    const formattedDate = `${date.getDate()} ${date.toLocaleString('en-US', { month: 'short' })}`;
    const icon = getWeatherIcon(day.weather[0].main);
    const temp = `${Math.round(day.main.temp)} °C`;

    forecastContainer.innerHTML += `
      <div class="forecast-item">
        <h5 class="forecast-item-date regular-txt">${formattedDate}</h5>
        <img src="assets/weather/${icon}.svg" alt="${day.weather[0].main}" class="forecast-item-img">
        <h5 class="forecast-item-temp">${temp}</h5>
      </div>
    `;
  });
}

// 🖼️ Get appropriate icon for weather condition
function getWeatherIcon(condition) {
  const icons = {
    Clear: 'clear',
    Clouds: 'clouds',
    Rain: 'rain',
    Drizzle: 'drizzle',
    Thunderstorm: 'thunderstorm',
    Snow: 'snow',
    Mist: 'mist',
    Haze: 'haze',
    Smoke: 'smoke',
    Dust: 'dust',
    Fog: 'fog',
    Sand: 'sand',
    Ash: 'ash',
    Squall: 'squall',
    Tornado: 'tornado',
  };

  return icons[condition] || 'clear'; // fallback
}

// 🎭 Toggle between sections (only show one)
function showDisplaySection(sectionToShow) {
  [weatherInfo, notFoundSection, searchCity].forEach(section => {
    section.style.display = 'none';
  });

  sectionToShow.style.display = 'flex';
}
