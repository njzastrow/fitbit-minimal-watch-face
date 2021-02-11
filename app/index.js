import { me as appbit } from "appbit";
import { preferences } from "user-settings";
import * as util from "../common/utils";
import * as messaging from "messaging";
import { today } from "user-activity";
import { HeartRateSensor } from "heart-rate";
import clock from "clock";
import document from "document";

// Update the clock every minute
clock.granularity = "minutes";

// Get a handle on the <text> elements
const lblClock = document.getElementById("lblClock");
const lblDate = document.getElementById("lblDate");
const weather = "";
const imgWeather = document.getElementById("imgWeather");
const lblPulse = document.getElementById("lblPulse");
const lblSteps = document.getElementById("lblSteps");
const lblCalories = document.getElementById("lblCalories");
const lblDistance = document.getElementById("lblDistance");

// Update the <text> elements every tick with the current time
clock.ontick = (evt) => {
  let date = evt.date;
  let hours = date.getHours();
  // Handle 12 or 24 hour format
  if (preferences.clockDisplay === "12h") {
    hours = hours % 12 || 12;
  } else {
    hours = util.zeroPad(hours);
  }
  let mins = util.zeroPad(date.getMinutes());
  lblClock.text = `${hours}:${mins}`;
  lblDate.text = `${util.formatDate(date)}` + weather;
  if (appbit.permissions.granted("access_activity")) {
     lblSteps.text = `${util.formatNumber(today.adjusted.steps)}`;
     lblCalories.text = `${util.formatNumber(today.local.activeZoneMinutes.total)}`+ 'min' ;
    // Convert meters to freedom units
     let miles = Math.round(today.adjusted.distance*0.00062137 * 10) / 10 ;
     lblDistance.text = `${miles}` + 'mi';
  }
}

// Get heart rate and set the lblPulse value based on it
if (HeartRateSensor) {
  const hrm = new HeartRateSensor({ frequency: 1 });
  hrm.addEventListener("reading", () => {
    lblPulse.text = `${hrm.heartRate}`;
  });
  hrm.start();
}

// Get weather values from companion API and set UI elements accordingly
function fetchWeather() {
  if (messaging.peerSocket.readyState === messaging.peerSocket.OPEN) {
    // Send a command to the companion
    messaging.peerSocket.send({
      command: "weather"
    });
  }
}

function processWeatherData(data) {
  weather = '         ' + Math.round(data.temperature) + '°F';
  imgWeather.href = '../resources/icons/weather/' + data.icon + '.png';
}

messaging.peerSocket.addEventListener("open", (evt) => {
  fetchWeather();
});

messaging.peerSocket.addEventListener("message", (evt) => {
  if (evt.data) {
    processWeatherData(evt.data);
  }
});

messaging.peerSocket.addEventListener("error", (err) => {
  console.error(`Connection error: ${err.code} - ${err.message}`);
});

// Fetch the weather every 15 minutes
setInterval(fetchWeather, 15 * 1000 * 60);
