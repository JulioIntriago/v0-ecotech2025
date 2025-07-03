"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { toast } from "@/components/ui/use-toast";
import { useConfig } from "@/app/context/config-context";
import { useRouter } from "next/navigation";

export default function GeneralConfigPage() {
  const [config, setConfig] = useState({
    nombreEmpresa: "",
    logo: "",
    direccion: "",
    telefono: "",
    email: "",
    sitioWeb: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const { config: globalConfig, setConfig: setGlobalConfig } = useConfig();
  const [empresaId, setEmpresaId] = useState<number | null>(null);
  const router = useRouter();

  useEffect(() => {
    async function fetchConfig() {
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
          .from("configuraciones")
          .select("general")
          .eq("empresa_id", fetchedEmpresaId)
          .single();
        if (error && error.code !== "PGRST116") throw error;

        if (data?.general) {
          setConfig({
            nombreEmpresa: data.general.nombre_empresa || "",
            logo: data.general.logo || "",
            direccion: data.general.direccion || "",
            telefono: data.general.telefono || "",
            email: data.general.email || "",
            sitioWeb: data.general.sitio_web || "",
          });
        }
      } catch (err: any) {
        console.error("Error al cargar la configuración:", err);
        toast({ title: "Error", description: err.message, variant: "destructive" });
      } finally {
        setLoading(false);
      }
    }
    fetchConfig();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setConfig((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setLogoFile(e.target.files[0]);
    }
  };

  const guardarConfig = async () => {
    if (!empresaId) {
      toast({ title: "Error", description: "No se ha identificado la empresa.", variant: "destructive" });
      return;
    }
    setSaving(true);

    let logoUrl = config.logo;
    if (logoFile) {
      const fileName = `${Date.now()}-${logoFile.name}`;
      const { error: uploadError } = await supabase.storage
        .from("logos")
        .upload(fileName, logoFile, { cacheControl: "3600", upsert: true });
      if (uploadError) {
        console.error("Error al subir el logo:", uploadError);
        toast({ title: "Error", description: uploadError.message, variant: "destructive" });
        setSaving(false);
        return;
      }
      const { data } = supabase.storage.from("logos").getPublicUrl(fileName);
      logoUrl = data.publicUrl;
    }

    try {
      const { error } = await supabase
        .from("configuraciones")
        .update({
          general: {
            nombre_empresa: config.nombreEmpresa,
            logo: logoUrl,
            direccion: config.direccion,
            telefono: config.telefono,
            email: config.email,
            sitio_web: config.sitioWeb,
          },
          updated_at: new Date().toISOString(),
        })
        .eq("empresa_id", empresaId);
      if (error) throw error;

      setGlobalConfig((prev: any) => ({
        ...prev,
        nombreEmpresa: config.nombreEmpresa,
        logo: logoUrl,
        empresaId,
      }));
      toast({ title: "Éxito", description: "Configuración guardada." });

      // Redirigir al dashboard después de guardar
      router.push("/dashboard");
    } catch (err: any) {
      console.error("Error al guardar la configuración:", err);
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-6">Cargando...</div>;

  return (
    <div className="flex flex-col gap-6 p-6">
      <DashboardHeader />
      <h2 className="text-2xl font-bold tracking-tight">Configuración General</h2>
      <Card>
        <CardHeader>
          <CardTitle>Información de la Empresa</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nombreEmpresa">Nombre de la Empresa</Label>
            <Input id="nombreEmpresa" name="nombreEmpresa" value={config.nombreEmpresa} onChange={handleChange} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="logo">Subir Logo</Label>
            <Input id="logo" type="file" accept="image/*" onChange={handleFileChange} />
            {config.logo && <img src={config.logo} alt="Logo Actual" className="mt-2 h-16 w-auto" />}
          </div>
          <div className="space-y-2">
            <Label htmlFor="direccion">Dirección</Label>
            <Input id="direccion" name="direccion" value={config.direccion} onChange={handleChange} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="telefono">Teléfono</Label>
            <Input id="telefono" name="telefono" value={config.telefono} onChange={handleChange} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Correo Electrónico</Label>
            <Input id="email" name="email" type="email" value={config.email} onChange={handleChange} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="sitioWeb">Sitio Web</Label>
            <Input id="sitioWeb" name="sitioWeb" value={config.sitioWeb} onChange={handleChange} />
          </div>
          <Button onClick={guardarConfig} disabled={saving} className="w-full">
            {saving ? "Guardando..." : "Guardar Cambios"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}