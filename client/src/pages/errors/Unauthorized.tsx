import { ShieldAlert } from "lucide-react";
import { ErrorPage } from "@/components/ErrorPage";

export default function Unauthorized() {
  return (
    <ErrorPage
      title="Login required"
      description="Your session may have expired. Please sign in again to continue."
      icon={<ShieldAlert className="h-10 w-10 text-amber-500" />}
      primaryAction={{ label: "Sign in", href: "/login" }}
      secondaryAction={{ label: "Back to Dashboard", href: "/" }}
    />
  );
}
