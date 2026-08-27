import { useEffect, useState } from "react";
import {
  Cloud,
  CloudRain,
  CloudSun,
  Droplets,
  LoaderCircle,
  Sun,
  Wind,
} from "lucide-react";

const GEOCODING_API =
  "https://geocoding-api.open-meteo.com/v1/search";

const WEATHER_API =
  "https://api.open-meteo.com/v1/forecast";

function getWeatherIcon(code) {
  let Icon = Cloud;

  if (code === 0) {
    Icon = Sun;
  } else if ([1, 2].includes(code)) {
    Icon = CloudSun;
  } else if ([3, 45, 48].includes(code)) {
    Icon = Cloud;
  } else if (
    [
      51,
      53,
      55,
      56,
      57,
      61,
      63,
      65,
      66,
      67,
      80,
      81,
      82,
      95,
      96,
      99,
    ].includes(code)
  ) {
    Icon = CloudRain;
  }

  return (
    <Icon
      className="h-7 w-7 text-brand"
      aria-hidden="true"
    />
  );
}

function getWeatherDescription(code) {
  if (code === 0) {
    return "Clear sky";
  }

  if ([1, 2].includes(code)) {
    return "Partly cloudy";
  }

  if (code === 3) {
    return "Overcast";
  }

  if ([45, 48].includes(code)) {
    return "Foggy";
  }

  if ([51, 53, 55, 56, 57].includes(code)) {
    return "Drizzle";
  }

  if ([61, 63, 65, 66, 67].includes(code)) {
    return "Rain";
  }

  if ([80, 81, 82].includes(code)) {
    return "Rain showers";
  }

  if ([95, 96, 99].includes(code)) {
    return "Thunderstorm";
  }

  return "Variable conditions";
}

function isValidCoordinate(value) {
  return (
    value !== null &&
    value !== undefined &&
    value !== "" &&
    Number.isFinite(Number(value))
  );
}

async function parseJsonResponse(response) {
  try {
    return await response.json();
  } catch {
    return {};
  }
}

