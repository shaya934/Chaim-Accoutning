import { db, configured } from "./db";
import { defaults, type Settings } from "./content";
export function mergeSettings(saved: Partial<Settings> | null): Settings {
  if (!saved) return defaults;
  const savedArticles = saved.articles ?? [];
  const articles =
    saved.contentVersion === 2
      ? savedArticles
      : [
          ...defaults.articles.filter(
            (a) => !savedArticles.some((s) => s.slug === a.slug),
          ),
          ...savedArticles,
        ];
  return { ...defaults, ...saved, articles, contentVersion: 2 };
}
export async function settings(): Promise<Settings> {
  if (!configured()) return defaults;
  try {
    const row = await db.content.findUnique({ where: { id: "settings" } });
    return mergeSettings(row ? (row.data as Partial<Settings>) : null);
  } catch {
    return defaults;
  }
}
