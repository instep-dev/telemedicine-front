"use client";

import { Suspense } from "react";
import LoginForm from "@/components/auth/LoginForm";
import AuthRoleLayout from "@/components/auth/AuthRoleLayout";
import { CircleNotchIcon } from "@phosphor-icons/react";

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
    <Suspense fallback={
      <div className="w-full h-full flex items-center justify-center">
        <CircleNotchIcon className="animate-spin text-primary"/>
      </div>
    }>
      <LoginPageContent />
    </Suspense>
  );
}
