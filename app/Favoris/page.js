"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase/client";
import Navbar from "@/components/Navbar";
import Image from "next/image";

export default function Favoris() {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const getUser = async () => {
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
          setFavorites(data);
        }
      }
      setLoading(false);
    };

    getUser();
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
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-yellow-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
          <div className="absolute top-40 left-40 w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
        </div>

        <div className="relative z-10 pt-20 pb-8">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <div className="relative inline-block mb-6">
                <div className="absolute inset-0 bg-gradient-to-r from-yellow-500 to-orange-600 rounded-full blur-lg opacity-75"></div>
                <Image
                  src="/Logo-weathora.png"
                  alt="Weathora"
                  width={100}
                  height={80}
                  className="relative z-10 mx-auto"
                />
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 bg-gradient-to-r from-white to-yellow-200 bg-clip-text text-transparent">
                Mes Favoris
              </h1>
              <p className="text-blue-200 text-lg max-w-md mx-auto">
                Retrouvez toutes vos villes favorites
              </p>
            </div>

            {favorites.length === 0 ? (
              <div className="text-center">
                <div className="bg-white/10 backdrop-blur-md rounded-3xl p-12 max-w-md mx-auto border border-white/20">
                  <div className="text-6xl mb-4">⭐</div>
                  <h2 className="text-2xl font-bold text-white mb-4">
                    Aucun favori
                  </h2>
                  <p className="text-blue-200 mb-6">
                    Vous n'avez pas encore ajouté de villes à vos favoris.
                  </p>
                  <a
                    href="/"
                    className="inline-block bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition-all duration-300 rounded-2xl px-8 py-3 font-bold text-white text-lg shadow-lg hover:shadow-xl"
                  >
                    Découvrir des villes
                  </a>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
                {favorites.map((favorite) => (
                  <div
                    key={favorite.id}
                    className="bg-white/10 backdrop-blur-md rounded-3xl p-6 border border-white/20 hover:border-white/30 transition-all duration-300 hover:shadow-2xl"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-xl font-bold text-white">
                        {favorite.city_name}
                      </h3>
                      <button
                        onClick={() => handleDeleteFavorite(favorite.id)}
                        className="text-red-400 hover:text-red-300 transition-colors p-2 rounded-full hover:bg-red-500/20"
                      >
                        <svg
                          className="w-5 h-5"
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

                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-blue-200">Température</span>
                        <span className="text-white font-semibold">
                          {favorite.temperature}°C
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-blue-200">Conditions</span>
                        <span className="text-white font-semibold">
                          {favorite.weather_condition}
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-blue-200">Humidité</span>
                        <span className="text-white font-semibold">
                          {favorite.humidity}%
                        </span>
                      </div>
                    </div>

                    <div className="mt-6">
                      <a
                        href={`/?city=${encodeURIComponent(
                          favorite.city_name
                        )}`}
                        className="block w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition-all duration-300 rounded-2xl py-3 font-bold text-white text-center shadow-lg hover:shadow-xl"
                      >
                        Voir la météo
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
