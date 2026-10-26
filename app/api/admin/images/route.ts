import { NextResponse } from "next/server";
import { authenticated, sameOrigin } from "@/lib/auth";
import { db } from "@/lib/db";
import { randomUUID } from "node:crypto";
export async function POST(req: Request) {
  if (!sameOrigin(req) || !(await authenticated()))
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  try {
    if (Number(req.headers.get("content-length") || 0) > 3000000) throw Error();
    const data = await req.formData();
    const file = data.get("image");
    if (!(file instanceof File) || file.size > 2000000) throw Error();
    const bytes = Buffer.from(await file.arrayBuffer());
    const valid =
      (file.type === "image/png" &&
        bytes
          .subarray(0, 8)
          .equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))) ||
      (file.type === "image/jpeg" &&
        bytes[0] === 255 &&
        bytes[1] === 216 &&
        bytes[2] === 255) ||
      (file.type === "image/webp" &&
        bytes.toString("ascii", 0, 4) === "RIFF" &&
        bytes.toString("ascii", 8, 12) === "WEBP");
    if (!valid) throw Error();
    const id = "image-" + randomUUID();
    await db.content.create({
      data: { id, data: { mime: file.type, base64: bytes.toString("base64") } },
    });
    return NextResponse.json({ url: "/media/" + id });
  } catch {
    return NextResponse.json(
      { error: "Upload a valid JPEG, PNG, or WebP image under 2 MB." },
      { status: 400 },
    );
  }
}
