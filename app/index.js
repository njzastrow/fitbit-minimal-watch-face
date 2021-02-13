import { me as appbit } from "appbit";
import { preferences } from "user-settings";
import * as util from "../common/utils";
import * as messaging from "messaging";
import { display } from "display";
import document from "document";
import clock from "clock";
import { today } from "user-activity";
import { HeartRateSensor } from "heart-rate";

// Update the clock every minute
clock.granularity = "minutes";

// Get a handle on the <text> elements
const btnRefresh = document.getElementById("btnRefresh");
const lblClock = document.getElementById("lblClock");
const lblDate = document.getElementById("lblDate");
const weather = "";
const imgWeather = document.getElementById("imgWeather");
const lblPulse = document.getElementById("lblPulse");
const lblSteps = document.getElementById("lblSteps");
const lblCalories = document.getElementById("lblCalories");
const lblDistance = document.getElementById("lblDistance");

// Used to update stats on the display
function updateStats() {
  if (appbit.permissions.granted("access_activity")) {
    lblSteps.text = `${util.formatNumber(today.adjusted.steps)}`;
    lblCalories.text = `${util.formatNumber(today.local.activeZoneMinutes.total)}` + 'min';
    // Convert meters to freedom units
    let miles = Math.round(today.adjusted.distance * 0.00062137 * 10) / 10;
    lblDistance.text = `${miles}` + 'mi';
  }
  // Get heart rate and set the lblPulse value based on it
  if (HeartRateSensor) {
    const hrm = new HeartRateSensor({ frequency: 1 });
    hrm.addEventListener("reading", () => {
      lblPulse.text = `${hrm.heartRate}`;
    });
    // This is called every clock tick so only start hrm if the display is on to preserve battery life
    if (display.on) { hrm.start() }
    // Start hrm when display turns on, stop it when it turns off
    display.addEventListener("change", () => {
      display.on ? hrm.start() : hrm.stop();
    });
  }
}

// Update stats when the display changes to on
display.addEventListener("change", () => {
  if (display.on) { updateStats() }
});

// Refresh weather and stats when you tap the screen. Mostly added for if the weather gets stuck when communication between the companion app and device derps.
btnRefresh.onclick = function () {
  fetchWeather();
  updateStats();
}

// Update the text elements every tick
clock.ontick = (evt) => {
  let date = evt.date;
  let hours = date.getHours();
  // The display chooses the higher of the two values between Settings and brightnessOverride. Set display to dim in Settings so it's not so bright at night, override to normal during the day
  if (hours >= 8 && hours <= 21) {
    display.brightnessOverride = "normal";
  }
  else {
    display.brightnessOverride = undefined;
  }
  // Handle 12 or 24 hour format
  if (preferences.clockDisplay === "12h") {
    hours = hours % 12 || 12;
  } else {
    hours = util.zeroPad(hours);
  }
  let mins = util.zeroPad(date.getMinutes());
  lblClock.text = `${hours}:${mins}`;
  lblDate.text = `${util.formatDate(date)}` + weather;
  updateStats();
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

// Called when weather message is received to write the resuls to the UI
function processWeatherData(data) {
  weather = '         ' + Math.round(data.temperature) + '°F';
  imgWeather.href = '../resources/icons/weather/' + data.icon + '.png';
  // Jamming date and weather together for easier alignment so grab the data and append
  let date = new Date();
  lblDate.Text = lblDate.text = `${util.formatDate(date)}` + weather;
}

// Call fetchWeather when the peerSocket opens
messaging.peerSocket.addEventListener("open", (evt) => {
  fetchWeather();
});

// Call processWeatherData when message is received
messaging.peerSocket.addEventListener("message", (evt) => {
  if (evt.data) {
    processWeatherData(evt.data);
  }
});

// Log error when messaging fails
messaging.peerSocket.addEventListener("error", (err) => {
  console.error(`Connection error: ${err.code} - ${err.message}`);
});

// Fetch the weather every 15 minutes
setInterval(fetchWeather, 15 * 1000 * 60);
