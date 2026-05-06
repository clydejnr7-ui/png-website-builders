import { Router, type IRouter } from "express";
import { eq, desc, and, gte, sql } from "drizzle-orm";
import { db, sitesTable, profilesTable } from "@workspace/db";
import {
  ListSitesResponse,
  CreateSiteBody,
  GetSiteParams,
  GetSiteResponse,
  DeleteSiteParams,
  GenerateSiteBody,
  GenerateSiteResponse,
  GetDashboardStatsResponse,
  GetRecentSitesResponse,
} from "@workspace/api-zod";
import { openrouter } from "@workspace/integrations-openrouter-ai";
import { requireAuth, type AuthenticatedRequest } from "../middlewares/supabaseAuth";
import { logger } from "../lib/logger";

const router: IRouter = Router();
const FREE_GENERATIONS_TOTAL = 5;

async function getProfile(userId: string) {
  const [profile] = await db
    .select()
    .from(profilesTable)
    .where(eq(profilesTable.id, userId))
    .limit(1);
  return profile ?? null;
}

router.get("/dashboard/stats", requireAuth, async (req, res): Promise<void> => {
  const { userId } = req as AuthenticatedRequest;

  const profile = await getProfile(userId);
  const creditsRemaining = profile
    ? Math.max(0, FREE_GENERATIONS_TOTAL - profile.freeGenerationsUsed) + profile.purchasedCredits
    : 0;

  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const [totalResult] = await db
    .select({ count: sql<number>`count(*)` })
    .from(sitesTable)
    .where(eq(sitesTable.userId, userId));

  const [monthResult] = await db
    .select({ count: sql<number>`count(*)` })
    .from(sitesTable)
    .where(and(eq(sitesTable.userId, userId), gte(sitesTable.createdAt, startOfMonth)));

  const totalSites = Number(totalResult?.count ?? 0);
  const sitesThisMonth = Number(monthResult?.count ?? 0);

  res.json(
    GetDashboardStatsResponse.parse({
      totalSites,
      creditsRemaining,
      sitesThisMonth,
      totalCreditsUsed: profile?.freeGenerationsUsed ?? 0,
    }),
  );
});

router.get("/sites/recent", requireAuth, async (req, res): Promise<void> => {
  const { userId } = req as AuthenticatedRequest;

  const sites = await db
    .select()
    .from(sitesTable)
    .where(eq(sitesTable.userId, userId))
    .orderBy(desc(sitesTable.createdAt))
    .limit(5);

  res.json(GetRecentSitesResponse.parse(sites));
});

router.get("/sites", requireAuth, async (req, res): Promise<void> => {
  const { userId } = req as AuthenticatedRequest;

  const sites = await db
    .select()
    .from(sitesTable)
    .where(eq(sitesTable.userId, userId))
    .orderBy(desc(sitesTable.createdAt));

  res.json(ListSitesResponse.parse(sites));
});

router.post("/sites", requireAuth, async (req, res): Promise<void> => {
  const { userId } = req as AuthenticatedRequest;

  const parsed = CreateSiteBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [site] = await db
    .insert(sitesTable)
    .values({ ...parsed.data, userId })
    .returning();

  res.status(201).json(GetSiteResponse.parse(site));
});

router.post("/sites/generate", requireAuth, async (req, res): Promise<void> => {
  const { userId } = req as AuthenticatedRequest;

  const parsed = GenerateSiteBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const profile = await getProfile(userId);
  if (!profile) {
    res.status(404).json({ error: "Profile not found" });
    return;
  }

  const freeRemaining = Math.max(0, FREE_GENERATIONS_TOTAL - profile.freeGenerationsUsed);
  const totalCredits = freeRemaining + profile.purchasedCredits;

  if (totalCredits <= 0) {
    res.status(402).json({ error: "Insufficient credits. Please purchase more credits to continue." });
    return;
  }

  req.log.info({ userId, prompt: parsed.data.prompt.slice(0, 100) }, "Generating website");

  const completion = await openrouter.chat.completions.create({
    model: "deepseek/deepseek-v4-flash",
    max_tokens: 8192,
    messages: [
      {
        role: "system",
        content:
          "You are an expert frontend developer. Generate a complete, self-contained HTML/CSS/JS website based on the user's description. Include modern design, responsive layout, and clean code. Use CSS variables, flexbox/grid. Make it visually stunning with gradients, animations, and great typography. Output ONLY the raw HTML code starting with <!DOCTYPE html>, no markdown, no explanations, no code blocks.",
      },
      {
        role: "user",
        content: `Create a website for: ${parsed.data.prompt}${parsed.data.style ? `\nStyle: ${parsed.data.style}` : ""}`,
      },
    ],
  });

  const html = completion.choices[0]?.message?.content ?? "";
  if (!html) {
    res.status(500).json({ error: "Failed to generate website" });
    return;
  }

  if (freeRemaining > 0) {
    await db
      .update(profilesTable)
      .set({ freeGenerationsUsed: profile.freeGenerationsUsed + 1 })
      .where(eq(profilesTable.id, userId));
  } else {
    await db
      .update(profilesTable)
      .set({ purchasedCredits: profile.purchasedCredits - 1 })
      .where(eq(profilesTable.id, userId));
  }

  const [site] = await db
    .insert(sitesTable)
    .values({
      userId,
      prompt: parsed.data.prompt,
      style: parsed.data.style ?? null,
      generatedHtml: html,
    })
    .returning();

  const updatedProfile = await getProfile(userId);
  const newFreeRemaining = Math.max(
    0,
    FREE_GENERATIONS_TOTAL - (updatedProfile?.freeGenerationsUsed ?? 0),
  );
  const creditsRemaining = newFreeRemaining + (updatedProfile?.purchasedCredits ?? 0);

  res.json(
    GenerateSiteResponse.parse({
      html,
      siteId: site.id,
      creditsRemaining,
    }),
  );
});

router.get("/sites/:id", requireAuth, async (req, res): Promise<void> => {
  const { userId } = req as AuthenticatedRequest;

  const rawId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = GetSiteParams.safeParse({ id: parseInt(rawId, 10) });
  if (!params.success) {
    res.status(400).json({ error: "Invalid site ID" });
    return;
  }

  const [site] = await db
    .select()
    .from(sitesTable)
    .where(and(eq(sitesTable.id, params.data.id), eq(sitesTable.userId, userId)))
    .limit(1);

  if (!site) {
    res.status(404).json({ error: "Site not found" });
    return;
  }

  res.json(GetSiteResponse.parse(site));
});

router.delete("/sites/:id", requireAuth, async (req, res): Promise<void> => {
  const { userId } = req as AuthenticatedRequest;

  const rawId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = DeleteSiteParams.safeParse({ id: parseInt(rawId, 10) });
  if (!params.success) {
    res.status(400).json({ error: "Invalid site ID" });
    return;
  }

  const [site] = await db
    .delete(sitesTable)
    .where(and(eq(sitesTable.id, params.data.id), eq(sitesTable.userId, userId)))
    .returning();

  if (!site) {
    res.status(404).json({ error: "Site not found" });
    return;
  }

  res.sendStatus(204);
});

export default router;
