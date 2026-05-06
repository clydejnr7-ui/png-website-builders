import { useState } from "react";
import { useGenerateSite } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Wand2, Download, ExternalLink, Loader2, Sparkles } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

const STYLES = [
  { value: "modern", label: "Modern" },
  { value: "minimal", label: "Minimal" },
  { value: "bold", label: "Bold" },
  { value: "corporate", label: "Corporate" },
  { value: "playful", label: "Playful" },
] as const;

const EXAMPLE_PROMPTS = [
  "A local coffee shop called Highlands Brew in Port Moresby with cosy vibes, menu, and contact details",
  "A plumbing services company that does residential and commercial repairs, with emergency call-out",
  "A photography studio specialising in weddings and corporate events in Papua New Guinea",
];

export function CreatePage() {
  const { toast } = useToast();
  const [prompt, setPrompt] = useState("");
  const [style, setStyle] = useState<string | undefined>(undefined);
  const [generatedHtml, setGeneratedHtml] = useState<string | null>(null);

  const generate = useGenerateSite();

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast({ title: "Please describe your website", variant: "destructive" });
      return;
    }
    try {
      const result = await generate.mutateAsync({ prompt, style: style as any });
      setGeneratedHtml(result.html);
      toast({ title: "Website generated!", description: `${result.creditsRemaining} credits remaining.` });
    } catch (err: any) {
      toast({ title: "Generation failed", description: err.message, variant: "destructive" });
    }
  };

  const handleDownload = () => {
    if (!generatedHtml) return;
    const blob = new Blob([generatedHtml], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "website.html";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handlePreview = () => {
    if (!generatedHtml) return;
    const blob = new Blob([generatedHtml], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    window.open(url, "_blank");
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-2">Create Website</h1>
        <p className="text-muted-foreground">Describe your business and our AI will build a professional website instantly.</p>
      </div>

      <Card className="bg-white border-border shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            Describe your website
          </CardTitle>
          <CardDescription>Be as specific as possible — include your business name, what you do, your location, and any key info.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="prompt">Website description</Label>
            <Textarea
              id="prompt"
              placeholder="e.g. A local coffee shop called Highlands Brew in Port Moresby..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={5}
              className="resize-none"
            />
          </div>

          {/* Example prompts */}
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Try an example</p>
            <div className="flex flex-col gap-2">
              {EXAMPLE_PROMPTS.map((p) => (
                <button
                  key={p}
                  onClick={() => setPrompt(p)}
                  className="text-left text-sm text-muted-foreground hover:text-primary px-3 py-2 rounded-lg hover:bg-primary/5 border border-border hover:border-primary/30 transition-all"
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Style (optional)</Label>
            <Select value={style} onValueChange={setStyle}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Choose a style" />
              </SelectTrigger>
              <SelectContent>
                {STYLES.map((s) => (
                  <SelectItem key={s.value} value={s.value}>
                    {s.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button
            onClick={handleGenerate}
            disabled={generate.isPending}
            className="w-full sm:w-auto"
            size="lg"
          >
            {generate.isPending ? (
              <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Generating…</>
            ) : (
              <><Wand2 className="w-4 h-4 mr-2" /> Generate Website</>
            )}
          </Button>
        </CardContent>
      </Card>

      {generatedHtml && (
        <Card className="bg-white border-border shadow-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Your Generated Website</CardTitle>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={handlePreview}>
                  <ExternalLink className="w-4 h-4 mr-1.5" /> Preview
                </Button>
                <Button size="sm" onClick={handleDownload}>
                  <Download className="w-4 h-4 mr-1.5" /> Download HTML
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0 overflow-hidden rounded-b-lg">
            <iframe
              srcDoc={generatedHtml}
              className="w-full border-0"
              style={{ height: "600px" }}
              sandbox="allow-scripts allow-same-origin"
              title="Generated website preview"
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
