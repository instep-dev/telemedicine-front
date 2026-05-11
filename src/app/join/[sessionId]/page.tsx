"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { useRouter, useParams } from "next/navigation";
import { authStore } from "@/services/auth/auth.store";
import { consultationsApi } from "@/services/consultations/consultations.api";
import { Slab } from "react-loading-indicators";
import { WarningCircleIcon, ArrowLeftIcon } from "@phosphor-icons/react";

type PageState =
  | "loading"
  | "redirecting"
  | "error_access"
  | "error_ended"
  | "error_admin"
  | "error_invalid";

const ERROR_CONTENT: Record<
  Exclude<PageState, "loading" | "redirecting">,
  { title: string; description: string }
> = {
  error_access: {
    title: "Access Denied",
    description:
      "You don't have access to this consultation. This link was not shared with your account. Please make sure you are logged in with the correct account.",
  },
  error_ended: {
    title: "Consultation Ended",
    description:
      "This consultation has already ended. The direct link is no longer active.",
  },
  error_admin: {
    title: "Cannot Join as Admin",
    description:
      "Admin accounts cannot join consultations via a direct link. Please share this link with the consultation participants.",
  },
  error_invalid: {
    title: "Invalid Link",
    description:
      "This consultation link is invalid or could not be verified. Please contact the administrator for a new link.",
  },
};

export default function JoinPage() {
  const router = useRouter();
  const params = useParams();
  const sessionId = params.sessionId as string;

  const { accessToken, user, bootstrapped } = useSyncExternalStore(
    authStore.subscribe,
    () => authStore.getState(),
    () => authStore.getState(),
  );

  const [pageState, setPageState] = useState<PageState>("loading");

  useEffect(() => {
    if (!bootstrapped) return;

    if (!accessToken || !user) {
      router.replace(`/auth/login?next=/join/${sessionId}`);
      return;
    }

    if (user.role === "ADMIN") {
      setPageState("error_admin");
      return;
    }

    consultationsApi
      .getSessionById(accessToken, sessionId)
      .then((session) => {
        if (
          session.sessionStatus === "COMPLETED" ||
          session.sessionStatus === "FAILED"
        ) {
          setPageState("error_ended");
        } else {
          setPageState("redirecting");
          router.replace(`/consultations/${sessionId}`);
        }
      })
      .catch((err) => {
        const status = err?.response?.status;
        if (status === 401) {
          router.replace(`/auth/login?next=/join/${sessionId}`);
        } else if (status === 403 || status === 404) {
          setPageState("error_access");
        } else {
          setPageState("error_invalid");
        }
      });
  }, [bootstrapped, accessToken, user, sessionId, router]);

  if (pageState === "loading" || pageState === "redirecting") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Slab color={["#001edf", "#1333ff", "#465fff", "#798bff"]} />
          <p className="text-primary font-medium mt-3 text-sm">
            {pageState === "redirecting"
              ? "Redirecting to consultation room..."
              : "Verifying your access..."}
          </p>
        </div>
      </div>
    );
  }

  const error = ERROR_CONTENT[pageState];

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-card border border-cultured rounded-xl p-8 flex flex-col items-center gap-5">
        <div className="w-14 h-14 rounded-full bg-red-500/10 border border-red-900/50 flex items-center justify-center">
          <WarningCircleIcon size={28} className="text-red-400" weight="fill" />
        </div>

        <div className="text-center space-y-2">
          <h1 className="text-base font-semibold">{error.title}</h1>
          <p className="text-sm text-accent leading-relaxed">{error.description}</p>
        </div>

        <button
          onClick={() => router.push("/")}
          className="flex items-center gap-2 px-5 py-2 rounded-lg border border-cultured text-sm hover:bg-white/5 transition-colors"
        >
          <ArrowLeftIcon size={14} />
          Back to Home
        </button>
      </div>
    </div>
  );
}
