"use client";
import React, { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Smartphone, Settings, ShoppingBag, Clock, Shield, MapPin, Phone, Mail } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/lib/supabase";
import { toast } from "@/components/ui/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

export default function LandingPage() {
  const [statusData, setStatusData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  const handleContact = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = {
      nombre: (e.target as any).nombre.value,
      cedula_ruc: (e.target as any).cedula_ruc.value,
      telefono: (e.target as any).telefono.value,
      email: (e.target as any).email.value,
      direccion: (e.target as any).direccion.value,
      mensaje: (e.target as any).mensaje.value,
    };

    try {
      const { error: contactError } = await supabase.from("contact_requests").insert(formData);
      if (contactError) throw contactError;

      const { data: admins } = await supabase.from("users").select("id").eq("role", "admin");
      if (admins) {
        const notifications = admins.map((admin: any) => ({
          user_id: admin.id,
          tipo: "contact_request",
          titulo: "Nueva solicitud de contacto",
          mensaje: `Solicitud de ${formData.nombre} (${formData.cedula_ruc})`,
          fecha: new Date().toISOString(),
          leida: false,
          accion: `/dashboard/contact-requests`,
          icono: "Mail",
        }));
        await supabase.from("notificaciones").insert(notifications);
      }

      toast({ title: "Mensaje enviado", description: "Gracias por contactarnos." });
    } catch (error: any) {
      toast({ title: "Error", description: "No se pudo enviar el mensaje.", variant: "destructive" });
    }
  };

  const handleStatusCheck = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setStatusData(null); // Limpiar datos anteriores
    const orderId = (e.target as HTMLFormElement)["orderId"].value;

    try {
      // Consultar órdenes primero
      let { data: order, error: orderError } = await supabase
        .from("ordenes")
        .select("*, clientes(nombre), equipos(marca, modelo)")
        .eq("numero_orden", orderId)
        .single();

      if (order) {
        setStatusData({ type: "orden", ...order });
        setOpen(true);
      } else if (!orderError) {
        // Si no hay error de orden, consultar ventas
        let { data: sale, error: saleError } = await supabase
          .from("ventas")
          .select("*, clientes(nombre)")
          .eq("numero_venta", orderId)
          .single();

        if (sale) {
          setStatusData({ type: "venta", ...sale });
          setOpen(true);
        } else if (!saleError) {
          setError("No se encontró la orden o venta con ese número.");
        }
      }
    } catch (err) {
      setError("Error al consultar el estado. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-40 border-b bg-background">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <Smartphone className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">Eco_Tech</span>
          </div>
          <nav className="hidden space-x-4 md:flex">
            <Link href="#servicios" className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary">
              Servicios
            </Link>
            <Link href="#nosotros" className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary">
              Nosotros
            </Link>
            <Link href="#contacto" className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary">
              Contacto
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        <section className="bg-gradient-to-b from-background to-muted py-20">
          <div className="container flex flex-col items-center text-center">
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
              Soluciones tecnológicas <span className="text-primary">a tu alcance</span>
            </h1>
            <p className="mt-6 max-w-2xl text-lg text-muted-foreground">
              Especialistas en reparación de celulares y venta de accesorios. Servicio rápido, eficiente y con garantía.
            </p>
            <div className="mt-10 flex flex-wrap justify-center gap-4">
              <Button size="lg" variant="outline" asChild>
                <Link href="#contacto">Contáctanos</Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="#servicios">Ver servicios</Link>
              </Button>
            </div>
          </div>
        </section>

        <section className="py-20">
          <div className="container">
            <div className="mb-12 text-center">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Consulta tu Orden o Compra</h2>
              <p className="mt-4 text-muted-foreground">
                Ingresa tu número de orden o venta para ver el estado de tu solicitud
              </p>
            </div>
            <div className="flex justify-center">
              <form onSubmit={handleStatusCheck} className="flex w-full max-w-md gap-2">
                <Input name="orderId" placeholder="Ingresa tu número de orden o venta (e.g., ORD123)" disabled={loading} />
                <Button type="submit" disabled={loading}>
                  {loading ? "Cargando..." : "Consultar"}
                </Button>
              </form>
            </div>
            {error && <p className="mt-4 text-center text-red-500">{error}</p>}
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Estado de tu {statusData?.type || "solicitud"}</DialogTitle>
                </DialogHeader>
                {loading ? (
                  <div className="text-center">Cargando...</div>
                ) : statusData ? (
                  <div className="space-y-2">
                    <p><strong>Número:</strong> {statusData.numero_orden || statusData.numero_venta}</p>
                    <p><strong>Cliente:</strong> {statusData.clientes?.nombre || "No disponible"}</p>
                    {statusData.type === "orden" && (
                      <>
                        <p><strong>Equipo:</strong> {statusData.equipos?.marca} {statusData.equipos?.modelo}</p>
                        <p><strong>Estado:</strong> {statusData.estado || "Sin estado definido"}</p>
                      </>
                    )}
                    {statusData.type === "venta" && (
                      <>
                        <p><strong>Total:</strong> ${statusData.total || "No disponible"}</p>
                        <p><strong>Fecha:</strong> {statusData.created_at ? new Date(statusData.created_at).toLocaleDateString() : "No disponible"}</p>
                      </>
                    )}
                  </div>
                ) : null}
              </DialogContent>
            </Dialog>
          </div>
        </section>

        <section id="servicios" className="py-20">
          <div className="container">
            <div className="mb-12 text-center">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Nuestros Servicios</h2>
              <p className="mt-4 text-muted-foreground">Ofrecemos soluciones completas para tus dispositivos móviles</p>
            </div>
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              <Card className="flex flex-col items-center p-6 text-center">
                <div className="mb-4 rounded-full bg-primary/10 p-3">
                  <Smartphone className="h-6 w-6 text-primary" />
                </div>
                <h3 className="mb-2 text-xl font-bold">Reparación de Pantallas</h3>
                <p className="text-muted-foreground">
                  Reemplazo de pantallas rotas o con fallas para todo tipo de dispositivos móviles.
                </p>
              </Card>
              <Card className="flex flex-col items-center p-6 text-center">
                <div className="mb-4 rounded-full bg-primary/10 p-3">
                  <Settings className="h-6 w-6 text-primary" />
                </div>
                <h3 className="mb-2 text-xl font-bold">Reparación de Hardware</h3>
                <p className="text-muted-foreground">
                  Solución a problemas de batería, botones, cámaras, micrófonos y más.
                </p>
              </Card>
              <Card className="flex flex-col items-center p-6 text-center">
                <div className="mb-4 rounded-full bg-primary/10 p-3">
                  <ShoppingBag className="h-6 w-6 text-primary" />
                </div>
                <h3 className="mb-2 text-xl font-bold">Venta de Accesorios</h3>
                <p className="text-muted-foreground">
                  Amplio catálogo de accesorios originales y de alta calidad para tu dispositivo.
                </p>
              </Card>
            </div>
          </div>
        </section>

        <section className="bg-muted py-20">
          <div className="container">
            <div className="mb-12 text-center">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">¿Por qué elegirnos?</h2>
              <p className="mt-4 text-muted-foreground">
                Nos destacamos por ofrecer un servicio de calidad y confianza
              </p>
            </div>
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              <div className="flex flex-col items-center text-center">
                <div className="mb-4 rounded-full bg-primary/10 p-3">
                  <Clock className="h-6 w-6 text-primary" />
                </div>
                <h3 className="mb-2 text-xl font-bold">Servicio Rápido</h3>
                <p className="text-muted-foreground">
                  La mayoría de las reparaciones se realizan el mismo día, minimizando el tiempo sin tu dispositivo.
                </p>
              </div>
              <div className="flex flex-col items-center text-center">
                <div className="mb-4 rounded-full bg-primary/10 p-3">
                  <Shield className="h-6 w-6 text-primary" />
                </div>
                <h3 className="mb-2 text-xl font-bold">Garantía en Reparaciones</h3>
                <p className="text-muted-foreground">
                  Todas nuestras reparaciones cuentan con garantía, asegurando la calidad de nuestro trabajo.
                </p>
              </div>
              <div className="flex flex-col items-center text-center">
                <div className="mb-4 rounded-full bg-primary/10 p-3">
                  <Settings className="h-6 w-6 text-primary" />
                </div>
                <h3 className="mb-2 text-xl font-bold">Técnicos Certificados</h3>
                <p className="text-muted-foreground">
                  Nuestro equipo está formado por profesionales con amplia experiencia en el sector.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section id="nosotros" className="py-20">
          <div className="container">
            <div className="grid gap-12 md:grid-cols-2">
              <div>
                <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Sobre Nosotros</h2>
                <p className="mt-4 text-muted-foreground">
                  En Eco_Tech nos dedicamos a brindar soluciones tecnológicas de calidad. Con más de 5 años de
                  experiencia en el mercado, nos hemos consolidado como líderes en reparación de dispositivos móviles y
                  venta de accesorios.
                </p>
                <p className="mt-4 text-muted-foreground">
                  Nuestro compromiso es ofrecer un servicio honesto, transparente y eficiente, utilizando repuestos de
                  alta calidad y garantizando la satisfacción de nuestros clientes.
                </p>
                <Button className="mt-6" variant="outline" asChild>
                  <Link href="#contacto">Contáctanos</Link>
                </Button>
              </div>
              <div className="flex items-center justify-center">
                <div className="relative h-80 w-80 overflow-hidden rounded-lg bg-muted">
                  <div className="absolute inset-0 flex items-center justify-center bg-primary/10">
                    <Smartphone className="h-32 w-32 text-primary opacity-50" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="contacto" className="bg-muted py-20">
          <div className="container">
            <div className="mb-12 text-center">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Contáctanos</h2>
              <p className="mt-4 text-muted-foreground">
                Estamos aquí para ayudarte con cualquier consulta o servicio que necesites
              </p>
            </div>
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              <Card className="flex flex-col items-center p-6 text-center">
                <div className="mb-4 rounded-full bg-primary/10 p-3">
                  <MapPin className="h-6 w-6 text-primary" />
                </div>
                <h3 className="mb-2 text-xl font-bold">Ubicación</h3>
                <p className="text-muted-foreground">Calle Principal 123, Ciudad</p>
              </Card>
              <Card className="flex flex-col items-center p-6 text-center">
                <div className="mb-4 rounded-full bg-primary/10 p-3">
                  <Phone className="h-6 w-6 text-primary" />
                </div>
                <h3 className="mb-2 text-xl font-bold">Teléfono</h3>
                <p className="text-muted-foreground">555-123-4567</p>
              </Card>
              <Card className="flex flex-col items-center p-6 text-center">
                <div className="mb-4 rounded-full bg-primary/10 p-3">
                  <Mail className="h-6 w-6 text-primary" />
                </div>
                <h3 className="mb-2 text-xl font-bold">Correo Electrónico</h3>
                <p className="text-muted-foreground">contacto@ecotech.com</p>
              </Card>
            </div>
            <div className="mt-12">
              <form onSubmit={handleContact} className="mx-auto max-w-md space-y-4">
                <div>
                  <Label htmlFor="nombre">Nombre</Label>
                  <Input id="nombre" name="nombre" placeholder="Tu nombre" required />
                </div>
                <div>
                  <Label htmlFor="cedula_ruc">Cédula/RUC</Label>
                  <Input id="cedula_ruc" name="cedula_ruc" placeholder="Cédula o RUC" />
                </div>
                <div>
                  <Label htmlFor="telefono">Teléfono</Label>
                  <Input id="telefono" name="telefono" placeholder="Teléfono" />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" name="email" type="email" placeholder="tu@email.com" required />
                </div>
                <div>
                  <Label htmlFor="direccion">Dirección</Label>
                  <Input id="direccion" name="direccion" placeholder="Dirección" />
                </div>
                <div>
                  <Label htmlFor="mensaje">Mensaje</Label>
                  <Textarea id="mensaje" name="mensaje" placeholder="Escribe tu mensaje" required />
                </div>
                <Button type="submit" className="w-full">Enviar Mensaje</Button>
              </form>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t bg-background py-8">
        <div className="container">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <div className="flex items-center gap-2">
              <Smartphone className="h-5 w-5 text-primary" />
              <span className="text-lg font-bold">Eco_Tech</span>
            </div>
            <p className="text-center text-sm text-muted-foreground">
              © {new Date().getFullYear()} Eco_Tech. Todos los derechos reservados.
            </p>
            <div className="flex gap-4">
              <Link href="#" className="text-sm text-muted-foreground hover:text-primary">
                Términos
              </Link>
              <Link href="#" className="text-sm text-muted-foreground hover:text-primary">
                Privacidad
              </Link>
              <Link href="/auth/login" className="text-sm text-muted-foreground hover:text-primary">
                Acceso para Equipo
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}