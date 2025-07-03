const inputData = document.getElementById("inputData");
const searchButton = document.getElementById("searchButton");
const weatherDataContainer = document.getElementById("weatherDataContainer");
const toggleUnitButton = document.getElementById("toggleUnitButton");
const currentLocationButton = document.getElementById("currentLocationButton");
const history = document.getElementById("history");

let unit = "metric"; // default unit

searchButton.addEventListener("click", () => {
    const city = inputData.value.trim();
    if (city) {
        fetchData(city);
        addToHistory(city);
    }
});

toggleUnitButton.addEventListener("click", () => {
    unit = unit === "metric" ? "imperial" : "metric";
    toggleUnitButton.textContent = unit === "metric" ? "🌡️ Switch to °F" : "🌡️ Switch to °C";

    const city = inputData.value.trim();
    if (city) {
        fetchData(city);
    } else {
        alert("Unit changed. Please search for a city to see changes.");
    }
});

currentLocationButton.addEventListener("click", () => {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(showWeatherByLocation, () => {
            alert("Location permission denied.");
        });
    } else {
        alert("Geolocation not supported.");
    }
});

async function showWeatherByLocation(position) {
    const lat = position.coords.latitude;
    const lon = position.coords.longitude;
    const apiKey = "a96163e503281b9aa1ee5db157136e65";

    const url = `https://api.openweathermap.org/geo/1.0/reverse?lat=${lat}&lon=${lon}&limit=1&appid=${apiKey}`;
    const response = await fetch(url);
    const data = await response.json();

    if (data.length > 0) {
        const city = data[0].name;
        inputData.value = city;
        fetchData(city);
        addToHistory(city);
    } else {
        alert("Could not determine city from location.");
    }
}

async function fetchData(city) {
    const apiKey = "a96163e503281b9aa1ee5db157136e65";
    const url = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=${unit}&appid=${apiKey}`;

    try {
        const response = await fetch(url);
        const data = await response.json();

        if (data.cod === "200") {
            displayWeather(data);
        } else {
            weatherDataContainer.innerHTML = `<h3 class="text-red-600 text-xl font-bold text-center">${data.message}</h3>`;
        }
    } catch (error) {
        console.error("Fetch Error:", error);
        weatherDataContainer.innerHTML = `<h3 class="text-red-600 text-xl font-bold text-center">Failed to fetch weather data</h3>`;
    }
}

function displayWeather(data) {
    weatherDataContainer.innerHTML = "";

    const cityName = data.city.name;
    const today = data.list[0];
    const tempUnit = unit === "metric" ? "°C" : "°F";

    const cityDetails = document.createElement("div");
    cityDetails.className = "bg-purple-300 text-black p-4 rounded shadow";

    const heading = document.createElement("h1");
    heading.textContent = `${cityName} (${new Date().toLocaleDateString()})`;
    heading.className = "text-2xl font-bold flex justify-between items-center";

    const icon = document.createElement("img");
    icon.src = `https://openweathermap.org/img/wn/${today.weather[0].icon}@2x.png`;
    icon.alt = "weather icon";
    icon.className = "w-12 h-12";

    const headerRow = document.createElement("div");
    headerRow.className = "flex justify-between items-center";
    headerRow.appendChild(heading);
    headerRow.appendChild(icon);
    cityDetails.appendChild(headerRow);

    cityDetails.innerHTML += `
    <p>🌡️ Temp: ${Math.round(today.main.temp)} ${tempUnit}</p>
    <p>💧 Humidity: ${today.main.humidity}%</p>
    <p>🌬️ Wind: ${today.wind.speed} m/s</p>
  `;

    weatherDataContainer.appendChild(cityDetails);

    const forecastHeading = document.createElement("h3");
    forecastHeading.textContent = "4-Day Forecast";
    forecastHeading.className = "text-xl font-semibold mt-4 ml-2";
    weatherDataContainer.appendChild(forecastHeading);

    const forecastContainer = document.createElement("div");
    forecastContainer.className = "grid grid-cols-2 md:grid-cols-4 gap-4";

    const forecastItems = data.list.filter(item => new Date(item.dt_txt).getHours() === 12).slice(1, 5);

    forecastItems.forEach(item => {
        const forecast = document.createElement("div");
        forecast.className = "bg-pink-200 p-3 rounded text-center shadow";

        forecast.innerHTML = `
      <h5 class="font-bold">${new Date(item.dt_txt).toLocaleDateString()}</h5>
      <img src="https://openweathermap.org/img/wn/${item.weather[0].icon}@2x.png" alt="icon" class="mx-auto"/>
      <p>Temp: ${Math.round(item.main.temp)} ${tempUnit}</p>
      <p>Humidity: ${item.main.humidity}%</p>
      <p>Wind: ${item.wind.speed} m/s</p>
    `;

        forecastContainer.appendChild(forecast);
    });

    weatherDataContainer.appendChild(forecastContainer);
}

function addToHistory(city) {
    const li = document.createElement("li");
    li.textContent = city;
    li.className = "text-[16px] bg-gray-200 p-2 rounded my-1 cursor-pointer hover:bg-gray-300";
    li.addEventListener("click", () => fetchData(city));
    history.appendChild(li);
}