"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { supabase } from "@/lib/supabase/client";
import Navbar from "@/components/Navbar";

export default function Profil() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const router = useRouter();

  const getUser = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        setUser(user);
        setName(user.user_metadata?.full_name || "");
        setEmail(user.email || "");
      } else {
        router.push("/Connexion");
      }
    } catch (error) {
      console.error("Erreur lors de la récupération de l'utilisateur:", error);
      router.push("/Connexion");
    }
    setLoading(false);
  };

  useEffect(() => {
    getUser();
  }, []);

  const updateName = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    try {
      const { error } = await supabase.auth.updateUser({
        data: { full_name: name },
      });

      if (error) {
        setError("Erreur lors de la modification du nom : " + error.message);
      } else {
        setMessage("Nom modifié avec succès");
      }
    } catch (err) {
      setError("Erreur lors de la modification du nom");
    }
    setLoading(false);
  };

  const updateEmail = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    try {
      const { error } = await supabase.auth.updateUser({
        email: email,
      });

      if (error) {
        setError(
          "Erreur lors de la modification de l'email : " + error.message
        );
      } else {
        setMessage(
          "Email modifié avec succès. Vérifiez votre boîte mail pour confirmer."
        );
      }
    } catch (err) {
      setError("Erreur lors de la modification de l'email");
    }
    setLoading(false);
  };

  const updatePassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    if (newPassword !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas");
      setLoading(false);
      return;
    }

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        setError(
          "Erreur lors de la modification du mot de passe : " + error.message
        );
      } else {
        setMessage("Mot de passe modifié avec succès");
        setNewPassword("");
        setConfirmPassword("");
      }
    } catch (err) {
      setError("Erreur lors de la modification du mot de passe");
    }
    setLoading(false);
  };

  const deleteAccount = async () => {
    setLoading(true);
    setError("");
    setMessage("");

    try {
      // Récupérer la session actuelle pour obtenir le token
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        setError("Session non trouvée");
        return;
      }

      // Appeler l'API route pour supprimer le compte côté serveur
      const response = await fetch("/api/delete-user", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        setError(
          "Erreur lors de la suppression : " + (data.error || "Erreur inconnue")
        );
      } else {
        setMessage("Données supprimées avec succès");
        setTimeout(() => {
          router.push("/");
        }, 2000);
      }
    } catch (err) {
      setError("Erreur lors de la suppression");
    }
    setLoading(false);
    setShowDeleteModal(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex items-center justify-center">
        <div className="text-white text-xl animate-pulse">Chargement...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

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

        <div className="relative z-10 pt-20 pb-8">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              {/* Header Section */}
              <div className="text-center mb-12">
                <div className="relative inline-block mb-6">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full blur-lg opacity-75"></div>
                  <Image
                    src="/Logo-weathora.png"
                    alt="Weathora"
                    width={100}
                    height={80}
                    className="relative z-10 mx-auto"
                  />
                </div>
                <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
                  Mon Profil
                </h1>
                <p className="text-blue-200 text-lg max-w-md mx-auto">
                  Gérez vos informations personnelles et vos préférences
                </p>
              </div>

              {/* Messages */}
              {message && (
                <div className="mb-8 p-4 bg-green-500/20 border border-green-500/30 rounded-2xl backdrop-blur-sm">
                  <div className="flex items-center justify-center text-green-300 font-semibold">
                    <svg
                      className="w-5 h-5 mr-2"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    {message}
                  </div>
                </div>
              )}

              {error && (
                <div className="mb-8 p-4 bg-red-500/20 border border-red-500/30 rounded-2xl backdrop-blur-sm">
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

              {/* Profile Sections Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Personal Information */}
                <div className="space-y-6">
                  {/* Update Name */}
                  <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 hover:border-white/30 transition-all duration-300">
                    <h2 className="text-xl font-bold text-white mb-4 flex items-center">
                      <svg
                        className="w-5 h-5 mr-2 text-blue-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                        />
                      </svg>
                      Modifier le pseudo
                    </h2>
                    <form onSubmit={updateName} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-blue-200 mb-2">
                          Nom
                        </label>
                        <input
                          type="text"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="Votre pseudo"
                          className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent text-white placeholder-blue-300 transition-all duration-300"
                          required
                        />
                      </div>
                      <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 active:from-blue-800 active:to-purple-800 transition-all duration-300 rounded-xl py-3 font-bold text-white shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {loading ? "Modification..." : "Modifier le pseudo"}
                      </button>
                    </form>
                  </div>

                  {/* Update Email */}
                  <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 hover:border-white/30 transition-all duration-300">
                    <h2 className="text-xl font-bold text-white mb-4 flex items-center">
                      <svg
                        className="w-5 h-5 mr-2 text-green-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                        />
                      </svg>
                      Modifier l'email
                    </h2>
                    <form onSubmit={updateEmail} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-blue-200 mb-2">
                          Email
                        </label>
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="votre@email.com"
                          className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent text-white placeholder-blue-300 transition-all duration-300"
                          required
                        />
                      </div>
                      <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 active:from-green-800 active:to-blue-800 transition-all duration-300 rounded-xl py-3 font-bold text-white shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {loading ? "Modification..." : "Modifier l'email"}
                      </button>
                    </form>
                  </div>
                </div>

                {/* Security Section */}
                <div className="space-y-6">
                  {/* Update Password */}
                  <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 hover:border-white/30 transition-all duration-300">
                    <h2 className="text-xl font-bold text-white mb-4 flex items-center">
                      <svg
                        className="w-5 h-5 mr-2 text-yellow-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                        />
                      </svg>
                      Modifier le mot de passe
                    </h2>
                    <form onSubmit={updatePassword} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-blue-200 mb-2">
                          Nouveau mot de passe
                        </label>
                        <input
                          type="password"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          placeholder="••••••••"
                          className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent text-white placeholder-blue-300 transition-all duration-300"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-blue-200 mb-2">
                          Confirmer le mot de passe
                        </label>
                        <input
                          type="password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="••••••••"
                          className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent text-white placeholder-blue-300 transition-all duration-300"
                          required
                        />
                      </div>
                      <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 active:from-yellow-800 active:to-orange-800 transition-all duration-300 rounded-xl py-3 font-bold text-white shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {loading
                          ? "Modification..."
                          : "Modifier le mot de passe"}
                      </button>
                    </form>
                  </div>

                  {/* Delete Account */}
                  <div className="bg-gradient-to-r from-red-500/20 to-pink-500/20 backdrop-blur-md rounded-2xl p-6 border border-red-500/30 hover:border-red-500/50 transition-all duration-300">
                    <h2 className="text-xl font-bold text-white mb-4 flex items-center">
                      <svg
                        className="w-5 h-5 mr-2 text-red-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                      Zone dangereuse
                    </h2>
                    <p className="text-red-200 mb-4 text-sm">
                      Cette action supprimera tous vos favoris et vous
                      déconnectera définitivement. Vous pourrez toujours vous
                      reconnecter avec vos identifiants.
                    </p>
                    <button
                      onClick={() => setShowDeleteModal(true)}
                      className="w-full bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 active:from-red-800 active:to-pink-800 transition-all duration-300 rounded-xl py-3 font-bold text-white shadow-lg hover:shadow-xl"
                    >
                      Supprimer mes données
                    </button>
                  </div>
                </div>
              </div>

              {/* Delete Confirmation Modal */}
              {showDeleteModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                  <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 max-w-md w-full border border-white/20">
                    <h3 className="text-2xl font-bold text-white mb-4 text-center">
                      Confirmer la suppression
                    </h3>
                    <p className="text-blue-200 mb-8 text-center">
                      Êtes-vous sûr de vouloir supprimer tous vos favoris et
                      vous déconnecter ? Vous pourrez toujours vous reconnecter
                      avec vos identifiants.
                    </p>
                    <div className="flex gap-4">
                      <button
                        onClick={() => setShowDeleteModal(false)}
                        className="flex-1 bg-gray-500/50 hover:bg-gray-500/70 text-white py-3 rounded-xl font-semibold transition-all duration-300"
                      >
                        Annuler
                      </button>
                      <button
                        onClick={deleteAccount}
                        disabled={loading}
                        className="flex-1 bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white py-3 rounded-xl font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {loading ? "Suppression..." : "Supprimer"}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
