"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { Settings, Shield, Database, MessageSquare } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import Link from "next/link";

export default function ConfiguracionPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [empresaId, setEmpresaId] = useState<number | null>(null);

  useEffect(() => {
    async function fetchUserData() {
      try {
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError || !user) throw new Error("Usuario no autenticado");

        const { data: usuario, error: usuarioError } = await supabase
          .from("usuarios")
          .select("empresa_id")
          .eq("id", user.id)
          .single();

        if (usuarioError || !usuario || !usuario.empresa_id) throw new Error("No se encontró el ID de la empresa");
        setEmpresaId(usuario.empresa_id);
      } catch (err: any) {
        setError(err.message);
        toast({ title: "Error", description: err.message, variant: "destructive" });
      } finally {
        setLoading(false);
      }
    }
    fetchUserData();
  }, []);

  if (loading) return <div className="p-6">Cargando...</div>;
  if (error) return <div className="p-6">{error}</div>;

  return (
    <div className="flex flex-col gap-6 p-6">
      <DashboardHeader />
      <h2 className="text-2xl font-bold tracking-tight">Configuración</h2>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="flex flex-col items-center p-4 text-center">
          <Settings className="mb-2 h-8 w-8 text-primary" />
          <h3 className="text-lg font-medium">General</h3>
          <p className="mb-4 text-sm text-muted-foreground">Ajustes básicos del sistema</p>
          <Button variant="outline" className="mt-auto w-full" asChild>
            <Link href="/dashboard/configuracion/general">Configurar</Link>
          </Button>
        </Card>
        <Card className="flex flex-col items-center p-4 text-center">
          <Shield className="mb-2 h-8 w-8 text-primary" />
          <h3 className="text-lg font-medium">Permisos</h3>
          <p className="mb-4 text-sm text-muted-foreground">Gestión de roles y permisos</p>
          <Button variant="outline" className="mt-auto w-full" asChild>
            <Link href="/dashboard/configuracion/permisos">Administrar</Link>
          </Button>
        </Card>
        <Card className="flex flex-col items-center p-4 text-center">
          <Database className="mb-2 h-8 w-8 text-primary" />
          <h3 className="text-lg font-medium">Respaldo</h3>
          <p className="mb-4 text-sm text-muted-foreground">Respaldo y restauración</p>
          <Button variant="outline" className="mt-auto w-full" asChild>
            <Link href="/dashboard/configuracion/respaldo">Gestionar</Link>
          </Button>
        </Card>
        <Card className="flex flex-col items-center p-4 text-center">
          <MessageSquare className="mb-2 h-8 w-8 text-primary" />
          <h3 className="text-lg font-medium">WhatsApp</h3>
          <p className="mb-4 text-sm text-muted-foreground">Integración con WhatsApp</p>
          <Button variant="outline" className="mt-auto w-full" asChild>
            <Link href="/dashboard/configuracion/whatsapp">Configurar</Link>
          </Button>
        </Card>
      </div>
    </div>
  );
}