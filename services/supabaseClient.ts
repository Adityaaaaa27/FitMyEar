// services/supabaseClient.ts
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://tfadyihcgtvykofuexvl.supabase.co"; // from Supabase
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRmYWR5aWhjZ3R2eWtvZnVleHZsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUxNzA0MTMsImV4cCI6MjA4MDc0NjQxM30.oriGza7bwJDwXowYU0wTDad0tepgROC7F0Ego0kq8Os";           // from Supabase

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: false, // we are using Firebase for auth, so no need here
  },
});
