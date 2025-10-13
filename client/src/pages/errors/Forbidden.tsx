import { ShieldOff } from "lucide-react";
import { ErrorPage } from "@/components/ErrorPage";

export default function Forbidden() {
  return (
    <ErrorPage
      title="Access denied"
      description="You do not have permission to view this resource. Contact an administrator if you believe this is a mistake."
      icon={<ShieldOff className="h-10 w-10 text-destructive" />}
      primaryAction={{ label: "Back to Dashboard", href: "/" }}
    />
  );
}
