"use client";

import { Suspense, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CircleNotchIcon } from "@phosphor-icons/react";
import { useVerifyEmailMutation } from "@/services/auth/auth.queries";
import { authStore } from "@/services/auth/auth.store";
import { getDashboardPath } from "@/lib/route";

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
    if (!message) return "Kode verifikasi tidak valid atau sudah expired.";
    return Array.isArray(message) ? message.join(", ") : String(message);
  }, [verify.error]);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setStatus("idle");

    try {
      const result = await verify.mutateAsync({ email, code });
      setStatus("success");
      
      // Auto-login if tokens are provided
      if (result.accessToken && result.user) {
        authStore.getState().setAuth({
          accessToken: result.accessToken,
          user: result.user,
        });
        setTimeout(() => {
          router.replace(getDashboardPath(result.user!.role));
        }, 1200);
      } else {
        // Fallback to login page
        setTimeout(() => {
          router.replace("/auth/login");
        }, 1200);
      }
    } catch {
      setStatus("error");
    }
  }

  return (
    <div className="p-6 max-w-lg">
      <h1 className="text-xl mb-2">Verifikasi Email</h1>
      <p className="text-sm text-gray-600 mb-4">
        Masukkan kode verifikasi 6 digit yang sudah dikirim ke email kamu.
      </p>

      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="block text-sm mb-1">Email</label>
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value.trim().toLowerCase())}
            className="w-full rounded-md border px-3 py-2 text-sm"
            placeholder="email@domain.com"
            required
          />
        </div>

        <div>
          <label className="block text-sm mb-1">Kode Verifikasi</label>
          <input
            type="text"
            value={code}
            onChange={(event) => setCode(event.target.value.replace(/\D/g, "").slice(0, 6))}
            className="w-full rounded-md border px-3 py-2 text-sm tracking-[0.35em]"
            placeholder="123456"
            inputMode="numeric"
            required
          />
        </div>

        <button
          type="submit"
          disabled={verify.isPending}
          className="inline-flex items-center justify-center rounded-md bg-black text-white px-4 py-2 text-sm disabled:opacity-60"
        >
          {verify.isPending ? (
            <CircleNotchIcon className="animate-spin text-base" />
          ) : (
            "Verifikasi"
          )}
        </button>
      </form>

      {status === "success" && (
        <p className="text-sm text-green-600 mt-4">
          Email berhasil diverifikasi. Mengarahkan ke dashboard...
        </p>
      )}

      {status === "error" && (
        <p className="text-sm text-red-600 mt-4">{errorMessage}</p>
      )}
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div className="p-6">Loading...</div>}>
      <VerifyEmailPageContent />
    </Suspense>
  );
}
