import { settings } from "@/lib/settings";
import { NextResponse } from "next/server";
import { authenticated, sameOrigin } from "@/lib/auth";
import { db } from "@/lib/db";

import { settingsSchema } from "@/lib/settings-schema";
export async function POST(req: Request) {
  if (!sameOrigin(req) || !(await authenticated()))
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  try {
    const text = await req.text();
    if (text.length > 2000000)
      return NextResponse.json({ error: "Payload too large" }, { status: 413 });
    const body = JSON.parse(text);
    if (body.action === "save") {
      const parsed = settingsSchema.safeParse(body.settings);
      if (!parsed.success)
        return NextResponse.json(
          {
            error: parsed.error.issues
              .map((i) => i.path.join(".") + ": " + i.message)
              .join("; "),
          },
          { status: 400 },
        );
      await db.content.upsert({
        where: { id: "settings" },
        create: { id: "settings", data: parsed.data },
        update: { data: parsed.data },
      });
    } else if (body.action === "address") {
      if (typeof body.id !== "string") throw Error();
      await db.inquiry.update({
        where: { id: body.id },
        data: { addressed: true },
      });
    } else if (body.action === "delete") {
      if (typeof body.id !== "string") throw Error();
      await db.inquiry.delete({ where: { id: body.id } });
    } else if (body.action === "purge") {
      const s = await settings();
      await db.inquiry.deleteMany({
        where: {
          createdAt: { lt: new Date(Date.now() - s.retentionDays * 86400000) },
        },
      });
      await db.rateLimit.deleteMany({
        where: { expiresAt: { lt: new Date() } },
      });
    } else
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { error: "Could not save. Check database availability and input." },
      { status: 400 },
    );
  }
}
