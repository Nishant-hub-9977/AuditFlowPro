import { SearchX } from "lucide-react";
import { ErrorPage } from "@/components/ErrorPage";

export default function NotFound() {
  return (
    <ErrorPage
      title="Page not found"
      description="We couldn't locate the page you're looking for."
      icon={<SearchX className="h-10 w-10 text-muted-foreground" />}
      primaryAction={{ label: "Back to Dashboard", href: "/" }}
    />
  );
}
