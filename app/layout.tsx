import type React from "react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { EmpresaProvider } from "./context/empresa-context";
import { ConfigProvider } from "./context/config-context";
import { NotificacionesProvider } from "@/components/dashboard/notificaciones-provider";
import { SidebarProvider } from "@/components/dashboard/sidebar-provider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Eco_Tech - Sistema de Gestión",
  description: "Sistema de gestión para servicios de reparación y venta de accesorios",
  generator: "v0.dev",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <EmpresaProvider>
            <ConfigProvider>
              <NotificacionesProvider>
                <SidebarProvider>
                  {children}
                </SidebarProvider>
              </NotificacionesProvider>
            </ConfigProvider>
          </EmpresaProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}