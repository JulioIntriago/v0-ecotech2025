"use client"

import type React from "react"
import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { ArrowLeft, Save, MessageSquare, Send } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import { supabase } from "@/lib/supabase"

interface ConfigWhatsApp {
  habilitado: boolean
  numeroTelefono: string
  accessToken: string
  idCuenta: string
  mensajeBienvenida: string
  notificarOrdenes: boolean
  notificarVentas: boolean
  notificarReparaciones: boolean
  plantillaOrden: string
  plantillaReparacion: string
  plantillaVenta: string
}

export default function WhatsAppPage() {
  const [configuracion, setConfiguracion] = useState<ConfigWhatsApp>({
    habilitado: false,
    numeroTelefono: "",
    accessToken: "",
    idCuenta: "",
    mensajeBienvenida: "",
    notificarOrdenes: false,
    notificarVentas: false,
    notificarReparaciones: false,
    plantillaOrden: "",
    plantillaReparacion: "",
    plantillaVenta: "",
  })

  const [numeroTest, setNumeroTest] = useState("")
  const [mensajeTest, setMensajeTest] = useState("")
  const [enviando, setEnviando] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // Cargar configuración desde Supabase
  useEffect(() => {
    const fetchConfiguracion = async () => {
      setLoading(true)

      const { data, error } = await supabase
        .from("configuraciones")
        .select("whatsapp")
        .eq("id", "global_config")
        .single()

      if (error) {
        console.error("Error fetching whatsapp configuracion:", error)
        toast({
          title: "Error",
          description: "No se pudo cargar la configuración de WhatsApp.",
          variant: "destructive",
        })
      } else if (data && data.whatsapp) {
        setConfiguracion(data.whatsapp)
      }

      setLoading(false)
    }

    fetchConfiguracion()
  }, [])

  // Manejar cambios en los campos
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setConfiguracion((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  // Manejar cambios en los switches
  const handleSwitchChange = (name: string, value: boolean) => {
    setConfiguracion((prev) => ({
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
          whatsapp: configuracion,
          updated_at: new Date().toISOString(),
        })

      if (error) throw error

      toast({
        title: "Configuración guardada",
        description: "La configuración de WhatsApp ha sido actualizada.",
      })
    } catch (error) {
      console.error("Error saving whatsapp configuracion:", error)
      toast({
        title: "Error",
        description: "No se pudo guardar la configuración.",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  // Enviar mensaje de prueba (simulado)
  const enviarMensajePrueba = async () => {
    if (!numeroTest) {
      toast({
        title: "Error",
        description: "Por favor ingresa un número de teléfono para la prueba.",
        variant: "destructive",
      })
      return
    }

    if (!mensajeTest) {
      toast({
        title: "Error",
        description: "Por favor ingresa un mensaje para la prueba.",
        variant: "destructive",
      })
      return
    }

    setEnviando(true)

    try {
      // Simulación de envío
      await new Promise((resolve) => setTimeout(resolve, 1500))

      toast({
        title: "Mensaje enviado",
        description: "El mensaje de prueba ha sido enviado correctamente.",
      })

      // Limpiar campos
      setMensajeTest("")
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo enviar el mensaje de prueba.",
        variant: "destructive",
      })
    } finally {
      setEnviando(false)
    }
  }

  if (loading) {
    return <div className="flex flex-col gap-6 p-6"><DashboardHeader /><div>Cargando configuración...</div></div>
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
          <h2 className="text-2xl font-bold tracking-tight">Configuración de WhatsApp</h2>
        </div>
        <Button onClick={guardarConfiguracion} disabled={saving}>
          <Save className="mr-2 h-4 w-4" />
          {saving ? "Guardando..." : "Guardar Cambios"}
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Configuración General</CardTitle>
            <CardDescription>Configura la integración con WhatsApp Business API</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="habilitado">Habilitar WhatsApp</Label>
                <p className="text-xs text-muted-foreground">Activar la integración con WhatsApp</p>
              </div>
              <Switch
                id="habilitado"
                checked={configuracion.habilitado}
                onCheckedChange={(value) => handleSwitchChange("habilitado", value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="numeroTelefono">Número de Teléfono</Label>
              <Input
                id="numeroTelefono"
                name="numeroTelefono"
                value={configuracion.numeroTelefono}
                onChange={handleChange}
                disabled={!configuracion.habilitado}
                placeholder="+521234567890"
              />
              <p className="text-xs text-muted-foreground">
                Número de teléfono registrado en WhatsApp Business (con código de país)
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="accessToken">Access Token</Label>
              <Input
                id="accessToken"
                name="accessToken"
                type="password"
                value={configuracion.accessToken}
                onChange={handleChange}
                disabled={!configuracion.habilitado}
              />
              <p className="text-xs text-muted-foreground">
                Token de acceso proporcionado por Meta para la API de WhatsApp Business
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="idCuenta">ID de Cuenta</Label>
              <Input
                id="idCuenta"
                name="idCuenta"
                value={configuracion.idCuenta}
                onChange={handleChange}
                disabled={!configuracion.habilitado}
              />
              <p className="text-xs text-muted-foreground">ID de la cuenta de WhatsApp Business</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="mensajeBienvenida">Mensaje de Bienvenida</Label>
              <Textarea
                id="mensajeBienvenida"
                name="mensajeBienvenida"
                value={configuracion.mensajeBienvenida}
                onChange={handleChange}
                disabled={!configuracion.habilitado}
                rows={3}
              />
              <p className="text-xs text-muted-foreground">
                Mensaje que se enviará automáticamente cuando un cliente inicie una conversación
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Enviar Mensaje de Prueba</CardTitle>
            <CardDescription>Verifica que la integración funcione correctamente</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-center p-6">
              <MessageSquare className="h-16 w-16 text-primary opacity-80" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="numeroTest">Número de Teléfono</Label>
              <Input
                id="numeroTest"
                value={numeroTest}
                onChange={(e) => setNumeroTest(e.target.value)}
                placeholder="+521234567890"
                disabled={!configuracion.habilitado || enviando}
              />
              <p className="text-xs text-muted-foreground">Número de teléfono al que se enviará el mensaje de prueba</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="mensajeTest">Mensaje</Label>
              <Textarea
                id="mensajeTest"
                value={mensajeTest}
                onChange={(e) => setMensajeTest(e.target.value)}
                placeholder="Escribe un mensaje de prueba..."
                rows={3}
                disabled={!configuracion.habilitado || enviando}
              />
            </div>

            <Button
              className="w-full"
              onClick={enviarMensajePrueba}
              disabled={!configuracion.habilitado || !numeroTest || !mensajeTest || enviando}
            >
              <Send className="mr-2 h-4 w-4" />
              {enviando ? "Enviando..." : "Enviar Mensaje de Prueba"}
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Notificaciones Automáticas</CardTitle>
          <CardDescription>Configura las notificaciones automáticas por WhatsApp</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-6 md:grid-cols-3">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="notificarOrdenes">Órdenes de Trabajo</Label>
                  <p className="text-xs text-muted-foreground">Notificar cambios en órdenes</p>
                </div>
                <Switch
                  id="notificarOrdenes"
                  checked={configuracion.notificarOrdenes}
                  onCheckedChange={(value) => handleSwitchChange("notificarOrdenes", value)}
                  disabled={!configuracion.habilitado}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="plantillaOrden">Plantilla de Mensaje</Label>
                <Textarea
                  id="plantillaOrden"
                  name="plantillaOrden"
                  value={configuracion.plantillaOrden}
                  onChange={handleChange}
                  rows={3}
                  disabled={!configuracion.habilitado || !configuracion.notificarOrdenes}
                />
                <p className="text-xs text-muted-foreground">
                  Variables: {"{cliente}"}, {"{orden_id}"}, {"{estado}"}
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="notificarReparaciones">Reparaciones</Label>
                  <p className="text-xs text-muted-foreground">Notificar estado de reparaciones</p>
                </div>
                <Switch
                  id="notificarReparaciones"
                  checked={configuracion.notificarReparaciones}
                  onCheckedChange={(value) => handleSwitchChange("notificarReparaciones", value)}
                  disabled={!configuracion.habilitado}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="plantillaReparacion">Plantilla de Mensaje</Label>
                <Textarea
                  id="plantillaReparacion"
                  name="plantillaReparacion"
                  value={configuracion.plantillaReparacion}
                  onChange={handleChange}
                  rows={3}
                  disabled={!configuracion.habilitado || !configuracion.notificarReparaciones}
                />
                <p className="text-xs text-muted-foreground">
                  Variables: {"{cliente}"}, {"{dispositivo}"}, {"{estado}"}
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="notificarVentas">Ventas</Label>
                  <p className="text-xs text-muted-foreground">Notificar compras realizadas</p>
                </div>
                <Switch
                  id="notificarVentas"
                  checked={configuracion.notificarVentas}
                  onCheckedChange={(value) => handleSwitchChange("notificarVentas", value)}
                  disabled={!configuracion.habilitado}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="plantillaVenta">Plantilla de Mensaje</Label>
                <Textarea
                  id="plantillaVenta"
                  name="plantillaVenta"
                  value={configuracion.plantillaVenta}
                  onChange={handleChange}
                  rows={3}
                  disabled={!configuracion.habilitado || !configuracion.notificarVentas}
                />
                <p className="text-xs text-muted-foreground">
                  Variables: {"{cliente}"}, {"{venta_id}"}, {"{total}"}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}