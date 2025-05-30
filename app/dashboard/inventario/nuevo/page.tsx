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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { ArrowLeft } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import { supabase } from "@/lib/supabase"

const proveedores = [
  { id: "PROV-001", nombre: "TechParts Inc." },
  { id: "PROV-002", nombre: "BatteryPlus" },
  { id: "PROV-003", nombre: "ElectroSupply" },
  { id: "PROV-004", nombre: "ScreenGuard" },
  { id: "PROV-005", nombre: "CaseMakers" },
]

const categorias = ["Repuestos", "Accesorios", "Cables", "Audio", "Baterías", "Protectores", "Fundas", "Otros"]

export default function NuevoProductoPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    nombre: "",
    categoria: "",
    descripcion: "",
    precio_compra: "",
    precio_venta: "",
    stock: "", // Cambiado de 'cantidad' a 'stock'
    stock_minimo: "",
    ubicacion: "",
    proveedor_id: "",
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
      // Validar campos numéricos
      const parsedData = {
        nombre: formData.nombre,
        categoria_id: formData.categoria, // Usamos 'categoria' como categoría_id
        descripcion: formData.descripcion,
        precio_compra: parseFloat(formData.precio_compra) || 0,
        precio: parseFloat(formData.precio_venta) || 0, // 'precio' es el precio de venta en la tabla
        stock: parseInt(formData.stock, 10) || 0, // Cambiado de 'cantidad' a 'stock'
        stock_minimo: parseInt(formData.stock_minimo, 10) || 0,
        ubicacion: formData.ubicacion,
        proveedor_id: formData.proveedor_id,
      }

      if (!parsedData.nombre || !parsedData.categoria_id || !parsedData.proveedor_id) {
        throw new Error("Por favor completa los campos obligatorios (Nombre, Categoría, Proveedor).")
      }

      // Guardar en Supabase
      const { error } = await supabase.from("inventario").insert([parsedData])

      if (error) throw error

      toast({
        title: "Producto creado",
        description: "El producto ha sido creado correctamente.",
      })

      router.push("/dashboard/inventario")
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "No se pudo crear el producto.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      <DashboardHeader />
      <div className="flex items-center gap-2">
        <Button variant="outline" size="icon" asChild>
          <Link href="/dashboard/inventario">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h2 className="text-2xl font-bold tracking-tight">Nuevo Producto</h2>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Información del Producto</CardTitle>
              <CardDescription>Ingresa los datos básicos del producto</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="nombre">Nombre del Producto</Label>
                <Input id="nombre" name="nombre" value={formData.nombre} onChange={handleChange} required />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="categoria">Categoría</Label>
                  <Select
                    value={formData.categoria}
                    onValueChange={(value) => handleSelectChange("categoria", value)}
                    required
                  >
                    <SelectTrigger id="categoria">
                      <SelectValue placeholder="Selecciona una categoría" />
                    </SelectTrigger>
                    <SelectContent>
                      {categorias.map((categoria) => (
                        <SelectItem key={categoria} value={categoria}>
                          {categoria}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="proveedor_id">Proveedor</Label>
                  <Select
                    value={formData.proveedor_id}
                    onValueChange={(value) => handleSelectChange("proveedor_id", value)}
                    required
                  >
                    <SelectTrigger id="proveedor_id">
                      <SelectValue placeholder="Selecciona un proveedor" />
                    </SelectTrigger>
                    <SelectContent>
                      {proveedores.map((proveedor) => (
                        <SelectItem key={proveedor.id} value={proveedor.id}>
                          {proveedor.nombre}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="descripcion">Descripción</Label>
                <Textarea
                  id="descripcion"
                  name="descripcion"
                  value={formData.descripcion}
                  onChange={handleChange}
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Precios y Stock</CardTitle>
              <CardDescription>Configura los precios y cantidades del producto</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="precio_compra">Precio de Compra ($)</Label>
                  <Input
                    id="precio_compra"
                    name="precio_compra"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.precio_compra}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="precio_venta">Precio de Venta ($)</Label>
                  <Input
                    id="precio_venta"
                    name="precio_venta"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.precio_venta}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="stock">Stock Inicial</Label> {/* Cambiado de 'Cantidad Inicial' a 'Stock Inicial' */}
                  <Input
                    id="stock"
                    name="stock" // Cambiado de 'cantidad' a 'stock'
                    type="number"
                    min="0"
                    value={formData.stock}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="stock_minimo">Stock Mínimo</Label>
                  <Input
                    id="stock_minimo"
                    name="stock_minimo"
                    type="number"
                    min="0"
                    value={formData.stock_minimo}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="ubicacion">Ubicación en Almacén</Label>
                <Input
                  id="ubicacion"
                  name="ubicacion"
                  value={formData.ubicacion}
                  onChange={handleChange}
                  placeholder="Ej: Estante A-12"
                />
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-2">
            <Button variant="outline" type="button" asChild>
              <Link href="/dashboard/inventario">Cancelar</Link>
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Guardando..." : "Guardar Producto"}
            </Button>
          </div>
        </div>
      </form>
    </div>
  )
}