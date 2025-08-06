// app/api/delete-user/route.js
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function DELETE(request) {
  try {
    const supabase = createRouteHandlerClient({ cookies });

    // Récupérer l'utilisateur actuel
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        { error: "Utilisateur non authentifié" },
        { status: 401 }
      );
    }

    // Supprimer les favoris de l'utilisateur
    const { error: favError } = await supabase
      .from("favorites")
      .delete()
      .eq("profiles_id", user.id);

    if (favError) {
      console.error("Erreur lors de la suppression des favoris:", favError);
    }

    // Déconnecter l'utilisateur
    const { error: signOutError } = await supabase.auth.signOut();

    if (signOutError) {
      console.error("Erreur lors de la déconnexion:", signOutError);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erreur lors de la suppression:", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}
