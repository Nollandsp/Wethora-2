"use client";

import { useEffect, useState } from "react";

export default function ForecastExtended({ fullCityName }) {
  const [forecastData, setForecastData] = useState([]);
  const API_KEY = "8eb2d4000ed188a4ae05666fa24891c9";

  useEffect(() => {
    console.log("Ville reçue dans ForecastExtended:", fullCityName); // <--- debug

    if (!fullCityName) {
      setForecastData([]);
      return;
    }

    const fetchForecast = async () => {
      try {
        const res = await fetch(
          `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(
            fullCityName
          )}&appid=${API_KEY}&units=metric&lang=fr`
        );

        if (!res.ok) {
          console.error("Erreur fetch:", res.status, res.statusText);
          setForecastData([]);
          return;
        }

        const data = await res.json();

        if (!data.list) {
          console.warn("Pas de liste dans la réponse API");
          setForecastData([]);
          return;
        }

        const days = {};
        data.list.forEach((entry) => {
          const date = new Date(entry.dt_txt);
          const day = date.toLocaleDateString("fr-FR", { weekday: "short" });
          if (!days[day] && date.getHours() === 12) {
            days[day] = entry;
          }
        });

        const formattedForecast = Object.entries(days).map(([day, entry]) => ({
          day,
          icon: entry.weather[0].icon,
          desc: entry.weather[0].description,
          temp: entry.main.temp.toFixed(1),
        }));

        setForecastData(formattedForecast);
      } catch (err) {
        console.error("Erreur lors du chargement des prévisions météo", err);
        setForecastData([]);
      }
    };

    fetchForecast();
  }, [fullCityName]);

  return (
    <section className="w-full max-w-xl mx-auto px-6 py-6 bg-white/15 backdrop-blur-xl border border-white/20 rounded-3xl text-white shadow-2xl my-8">
      <h3 className="text-2xl font-bold mb-6 text-center">
        Prévisions sur 5 jours {fullCityName && `pour ${fullCityName}`}
      </h3>

      <div className="flex justify-center gap-6 flex-wrap">
        {forecastData.length === 0 ? (
          <p className="text-white/80 italic">Aucune donnée pour l’instant.</p>
        ) : (
          forecastData.map((item, index) => (
            <div
              key={index}
              className="bg-white/10 backdrop-blur-sm border border-white/30 rounded-2xl p-5 w-24 flex flex-col items-center shadow-lg"
            >
              <p className="font-semibold text-lg capitalize mb-2">
                {item.day}
              </p>
              <img
                src={`https://openweathermap.org/img/wn/${item.icon}@2x.png`}
                alt={item.desc}
                className="mb-2"
                width={48}
                height={48}
              />
              <p className="text-xl font-bold mb-1">{item.temp}°C</p>
              <p className="text-xs capitalize text-white/70 text-center">
                {item.desc}
              </p>
            </div>
          ))
        )}
      </div>
    </section>
  );
}
