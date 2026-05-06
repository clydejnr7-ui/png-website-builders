import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Globe } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-[100dvh] items-center justify-center px-4">
      <div className="text-center">
        <Globe className="w-12 h-12 text-primary mx-auto mb-4" />
        <h1 className="text-4xl font-extrabold text-foreground mb-2">404</h1>
        <p className="text-xl text-muted-foreground mb-8">Page not found</p>
        <Link href="/">
          <Button>Go Home</Button>
        </Link>
      </div>
    </div>
  );
}
