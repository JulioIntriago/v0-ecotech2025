"use server"

import { revalidatePath } from "next/cache"

interface ProductoRecibo {
  id: string
  nombre: string
  precio: number
  cantidad: number
  subtotal: number
}

interface DatosVenta {
  numeroVenta: string
  fecha: Date
  cliente: string | null
  metodoPago: string
  productos: ProductoRecibo[]
  subtotal: number
  impuesto: number
  total: number
}

interface EnviarReciboEmailParams {
  email: string
  datosVenta: DatosVenta
}

export async function enviarReciboEmail({ email, datosVenta }: EnviarReciboEmailParams) {
  // Simulamos un retraso para imitar el envío del correo
  await new Promise((resolve) => setTimeout(resolve, 1500))

  // En un entorno real, aquí se utilizaría una biblioteca como nodemailer,
  // SendGrid, Amazon SES, etc. para enviar el correo electrónico

  console.log(`Enviando recibo #${datosVenta.numeroVenta} a ${email}`)
  console.log("Datos del recibo:", datosVenta)

  // Simulamos éxito (en un entorno real, verificaríamos la respuesta del servicio de correo)
  const exito = Math.random() > 0.1 // 90% de probabilidad de éxito

  if (!exito) {
    throw new Error("Error al enviar el correo electrónico")
  }

  // Revalidar la ruta para actualizar los datos si es necesario
  revalidatePath("/dashboard/ventas")

  return { success: true }
}
