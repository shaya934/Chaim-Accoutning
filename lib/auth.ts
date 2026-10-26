import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { scryptSync, timingSafeEqual, randomBytes } from "node:crypto";
import { db, configured } from "./db";
import { trustedOrigins } from "./site-url";
export function secret() {
  const value = process.env.SESSION_SECRET;
  if (!value || value.length < 32)
    throw new Error("SESSION_SECRET is not configured");
  return new TextEncoder().encode(value);
}
export async function authenticated() {
  try {
    const token = (await cookies()).get("admin_session")?.value;
    if (!token) return false;
    const { payload } = await jwtVerify(token, secret(), {
      issuer: "chaim-accounting",
      audience: "admin",
      algorithms: ["HS256"],
    });
    return payload.role === "admin";
  } catch {
    return false;
  }
}
export async function issueSession() {
  return new SignJWT({ role: "admin", nonce: randomBytes(16).toString("hex") })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("4h")
    .setIssuer("chaim-accounting")
    .setAudience("admin")
    .sign(secret());
}
export function validPassword(password: string) {
  try {
    const [salt, hash] = process.env.ADMIN_PASSWORD_HASH!.split(":");
    if (!salt || !hash || hash.length !== 128) return false;
    return timingSafeEqual(
      Buffer.from(hash, "hex"),
      scryptSync(password, salt, 64),
    );
  } catch {
    return false;
  }
}
export function sameOrigin(req: Request) {
  const origin = req.headers.get("origin");
  return Boolean(origin && trustedOrigins().includes(origin));
}
export async function rateLimit(key: string, max: number, windowMs: number) {
  if (!configured()) return false;
  const now = new Date();
  const bucket = Math.floor(now.getTime() / windowMs);
  const row = await db.rateLimit.upsert({
    where: { key: `${key}:${bucket}` },
    create: {
      key: `${key}:${bucket}`,
      expiresAt: new Date(now.getTime() + windowMs * 2),
    },
    update: { count: { increment: 1 } },
  });
  return row.count <= max;
}
