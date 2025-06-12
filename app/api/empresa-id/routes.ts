// app/api/empresa-id/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET(request: Request) {
  const authHeader = request.headers.get("Authorization");
  const token = authHeader?.replace("Bearer ", "") || null;

  if (!token) {
    return NextResponse.json({ error: "No hay token" }, { status: 401 });
  }

  const { data: { user }, error: userError } = await supabase.auth.getUser(token);

  if (userError || !user) {
    return NextResponse.json({ error: "Usuario no válido" }, { status: 401 });
  }

  const { data: usuario, error: usuarioError } = await supabase
    .from("usuarios")
    .select("empresa_id")
    .eq("id", user.id)
    .single();

  if (usuarioError || !usuario?.empresa_id) {
    return NextResponse.json({ error: "No se encontró empresa_id" }, { status: 404 });
  }

  return NextResponse.json({ empresaId: usuario.empresa_id });
}