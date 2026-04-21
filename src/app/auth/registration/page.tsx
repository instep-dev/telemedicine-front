"use client";

import { Suspense } from "react";
import RegistrationForm from "@/components/auth/RegistrationForm";
import AuthRoleLayout from "@/components/auth/AuthRoleLayout";

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
    <Suspense fallback={<div className="p-6">Loading...</div>}>
      <RegistrationPageContent />
    </Suspense>
  );
}
