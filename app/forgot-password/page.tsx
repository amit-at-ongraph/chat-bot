"use client";

import { Button } from "@/app/components/ui/Button";
import { Input } from "@/app/components/ui/Input";
import { useTranslation } from "@/app/i18n/useTranslation";
import axios from "axios";
import Link from "next/link";
import { useState } from "react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const { t } = useTranslation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);

    try {
      await axios.post("/api/auth/forgot-password", { email });
      setSuccess(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-app-bg flex min-h-full flex-col items-center justify-center p-4 px-6">
      <div className="border-border-light bg-app-bg w-full max-w-md space-y-6 rounded-3xl border p-10 shadow-2xl">
        <div className="text-center">
          <h2 className="text-text-main sm:mt-6 mt-4 text-3xl font-bold">{t("auth.reset_password")}</h2>
          <p className="text-text-muted mt-2">{t("auth.enter_email_reset")}</p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="rounded-xl bg-red-500/10 p-4 text-center text-sm font-medium text-red-500">
              {error}
            </div>
          )}
          {success && (
            <div className="rounded-xl bg-green-500/10 p-4 text-center text-sm font-medium text-green-500">
              {t("auth.reset_link_sent")}
            </div>
          )}

          <div className="space-y-4">
            <Input
              id="email"
              name="email"
              type="email"
              label={t("auth.email_address")}
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              disabled={loading || success}
            />
          </div>

          <div>
            <Button
              type="submit"
              disabled={loading || success}
              className="w-full py-4 text-lg font-bold"
            >
              {loading ? t("auth.sending_link") : t("auth.send_reset_link")}
            </Button>
          </div>
        </form>

        <div className="flex justify-end">
          <Link href="/login" className="text-primary text-sm font-medium hover:underline">
            {t("common.back_to_login")}
          </Link>
        </div>
      </div>
    </div>
  );
}
