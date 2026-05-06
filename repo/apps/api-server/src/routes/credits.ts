import { Router, type IRouter } from "express";
import { eq, desc } from "drizzle-orm";
import { db, profilesTable, paymentsTable } from "@workspace/db";
import {
  GetCreditsResponse,
  ListTransactionsResponse,
  CreatePaymentBody,
  CreatePaymentResponse,
} from "@workspace/api-zod";
import { logger } from "../lib/logger";
import { requireAuth, type AuthenticatedRequest } from "../middlewares/supabaseAuth";
import { sendPaymentConfirmationEmail } from "../lib/email";
import crypto from "crypto";

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

router.get("/credits", requireAuth, async (req, res): Promise<void> => {
  const { userId } = req as AuthenticatedRequest;

  const profile = await getProfile(userId);
  if (!profile) {
    res.status(404).json({ error: "Profile not found" });
    return;
  }

  const creditsRemaining =
    Math.max(0, FREE_GENERATIONS_TOTAL - profile.freeGenerationsUsed) +
    profile.purchasedCredits;

  res.json(
    GetCreditsResponse.parse({
      freeGenerationsUsed: profile.freeGenerationsUsed,
      freeGenerationsTotal: FREE_GENERATIONS_TOTAL,
      purchasedCredits: profile.purchasedCredits,
      creditsRemaining,
    }),
  );
});

router.get("/credits/transactions", requireAuth, async (req, res): Promise<void> => {
  const { userId } = req as AuthenticatedRequest;

  const payments = await db
    .select()
    .from(paymentsTable)
    .where(eq(paymentsTable.userId, userId))
    .orderBy(desc(paymentsTable.createdAt));

  res.json(
    ListTransactionsResponse.parse(
      payments.map((p) => ({
        id: p.id,
        paymentId: p.paymentId,
        amountUsd: p.amountUsd ? parseFloat(p.amountUsd) : null,
        creditsPurchased: p.creditsPurchased,
        status: p.status,
        createdAt: p.createdAt,
      })),
    ),
  );
});

router.post("/credits/purchase", requireAuth, async (req, res): Promise<void> => {
  const { userId } = req as AuthenticatedRequest;

  const parsed = CreatePaymentBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { credits, priceUsd } = parsed.data;
  const nowPaymentsApiKey = process.env.NOWPAYMENTS_API_KEY;

  if (!nowPaymentsApiKey) {
    res.status(500).json({ error: "Payment system not configured" });
    return;
  }

  let invoiceUrl: string;
  let paymentId: string;

  try {
    const response = await fetch("https://api.nowpayments.io/v1/invoice", {
      method: "POST",
      headers: {
        "x-api-key": nowPaymentsApiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        price_amount: priceUsd,
        price_currency: "usd",
        order_id: `${userId}-${Date.now()}`,
        order_description: `${credits} PNG Website Builder credits`,
        ipn_callback_url: `${process.env.VITE_API_BASE_URL ?? ""}/api/credits/webhook`,
      }),
    });

    const data = (await response.json()) as { invoice_url?: string; id?: string; message?: string };
    if (!response.ok || !data.invoice_url) {
      req.log.error({ data }, "NowPayments invoice creation failed");
      res.status(500).json({ error: data.message ?? "Failed to create payment" });
      return;
    }

    invoiceUrl = data.invoice_url;
    paymentId = data.id ?? `pending-${Date.now()}`;
  } catch (err) {
    req.log.error({ err }, "NowPayments API call failed");
    res.status(500).json({ error: "Payment service unavailable" });
    return;
  }

  await db.insert(paymentsTable).values({
    userId,
    paymentId,
    amountUsd: String(priceUsd),
    creditsPurchased: credits,
    status: "pending",
  });

  res.json(CreatePaymentResponse.parse({ invoiceUrl, paymentId }));
});

router.post("/credits/webhook", async (req, res): Promise<void> => {
  const ipnSecret = process.env.NOWPAYMENTS_IPN_SECRET;

  if (ipnSecret) {
    const signature = req.headers["x-nowpayments-sig"] as string;
    const body = JSON.stringify(req.body);
    const expectedSig = crypto.createHmac("sha512", ipnSecret).update(body).digest("hex");
    if (signature !== expectedSig) {
      req.log.warn("NowPayments IPN signature mismatch");
      res.status(401).json({ error: "Invalid signature" });
      return;
    }
  }

  const { payment_id, payment_status, order_id } = req.body as {
    payment_id?: string;
    payment_status?: string;
    order_id?: string;
  };

  if (payment_status === "finished" || payment_status === "confirmed") {
    const paymentIdStr = String(payment_id ?? order_id ?? "");
    const [payment] = await db
      .select()
      .from(paymentsTable)
      .where(eq(paymentsTable.paymentId, paymentIdStr))
      .limit(1);

    if (payment && payment.status !== "completed") {
      await db
        .update(paymentsTable)
        .set({ status: "completed", updatedAt: new Date() })
        .where(eq(paymentsTable.id, payment.id));

      const [profile] = await db
        .select()
        .from(profilesTable)
        .where(eq(profilesTable.id, payment.userId))
        .limit(1);

      if (profile) {
        await db
          .update(profilesTable)
          .set({ purchasedCredits: profile.purchasedCredits + payment.creditsPurchased })
          .where(eq(profilesTable.id, payment.userId));

        sendPaymentConfirmationEmail(
          profile.email,
          payment.creditsPurchased,
          payment.amountUsd ? parseFloat(payment.amountUsd) : 0,
        ).catch(() => {});
      }

      logger.info({ paymentId: payment.id, userId: payment.userId }, "Payment completed, credits added");
    }
  }

  res.json({ status: "ok" });
});

export default router;
