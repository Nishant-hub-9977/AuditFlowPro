import { useAuth } from "@/lib/authContext";
import { Redirect } from "wouter";
import type { UserRole } from "@shared/schema";

interface RoleGuardProps {
  allowedRoles: UserRole[];
  children: React.ReactNode;
  fallbackPath?: string;
}

export function RoleGuard({ allowedRoles, children, fallbackPath = "/" }: RoleGuardProps) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!user) {
    return <Redirect to="/login" />;
  }

  if (!allowedRoles.includes(user.role as UserRole)) {
    return <Redirect to={fallbackPath} />;
  }

  return <>{children}</>;
}
