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
      // Récupérer user avec la méthode async getUser()
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        setError("Utilisateur non connecté ou erreur récupération utilisateur");
        setLoading(false);
        return;
      }

      console.log("Current user:", user);

      const { error: authError } = await supabase.auth.updateUser({
        data: { full_name: name },
      });

      if (authError) {
        setError(
          "Erreur lors de la modification du pseudo dans auth : " +
            authError.message
        );
        setLoading(false);
        return;
      }

      const { error: dbError } = await supabase
        .from("profiles")
        .update({ pseudo: name })
        .eq("id", user.id);

      if (dbError) {
        console.error(dbError);
        setError(
          "Erreur lors de la modification du pseudo dans profiles : " +
            dbError.message
        );
      } else {
        setMessage("Pseudo modifié avec succès");
      }
    } catch (err) {
      setError("Erreur lors de la modification du pseudo");
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
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        setError("Session non trouvée");
        setLoading(false);
        return;
      }

      const response = await fetch("/api/delete-user", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      const data = await response.json();
      console.log("delete response:", data);

      if (!response.ok) {
        setError(
          "Erreur lors de la suppression : " + (data.error || "Erreur inconnue")
        );
      } else {
        setMessage("Données supprimées avec succès");

        // Déconnecter l'utilisateur côté client
        await supabase.auth.signOut();

        // Fermer la modale
        setShowDeleteModal(false);

        // Rediriger vers la page d'accueil
        router.push("/");
      }
    } catch (err) {
      console.error("Erreur lors de la suppression:", err);
      setError("Erreur lors de la suppression");
    } finally {
      setLoading(false);
    }
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

        <div className="relative z-10 pt-20 pb-6">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              {/* Header */}
              <div className="text-center mb-5">
                <div className="relative inline-block mb-4">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full blur-lg opacity-75"></div>
                  <Image
                    src="/Logo-weathora.png"
                    alt="Weathora"
                    width={80}
                    height={60}
                    className="relative z-10 mx-auto"
                  />
                </div>
                <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
                  Mon Profil
                </h1>
                <p className="text-blue-200 text-base max-w-md mx-auto">
                  Gérez vos informations personnelles et vos préférences
                </p>
              </div>

              {/* Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Bloc 1 */}
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 border border-white/20 hover:border-white/30 flex flex-col justify-between h-full">
                  <h2 className="text-lg font-bold text-white mb-2 flex items-center">
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
                  <form
                    onSubmit={updateName}
                    className="space-y-2 flex flex-col flex-1 justify-between"
                  >
                    <div>
                      <label className="block text-sm font-medium text-blue-200 mb-1">
                        Nom
                      </label>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Votre pseudo"
                        className="w-full px-3 py-1.5 bg-white/20 border border-white/30 rounded-xl text-white placeholder-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
                      />
                    </div>
                    <button
                      type="submit"
                      className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 py-1.5 rounded-xl font-bold text-white"
                    >
                      Modifier le pseudo
                    </button>
                  </form>
                </div>

                {/* Bloc 2 */}
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 border border-white/20 hover:border-white/30 flex flex-col justify-between h-full">
                  <h2 className="text-lg font-bold text-white mb-2 flex items-center">
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
                  <form
                    onSubmit={updateEmail}
                    className="space-y-2 flex flex-col flex-1 justify-between"
                  >
                    <div>
                      <label className="block text-sm font-medium text-blue-200 mb-1">
                        Email
                      </label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="email@exemple.com"
                        className="w-full px-3 py-1.5 bg-white/20 border border-white/30 rounded-xl text-white placeholder-blue-300 focus:outline-none focus:ring-2 focus:ring-green-400"
                      />
                    </div>
                    <button
                      type="submit"
                      className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 py-1.5 rounded-xl font-bold text-white"
                    >
                      Modifier l'email
                    </button>
                  </form>
                </div>

                {/* Bloc 3 */}
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 border border-white/20 hover:border-white/30 flex flex-col justify-between h-full">
                  <h2 className="text-lg font-bold text-white mb-2 flex items-center">
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
                  <form
                    onSubmit={updatePassword}
                    className="space-y-2 flex flex-col flex-1 justify-between"
                  >
                    <div>
                      <label className="block text-sm font-medium text-blue-200 mb-1">
                        Nouveau mot de passe
                      </label>
                      <input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full px-3 py-1.5 bg-white/20 border border-white/30 rounded-xl text-white placeholder-blue-300 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-blue-200 mb-1">
                        Confirmer
                      </label>
                      <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full px-3 py-1.5 bg-white/20 border border-white/30 rounded-xl text-white placeholder-blue-300 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                      />
                    </div>
                    <button
                      type="submit"
                      className="w-full bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 py-1.5 rounded-xl font-bold text-white"
                    >
                      Modifier le mot de passe
                    </button>
                  </form>
                </div>

                {/* Bloc 4 */}
                <div className="bg-gradient-to-r from-red-500/20 to-pink-500/20 backdrop-blur-md rounded-2xl p-3 border border-red-500/30 hover:border-red-500/50 flex flex-col justify-between h-full">
                  <h2 className="text-lg font-bold text-white mb-2 flex items-center">
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

                  <div className="flex flex-col flex-1 justify-between">
                    <p className="text-red-200 text-xs mb-2 lg:text-center lg:text-base lg:mt-12">
                      Supprimez vos données et déconnectez-vous.
                    </p>

                    <button
                      onClick={() => setShowDeleteModal(true)}
                      className="w-full bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 py-1.5 rounded-xl font-bold text-white"
                    >
                      Supprimer mes données
                    </button>
                  </div>

                  {/* 🔒 Modal de confirmation */}
                  {showDeleteModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md">
                      <div className="bg-gradient-to-r from-red-500/20 to-pink-500/20 backdrop-blur-md rounded-2xl p-6 border border-red-500/30 hover:border-red-500/50 shadow-2xl max-w-sm w-full mx-4 flex flex-col justify-between">
                        <h3 className="text-lg font-bold text-white mb-3 flex items-center justify-center">
                          <svg
                            className="w-6 h-6 mr-2 text-red-400"
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
                          Confirmer la suppression
                        </h3>

                        <p className="text-red-200 text-sm text-center mb-4">
                          Cette action est{" "}
                          <span className="text-red-400 font-semibold">
                            irréversible
                          </span>
                          .
                          <br />
                          Toutes vos données et votre compte seront supprimés
                          définitivement.
                        </p>

                        {error && (
                          <p className="text-red-400 text-sm mb-3 text-center">
                            {error}
                          </p>
                        )}
                        {message && (
                          <p className="text-green-400 text-sm mb-3 text-center">
                            {message}
                          </p>
                        )}

                        <div className="flex gap-3 justify-end mt-4">
                          <button
                            onClick={() => setShowDeleteModal(false)}
                            disabled={loading}
                            className="flex-1 bg-gray-700 hover:bg-gray-600 text-white rounded-xl py-2 font-medium"
                          >
                            Annuler
                          </button>
                          <button
                            onClick={deleteAccount}
                            disabled={loading}
                            className="flex-1 bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white rounded-xl py-2 font-bold"
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
        </div>
      </div>
    </>
  );
}
