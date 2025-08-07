"use client";

import Image from "next/image";
import { useEffect } from "react";

export default function Header() {
  useEffect(() => {
    const scrollBtn = document.getElementById("scrollToForecast");

    const handleClick = () => {
      const target = document.getElementById("decouvrir");
      if (target) {
        target.scrollIntoView({ behavior: "smooth" });
      } else {
        console.warn("Element with id 'decouvrir' not found.");
      }
    };

    scrollBtn?.addEventListener("click", handleClick);

    return () => {
      scrollBtn?.removeEventListener("click", handleClick);
    };
  }, []);

  return (
    <header className="relative h-screen w-full overflow-hidden">
      <Image
        src="/nicolas-hippert-_7yudZhd6Cw-unsplash.jpg"
        alt="Landscape"
        fill
        className="object-cover z-0"
        priority
      />

      {/* Overlay cyberpunk */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/60 z-5"></div>
      <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 via-transparent to-purple-500/10 z-5"></div>

      {/* Grille futuriste */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent z-5"></div>
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent z-5"></div>
      <div className="absolute top-0 bottom-0 left-0 w-px bg-gradient-to-b from-transparent via-cyan-400/30 to-transparent z-5"></div>
      <div className="absolute top-0 bottom-0 right-0 w-px bg-gradient-to-b from-transparent via-cyan-400/30 to-transparent z-5"></div>

      {/* Effets de fond animés */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-400/5 rounded-full blur-3xl animate-pulse z-5"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-400/5 rounded-full blur-3xl animate-pulse delay-1000 z-5"></div>

      <div className="relative z-10 flex flex-col items-center justify-start h-full text-center pt-36 px-4 text-cyan-100">
        <a href="/index.html">
          <div className="relative mb-4">
            <div className="absolute inset-0 bg-cyan-400/20 blur-xl rounded-full"></div>
            <Image
              src="/Logo-Weathora.png"
              alt="Weathora"
              width={150}
              height={150}
              className="relative z-10 filter brightness-110 drop-shadow-2xl"
            />
          </div>
        </a>

        <h2 className="text-4xl font-bold mt-4 mb-4 font-mono tracking-widest drop-shadow-2xl">
          <span className="text-cyan-400">&gt;</span> WEATHORA{" "}
          <span className="text-cyan-400">&lt;</span>
        </h2>

        <h4 className="text-base max-w-xl font-mono tracking-wide text-cyan-300/90 opacity-90 leading-relaxed drop-shadow-lg">
          [SYSTEM_INITIALIZED] Votre météo de confiance, interface futuriste
          pour illuminer vos journées et vous guider en douceur, qu'il pleuve ou
          qu'il fasse soleil.
        </h4>

        <button
          id="scrollToForecast"
          className="mt-8 px-8 py-4 text-sm font-bold text-black uppercase tracking-widest transition-all transform hover:scale-105 bg-gradient-to-r from-cyan-400 to-cyan-500 hover:from-cyan-300 hover:to-cyan-400 shadow-2xl shadow-cyan-400/30 hover:shadow-cyan-400/50 font-mono relative overflow-hidden"
          type="button"
        >
          <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/50 to-transparent animate-pulse"></div>
          &gt; SCAN_WEATHER.EXE
        </button>

        {/* Indicateurs de statut */}
        <div className="flex justify-center gap-3 mt-8">
          <div className="w-3 h-3 bg-green-400 rounded-full animate-ping"></div>
          <div className="w-3 h-3 bg-cyan-400 rounded-full animate-ping delay-300"></div>
          <div className="w-3 h-3 bg-purple-400 rounded-full animate-ping delay-600"></div>
        </div>
      </div>
    </header>
  );
}
