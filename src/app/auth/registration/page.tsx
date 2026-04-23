"use client";

import { Suspense } from "react";
import RegistrationForm from "@/components/auth/RegistrationForm";
import AuthRoleLayout from "@/components/auth/AuthRoleLayout";
import { CircleNotchIcon } from "@phosphor-icons/react";

function RegistrationPageContent() {
  return (
    <AuthRoleLayout
      title="Create your account"
      subtitle="Please enter your details to register."
      promptText="Already have an account ?"
      promptHrefBase="/auth/login"
      promptLinkLabel="Login Now"
      renderForm={(role) => <RegistrationForm role={role} />}
    />
  );
}

export default function RegistrationPage() {
  return (
    <Suspense fallback={
      <div className="w-full h-full flex items-center justify-center">
        <CircleNotchIcon className="animate-spin text-primary"/>
      </div>
    }>
      <RegistrationPageContent />
    </Suspense>
  );
}
