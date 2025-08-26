"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import Navbar from "../Navbar";
import ForecastExtended from "@/components/ForecastExtended";

export default function MainWeather({ setFullCityName }) {
  const inputRef = useRef(null);
  const suggestionsRef = useRef(null);

  const [backgroundImage, setBackgroundImage] = useState("");
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
        imagePath = "";
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
      <main
        className="flex flex-col items-center justify-center w-full px-4 min-h-screen
  bg-[#4a148c] relative overflow-hidden pt-20 sm:pt-24 md:pt-28 lg:pt-16"
      >
        <div
          id="decouvrir"
          style={{ height: "64px", marginTop: "-64px" }}
          aria-hidden="true"
        />

        {/* Conteneur principal avec layout en grid */}
        <div className="w-full max-w-7xl grid grid-cols-1 lg:grid-cols-3 gap-8 mt-10">
          {/* Panel de gauche - Recherche et contrôles */}
          <div className="lg:col-span-1 space-y-6">
            {/* Formulaire de recherche vertical */}
            <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-3xl p-6 shadow-2xl relative z-50">
              <h2 className="text-white text-xl font-bold mb-4 flex items-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                Recherche météo
              </h2>

              <form
                id="search-form"
                onSubmit={handleSubmit}
                className="space-y-4 relative"
              >
                <div className="relative">
                  <input
                    type="search"
                    ref={inputRef}
                    placeholder="Entrez une ville..."
                    className="w-full px-4 py-4 bg-black/30 border border-white/30 text-white placeholder-white/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all"
                    autoComplete="off"
                  />
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <svg
                      className="w-5 h-5 text-white/60"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      />
                    </svg>
                  </div>
                </div>

                <div
                  id="suggestions-container"
                  ref={suggestionsRef}
                  className="absolute z-50 top-full left-0 right-0 max-h-[200px] overflow-y-auto bg-black/90 backdrop-blur-xl border border-white/30 shadow-xl text-white mt-2 rounded-xl"
                ></div>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="submit"
                    className="px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-purple-500/25 transition-all transform hover:scale-105"
                  >
                    Chercher
                  </button>

                  {user ? (
                    <button
                      type="button"
                      className="px-4 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-emerald-500/25 transition-all transform hover:scale-105"
                      onClick={handleAddFavorite}
                    >
                      Favoris
                    </button>
                  ) : (
                    <button
                      type="button"
                      className="px-4 py-3 bg-gray-700 text-gray-400 font-semibold rounded-xl cursor-not-allowed"
                      disabled
                      title="Connectez-vous pour ajouter aux favoris"
                    >
                      🔒 Bloqué
                    </button>
                  )}
                </div>
              </form>
            </div>

            {/* Favoris en sidebar */}
            {user && favorites.length > 0 && (
              <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-3xl p-6 shadow-2xl">
                <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    className="w-5 h-5"
                  >
                    <path
                      fillRule="evenodd"
                      d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Mes favoris
                </h3>

                <div className="space-y-2">
                  {favorites.map((city) => (
                    <button
                      key={city}
                      className="w-full text-left px-4 py-3 bg-white/10 border border-white/20 text-white rounded-xl hover:bg-white/20 transition-all transform hover:scale-105 flex items-center gap-3"
                      onClick={() => {
                        if (inputRef.current) inputRef.current.value = city;
                        const form = document.getElementById("search-form");
                        if (form)
                          form.dispatchEvent(
                            new Event("submit", {
                              cancelable: true,
                              bubbles: true,
                            })
                          );
                      }}
                    >
                      <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                      {city}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Message d'erreur */}
            {error && (
              <div className="bg-red-500/20 border border-red-400/30 text-red-200 p-4 rounded-xl backdrop-blur-lg">
                <div className="flex items-center gap-2">
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                  {error}
                </div>
              </div>
            )}
          </div>

          {/* Panel principal - Météo */}
          <div className="lg:col-span-2 pb-10">
            <section className="relative h-[60vh] sm:h-[65vh] md:h-[70vh] lg:h-[80vh]">
              <div className="relative w-full h-full overflow-hidden rounded-2xl md:rounded-3xl shadow-2xl flex flex-col justify-between">
                {/* Fond dynamique météo OU violet par défaut */}
                <div
                  className="absolute inset-0"
                  style={{
                    backgroundImage: backgroundImage
                      ? `url(${backgroundImage})`
                      : undefined,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    backgroundRepeat: "no-repeat",
                    backgroundColor: !backgroundImage ? "#4a148c" : undefined,
                  }}
                >
                  <div className="absolute inset-0 bg-black/30" />
                </div>

                {/* Header de la ville */}
                <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl sm:rounded-2xl p-3 sm:p-5 text-white m-3 z-10">
                  <h3 className="text-base sm:text-xl md:text-2xl lg:text-3xl font-bold mb-1 break-words">
                    {cityName ? cityName : "Aucune ville sélectionnée"}
                  </h3>
                  <p className="text-white/80 text-xs sm:text-sm md:text-base lg:text-lg break-words">
                    {cityDesc}
                  </p>
                </div>

                {/* Widget météo */}
                <div className="bg-white/15 backdrop-blur-xl border border-white/20 rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8 text-white shadow-2xl m-3 z-10">
                  {/* Bloc principal */}
                  <div className="flex items-center justify-between mb-3 md:mb-5 lg:mb-8">
                    <div className="flex items-center gap-2 md:gap-4 lg:gap-6">
                      {weatherIcon && (
                        <div className="bg-white/20 p-1 md:p-2 lg:p-4 rounded-xl md:rounded-2xl">
                          <Image
                            alt="Icone météo"
                            src={weatherIcon}
                            width={32}
                            height={32}
                            className="drop-shadow-lg md:w-[60px] md:h-[60px] lg:w-[80px] lg:h-[80px]"
                          />
                        </div>
                      )}
                      <div>
                        <p className="text-xl md:text-3xl lg:text-5xl font-bold mb-0.5 md:mb-2">
                          {temp1}
                        </p>
                        <p className="text-xs md:text-base lg:text-xl text-white/80">
                          {temp2}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-2 md:grid-cols-4 md:gap-4">
                    <div className="bg-white/10 backdrop-blur-sm p-2 md:p-3 lg:p-4 rounded-lg md:rounded-xl border border-white/20 text-center">
                      <div className="w-2 h-2 bg-orange-400 rounded-full mx-auto mb-1 md:mb-2"></div>
                      <p className="text-white/60 text-[10px] md:text-xs lg:text-sm uppercase font-semibold mb-1">
                        Ressenti
                      </p>
                      <p className="font-bold text-sm md:text-base lg:text-xl">
                        {stats[0]}
                      </p>
                    </div>

                    <div className="bg-white/10 backdrop-blur-sm p-2 md:p-3 lg:p-4 rounded-lg md:rounded-xl border border-white/20 text-center">
                      <div className="w-2 h-2 bg-blue-400 rounded-full mx-auto mb-1 md:mb-2"></div>
                      <p className="text-white/60 text-[10px] md:text-xs lg:text-sm uppercase font-semibold mb-1">
                        Vent
                      </p>
                      <p className="font-bold text-sm md:text-base lg:text-xl">
                        {stats[1]}
                      </p>
                    </div>

                    <div className="bg-white/10 backdrop-blur-sm p-2 md:p-3 lg:p-4 rounded-lg md:rounded-xl border border-white/20 text-center">
                      <div className="w-2 h-2 bg-green-400 rounded-full mx-auto mb-1 md:mb-2"></div>
                      <p className="text-white/60 text-[10px] md:text-xs lg:text-sm uppercase font-semibold mb-1">
                        Humidité
                      </p>
                      <p className="font-bold text-sm md:text-base lg:text-xl">
                        {stats[2]}
                      </p>
                    </div>

                    <div className="bg-white/10 backdrop-blur-sm p-2 md:p-3 lg:p-4 rounded-lg md:rounded-xl border border-white/20 text-center">
                      <div className="w-2 h-2 bg-purple-400 rounded-full mx-auto mb-1 md:mb-2"></div>
                      <p className="text-white/60 text-[10px] md:text-xs lg:text-sm uppercase font-semibold mb-1">
                        Pression
                      </p>
                      <p className="font-bold text-sm md:text-base lg:text-xl">
                        {stats[3]}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>
        <ForecastExtended fullCityName={cityName} />
      </main>
    </>
  );
}
