import { me as companion } from "companion";
import * as messaging from "messaging";
import { geolocation } from "geolocation";

// TODO: Store this as a user setting so people can get and enter their own key
var openWeatherMapAPIKey = "your api key here";

// Get geolocation info and pass it to the OpenWeatherMap API
function queryOpenWeather() {
  geolocation.getCurrentPosition(locationSuccess, locationError, {
    timeout: 60 * 1000
  });

  function locationSuccess(position) {
    let url = "https://api.openweathermap.org/data/2.5/weather?units=imperial";
    url +="&appid=" + openWeatherMapAPIKey;
    url +="&lat=" + position.coords.latitude;
    url +="&lon=" + position.coords.longitude;

  fetch(url)
  .then(function (response) {
      response.json()
      .then(function(data) {
        // Parse temp and current weather icon
        var weather = {
          temperature: data["main"]["temp"],
          icon: data["weather"][0]["icon"]
        }
        // Send the weather data to the device
        returnWeatherData(weather);
      });
  })
  .catch(function (err) {
    console.error(`Error fetching weather: ${err}`);
  });
  }
      function locationError(error) {
    console.log("Error: " + error.code, "Message: " + error.message);
  }
}

function returnWeatherData(data) {
  if (messaging.peerSocket.readyState === messaging.peerSocket.OPEN) {
    messaging.peerSocket.send(data);
  } else {
    console.error("Error: Connection is not open");
  }
}

messaging.peerSocket.addEventListener("message", (evt) => {
  if (evt.data && evt.data.command === "weather") {
    queryOpenWeather();
  }
});

messaging.peerSocket.addEventListener("error", (err) => {
  console.error(`Connection error: ${err.code} - ${err.message}`);
});