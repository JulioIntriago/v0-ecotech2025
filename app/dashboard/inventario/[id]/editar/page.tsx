"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation"; // Importa hooks correctos
import { supabase } from "@/lib/supabase";
import { useEmpresa } from "@/app/context/empresa-context";
import { toast } from "@/components/ui/use-toast";

export default function EditarProductoPage() {
  const router = useRouter();
  const params = useParams(); // Aquí params es un objeto con id
  const id = params?.id;

  const { empresaId } = useEmpresa();

  const [form, setForm] = useState({
    nombre: "",
    descripcion: "",
    precio: 0,
    stock: 0,
    activo: true,
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Cargar producto para editar
  useEffect(() => {
    if (!empresaId || !id) return;

    async function fetchProducto() {
      const { data, error } = await supabase
        .from("productos")
        .select("nombre, descripcion, precio, stock, activo")
        .eq("id", id)
        .eq("empresa_id", empresaId)
        .single();

      if (error) {
        toast({
          title: "Error",
          description: "No se pudo cargar el producto",
          variant: "destructive",
        });
        router.push("/dashboard/inventario");
      } else {
        setForm({
          nombre: data.nombre,
          descripcion: data.descripcion || "",
          precio: data.precio,
          stock: data.stock,
          activo: data.activo,
        });
      }
      setLoading(false);
    }

    fetchProducto();
  }, [empresaId, id, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : type === "number" ? Number(value) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!id || !empresaId) return;

    setSaving(true);
    const { error } = await supabase
      .from("productos")
      .update({
        nombre: form.nombre,
        descripcion: form.descripcion,
        precio: form.precio,
        stock: form.stock,
        activo: form.activo,
      })
      .eq("id", id)
      .eq("empresa_id", empresaId);

    setSaving(false);

    if (error) {
      toast({
        title: "Error",
        description: "No se pudo actualizar el producto",
        variant: "destructive",
      });
    } else {
      toast({ title: "Éxito", description: "Producto actualizado" });
      router.push(`/dashboard/inventario/${id}`);
    }
  };

  if (loading) return <p>Cargando producto...</p>;

  return (
    <div className="p-6 max-w-lg mx-auto">
      <h1 className="text-2xl font-bold mb-4">Editar Producto</h1>

      <button
        onClick={() => router.back()}
        className="mb-4 text-sm text-gray-600 underline hover:text-gray-900"
      >
        ← Volver atrás
      </button>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block font-semibold mb-1">Nombre</label>
          <input
            type="text"
            name="nombre"
            value={form.nombre}
            onChange={handleChange}
            required
            className="w-full border rounded px-3 py-2"
          />
        </div>

        <div>
          <label className="block font-semibold mb-1">Descripción</label>
          <textarea
            name="descripcion"
            value={form.descripcion}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
            rows={3}
          />
        </div>

        <div>
          <label className="block font-semibold mb-1">Precio</label>
          <input
            type="number"
            name="precio"
            value={form.precio}
            onChange={handleChange}
            min={0}
            step={0.01}
            className="w-full border rounded px-3 py-2"
            required
          />
        </div>

        <div>
          <label className="block font-semibold mb-1">Stock</label>
          <input
            type="number"
            name="stock"
            value={form.stock}
            onChange={handleChange}
            min={0}
            className="w-full border rounded px-3 py-2"
            required
          />
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            name="activo"
            checked={form.activo}
            onChange={handleChange}
            id="activo"
          />
          <label htmlFor="activo" className="font-semibold">
            Activo
          </label>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
        >
          {saving ? "Guardando..." : "Guardar cambios"}
        </button>
      </form>
    </div>
  );
}
