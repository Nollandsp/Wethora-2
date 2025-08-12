export default function Footer() {
  return (
    <footer className="w-full px-6 py-6 bg-white/10 backdrop-blur-lg border-t border-white/20 text-white text-center text-sm shadow-2xl shadow-black/20 relative overflow-hidden ">
      {/* Effets de fond subtils */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-purple-700/10 to-transparent pointer-events-none"></div>
      <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-24 h-px bg-gradient-to-r from-transparent via-purple-400/50 to-transparent animate-pulse"></div>

      <div className="relative z-10">
        <p className="my-1 opacity-90 leading-relaxed font-semibold tracking-wide font-sans">
          <span className="text-green-400"></span> © 2025 WEATHORA
        </p>
        <p className="my-1 opacity-70 leading-relaxed tracking-wide font-mono text-xs md:text-sm">
          CREATION BY DA SILVA PEREIRA NOLLAN
        </p>
      </div>
    </footer>
  );
}