export default function PropertyWeather({
  city,
  latitude,
  longitude,
}) {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function fetchWeather() {
      try {
        let lat = latitude;
        let lon = longitude;
        let locationName = city?.trim() || "Property location";

        /*
         * Use the property's coordinates when available.
         * Otherwise geocode the property's city using
         * Open-Meteo's public geocoding API.
         */
        if (
          !isValidCoordinate(lat) ||
          !isValidCoordinate(lon)
        ) {
          if (!city?.trim()) {
            throw new Error(
              "No location is available for this property."
            );
          }

          const geocodeUrl =
            `${GEOCODING_API}?name=${encodeURIComponent(
              city.trim()
            )}` +
            "&count=1" +
            "&language=en" +
            "&format=json";

          const geocodeResponse =
            await fetch(geocodeUrl);

          const geocodeData =
            await parseJsonResponse(
              geocodeResponse
            );

          if (!geocodeResponse.ok) {
            throw new Error(
              geocodeData.reason ||
                "Unable to find the property's location."
            );
          }

          if (
            !Array.isArray(geocodeData.results) ||
            geocodeData.results.length === 0
          ) {
            throw new Error(
              `Unable to find a location for "${city}".`
            );
          }

          const location =
            geocodeData.results[0];

          lat = location.latitude;
          lon = location.longitude;

          locationName =
            location.name || locationName;
        }

        /*
         * Request current weather from Open-Meteo.
         */
        const weatherUrl =
          `${WEATHER_API}?latitude=${encodeURIComponent(
            lat
          )}` +
          `&longitude=${encodeURIComponent(
            lon
          )}` +
          "&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m" +
          "&timezone=auto";

        const weatherResponse =
          await fetch(weatherUrl);

        const weatherData =
          await parseJsonResponse(
            weatherResponse
          );

        if (!weatherResponse.ok) {
          throw new Error(
            weatherData.reason ||
              "Unable to load weather information."
          );
        }

        if (
          !weatherData.current ||
          typeof weatherData.current !== "object"
        ) {
          throw new Error(
            "Weather information is currently unavailable."
          );
        }

        if (cancelled) {
          return;
        }

        setWeather({
          locationName,

          temperature:
            weatherData.current.temperature_2m,

          humidity:
            weatherData.current
              .relative_humidity_2m,

          windSpeed:
            weatherData.current.wind_speed_10m,

          weatherCode:
            weatherData.current.weather_code,

          temperatureUnit:
            weatherData.current_units
              ?.temperature_2m || "°C",

          humidityUnit:
            weatherData.current_units
              ?.relative_humidity_2m || "%",

          windUnit:
            weatherData.current_units
              ?.wind_speed_10m || "km/h",
        });

        setError("");
      } catch (err) {
        console.error(
          "Property weather error:",
          err
        );

        if (!cancelled) {
          setWeather(null);
          setError(
            err.message ||
              "Unable to load local weather."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchWeather();

    return () => {
      cancelled = true;
    };
  }, [city, latitude, longitude]);

  /*
   * Loading state
   */
  if (loading) {
    return (
      <section
        className="mt-7 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
        aria-live="polite"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100">
            <LoaderCircle
              className="h-5 w-5 animate-spin text-brand"
              aria-hidden="true"
            />
          </div>

          <div>
            <h2 className="font-bold text-ink">
              Local weather
            </h2>

            <p className="mt-1 text-sm text-muted">
              Loading current conditions...
            </p>
          </div>
        </div>
      </section>
    );
  }

  /*
   * Error state
   */
  if (error) {
    return (
      <section className="mt-7 rounded-2xl border border-slate-200 bg-slate-50 p-5">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white">
            <Cloud
              className="h-5 w-5 text-slate-500"
              aria-hidden="true"
            />
          </div>

          <div>
            <h2 className="font-bold text-ink">
              Local weather
            </h2>

            <p className="mt-1 text-sm leading-6 text-muted">
              {error}
            </p>
          </div>
        </div>
      </section>
    );
  }

  /*
   * Nothing available to render.
   */
  if (!weather) {
    return null;
  }

  const weatherDescription =
    getWeatherDescription(
      weather.weatherCode
    );

  return (
    <section className="mt-7 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      {/* HEADER */}

      <div className="flex items-start justify-between gap-5">
        <div>
          <p className="text-sm font-semibold text-muted">
            Local weather
          </p>

          <h2 className="mt-1 text-xl font-bold text-ink">
            {weather.locationName}
          </h2>

          <p className="mt-1 text-sm text-muted">
            Current conditions
          </p>
        </div>

        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-slate-100">
          {getWeatherIcon(weather.weatherCode)}
        </div>
      </div>

      {/* CURRENT CONDITION */}

      <div className="mt-6 flex flex-wrap items-center gap-4">
        <p className="text-4xl font-extrabold text-ink">
          {typeof weather.temperature ===
          "number"
            ? Math.round(weather.temperature)
            : "--"}
          {weather.temperatureUnit}
        </p>

        <div>
          <p className="font-bold text-ink">
            {weatherDescription}
          </p>

          <p className="mt-1 text-sm text-muted">
            Current temperature
          </p>
        </div>
      </div>

      {/* WEATHER DETAILS */}

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white">
            <Droplets
              className="h-5 w-5 text-brand"
              aria-hidden="true"
            />
          </div>

          <div>
            <p className="text-xs font-medium text-muted">
              Humidity
            </p>

            <p className="mt-1 font-bold text-ink">
              {typeof weather.humidity ===
              "number"
                ? `${weather.humidity}${weather.humidityUnit}`
                : "Unavailable"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white">
            <Wind
              className="h-5 w-5 text-brand"
              aria-hidden="true"
            />
          </div>

          <div>
            <p className="text-xs font-medium text-muted">
              Wind
            </p>

            <p className="mt-1 font-bold text-ink">
              {typeof weather.windSpeed ===
              "number"
                ? `${weather.windSpeed} ${weather.windUnit}`
                : "Unavailable"}
            </p>
          </div>
        </div>
      </div>

      {/* API ATTRIBUTION */}

      <p className="mt-5 text-xs leading-5 text-muted">
        Weather data provided by Open-Meteo.
      </p>
    </section>
  );
}

