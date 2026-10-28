(() => {
"use strict";
const WEATHER_API_KEY =
"e26177d74d65c1ddff24333770484a70";

const LAT = 44.96452; // Same Bustuchin location as the local map.
const LON = 23.72814;

async function loadWeather(){

  try{

    const currentResponse =
      await fetch(
`https://api.openweathermap.org/data/2.5/weather?lat=${LAT}&lon=${LON}&units=metric&lang=ro&appid=${WEATHER_API_KEY}`
      );

    const current =
      await currentResponse.json();
    if (!currentResponse.ok || !current.main || !current.weather?.length) throw new Error("Datele meteo nu sunt disponibile.");



    const currentContainer =
      document.getElementById("weatherCurrent");

    const updateTime = new Date().toLocaleTimeString("ro-RO", {
      hour: "2-digit",
      minute: "2-digit"
    });

    currentContainer.dataset.condition =
      current.weather[0].main.toLowerCase();


    currentContainer.innerHTML = `

      <div class="weather-current__main">

        <div class="weather-current__icon-wrap">
          <img
            class="weather-current__icon"
            src="https://openweathermap.org/img/wn/${current.weather[0].icon}@4x.png"
            alt="${current.weather[0].description}">
        </div>

        <div class="weather-current__reading">
          <span class="weather-current__label">Acum în Bustuchin</span>
          <div class="weather-current__temp">

            ${Math.round(current.main.temp)}°C

          </div>

          <div class="weather-current__desc">

            ${current.weather[0].description}

          </div>
          <span class="weather-current__updated">Actualizat la ${updateTime}</span>
        </div>

      </div>



      <div class="weather-current__details">

        <div class="weather-detail">

          <i class="fas fa-temperature-half"></i>
          <span class="weather-detail__label">
            Se simte ca
          </span>

          <span class="weather-detail__value">
            ${Math.round(current.main.feels_like)}°C
          </span>

        </div>



        <div class="weather-detail">

          <i class="fas fa-droplet"></i>
          <span class="weather-detail__label">
            Umiditate
          </span>

          <span class="weather-detail__value">
            ${current.main.humidity}%
          </span>

        </div>



        <div class="weather-detail">

          <i class="fas fa-wind"></i>
          <span class="weather-detail__label">
            Vânt
          </span>

          <span class="weather-detail__value">
            ${Math.round(current.wind.speed * 3.6)} km/h
          </span>

        </div>



        <div class="weather-detail">

          <i class="fas fa-gauge-high"></i>
          <span class="weather-detail__label">
            Presiune
          </span>

          <span class="weather-detail__value">
            ${current.main.pressure} hPa
          </span>

        </div>

      </div>

    `;



    const forecastResponse =
      await fetch(
`https://api.openweathermap.org/data/2.5/forecast?lat=${LAT}&lon=${LON}&units=metric&lang=ro&appid=${WEATHER_API_KEY}`
      );

    const forecastData =
      await forecastResponse.json();
    if (!forecastResponse.ok || !Array.isArray(forecastData.list)) throw new Error("Prognoza nu este disponibilă.");



    const grouped = {};



    forecastData.list.forEach(item => {

      const date =
        item.dt_txt.split(" ")[0];



      if(!grouped[date]){

        grouped[date] = [];

      }



      grouped[date].push(item);

    });



    const weatherGrid =
      document.getElementById("weatherGrid");



    weatherGrid.innerHTML = "";



    Object.entries(grouped)
      .slice(1,4)
      .forEach(([date, entries]) => {

        const maxTemp =
          Math.max(
            ...entries.map(
              e => e.main.temp_max
            )
          );

        const minTemp =
          Math.min(
            ...entries.map(
              e => e.main.temp_min
            )
          );

        const rainChance =
          Math.max(
            ...entries.map(
              e => (e.pop || 0) * 100
            )
          );

        const wind =
          Math.max(
            ...entries.map(
              e => e.wind.speed
            )
          );

        const weather =
          entries[0].weather[0];



        const weekday =
          new Date(date)
          .toLocaleDateString(
            "ro-RO",
            {
              weekday:"long"
            }
          );



        weatherGrid.innerHTML += `

          <article class="weather-card">

            <div class="weather-card__top">
              <span class="weather-card__index">0${Object.keys(grouped).indexOf(date)}</span>
              <img
                class="weather-icon"
                src="https://openweathermap.org/img/wn/${weather.icon}@2x.png"
                alt="${weather.description}">
            </div>

            <h3 class="weather-day">

              ${weekday}

            </h3>

            <div class="weather-desc">

              ${weather.description}

            </div>

            <div class="weather-card__temperatures">
              <div class="weather-max"><span>Max.</span><strong>${Math.round(maxTemp)}°</strong></div>
              <div class="weather-min"><span>Min.</span><strong>${Math.round(minTemp)}°</strong></div>
            </div>
            <div class="weather-card__meta">
              <span><i class="fas fa-cloud-rain"></i> ${Math.round(rainChance)}%</span>
              <span><i class="fas fa-wind"></i> ${Math.round(wind * 3.6)} km/h</span>
            </div>
          </article>

        `;

      });

  }

  catch(error){

    console.warn("Serviciul meteo este temporar indisponibil.");

    const currentContainer = document.getElementById("weatherCurrent");
    if (currentContainer) {
      currentContainer.innerHTML = `
        <div class="weather-unavailable">
          <i class="fas fa-cloud-sun"></i>
          <div><strong>Vremea ia o scurtă pauză</strong><span>Datele meteo vor reveni la următoarea actualizare.</span></div>
        </div>
      `;
    }

  }

}

loadWeather();
})();
