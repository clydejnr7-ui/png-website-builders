import { useState } from "react";
import { useListSites, useDeleteSite, useGetSite } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Loader2, Trash2, Download, ExternalLink, Globe, LayoutGrid } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useToast } from "@/components/ui/use-toast";
import { Link } from "wouter";

function downloadHtml(html: string, id: number) {
  const blob = new Blob([html], { type: "text/html" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `website-${id}.html`;
  a.click();
  URL.revokeObjectURL(url);
}

export function MySitesPage() {
  const { toast } = useToast();
  const { data: sites, isLoading } = useListSites();
  const deleteSite = useDeleteSite();
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [previewId, setPreviewId] = useState<number | null>(null);

  const { data: previewSite } = useGetSite(previewId ?? 0);

  const handleDelete = async (id: number) => {
    try {
      await deleteSite.mutateAsync(id);
      toast({ title: "Site deleted" });
    } catch (err: any) {
      toast({ title: "Delete failed", description: err.message, variant: "destructive" });
    } finally {
      setDeletingId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!sites?.length) {
    return (
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">My Sites</h1>
          <p className="text-muted-foreground">All your generated websites in one place.</p>
        </div>
        <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
            <LayoutGrid className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-xl font-semibold">No sites yet</h2>
          <p className="text-muted-foreground max-w-sm">Generate your first website and it will appear here.</p>
          <Link href="/dashboard/create">
            <Button>Create your first site</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">My Sites</h1>
          <p className="text-muted-foreground">{sites.length} website{sites.length !== 1 ? "s" : ""} generated</p>
        </div>
        <Link href="/dashboard/create">
          <Button><Globe className="w-4 h-4 mr-2" /> Create New</Button>
        </Link>
      </div>

      <div className="grid gap-4">
        {sites.map((site) => (
          <Card key={site.id} className="bg-white border-border shadow-sm">
            <CardContent className="flex items-start justify-between gap-4 pt-6">
              <div className="flex-1 min-w-0">
                <p className="font-medium text-foreground truncate">{site.prompt}</p>
                <div className="flex items-center gap-3 mt-1">
                  {site.style && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium capitalize">
                      {site.style}
                    </span>
                  )}
                  <span className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(site.createdAt), { addSuffix: true })}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    const blob = new Blob([site.generatedHtml], { type: "text/html" });
                    window.open(URL.createObjectURL(blob), "_blank");
                  }}
                >
                  <ExternalLink className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => downloadHtml(site.generatedHtml, site.id)}
                >
                  <Download className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-destructive hover:text-destructive hover:bg-destructive/10"
                  onClick={() => setDeletingId(site.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <AlertDialog open={deletingId !== null} onOpenChange={(open) => !open && setDeletingId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this site?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The generated HTML will be permanently deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive hover:bg-destructive/90 text-white"
              onClick={() => deletingId && handleDelete(deletingId)}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
