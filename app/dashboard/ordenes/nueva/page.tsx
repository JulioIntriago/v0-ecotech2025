"use client";

import type React from "react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { toast } from "@/components/ui/use-toast";

const fetchOptions = async (table: string) => {
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    console.error("Error: Usuario no autenticado", authError?.message || "No user");
    toast({ title: "Error", description: "Debes iniciar sesión para cargar datos.", variant: "destructive" });
    return [];
  }

  const { data: usuario, error: userError } = await supabase
    .from("usuarios")
    .select("empresa_id")
    .eq("id", user.id)
    .single();

  if (userError || !usuario) {
    console.error("Error fetching usuario:", userError?.message || "No usuario data");
    toast({ title: "Error", description: "No se pudo obtener la empresa del usuario.", variant: "destructive" });
    return [];
  }

  const empresaId = usuario.empresa_id;

  let data: { id: string; nombre: string }[] = [];
  let error: any = null;

  if (table === "clientes") {
    const result = await supabase
      .from("clientes")
      .select("id, nombre")
      .eq("empresa_id", empresaId);
    data = result.data || [];
    error = result.error;
  } else if (table === "empleados") {
    const { data: usuarios, error: usuariosError } = await supabase
      .from("usuarios")
      .select("id")
      .eq("empresa_id", empresaId);

    if (usuariosError) {
      console.error("Error fetching usuarios for empleados:", usuariosError.message || usuariosError);
      toast({ title: "Error", description: "No se pudieron cargar los usuarios para empleados.", variant: "destructive" });
      return [];
    }

    const usuarioIds = usuarios?.map((u) => u.id) || [];

    const result = await supabase
      .from("empleados")
      .select("id, nombre")
      .in("usuario_id", usuarioIds);
    data = result.data || [];
    error = result.error;
  }

  if (error) {
    console.error(`Error fetching ${table}:`, error.message || error);
    toast({ title: "Error", description: `No se pudieron cargar los ${table}.`, variant: "destructive" });
    return [];
  }

  console.log(`${table} cargados:`, data); // Para depuración
  return data;
};

