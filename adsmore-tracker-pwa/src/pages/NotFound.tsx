import { ArrowLeft } from "lucide-react";
import { useLocation } from "wouter";

export default function NotFound() {
  const [, navigate] = useLocation();

  return (
    <div className="min-h-dvh flex flex-col items-center justify-center bg-background px-6 text-center">
      <h1 className="font-mono text-4xl font-bold text-foreground mb-2">404</h1>
      <p className="text-muted-foreground text-sm font-mono mb-6">Page not found</p>
      <button
        onClick={() => navigate("/")}
        className="flex items-center gap-2 px-4 py-2.5 bg-secondary text-foreground rounded-lg font-mono text-sm hover:bg-accent transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Timeline
      </button>
    </div>
  );
}
