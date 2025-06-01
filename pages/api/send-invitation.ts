import type { NextApiRequest, NextApiResponse } from "next";
import nodemailer from "nodemailer";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Método no permitido" });

  const { email, invitationUrl, nombre } = req.body;

  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
    });

    await transporter.sendMail({
      from: '"EcoTech" <no-reply@ecotech.com>',
      to: email,
      subject: "Invitación a EcoTech",
      html: `
        <h2>Hola, ${nombre}</h2>
        <p>Únete a EcoTech: <a href="${invitationUrl}" style="display: inline-block; padding: 10px 20px; background-color: #2563eb; color: white; text-decoration: none;">Registrar</a></p>
      `,
    });

    res.status(200).json({ message: "Correo enviado" });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}