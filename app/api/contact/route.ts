import { NextResponse } from "next/server";
import { z } from "zod";
import { db, configured } from "@/lib/db";
import { rateLimit, sameOrigin } from "@/lib/auth";
const schema = z.object({
  name: z.string().trim().min(1).max(100),
  email: z.string().email().max(254),
  phone: z.string().max(30).default(""),
  service: z.string().max(100),
  message: z.string().trim().min(10).max(3000),
  website: z.string().max(0).optional(),
});
export async function POST(req: Request) {
  if (!sameOrigin(req))
    return NextResponse.json(
      { message: "Invalid request origin." },
      { status: 403 },
    );
  if (!configured())
    return NextResponse.json(
      { message: "Online messages are not configured. Please call Chaim." },
      { status: 503 },
    );
  try {
    if (Number(req.headers.get("content-length") || 0) > 16000)
      return NextResponse.json(
        { message: "Message too large." },
        { status: 413 },
      );
    if (!(await rateLimit("contact", 30, 3600000)))
      return NextResponse.json(
        { message: "Message limit reached. Please call instead." },
        { status: 429 },
      );
    const text = await req.text();
    if (text.length > 16000)
      return NextResponse.json(
        { message: "Message too large." },
        { status: 413 },
      );
    const parsed = schema.safeParse(JSON.parse(text));
    if (!parsed.success)
      return NextResponse.json(
        {
          message:
            "Please check your details. Message must be 10–3,000 characters.",
        },
        { status: 400 },
      );
    const { website, ...data } = parsed.data;
    const inquiry = await db.inquiry.create({ data });
    if (
      process.env.RESEND_API_KEY &&
      process.env.NOTIFICATION_FROM &&
      process.env.NOTIFICATION_TO
    ) {
      try {
        await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: process.env.NOTIFICATION_FROM,
            to: process.env.NOTIFICATION_TO,
            subject: "New website inquiry",
            text: `A new inquiry (${inquiry.id}) is available in the secure admin dashboard. Sign in to review it.`,
          }),
          signal: AbortSignal.timeout(8000),
        });
      } catch {
        /* Inquiry remains safely stored; email is optional. */
      }
    }
    return NextResponse.json(
      {
        message:
          "Your message has been received. Thank you for getting in touch.",
      },
      { status: 201 },
    );
  } catch {
    return NextResponse.json(
      { message: "We couldn’t save your message. Please call Chaim instead." },
      { status: 503 },
    );
  }
}
