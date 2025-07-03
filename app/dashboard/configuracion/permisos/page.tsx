"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { ArrowLeft, Save } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/lib/supabase";

interface Permisos {
  verDashboard: boolean;
  editarUsuarios: boolean;
  gestionarOrdenes: boolean;
}

interface PermisosEmpresa {
  empresa_id: number;
  superadmin: Permisos;
  tecnico: Permisos;
  vendedor: Permisos;
  updated_at?: string;
}

export default function PermisosPage() {
  const [permisos, setPermisos] = useState<PermisosEmpresa>({
    empresa_id: 0,
    superadmin: { verDashboard: true, editarUsuarios: true, gestionarOrdenes: true },
    tecnico: { verDashboard: false, editarUsuarios: false, gestionarOrdenes: true },
    vendedor: { verDashboard: true, editarUsuarios: false, gestionarOrdenes: false },
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [empresaId, setEmpresaId] = useState<number | null>(null);

  useEffect(() => {
    const fetchPermisos = async () => {
      setLoading(true);
      try {
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError || !user) throw new Error("Usuario no autenticado");

        const { data: usuario, error: usuarioError } = await supabase
          .from("usuarios")
          .select("empresa_id")
          .eq("id", user.id)
          .single();
        if (usuarioError || !usuario) throw new Error("No se encontró el usuario");

        const fetchedEmpresaId = usuario.empresa_id;
        setEmpresaId(fetchedEmpresaId);

        const { data, error } = await supabase
          .from("permisos")
          .select("*")
          .eq("empresa_id", fetchedEmpresaId)
          .single();

        if (error && error.code !== "PGRST116") throw error; // PGRST116 = sin resultados
        if (data) {
          setPermisos({
            empresa_id: data.empresa_id,
            superadmin: data.superadmin,
            tecnico: data.tecnico,
            vendedor: data.vendedor,
            updated_at: data.updated_at,
          });
        }
      } catch (error: any) {
        toast({
          title: "Error",
          description: error.message || "No se pudieron cargar los permisos.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    fetchPermisos();
  }, []);

  const handleSwitchChange = (rol: keyof Pick<PermisosEmpresa, "superadmin" | "tecnico" | "vendedor">, permiso: keyof Permisos, value: boolean) => {
    setPermisos((prev) => ({
      ...prev,
      [rol]: { ...prev[rol], [permiso]: value },
    }));
  };

  const guardarPermisos = async () => {
    if (!empresaId) {
      toast({
        title: "Error",
        description: "No se ha identificado la empresa.",
        variant: "destructive",
      });
      return;
    }
    setSaving(true);
    try {
      const { error } = await supabase
        .from("permisos")
        .upsert({
          empresa_id: empresaId,
          superadmin: permisos.superadmin,
          tecnico: permisos.tecnico,
          vendedor: permisos.vendedor,
          updated_at: new Date().toISOString(),
        });
      if (error) throw error;
      toast({
        title: "Permisos guardados",
        description: "Los permisos han sido actualizados correctamente.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: "No se pudieron guardar los permisos.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col gap-6 p-6">
        <DashboardHeader />
        <div>Cargando permisos...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      <DashboardHeader />
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" asChild>
            <Link href="/dashboard/configuracion">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h2 className="text-2xl font-bold tracking-tight">Gestión de Permisos</h2>
        </div>
        <Button onClick={guardarPermisos} disabled={saving}>
          <Save className="mr-2 h-4 w-4" /> {saving ? "Guardando..." : "Guardar Cambios"}
        </Button>
      </div>
      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Superadmin</CardTitle>
            <CardDescription>Permisos para el rol de superadministrador</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Ver Dashboard</Label>
              <Switch
                checked={permisos.superadmin.verDashboard}
                onCheckedChange={(value) => handleSwitchChange("superadmin", "verDashboard", value)}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label>Editar Usuarios</Label>
              <Switch
                checked={permisos.superadmin.editarUsuarios}
                onCheckedChange={(value) => handleSwitchChange("superadmin", "editarUsuarios", value)}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label>Gestionar Órdenes</Label>
              <Switch
                checked={permisos.superadmin.gestionarOrdenes}
                onCheckedChange={(value) => handleSwitchChange("superadmin", "gestionarOrdenes", value)}
              />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Técnico</CardTitle>
            <CardDescription>Permisos para el rol de técnico</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Ver Dashboard</Label>
              <Switch
                checked={permisos.tecnico.verDashboard}
                onCheckedChange={(value) => handleSwitchChange("tecnico", "verDashboard", value)}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label>Editar Usuarios</Label>
              <Switch
                checked={permisos.tecnico.editarUsuarios}
                onCheckedChange={(value) => handleSwitchChange("tecnico", "editarUsuarios", value)}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label>Gestionar Órdenes</Label>
              <Switch
                checked={permisos.tecnico.gestionarOrdenes}
                onCheckedChange={(value) => handleSwitchChange("tecnico", "gestionarOrdenes", value)}
              />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Vendedor</CardTitle>
            <CardDescription>Permisos para el rol de vendedor</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Ver Dashboard</Label>
              <Switch
                checked={permisos.vendedor.verDashboard}
                onCheckedChange={(value) => handleSwitchChange("vendedor", "verDashboard", value)}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label>Editar Usuarios</Label>
              <Switch
                checked={permisos.vendedor.editarUsuarios}
                onCheckedChange={(value) => handleSwitchChange("vendedor", "editarUsuarios", value)}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label>Gestionar Órdenes</Label>
              <Switch
                checked={permisos.vendedor.gestionarOrdenes}
                onCheckedChange={(value) => handleSwitchChange("vendedor", "gestionarOrdenes", value)}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}