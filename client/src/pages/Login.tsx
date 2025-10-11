import { useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/lib/authContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, Lock, Mail } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";

export default function Login() {
  const [, setLocation] = useLocation();
  const { login } = useAuth();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsLoading(true);

    try {
      await login(email, password);
      toast({
        title: "Success",
        description: "Logged in successfully",
      });
      // Use window.location to ensure full page reload with updated auth state
      window.location.href = "/";
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Login failed",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Login Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-background">
        <div className="w-full max-w-md space-y-6">
          <div className="flex items-center gap-3 mb-8">
            <div className="h-12 w-12 rounded-lg bg-primary flex items-center justify-center">
              <Building2 className="h-7 w-7 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Audit Flow Pro</h1>
              <p className="text-sm text-muted-foreground">Audit Platform</p>
            </div>
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-semibold">Welcome back</h2>
            <p className="text-muted-foreground">
              Sign in to access your audit and lead management dashboard
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@example.com"
                  className="pl-10"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  data-testid="input-email"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  className="pl-10"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  data-testid="input-password"
                />
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full" 
              disabled={isLoading} 
              data-testid="button-login"
            >
              {isLoading ? "Signing in..." : "Sign In"}
            </Button>

            <div className="text-center text-sm">
              <div className="mb-3 p-3 rounded-md bg-muted/50">
                <p className="font-semibold mb-2 text-foreground">Demo Credentials:</p>
                <div className="space-y-1 text-muted-foreground">
                  <p><strong>Master Admin:</strong> admin@example.com / admin123</p>
                  <p><strong>Admin:</strong> admin_user@example.com / demo123</p>
                  <p><strong>Client:</strong> client_user@example.com / demo123</p>
                  <p><strong>Auditor:</strong> auditor_user@example.com / demo123</p>
                </div>
              </div>
              <button
                type="button"
                className="text-primary hover:underline"
                onClick={() => setLocation("/register")}
                data-testid="link-register"
              >
                Don't have an account? Sign up
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Right Side - Illustration */}
      <div className="hidden lg:flex flex-1 bg-primary/5 items-center justify-center p-8">
        <div className="max-w-md space-y-6 text-center">
          <div className="mx-auto w-64 h-64 rounded-2xl bg-primary/10 flex items-center justify-center">
            <div className="space-y-4">
              <div className="h-16 w-16 mx-auto rounded-lg bg-primary/20 flex items-center justify-center">
                <Building2 className="h-8 w-8 text-primary" />
              </div>
              <div className="space-y-2">
                <div className="h-3 w-48 bg-primary/20 rounded mx-auto" />
                <div className="h-3 w-32 bg-primary/10 rounded mx-auto" />
                <div className="h-3 w-40 bg-primary/10 rounded mx-auto" />
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-semibold">Comprehensive Audit Management</h3>
            <p className="text-muted-foreground">
              Plan, execute, and report audits across industries. Track leads, manage compliance, and generate insights.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
