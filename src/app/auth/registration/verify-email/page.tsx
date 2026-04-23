"use client";

import { Suspense, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useVerifyEmailMutation } from "@/services/auth/auth.queries";
import { authStore } from "@/services/auth/auth.store";
import { getDashboardPath } from "@/lib/route";
import Input from "@/components/dashboard/form/input/InputField";
import {
  EnvelopeIcon,
  LockKeyIcon,
  CircleNotchIcon,
  HeartIcon,
  CaretLeftIcon,
} from "@phosphor-icons/react";
import Notify from "@/components/reusable/Notify";

function VerifyEmailPageContent() {
  const params = useSearchParams();
  const router = useRouter();
  const verify = useVerifyEmailMutation();

  const emailFromQuery = (params.get("email") || "").trim().toLowerCase();
  const [email, setEmail] = useState(emailFromQuery);
  const [code, setCode] = useState("");
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");

  const errorMessage = useMemo(() => {
    const err = verify.error as
      | {
          response?: {
            data?: {
              message?: string | string[];
            };
          };
        }
      | null;
    const message = err?.response?.data?.message;
    if (!message) return "Verification code is invalid or has expired.";
    return Array.isArray(message) ? message.join(", ") : String(message);
  }, [verify.error]);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setStatus("idle");

    try {
      const result = await verify.mutateAsync({ email, code });
      setStatus("success");

      if (result.accessToken && result.user) {
        authStore.getState().setAuth({
          accessToken: result.accessToken,
          user: result.user,
        });
        setTimeout(() => {
          router.replace(getDashboardPath(result.user!.role));
        }, 1200);
      } else {
        setTimeout(() => {
          router.replace("/auth/login");
        }, 1200);
      }
    } catch {
      setStatus("error");
    }
  }

  return (
    <div className="py-6 px-12 flex flex-col justify-between">
      <div className="text-sm text-right text-accent flex items-center justify-between">
        <button
          onClick={() => router.back()}
          className="flex items-center justify-center gap-1 px-3 text-white py-2 rounded-full bg-gradient-gray border border-cultured"
        >
          <CaretLeftIcon weight="fill" />
          Back
        </button>
        <p>
          Verify your <span className="text-white">Email</span>
        </p>
      </div>

      <div>
        <div className="text-center mb-6">
          <h3 className="text-3xl mb-2">Email Verification</h3>
          <p className="text-accent text-sm max-w-xs text-center mx-auto">
            Enter the 6-digit verification code sent to your email address.
          </p>
        </div>

        <form onSubmit={onSubmit} className="max-w-sm mx-auto space-y-6">
          <div>
            <label className="block text-xs text-accent mb-2">Email</label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value.trim().toLowerCase())}
              placeholder="email@domain.com"
              icon={EnvelopeIcon}
            />
          </div>

          <div>
            <label className="block text-xs text-accent mb-2">
              Verification Code
            </label>
            <Input
              type="text"
              value={code}
              onChange={(e) =>
                setCode(e.target.value.replace(/\D/g, "").slice(0, 6))
              }
              placeholder="123456"
              inputMode="numeric"
              icon={LockKeyIcon}
            />
          </div>

          {status === "error" && (
            <Notify variant={false} error={errorMessage}/>
          )}

          {status === "success" && (
            <Notify variant={true} success={`Registration Success, Welcome`}/>
          )}

          <button
            type="submit"
            className="border px-4 py-2 rounded-lg border-cultured text-sm w-full bg-gradient-primary disabled:opacity-60"
            disabled={verify.isPending}
          >
            {verify.isPending ? (
              <CircleNotchIcon className="animate-spin text-primary mx-auto" />
            ) : (
              "Verify Email"
            )}
          </button>
        </form>
      </div>

      <div className="flex items-center justify-between text-sm">
        <p>&copy; 2026, Telemedicine</p>
        <div className="flex gap-2 items-center">
          <p>Made with</p>
          <HeartIcon weight="fill" className="text-red-500" />
          <p className="text-accent">By Moefaris</p>
        </div>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
        <div className="w-full h-full flex items-center justify-center">
          <CircleNotchIcon className="animate-spin text-primary"/>
        </div>
      }>
      <VerifyEmailPageContent />
    </Suspense>
  );
}
