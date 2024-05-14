

const apiKey = '8406bafca0a500fbd3ab63d761a4a460';
const apiUrl = `https://api.openweathermap.org/data/2.5/forecast?q=`;
const weatherIcon = document.querySelector(".weather-icon");

const searchbox = document.querySelector(".search input");
const searchBtn = document.querySelector(".search button");
const prevForecastBtn = document.getElementById("prevDay");
const nextForecastBtn = document.getElementById("nextDay");

let forecasts = []; // Store the forecasts data
let currentIndex = 0; // Current forecast index
let currentCity = ""; // Store the current city name

async function checkWeather(city) {
    const response = await fetch(`${apiUrl}${city}&appid=${apiKey}&units=metric`);

    if (response.status === 404) {
        document.querySelector(".error").style.display = "block";
        document.querySelector(".weather").style.display = "none";
    } else {
        document.querySelector(".error").style.display = "none";

        const data = await response.json();
        currentCity = data.city.name; // Save the city name globally
        // Remove filtering to keep all forecasts
        forecasts = data.list; // Keep all forecasts as provided by the API
        currentIndex = 0; // Reset to the first forecast
        updateUI();
    }
}

function updateUI() {
    if (forecasts.length > 0 && currentIndex < forecasts.length) {
        const forecast = forecasts[currentIndex];
        // Convert dt to a Date object
        const forecastDate = new Date(forecast.dt * 1000);
        // Format date and time
        const dayOfWeek = forecastDate.toLocaleDateString('en-US', { weekday: 'long' });
        const time = forecastDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

        console.log(`Forecast for: ${dayOfWeek}, Time: ${time}`); // Log the day and time of the forecast

        document.querySelector(".time").innerHTML = `${dayOfWeek}`;
        document.querySelector(".day").innerHTML = `${time}`;
        document.querySelector(".city").innerHTML = `${currentCity}`;
        document.querySelector(".temp").innerHTML = `${Math.round(forecast.main.temp)}°c`;
        document.querySelector(".humidity").innerHTML = `${forecast.main.humidity}%`;
        document.querySelector(".wind").innerHTML = `${forecast.wind.speed} km/h`;
        const weatherMain = forecast.weather[0].main;
        weatherIcon.src = `weatherimages/${weatherMain}.png`;
        document.querySelector(".weather").style.display = "block";
    }
}

function showNextForecast() {
    const currentTime = forecasts[currentIndex].dt_txt.split(' ')[1]; // Get the current time
    const nextDayForecasts = forecasts.filter(forecast => forecast.dt_txt.includes(getNextDayDate())); // Filter forecasts for the next day
    const nextDayIndex = nextDayForecasts.findIndex(forecast => forecast.dt_txt.includes(currentTime)); // Find the index of the current time in the next day's forecasts

    if (nextDayIndex !== -1) { // If the current time exists in the next day's forecasts
        currentIndex = forecasts.indexOf(nextDayForecasts[nextDayIndex]); // Set the current index to the corresponding forecast index
        updateUI();
    }
}

function showPrevForecast() {
    const currentTime = forecasts[currentIndex].dt_txt.split(' ')[1]; // Get the current time
    const prevDayForecasts = forecasts.filter(forecast => forecast.dt_txt.includes(getPrevDayDate())); // Filter forecasts for the previous day
    const prevDayIndex = prevDayForecasts.findIndex(forecast => forecast.dt_txt.includes(currentTime)); // Find the index of the current time in the previous day's forecasts

    if (prevDayIndex !== -1) { // If the current time exists in the previous day's forecasts
        currentIndex = forecasts.indexOf(prevDayForecasts[prevDayIndex]); // Set the current index to the corresponding forecast index
        updateUI();
    }
}

function getNextDayDate() {
    const currentDate = new Date(forecasts[currentIndex].dt_txt.split(' ')[0]);
    let nextDayIndex = currentIndex + 1;
    
    while (nextDayIndex < forecasts.length) {
        const nextDate = new Date(forecasts[nextDayIndex].dt_txt.split(' ')[0]);
        if (nextDate.getDate() !== currentDate.getDate()) {
            return nextDate.toISOString().split('T')[0];
        }
        nextDayIndex++;
    }
    
    // If no next day is found, return the current date
    return currentDate.toISOString().split('T')[0];
}

// Function to get the date string for the previous day
function getPrevDayDate() {
    const currentDate = new Date(forecasts[currentIndex].dt_txt.split(' ')[0]);
    const prevDay = new Date(currentDate);
    prevDay.setDate(currentDate.getDate() - 1);
    return prevDay.toISOString().split('T')[0];
}


searchBtn.addEventListener("click", () => {
    checkWeather(searchbox.value.trim());
});

function showNextTime() {
    const currentDate = forecasts[currentIndex].dt_txt.split(' ')[0];
    for (let i = currentIndex + 1; i < forecasts.length; i++) {
        if (forecasts[i].dt_txt.split(' ')[0] === currentDate) {
            currentIndex = i;
            updateUI();
            break;
        }
    }
}

function showPrevTime() {
    const currentDate = forecasts[currentIndex].dt_txt.split(' ')[0];
    for (let i = currentIndex - 1; i >= 0; i--) {
        if (forecasts[i].dt_txt.split(' ')[0] === currentDate) {
            currentIndex = i;
            updateUI();
            break;
        }
    }
}


// Add event listeners for the new time navigation buttons
document.getElementById("prevTime").addEventListener("click", showPrevTime);
document.getElementById("nextTime").addEventListener("click", showNextTime);


prevForecastBtn && prevForecastBtn.addEventListener("click", showPrevForecast);
nextForecastBtn && nextForecastBtn.addEventListener("click", showNextForecast);
