"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { supabase } from "@/lib/supabase/client";
import Navbar from "@/components/Navbar";

export default function Inscription() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const router = useRouter();
  const [pseudo, setPseudo] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    if (password !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas");
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        setError(error.message);
        setLoading(false);
        return;
      }

      const user = data.user;

      if (user) {
        // Insertion manuelle dans la table `profiles`
        const { error: profileError } = await supabase.from("profiles").insert([
          {
            id: user.id,
            pseudo: pseudo,
            is_premium: false,
          },
        ]);

        if (profileError) {
          console.error(
            "Erreur lors de la création du profil :",
            profileError.message
          );
          setError("Erreur lors de la création du profil.");
        } else {
          setSuccess(
            "Votre compte a bien été créé ! Vous pouvez vous connecter."
          );
          // Redirection après 2 secondes
          setTimeout(() => {
            router.push("/Connexion");
          }, 2000);
        }
      }
    } catch (err) {
      setError("Erreur lors de l'inscription.");
    }
    setLoading(false);
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-yellow-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
          <div className="absolute top-40 left-40 w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
        </div>

        <div className="relative z-10 min-h-screen flex items-center justify-center pt-20">
          <div className="bg-white/10 backdrop-blur-md rounded-3xl shadow-2xl p-8 sm:p-12 w-full max-w-md mx-4 border border-white/20">
            <div className="text-center mb-8">
              <div className="relative inline-block mb-6">
                <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-blue-600 rounded-full blur-lg opacity-75"></div>
                <Image
                  src="/Logo-weathora.png"
                  alt="Weathora"
                  width={100}
                  height={80}
                  className="relative z-10 mx-auto"
                />
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 bg-gradient-to-r from-white to-green-200 bg-clip-text text-transparent">
                Inscription
              </h1>
              <p className="text-blue-200 text-lg">
                Créez votre compte Weathora
              </p>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-500/20 border border-red-500/30 rounded-2xl backdrop-blur-sm">
                <div className="flex items-center justify-center text-red-300 font-semibold">
                  <svg
                    className="w-5 h-5 mr-2"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                  {error}
                </div>
              </div>
            )}

            {success && (
              <div className="mb-6 p-4 bg-green-500/20 border border-green-500/30 rounded-2xl backdrop-blur-sm">
                <div className="flex items-center justify-center text-green-300 font-semibold">
                  <svg
                    className="w-5 h-5 mr-2"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM16.707 7.293a1 1 0 00-1.414-1.414L9 12.172 6.707 9.879a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l7-7z"
                      clipRule="evenodd"
                    />
                  </svg>
                  {success}
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-blue-200 mb-3">
                  Pseudo
                </label>
                <input
                  type="text"
                  value={pseudo}
                  onChange={(e) => setPseudo(e.target.value)}
                  placeholder="Votre pseudo"
                  className="w-full px-6 py-4 bg-white/20 border border-white/30 rounded-2xl focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent text-white placeholder-blue-300 transition-all duration-300 text-lg"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-blue-200 mb-3">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="votre@email.com"
                  className="w-full px-6 py-4 bg-white/20 border border-white/30 rounded-2xl focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent text-white placeholder-blue-300 transition-all duration-300 text-lg"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-blue-200 mb-3">
                  Mot de passe
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-6 py-4 bg-white/20 border border-white/30 rounded-2xl focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent text-white placeholder-blue-300 transition-all duration-300 text-lg"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-blue-200 mb-3">
                  Confirmer le mot de passe
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-6 py-4 bg-white/20 border border-white/30 rounded-2xl focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent text-white placeholder-blue-300 transition-all duration-300 text-lg"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 active:from-green-800 active:to-blue-800 transition-all duration-300 rounded-2xl py-4 font-bold text-white text-lg shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Inscription..." : "S'inscrire"}
              </button>
            </form>

            <div className="mt-8 text-center">
              <p className="text-blue-200 mb-4">Déjà un compte ?</p>
              <a
                href="/Connexion"
                className="inline-block bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition-all duration-300 rounded-2xl px-8 py-3 font-bold text-white text-lg shadow-lg hover:shadow-xl"
              >
                Se connecter
              </a>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
