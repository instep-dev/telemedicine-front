"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useVerifyEmailMutation } from "@/services/auth/auth.queries";

export default function VerifyEmailPage() {
  const params = useSearchParams();
  const token = params.get("token") || "";
  const email = params.get("email") || "";

  const verify = useVerifyEmailMutation();
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  useEffect(() => {
    if (!token) return;
    let mounted = true;
    setStatus("loading");
    verify
      .mutateAsync({ token })
      .then(() => {
        if (mounted) setStatus("success");
      })
      .catch(() => {
        if (mounted) setStatus("error");
      });
    return () => {
      mounted = false;
    };
  }, [token]);

  return (
    <div className="p-6 max-w-lg">
      <h1 className="text-xl mb-2">Verifikasi Email</h1>
      {email && <p className="text-sm text-gray-500 mb-4">{email}</p>}

      {!token && (
        <p className="text-sm text-gray-600">
          Kami sudah mengirim link verifikasi ke email kamu. Silakan cek inbox
          {email ? ` (${email})` : ""}.
        </p>
      )}

      {token && status === "loading" && (
        <p className="text-sm">Memverifikasi email kamu...</p>
      )}

      {token && status === "success" && (
        <div className="space-y-2">
          <p className="text-sm text-green-600">Email berhasil diverifikasi. Akun kamu sudah aktif.</p>
          <a className="underline text-sm" href="/auth/login">
            Login sekarang
          </a>
        </div>
      )}

      {token && status === "error" && (
        <p className="text-sm text-red-600">Verifikasi gagal atau link expired.</p>
      )}
    </div>
  );
}