export default function NuevaOrdenPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    cliente_id: "",
    dispositivo: "",
    modelo: "",
    problema: "",
    costo_estimado: "",
    tecnico_asignado: "",
    notas: "",
  });
  const [newClient, setNewClient] = useState({
    nombre: "",
    telefono: "",
    email: "",
    tipo_documento: "",
    numero_documento: "",
    direccion: "",
    notas: "",
  });
  const [showNewClientForm, setShowNewClientForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [clientes, setClientes] = useState<{ id: string; nombre: string }[]>([]);
  const [tecnicos, setTecnicos] = useState<{ id: string; nombre: string }[]>([]);

  useEffect(() => {
    const loadOptions = async () => {
      const clientesData = await fetchOptions("clientes");
      const tecnicosData = await fetchOptions("empleados");
      setClientes(clientesData);
      setTecnicos(tecnicosData);
      if (clientesData.length === 0) {
        toast({ title: "Advertencia", description: "No se encontraron clientes. Crea un cliente nuevo.", variant: "default" });
      }
      if (tecnicosData.length === 0) {
        toast({ title: "Advertencia", description: "No se encontraron técnicos.", variant: "default" });
      }
    };
    loadOptions();
  }, []);

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

  const handleNewClientChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewClient((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleNewClientSelectChange = (name: string, value: string) => {
    setNewClient((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validar costo estimado
      const costoEstimado = parseFloat(formData.costo_estimado);
      if (isNaN(costoEstimado) || costoEstimado < 0) {
        toast({ title: "Error", description: "El costo estimado debe ser un número válido.", variant: "destructive" });
        setLoading(false);
        return;
      }

      // Obtener el usuario autenticado
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        toast({ title: "Error", description: "Usuario no autenticado.", variant: "destructive" });
        setLoading(false);
        return;
      }

      // Obtener la empresa_id del usuario
      const { data: usuario, error: userError } = await supabase
        .from("usuarios")
        .select("empresa_id")
        .eq("id", user.id)
        .single();

      if (userError || !usuario) {
        toast({ title: "Error", description: "No se pudo obtener la empresa del usuario.", variant: "destructive" });
        setLoading(false);
        return;
      }

      const empresaId = usuario.empresa_id;

      let clienteId = formData.cliente_id;

      // Si se está registrando un cliente nuevo
      if (showNewClientForm) {
        if (!newClient.nombre || !newClient.telefono || !newClient.email || !newClient.tipo_documento || !newClient.numero_documento) {
          toast({
            title: "Error",
            description: "Los campos obligatorios del cliente nuevo (Nombre, Teléfono, Email, Tipo de Documento y Número de Documento) deben estar completos.",
            variant: "destructive",
          });
          setLoading(false);
          return;
        }

        const { data: newClientData, error: clientError } = await supabase
          .from("clientes")
          .insert({
            id: crypto.randomUUID(),
            nombre: newClient.nombre,
            telefono: newClient.telefono,
            email: newClient.email,
            cedula: newClient.numero_documento,
            direccion: newClient.direccion || null,
            notas: newClient.notas || null,
            empresa_id: empresaId,
            created_at: new Date().toISOString(),
          })
          .select()
          .single();

        if (clientError) {
          console.error("Error adding client:", clientError.message || clientError);
          toast({ title: "Error", description: "No se pudo registrar el cliente.", variant: "destructive" });
          setLoading(false);
          return;
        }

        clienteId = newClientData.id;
      } else {
        if (!clienteId) {
          toast({ title: "Error", description: "Debe seleccionar un cliente o agregar uno nuevo.", variant: "destructive" });
          setLoading(false);
          return;
        }
      }

      // Crear la orden
      const { error: orderError } = await supabase.from("ordenes").insert({
        cliente_id: clienteId,
        empresa_id: empresaId,
        dispositivo: formData.dispositivo,
        modelo: formData.modelo,
        problema_reportado: formData.problema,
        observaciones: formData.notas,
        costo_estimado: costoEstimado,
        tecnico_asignado: formData.tecnico_asignado || null,
        notas: formData.notas || null,
        estado: "pendiente",
        fecha_ingreso: new Date().toISOString(),
      });

      if (orderError) {
        console.error("Error creating order:", orderError.message || orderError);
        if (showNewClientForm) {
          await supabase.from("clientes").delete().eq("id", clienteId);
        }
        throw new Error(`No se pudo crear la orden: ${orderError.message}`);
      }

      toast({ title: "Éxito", description: "Orden creada correctamente." });
      router.push("/dashboard/ordenes");
    } catch (error: any) {
      console.error("Error:", error.message || error);
      toast({ title: "Error", description: error.message || "No se pudo crear la orden.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 p-6">
      <DashboardHeader />
      <div className="flex items-center gap-2">
        <Button variant="outline" size="icon" asChild>
          <Link href="/dashboard/ordenes">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h2 className="text-2xl font-bold tracking-tight">Nueva Orden de Trabajo</h2>
      </div>

      <Card>
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle>Información de la Orden</CardTitle>
            <CardDescription>Ingresa los detalles de la nueva orden de reparación</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="cliente_id">Cliente</Label>
                {!showNewClientForm ? (
                  <div className="flex gap-2">
                    <Select
                      value={formData.cliente_id}
                      onValueChange={(value) => handleSelectChange("cliente_id", value)}
                      required={!showNewClientForm}
                    >
                      <SelectTrigger id="cliente_id">
                        <SelectValue placeholder="Selecciona un cliente o agrega uno nuevo" />
                      </SelectTrigger>
                      <SelectContent>
                        {clientes.map((cliente) => (
                          <SelectItem key={cliente.id} value={cliente.id}>
                            {cliente.nombre}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button variant="outline" size="sm" onClick={() => setShowNewClientForm(true)}>
                      Agregar Cliente
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-3">
                      <div className="space-y-2">
                        <Label htmlFor="newClientNombre">Nombre *</Label>
                        <Input
                          id="newClientNombre"
                          name="nombre"
                          value={newClient.nombre}
                          onChange={handleNewClientChange}
                          required={showNewClientForm}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="newClientTelefono">Teléfono *</Label>
                        <Input
                          id="newClientTelefono"
                          name="telefono"
                          value={newClient.telefono}
                          onChange={handleNewClientChange}
                          required={showNewClientForm}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="newClientCorreo">Correo *</Label>
                        <Input
                          id="newClientCorreo"
                          name="email"
                          type="email"
                          value={newClient.email}
                          onChange={handleNewClientChange}
                          required={showNewClientForm}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="newClientTipoDocumento">Tipo de Documento *</Label>
                        <Select
                          value={newClient.tipo_documento}
                          onValueChange={(value) => handleNewClientSelectChange("tipo_documento", value)}
                          required={showNewClientForm}
                        >
                          <SelectTrigger id="newClientTipoDocumento">
                            <SelectValue placeholder="Selecciona un tipo" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="DNI">DNI</SelectItem>
                            <SelectItem value="RUC">RUC</SelectItem>
                            <SelectItem value="Pasaporte">Pasaporte</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="newClientNumeroDocumento">Número de Documento *</Label>
                        <Input
                          id="newClientNumeroDocumento"
                          name="numero_documento"
                          value={newClient.numero_documento}
                          onChange={handleNewClientChange}
                          required={showNewClientForm}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="newClientDireccion">Dirección</Label>
                        <Input
                          id="newClientDireccion"
                          name="direccion"
                          value={newClient.direccion}
                          onChange={handleNewClientChange}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="newClientNotas">Notas</Label>
                      <Textarea
                        id="newClientNotas"
                        name="notas"
                        value={newClient.notas}
                        onChange={handleNewClientChange}
                        rows={3}
                      />
                    </div>
                    <Button variant="outline" size="sm" onClick={() => setShowNewClientForm(false)}>
                      Cancelar
                    </Button>
                  </div>
                )}
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="dispositivo">Tipo de Dispositivo</Label>
                  <Input
                    id="dispositivo"
                    name="dispositivo"
                    placeholder="iPhone, Samsung, etc."
                    value={formData.dispositivo}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="modelo">Modelo</Label>
                  <Input
                    id="modelo"
                    name="modelo"
                    placeholder="iPhone 12, Galaxy S21, etc."
                    value={formData.modelo}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="problema">Descripción del Problema</Label>
                <Textarea
                  id="problema"
                  name="problema"
                  placeholder="Detalla el problema que presenta el dispositivo"
                  value={formData.problema}
                  onChange={handleChange}
                  required
                  rows={3}
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="costo_estimado">Costo Estimado ($)</Label>
                  <Input
                    id="costo_estimado"
                    name="costo_estimado"
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    value={formData.costo_estimado}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tecnico_asignado">Técnico Asignado</Label>
                  <Select
                    value={formData.tecnico_asignado}
                    onValueChange={(value) => handleSelectChange("tecnico_asignado", value)}
                  >
                    <SelectTrigger id="tecnico_asignado">
                      <SelectValue placeholder="Selecciona un técnico (opcional)" />
                    </SelectTrigger>
                    <SelectContent>
                      {tecnicos.map((tecnico) => (
                        <SelectItem key={tecnico.id} value={tecnico.id}>
                          {tecnico.nombre}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
              <Link href="/dashboard/ordenes">Cancelar</Link>
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Guardando..." : "Guardar Orden"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}