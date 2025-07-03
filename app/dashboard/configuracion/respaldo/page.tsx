"use client";

import type React from "react";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { ArrowLeft, Download, Upload, Calendar, Clock, Database } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/lib/supabase";

interface ConfigRespaldos {
  respaldoAutomatico: boolean;
  frecuencia: string;
  horaRespaldo: string;
  diasRetencion: string;
}

export default function RespaldoPage() {
  const [config, setConfig] = useState<ConfigRespaldos>({
    respaldoAutomatico: false,
    frecuencia: "",
    horaRespaldo: "",
    diasRetencion: "",
  });
  const [archivoRestauracion, setArchivoRestauracion] = useState<File | null>(null);
  const [progreso, setProgreso] = useState(0);
  const [cargando, setCargando] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [empresaId, setEmpresaId] = useState<number | null>(null);

  // Cargar configuración desde Supabase
  useEffect(() => {
    const fetchConfig = async () => {
      setLoading(true);
      try {
        // Obtener el usuario autenticado
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError || !user) throw new Error("Usuario no autenticado");

        // Obtener el empresa_id del usuario
        const { data: usuario, error: usuarioError } = await supabase
          .from("usuarios")
          .select("empresa_id")
          .eq("id", user.id)
          .single();
        if (usuarioError || !usuario) throw new Error("No se encontró el usuario");

        const fetchedEmpresaId = usuario.empresa_id;
        setEmpresaId(fetchedEmpresaId);

        // Consultar la configuración usando empresa_id
        const { data, error } = await supabase
          .from("configuraciones")
          .select("respaldos")
          .eq("empresa_id", fetchedEmpresaId)
          .single();

        if (error && error.code !== "PGRST116") throw error; // PGRST116 = sin resultados
        if (data?.respaldos) {
          setConfig(data.respaldos);
        }
      } catch (error: any) {
        console.error("Error fetching respaldos configuracion:", error);
        toast({
          title: "Error",
          description: error.message || "No se pudo cargar la configuración de respaldos.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchConfig();
  }, []);

  // Simular respaldo de datos
  const realizarRespaldo = async () => {
    setCargando(true);
    setProgreso(0);

    try {
      const intervalo = setInterval(() => {
        setProgreso((prevProgreso) => {
          const nuevoProgreso = prevProgreso + 10;
          if (nuevoProgreso >= 100) {
            clearInterval(intervalo);
            setTimeout(() => {
              setCargando(false);
              toast({
                title: "Respaldo completado",
                description: "El respaldo de la base de datos se ha completado correctamente.",
              });
            }, 500);
            return 100;
          }
          return nuevoProgreso;
        });
      }, 500);
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo completar el respaldo.",
        variant: "destructive",
      });
      setCargando(false);
    }
  };

  // Manejar selección de archivo para restauración
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setArchivoRestauracion(e.target.files[0]);
    }
  };

  // Simular restauración de datos
  const restaurarDatos = async () => {
    if (!archivoRestauracion) {
      toast({
        title: "Error",
        description: "Por favor selecciona un archivo de respaldo.",
        variant: "destructive",
      });
      return;
    }

    if (!confirm("¿Estás seguro de que deseas restaurar la base de datos? Esta acción no se puede deshacer.")) {
      return;
    }

    setCargando(true);
    setProgreso(0);

    try {
      const intervalo = setInterval(() => {
        setProgreso((prevProgreso) => {
          const nuevoProgreso = prevProgreso + 5;
          if (nuevoProgreso >= 100) {
            clearInterval(intervalo);
            setTimeout(() => {
              setCargando(false);
              toast({
                title: "Restauración completada",
                description: "La base de datos ha sido restaurada correctamente.",
              });
              setArchivoRestauracion(null);
            }, 500);
            return 100;
          }
          return nuevoProgreso;
        });
      }, 300);
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo completar la restauración.",
        variant: "destructive",
      });
      setCargando(false);
    }
  };

  // Guardar configuración de respaldos en Supabase
  const guardarConfiguracion = async () => {
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
        .from("configuraciones")
        .upsert({
          empresa_id: empresaId,
          respaldos: config,
          updated_at: new Date().toISOString(),
        });

      if (error) throw error;

      toast({
        title: "Configuración guardada",
        description: "La configuración de respaldos ha sido actualizada.",
      });
    } catch (error: any) {
      console.error("Error saving respaldos configuracion:", error);
      toast({
        title: "Error",
        description: "No se pudo guardar la configuración.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  // Manejar cambios en los campos
  const handleConfigChange = (field: keyof ConfigRespaldos, value: any

) => {
    setConfig((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  if (loading) {
    return (
      <div className="flex flex-col gap-6 p-6">
        <DashboardHeader />
        <div>Cargando configuración...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      <DashboardHeader />
      <div className="flex items-center gap-2">
        <Button variant="outline" size="icon" asChild>
          <Link href="/dashboard/configuracion">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h2 className="text-2xl font-bold tracking-tight">Respaldo y Restauración</h2>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Respaldo Manual</CardTitle>
            <CardDescription>Genera un respaldo completo de la base de datos</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-center p-6">
              <Database className="h-16 w-16 text-primary opacity-80" />
            </div>
            <p className="text-center text-sm text-muted-foreground">
              Crea una copia de seguridad de todos los datos del sistema. El archivo generado puede ser utilizado para
              restaurar el sistema en caso de pérdida de datos.
            </p>
            {cargando && progreso > 0 && progreso < 100 ? (
              <div className="space-y-2">
                <Progress value={progreso} className="h-2 w-full" />
                <p className="text-center text-sm">{progreso}% completado</p>
              </div>
            ) : (
              <Button className="w-full" onClick={realizarRespaldo} disabled={cargando}>
                <Download className="mr-2 h-4 w-4" />
                Generar Respaldo
              </Button>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Restauración</CardTitle>
            <CardDescription>Restaura el sistema desde un archivo de respaldo</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="archivo-respaldo">Archivo de Respaldo</Label>
              <Input
                id="archivo-respaldo"
                type="file"
                accept=".sql,.dump,.backup"
                onChange={handleFileChange}
                disabled={cargando}
              />
              <p className="text-xs text-muted-foreground">
                Selecciona un archivo de respaldo válido (.sql, .dump o .backup)
              </p>
            </div>

            {archivoRestauracion && (
              <div className="rounded-md bg-muted p-3">
                <p className="text-sm font-medium">Archivo seleccionado:</p>
                <p className="text-sm">{archivoRestauracion.name}</p>
                <p className="text-xs text-muted-foreground">
                  Tamaño: {(archivoRestauracion.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            )}

            {cargando && progreso > 0 && progreso < 100 ? (
              <div className="space-y-2">
                <Progress value={progreso} className="h-2 w-full" />
                <p className="text-center text-sm">{progreso}% completado</p>
              </div>
            ) : (
              <Button
                className="w-full"
                variant="destructive"
                onClick={restaurarDatos}
                disabled={!archivoRestauracion || cargando}
              >
                <Upload className="mr-2 h-4 w-4" />
                Restaurar Sistema
              </Button>
            )}

            <div className="rounded-md border border-destructive/50 bg-destructive/10 p-3">
              <p className="text-sm font-medium text-destructive">¡Advertencia!</p>
              <p className="text-xs text-destructive">
                La restauración sobrescribirá todos los datos actuales. Esta acción no se puede deshacer.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Configuración de Respaldos Automáticos</CardTitle>
          <CardDescription>Programa respaldos automáticos del sistema</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="respaldo-automatico">Respaldo Automático</Label>
              <p className="text-xs text-muted-foreground">Habilitar respaldos automáticos programados</p>
            </div>
            <Switch
              id="respaldo-automatico"
              checked={config.respaldoAutomatico}
              onCheckedChange={(value) => handleConfigChange("respaldoAutomatico", value)}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="frecuencia">Frecuencia</Label>
              <Select
                value={config.frecuencia}
                onValueChange={(value) => handleConfigChange("frecuencia", value)}
                disabled={!config.respaldoAutomatico}
              >
                <SelectTrigger id="frecuencia">
                  <SelectValue placeholder="Selecciona frecuencia" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="diario">Diario</SelectItem>
                  <SelectItem value="semanal">Semanal</SelectItem>
                  <SelectItem value="mensual">Mensual</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="hora-respaldo">Hora del Respaldo</Label>
              <div className="flex items-center">
                <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="hora-respaldo"
                  type="time"
                  value={config.horaRespaldo}
                  onChange={(e) => handleConfigChange("horaRespaldo", e.target.value)}
                  disabled={!config.respaldoAutomatico}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="dias-retencion">Días de Retención</Label>
              <div className="flex items-center">
                <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="dias-retencion"
                  type="number"
                  min="1"
                  max="365"
                  value={config.diasRetencion}
                  onChange={(e) => handleConfigChange("diasRetencion", e.target.value)}
                  disabled={!config.respaldoAutomatico}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Número de días que se conservarán los respaldos automáticos
              </p>
            </div>
          </div>

          <Button onClick={guardarConfiguracion} disabled={saving}>
            {saving ? "Guardando..." : "Guardar Configuración"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}