import { NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

export async function POST(request: Request) {
  const { hash } = await request.json();
  if (!hash) {
    return NextResponse.json({ error: "No hash provided" }, { status: 400 });
  }

  const supabase = createRouteHandlerClient({ cookies });

  const params = new URLSearchParams(hash.substring(1));
  const accessToken = params.get("access_token");
  const refreshToken = params.get("refresh_token");
  if (!accessToken || !refreshToken) {
    return NextResponse.json({ error: "Missing tokens" }, { status: 400 });
  }

  const { error: sessionError } = await supabase.auth.setSession({
    access_token: accessToken,
    refresh_token: refreshToken,
  });
  if (sessionError) {
    return NextResponse.json({ error: sessionError.message }, { status: 401 });
  }

  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) {
    return NextResponse.json({ error: "User Error: " + userError?.message }, { status: 401 });
  }

  const { data: usuario, error: usuarioError } = await supabase
    .from("usuarios")
    .select("empresa_id")
    .eq("id", user.id)
    .single();
  if (usuarioError || !usuario?.empresa_id) {
    return NextResponse.json({ error: "No empresa_id: " + usuarioError?.message }, { status: 404 });
  }

  return NextResponse.json({ empresaId: usuario.empresa_id });
}