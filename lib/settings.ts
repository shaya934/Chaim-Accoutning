import { db, configured } from "./db";
import { defaults, type Settings } from "./content";
export async function settings(): Promise<Settings> {
  if (!configured()) return defaults;
  try {
    const row = await db.content.findUnique({ where: { id: "settings" } });
    return { ...defaults, ...((row?.data as object) ?? {}) };
  } catch {
    return defaults;
  }
}
