import { NextResponse } from "next/server";
import { issueSession, validPassword, sameOrigin, rateLimit } from "@/lib/auth";
import { z } from "zod";
export async function POST(req: Request) {
  if (!sameOrigin(req))
    return NextResponse.json({ error: "Invalid origin" }, { status: 403 });
  try {
    if (
      !process.env.ADMIN_EMAIL ||
      !process.env.ADMIN_PASSWORD_HASH ||
      !process.env.SESSION_SECRET
    )
      return NextResponse.json(
        { error: "Administrator credentials are not configured." },
        { status: 503 },
      );
    if (!(await rateLimit("admin-login", 15, 900000)))
      return NextResponse.json(
        { error: "Too many attempts. Try later." },
        { status: 429 },
      );
    const parsed = z
      .object({
        email: z.string().email().max(254),
        password: z.string().min(1).max(256),
      })
      .safeParse(await req.json());
    if (
      !parsed.success ||
      parsed.data.email.toLowerCase() !==
        process.env.ADMIN_EMAIL.toLowerCase() ||
      !validPassword(parsed.data.password)
    )
      return NextResponse.json(
        { error: "Invalid email or password." },
        { status: 401 },
      );
    const res = NextResponse.json({ ok: true });
    res.cookies.set("admin_session", await issueSession(), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 14400,
      path: "/",
    });
    return res;
  } catch {
    return NextResponse.json(
      { error: "Authentication storage is unavailable." },
      { status: 503 },
    );
  }
}
