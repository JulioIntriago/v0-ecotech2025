import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

class SupabaseClient {
  private static instance: ReturnType<typeof createClient>;
  
  private constructor() {} // Bloquea instanciación directa
  
  public static getInstance(): ReturnType<typeof createClient> {
    if (!SupabaseClient.instance) {
      SupabaseClient.instance = createClient(supabaseUrl, supabaseAnonKey, {
        auth: {
          persistSession: true,    // Mantiene la sesión en localStorage
          autoRefreshToken: true,  // Renueva tokens automáticamente
          detectSessionInUrl: false // Desactiva manejo de sesión en URLs
        }
      });
    }
    return SupabaseClient.instance;
  }
}

export const supabase = SupabaseClient.getInstance();