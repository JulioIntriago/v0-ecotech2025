"use client"

import { forwardRef } from "react"
import QRCode from "react-qr-code"

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

interface ReciboVentaProps {
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

export const ReciboVenta = forwardRef<HTMLDivElement, ReciboVentaProps>(
  (
    {
      numeroVenta,
      fecha,
      cliente,
      metodoPago,
      productos,
      subtotal,
      subtotalConDescuentos,
      descuentoGeneral,
      totalAhorrado,
      impuesto,
      total,
    },
    ref,
  ) => {
    // Formatear fecha
    const fechaFormateada = new Intl.DateTimeFormat("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(fecha)

    // URL de verificación (en un entorno real, esto sería una URL completa)
    const verificationUrl = `/verificar-recibo/${numeroVenta}`

    return (
      <div ref={ref} className="p-6 bg-white text-black print:text-black">
        {/* Cabecera */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold">ECO_TECH</h1>
          <p className="text-sm">Servicios de Reparación de Celulares y Venta de Accesorios</p>
          <p className="text-sm">Calle Principal #123, Ciudad</p>
          <p className="text-sm">Tel: (123) 456-7890</p>
        </div>

        {/* Información de la venta */}
        <div className="border-t border-b border-gray-200 py-4 mb-4">
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <p>
                <strong>Recibo #:</strong> {numeroVenta}
              </p>
              <p>
                <strong>Fecha:</strong> {fechaFormateada}
              </p>
            </div>
            <div>
              <p>
                <strong>Cliente:</strong> {cliente || "Cliente Anónimo"}
              </p>
              <p>
                <strong>Método de Pago:</strong> {metodoPago}
              </p>
            </div>
          </div>
        </div>

        {/* Productos */}
        <table className="w-full mb-4 text-sm">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-2">Producto</th>
              <th className="text-right py-2">Precio</th>
              <th className="text-right py-2">Cant.</th>
              <th className="text-right py-2">Descuento</th>
              <th className="text-right py-2">Total</th>
            </tr>
          </thead>
          <tbody>
            {productos.map((producto) => (
              <tr key={producto.id} className="border-b border-gray-100">
                <td className="py-2">{producto.nombre}</td>
                <td className="text-right py-2">${producto.precio.toFixed(2)}</td>
                <td className="text-right py-2">{producto.cantidad}</td>
                <td className="text-right py-2">
                  {producto.descuento > 0
                    ? producto.tipoDescuento === "porcentaje"
                      ? `${producto.descuento}%`
                      : `$${producto.descuento}`
                    : "-"}
                </td>
                <td className="text-right py-2">
                  {producto.descuento > 0 ? (
                    <>
                      <span className="block line-through text-gray-500">${producto.subtotal.toFixed(2)}</span>
                      <span>${producto.precioFinal.toFixed(2)}</span>
                    </>
                  ) : (
                    `$${producto.subtotal.toFixed(2)}`
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Resumen */}
        <div className="flex flex-col items-end mb-6 text-sm">
          <div className="w-48 space-y-1">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>

            {/* Mostrar descuentos si hay alguno */}
            {totalAhorrado > 0 && (
              <>
                {/* Descuentos por producto */}
                {subtotal - subtotalConDescuentos - descuentoGeneral.monto > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Descuentos productos:</span>
                    <span>-${(subtotal - subtotalConDescuentos - descuentoGeneral.monto).toFixed(2)}</span>
                  </div>
                )}

                {/* Descuento general */}
                {descuentoGeneral.monto > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>
                      Descuento general
                      {descuentoGeneral.tipo === "porcentaje" ? ` (${descuentoGeneral.valor}%)` : ""}:
                    </span>
                    <span>-${descuentoGeneral.monto.toFixed(2)}</span>
                  </div>
                )}

                <div className="flex justify-between font-medium">
                  <span>Subtotal con descuentos:</span>
                  <span>${subtotalConDescuentos.toFixed(2)}</span>
                </div>
              </>
            )}

            <div className="flex justify-between">
              <span>IVA (16%):</span>
              <span>${impuesto.toFixed(2)}</span>
            </div>

            <div className="flex justify-between font-bold border-t border-gray-200 pt-1 mt-1">
              <span>Total:</span>
              <span>${total.toFixed(2)}</span>
            </div>

            {totalAhorrado > 0 && (
              <div className="flex justify-between text-green-600 font-medium mt-2">
                <span>Total ahorrado:</span>
                <span>${totalAhorrado.toFixed(2)}</span>
              </div>
            )}
          </div>
        </div>

        {/* Código QR */}
        <div className="flex flex-col items-center justify-center mt-4 mb-4">
          <div className="border border-gray-200 p-2 bg-white">
            <QRCode value={verificationUrl} size={120} level="M" className="h-auto max-w-full" />
          </div>
          <p className="text-xs mt-2 text-center">Escanee este código QR para verificar la autenticidad del recibo</p>
          <p className="text-xs text-center">
            o visite: <span className="font-medium">ecotech.com/verificar/{numeroVenta}</span>
          </p>
        </div>

        {/* Pie de página */}
        <div className="text-center text-sm mt-4 pt-4 border-t border-gray-200">
          <p className="mb-1">¡Gracias por su compra!</p>
          <p>Para cualquier consulta sobre su compra, por favor comuníquese con nosotros</p>
          <p>y proporcione el número de recibo.</p>
        </div>
      </div>
    )
  },
)

ReciboVenta.displayName = "ReciboVenta"
