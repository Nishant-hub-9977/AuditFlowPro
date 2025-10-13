import { useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useLocation } from "wouter";

export function useLogout() {
  const { toast } = useToast();
  const [, navigate] = useLocation();

  return useCallback(async () => {
    const accessToken = localStorage.getItem("accessToken");
    const refreshToken = localStorage.getItem("refreshToken");

    try {
      if (accessToken && refreshToken) {
        await apiRequest("POST", "/api/auth/logout", { refreshToken });
      }
    } catch (error) {
      console.warn("Logout request failed", error);
    } finally {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      queryClient.clear();
      toast({ title: "Signed out", description: "Your session has been cleared." });
      navigate("/login");
    }
  }, [navigate, toast]);
}
