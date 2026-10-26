import { db, configured } from "@/lib/db";
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  if (!configured() || !/^image-[a-f0-9-]{36}$/.test(id))
    return new Response("Not found", { status: 404 });
  try {
    const row = await db.content.findUnique({ where: { id } });
    if (!row) return new Response("Not found", { status: 404 });
    const image = row.data as { mime: string; base64: string };
    return new Response(Buffer.from(image.base64, "base64"), {
      headers: {
        "Content-Type": image.mime,
        "X-Content-Type-Options": "nosniff",
        "Cache-Control": "public, max-age=86400",
      },
    });
  } catch {
    return new Response("Unavailable", { status: 503 });
  }
}
