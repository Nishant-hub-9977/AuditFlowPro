import { ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";

interface ErrorPageProps {
  title: string;
  description: string;
  icon: ReactNode;
  primaryAction?: {
    label: string;
    onClick?: () => void;
    href?: string;
  };
  secondaryAction?: {
    label: string;
    href?: string;
  };
}

export function ErrorPage({ title, description, icon, primaryAction, secondaryAction }: ErrorPageProps) {
  const [, navigate] = useLocation();

  const handlePrimary = () => {
    if (primaryAction?.onClick) {
      primaryAction.onClick();
      return;
    }

    if (primaryAction?.href) {
      navigate(primaryAction.href);
    }
  };

  const handleSecondary = () => {
    if (secondaryAction?.href) {
      navigate(secondaryAction.href);
    }
  };

  return (
    <div className="flex h-full items-center justify-center px-4">
      <Card className="w-full max-w-lg">
        <CardContent className="space-y-4 p-6 text-center">
          <div className="flex flex-col items-center gap-3">
            <div aria-hidden="true">{icon}</div>
            <h1 className="text-2xl font-semibold">{title}</h1>
            <p className="text-sm text-muted-foreground">{description}</p>
          </div>
          <div className="flex flex-wrap justify-center gap-3">
            {primaryAction && (
              <Button onClick={handlePrimary}>{primaryAction.label}</Button>
            )}
            {secondaryAction && (
              <Button variant="outline" onClick={handleSecondary}>
                {secondaryAction.label}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
