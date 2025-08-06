"use client";

import { useEffect, useState } from "react";

export default function ForecastExtended({ fullCityName }) {
  const [forecastData, setForecastData] = useState([]);
  const API_KEY = "8eb2d4000ed188a4ae05666fa24891c9";

  useEffect(() => {
    if (!fullCityName) return;

    const fetchForecast = async () => {
      try {
        const res = await fetch(
          `https://api.openweathermap.org/data/2.5/forecast?q=${fullCityName}&appid=${API_KEY}&units=metric&lang=fr`
        );
        const data = await res.json();

        const days = {};
        data.list.forEach((entry) => {
          const date = new Date(entry.dt_txt);
          const day = date.toLocaleDateString("fr-FR", { weekday: "short" });
          const time = date.getHours();
          if (!days[day] && time === 12) {
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
      }
    };

    fetchForecast();
  }, [fullCityName]);

  return (
    <section className="w-4/5 p-8 bg-white/30 backdrop-blur-md rounded-2xl mx-auto max-w-[900px] text-center text-[var(--color2-text)] my-8 forecast-extended">
      <h3 className="text-[1.8rem] mb-4">Prévisions sur 5 jours</h3>

      <div className="flex flex-wrap justify-center gap-4 forecast-cards">
        {forecastData.length === 0 ? (
          <p className="text-white text-sm italic">
            Aucune donnée pour l’instant.
          </p>
        ) : (
          forecastData.map((item, index) => (
            <div
              key={index}
              className="bg-white/20 text-white rounded-xl p-4 w-32 shadow-md"
            >
              <p className="font-bold capitalize mb-1">{item.day}</p>
              <img
                src={`https://openweathermap.org/img/wn/${item.icon}.png`}
                alt={item.desc}
                className="mx-auto"
              />
              <p className="text-lg font-semibold">{item.temp}°C</p>
              <p className="text-xs capitalize">{item.desc}</p>
            </div>
          ))
        )}
      </div>
    </section>
  );
}
