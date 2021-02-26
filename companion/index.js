import { me as companion } from "companion";
import * as messaging from "messaging";
import { geolocation } from "geolocation";
import { settingsStorage } from "settings";

// Try to read the OpenWeather API key from settings
try {
  var OpenWeatherAPIKey = JSON.parse(settingsStorage.getItem("OpenWeatherAPIKey")).name;
}
catch{
  // No API key specified
}

// If a new key is set, update the value
settingsStorage.addEventListener("change", (evt) => {
  if (evt.key == "OpenWeatherAPIKey"){
    OpenWeatherAPIKey = JSON.parse(evt.newValue).name;
    }
  });

// Get geolocation info and pass it to the OpenWeatherMap API
function queryOpenWeather() {
  // Only try to query weather if we have an API key
  if (OpenWeatherAPIKey){
    geolocation.getCurrentPosition(locationSuccess, locationError, {
      timeout: 60 * 1000
    });

    // If geolocation succeeeds, pull updated weather info  
    function locationSuccess(position) {
      let url = "https://api.openweathermap.org/data/2.5/weather?units=imperial";
      url +="&appid=" + OpenWeatherAPIKey;
      url +="&lat=" + position.coords.latitude;
      url +="&lon=" + position.coords.longitude;
   
    fetch(url)
    .then(function (response) {
        response.json()
        .then(function(data) {
          // Parse temp and current weather icon from JSON response
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
 }

// Send message back to device with weather info
function returnWeatherData(data) {
  if (messaging.peerSocket.readyState === messaging.peerSocket.OPEN) {
    messaging.peerSocket.send(data);
  } else {
    console.error("Error: Connection is not open");
  }
}

// Fire queryOpenWeather() when we receive a message from the device with the weather command 
messaging.peerSocket.addEventListener("message", (evt) => {
  if (evt.data && evt.data.command === "weather") {
    queryOpenWeather();
  }
});

// Log error when messaging fails
messaging.peerSocket.addEventListener("error", (err) => {
  console.error(`Connection error: ${err.code} - ${err.message}`);
});