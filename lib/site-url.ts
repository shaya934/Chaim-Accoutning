/** Use explicit canonical configuration or Vercel's trusted deployment metadata. */
export function siteUrl() {
  if (process.env.NEXT_PUBLIC_SITE_URL)
    return new URL(process.env.NEXT_PUBLIC_SITE_URL).origin;
  const host =
    process.env.VERCEL_PROJECT_PRODUCTION_URL || process.env.VERCEL_URL;
  return host ? new URL(`https://${host}`).origin : "http://localhost:3000";
}
export function trustedOrigins() {
  const origins = [siteUrl()];
  if (process.env.VERCEL_URL)
    origins.push(new URL(`https://${process.env.VERCEL_URL}`).origin);
  return origins;
}
