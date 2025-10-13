import { WifiOff } from "lucide-react";
import { useOffline } from "@/hooks/useOffline";

export function OfflineBanner() {
  const { isOffline } = useOffline();

  if (!isOffline) {
    return null;
  }

  return (
    <div
      className="flex items-center justify-center gap-2 border-b border-destructive/40 bg-destructive/10 px-4 py-2 text-sm text-destructive"
      role="status"
      aria-live="assertive"
    >
      <WifiOff className="h-4 w-4" aria-hidden="true" />
      <span>Offline mode — actions will sync once you reconnect.</span>
    </div>
  );
}
