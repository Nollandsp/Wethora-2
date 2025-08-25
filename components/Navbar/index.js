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
    <nav className="w-full bg-gray-900/60 backdrop-blur-lg shadow-lg border-b border-gray-800 fixed top-0 z-[9999]">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="/Logo-Weathora.png"
            alt="Logo Weathora"
            width={50}
            height={50}
            className="object-contain h-[50px] w-auto"
          />
        </Link>

        {/* Menu desktop */}
        <div className="hidden md:flex items-center gap-8 text-gray-300 font-medium">
          {!user && (
            <Link
              href="/Connexion"
              className="hover:text-white transition-colors"
            >
              Connexion
            </Link>
          )}
          <Link
            href="/Inscription"
            className="hover:text-white transition-colors"
          >
            Inscription
          </Link>
          <Link href="/Favoris" className="hover:text-white transition-colors">
            Favoris
          </Link>
          <Link href="/premium" className="hover:text-white transition-colors">
            Premium
          </Link>
          {user && (
            <Link href="/profil" className="hover:text-white transition-colors">
              Profil
            </Link>
          )}
          {user && (
            <button
              onClick={handleLogout}
              className="text-gray-300 hover:text-red-400 transition-colors"
            >
              Déconnexion
            </button>
          )}
        </div>

        {/* Bouton menu mobile */}
        <button
          className="md:hidden text-gray-300 hover:text-white p-2 rounded-lg hover:bg-white/10 transition-colors"
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle menu"
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Menu mobile */}
      {isOpen && (
        <div
          className="md:hidden flex flex-col items-center gap-4 px-6 py-6 
                    text-gray-300 bg-gray-900/60 backdrop-blur-lg 
                    border-t border-gray-800 shadow-lg"
        >
          {!user && (
            <Link
              href="/Connexion"
              onClick={() => setIsOpen(false)}
              className="hover:text-white transition-colors"
            >
              Connexion
            </Link>
          )}
          <Link
            href="/Inscription"
            onClick={() => setIsOpen(false)}
            className="hover:text-white transition-colors"
          >
            Inscription
          </Link>
          <Link
            href="/Favoris"
            onClick={() => setIsOpen(false)}
            className="hover:text-white transition-colors"
          >
            Favoris
          </Link>
          <Link
            href="/premium"
            onClick={() => setIsOpen(false)}
            className="hover:text-white transition-colors"
          >
            Premium
          </Link>
          {user && (
            <Link
              href="/profil"
              onClick={() => setIsOpen(false)}
              className="hover:text-white transition-colors"
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
              className="text-red-400 font-medium hover:text-red-300 transition-colors"
            >
              Déconnexion
            </button>
          )}
        </div>
      )}
    </nav>
  );
}
