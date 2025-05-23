"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { toast } from "@/components/ui/use-toast"
import { Mail, Loader2 } from "lucide-react"

interface ProductoRecibo {
  id: string
  nombre: string
  precio: number
  cantidad: number
  subtotal: number
}

interface DialogoEnviarEmailProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  datosVenta: {
    numeroVenta: string
    fecha: Date
    cliente: string | null
    metodoPago: string
    productos: ProductoRecibo[]
    subtotal: number
    impuesto: number
    total: number
  }
}

export function DialogoEnviarEmail({ open, onOpenChange, datosVenta }: DialogoEnviarEmailProps) {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email || !email.includes("@")) {
      toast({
        title: "Error",
        description: "Por favor, ingrese una dirección de correo electrónico válida.",
        variant: "destructive",
      })
      return
    }

    setLoading(true)

    try {
      // Simular envío de correo
      await new Promise((resolve) => setTimeout(resolve, 1500))

      toast({
        title: "Correo enviado",
        description: `El recibo ha sido enviado a ${email} correctamente.`,
      })

      setEmail("")
      onOpenChange(false)
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo enviar el correo. Intente nuevamente.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Enviar Recibo por Correo</DialogTitle>
          <DialogDescription>
            Envíe una copia digital del recibo #{datosVenta.numeroVenta} por correo electrónico.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="email">Correo Electrónico</Label>
              <Input
                id="email"
                type="email"
                placeholder="cliente@ejemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="flex items-center space-x-2">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">El recibo será enviado como un archivo PDF adjunto.</p>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Enviando...
                </>
              ) : (
                "Enviar Recibo"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
