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
      <div className="relative z-10 flex flex-col items-center justify-start h-full text-center pt-36 px-4 text-white">
        <a href="/index.html">
          <Image
            src="/Logo-Weathora.png"
            alt="Weathora"
            width={150}
            height={150}
            className="mb-4"
          />
        </a>
        <h2 className="text-4xl font-semibold mt-4 mb-4">
          Bienvenue sur Weathora
        </h2>
        <h4 className="text-base max-w-xl">
          Votre météo de confiance, pour illuminer vos journées et vous guider
          en douceur, qu’il pleuve ou qu’il fasse soleil.
        </h4>
        <button
          id="scrollToForecast"
          className="mt-6 px-8 py-3 rounded-xl text-sm font-bold uppercase tracking-wide transition-all
                     bg-blue-600 text-white shadow-lg hover:bg-blue-700 hover:shadow-xl active:bg-blue-800 active:shadow-md"
        >
          Découvrir la météo du jour
        </button>
      </div>
    </header>
  );
}
