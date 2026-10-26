import { z } from "zod";
const url = z
  .string()
  .max(2000)
  .refine(
    (s) =>
      !s || (s.startsWith("/") && !s.startsWith("//")) || /^https:\/\//.test(s),
    "Use HTTPS or a local image path.",
  );
export const settingsSchema = z
  .object({
    contentVersion: z.number().int().optional(),
    businessName: z.string().min(1).max(150),
    phone: z.string().regex(/^[+\d\s().-]{7,30}$/),
    email: z.union([z.literal(""), z.string().email()]),
    address: z.string().max(300),
    hours: z.string().max(500),
    bio: z.string().max(10000),
    photo: url,
    logo: url,
    socialLinks: z.string().max(2000),
    serviceArea: z.string().max(300),
    consultationFree: z.boolean(),
    bookingUrl: z
      .string()
      .max(2000)
      .refine(
        (s) =>
          !s || /^https:\/\/([a-z0-9-]+\.)?(calendly\.com|cal\.com)\//i.test(s),
        "Use a Calendly or Cal.com HTTPS event URL.",
      ),
    meetingFormats: z.array(z.enum(["Phone", "Video", "In Person"])).max(3),
    appointmentDuration: z.number().int().min(5).max(240),
    bookingNotes: z.string().max(2000),
    newsletterUrl: z
      .string()
      .max(2000)
      .refine((s) => !s || s.startsWith("https://")),
    confirmedServices: z.array(z.string().max(100)).max(100),
    hiddenServices: z.array(z.string().max(100)).max(100),
    serviceOverrides: z.record(
      z.string(),
      z.object({
        description: z.string().max(5000).optional(),
        image: url.optional(),
      }),
    ),
    customServices: z
      .array(
        z.object({
          slug: z.string().regex(/^[a-z0-9-]+$/),
          title: z.string().max(150),
          description: z.string().max(5000),
        }),
      )
      .max(50),
    testimonials: z
      .array(
        z.object({
          name: z.string().max(150),
          text: z.string().max(3000),
          permission: z.boolean(),
          rating: z.number().min(1).max(5).optional(),
          businessType: z.string().max(150).optional(),
        }),
      )
      .max(100),
    prices: z.record(z.string(), z.string().max(300)),
    articles: z
      .array(
        z.object({
          slug: z.string().regex(/^[a-z0-9-]+$/),
          title: z.string().min(1).max(200),
          body: z.string().max(50000),
          category: z.string().max(100),
          image: url,
          published: z.boolean(),
          reviewedAt: z
            .string()
            .refine((s) => !s || /^\d{4}-\d{2}-\d{2}$/.test(s)),
        }),
      )
      .max(200),
    calculatorDisclaimer: z.string().max(3000),
    customFaqs: z
      .array(
        z.object({
          question: z.string().min(1).max(500),
          answer: z.string().min(1).max(5000),
        }),
      )
      .max(100),
    retentionDays: z.number().int().min(1).max(3650),
  })
  .superRefine((s, ctx) => {
    if (s.articles.some((a) => a.published && !a.reviewedAt))
      ctx.addIssue({
        code: "custom",
        message: "Published articles require a factual review date.",
      });
    if (new Set(s.articles.map((a) => a.slug)).size !== s.articles.length)
      ctx.addIssue({
        code: "custom",
        message: "Article slugs must be unique.",
      });
  });
