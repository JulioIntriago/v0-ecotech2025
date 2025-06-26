"use client";

import { useState, useEffect } from "react";
import { use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { ArrowLeft, Edit, Mail, Phone, MapPin, Trash } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { toast } from "@/components/ui/use-toast";

interface Cliente {
  id: string;
  nombre: string;
  cedula: string | null;
  telefono: string | null;
  correo: string | null;
  direccion: string | null;
  notas: string | null;
  fecha_registro: string;
}

export default function DetalleClientePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [cliente, setCliente] = useState<Cliente | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error || !user) {
        toast({ title: "Error", description: "Usuario no autenticado. Redirigiendo al login...", variant: "destructive" });
        router.push("/login");
        return;
      }
      setIsAuthenticated(true);
    };

    checkAuth();
  }, [router]);

  useEffect(() => {
    if (!isAuthenticated || !id) return;

    const fetchCliente = async () => {
      try {
        const { data, error } = await supabase
          .from("clientes")
          .select("*")
          .eq("id", id)
          .single();

        if (error) throw new Error("No se pudo cargar el cliente.");

        setCliente({
          ...data,
          cedula: data.cedula || null,
          telefono: data.telefono || null,
          correo: data.email || null,
          direccion: data.direccion || null,
          notas: data.notas || null,
          fecha_registro: data.created_at
            ? new Date(data.created_at).toLocaleDateString("es-ES", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
              })
            : "No disponible",
        });
      } catch (error: any) {
        console.error("Error fetching client:", error);
        toast({ title: "Error", description: error.message || "No se pudo cargar el cliente.", variant: "destructive" });
      } finally {
        setLoading(false);
      }
    };

    fetchCliente();
  }, [id, isAuthenticated]);

  const handleEliminarCliente = async () => {
    if (!confirm("¿Estás seguro de que deseas eliminar este cliente? Esta acción no se puede deshacer.")) return;

    setLoading(true);
    try {
      const { error } = await supabase.from("clientes").delete().eq("id", id);
      if (error) throw error;
      toast({ title: "Éxito", description: "Cliente eliminado correctamente." });
      router.push("/dashboard/clientes");
    } catch (error: any) {
      console.error("Error al eliminar el cliente:", error);
      toast({ title: "Error", description: `No se pudo eliminar el cliente: ${error.message}`, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) return <div className="p-6">Redirigiendo al login...</div>;
  if (loading) return <div className="p-6">Cargando cliente...</div>;
  if (!cliente) return <div className="p-6">Cliente no encontrado.</div>;

  return (
    <div className="flex flex-col gap-6 p-6">
      <DashboardHeader />
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" asChild>
            <Link href="/dashboard/clientes">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h2 className="text-2xl font-bold tracking-tight">{cliente.nombre}</h2>
          <span className="text-sm text-muted-foreground">{cliente.id.substring(0, 8)}</span>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href={`/dashboard/clientes/${id}/editar`}>
              <Edit className="mr-2 h-4 w-4" />
              Editar
            </Link>
          </Button>
          <Button variant="destructive" size="sm" onClick={handleEliminarCliente} disabled={loading}>
            <Trash className="mr-2 h-4 w-4" />
            Eliminar
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Datos del Cliente</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1">
              <dt className="text-sm font-medium text-muted-foreground">Cédula</dt>
              <dd>{cliente.cedula || "No disponible"}</dd>
            </div>
            <div className="space-y-1">
              <dt className="text-sm font-medium text-muted-foreground">Teléfono</dt>
              <dd className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span>{cliente.telefono || "No disponible"}</span>
              </dd>
            </div>
            <div className="space-y-1">
              <dt className="text-sm font-medium text-muted-foreground">Correo Electrónico</dt>
              <dd className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span>{cliente.correo || "No disponible"}</span>
              </dd>
            </div>
            <div className="space-y-1 sm:col-span-2">
              <dt className="text-sm font-medium text-muted-foreground">Dirección</dt>
              <dd className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span>{cliente.direccion || "No disponible"}</span>
              </dd>
            </div>
            <div className="space-y-1">
              <dt className="text-sm font-medium text-muted-foreground">Fecha de Registro</dt>
              <dd>{cliente.fecha_registro}</dd>
            </div>
            {cliente.notas && (
              <div className="space-y-1 sm:col-span-2">
                <dt className="text-sm font-medium text-muted-foreground">Notas</dt>
                <dd>{cliente.notas}</dd>
              </div>
            )}
          </dl>
        </CardContent>
      </Card>
    </div>
  );
}