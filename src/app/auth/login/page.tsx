"use client";

import { Suspense } from "react";
import LoginForm from "@/components/auth/LoginForm";
import AuthRoleLayout from "@/components/auth/AuthRoleLayout";

function LoginPageContent() {
  return (
    <AuthRoleLayout
      title="Login to your account"
      subtitle="Please enter your details to login."
      promptText="Don't have an account ?"
      promptHrefBase="/auth/registration"
      promptLinkLabel="Register Now"
      renderForm={(role) => <LoginForm role={role} />}
    />
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="p-6">Loading...</div>}>
      <LoginPageContent />
    </Suspense>
  );
}
