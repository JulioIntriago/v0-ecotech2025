"use client"

import type React from "react"
import { SidebarProvider } from "@/components/dashboard/sidebar-provider"
import { DashboardSidebar } from "@/components/dashboard/sidebar"
import { ThemeProvider } from "@/components/theme-provider"
import { NotificacionesProvider } from "@/components/dashboard/notificaciones-provider"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <NotificacionesProvider>
        <SidebarProvider>
          <div className="flex min-h-screen">
            <DashboardSidebar />
            <main className="flex-1 overflow-y-auto px-6 pt-2 pb-6 bg-background">
              {children}
            </main>
          </div>
        </SidebarProvider>
      </NotificacionesProvider>
    </ThemeProvider>
  )
}