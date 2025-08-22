"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase/client";
import Navbar from "@/components/Navbar";
import Image from "next/image";

const WEATHER_API_KEY = "8eb2d4000ed188a4ae05666fa24891c9";

export default function Favoris() {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const getUserAndFavorites = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);

      if (user) {
        const { data, error } = await supabase
          .from("favorites")
          .select("*")
          .eq("profiles_id", user.id);

        if (!error && data) {
          // Fetch météo pour chaque favori
          const favoritesWithWeather = await Promise.all(
            data.map(async (fav) => {
              try {
                const res = await fetch(
                  `https://api.openweathermap.org/data/2.5/weather?q=${fav.city_name}&units=metric&lang=fr&appid=${WEATHER_API_KEY}`
                );
                const weatherData = await res.json();

                return {
                  ...fav,
                  temperature: weatherData.main?.temp ?? "-",
                  humidity: weatherData.main?.humidity ?? "-",
                  pressure: weatherData.main?.pressure ?? "-",
                  wind: weatherData.wind?.speed ?? "-",
                  weather_condition:
                    weatherData.weather?.[0]?.description ?? "Inconnue",
                };
              } catch (err) {
                console.error("Erreur météo :", err);
                return {
                  ...fav,
                  temperature: "-",
                  humidity: "-",
                  pressure: "-",
                  wind: "-",
                  weather_condition: "Erreur",
                };
              }
            })
          );

          setFavorites(favoritesWithWeather);
        }
      }

      setLoading(false);
    };

    getUserAndFavorites();
  }, []);

  const handleDeleteFavorite = async (favoriteId) => {
    const { error } = await supabase
      .from("favorites")
      .delete()
      .eq("id", favoriteId);

    if (!error) {
      setFavorites(favorites.filter((fav) => fav.id !== favoriteId));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex items-center justify-center">
        <div className="text-white text-xl animate-pulse">Chargement...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex items-center justify-center">
        <div className="text-white text-xl">
          Veuillez vous connecter pour voir vos favoris
        </div>
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-yellow-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-1000"></div>
          <div className="absolute top-40 left-40 w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-2000"></div>
        </div>

        <div className="relative z-10 pt-20 pb-8 mt-8">
          <div className="container mx-auto px-4">
            {/* En-tête futuriste */}
            <div className="text-center mb-12">
              <div className="relative inline-block mb-6">
                <div className="absolute inset-0 bg-gradient-to-r from-yellow-500 to-orange-600 rounded-full blur-lg opacity-75"></div>
                <div className="relative z-10 w-24 h-24 bg-white/10 backdrop-blur-md border border-white/20 rounded-full flex items-center justify-center mx-auto">
                  <svg
                    className="w-12 h-12 text-white animate-spin"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                    />
                  </svg>
                </div>
              </div>

              <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 bg-gradient-to-r from-white to-yellow-200 bg-clip-text text-transparent font-mono tracking-widest">
                FAVORIS
              </h1>
              <p className="text-blue-200 text-lg font-mono tracking-wide max-w-md mx-auto">
                SYSTÈME DE SURVEILLANCE MÉTÉOROLOGIQUE
              </p>

              {/* Indicateurs de statut */}
              <div className="flex justify-center gap-4 mt-6">
                <div className="flex items-center gap-2 text-green-400 font-mono text-sm">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-ping"></div>
                  ONLINE
                </div>
              </div>
            </div>

            {favorites.length === 0 ? (
              <div className="text-center">
                <div className="bg-white/10 backdrop-blur-md rounded-3xl p-12 max-w-md mx-auto border border-white/20 relative overflow-hidden">
                  {/* Lignes de scan */}
                  <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/50 to-transparent animate-pulse"></div>
                  <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/50 to-transparent animate-pulse delay-500"></div>

                  <div className="text-6xl mb-4 text-yellow-400 animate-pulse">
                    ⚠
                  </div>
                  <h2 className="text-2xl font-bold text-white mb-4 font-mono tracking-wider">
                    AUCUNE DONNÉE
                  </h2>
                  <p className="text-blue-200 mb-6 font-mono tracking-wide">
                    Aucune ville configurée dans le système.
                  </p>
                  <a
                    href="/"
                    className="inline-block bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition-all duration-300 rounded-2xl px-8 py-3 font-bold text-white text-lg transform hover:scale-105 font-mono tracking-wider uppercase shadow-lg hover:shadow-xl"
                  >
                    &gt; INITIALISER SCAN
                  </a>
                </div>
              </div>
            ) : (
              <>
                {/* Header de données */}
                <div className="text-center mb-8">
                  <div className="inline-block bg-white/10 backdrop-blur-md px-6 py-2 border border-white/20 rounded-2xl font-mono text-blue-200 tracking-widest text-sm">
                    DONNÉES DÉTECTÉES: {favorites.length} LOCATIONS
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
                  {favorites.map((favorite, index) => (
                    <div
                      key={favorite.id}
                      className="bg-white/10 backdrop-blur-md rounded-3xl p-6 border border-white/20 hover:border-white/30 transition-all duration-300 hover:shadow-2xl relative overflow-hidden group"
                      style={{ animationDelay: `${index * 200}ms` }}
                    >
                      {/* Effets de scan */}
                      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/50 to-transparent animate-pulse"></div>
                      <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-purple-300/50 to-transparent animate-pulse delay-1000"></div>

                      {/* Indicateurs d'activité */}
                      <div className="absolute top-4 left-4 flex gap-2">
                        <div className="w-2 h-2 bg-green-400 rounded-full animate-ping"></div>
                        <div className="w-2 h-2 bg-blue-300 rounded-full animate-ping delay-300"></div>
                      </div>

                      {/* Statut */}
                      <div className="absolute top-4 right-4 text-xs font-mono text-blue-200 tracking-wider">
                        ACTIVE
                      </div>

                      <div className="flex items-center justify-between mb-6 mt-4">
                        <h3 className="text-xl font-bold text-white font-mono tracking-widest">
                          {favorite.city_name}
                        </h3>
                        <button
                          onClick={() => handleDeleteFavorite(favorite.id)}
                          className="text-red-400 hover:text-red-300 transition-colors p-2 rounded-full hover:bg-red-500/20 border border-red-400/30 hover:border-red-400/60 font-mono group"
                        >
                          <svg
                            className="w-5 h-5 group-hover:animate-pulse"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                        </button>
                      </div>

                      {/* Données météo */}
                      {/* Données météo */}
                      <div className="space-y-4">
                        <div className="bg-white/5 backdrop-blur-sm p-3 border border-blue-300/30 hover:border-blue-300/60 transition-all relative overflow-hidden rounded-2xl">
                          <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-blue-300/50 to-transparent animate-pulse"></div>
                          <div className="flex items-center justify-between">
                            <span className="text-blue-200 font-mono text-sm tracking-widest uppercase">
                              TEMP
                            </span>
                            <span className="text-white font-bold font-mono text-lg">
                              {favorite.temperature}°C
                            </span>
                          </div>
                        </div>

                        <div className="bg-white/5 backdrop-blur-sm p-3 border border-purple-300/30 hover:border-purple-300/60 transition-all relative overflow-hidden rounded-2xl">
                          <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-purple-300/50 to-transparent animate-pulse delay-200"></div>
                          <div className="flex items-center justify-between">
                            <span className="text-purple-200 font-mono text-sm tracking-widest uppercase">
                              STATUS
                            </span>
                            <span className="text-white font-bold font-mono">
                              {favorite.weather_condition}
                            </span>
                          </div>
                        </div>

                        <div className="bg-white/5 backdrop-blur-sm p-3 border border-green-300/30 hover:border-green-300/60 transition-all relative overflow-hidden rounded-2xl">
                          <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-green-300/50 to-transparent animate-pulse delay-400"></div>
                          <div className="flex items-center justify-between">
                            <span className="text-green-300 font-mono text-sm tracking-widest uppercase">
                              HUMID
                            </span>
                            <span className="text-white font-bold font-mono">
                              {favorite.humidity}%
                            </span>
                          </div>
                        </div>

                        <div className="bg-white/5 backdrop-blur-sm p-3 border border-cyan-300/30 hover:border-cyan-300/60 transition-all relative overflow-hidden rounded-2xl">
                          <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-cyan-300/50 to-transparent animate-pulse delay-600"></div>
                          <div className="flex items-center justify-between">
                            <span className="text-cyan-200 font-mono text-sm tracking-widest uppercase">
                              VENT
                            </span>
                            <span className="text-white font-bold font-mono">
                              {favorite.wind} km/h
                            </span>
                          </div>
                        </div>

                        <div className="bg-white/5 backdrop-blur-sm p-3 border border-pink-300/30 hover:border-pink-300/60 transition-all relative overflow-hidden rounded-2xl">
                          <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-pink-300/50 to-transparent animate-pulse delay-800"></div>
                          <div className="flex items-center justify-between">
                            <span className="text-pink-200 font-mono text-sm tracking-widest uppercase">
                              PRESSION
                            </span>
                            <span className="text-white font-bold font-mono">
                              {favorite.pressure} hPa
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Barre de progression */}
                      <div className="mt-6 mb-4">
                        <div className="w-full h-1 bg-white/20 overflow-hidden rounded">
                          <div className="h-full bg-gradient-to-r from-blue-400 to-purple-400 animate-pulse"></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Footer terminal */}
          <div className="mt-16 text-center">
            <div className="inline-block bg-white/10 backdrop-blur-md px-6 py-2 border border-white/20 rounded-2xl font-mono text-blue-200 tracking-widest text-xs">
              WEATHORA SYSTEM
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
