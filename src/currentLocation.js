import React from "react";
import apiKeys from "./apiKeys";
import Clock from "react-live-clock";
import Forcast from "./Forcast"; // Note the corrected spelling
import loader from "./images/WeatherIcons.gif";
import ReactAnimatedWeather from "react-animated-weather";

// Helper function to format the date
const dateBuilder = (d) => {
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  const days = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];

  const day = days[d.getDay()];
  const date = d.getDate();
  const month = months[d.getMonth()];
  const year = d.getFullYear();

  return `${day}, ${date} ${month} ${year}`;
};

const defaults = {
  color: "white",
  size: 112,
  animate: true,
};

class Weather extends React.Component {
  state = {
    lat: undefined,
    lon: undefined,
    errorMessage: undefined,
    temperatureC: undefined,
    temperatureF: undefined,
    city: undefined,
    country: undefined,
    humidity: undefined,
    description: undefined,
    icon: "CLEAR_DAY",
    sunrise: undefined,
    sunset: undefined,
    errorMsg: undefined,
  };

  componentDidMount() {
    if (navigator.geolocation) {
      this.getPosition()
        .then((position) => {
          this.getWeather(position.coords.latitude, position.coords.longitude);
        })
        .catch(() => {
          this.getWeather(28.67, 77.22);
          alert(
            "You have disabled location services. Allow 'This APP' to access your location. Your current location will be used for calculating real-time weather."
          );
        });
    } else {
      alert("Geolocation is not available.");
    }

    this.timerID = setInterval(
      () => this.getWeather(this.state.lat, this.state.lon),
      600000 // Refresh every 10 minutes
    );
  }

  componentWillUnmount() {
    clearInterval(this.timerID);
  }

  // Function to get the current position
  getPosition = (options) => {
    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject, options);
    });
  };

  // Function to get weather data
  getWeather = async (lat, lon) => {
    try {
      const api_call = await fetch(
        `${apiKeys.base}weather?lat=${lat}&lon=${lon}&units=metric&APPID=${apiKeys.key}`
      );
      const data = await api_call.json();
      this.setState({
        lat: lat,
        lon: lon,
        city: data.name,
        temperatureC: Math.round(data.main.temp),
        temperatureF: Math.round(data.main.temp * 1.8 + 32),
        humidity: data.main.humidity,
        main: data.weather[0].main,
        country: data.sys.country,
        // sunrise: this.getTimeFromUnixTimeStamp(data.sys.sunrise),
        // sunset: this.getTimeFromUnixTimeStamp(data.sys.sunset),
      });
      this.updateIcon(data.weather[0].main);
    } catch (error) {
      console.error("Error fetching weather data:", error);
    }
  };

  // Function to update the weather icon based on weather conditions
  updateIcon = (weather) => {
    switch (weather) {
      case "Haze":
        this.setState({ icon: "CLEAR_DAY" });
        break;
      case "Clouds":
        this.setState({ icon: "CLOUDY" });
        break;
      case "Rain":
        this.setState({ icon: "RAIN" });
        break;
      case "Snow":
        this.setState({ icon: "SNOW" });
        break;
      case "Dust":
      case "Tornado":
        this.setState({ icon: "WIND" });
        break;
      case "Drizzle":
        this.setState({ icon: "SLEET" });
        break;
      case "Fog":
      case "Smoke":
        this.setState({ icon: "FOG" });
        break;
      default:
        this.setState({ icon: "CLEAR_DAY" });
    }
  };

  render() {
    if (this.state.temperatureC) {
      return (
        <React.Fragment>
          <div className="city">
            <div className="title">
              <h2>{this.state.city}</h2>
              <h3>{this.state.country}</h3>
            </div>
            <div className="mb-icon">
              <ReactAnimatedWeather
                icon={this.state.icon}
                color={defaults.color}
                size={defaults.size}
                animate={defaults.animate}
              />
              <p>{this.state.main}</p>
            </div>
            <div className="date-time">
              <div className="dmy">
                <div id="txt"></div>
                <div className="current-time">
                  <Clock format="HH:mm:ss" interval={1000} ticking={true} />
                </div>
                <div className="current-date">{dateBuilder(new Date())}</div>
              </div>
              <div className="temperature">
                <p>
                  {this.state.temperatureC}°<span>C</span>
                </p>
                {/* Uncomment if Fahrenheit temperature is needed */}
                {/* <span className="slash">/</span>
                <p>{this.state.temperatureF}°F</p> */}
              </div>
            </div>
          </div>
          <Forcast icon={this.state.icon} weather={this.state.main} />
        </React.Fragment>
      );
    } else {
      return (
        <React.Fragment>
          <img src={loader} alt="Loading..." style={{ width: "50%", WebkitUserDrag: "none" }} />
          <h3 style={{ color: "white", fontSize: "22px", fontWeight: "600" }}>
            Detecting your location
          </h3>
          <h3 style={{ color: "white", marginTop: "10px" }}>
            Your current location will be displayed on the App <br />
            and used for calculating real-time weather.
          </h3>
        </React.Fragment>
      );
    }
  }
}

export default Weather;
