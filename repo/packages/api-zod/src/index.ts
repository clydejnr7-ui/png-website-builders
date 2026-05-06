import { z } from "zod";

// ─── Auth / Profile ─────────────────────────────────────────────────────────

export const GetMeResponse = z.object({
  id: z.string(),
  email: z.string().email(),
  freeGenerationsUsed: z.number().int(),
  purchasedCredits: z.number().int(),
  creditsRemaining: z.number().int(),
  createdAt: z.coerce.date(),
});
export type GetMeResponse = z.infer<typeof GetMeResponse>;

export const UpdateProfileBody = z.object({
  email: z.string().email().optional(),
});
export type UpdateProfileBody = z.infer<typeof UpdateProfileBody>;

export const UpdateProfileResponse = GetMeResponse;
export type UpdateProfileResponse = z.infer<typeof UpdateProfileResponse>;

// ─── Credits ────────────────────────────────────────────────────────────────

export const GetCreditsResponse = z.object({
  freeGenerationsUsed: z.number().int(),
  freeGenerationsTotal: z.number().int(),
  purchasedCredits: z.number().int(),
  creditsRemaining: z.number().int(),
});
export type GetCreditsResponse = z.infer<typeof GetCreditsResponse>;

export const TransactionSchema = z.object({
  id: z.number().int(),
  paymentId: z.string(),
  amountUsd: z.number().nullable(),
  creditsPurchased: z.number().int(),
  status: z.string(),
  createdAt: z.coerce.date(),
});
export type TransactionSchema = z.infer<typeof TransactionSchema>;

export const ListTransactionsResponse = z.array(TransactionSchema);
export type ListTransactionsResponse = z.infer<typeof ListTransactionsResponse>;

export const CreatePaymentBody = z.object({
  credits: z.number().int().positive(),
  priceUsd: z.number().positive(),
});
export type CreatePaymentBody = z.infer<typeof CreatePaymentBody>;

export const CreatePaymentResponse = z.object({
  invoiceUrl: z.string().url(),
  paymentId: z.string(),
});
export type CreatePaymentResponse = z.infer<typeof CreatePaymentResponse>;

// ─── Sites ──────────────────────────────────────────────────────────────────

export const SiteSchema = z.object({
  id: z.number().int(),
  userId: z.string(),
  prompt: z.string(),
  style: z.string().nullable(),
  generatedHtml: z.string(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});
export type SiteSchema = z.infer<typeof SiteSchema>;

export const ListSitesResponse = z.array(SiteSchema);
export type ListSitesResponse = z.infer<typeof ListSitesResponse>;

export const GetRecentSitesResponse = z.array(SiteSchema);
export type GetRecentSitesResponse = z.infer<typeof GetRecentSitesResponse>;

export const CreateSiteBody = z.object({
  prompt: z.string().min(1),
  style: z.string().optional(),
  generatedHtml: z.string().min(1),
});
export type CreateSiteBody = z.infer<typeof CreateSiteBody>;

export const GetSiteParams = z.object({
  id: z.number().int(),
});
export type GetSiteParams = z.infer<typeof GetSiteParams>;

export const GetSiteResponse = SiteSchema;
export type GetSiteResponse = z.infer<typeof GetSiteResponse>;

export const DeleteSiteParams = z.object({
  id: z.number().int(),
});
export type DeleteSiteParams = z.infer<typeof DeleteSiteParams>;

export const GenerateSiteBody = z.object({
  prompt: z.string().min(10, "Please describe your website in more detail"),
  style: z
    .enum(["modern", "minimal", "bold", "corporate", "playful"])
    .optional(),
});
export type GenerateSiteBody = z.infer<typeof GenerateSiteBody>;

export const GenerateSiteResponse = z.object({
  html: z.string(),
  siteId: z.number().int(),
  creditsRemaining: z.number().int(),
});
export type GenerateSiteResponse = z.infer<typeof GenerateSiteResponse>;

// ─── Dashboard ──────────────────────────────────────────────────────────────

export const GetDashboardStatsResponse = z.object({
  totalSites: z.number().int(),
  creditsRemaining: z.number().int(),
  sitesThisMonth: z.number().int(),
  totalCreditsUsed: z.number().int(),
});
export type GetDashboardStatsResponse = z.infer<typeof GetDashboardStatsResponse>;
