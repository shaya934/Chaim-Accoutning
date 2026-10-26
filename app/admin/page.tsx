import { settings } from "@/lib/settings";
import { authenticated } from "@/lib/auth";

import { db, configured } from "@/lib/db";
import Admin from "@/components/admin";
import Login from "@/components/login";
export const dynamic = "force-dynamic";
export const metadata = {
  title: "Administration",
  robots: { index: false, follow: false },
};
export default async function AdminPage() {
  if (!(await authenticated()))
    return (
      <Login
        configured={
          configured() &&
          Boolean(
            process.env.ADMIN_EMAIL &&
            process.env.ADMIN_PASSWORD_HASH &&
            process.env.SESSION_SECRET,
          )
        }
      />
    );
  const s = await settings();
  const inquiries = await db.inquiry.findMany({
    orderBy: { createdAt: "desc" },
    take: 200,
  });
  return (
    <Admin
      initial={s}
      inquiries={inquiries.map((i) => ({
        ...i,
        createdAt: i.createdAt.toISOString(),
      }))}
    />
  );
}
