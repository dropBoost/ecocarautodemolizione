import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

export const runtime = "nodejs";

function badRequest(message) {
  return NextResponse.json({ ok: false, message }, { status: 400 });
}

function escapeHtml(str = "") {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export async function POST(req) {
  try {
    const body = await req.json();

    // ✅ Honeypot anti-spam: questo campo deve restare vuoto
    if (body.company && String(body.company).trim().length > 0) {
      return NextResponse.json({ ok: true }, { status: 200 });
    }

    const name = String(body.name ?? "").trim();
    const phone = String(body.phone ?? "").trim();
    const email = String(body.email ?? "").trim();
    const message = String(body.message ?? "").trim();
    const source = String(body.source ?? "landing").trim();

    if (!name) return badRequest("Nome mancante.");
    if (!phone) return badRequest("Telefono mancante.");
    if (!email) return badRequest("Email mancante.");
    if (!message) return badRequest("Messaggio mancante.");

    const host = process.env.SMTP_HOST;
    const port = Number(process.env.SMTP_PORT || 465);
    const secure = String(process.env.SMTP_SECURE || "true") === "true";
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;

    const to = process.env.CONTACT_TO_EMAIL || "ecocar.cavagnoli@gmail.com";
    const from = process.env.CONTACT_FROM_EMAIL || user;
    const siteName = process.env.SITE_NAME || "Sito";

    if (!host || !user || !pass || !from) {
      console.error("SMTP env missing");
      return NextResponse.json(
        { ok: false, message: "SMTP non configurato sul server." },
        { status: 500 }
      );
    }

    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      req.headers.get("x-real-ip") ??
      "n/d";

    const ua = req.headers.get("user-agent") ?? "n/d";

    const transporter = nodemailer.createTransport({
      host,
      port,
      secure, // 465 true, 587 false
      auth: { user, pass },
    });

    // (facoltativo) verifica connessione SMTP
    await transporter.verify();

    const subject = `[${siteName}] Nuova richiesta contatto - ${name}`;

    const text = [
      `Nuova richiesta dal sito: ${siteName}`,
      ``,
      `Nome: ${name}`,
      `Telefono: ${phone}`,
      `Email: ${email}`,
      `Sorgente: ${source}`,
      ``,
      `Messaggio:`,
      message,
      ``,
      `IP: ${ip}`,
      `UA: ${ua}`,
    ].join("\n");

    const html = `
      <div style="font-family:Arial,sans-serif;line-height:1.5">
        <h2 style="margin:0 0 12px">Nuova richiesta contatto</h2>
        <p style="margin:0 0 12px;color:#444">Sito: <b>${escapeHtml(siteName)}</b></p>

        <table style="border-collapse:collapse;width:100%;max-width:680px">
          <tr><td style="padding:8px;border:1px solid #eee;width:180px"><b>Nome</b></td><td style="padding:8px;border:1px solid #eee">${escapeHtml(name)}</td></tr>
          <tr><td style="padding:8px;border:1px solid #eee"><b>Telefono</b></td><td style="padding:8px;border:1px solid #eee">${escapeHtml(phone)}</td></tr>
          <tr><td style="padding:8px;border:1px solid #eee"><b>Email</b></td><td style="padding:8px;border:1px solid #eee">${escapeHtml(email)}</td></tr>
          <tr><td style="padding:8px;border:1px solid #eee"><b>Sorgente</b></td><td style="padding:8px;border:1px solid #eee">${escapeHtml(source)}</td></tr>
        </table>

        <h3 style="margin:16px 0 8px">Messaggio</h3>
        <div style="padding:12px;border:1px solid #eee;border-radius:8px;background:#fafafa;white-space:pre-wrap">${escapeHtml(message)}</div>

        <p style="margin:16px 0 0;color:#777;font-size:12px">
          IP: ${escapeHtml(ip)}<br/>
          User-Agent: ${escapeHtml(ua)}
        </p>
      </div>
    `;

    await transporter.sendMail({
      from: `${siteName} <${from}>`,
      to,
      subject,
      text,
      html,
      replyTo: email, // così rispondi direttamente al cliente
    });

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (err) {
    console.error("CONTACT ERROR:", err);
    return NextResponse.json(
      { ok: false, message: "Errore durante l'invio email." },
      { status: 500 }
    );
  }
}
