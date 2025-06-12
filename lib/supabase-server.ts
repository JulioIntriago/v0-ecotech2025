// ✅ 2. lib/supabase-server.ts (para SSR/API/middleware)
import { cookies, headers } from "next/headers";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { createServerActionClient } from "@supabase/auth-helpers-nextjs";
import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs";

export const getSupabaseServerClient = () =>
  createServerComponentClient({ cookies });

export const getSupabaseActionClient = () =>
  createServerActionClient({ cookies });

export const getSupabaseMiddlewareClient = (req, res) =>
  createMiddlewareClient({ req, res });

