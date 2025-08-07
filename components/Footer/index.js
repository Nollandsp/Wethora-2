export default function Footer() {
  return (
    <footer className="w-full px-5 py-[30px] bg-black/80 backdrop-blur-xl border-t-2 border-cyan-400/30 text-cyan-100 text-center text-[0.95rem] shadow-2xl shadow-cyan-400/10 relative overflow-hidden">
      {/* Effets de fond futuristes */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-400/5 to-transparent"></div>
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent animate-pulse"></div>

      <div className="relative z-10">
        <p className="my-2 opacity-90 leading-[1.5] font-mono tracking-wide">
          <span className="text-cyan-400">&gt;</span> © 2025 WEATHORA.EXE{" "}
          <span className="text-cyan-400">&lt;</span>
        </p>
        <p className="my-2 opacity-80 leading-[1.5] text-cyan-300/80 font-mono tracking-wider text-sm">
          [DESIGNED_BY: DA_SILVA_PEREIRA_NOLLAN]
        </p>

        {/* Indicateurs de statut */}
        <div className="flex justify-center gap-2 mt-4">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-ping"></div>
          <div className="w-2 h-2 bg-cyan-400 rounded-full animate-ping delay-300"></div>
          <div className="w-2 h-2 bg-purple-400 rounded-full animate-ping delay-600"></div>
        </div>
      </div>
    </footer>
  );
}
