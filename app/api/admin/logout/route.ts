import { NextResponse } from "next/server";
import { sameOrigin } from "@/lib/auth";
export async function POST(req: Request) {
  if (!sameOrigin(req))
    return NextResponse.json({ error: "Invalid origin" }, { status: 403 });
  const r = NextResponse.json({ ok: true });
  r.cookies.set("admin_session", "", { httpOnly: true, path: "/", maxAge: 0 });
  return r;
}
