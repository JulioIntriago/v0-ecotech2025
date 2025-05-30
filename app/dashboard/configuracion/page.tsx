"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { Smartphone, Save, Settings, Shield, Database, MessageSquare } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import Link from "next/link"
import { supabase } from "@/lib/supabase"

interface ConfigGeneral {
  nombreEmpresa: string
  direccion: string
  telefono: string
  correo: string
  sitioWeb: string
  logo: string
}

interface ConfigNotificaciones {
  notificarStockBajo: boolean
  notificarNuevasOrdenes: boolean
  notificarVentas: boolean
  notificarPagos: boolean
  correoNotificaciones: string
}

interface ConfigFacturacion {
  moneda: string
  impuesto: string
  prefijo: string
  terminosPago: string
  notaFactura: string
}

interface ConfigUsuarios {
  permitirRegistro: boolean
  aprobacionManual: boolean
  rolPredeterminado: string
}

export default function ConfiguracionPage() {
  const [configGeneral, setConfigGeneral] = useState<ConfigGeneral>({
    nombreEmpresa: "",
    direccion: "",
    telefono: "",
    correo: "",
    sitioWeb: "",
    logo: "",
  })

  const [configNotificaciones, setConfigNotificaciones] = useState<ConfigNotificaciones>({
    notificarStockBajo: false,
    notificarNuevasOrdenes: false,
    notificarVentas: false,
    notificarPagos: false,
    correoNotificaciones: "",
  })

  const [configFacturacion, setConfigFacturacion] = useState<ConfigFacturacion>({
    moneda: "",
    impuesto: "",
    prefijo: "",
    terminosPago: "",
    notaFactura: "",
  })

  const [configUsuarios, setConfigUsuarios] = useState<ConfigUsuarios>({
    permitirRegistro: false,
    aprobacionManual: false,
    rolPredeterminado: "",
  })

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // Cargar configuraciones desde Supabase
  useEffect(() => {
    const fetchConfiguraciones = async () => {
      setLoading(true)

      const { data, error } = await supabase
        .from("configuraciones")
        .select("general, notificaciones, facturacion, usuarios")
        .eq("id", "global_config")
        .single()

      if (error) {
        console.error("Error fetching configuraciones:", error)
        toast({
          title: "Error",
          description: "No se pudieron cargar las configuraciones.",
          variant: "destructive",
        })
      } else if (data) {
        setConfigGeneral(data.general || {})
        setConfigNotificaciones(data.notificaciones || {})
        setConfigFacturacion(data.facturacion || {})
        setConfigUsuarios(data.usuarios || {})
      }

      setLoading(false)
    }

    fetchConfiguraciones()
  }, [])

  // Manejadores de cambios
  const handleGeneralChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setConfigGeneral((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleNotificacionesChange = (name: string, value: boolean | string) => {
    setConfigNotificaciones((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleFacturacionChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setConfigFacturacion((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSelectChange = (section: string, name: string, value: string) => {
    if (section === "facturacion") {
      setConfigFacturacion((prev) => ({
        ...prev,
        [name]: value,
      }))
    } else if (section === "usuarios") {
      setConfigUsuarios((prev) => ({
        ...prev,
        [name]: value,
      }))
    }
  }

  const handleUsuariosChange = (name: string, value: boolean | string) => {
    setConfigUsuarios((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  // Guardar configuración en Supabase
  const guardarConfiguracion = async () => {
    setSaving(true)

    try {
      const { error } = await supabase
        .from("configuraciones")
        .upsert({
          id: "global_config",
          general: configGeneral,
          notificaciones: configNotificaciones,
          facturacion: configFacturacion,
          usuarios: configUsuarios,
          updated_at: new Date().toISOString(),
        })

      if (error) throw error

      toast({
        title: "Configuración guardada",
        description: "La configuración ha sido guardada correctamente.",
      })
    } catch (error) {
      console.error("Error saving configuraciones:", error)
      toast({
        title: "Error",
        description: "No se pudo guardar la configuración.",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <div className="flex flex-col gap-6 p-6"><DashboardHeader /><div>Cargando configuraciones...</div></div>
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      <DashboardHeader />
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-2xl font-bold tracking-tight">Configuración</h2>
        <Button onClick={guardarConfiguracion} disabled={saving}>
          <Save className="mr-2 h-4 w-4" />
          {saving ? "Guardando..." : "Guardar Cambios"}
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
            <Link href="/dashboard/configuracion/permisos">Administrar Permisos</Link>
          </Button>
        </Card>

        <Card className="flex flex-col items-center p-4 text-center">
          <Database className="mb-2 h-8 w-8 text-primary" />
          <h3 className="text-lg font-medium">Respaldo</h3>
          <p className="mb-4 text-sm text-muted-foreground">Respaldo y restauración</p>
          <Button variant="outline" className="mt-auto w-full" asChild>
            <Link href="/dashboard/configuracion/respaldo">Gestionar Respaldos</Link>
          </Button>
        </Card>

        <Card className="flex flex-col items-center p-4 text-center">
          <MessageSquare className="mb-2 h-8 w-8 text-primary" />
          <h3 className="text-lg font-medium">WhatsApp</h3>
          <p className="mb-4 text-sm text-muted-foreground">Integración con WhatsApp</p>
          <Button variant="outline" className="mt-auto w-full" asChild>
            <Link href="/dashboard/configuracion/whatsapp">Configurar WhatsApp</Link>
          </Button>
        </Card>
      </div>

      <Tabs defaultValue="general">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="general" id="general-tab">
            General
          </TabsTrigger>
          <TabsTrigger value="notificaciones">Notificaciones</TabsTrigger>
          <TabsTrigger value="facturacion">Facturación</TabsTrigger>
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
                      const file = e.target.files?.[0]
                      if (file) {
                        setConfigGeneral((prev) => ({
                          ...prev,
                          logo: file.name, // En una implementación real, subirías el archivo a Supabase Storage
                        }))
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
                <Input id="direccion" name="direccion" value={configGeneral.direccion} onChange={handleGeneralChange} />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="telefono">Teléfono</Label>
                  <Input id="telefono" name="telefono" value={configGeneral.telefono} onChange={handleGeneralChange} />
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
                <Input id="sitioWeb" name="sitioWeb" value={configGeneral.sitioWeb} onChange={handleGeneralChange} />
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
                    onCheckedChange={(value) => handleNotificacionesChange("notificarStockBajo", value)}
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
                    onCheckedChange={(value) => handleNotificacionesChange("notificarNuevasOrdenes", value)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="notificarVentas">Notificar Ventas</Label>
                    <p className="text-xs text-muted-foreground">Recibe alertas cuando se completen ventas</p>
                  </div>
                  <Switch
                    id="notificarVentas"
                    checked={configNotificaciones.notificarVentas}
                    onCheckedChange={(value) => handleNotificacionesChange("notificarVentas", value)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="notificarPagos">Notificar Pagos</Label>
                    <p className="text-xs text-muted-foreground">Recibe alertas sobre pagos pendientes o completados</p>
                  </div>
                  <Switch
                    id="notificarPagos"
                    checked={configNotificaciones.notificarPagos}
                    onCheckedChange={(value) => handleNotificacionesChange("notificarPagos", value)}
                  />
                </div>
              </div>

              <div className="space-y-2 pt-4">
                <Label htmlFor="correoNotificaciones">Correo para Notificaciones</Label>
                <Input
                  id="correoNotificaciones"
                  type="email"
                  value={configNotificaciones.correoNotificaciones}
                  onChange={(e) => handleNotificacionesChange("correoNotificaciones", e.target.value)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="facturacion" className="space-y-4">
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
                    onValueChange={(value) => handleSelectChange("facturacion", "moneda", value)}
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
                    onCheckedChange={(value) => handleUsuariosChange("permitirRegistro", value)}
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
                    onCheckedChange={(value) => handleUsuariosChange("aprobacionManual", value)}
                  />
                </div>
              </div>

              <div className="space-y-2 pt-4">
                <Label htmlFor="rolPredeterminado">Rol Predeterminado para Nuevos Usuarios</Label>
                <Select
                  value={configUsuarios.rolPredeterminado}
                  onValueChange={(value) => handleSelectChange("usuarios", "rolPredeterminado", value)}
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
                    <Label htmlFor="autenticacionDosFactores">Autenticación de Dos Factores</Label>
                    <p className="text-xs text-muted-foreground">Requiere verificación adicional al iniciar sesión</p>
                  </div>
                  <Switch
                    id="autenticacionDosFactores"
                    checked={true}
                    onCheckedChange={() => {
                      toast({
                        title: "Función Premium",
                        description: "Esta función está disponible en el plan Premium.",
                      })
                    }}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tiempoSesion">Tiempo de Sesión (minutos)</Label>
                  <Input id="tiempoSesion" type="number" min="5" max="1440" defaultValue="60" disabled />
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
                      <SelectItem value="media">Media (mínimo 8 caracteres, incluir números)</SelectItem>
                      <SelectItem value="alta">Alta (mínimo 10 caracteres, incluir números y símbolos)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}