import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Smartphone, Settings, ShoppingBag, Clock, Shield, MapPin, Phone, Mail } from "lucide-react"

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Header/Navbar */}
      <header className="sticky top-0 z-40 border-b bg-background">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <Smartphone className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">Eco_Tech</span>
          </div>
          <nav className="hidden space-x-4 md:flex">
            <Link
              href="#servicios"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
            >
              Servicios
            </Link>
            <Link
              href="#nosotros"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
            >
              Nosotros
            </Link>
            <Link
              href="#contacto"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
            >
              Contacto
            </Link>
          </nav>
          <div className="flex items-center gap-2">
            <Button variant="outline" asChild>
              <Link href="/login">Iniciar Sesión</Link>
            </Button>
            <Button asChild>
              <Link href="/register">Registrarse</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-gradient-to-b from-background to-muted py-20">
          <div className="container flex flex-col items-center text-center">
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
              Soluciones tecnológicas <span className="text-primary">a tu alcance</span>
            </h1>
            <p className="mt-6 max-w-2xl text-lg text-muted-foreground">
              Especialistas en reparación de celulares y venta de accesorios. Servicio rápido, eficiente y con garantía.
            </p>
            <div className="mt-10 flex flex-wrap justify-center gap-4">
              <Button size="lg" asChild>
                <Link href="/register">Comenzar ahora</Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="#servicios">Ver servicios</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Services Section */}
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

        {/* Features Section */}
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

        {/* About Us Section */}
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

        {/* Contact Section */}
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
            <div className="mt-12 flex justify-center">
              <Button size="lg" asChild>
                <Link href="/register">Registrarse ahora</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
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
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
