import { useEffect, useState } from "react";

/**
 * Tracks browser offline/online status.
 */
export function useOffline(): { isOffline: boolean } {
  const getStatus = () => (typeof navigator !== "undefined" ? !navigator.onLine : false);
  const [isOffline, setIsOffline] = useState<boolean>(getStatus);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return { isOffline };
}
