"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "@/components/ui/use-toast"

// Datos de ejemplo para los permisos
const permisosIniciales = {
  administrador: {
    dashboard: true,
    ventas: {
      ver: true,
      crear: true,
      editar: true,
      eliminar: true,
    },
    inventario: {
      ver: true,
      crear: true,
      editar: true,
      eliminar: true,
    },
    clientes: {
      ver: true,
      crear: true,
      editar: true,
      eliminar: true,
    },
    ordenes: {
      ver: true,
      crear: true,
      editar: true,
      eliminar: true,
    },
    empleados: {
      ver: true,
      crear: true,
      editar: true,
      eliminar: true,
    },
    proveedores: {
      ver: true,
      crear: true,
      editar: true,
      eliminar: true,
    },
    configuracion: true,
    reportes: true,
  },
  tecnico: {
    dashboard: true,
    ventas: {
      ver: true,
      crear: false,
      editar: false,
      eliminar: false,
    },
    inventario: {
      ver: true,
      crear: false,
      editar: false,
      eliminar: false,
    },
    clientes: {
      ver: true,
      crear: false,
      editar: false,
      eliminar: false,
    },
    ordenes: {
      ver: true,
      crear: true,
      editar: true,
      eliminar: false,
    },
    empleados: {
      ver: false,
      crear: false,
      editar: false,
      eliminar: false,
    },
    proveedores: {
      ver: false,
      crear: false,
      editar: false,
      eliminar: false,
    },
    configuracion: false,
    reportes: false,
  },
  vendedor: {
    dashboard: true,
    ventas: {
      ver: true,
      crear: true,
      editar: true,
      eliminar: false,
    },
    inventario: {
      ver: true,
      crear: false,
      editar: false,
      eliminar: false,
    },
    clientes: {
      ver: true,
      crear: true,
      editar: true,
      eliminar: false,
    },
    ordenes: {
      ver: true,
      crear: true,
      editar: false,
      eliminar: false,
    },
    empleados: {
      ver: false,
      crear: false,
      editar: false,
      eliminar: false,
    },
    proveedores: {
      ver: false,
      crear: false,
      editar: false,
      eliminar: false,
    },
    configuracion: false,
    reportes: true,
  },
}

export default function PermisosPage() {
  const [permisos, setPermisos] = useState(permisosIniciales)
  const [loading, setLoading] = useState(false)

  const handlePermissionChange = (role: string, module: string, action?: string) => {
    setPermisos((prevPermisos) => {
      const newPermisos = { ...prevPermisos }

      if (action) {
        // Es un permiso de acción específica (ver, crear, etc.)
        newPermisos[role][module][action] = !newPermisos[role][module][action]
      } else {
        // Es un permiso de módulo completo (dashboard, configuracion, etc.)
        newPermisos[role][module] = !newPermisos[role][module]
      }

      return newPermisos
    })
  }

  const handleSavePermissions = async () => {
    setLoading(true)

    try {
      // Simulación de guardado
      await new Promise((resolve) => setTimeout(resolve, 1000))

      toast({
        title: "Permisos actualizados",
        description: "Los permisos han sido actualizados correctamente.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudieron actualizar los permisos.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const renderPermissionCheckbox = (role: string, module: string, action?: string, label?: string) => {
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
        <Button onClick={handleSavePermissions} disabled={loading}>
          {loading ? "Guardando..." : "Guardar Cambios"}
        </Button>
      </div>
    </div>
  )
}
