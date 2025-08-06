import { createClient } from "@supabase/supabase-js";

// Utilisation des variables d'environnement sécurisées et côté client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error(
    "Supabase URL ou clé manquante dans les variables d'environnement"
  );
}

export const supabase = createClient(supabaseUrl, supabaseKey);
