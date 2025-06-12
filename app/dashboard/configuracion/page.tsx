"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import {
  Smartphone,
  Save,
  Settings,
  Shield,
  Database,
  MessageSquare,
} from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import Link from "next/link";

export default function ConfiguracionPage() {
  // Estado para la configuración general
  const [configGeneral, setConfigGeneral] = useState({
    nombreEmpresa: "",
    direccion: "",
    telefono: "",
    correo: "",
    sitioWeb: "",
    logo: "",
  });

  // Estado para la configuración de notificaciones
  const [configNotificaciones, setConfigNotificaciones] = useState({
    notificarStockBajo: true,
    notificarNuevasOrdenes: true,
    notificarVentas: true,
    notificarPagos: true,
    correoNotificaciones: "",
  });

  // Estado para la configuración de facturación
  const [configFacturacion, setConfigFacturacion] = useState({
    moneda: "MXN",
    impuesto: "16",
    prefijo: "",
    terminosPago: "",
    notaFactura: "",
  });

  // Estado para la configuración de usuarios
  const [configUsuarios, setConfigUsuarios] = useState({
    permitirRegistro: false,
    aprobacionManual: true,
    rolPredeterminado: "vendedor",
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [empresaId, setEmpresaId] = useState<number | null>(null);
  const [configId, setConfigId] = useState<string | null>(null);

  // Cargar configuración al montar el componente
  useEffect(() => {
    async function fetchConfiguraciones() {
      try {
        // Obtener usuario autenticado
        const { data: userData, error: userError } = await supabase.auth.getUser();
        if (userError || !userData.user) {
          throw new Error("Usuario no autenticado");
        }

        // Obtener empresa_id desde la tabla usuarios
        const { data: usuario, error: usuarioError } = await supabase
          .from("usuarios")
          .select("empresa_id")
          .eq("id", userData.user.id)
          .single();

        if (usuarioError || !usuario || !usuario.empresa_id) {
          throw new Error("No se encontró el ID de la empresa para el usuario");
        }

        setEmpresaId(usuario.empresa_id);

        // Obtener configuración (máximo 1 registro)
        const { data, error } = await supabase
          .from("configuraciones")
          .select("*")
          .eq("empresa_id", usuario.empresa_id)
          .limit(1);

        if (error) {
          throw new Error(`Error al cargar configuración: ${error.message}`);
        }

        if (data && data.length > 0) {
          const config = data[0];
          setConfigId(config.id);
          setConfigGeneral({
            nombreEmpresa: config.nombre_empresa || "",
            direccion: config.direccion || "",
            telefono: config.telefono || "",
            correo: config.email || "",
            sitioWeb: config.sitio_web || "",
            logo: config.logo || "",
          });
          setConfigNotificaciones({
            notificarStockBajo: config.notificar_stock_bajo ?? true,
            notificarNuevasOrdenes: config.notificar_nuevas_ordenes ?? true,
            notificarVentas: config.notificar_ventas ?? true,
            notificarPagos: config.notificar_pagos ?? true,
            correoNotificaciones: config.correo_notificaciones || "",
          });
          setConfigFacturacion({
            moneda: config.moneda || "MXN",
            impuesto: config.impuesto?.toString() || "16",
            prefijo: config.prefijo || "",
            terminosPago: config.terminos_pago || "",
            notaFactura: config.nota_factura || "",
          });
          setConfigUsuarios({
            permitirRegistro: config.permitir_registro ?? false,
            aprobacionManual: config.aprobacion_manual ?? true,
            rolPredeterminado: config.rol_predeterminado || "vendedor",
          });
        }
      } catch (err: any) {
        console.error("Error en fetchConfiguraciones:", err);
        setError(err.message);
        toast({
          title: "Error",
          description: err.message,
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    }
    fetchConfiguraciones();
  }, []);

  // Manejadores de cambios
  const handleGeneralChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setConfigGeneral((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleNotificacionesChange = (name: string, value: boolean | string) => {
    setConfigNotificaciones((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFacturacionChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setConfigFacturacion((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSelectChange = (section: string, name: string, value: string) => {
    if (section === "facturacion") {
      setConfigFacturacion((prev) => ({
        ...prev,
        [name]: value,
      }));
    } else if (section === "usuarios") {
      setConfigUsuarios((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleUsuariosChange = (name: string, value: boolean | string) => {
    setConfigUsuarios((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Guardar configuración
  const guardarConfiguracion = async () => {
    if (!empresaId) {
      toast({
        title: "Error",
        description: "No se encontró el ID de la empresa",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.from("configuraciones").upsert({
        id: configId || crypto.randomUUID(),
        empresa_id: empresaId,
        nombre_empresa: configGeneral.nombreEmpresa,
        direccion: configGeneral.direccion || null,
        telefono: configGeneral.telefono || null,
        email: configGeneral.correo || null,
        sitio_web: configGeneral.sitioWeb || null,
        logo: configGeneral.logo || null,
        notificar_stock_bajo: configNotificaciones.notificarStockBajo,
        notificar_nuevas_ordenes: configNotificaciones.notificarNuevasOrdenes,
        notificar_ventas: configNotificaciones.notificarVentas,
        notificar_pagos: configNotificaciones.notificarPagos,
        correo_notificaciones: configNotificaciones.correoNotificaciones || null,
        moneda: configFacturacion.moneda,
        impuesto: parseFloat(configFacturacion.impuesto) || null,
        prefijo: configFacturacion.prefijo || null,
        terminos_pago: configFacturacion.terminosPago || null,
        nota_factura: configFacturacion.notaFactura || null,
        permitir_registro: configUsuarios.permitirRegistro,
        aprobacion_manual: configUsuarios.aprobacionManual,
        rol_predeterminado: configUsuarios.rolPredeterminado,
        updated_at: new Date().toISOString(),
      });

      if (error) {
        throw new Error(`Error al guardar configuración: ${error.message}`);
      }

      toast({
        title: "Configuración guardada",
        description: "La configuración ha sido guardada correctamente.",
      });
    } catch (err: any) {
      console.error("Error en guardarConfiguracion:", err);
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="p-6">Cargando...</div>;
  }

  if (error) {
    return (
      <div className="p-6">
        <DashboardHeader />
        <Card>
          <CardHeader>
            <CardTitle>Error</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      <DashboardHeader />
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-2xl font-bold tracking-tight">Configuración</h2>
        <Button onClick={guardarConfiguracion} disabled={loading}>
          <Save className="mr-2 h-4 w-4" />
          {loading ? "Guardando..." : "Guardar Cambios"}
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="flex flex-col items-center p-4 text-center">
          <Settings className="mb-2 h-8 w-8 text-primary" />
          <h3 className="text-lg font-medium">Configuración General</h3>
          <p className="mb-4 text-sm text-muted-foreground">Ajustes básicos del sistema</p>
          <Button variant="outline" className="mt-auto w-full" asChild>
            <Link href="#general" onClick={() => document.getElementById("general-tab")?.click()}>
              Ir a Configuración
            </Link>
          </Button>
        </Card>

        <Card className="flex flex-col items-center p-4 text-center">
          <Shield className="mb-2 h-8 w-8 text-primary" />
          <h3 className="text-lg font-medium">Permisos</h3>
          <p className="mb-4 text-sm text-muted-foreground">Gestión de roles y permisos</p>
          <Button variant="outline" className="mt-auto w-full" asChild>
            <Link href="/dashboard/configurations/permisos">Administrar Permisos</Link>
          </Button>
        </Card>

        <Card className="flex flex-col items-center p-4 text-center">
          <Database className="mb-2 h-8 w-8 text-primary" />
          <h3 className="text-lg font-medium">Respaldo</h3>
            <p className="mb-4 text-sm text-muted-foreground">Respaldo y restauración</p>
            <Button variant="outline" className="mt-auto w-full" asChild>
              <Link href="/dashboard/configurations/respaldo">Gestionar Respaldos</Link>
            </Button>
          </Card>

          <Card className="flex flex-col items-center p-4 text-center">
            <MessageSquare className="mb-2 h-8 w-8 text-primary" />
            <h3 className="text-lg font-medium">WhatsApp</h3>
            <p className="mb-4 text-sm text-muted-foreground">Integración con WhatsApp</p>
            <Button variant="outline" className="mt-auto w-full" asChild>
              <Link href="/dashboard/configurations/whatsapp">Configurar WhatsApp</Link>
            </Button>
          </Card>
        </div>

        <Tabs defaultValue="general">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="general" id="general-tab">
              General
            </TabsTrigger>
            <TabsTrigger value="notifications">Notificaciones</TabsTrigger>
            <TabsTrigger value="facturación">Facturación</TabsTrigger>
            <TabsTrigger value="usuarios">Usuarios</TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Información de la Empresa</CardTitle>
                <CardDescription>Configura la información básica de tu negocio</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-col items-center justify-center space-y-2 sm:flex-row sm:space-x-4 sm:space-y-0">
                  <div className="flex h-24 w-24 items-center justify-center rounded-lg border border-dashed">
                    <Smartphone className="h-12 w-12 text-muted-foreground" />
                  </div>
                  <div className="flex flex-col space-y-2">
                    <h3 className="text-sm font-medium">Logo de la Empresa</h3>
                    <p className="text-xs text-muted-foreground">Sube el logo de tu empresa en formato PNG o JPG</p>
                    <Input
                      type="file"
                      accept="image/*"
                      className="w-full max-w-xs"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setConfigGeneral((prev) => ({ ...prev, logo: URL.createObjectURL(file) }));
                        }
                      }}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="nombreEmpresa">Nombre de la Empresa</Label>
                  <Input
                    id="nombreEmpresa"
                    name="nombreEmpresa"
                    value={configGeneral.nombreEmpresa}
                    onChange={handleGeneralChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="direccion">Dirección</Label>
                  <Input
                    id="direccion"
                    name="direccion"
                    value={configGeneral.direccion}
                    onChange={handleGeneralChange}
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="telefono">Teléfono</Label>
                    <Input
                      id="telefono"
                      name="telefono"
                      value={configGeneral.telefono}
                      onChange={handleGeneralChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="correo">Correo Electrónico</Label>
                    <Input
                      id="correo"
                      name="correo"
                      type="email"
                      value={configGeneral.correo}
                      onChange={handleGeneralChange}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="sitioWeb">Sitio Web</Label>
                  <Input
                    id="sitioWeb"
                    name="sitioWeb"
                    value={configGeneral.sitioWeb}
                    onChange={handleGeneralChange}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notificaciones" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Configuración de Notificaciones</CardTitle>
                <CardDescription>Personaliza las notificaciones del sistema</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="notificarStockBajo">Notificar Stock Bajo</Label>
                      <p className="text-xs text-muted-foreground">
                        Recibe alertas cuando los productos tengan stock bajo
                      </p>
                    </div>
                    <Switch
                      id="notificarStockBajo"
                      checked={configNotificaciones.notificarStockBajo}
                      onCheckedChange={(value) =>
                        handleNotificacionesChange("notificarStockBajo", value)
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="notificarNuevasOrdenes">Notificar Nuevas Órdenes</Label>
                      <p className="text-xs text-muted-foreground">
                        Recibe alertas cuando se registren nuevas órdenes de trabajo
                      </p>
                    </div>
                    <Switch
                      id="notificarNuevasOrdenes"
                      checked={configNotificaciones.notificarNuevasOrdenes}
                      onCheckedChange={(value) =>
                        handleNotificacionesChange("notificarNuevasOrdenes", value)
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="notificarVentas">Notificar Ventas</Label>
                      <p className="text-xs text-muted-foreground">
                        Recibe alertas cuando se completen ventas
                      </p>
                    </div>
                    <Switch
                      id="notificarVentas"
                      checked={configNotificaciones.notificarVentas}
                      onCheckedChange={(value) =>
                        handleNotificacionesChange("notificarVentas", value)
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="notificarPagos">Notificar Pagos</Label>
                      <p className="text-xs text-muted-foreground">
                        Recibe alertas sobre pagos pendientes o completados
                      </p>
                    </div>
                    <Switch
                      id="notificarPagos"
                      checked={configNotificaciones.notificarPagos}
                      onCheckedChange={(value) =>
                        handleNotificacionesChange("notificarPagos", value)
                      }
                    />
                  </div>
                </div>

                <div className="space-y-2 pt-4">
                  <Label htmlFor="correoNotificaciones">Correo para Notificaciones</Label>
                  <Input
                    id="correoNotificaciones"
                    type="email"
                    value={configNotificaciones.correoNotificaciones}
                    onChange={(e) =>
                      handleNotificacionesChange("correoNotificaciones", e.target.value)
                    }
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="facturación" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Configuración de Facturación</CardTitle>
                <CardDescription>Personaliza la información de facturación y pagos</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="moneda">Moneda</Label>
                    <Select
                      value={configFacturacion.moneda}
                      onValueChange={(value) =>
                        handleSelectChange("facturacion", "moneda", value)
                      }
                    >
                      <SelectTrigger id="moneda">
                        <SelectValue placeholder="Selecciona una moneda" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="MXN">Peso Mexicano (MXN)</SelectItem>
                        <SelectItem value="USD">Dólar Estadounidense (USD)</SelectItem>
                        <SelectItem value="EUR">Euro (EUR)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="impuesto">Impuesto (%)</Label>
                    <Input
                      id="impuesto"
                      name="impuesto"
                      type="number"
                      min="0"
                      max="100"
                      value={configFacturacion.impuesto}
                      onChange={handleFacturacionChange}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="prefijo">Prefijo para Facturas</Label>
                  <Input
                    id="prefijo"
                    name="prefijo"
                    value={configFacturacion.prefijo}
                    onChange={handleFacturacionChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="terminosPago">Términos de Pago</Label>
                  <Textarea
                    id="terminosPago"
                    name="terminosPago"
                    rows={3}
                    value={configFacturacion.terminosPago}
                    onChange={handleFacturacionChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notaFactura">Nota en Facturas</Label>
                  <Textarea
                    id="notaFactura"
                    name="notaFactura"
                    rows={3}
                    value={configFacturacion.notaFactura}
                    onChange={handleFacturacionChange}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="usuarios" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Configuración de Usuarios</CardTitle>
                <CardDescription>Administra los permisos y accesos de usuarios</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="permitirRegistro">Permitir Registro de Usuarios</Label>
                      <p className="text-xs text-muted-foreground">
                        Permite que nuevos usuarios se registren en el sistema
                      </p>
                    </div>
                    <Switch
                      id="permitirRegistro"
                      checked={configUsuarios.permitirRegistro}
                      onCheckedChange={(value) =>
                        handleUsuariosChange("permitirRegistro", value)
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="aprobacionManual">Aprobación Manual de Usuarios</Label>
                      <p className="text-xs text-muted-foreground">
                        Requiere aprobación manual para nuevos usuarios registrados
                      </p>
                    </div>
                    <Switch
                      id="aprobacionManual"
                      checked={configUsuarios.aprobacionManual}
                      onCheckedChange={(value) =>
                        handleUsuariosChange("aprobacionManual", value)
                      }
                    />
                  </div>
                </div>

                <div className="space-y-2 pt-4">
                  <Label htmlFor="rolPredeterminado">
                    Rol Predeterminado para Nuevos Usuarios
                  </Label>
                  <Select
                    value={configUsuarios.rolPredeterminado}
                    onValueChange={(value) =>
                      handleSelectChange("usuarios", "rolPredeterminado", value)
                    }
                  >
                    <SelectTrigger id="rolPredeterminado">
                      <SelectValue placeholder="Selecciona un rol predeterminado" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Administrador</SelectItem>
                      <SelectItem value="tecnico">Técnico</SelectItem>
                      <SelectItem value="vendedor">Vendedor</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Seguridad</CardTitle>
                <CardDescription>Configura las políticas de seguridad del sistema</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="autenticacionDosFactores">
                        Autenticación de Dos Factores
                      </Label>
                      <p className="text-xs text-muted-foreground">
                        Requiere verificación adicional al iniciar sesión
                      </p>
                    </div>
                    <Switch
                      id="autenticacionDosFactores"
                      checked={true}
                      onCheckedChange={() => {
                        toast({
                          title: "Función Premium",
                          description: "Esta función está disponible en el plan Premium.",
                        });
                      }}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="tiempoSesion">Tiempo de Sesión (minutos)</Label>
                    <Input
                      id="tiempoSesion"
                      type="number"
                      min="5"
                      max="1440"
                      defaultValue="60"
                      disabled
                    />
                    <p className="text-xs text-muted-foreground">
                      Tiempo de inactividad antes de cerrar sesión automáticamente
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="politicaContrasenas">Política de Contraseñas</Label>
                    <Select defaultValue="media">
                      <SelectTrigger id="politicaContrasenas">
                        <SelectValue placeholder="Selecciona una política" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="baja">Básica (mínimo 6 caracteres)</SelectItem>
                        <SelectItem value="media">
                          Media (mínimo 8 caracteres, incluir números)
                        </SelectItem>
                        <SelectItem value="alta">
                          Alta (mínimo 10 caracteres, incluir números y símbolos)
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    );
  }