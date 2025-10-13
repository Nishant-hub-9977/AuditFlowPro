import { Bug } from "lucide-react";
import { ErrorPage } from "@/components/ErrorPage";

export default function ServerError() {
  return (
    <ErrorPage
      title="Server error"
      description="We hit a snag talking to the server. Please try again or contact support if the problem persists."
      icon={<Bug className="h-10 w-10 text-amber-600" />}
      primaryAction={{ label: "Retry", onClick: () => window.location.reload() }}
      secondaryAction={{ label: "Back to Dashboard", href: "/" }}
    />
  );
}
