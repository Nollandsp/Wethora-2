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
            suggestion.className = "cursor-pointer px-4 py-2 hover:bg-gray-100";
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
    if (!city) return;

    if (favorites.length >= 3) {
      setError("Vous ne pouvez avoir que 3 favoris.");
      return;
    }

    // Vérifie si la ville est déjà dans les favoris de l'utilisateur
    const { data: existing, error: selectError } = await supabase
      .from("favorites")
      .select("id")
      .eq("profiles_id", user.id)
      .eq("city_name", city)
      .maybeSingle();

    if (selectError) {
      console.error(
        "Erreur lors de la vérification des favoris:",
        selectError.message
      );
      setError("Erreur lors de la vérification.");
      return;
    }

    if (existing) {
      setError("Cette ville est déjà dans vos favoris.");
      return;
    }

    const {
      data: { session },
    } = await supabase.auth.getSession();
    console.log(session.user.id);

    // Ajoute la ville aux favoris
    const { error: insertError } = await supabase.from("favorites").insert({
      profiles_id: session.user.id,
      city_name: city,
    });

    if (insertError) {
      console.error(
        "Erreur Supabase à l'insertion:",
        insertError.message || insertError
      );
      setError("Erreur lors de l'ajout aux favoris.");
      return;
    }

    // Succès
    setFavorites([...favorites, city]);
    setError("");
  };

  return (
    <>
      <Navbar />
      <main className="flex flex-col items-center justify-center w-full px-4 min-h-screen bg-gradient-to-br from-black via-gray-900 to-black relative overflow-hidden">
        {/* Effets de fond futuristes */}
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 via-transparent to-purple-500/5"></div>
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyan-400/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-400/10 rounded-full blur-3xl animate-pulse delay-1000"></div>

        <div
          id="decouvrir"
          style={{ height: "64px", marginTop: "-64px" }}
          aria-hidden="true"
        />
        <form
          id="search-form"
          onSubmit={handleSubmit}
          className="flex flex-col sm:flex-row justify-center w-full max-w-full sm:max-w-md lg:max-w-lg gap-2 sm:gap-2 mb-8 mt-10 px-2 relative"
        >
          <input
            type="search"
            ref={inputRef}
            placeholder="Rechercher une ville..."
            className="w-full sm:flex-1 px-4 py-1 sm:px-5 sm:py-1 text-base border-2 border-cyan-400/50 bg-black/80 backdrop-blur-sm text-cyan-100 placeholder-cyan-300/60 font-mono tracking-wide focus:outline-none focus:ring-2 focus:ring-cyan-400 hover:border-cyan-300 transition-all shadow-lg shadow-cyan-400/20"
            autoComplete="off"
          />
          <div
            id="suggestions-container"
            ref={suggestionsRef}
            className="absolute z-50 top-full left-0 right-0 sm:right-auto sm:w-full max-h-[200px] overflow-y-auto bg-black/95 backdrop-blur-xl border border-cyan-400/50 shadow-xl shadow-cyan-400/30 text-white mt-3 rounded-md"
          ></div>

          <div className="flex flex-row sm:flex-col gap-2 w-full sm:w-auto">
            <button
              type="submit"
              className="w-full sm:w-auto px-4 py-2 sm:px-5 sm:py-2 text-sm font-bold text-black uppercase bg-gradient-to-r from-cyan-400 to-cyan-500 hover:from-cyan-300 hover:to-cyan-400 shadow-lg shadow-cyan-400/30 transition-all transform hover:scale-105 font-mono tracking-wider"
            >
              &gt; SCAN
            </button>

            {user ? (
              <button
                type="button"
                className="w-full sm:w-auto px-4 py-2 sm:px-5 sm:py-2 text-sm font-bold text-black uppercase bg-gradient-to-r from-purple-400 to-purple-500 hover:from-purple-300 hover:to-purple-400 shadow-lg shadow-purple-400/30 transition-all transform hover:scale-105 font-mono tracking-wider"
                onClick={handleAddFavorite}
              >
                + SAVE
              </button>
            ) : (
              <button
                type="button"
                className="w-full sm:w-auto px-4 py-2 sm:px-5 sm:py-2 text-sm font-bold text-gray-500 uppercase bg-gray-800 cursor-not-allowed shadow-md font-mono tracking-wider"
                disabled
                title="Connectez-vous pour ajouter aux favoris"
              >
                + LOCKED
              </button>
            )}
          </div>
        </form>

        {user && favorites.length > 0 && (
          <div className="flex flex-wrap gap-3 mb-6 justify-center">
            {favorites.map((city) => (
              <button
                key={city}
                className="px-5 py-1 bg-black/70 backdrop-blur-sm border border-cyan-400/60 text-cyan-100 font-bold shadow-lg hover:shadow-cyan-400/40 hover:bg-black/90 transition-all hover:border-cyan-300 transform hover:scale-110 flex items-center gap-2 font-mono tracking-wide hover:text-cyan-200"
                onClick={() => {
                  if (inputRef.current) inputRef.current.value = city;
                  const form = document.getElementById("search-form");
                  if (form)
                    form.dispatchEvent(
                      new Event("submit", { cancelable: true, bubbles: true })
                    );
                }}
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
                  className="animate-pulse"
                >
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
                &gt; {city.toUpperCase()}
              </button>
            ))}
          </div>
        )}

        {error && (
          <div className="text-red-400 font-bold text-xl mb-4 bg-red-900/20 backdrop-blur-sm px-6 py-4 border border-red-400/50 shadow-xl shadow-red-400/20 font-mono tracking-wide">
            ERROR: {error}
          </div>
        )}

        <section className="relative flex flex-col items-center w-full max-w-6xl">
          <div className="relative w-[90%] h-[70vh] overflow-hidden shadow-2xl shadow-cyan-400/20 border-2 border-cyan-400/30 rounded-2xl">
            <Image
              src={backgroundImage}
              alt=""
              width={1920}
              height={1080}
              className="img-back w-full h-full object-cover rounded-2xl"
              priority
            />

            {/* Overlay cyberpunk */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-cyan-900/20 to-black/30 rounded-2xl"></div>

            {/* Grille futuriste */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-400/5 to-transparent"></div>
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent"></div>
            <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent"></div>
            <div className="absolute top-0 bottom-0 left-0 w-px bg-gradient-to-b from-transparent via-cyan-400/50 to-transparent"></div>
            <div className="absolute top-0 bottom-0 right-0 w-px bg-gradient-to-b from-transparent via-cyan-400/50 to-transparent"></div>

            <div
              className="absolute left-1/2 transform -translate-x-1/2 text-center text-cyan-100 font-bold text-2xl drop-shadow-2xl city
                top-[2%] sm:top-[4%]"
            >
              <h3 className="font-mono tracking-widest text-3xl">
                &gt; {cityName ? cityName.toUpperCase() : ""}
              </h3>
              <p className="font-mono tracking-wide text-lg text-cyan-300 opacity-90">
                [{cityDesc}]
              </p>
            </div>

            <div
              className="absolute bottom-[80%] left-1/2 transform -translate-x-1/2 w-1/2 sm:w-1/2 w-[90%] sm:left-1/2 sm:-translate-x-1/2 left-1/2 -translate-x-1/2
             bg-black/80 backdrop-blur-xl border-2 border-cyan-400/50 p-5 rounded-xl text-cyan-100 text-center shadow-2xl
             hover:scale-[1.02] transition-all forecast relative overflow-hidden
             sm:bottom-[80%] bottom-[10%]"
            >
              {/* Indicateurs de scan */}
              <div className="absolute top-2 left-4 flex gap-2">
                <div className="w-2 h-2 bg-cyan-400 rounded-full animate-ping"></div>
                <div className="w-2 h-2 bg-purple-400 rounded-full animate-ping delay-300"></div>
                <div className="w-2 h-2 bg-green-400 rounded-full animate-ping delay-600"></div>
              </div>

              <div className="absolute top-2 right-4 text-xs font-mono text-cyan-400 tracking-wider">
                WEATHER.EXE
              </div>

              {weatherIcon && (
                <div className="relative mb-4">
                  <div className="absolute inset-0 bg-cyan-400/20 blur-xl rounded-full"></div>
                  <Image
                    alt="Icone météo"
                    src={weatherIcon}
                    width={100}
                    height={100}
                    className="mx-auto drop-shadow-2xl relative z-10 filter brightness-110"
                  />
                </div>
              )}

              <div className="mb-4">
                <span className="text-xs font-mono text-cyan-400 tracking-widest block mb-2">
                  TEMPERATURE
                </span>
                <p className="tempartures1 text-3xl font-black mt-2 font-mono tracking-tight">
                  {temp1}
                </p>
              </div>

              <p className="mt-1 mb-6 font-mono text-cyan-300 tracking-wide">
                {temp2}
              </p>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 text-sm">
                <div className="bg-black/60 backdrop-blur-sm p-3 border border-cyan-400/30 hover:border-cyan-400/60 transition-all relative overflow-hidden rounded">
                  <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent animate-pulse"></div>
                  <p className="text-cyan-400 text-xs uppercase font-mono mb-1 tracking-widest">
                    FEELS
                  </p>
                  <p className="font-bold text-cyan-100 font-mono">
                    {stats[0]}
                  </p>
                </div>

                <div className="bg-black/60 backdrop-blur-sm p-3 border border-purple-400/30 hover:border-purple-400/60 transition-all relative overflow-hidden rounded">
                  <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-purple-400/50 to-transparent animate-pulse delay-200"></div>
                  <p className="text-purple-400 text-xs uppercase font-mono mb-1 tracking-widest">
                    WIND
                  </p>
                  <p className="font-bold text-cyan-100 font-mono">
                    {stats[1]}
                  </p>
                </div>

                <div className="bg-black/60 backdrop-blur-sm p-3 border border-green-400/30 hover:border-green-400/60 transition-all relative overflow-hidden rounded">
                  <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-green-400/50 to-transparent animate-pulse delay-400"></div>
                  <p className="text-green-400 text-xs uppercase font-mono mb-1 tracking-widest">
                    HUMID
                  </p>
                  <p className="font-bold text-cyan-100 font-mono">
                    {stats[2]}
                  </p>
                </div>

                <div className="bg-black/60 backdrop-blur-sm p-3 border border-yellow-400/30 hover:border-yellow-400/60 transition-all relative overflow-hidden rounded">
                  <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-yellow-400/50 to-transparent animate-pulse delay-600"></div>
                  <p className="text-yellow-400 text-xs uppercase font-mono mb-1 tracking-widest">
                    PRESS
                  </p>
                  <p className="font-bold text-cyan-100 font-mono">
                    {stats[3]}
                  </p>
                </div>
              </div>

              {/* Barre de progression factice */}
              <div className="mt-4 flex justify-center">
                <div className="w-32 h-1 bg-black/50 overflow-hidden rounded">
                  <div className="h-full bg-gradient-to-r from-cyan-400 to-purple-400 animate-pulse"></div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
