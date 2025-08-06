"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import Navbar from "../Navbar";

export default function MainWeather({ setFullCityName }) {
  const inputRef = useRef(null);
  const suggestionsRef = useRef(null);

  const [backgroundImage, setBackgroundImage] = useState("/Images/default.jpg");
  const [error, setError] = useState("");
  const [user, setUser] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const [cityName, setCityName] = useState("");
  const [cityDesc, setCityDesc] = useState("");
  const [weatherIcon, setWeatherIcon] = useState(null);
  const [temp1, setTemp1] = useState("");
  const [temp2, setTemp2] = useState("");
  const [stats, setStats] = useState(["", "", "", ""]);

  function updateBackground(weatherMain) {
    let imagePath;
    switch (weatherMain.toLowerCase()) {
      case "clear":
        imagePath = "/clear.jpg";
        break;
      case "clouds":
        imagePath = "/clouds.jpg";
        break;
      case "rain":
      case "drizzle":
        imagePath = "/rain.jpg";
        break;
      case "thunderstorm":
        imagePath = "/thunderstorm.jpg";
        break;
      case "snow":
        imagePath = "/snow.jpg";
        break;
      case "mist":
      case "fog":
      case "haze":
        imagePath = "/mist.jpg";
        break;
      default:
        imagePath = "/default.jpg";
        break;
    }
    setBackgroundImage(imagePath);
  }

  useEffect(() => {
    const fetchUserAndFavorites = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session?.user) {
        setUser(session.user);
        const { data: favData, error } = await supabase
          .from("favorites")
          .select("city_name")
          .eq("profiles_id", session.user.id);

        if (!error && favData) {
          setFavorites(favData.map((f) => f.city_name));
        }
      }
    };
    fetchUserAndFavorites();
  }, []);

  useEffect(() => {
    const input = inputRef.current;
    const suggestionsContainer = suggestionsRef.current;
    let debounceTimeout;

    if (!input || !suggestionsContainer) return;

    const handleInput = () => {
      clearTimeout(debounceTimeout);
      const query = input.value.trim();
      if (query.length < 1) {
        suggestionsContainer.innerHTML = "";
        setError("");
        return;
      }

      debounceTimeout = setTimeout(async () => {
        try {
          const response = await fetch(
            `https://geo.api.gouv.fr/communes?nom=${encodeURIComponent(
              query
            )}&fields=departement&boost=population&limit=5`
          );
          const data = await response.json();

          suggestionsContainer.innerHTML = "";

          if (data.length === 0) {
            setError("Ville non trouvée, réessayer");
            return;
          }

          setError("");

          data.forEach((commune) => {
            const suggestion = document.createElement("div");
            suggestion.textContent = `${commune.nom} (${commune.departement.nom})`;
            suggestion.className =
              "cursor-pointer px-4 py-2 hover:bg-gray-100 text-gray-900";
            suggestion.addEventListener("click", () => {
              input.value = commune.nom;
              suggestionsContainer.innerHTML = "";
              setError("");
            });
            suggestionsContainer.appendChild(suggestion);
          });
        } catch (err) {
          console.error("Erreur fetch suggestions :", err);
          setError("Erreur de connexion. Veuillez réessayer.");
        }
      }, 300);
    };

    input.addEventListener("input", handleInput);

    const handleClickOutside = (e) => {
      if (
        suggestionsContainer &&
        !suggestionsContainer.contains(e.target) &&
        e.target !== input
      ) {
        suggestionsContainer.innerHTML = "";
      }
    };
    document.addEventListener("click", handleClickOutside);

    return () => {
      clearTimeout(debounceTimeout);
      input.removeEventListener("input", handleInput);
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);

  const getWeather = async (city) => {
    try {
      setError("");
      const geoRes = await fetch(
        `https://geo.api.gouv.fr/communes?nom=${encodeURIComponent(
          city
        )}&fields=departement&boost=population&limit=1`
      );
      const geoData = await geoRes.json();

      if (geoData.length === 0) {
        setError("Ville non trouvée");
        return;
      }

      const fullCity = geoData[0].nom;
      const department = geoData[0].departement.nom;
      setFullCityName(fullCity);
      setCityName(fullCity);
      setCityDesc(`${department}`);

      const API_KEY = "8eb2d4000ed188a4ae05666fa24891c9";
      const weatherRes = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${fullCity}&appid=${API_KEY}&units=metric&lang=fr`
      );
      const weatherData = await weatherRes.json();

      if (weatherData.cod !== 200) {
        setError("Erreur météo : " + weatherData.message);
        return;
      }

      const {
        weather,
        main: { temp, feels_like, humidity, pressure },
        wind,
      } = weatherData;

      const description = weather[0].description;
      const icon = weather[0].icon;
      const main = weather[0].main;

      setWeatherIcon(`https://openweathermap.org/img/wn/${icon}@2x.png`);
      setTemp1(`${temp.toFixed(1)}°C`);
      setTemp2(`Météo : ${description}`);
      setStats([
        `${feels_like.toFixed(1)}°C`,
        `${wind.speed} m/s`,
        `${humidity}%`,
        `${pressure} hPa`,
      ]);

      updateBackground(main);
      setError("");
    } catch (err) {
      console.error(err);
      setError("Erreur de connexion");
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const city = inputRef.current.value.trim();
    if (city) {
      getWeather(city);
    }
  };

  const handleAddFavorite = async () => {
    if (!user) {
      setError("Connexion requise pour ajouter une ville aux favoris.");
      setTimeout(() => {
        window.location.href = "/Connexion";
      }, 1500);
      return;
    }
    const city = inputRef.current.value.trim();
    if (!city || favorites.includes(city)) return;
    if (favorites.length >= 3) {
      setError("Vous ne pouvez avoir que 3 favoris.");
      return;
    }

    const { error: insertError } = await supabase.from("favorites").insert({
      city_name: city,
      profiles_id: user.id,
    });

    if (insertError) {
      setError("Erreur lors de l'ajout aux favoris.");
      return;
    }

    setFavorites([...favorites, city]);
    setError("");
  };

  return (
    <>
      <Navbar />
      <main className="flex flex-col items-center justify-center w-full px-4">
        <div
          id="decouvrir"
          style={{ height: "64px", marginTop: "-64px" }}
          aria-hidden="true"
        />
        <form
          id="search-form"
          onSubmit={handleSubmit}
          className="flex flex-col sm:flex-row justify-center w-full max-w-full sm:max-w-md lg:max-w-lg gap-2 mb-8 mt-10 px-2 relative"
        >
          <input
            type="search"
            ref={inputRef}
            placeholder="Rechercher une ville..."
            className="w-full sm:flex-1 px-4 py-2 text-base border border-blue-300 rounded-xl shadow-md focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white placeholder-gray-400 transition-all"
            autoComplete="off"
            aria-label="Recherche de ville"
          />
          <div
            id="suggestions-container"
            ref={suggestionsRef}
            className="absolute z-50 top-full left-0 w-[90%] sm:w-[30%] max-h-52 overflow-y-auto bg-white rounded-md shadow-lg"
            role="listbox"
            aria-label="Suggestions de villes"
          ></div>

          <div className="flex flex-row sm:flex-col gap-2 w-full sm:w-auto">
            <button
              type="submit"
              className="w-full sm:w-auto px-4 py-2 text-sm font-semibold text-white uppercase bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md transition-all"
            >
              Rechercher
            </button>

            {user ? (
              <button
                type="button"
                className="w-full sm:w-auto px-4 py-2 text-sm font-semibold text-white uppercase bg-green-600 hover:bg-green-700 rounded-xl shadow-md transition-all"
                onClick={handleAddFavorite}
              >
                + Favoriss
              </button>
            ) : (
              <button
                type="button"
                className="w-full sm:w-auto px-4 py-2 text-sm font-semibold text-white uppercase bg-gray-300 cursor-not-allowed rounded-xl shadow-md"
                disabled
                title="Connectez-vous pour ajouter aux favoris"
              >
                + Favoriss
              </button>
            )}
          </div>
        </form>

        {user && favorites.length > 0 && (
          <div className="flex flex-wrap gap-3 mb-6 justify-center">
            {favorites.map((city) => (
              <button
                key={city}
                className="flex items-center gap-2 px-5 py-1 rounded-full bg-white/20 backdrop-blur-md text-white font-semibold shadow-lg hover:shadow-xl hover:bg-white/30 transition-all border border-white/30 hover:border-white/50"
                onClick={() => {
                  if (inputRef.current) inputRef.current.value = city;
                  const form = document.getElementById("search-form");
                  if (form)
                    form.dispatchEvent(
                      new Event("submit", { cancelable: true, bubbles: true })
                    );
                }}
                aria-label={`Sélectionner la ville favorite ${city}`}
              >
                <svg
                  width="16"
                  height="16"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                  focusable="false"
                >
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
                {city}
              </button>
            ))}
          </div>
        )}

        {error && (
          <div
            className="text-red-600 font-bold text-xl mb-4"
            role="alert"
            aria-live="assertive"
          >
            {error}
          </div>
        )}

        <section className="relative flex flex-col items-center w-full max-w-6xl">
          <Image
            src={backgroundImage}
            alt="Image représentant la météo"
            width={1920}
            height={1080}
            className="w-[90%] h-[70vh] object-cover rounded-2xl"
            priority
          />

          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 text-center text-white font-bold text-2xl drop-shadow-md city">
            <h3>{cityName}</h3>
            <p>{cityDesc}</p>
          </div>

          <div className="absolute bottom-[47%] left-1/2 transform -translate-x-1/2 w-1/2 bg-white/10 backdrop-blur-md p-5 rounded-xl text-white text-center shadow-xl hover:scale-[1.02] transition-all forecast">
            {weatherIcon && (
              <Image
                alt="Icône météo"
                src={weatherIcon}
                width={100}
                height={100}
                className="mx-auto"
              />
            )}
            <p className="text-3xl font-bold mt-2">{temp1}</p>
            <p className="mt-1">{temp2}</p>
            <div className="flex justify-around mt-4 text-sm">
              <p>Ressentie: {stats[0]}</p>
              <p>Vent: {stats[1]}</p>
              <p>Humidité: {stats[2]}</p>
              <p>Pression: {stats[3]}</p>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
