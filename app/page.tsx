"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Smartphone, Settings, ShoppingBag, MapPin, Phone, Mail } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/lib/supabase";
import { toast } from "@/components/ui/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";

export default function LandingPage() {
  const [statusData, setStatusData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [contactForm, setContactForm] = useState({
    nombre: "",
    telefono: "",
    email: "",
    mensaje: "",
  });

  useEffect(() => {
    const sections = document.querySelectorAll("section");
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("animate-fadeIn");
          }
        });
      },
      { threshold: 0.1 }
    );

    sections.forEach((section) => observer.observe(section));

    return () => {
      sections.forEach((section) => observer.unobserve(section));
    };
  }, []);

  const handleContact = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error: contactError } = await supabase.from("contact_requests").insert({
        nombre: contactForm.nombre,
        telefono: contactForm.telefono,
        email: contactForm.email,
        mensaje: contactForm.mensaje,
      });
      if (contactError) throw contactError;

      const { data: admins } = await supabase.from("users").select("id").eq("role", "admin");
      if (admins) {
        const notifications = admins.map((admin: any) => ({
          user_id: admin.id,
          tipo: "contact_request",
          titulo: "Nueva solicitud de contacto",
          mensaje: `Solicitud de ${contactForm.nombre}`,
          fecha: new Date().toISOString(),
          leida: false,
          accion: `/dashboard/contact-requests`,
          icono: "Mail",
        }));
        await supabase.from("notificaciones").insert(notifications);
      }

      toast({ title: "Mensaje enviado", description: "Gracias por contactarnos, te responderemos pronto." });
      setContactForm({ nombre: "", telefono: "", email: "", mensaje: "" });
    } catch (error: any) {
      toast({ title: "Error", description: "No se pudo enviar el mensaje. Intenta de nuevo.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleStatusCheck = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setStatusData(null);
    const orderId = (e.currentTarget as HTMLFormElement)["orderId"].value;

    try {
      let { data: order, error: orderError } = await supabase
        .from("ordenes")
        .select("*, clientes(nombre), equipos(marca, modelo)")
        .eq("numero_orden", orderId)
        .single();

      if (order) {
        setStatusData({ type: "orden", ...order });
        setOpen(true);
      } else if (!orderError) {
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
    <div className="flex min-h-screen flex-col bg-background">
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.8s ease-out forwards;
        }
        .hover-scale {
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        .hover-scale:hover {
          transform: scale(1.05);
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
        }
        .hover-button {
          transition: background-color 0.3s ease, transform 0.2s ease;
        }
        .hover-button:hover {
          background-color: #2563eb;
          transform: translateY(-2px);
        }
      `}</style>
<header className="sticky top-0 z-50 w-full bg-white shadow-sm">
  <div className="container flex items-center justify-between py-4">
    <Link href="/" className="flex items-center gap-2">
      <Smartphone className="h-6 w-6 text-blue-600" />
      <span className="text-lg font-bold text-gray-800">Eco_Tech</span>
    </Link>
    <nav className="hidden md:flex items-center gap-6">
      <Link href="#servicios" className="text-gray-700 hover:text-blue-600 font-medium">Servicios</Link>
      <Link href="#nosotros" className="text-gray-700 hover:text-blue-600 font-medium">Nosotros</Link>
      <Link href="#contacto" className="text-gray-700 hover:text-blue-600 font-medium">Contacto</Link>
    </nav>
    <div className="md:hidden">
      {/* Aquí podrías agregar un menú hamburguesa para móvil si lo deseas */}
    </div>
  </div>
</header>


      <main className="flex-1">
        <section className="bg-gradient-to-b from-blue-50 to-white py-24">
          <div className="container flex flex-col items-center text-center">
            <h1 className="text-4xl font-bold tracking-tight text-gray-800 sm:text-5xl md:text-6xl">
              Soluciones tecnológicas <span className="text-blue-600">a tu alcance</span>
            </h1>
            <p className="mt-6 max-w-2xl text-lg text-gray-600">
              Especialistas en reparación de celulares y venta de accesorios. Servicio rápido, eficiente y con garantía.
            </p>
            <div className="mt-10 flex flex-wrap justify-center gap-4">
              <Button size="lg" variant="outline" className="border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white hover-button">
                <Link href="#contacto">Contáctanos</Link>
              </Button>
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700 hover-button">
                <Link href="#servicios">Ver servicios</Link>
              </Button>
            </div>
          </div>
        </section>

        <section className="py-20">
          <div className="container">
            <div className="mb-12 text-center">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl text-gray-800">Consulta tu Orden o Compra</h2>
              <p className="mt-4 text-gray-600">
                Ingresa tu número de orden o venta para ver el estado de tu solicitud
              </p>
            </div>
            <div className="flex justify-center">
              <form onSubmit={handleStatusCheck} className="flex w-full max-w-md gap-4">
                <Input
                  name="orderId"
                  placeholder="Ingresa tu número (e.g., ORD123)"
                  disabled={loading}
                  className="flex-1 border-gray-300 focus:ring-blue-600"
                />
                <Button type="submit" disabled={loading} className="w-32 bg-blue-600 hover:bg-blue-700 hover-button">
                  {loading ? "Cargando..." : "Consultar"}
                </Button>
              </form>
            </div>
            {error && <p className="mt-4 text-center text-red-500">{error}</p>}
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle className="text-2xl font-bold">Estado de tu {statusData?.type || "solicitud"}</DialogTitle>
                </DialogHeader>
                {loading ? (
                  <div className="text-center py-4">Cargando...</div>
                ) : statusData ? (
                  <div className="space-y-4">
                    <p className="text-lg"><strong>Número:</strong> {statusData.numero_orden || statusData.numero_venta}</p>
                    <p className="text-lg"><strong>Cliente:</strong> {statusData.clientes?.nombre || "No disponible"}</p>
                    {statusData.type === "orden" && (
                      <>
                        <p className="text-lg"><strong>Equipo:</strong> {statusData.equipos?.marca} {statusData.equipos?.modelo}</p>
                        <p className="text-lg"><strong>Estado:</strong> {statusData.estado || "Sin estado definido"}</p>
                      </>
                    )}
                    {statusData.type === "venta" && (
                      <>
                        <p className="text-lg"><strong>Total:</strong> ${statusData.total || "No disponible"}</p>
                        <p className="text-lg"><strong>Fecha:</strong> {statusData.created_at ? new Date(statusData.created_at).toLocaleDateString() : "No disponible"}</p>
                      </>
                    )}
                  </div>
                ) : null}
              </DialogContent>
            </Dialog>
          </div>
        </section>

        <section id="servicios" className="py-20 bg-gray-50">
          <div className="container">
            <div className="mb-12 text-center">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl text-gray-800">Nuestros Servicios</h2>
              <p className="mt-4 text-gray-600">Ofrecemos soluciones completas para tus dispositivos móviles</p>
            </div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <Card className="flex flex-col items-center p-6 text-center hover-scale rounded-lg border border-gray-200">
                <div className="mb-4 rounded-full bg-blue-100 p-3">
                  <Smartphone className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="mb-2 text-xl font-bold text-gray-800">Reparación de Pantallas</h3>
                <p className="text-gray-600">
                  Reemplazo de pantallas rotas o con fallas para todo tipo de dispositivos móviles.
                </p>
              </Card>
              <Card className="flex flex-col items-center p-6 text-center hover-scale rounded-lg border border-gray-200">
                <div className="mb-4 rounded-full bg-blue-100 p-3">
                  <Settings className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="mb-2 text-xl font-bold text-gray-800">Reparación de Hardware</h3>
                <p className="text-gray-600">
                  Solución a problemas de batería, botones, cámaras, micrófonos y más.
                </p>
              </Card>
              <Card className="flex flex-col items-center p-6 text-center hover-scale rounded-lg border border-gray-200">
                <div className="mb-4 rounded-full bg-blue-100 p-3">
                  <ShoppingBag className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="mb-2 text-xl font-bold text-gray-800">Venta de Accesorios</h3>
                <p className="text-gray-600">
                  Amplio catálogo de accesorios originales y de alta calidad para tu dispositivo.
                </p>
              </Card>
            </div>
          </div>
        </section>

        <section id="nosotros" className="py-20">
          <div className="container grid gap-12 md:grid-cols-2 items-center">
            <div>
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl text-gray-800">Sobre Nosotros</h2>
              <p className="mt-4 text-gray-600">
                En Eco_Tech nos dedicamos a brindar soluciones tecnológicas de calidad. Con más de 5 años de experiencia,
                nos hemos consolidado como líderes en reparación de dispositivos móviles y venta de accesorios.
              </p>
              <p className="mt-4 text-gray-600">
                Nuestro compromiso es ofrecer un servicio honesto, transparente y eficiente, utilizando repuestos de alta
                calidad y garantizando la satisfacción de nuestros clientes.
              </p>
              <Button className="mt-6 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white hover-button" variant="outline">
                <Link href="#contacto">Contáctanos</Link>
              </Button>
            </div>
            <div className="flex justify-center">
              <div className="relative h-64 w-64 overflow-hidden rounded-lg bg-gray-100 md:h-80 md:w-80">
                <div className="absolute inset-0 flex items-center justify-center bg-blue-100">
                  <Smartphone className="h-32 w-32 text-blue-600 opacity-50 md:h-40 md:w-40" />
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="contacto" className="bg-gray-50 py-20">
          <div className="container">
            <div className="mb-12 text-center">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl text-gray-800">Contáctanos</h2>
              <p className="mt-4 text-gray-600">
                Estamos aquí para ayudarte con cualquier consulta o servicio que necesites
              </p>
            </div>
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              <Card className="flex flex-col items-center p-6 text-center hover-scale rounded-lg border border-gray-200">
                <div className="mb-4 rounded-full bg-blue-100 p-3">
                  <MapPin className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="mb-2 text-xl font-bold text-gray-800">Ubicación</h3>
                <p className="text-gray-600">Calle Principal 123, Ciudad</p>
              </Card>
              <Card className="flex flex-col items-center p-6 text-center hover-scale rounded-lg border border-gray-200">
                <div className="mb-4 rounded-full bg-blue-100 p-3">
                  <Phone className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="mb-2 text-xl font-bold text-gray-800">Teléfono</h3>
                <p className="text-gray-600">555-123-4567</p>
              </Card>
              <Card className="flex flex-col items-center p-6 text-center hover-scale rounded-lg border border-gray-200">
                <div className="mb-4 rounded-full bg-blue-100 p-3">
                  <Mail className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="mb-2 text-xl font-bold text-gray-800">Correo</h3>
                <p className="text-gray-600">contacto@ecotech.com</p>
              </Card>
            </div>
           
          </div>
        </section>
      </main>

      <footer className="border-t bg-gray-50 py-8">
        <div className="container flex flex-col items-center justify-between gap-4 md:flex-row">
          <div className="flex items-center gap-2">
            <Smartphone className="h-5 w-5 text-blue-600" />
            <span className="text-lg font-bold text-gray-800">Eco_Tech</span>
          </div>
          <p className="text-center text-sm text-gray-600">
            © {new Date().getFullYear()} Eco_Tech. Todos los derechos reservados.
          </p>
          <div className="flex gap-4">
            <Link href="#" className="text-sm text-gray-600 hover:text-blue-600">Términos</Link>
            <Link href="#" className="text-sm text-gray-600 hover:text-blue-600">Privacidad</Link>
            <Link href="/auth/login" className="text-sm text-gray-600 hover:text-blue-600">Acceso para Equipo</Link>

          </div>
        </div>
      </footer>
    </div>
  );
}