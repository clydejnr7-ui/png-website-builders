import { useGetCredits, useListTransactions, useCreatePayment } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, CreditCard, Zap, CheckCircle2, Clock } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useToast } from "@/components/ui/use-toast";

const CREDIT_PACKS = [
  { credits: 10, priceUsd: 10, label: "Starter Pack", popular: false },
  { credits: 25, priceUsd: 20, label: "Builder Pack", popular: true },
  { credits: 50, priceUsd: 35, label: "Pro Pack", popular: false },
] as const;

export function CreditsPage() {
  const { toast } = useToast();
  const { data: credits, isLoading: isCreditsLoading } = useGetCredits();
  const { data: transactions, isLoading: isTransactionsLoading } = useListTransactions();
  const createPayment = useCreatePayment();

  const handlePurchase = async (pack: (typeof CREDIT_PACKS)[number]) => {
    try {
      const result = await createPayment.mutateAsync({
        credits: pack.credits,
        priceUsd: pack.priceUsd,
      });
      window.open(result.invoiceUrl, "_blank");
      toast({
        title: "Payment started",
        description: "Complete your payment in the tab that just opened. Credits will be added automatically.",
      });
    } catch (err: any) {
      toast({ title: "Payment failed", description: err.message, variant: "destructive" });
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-2">Credits</h1>
        <p className="text-muted-foreground">Buy credits to generate more websites.</p>
      </div>

      {/* Balance */}
      <Card className="bg-primary text-primary-foreground border-0 shadow-lg shadow-blue-900/25">
        <CardContent className="pt-6 flex items-center justify-between">
          <div>
            <div className="text-sm font-medium opacity-80 mb-1">Current Balance</div>
            {isCreditsLoading ? (
              <Loader2 className="w-6 h-6 animate-spin" />
            ) : (
              <div className="text-5xl font-mono font-bold">
                {credits?.creditsRemaining ?? 0}
                <span className="text-lg font-sans font-normal opacity-70 ml-2">credits</span>
              </div>
            )}
          </div>
          <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center">
            <Zap className="w-8 h-8" />
          </div>
        </CardContent>
      </Card>

      {/* Packs */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Buy Credits</h2>
        <div className="grid sm:grid-cols-3 gap-4">
          {CREDIT_PACKS.map((pack) => (
            <Card
              key={pack.credits}
              className={`bg-white border-border shadow-sm relative ${pack.popular ? "border-2 border-primary" : ""}`}
            >
              {pack.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 bg-primary text-primary-foreground text-xs font-bold rounded-full">
                  BEST VALUE
                </div>
              )}
              <CardHeader className="pb-3">
                <CardTitle className="text-base">{pack.label}</CardTitle>
                <div className="text-3xl font-extrabold text-foreground">
                  ${pack.priceUsd}
                  <span className="text-sm font-normal text-muted-foreground"> USD</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex gap-2 items-center">
                    <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                    {pack.credits} website generations
                  </li>
                  <li className="flex gap-2 items-center">
                    <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                    Never expires
                  </li>
                  <li className="flex gap-2 items-center">
                    <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                    Full HTML download
                  </li>
                </ul>
                <Button
                  className="w-full"
                  variant={pack.popular ? "default" : "outline"}
                  onClick={() => handlePurchase(pack)}
                  disabled={createPayment.isPending}
                >
                  {createPayment.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : (
                    <CreditCard className="w-4 h-4 mr-2" />
                  )}
                  Buy {pack.credits} Credits
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
        <p className="text-xs text-muted-foreground mt-3">
          Payments processed securely via NowPayments. Supports crypto and local payment methods.
        </p>
      </div>

      {/* Transaction history */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Transaction History</h2>
        {isTransactionsLoading ? (
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        ) : !transactions?.length ? (
          <p className="text-muted-foreground text-sm">No transactions yet.</p>
        ) : (
          <div className="space-y-3">
            {transactions.map((tx) => (
              <Card key={tx.id} className="bg-white border-border shadow-sm">
                <CardContent className="flex items-center justify-between gap-4 py-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${tx.status === "completed" ? "bg-green-100" : "bg-yellow-100"}`}>
                      {tx.status === "completed" ? (
                        <CheckCircle2 className="w-4 h-4 text-green-600" />
                      ) : (
                        <Clock className="w-4 h-4 text-yellow-600" />
                      )}
                    </div>
                    <div>
                      <div className="font-medium text-sm">{tx.creditsPurchased} credits purchased</div>
                      <div className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(tx.createdAt), { addSuffix: true })}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    {tx.amountUsd != null && (
                      <div className="font-semibold">${tx.amountUsd.toFixed(2)}</div>
                    )}
                    <span className={`text-xs capitalize px-2 py-0.5 rounded-full font-medium ${
                      tx.status === "completed" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
                    }`}>
                      {tx.status}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
