import { createClient } from "@supabase/supabase-js";
import { Database } from "./database.types";

// Naudojame aplinkos kintamuosius arba laikiną testavimo URL/raktą
const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  process.env.VITE_SUPABASE_URL ||
  "https://example.supabase.co";

const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.VITE_SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTl9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0";

// Sukuriame fake klientą, kai esame kūrimo aplinkoje be tikrų raktų
const isDevelopmentWithoutRealKeys =
  (process.env.NODE_ENV === "development" || process.env.NODE_ENV === "test") &&
  !process.env.NEXT_PUBLIC_SUPABASE_URL &&
  !process.env.VITE_SUPABASE_URL;

// Jei naudojame tikrą supabase konfigūraciją
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

// Papildoma informacija konsolėje kūrimo aplinkoje
if (isDevelopmentWithoutRealKeys && typeof window !== "undefined") {
  console.warn(
    "Naudojamas fiktyvi Supabase konfigūracija, nes nenustatyti aplinkos kintamieji. " +
      "Autentifikacija ir Supabase funkcionalumas neveiks.",
  );
}
