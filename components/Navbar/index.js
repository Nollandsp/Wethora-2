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
    <nav className="w-full bg-white/20 backdrop-blur-md shadow-md fixed top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* Logo avec lien vers la home */}
        <Link href="/" className="flex items-center">
          <Image
            src="/Logo-Weathora.png"
            alt="Logo Weathora"
            width={60}
            height={40}
            className="object-contain"
          />
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
          className="md:hidden text-white"
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle menu"
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Menu mobile */}
      {isOpen && (
        <div className="md:hidden px-4 pb-4 space-y-2 text-center bg-white/10 backdrop-blur-md">
          {!user && (
            <Link
              href="/Connexion"
              onClick={() => setIsOpen(false)}
              className={linkClass}
            >
              Connexion
            </Link>
          )}
          <Link
            href="/Inscription"
            onClick={() => setIsOpen(false)}
            className={linkClass}
          >
            Inscription
          </Link>
          <Link
            href="/Favoris"
            onClick={() => setIsOpen(false)}
            className={linkClass}
          >
            Favoris
          </Link>
          <Link
            href="/premium"
            onClick={() => setIsOpen(false)}
            className={linkClass}
          >
            Premium
          </Link>
          {user && (
            <Link
              href="/profil"
              onClick={() => setIsOpen(false)}
              className={linkClass}
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
              className="text-white text-base font-medium hover:text-red-400 transition duration-200 border border-red-400 rounded px-3 py-1 w-full"
            >
              Déconnexion
            </button>
          )}
        </div>
      )}
      {logoutMsg && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-4 py-2 rounded shadow-lg z-50">
          {logoutMsg}
        </div>
      )}
    </nav>
  );
}
