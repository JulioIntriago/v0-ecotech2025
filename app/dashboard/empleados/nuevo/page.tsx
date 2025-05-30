"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { ArrowLeft } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/lib/supabase";

export default function NuevoEmpleadoPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    nombre: "",
    cedula: "",
    role: "", // Ajustado de cargo a role
    departamento: "",
    telefono: "",
    correo: "",
    direccion: "",
    supervisor: "",
    horario: "",
    password: "", // Nuevo campo para contraseña
  });
  const [loading, setLoading] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const checkUserRole = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user && user.user_metadata?.role === "admin") {
        setIsAdmin(true);
      } else {
        toast({ title: "Acceso Denegado", description: "Solo los administradores pueden crear empleados.", variant: "destructive" });
        router.push("/dashboard");
      }
    };
    checkUserRole();
  }, [router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);

    try {
      // Validar campos obligatorios
      if (!formData.correo || !formData.nombre || !formData.cedula || !formData.role || !formData.departamento || !formData.telefono || !formData.password) {
        toast({
          title: "Error",
          description: "Por favor, completa todos los campos obligatorios, incluyendo la contraseña.",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      // Crear usuario en auth.users
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.correo,
        password: formData.password,
        options: {
          data: {
            role: formData.role,
            nombre: formData.nombre,
            cedula: formData.cedula,
            email_verified: false,
            phone_verified: false,
          },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (authError) {
        if (authError.status === 429) {
          toast({
            title: "Error",
            description: "Demasiadas solicitudes. Por favor, espera un momento y vuelve a intentarlo.",
            variant: "destructive",
          });
          setLoading(false);
          return;
        }
        throw authError;
      }
      if (!authData.user) throw new Error("No se pudo crear el usuario autenticado");

      const userId = authData.user.id;

      // Guardar el nuevo empleado
      const { error: insertError } = await supabase.from("empleados").insert({
        id: userId, // Usamos el ID de auth.users directamente
        user_id: userId,
        nombre: formData.nombre,
        cedula: formData.cedula,
        role: formData.role, // Ajustado de cargo a role
        departamento: formData.departamento,
        telefono: formData.telefono,
        correo: formData.correo,
        direccion: formData.direccion || null,
        supervisor: formData.supervisor || null,
        horario: formData.horario || null,
        fecha_contratacion: new Date().toISOString().split("T")[0],
        estado: "activo",
      });

      if (insertError) {
        await supabase.auth.admin.deleteUser(userId);
        throw insertError;
      }

      // Enviar correo de bienvenida con la contraseña
      await fetch("https://<tu-supabase-url>/functions/v1/send-welcome-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.correo,
          message: `Bienvenido a ECOTECH. Tu contraseña temporal es: ${formData.password}. Por favor, cámbiala al iniciar sesión.`,
        }),
      });

      toast({
        title: "Empleado creado",
        description: "El empleado ha sido creado y se ha enviado un email con su contraseña temporal.",
      });

      router.push("/dashboard/empleados");
    } catch (error: any) {
      toast({
        title: "Error",
        description: "No se pudo crear el empleado: " + error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!isAdmin) return <div>Cargando...</div>;

  return (
    <div className="flex flex-col gap-6 p-6">
      <DashboardHeader />
      <div className="flex items-center gap-2">
        <Button variant="outline" size="icon" asChild>
          <Link href="/dashboard/empleados">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h2 className="text-2xl font-bold tracking-tight">Nuevo Empleado</h2>
      </div>

      <Card>
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle>Información del Empleado</CardTitle>
            <CardDescription>Ingresa los datos del nuevo empleado</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="nombre">Nombre Completo</Label>
                <Input
                  id="nombre"
                  name="nombre"
                  placeholder="Nombre y apellidos"
                  value={formData.nombre}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="cedula">Cédula / Documento de Identidad</Label>
                <Input
                  id="cedula"
                  name="cedula"
                  placeholder="Número de cédula o documento"
                  value={formData.cedula}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="role">Rol</Label>
                  <Select value={formData.role} onValueChange={(value) => handleSelectChange("role", value)} required>
                    <SelectTrigger id="role">
                      <SelectValue placeholder="Selecciona un rol" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="tecnico">Técnico</SelectItem>
                      <SelectItem value="vendedor">Vendedor</SelectItem>
                      <SelectItem value="admin">Administrador</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="departamento">Departamento</Label>
                  <Select
                    value={formData.departamento}
                    onValueChange={(value) => handleSelectChange("departamento", value)}
                    required
                  >
                    <SelectTrigger id="departamento">
                      <SelectValue placeholder="Selecciona un departamento" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="servicio_tecnico">Servicio Técnico</SelectItem>
                      <SelectItem value="ventas">Ventas</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="telefono">Teléfono</Label>
                  <Input
                    id="telefono"
                    name="telefono"
                    placeholder="Número de teléfono"
                    value={formData.telefono}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="correo">Correo Electrónico</Label>
                  <Input
                    id="correo"
                    name="correo"
                    type="email"
                    placeholder="correo@ejemplo.com"
                    value={formData.correo}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Contraseña Temporal</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="Ingresa una contraseña temporal"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="direccion">Dirección</Label>
                <Input
                  id="direccion"
                  name="direccion"
                  placeholder="Dirección completa"
                  value={formData.direccion}
                  onChange={handleChange}
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="supervisor">Supervisor</Label>
                  <Input
                    id="supervisor"
                    name="supervisor"
                    placeholder="Nombre del supervisor"
                    value={formData.supervisor}
                    onChange={handleChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="horario">Horario</Label>
                  <Input
                    id="horario"
                    name="horario"
                    placeholder="Ej: Lunes a Viernes, 9:00 - 18:00"
                    value={formData.horario}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end gap-2">
            <Button variant="outline" type="button" asChild>
              <Link href="/dashboard/empleados">Cancelar</Link>
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Guardando..." : "Guardar Empleado"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}