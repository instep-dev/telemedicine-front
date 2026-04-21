"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  useGetPatientProfileQuery,
  useUpdatePatientProfileMutation,
  useRequestEmailChangePatientMutation,
  useConfirmEmailChangePatientMutation,
  useRequestPasswordResetPatientMutation,
  useVerifyResetCodePatientMutation,
  useSetNewPasswordPatientMutation,
  useUploadProfilePicturePatientMutation,
} from "@/services/profile/profile.queries";
import Input from "@/components/dashboard/form/input/InputField";
import {
  UserIcon,
  PhoneIcon,
  LockIcon,
  EyeIcon,
  EyeSlashIcon,
  CircleNotchIcon,
  EnvelopeIcon,
  PanoramaIcon,
  CalendarIcon,
} from "@phosphor-icons/react";

type Tab = "personal" | "security" | "picture";
type PasswordResetStep = "request" | "verify" | "new-password";

export default function PatientProfilePage() {
  const router = useRouter();
  const { data: profile } = useGetPatientProfileQuery();
  const updateProfile = useUpdatePatientProfileMutation();
  const requestEmailChange = useRequestEmailChangePatientMutation();
  const confirmEmailChange = useConfirmEmailChangePatientMutation();
  const requestPasswordReset = useRequestPasswordResetPatientMutation();
  const verifyResetCode = useVerifyResetCodePatientMutation();
  const setNewPassword = useSetNewPasswordPatientMutation();
  const uploadPicture = useUploadProfilePicturePatientMutation();

  const [activeTab, setActiveTab] = useState<Tab>("personal");

  // Personal Info
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");

  // Email Change
  const [changeEmailStep, setChangeEmailStep] = useState<"request" | "confirm">("request");
  const [changeEmailPassword, setChangeEmailPassword] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [emailVerificationCode, setEmailVerificationCode] = useState("");
  const [showChangeEmailPassword, setShowChangeEmailPassword] = useState(false);

  // Password Reset
  const [passwordResetStep, setPasswordResetStep] = useState<PasswordResetStep>("request");
  const [resetCode, setResetCode] = useState("");
  const [pendingResetCode, setPendingResetCode] = useState("");
  const [newPassword1, setNewPassword1] = useState("");
  const [newPassword2, setNewPassword2] = useState("");
  const [showNewPassword1, setShowNewPassword1] = useState(false);
  const [showNewPassword2, setShowNewPassword2] = useState(false);

  // Picture Upload
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  useEffect(() => {
    if (profile) {
      setFullName(profile.fullName);
      setPhone(profile.phone);
    }
  }, [profile]);

  const getErrorMessage = (error: any) => {
    const msg = error?.response?.data?.message;
    if (!msg) return null;
    return Array.isArray(msg) ? msg.join(", ") : String(msg);
  };

  async function onSubmitPersonal(e: React.FormEvent) {
    e.preventDefault();
    try {
      await updateProfile.mutateAsync({
        fullName: fullName.trim(),
        phone: phone.trim(),
      });
      alert("Profil berhasil diperbarui");
      router.refresh();
    } catch {
      // handled via state
    }
  }

  async function onRequestEmailChange(e: React.FormEvent) {
    e.preventDefault();
    try {
      await requestEmailChange.mutateAsync({
        newEmail: newEmail.trim(),
        password: changeEmailPassword.trim(),
      });
      setChangeEmailStep("confirm");
      alert("Kode verifikasi telah dikirim ke email baru");
    } catch {
      // handled via state
    }
  }

  async function onConfirmEmailChange(e: React.FormEvent) {
    e.preventDefault();
    try {
      await confirmEmailChange.mutateAsync({
        newEmail: newEmail.trim(),
        code: emailVerificationCode.trim(),
      });
      alert("Email berhasil diubah!");
      setChangeEmailStep("request");
      setNewEmail("");
      setChangeEmailPassword("");
      setEmailVerificationCode("");
      router.refresh();
    } catch {
      // handled via state
    }
  }

  async function onRequestPasswordReset(e: React.FormEvent) {
    e.preventDefault();
    try {
      await requestPasswordReset.mutateAsync();
      setPasswordResetStep("verify");
      alert("Kode reset password telah dikirim ke email");
    } catch {
      // handled via state
    }
  }

  async function onVerifyResetCode(e: React.FormEvent) {
    e.preventDefault();
    try {
      await verifyResetCode.mutateAsync({ code: resetCode.trim() });
      setPendingResetCode(resetCode.trim());
      setPasswordResetStep("new-password");
    } catch {
      // handled via state
    }
  }

  async function onSetNewPassword(e: React.FormEvent) {
    e.preventDefault();
    if (newPassword1 !== newPassword2) {
      alert("Password tidak cocok");
      return;
    }
    try {
      await setNewPassword.mutateAsync({
        code: pendingResetCode,
        newPassword: newPassword1.trim(),
      });
      alert("Password berhasil diubah!");
      setPasswordResetStep("request");
      setResetCode("");
      setPendingResetCode("");
      setNewPassword1("");
      setNewPassword2("");
      router.refresh();
    } catch {
      // handled via state
    }
  }

  async function onUploadPicture(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedFile) {
      alert("Pilih file terlebih dahulu");
      return;
    }
    try {
      await uploadPicture.mutateAsync(selectedFile);
      alert("Foto profil berhasil diubah");
      setSelectedFile(null);
      router.refresh();
    } catch {
      // handled via state
    }
  }

  return (
    <div className="w-full mx-auto bg-card p-6 border border-cultured rounded-lg">
      {/* Tabs */}
      <div className="inline-flex gap-2 mb-6 border border-cultured text-xs rounded-lg p-1">
        <button
          onClick={() => setActiveTab("personal")}
          className={`px-4 py-2 rounded-lg  ${
            activeTab === "personal" ? "bg-gradient-primary" : "text-neutral-500"
          }`}
        >
          Personal Data
        </button>
        <button
          onClick={() => setActiveTab("security")}
          className={`px-4 py-2 rounded-lg  ${
            activeTab === "security" ? "bg-gradient-primary" : "text-neutral-500"
          }`}
        >
          Security
        </button>
        <button
          onClick={() => setActiveTab("picture")}
          className={`px-4 py-2 rounded-lg  ${
            activeTab === "picture" ? "bg-gradient-primary" : "text-neutral-500"
          }`}
        >
          Profile Picture
        </button>
      </div>

      {/* Personal Info Tab */}
      {activeTab === "personal" && (
        <form onSubmit={onSubmitPersonal} className="space-y-4">
          <div className="flex items-center justify-between gap-6">
            <div className="w-full">
              <label className="block text-sm font-medium mb-2">Full Name</label>
              <Input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Nama lengkap"
                icon={UserIcon}
              />
            </div>

            <div className="w-full">
              <label className="block text-sm font-medium mb-2">Email</label>
              <Input
                type="email"
                value={profile?.email || ""}
                disabled
                placeholder={profile?.email || ""}
                icon={EnvelopeIcon}
              />
            </div>
          </div>

          <div className="flex items-center justify-between gap-6">
            <div className="w-full">
              <label className="block text-sm font-medium mb-2">Date of Birth</label>
              <Input
                type="text"
                value={profile?.bornDate ? profile.bornDate.split("T")[0] : ""}
                disabled
                placeholder={profile?.bornDate ? profile.bornDate.split("T")[0] : ""}
                icon={CalendarIcon}
              />
            </div>

            <div className="w-full">
              <label className="block text-sm font-medium mb-2">Phone</label>
              <Input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="08xxxxxxxxxx"
                icon={PhoneIcon}
              />
            </div>
          </div>

          {updateProfile.error && (
            <p className="text-red-600 text-sm">{getErrorMessage(updateProfile.error)}</p>
          )}

          <button
            type="submit"
            disabled={updateProfile.isPending}
            className="w-auto px-4 py-2 mt-6 bg-success-500/10 rounded-lg border border-success-900 text-xs text-success-500 disabled:opacity-60"
          >
            {updateProfile.isPending ? (
              <CircleNotchIcon className="animate-spin inline mr-2" size={18} />
            ) : (
              "Save changes"
            )}
          </button>
        </form>
      )}

      {/* Security Tab */}
      {activeTab === "security" && (
        <div className="space-y-6">
          {/* Email Change Section */}
          <div className="border rounded-lg p-6 border-cultured bg-card">
            <h3 className="text-lg font-semibold mb-6">Change Your Email</h3>
            {changeEmailStep === "request" ? (
              <form onSubmit={onRequestEmailChange} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">New Email <span className="text-accent ml-1">(Optional)</span></label>
                  <Input
                    type="email"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="New Email"
                    icon={EnvelopeIcon}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Current Password
                  </label>
                  <div className="relative">
                    <Input
                      type={showChangeEmailPassword ? "text" : "password"}
                      value={changeEmailPassword}
                      onChange={(e) => setChangeEmailPassword(e.target.value)}
                      placeholder="Current Password"
                      icon={LockIcon}
                    />
                    <button
                      type="button"
                      onClick={() => setShowChangeEmailPassword(!showChangeEmailPassword)}
                      className="absolute right-3 top-[10px] text-gray-400 hover:text-white"
                    >
                      {showChangeEmailPassword ? <EyeSlashIcon size={18} /> : <EyeIcon size={18} />}
                    </button>
                  </div>
                </div>

                {requestEmailChange.error && (
                  <p className="text-red-600 text-sm">
                    {getErrorMessage(requestEmailChange.error)}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={requestEmailChange.isPending}
                  className=" px-4 py-2 rounded-lg bg-gradient-primary text-xs mt-6 text-white disabled:opacity-60"
                >
                  {requestEmailChange.isPending ? (
                    <CircleNotchIcon className="animate-spin inline mr-2" size={18} />
                  ) : (
                    "Kirim Kode Verifikasi"
                  )}
                </button>
              </form>
            ) : (
              <form onSubmit={onConfirmEmailChange} className="space-y-4">
                <p className="text-sm text-accent">
                  Verification code has been send to "<span className="text-white">{newEmail}</span>"
                </p>

                <div>
                  <label className="block text-sm font-medium mb-2">Verification Code</label>
                  <Input
                    type="text"
                    value={emailVerificationCode}
                    onChange={(e) => setEmailVerificationCode(e.target.value)}
                    placeholder="Masukkan kode 6 digit"
                  />
                  <p className="text-xs text-neutral-500 mt-2">Code expired in 30 mins</p>
                </div>

                {confirmEmailChange.error && (
                  <p className="text-red-600 text-sm">
                    {getErrorMessage(confirmEmailChange.error)}
                  </p>
                )}

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setChangeEmailStep("request");
                      setEmailVerificationCode("");
                    }}
                    className=" px-4 py-2 rounded-lg border text-xs border-red-900 bg-red-500/10 text-red-600"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={confirmEmailChange.isPending}
                    className="border-green-900 border bg-green-500/10 text-green-600 text-xs px-4 py-2 rounded-lg disabled:opacity-60"
                  >
                    {confirmEmailChange.isPending ? (
                      <CircleNotchIcon className="animate-spin inline mr-2" size={18} />
                    ) : (
                      "Verify"
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Password Reset Section */}
          <div className="border rounded-lg p-6 border-cultured bg-card">
            <h3 className="text-lg font-semibold mb-4">Reset Password</h3>

            {passwordResetStep === "request" && (
              <form onSubmit={onRequestPasswordReset} className="space-y-4">
                <p className="text-sm text-neutral-500">
                  Click this button to send verification code
                </p>

                {requestPasswordReset.error && (
                  <p className="text-red-600 text-sm">
                    {getErrorMessage(requestPasswordReset.error)}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={requestPasswordReset.isPending}
                  className="px-4 py-2 rounded-lg bg-red-500/10 border border-red-900 text-red-600 text-xs disabled:opacity-60"
                >
                  {requestPasswordReset.isPending ? (
                    <CircleNotchIcon className="animate-spin inline mr-2" size={18} />
                  ) : (
                    "Send Code"
                  )}
                </button>
              </form>
            )}

            {passwordResetStep === "verify" && (
              <form onSubmit={onVerifyResetCode} className="space-y-4">
                <p className="text-sm text-gray-400">
                  input the code
                </p>

                <div>
                  <label className="block text-sm font-medium mb-2">Reset Code</label>
                  <Input
                    type="text"
                    value={resetCode}
                    onChange={(e) => setResetCode(e.target.value)}
                    placeholder="Masukkan kode 6 digit"
                  />
                  <p className="text-xs text-gray-400 mt-1">Code expired in 10 mins</p>
                </div>

                {verifyResetCode.error && (
                  <p className="text-red-600 text-sm">
                    {getErrorMessage(verifyResetCode.error)}
                  </p>
                )}

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setPasswordResetStep("request");
                      setResetCode("");
                    }}
                    className="flex-1 px-4 py-2 rounded-lg border border-gray-600 text-white"
                  >
                    cancel
                  </button>
                  <button
                    type="submit"
                    disabled={verifyResetCode.isPending}
                    className="flex-1 px-4 py-2 rounded-lg bg-primary text-white disabled:opacity-60"
                  >
                    {verifyResetCode.isPending ? (
                      <CircleNotchIcon className="animate-spin inline mr-2" size={18} />
                    ) : (
                      "verifiy code"
                    )}
                  </button>
                </div>
              </form>
            )}

            {passwordResetStep === "new-password" && (
              <form onSubmit={onSetNewPassword} className="space-y-4">
                <p className="text-sm text-gray-400">Code has been verified. Input new password</p>

                <div>
                  <label className="block text-sm font-medium mb-2">New Password</label>
                  <div className="relative">
                    <Input
                      type={showNewPassword1 ? "text" : "password"}
                      value={newPassword1}
                      onChange={(e) => setNewPassword1(e.target.value)}
                      placeholder="New password"
                      icon={LockIcon}
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword1(!showNewPassword1)}
                      className="absolute right-3 top-[10px] text-gray-400 hover:text-white"
                    >
                      {showNewPassword1 ? <EyeSlashIcon size={18} /> : <EyeIcon size={18} />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Confirm password</label>
                  <div className="relative">
                    <Input
                      type={showNewPassword2 ? "text" : "password"}
                      value={newPassword2}
                      onChange={(e) => setNewPassword2(e.target.value)}
                      placeholder="Retype password"
                      icon={LockIcon}
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword2(!showNewPassword2)}
                      className="absolute right-3 top-[10px] text-gray-400 hover:text-white"
                    >
                      {showNewPassword2 ? <EyeSlashIcon size={18} /> : <EyeIcon size={18} />}
                    </button>
                  </div>
                </div>

                {setNewPassword.error && (
                  <p className="text-red-600 text-sm">
                    {getErrorMessage(setNewPassword.error)}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={setNewPassword.isPending}
                  className="px-4 py-2 rounded-lg bg-green-500/10 text-green-600 border boreder-green-950 disabled:opacity-60"
                >
                  {setNewPassword.isPending ? (
                    <CircleNotchIcon className="animate-spin inline mr-2" size={18} />
                  ) : (
                    "Save new password"
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Picture Upload Tab */}
      {activeTab === "picture" && (
        <form onSubmit={onUploadPicture} className="space-y-4">
          <div className="border-2 border-dashed rounded-lg bg-card border-cultured p-6 text-center h-[50vh] flex items-center justify-center">
            {selectedFile ? (
              <div>
                <p className="text-sm font-medium mb-2">{selectedFile.name}</p>
                <p className="text-xs text-gray-400">
                  {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <PanoramaIcon size={72} className="text-neutral-500" />
              </div>
            )}
            <input
              type="file"
              accept="image/jpeg,image/png,image/svg+xml,image/avif"
              onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
              className="hidden"
              id="picture-upload"
            />
          </div>

          <p className="text-xs text-neutral-500">
            Format: JPG, JPEG, PNG, SVG, AVIF • Max: 2MB
          </p>

          {uploadPicture.error && (
            <p className="text-red-600 text-sm">{getErrorMessage(uploadPicture.error)}</p>
          )}

          <button
            type="submit"
            disabled={!selectedFile || uploadPicture.isPending}
            className="px-4 py-2 rounded-lg text-xs bg-green-500/10 text-green-600 border border-green-950 disabled:opacity-60"
          >
            {uploadPicture.isPending ? (
              <CircleNotchIcon className="animate-spin inline mr-2" size={18} />
            ) : (
              "Upload profile"
            )}
          </button>
        </form>
      )}
    </div>
  );
}
