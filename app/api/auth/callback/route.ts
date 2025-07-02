import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr"; // Cambia a createServerClient
import { cookies } from "next/headers";

export async function POST(request: Request) {
  const { hash } = await request.json();
  if (!hash) {
    return NextResponse.json({ error: "No hash provided" }, { status: 400 });
  }

  const cookieStore = await cookies(); // Asegúrate de usar await
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: any) {
          cookieStore.set(name, value, options);
        },
        remove(name: string, options: any) {
          cookieStore.delete(name);
        },
      },
    }
  );

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