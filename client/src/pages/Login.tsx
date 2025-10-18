import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useLocation } from "wouter";

export default function Login() {
  const { success: showSuccessToast, error: showErrorToast } = useToast();
  const [, navigate] = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    try {
      setIsSubmitting(true);
      const response = await apiRequest("POST", "/api/auth/login", {
        email,
        password,
      });
      const data = await response.json();

      localStorage.setItem("accessToken", data.accessToken);
      localStorage.setItem("refreshToken", data.refreshToken);

      showSuccessToast({
        title: "Welcome back",
        description: "You are now signed in.",
      });
      navigate("/");
    } catch (error: any) {
      showErrorToast({
        title: "Login failed",
        description:
          error?.message || "We could not sign you in with those credentials.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGuestLogin = async () => {
    try {
      setIsSubmitting(true);
      const response = await apiRequest("POST", "/api/auth/guest-login");
      const data = await response.json();

      localStorage.setItem("accessToken", data.accessToken);
      localStorage.setItem("refreshToken", data.refreshToken);

      showSuccessToast({
        title: "Guest mode",
        description: "Exploring the workspace as a guest.",
      });
      navigate("/");
    } catch (error: any) {
      showErrorToast({
        title: "Guest access failed",
        description: error?.message || "Unable to start guest session.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 p-4">
      <Card className="w-full max-w-md" data-testid="card-login">
        <CardHeader>
          <CardTitle className="text-2xl font-semibold">
            Sign in to Audit Flow Pro
          </CardTitle>
          <CardDescription>
            Use your work email or explore in guest mode.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="email">
                Email
              </label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@company.com"
                data-testid="input-email"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="password">
                Password
              </label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="••••••••"
                data-testid="input-password"
                required
              />
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={isSubmitting}
              data-testid="button-login"
            >
              {isSubmitting ? "Signing in..." : "Sign In"}
            </Button>
          </form>

          <Separator className="my-6" />

          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={handleGuestLogin}
            disabled={isSubmitting}
            data-testid="button-guest-login"
          >
            Continue as Guest
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
