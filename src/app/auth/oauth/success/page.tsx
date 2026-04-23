"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { authStore } from "@/services/auth/auth.store";
import { authApi } from "@/services/auth/auth.api";
import { getDashboardPath } from "@/lib/route";

function OAuthSuccessPageContent() {
  const params = useSearchParams();
  const router = useRouter();
  const accessToken = params.get("accessToken");
  const error = params.get("error");
  const [status, setStatus] = useState<"loading" | "error" | "success">("loading");

  useEffect(() => {
    if (error) {
      setStatus("error");
      return;
    }

    if (!accessToken) {
      setStatus("error");
      return;
    }

    let mounted = true;

    authApi
      .oauthSession(accessToken)
      .then((data) => {
        if (!mounted) return;
        authStore.getState().setAuth({ accessToken: data.accessToken, user: data.user });
        setStatus("success");
        router.replace(getDashboardPath(data.user.role));
      })
      .catch(() => {
        if (!mounted) return;
        setStatus("error");
      });

    return () => {
      mounted = false;
    };
  }, [accessToken, error]);

  return (
    <div className="p-6">
      <h1 className="text-xl mb-2">OAuth</h1>
      {status === "loading" && <p className="text-sm">Processing OAuth login...</p>}
      {status === "error" && (
        <p className="text-sm text-red-600">
          OAuth failed. Please try again.
        </p>
      )}
    </div>
  );
}

export default function OAuthSuccessPage() {
  return (
    <Suspense fallback={<div className="p-6">Processing OAuth login...</div>}>
      <OAuthSuccessPageContent />
    </Suspense>
  );
}
