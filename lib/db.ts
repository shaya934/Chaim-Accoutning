import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import { eq, lt, desc, sql } from "drizzle-orm";
import { randomUUID } from "node:crypto";
import { contentTable, inquiryTable, rateTable } from "./schema";
const shared = globalThis as unknown as { accountingPool?: Pool };
const pool =
  shared.accountingPool ??
  new Pool({
    connectionString:
      process.env.DATABASE_URL || "postgresql://localhost/chaim",
    max: 5,
    connectionTimeoutMillis: 3000,
  });
if (process.env.NODE_ENV !== "production") shared.accountingPool = pool;
const orm = drizzle(pool);
export const configured = () => Boolean(process.env.DATABASE_URL);
type InquiryInput = {
  name: string;
  email: string;
  phone: string;
  service: string;
  message: string;
};
// Small typed repository layer keeps persistence separate from route handlers.
export const db = {
  content: {
    async findUnique({ where }: { where: { id: string } }) {
      return (
        (
          await orm
            .select()
            .from(contentTable)
            .where(eq(contentTable.id, where.id))
        )[0] ?? null
      );
    },
    async create({ data }: { data: { id: string; data: unknown } }) {
      return (await orm.insert(contentTable).values(data).returning())[0];
    },
    async upsert({
      where,
      create,
      update,
    }: {
      where: { id: string };
      create: { id: string; data: unknown };
      update: { data: unknown };
    }) {
      return (
        await orm
          .insert(contentTable)
          .values(create)
          .onConflictDoUpdate({
            target: contentTable.id,
            set: { data: update.data, updatedAt: new Date() },
          })
          .returning()
      )[0];
    },
  },
  inquiry: {
    async create({ data }: { data: InquiryInput }) {
      return (
        await orm
          .insert(inquiryTable)
          .values({ ...data, id: randomUUID() })
          .returning()
      )[0];
    },
    async findMany({
      take,
    }: {
      orderBy?: { createdAt: string };
      take: number;
    }) {
      return orm
        .select()
        .from(inquiryTable)
        .orderBy(desc(inquiryTable.createdAt))
        .limit(take);
    },
    async update({
      where,
      data,
    }: {
      where: { id: string };
      data: { addressed: boolean };
    }) {
      return orm
        .update(inquiryTable)
        .set(data)
        .where(eq(inquiryTable.id, where.id));
    },
    async delete({ where }: { where: { id: string } }) {
      return orm.delete(inquiryTable).where(eq(inquiryTable.id, where.id));
    },
    async deleteMany({ where }: { where: { createdAt: { lt: Date } } }) {
      return orm
        .delete(inquiryTable)
        .where(lt(inquiryTable.createdAt, where.createdAt.lt));
    },
  },
  rateLimit: {
    async upsert({
      where,
      create,
    }: {
      where: { key: string };
      create: { key: string; expiresAt: Date };
      update: { count: { increment: number } };
    }) {
      return (
        await orm
          .insert(rateTable)
          .values(create)
          .onConflictDoUpdate({
            target: rateTable.key,
            set: { count: sql`${rateTable.count} + 1` },
          })
          .returning()
      )[0];
    },
    async deleteMany({ where }: { where: { expiresAt: { lt: Date } } }) {
      return orm
        .delete(rateTable)
        .where(lt(rateTable.expiresAt, where.expiresAt.lt));
    },
  },
};
