"use client";

import { useState } from "react";
import { useLoginMutation } from "@/services/auth/auth.queries";
import { useRouter, useSearchParams } from "next/navigation";

export default function LoginForm() {
  const router = useRouter();
  const search = useSearchParams();
  const next = search.get("next") || "/dashboard";

  const login = useLoginMutation()
  const [email, setEmail] = useState("doctor1@test.com");
  const [password, setPassword] = useState("Password123!"); 

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    await login.mutateAsync({ email, password });
    router.replace(next);
  }

  return (
    <form onSubmit={onSubmit} className="max-w-sm space-y-3">
      <div>
        <label>Email</label>
        <input
          className="border w-full p-2"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
        />
      </div>

      <div>
        <label>Password</label>
        <input
          className="border w-full p-2"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
        />
      </div>

      {login.isError && <p className="text-red-600">Login gagal. Cek kredensial.</p>}

      <button className="border px-4 py-2" disabled={login.isPending}>
        {login.isPending ? "Loading..." : "Login"}
      </button>

    </form>
  );
}
