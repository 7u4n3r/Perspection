import { ArrowLeft } from "lucide-react";
import { useLocation } from "wouter";

export default function NotFound() {
  const [, navigate] = useLocation();

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
      <p className="font-mono text-sm text-muted-foreground mb-4">Page not found</p>
      <button
        onClick={() => navigate("/")}
        className="flex items-center gap-2 font-mono text-xs text-primary"
      >
        <ArrowLeft className="w-4 h-4" />
        Return to timeline
      </button>
    </div>
  );
}
