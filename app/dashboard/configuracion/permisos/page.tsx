"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "@/components/ui/use-toast"
import { supabase } from "@/lib/supabase"

interface Permisos {
  administrador: PermisoRol
  tecnico: PermisoRol
  vendedor: PermisoRol
}

interface PermisoRol {
  dashboard: boolean
  ventas: PermisoAcciones
  inventario: PermisoAcciones
  clientes: PermisoAcciones
  ordenes: PermisoAcciones
  empleados: PermisoAcciones
  proveedores: PermisoAcciones
  configuracion: boolean
  reportes: boolean
}

interface PermisoAcciones {
  ver: boolean
  crear: boolean
  editar: boolean
  eliminar: boolean
}

export default function PermisosPage() {
  const [permisos, setPermisos] = useState<Permisos | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // Cargar permisos desde Supabase
  useEffect(() => {
    const fetchPermisos = async () => {
      setLoading(true)

      const { data, error } = await supabase
        .from("permisos")
        .select("administrador, tecnico, vendedor")
        .eq("id", "permisos_config")
        .single()

      if (error) {
        console.error("Error fetching permisos:", error)
        toast({
          title: "Error",
          description: "No se pudieron cargar los permisos.",
          variant: "destructive",
        })
      } else if (data) {
        setPermisos({
          administrador: data.administrador || {},
          tecnico: data.tecnico || {},
          vendedor: data.vendedor || {},
        })
      }

      setLoading(false)
    }

    fetchPermisos()
  }, [])

  const handlePermissionChange = (role: string, module: string, action?: string) => {
    setPermisos((prevPermisos) => {
      if (!prevPermisos) return prevPermisos

      const newPermisos = { ...prevPermisos }
      const rolePermisos = { ...newPermisos[role] }

      if (action) {
        rolePermisos[module] = {
          ...rolePermisos[module],
          [action]: !rolePermisos[module][action],
        }
      } else {
        rolePermisos[module] = !rolePermisos[module]
      }

      newPermisos[role] = rolePermisos
      return newPermisos
    })
  }

  const handleSavePermissions = async () => {
    if (!permisos) return

    setSaving(true)

    try {
      const { error } = await supabase
        .from("permisos")
        .upsert({
          id: "permisos_config",
          administrador: permisos.administrador,
          tecnico: permisos.tecnico,
          vendedor: permisos.vendedor,
          updated_at: new Date().toISOString(),
        })

      if (error) throw error

      toast({
        title: "Permisos actualizados",
        description: "Los permisos han sido actualizados correctamente.",
      })
    } catch (error) {
      console.error("Error saving permisos:", error)
      toast({
        title: "Error",
        description: "No se pudieron actualizar los permisos.",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const renderPermissionCheckbox = (role: string, module: string, action?: string, label?: string) => {
    if (!permisos) return null

    const checked = action ? permisos[role][module][action] : permisos[role][module]

    return (
      <div className="flex items-center space-x-2">
        <Checkbox
          id={`${role}-${module}${action ? `-${action}` : ""}`}
          checked={checked}
          onCheckedChange={() => handlePermissionChange(role, module, action)}
        />
        <Label
          htmlFor={`${role}-${module}${action ? `-${action}` : ""}`}
          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
        >
          {label ||
            (action
              ? action.charAt(0).toUpperCase() + action.slice(1)
              : module.charAt(0).toUpperCase() + module.slice(1))}
        </Label>
      </div>
    )
  }

  if (loading) {
    return <div className="flex flex-col gap-6 p-6"><DashboardHeader /><div>Cargando permisos...</div></div>
  }

  if (!permisos) {
    return <div className="flex flex-col gap-6 p-6"><DashboardHeader /><div>Error: Permisos no encontrados.</div></div>
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      <DashboardHeader />
      <h2 className="text-2xl font-bold tracking-tight">Permisos de Usuario</h2>

      <Tabs defaultValue="administrador">
        <TabsList className="mb-4">
          <TabsTrigger value="administrador">Administrador</TabsTrigger>
          <TabsTrigger value="tecnico">Técnico</TabsTrigger>
          <TabsTrigger value="vendedor">Vendedor</TabsTrigger>
        </TabsList>

        {["administrador", "tecnico", "vendedor"].map((role) => (
          <TabsContent key={role} value={role} className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Permisos para {role.charAt(0).toUpperCase() + role.slice(1)}</CardTitle>
                <CardDescription>Configura los permisos para el rol de {role}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">General</h3>
                    {renderPermissionCheckbox(role, "dashboard", undefined, "Acceso al Dashboard")}
                    {renderPermissionCheckbox(role, "configuracion", undefined, "Configuración")}
                    {renderPermissionCheckbox(role, "reportes", undefined, "Reportes")}
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Ventas</h3>
                    {renderPermissionCheckbox(role, "ventas", "ver", "Ver ventas")}
                    {renderPermissionCheckbox(role, "ventas", "crear", "Crear ventas")}
                    {renderPermissionCheckbox(role, "ventas", "editar", "Editar ventas")}
                    {renderPermissionCheckbox(role, "ventas", "eliminar", "Eliminar ventas")}
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Inventario</h3>
                    {renderPermissionCheckbox(role, "inventario", "ver", "Ver inventario")}
                    {renderPermissionCheckbox(role, "inventario", "crear", "Añadir productos")}
                    {renderPermissionCheckbox(role, "inventario", "editar", "Editar productos")}
                    {renderPermissionCheckbox(role, "inventario", "eliminar", "Eliminar productos")}
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Clientes</h3>
                    {renderPermissionCheckbox(role, "clientes", "ver", "Ver clientes")}
                    {renderPermissionCheckbox(role, "clientes", "crear", "Añadir clientes")}
                    {renderPermissionCheckbox(role, "clientes", "editar", "Editar clientes")}
                    {renderPermissionCheckbox(role, "clientes", "eliminar", "Eliminar clientes")}
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Órdenes</h3>
                    {renderPermissionCheckbox(role, "ordenes", "ver", "Ver órdenes")}
                    {renderPermissionCheckbox(role, "ordenes", "crear", "Crear órdenes")}
                    {renderPermissionCheckbox(role, "ordenes", "editar", "Editar órdenes")}
                    {renderPermissionCheckbox(role, "ordenes", "eliminar", "Eliminar órdenes")}
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Empleados</h3>
                    {renderPermissionCheckbox(role, "empleados", "ver", "Ver empleados")}
                    {renderPermissionCheckbox(role, "empleados", "crear", "Añadir empleados")}
                    {renderPermissionCheckbox(role, "empleados", "editar", "Editar empleados")}
                    {renderPermissionCheckbox(role, "empleados", "eliminar", "Eliminar empleados")}
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Proveedores</h3>
                    {renderPermissionCheckbox(role, "proveedores", "ver", "Ver proveedores")}
                    {renderPermissionCheckbox(role, "proveedores", "crear", "Añadir proveedores")}
                    {renderPermissionCheckbox(role, "proveedores", "editar", "Editar proveedores")}
                    {renderPermissionCheckbox(role, "proveedores", "eliminar", "Eliminar proveedores")}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>

      <div className="flex justify-end">
        <Button onClick={handleSavePermissions} disabled={saving}>
          {saving ? "Guardando..." : "Guardar Cambios"}
        </Button>
      </div>
    </div>
  )
}