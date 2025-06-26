"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
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
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { ArrowLeft } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/lib/supabase";
import { useEmpresa } from "@/app/context/empresa-context";

interface Categoria {
  id: number;
  nombre: string;
}

interface Proveedor {
  id: string; // uuid
  nombre: string;
}

export default function NuevoProductoPage() {
  const { empresaId } = useEmpresa();
  const router = useRouter();

  const [formData, setFormData] = useState({
    nombre: "",
    categoria_id: "",
    descripcion: "",
    precio_compra: "0",
    precio_venta: "0",
    stock: "0",
    stock_minimo: "0",
    ubicacion: "",
    proveedor_id: "",
  });

  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [proveedores, setProveedores] = useState<Proveedor[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    if (!empresaId) {
      setLoadingData(false);
      toast({ title: "Advertencia", description: "ID de empresa no disponible. Asegúrate de iniciar sesión en una empresa.", variant: "default" });
      return;
    }

    const fetchData = async () => {
      try {
        setLoadingData(true);

        const { data: categoriasData, error: categoriasError } = await supabase
          .from("categorias")
          .select("id, nombre")
          .eq("empresa_id", empresaId);

        const { data: proveedoresData, error: proveedoresError } = await supabase
          .from("proveedores")
          .select("id, nombre")
          .eq("empresa_id", empresaId)
          .eq("estado", "activo")
          .order("nombre", { ascending: true });

        if (categoriasError || proveedoresError) {
          throw categoriasError || proveedoresError;
        }

        setCategorias(categoriasData || []);
        setProveedores(proveedoresData || []);
      } catch (error) {
        console.error("Error cargando datos:", error);
        toast({
          title: "Error",
          description: "No se pudieron cargar categorías o proveedores.",
          variant: "destructive",
        });
      } finally {
        setLoadingData(false);
      }
    };

    fetchData();
  }, [empresaId]);

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
    setLoading(true);

    try {
      if (!empresaId) {
        throw new Error("ID de empresa no disponible. No se puede crear el producto.");
      }

      const parsedData = {
        nombre: formData.nombre,
        descripcion: formData.descripcion,
        precio: parseFloat(formData.precio_venta) || 0,
        precio_compra: parseFloat(formData.precio_compra) || 0,
        stock: parseInt(formData.stock, 10) || 0,
        stock_minimo: parseInt(formData.stock_minimo, 10) || 0,
        categoria_id: parseInt(formData.categoria_id, 10) || null,
        empresa_id: empresaId,
        ubicacion: formData.ubicacion,
      };

      if (!parsedData.nombre || !parsedData.categoria_id || parsedData.precio <= 0 || parsedData.stock < 0) {
        throw new Error("Por favor completa todos los campos obligatorios: Nombre, Categoría, Precio de Venta (mayor a 0) y Stock Inicial (no negativo).");
      }

      const { data: producto, error: productoError } = await supabase
        .from("productos")
        .insert([parsedData])
        .select("id")
        .single();

      if (productoError) throw productoError;

      if (formData.proveedor_id) {
        const { error: proveedorError } = await supabase
          .from("productos_proveedores")
          .insert({
            producto_id: producto.id,
            proveedor_id: formData.proveedor_id,
          });

        if (proveedorError) throw proveedorError;
      }

      toast({
        title: "Producto creado",
        description: "El producto ha sido creado correctamente.",
      });

      setTimeout(() => {
        router.push("/dashboard/inventario");
      }, 1000);
    } catch (error: any) {
      console.error("Error al crear el producto:", error);
      toast({
        title: "Error",
        description: error.message || "No se pudo crear el producto.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loadingData) return <div className="p-6">Cargando datos...</div>;

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
                <Label htmlFor="nombre">Nombre del Producto *</Label>
                <Input id="nombre" name="nombre" value={formData.nombre} onChange={handleChange} required />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="categoria_id">Categoría *</Label>
                  <Select
                    value={formData.categoria_id}
                    onValueChange={(value) => handleSelectChange("categoria_id", value)}
                    required
                  >
                    <SelectTrigger id="categoria_id">
                      <SelectValue placeholder="Selecciona una categoría" />
                    </SelectTrigger>
                    <SelectContent>
                      {categorias.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id.toString()}>
                          {cat.nombre}
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
                  >
                    <SelectTrigger id="proveedor_id">
                      <SelectValue placeholder="Selecciona un proveedor" />
                    </SelectTrigger>
                    <SelectContent>
                      {proveedores.map((prov) => (
                        <SelectItem key={prov.id} value={prov.id}>
                          {prov.nombre}
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
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="precio_venta">Precio de Venta ($) *</Label>
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
                  <Label htmlFor="stock">Stock Inicial *</Label>
                  <Input
                    id="stock"
                    name="stock"
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
            <Button type="submit" disabled={loading || loadingData}>
              {loading ? "Guardando..." : "Guardar Producto"}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
