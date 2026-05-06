import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, profilesTable } from "@workspace/db";
import { GetMeResponse, UpdateProfileBody, UpdateProfileResponse } from "@workspace/api-zod";
import { requireAuth, type AuthenticatedRequest } from "../middlewares/supabaseAuth";
import { sendWelcomeEmail } from "../lib/email";

const router: IRouter = Router();

async function ensureProfile(userId: string, email: string) {
  const existing = await db
    .select()
    .from(profilesTable)
    .where(eq(profilesTable.id, userId))
    .limit(1);

  if (existing.length === 0) {
    const [profile] = await db
      .insert(profilesTable)
      .values({ id: userId, email })
      .returning();
    sendWelcomeEmail(email).catch(() => {});
    return profile;
  }
  return existing[0];
}

router.get("/auth/me", requireAuth, async (req, res): Promise<void> => {
  const { userId, userEmail } = req as AuthenticatedRequest;

  const profile = await ensureProfile(userId, userEmail);

  const FREE_GENERATIONS_TOTAL = 5;
  const creditsRemaining =
    Math.max(0, FREE_GENERATIONS_TOTAL - profile.freeGenerationsUsed) +
    profile.purchasedCredits;

  res.json(
    GetMeResponse.parse({
      id: profile.id,
      email: profile.email,
      freeGenerationsUsed: profile.freeGenerationsUsed,
      purchasedCredits: profile.purchasedCredits,
      creditsRemaining,
      createdAt: profile.createdAt,
    }),
  );
});

router.patch("/auth/profile", requireAuth, async (req, res): Promise<void> => {
  const { userId } = req as AuthenticatedRequest;

  const parsed = UpdateProfileBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [profile] = await db
    .update(profilesTable)
    .set({ email: parsed.data.email ?? undefined })
    .where(eq(profilesTable.id, userId))
    .returning();

  if (!profile) {
    res.status(404).json({ error: "Profile not found" });
    return;
  }

  const FREE_GENERATIONS_TOTAL = 5;
  const creditsRemaining =
    Math.max(0, FREE_GENERATIONS_TOTAL - profile.freeGenerationsUsed) +
    profile.purchasedCredits;

  res.json(
    UpdateProfileResponse.parse({
      id: profile.id,
      email: profile.email,
      freeGenerationsUsed: profile.freeGenerationsUsed,
      purchasedCredits: profile.purchasedCredits,
      creditsRemaining,
      createdAt: profile.createdAt,
    }),
  );
});

export default router;
