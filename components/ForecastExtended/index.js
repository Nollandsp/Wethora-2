"use client";

import { useEffect, useState } from "react";

export default function ForecastExtended({ fullCityName }) {
  const [forecast, setForecast] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const API_KEY = "8eb2d4000ed188a4ae05666fa24891c9";

  useEffect(() => {
    if (!fullCityName) {
      setForecast([]);
      setError("");
      return;
    }

    const fetchForecast = async () => {
      try {
        setLoading(true);
        setError("");

        // 🔹 Récupération des prévisions 5 jours
        const resForecast = await fetch(
          `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(
            fullCityName
          )}&appid=${API_KEY}&units=metric&lang=fr`
        );
        const dataForecast = await resForecast.json();

        if (!dataForecast.list) {
          setForecast([]);
          return;
        }

        // 🔹 Filtrer uniquement les heures à 12h
        const days = {};
        dataForecast.list.forEach((entry) => {
          const date = new Date(entry.dt_txt);
          const day = date.toLocaleDateString("fr-FR", { weekday: "short" });
          if (!days[day] && date.getHours() === 12) {
            days[day] = entry;
          }
        });

        const formattedForecast = Object.entries(days).map(([day, entry]) => ({
          day,
          icon: entry.weather[0].icon,
          temp: entry.main.temp.toFixed(1),
          desc: entry.weather[0].description,
        }));

        setForecast(formattedForecast);
      } catch (err) {
        console.error(err);
        setError("Erreur lors du chargement des prévisions");
        setForecast([]);
      } finally {
        setLoading(false);
      }
    };

    fetchForecast();
  }, [fullCityName]);

  if (!fullCityName) return null;

  return (
    <section
      className="w-full max-w-6xl mx-auto px-4 sm:px-6 md:px-8 lg:px-12 py-6
  bg-white/10 backdrop-blur-lg border border-white/20 rounded-3xl text-white shadow-2xl my-8"
    >
      <h3 className="text-2xl md:text-3xl font-bold mb-6 text-center">
        Prévisions sur 5 jours pour {fullCityName}
      </h3>

      {loading && (
        <p className="text-white/80 italic text-center">Chargement...</p>
      )}
      {error && <p className="text-red-400 text-center mb-4">{error}</p>}

      {!loading && !error && forecast.length > 0 && (
        <div className="flex justify-center gap-4 sm:gap-6 md:gap-8 flex-wrap">
          {forecast.map((item, idx) => (
            <div
              key={idx}
              className="bg-[#4a148c] border border-white/30 rounded-2xl p-4 sm:p-6
            w-32 sm:w-36 md:w-36 lg:w-44 flex flex-col items-center shadow-lg mb-4"
            >
              <p className="font-semibold text-lg md:text-xl capitalize mb-2">
                {item.day}
              </p>
              <img
                src={`https://openweathermap.org/img/wn/${item.icon}@2x.png`}
                alt={item.desc}
                width={64}
                height={64}
                className="mb-2"
              />
              <p className="text-xl md:text-2xl font-bold mb-1">
                {item.temp}°C
              </p>
              <p className="text-sm md:text-base capitalize text-white/70 text-center">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      )}

      {!loading && !error && forecast.length === 0 && (
        <p className="text-white/80 italic text-center">
          Aucune donnée pour l’instant.
        </p>
      )}
    </section>
  );
}
