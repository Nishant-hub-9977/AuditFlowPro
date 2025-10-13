import { Component, type ErrorInfo, type ReactNode } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AlertTriangle } from "lucide-react";

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

function sendErrorBeacon(payload: Record<string, unknown>) {
  try {
    if (typeof navigator !== "undefined" && typeof navigator.sendBeacon === "function") {
      const blob = new Blob([JSON.stringify(payload)], { type: "application/json" });
      navigator.sendBeacon("/api/logs/client-error", blob);
    }
  } catch (error) {
    console.warn("Failed to send error beacon", error);
  }
}

const ErrorFallback = ({ error, onReset }: { error?: Error; onReset: () => void }) => {
  const [, navigate] = useLocation();

  return (
    <div className="flex h-full items-center justify-center px-4">
      <Card className="w-full max-w-lg">
        <CardContent className="space-y-4 p-6 text-center">
          <div className="flex flex-col items-center gap-3">
            <AlertTriangle className="h-8 w-8 text-destructive" aria-hidden="true" />
            <h2 className="text-xl font-semibold">Something went wrong</h2>
            <p className="text-sm text-muted-foreground">
              An unexpected error occurred while rendering this section. You can retry or return to the dashboard.
            </p>
            {error?.message && (
              <p className="text-xs text-muted-foreground" role="status">
                {error.message}
              </p>
            )}
          </div>
          <div className="flex flex-wrap justify-center gap-3">
            <Button onClick={onReset}>Try again</Button>
            <Button
              variant="outline"
              onClick={() => {
                navigate("/");
                onReset();
              }}
            >
              Back to Dashboard
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("ErrorBoundary captured error", error, info);
    sendErrorBeacon({
      message: error.message,
      stack: error.stack,
      componentStack: info.componentStack,
      timestamp: new Date().toISOString(),
    });
  }

  reset = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      return <ErrorFallback error={this.state.error} onReset={this.reset} />;
    }

    return this.props.children;
  }
}
