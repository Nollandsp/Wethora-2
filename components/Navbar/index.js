"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { useEffect } from "react";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [logoutMsg, setLogoutMsg] = useState("");

  useEffect(() => {
    const getSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      setUser(session?.user || null);
    };
    getSession();
    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user || null);
      }
    );
    return () => {
      listener?.subscription.unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setLogoutMsg("Déconnexion réussie !");
    setTimeout(() => {
      setLogoutMsg("");
      window.location.href = "/Connexion";
    }, 1500);
  };

  const linkClass =
    "text-white text-base font-medium hover:text-blue-200 transition duration-200";

  return (
    <nav className="w-full bg-black/80 backdrop-blur-xl shadow-2xl shadow-cyan-400/20 border-b-2 border-cyan-400/30 fixed top-0 z-50 relative overflow-hidden">
      {/* Effet de grille futuriste */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-400/5 to-transparent"></div>
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent"></div>

      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between relative z-10">
        {/* Logo avec lien vers la home */}
        <Link href="/" className="flex items-center group">
          <div className="relative">
            <div className="absolute inset-0 bg-cyan-400/20 blur-lg rounded-full scale-110 group-hover:scale-125 transition-transform"></div>
            <Image
              src="/Logo-Weathora.png"
              alt="Logo Weathora"
              width={60}
              height={40}
              className="object-contain relative z-10 filter brightness-110 group-hover:brightness-125 transition-all"
            />
          </div>
        </Link>

        {/* Menu desktop */}
        <div className="hidden md:flex space-x-6">
          {!user && (
            <Link href="/Connexion" className={linkClass}>
              Connexion
            </Link>
          )}
          <Link href="/Inscription" className={linkClass}>
            Inscription
          </Link>
          <Link href="/Favoris" className={linkClass}>
            Favoris
          </Link>
          <Link href="/premium" className={linkClass}>
            Premium
          </Link>
          {user && (
            <Link href="/profil" className={linkClass}>
              Profil
            </Link>
          )}
          {user && (
            <button
              onClick={handleLogout}
              className={linkClass + " bg-transparent focus:outline-none"}
            >
              Déconnexion
            </button>
          )}
        </div>

        {/* Bouton menu mobile */}
        <button
          className="md:hidden text-cyan-100 hover:text-cyan-300 transition-colors p-2 border border-cyan-400/30 rounded bg-black/60 backdrop-blur-sm hover:border-cyan-400/60 relative overflow-hidden group"
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle menu"
        >
          <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent animate-pulse"></div>
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Menu mobile */}
      {isOpen && (
        <div className="md:hidden flex flex-col items-center px-6 py-6 space-y-4 text-center bg-black/90 backdrop-blur-xl border-t border-cyan-400/30 relative overflow-hidden">
          {/* Effet de scan */}
          <div className="absolute top-2 left-4 flex gap-2">
            <div className="w-2 h-2 bg-cyan-400 rounded-full animate-ping"></div>
            <div className="w-2 h-2 bg-purple-400 rounded-full animate-ping delay-300"></div>
            <div className="w-2 h-2 bg-green-400 rounded-full animate-ping delay-600"></div>
          </div>

          <div className="absolute top-2 right-4 text-xs font-mono text-cyan-400 tracking-wider">
            MENU.EXE
          </div>

          {!user && (
            <Link
              href="/Connexion"
              onClick={() => setIsOpen(false)}
              className={linkClass + " w-full"}
            >
              Connexion
            </Link>
          )}
          <Link
            href="/Inscription"
            onClick={() => setIsOpen(false)}
            className={linkClass + " w-full"}
          >
            Inscription
          </Link>
          <Link
            href="/Favoris"
            onClick={() => setIsOpen(false)}
            className={linkClass + " w-full"}
          >
            Favoris
          </Link>
          <Link
            href="/premium"
            onClick={() => setIsOpen(false)}
            className={linkClass + " w-full"}
          >
            Premium
          </Link>
          {user && (
            <Link
              href="/profil"
              onClick={() => setIsOpen(false)}
              className={linkClass + " w-full"}
            >
              Profil
            </Link>
          )}
          {user && (
            <button
              onClick={() => {
                setIsOpen(false);
                handleLogout();
              }}
              className="text-cyan-100 text-base font-mono font-medium hover:text-red-400 transition duration-200 border border-red-400/50 hover:border-red-400 rounded px-4 py-2 w-full bg-black/60 backdrop-blur-sm relative overflow-hidden group"
            >
              <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-red-400/50 to-transparent animate-pulse"></div>
              Déconnexion
            </button>
          )}

          {/* Barre de progression factice */}
          <div className="mt-4 flex justify-center">
            <div className="w-32 h-1 bg-black/50 overflow-hidden rounded">
              <div className="h-full bg-gradient-to-r from-cyan-400 to-purple-400 animate-pulse"></div>
            </div>
          </div>
        </div>
      )}

      {logoutMsg && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 bg-black/90 backdrop-blur-xl border-2 border-green-400/50 text-green-400 font-mono px-4 py-2 rounded shadow-2xl shadow-green-400/20 z-50 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-green-400/50 to-transparent animate-pulse"></div>
          <div className="absolute top-1 left-2 w-2 h-2 bg-green-400 rounded-full animate-ping"></div>
          {logoutMsg}
        </div>
      )}
    </nav>
  );
}
