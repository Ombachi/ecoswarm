import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "@/context/AppContext";

/**
 * Routes landing-page CTAs into the app.
 * Unauthenticated visitors are sent to /login with the intended path stored,
 * so they land on the right screen after signing in.
 */
export function useLandingNav() {
  const navigate = useNavigate();
  const { authUserId } = useApp();

  return useCallback(
    (path: string) => {
      if (authUserId) {
        navigate(path);
        return;
      }
      try {
        sessionStorage.setItem("ecoswarm_redirect_after_login", path);
      } catch {
        /* storage unavailable */
      }
      navigate("/login", { state: { from: path } });
    },
    [authUserId, navigate]
  );
}
