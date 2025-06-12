"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { ArrowLeft } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import { supabase } from "@/lib/supabase"

export default function NuevoProveedorPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    nombre: "",
    tipo: "",
    telefono: "",
    correo: "",
    direccion: "",
    contacto_nombre: "",
    contacto_telefono: "",
    notas: "",
    documento: "",
  })
  const [loading, setLoading] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      if (sessionError || !session?.user) throw new Error("No se pudo obtener la sesión")

      const userId = session.user.id

      const { data: empresa, error: empresaError } = await supabase
        .from("empresas")
        .select("id")
        .eq("superadmin_id", userId)
        .single()

      if (empresaError || !empresa) throw new Error("Empresa no encontrada")

      const empresaId = empresa.id

      const { data: lastProveedor, error: fetchError } = await supabase
        .from("proveedores")
        .select("codigo")
        .eq("empresa_id", empresaId)
        .order("codigo", { ascending: false })
        .limit(1)
        .single()

      let newIdNumber = 1
      if (lastProveedor?.codigo) {
        const lastIdNumber = parseInt(lastProveedor.codigo.split("-")[1])
        newIdNumber = lastIdNumber + 1
      }
      const newCode = `PROV-${String(newIdNumber).padStart(3, "0")}`

      const { error: insertError } = await supabase.from("proveedores").insert([{
        nombre: formData.nombre,
        tipo: formData.tipo,
        telefono: formData.telefono,
        correo: formData.correo,
        direccion: formData.direccion,
        contacto_nombre: formData.contacto_nombre || null,
        contacto_telefono: formData.contacto_telefono || null,
        notas: formData.notas || null,
        documento: formData.documento || null,
        productos: 0,
        ultima_compra: null,
        estado: "activo",
        codigo: newCode,
        empresa_id: empresaId
      }])

      if (insertError) throw insertError

      toast({
        title: "Proveedor creado",
        description: "El proveedor ha sido creado exitosamente.",
      })

      router.push("/dashboard/proveedores")

    } catch (error: any) {
      toast({
        title: "Error",
        description: "No se pudo crear el proveedor: " + error.message,
        variant: "destructive",
      })
      console.error("Error detallado:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      <DashboardHeader />
      <div className="flex items-center gap-2">
        <Button variant="outline" size="icon" asChild>
          <Link href="/dashboard/proveedores">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h2 className="text-2xl font-bold tracking-tight">Nuevo Proveedor</h2>
      </div>

      <Card>
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle>Información del Proveedor</CardTitle>
            <CardDescription>Ingresa los datos del nuevo proveedor</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="nombre">Nombre de la Empresa</Label>
                <Input
                  id="nombre"
                  name="nombre"
                  placeholder="Nombre de la empresa"
                  value={formData.nombre}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="documento">RUC/Cédula</Label>
                <Input
                  id="documento"
                  name="documento"
                  placeholder="Ingrese RUC o Cédula"
                  value={formData.documento}
                  onChange={handleChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tipo">Tipo de Proveedor</Label>
                <Select value={formData.tipo} onValueChange={(value) => handleSelectChange("tipo", value)} required>
                  <SelectTrigger id="tipo">
                    <SelectValue placeholder="Selecciona un tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Repuestos">Repuestos</SelectItem>
                    <SelectItem value="Accesorios">Accesorios</SelectItem>
                    <SelectItem value="Baterías">Baterías</SelectItem>
                    <SelectItem value="Protectores">Protectores</SelectItem>
                    <SelectItem value="Fundas">Fundas</SelectItem>
                    <SelectItem value="Audio">Audio</SelectItem>
                    <SelectItem value="Cables">Cables</SelectItem>
                    <SelectItem value="Varios">Varios</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="telefono">Teléfono</Label>
                  <Input
                    id="telefono"
                    name="telefono"
                    placeholder="Teléfono de la empresa"
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
                    placeholder="correo@empresa.com"
                    value={formData.correo}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="direccion">Dirección</Label>
                <Input
                  id="direccion"
                  name="direccion"
                  placeholder="Dirección completa"
                  value={formData.direccion}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="contacto_nombre">Nombre de Contacto</Label>
                  <Input
                    id="contacto_nombre"
                    name="contacto_nombre"
                    placeholder="Nombre de la persona de contacto"
                    value={formData.contacto_nombre}
                    onChange={handleChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contacto_telefono">Teléfono de Contacto</Label>
                  <Input
                    id="contacto_telefono"
                    name="contacto_telefono"
                    placeholder="Teléfono directo del contacto"
                    value={formData.contacto_telefono}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notas">Notas Adicionales</Label>
                <Textarea
                  id="notas"
                  name="notas"
                  placeholder="Información adicional relevante"
                  value={formData.notas}
                  onChange={handleChange}
                  rows={3}
                />
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end gap-2">
            <Button variant="outline" type="button" asChild>
              <Link href="/dashboard/proveedores">Cancelar</Link>
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Guardando..." : "Guardar Proveedor"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
