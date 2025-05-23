"use client"

import { useRef, useState } from "react"
import { useReactToPrint } from "react-to-print"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { ReciboVenta } from "./recibo-venta"
import { DialogoEnviarEmail } from "./dialogo-enviar-email"
import { Printer, Download, Share2, Mail } from "lucide-react"

interface ProductoRecibo {
  id: string
  nombre: string
  precio: number
  cantidad: number
  subtotal: number
  descuento: number
  tipoDescuento: "porcentaje" | "monto"
  precioFinal: number
}

interface DescuentoGeneral {
  tipo: "porcentaje" | "monto"
  valor: number
  monto: number
}

interface ModalReciboProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  datosVenta: {
    numeroVenta: string
    fecha: Date
    cliente: string | null
    metodoPago: string
    productos: ProductoRecibo[]
    subtotal: number
    subtotalConDescuentos: number
    descuentoGeneral: DescuentoGeneral
    totalAhorrado: number
    impuesto: number
    total: number
  }
}

export function ModalRecibo({ open, onOpenChange, datosVenta }: ModalReciboProps) {
  const reciboRef = useRef<HTMLDivElement>(null)
  const [showEmailDialog, setShowEmailDialog] = useState(false)

  const handlePrint = useReactToPrint({
    content: () => reciboRef.current,
    documentTitle: `Recibo_${datosVenta.numeroVenta}`,
    onAfterPrint: () => console.log("Impresión completada"),
  })

  const handleEmailClick = () => {
    setShowEmailDialog(true)
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-auto">
          <DialogHeader>
            <DialogTitle>Recibo de Venta</DialogTitle>
            <DialogDescription>
              Recibo de venta #{datosVenta.numeroVenta} - {datosVenta.fecha.toLocaleDateString()}
              {datosVenta.totalAhorrado > 0 && (
                <span className="ml-2 text-green-600">(Ahorro: ${datosVenta.totalAhorrado.toFixed(2)})</span>
              )}
            </DialogDescription>
          </DialogHeader>

          <div className="border rounded-md p-1">
            <ReciboVenta ref={reciboRef} {...datosVenta} />
          </div>

          <DialogFooter className="sm:justify-between">
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>
                Cerrar
              </Button>
              <Button variant="outline" size="sm">
                <Download className="mr-2 h-4 w-4" />
                Guardar PDF
              </Button>
              <Button variant="outline" size="sm" onClick={handleEmailClick}>
                <Mail className="mr-2 h-4 w-4" />
                Enviar por Correo
              </Button>
              <Button variant="outline" size="sm">
                <Share2 className="mr-2 h-4 w-4" />
                Compartir
              </Button>
            </div>
            <Button onClick={handlePrint}>
              <Printer className="mr-2 h-4 w-4" />
              Imprimir Recibo
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <DialogoEnviarEmail open={showEmailDialog} onOpenChange={setShowEmailDialog} datosVenta={datosVenta} />
    </>
  )
}
