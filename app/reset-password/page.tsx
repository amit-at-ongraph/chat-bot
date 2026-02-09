"use client";

import { Button } from "@/app/components/ui/Button";
import { PasswordInput } from "@/app/components/ui/PasswordInput";
import axios from "axios";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import React, { Suspense, useState } from "react";
import { useTranslation } from "@/app/i18n/useTranslation";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const code = searchParams.get("code");
  const { t } = useTranslation();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [accessToken, setAccessToken] = useState("");
  const [refreshToken, setRefreshToken] = useState("");
  const [isHashChecked, setIsHashChecked] = useState(false);

  // Checking for hash parameters (implicit flow)
  React.useEffect(() => {
    const hash = window.location.hash;
    if (hash) {
      const params = new URLSearchParams(hash.replace("#", "?"));
      const accessTokenParam = params.get("access_token");
      const refreshTokenParam = params.get("refresh_token");
      const errorParam = params.get("error");
      const errorDescription = params.get("error_description");

      if (errorParam) {
        setError(errorDescription || errorParam);
      } else if (accessTokenParam) {
        setAccessToken(accessTokenParam);
        if (refreshTokenParam) setRefreshToken(refreshTokenParam);
      }
    }
    setIsHashChecked(true);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (password !== confirmPassword) {
      setError(t("auth.passwords_dont_match"));
      setLoading(false);
      return;
    }

    if (!code && !accessToken) {
      setError(t("auth.link_expired"));
      setLoading(false);
      return;
    }

    try {
      await axios.post("/api/auth/update-password", {
        code,
        accessToken,
        refreshToken,
        password,
      });

      setSuccess(true);
      setTimeout(() => {
        router.push("/login");
      }, 2000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!code && !accessToken) {
    if (!isHashChecked) {
      return (
        <div className="flex min-h-[300px] flex-col items-center justify-center">
          <div className="border-primary h-8 w-8 animate-spin rounded-full border-4 border-t-transparent"></div>
          <p className="text-text-muted mt-4">{t("auth.verifying_link")}</p>
        </div>
      );
    }

    return (
      <div className="text-center">
        <h2 className="text-text-main mt-6 text-2xl font-bold">{t("auth.invalid_link")}</h2>
        <p className="text-text-muted mt-2">{t("auth.link_expired")}</p>
        {/** Debug info for user/dev */}
        <p className="mt-2 text-xs text-red-400">{t("common.error")}: Missing auth code or access token.</p>
        <div className="mt-6">
          <Link href="/forgot-password" className="text-primary font-semibold hover:underline">
            {t("auth.request_new_link")}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="border-border-light bg-app-bg w-full max-w-md space-y-8 rounded-3xl border p-10 shadow-2xl">
      <div className="text-center">
        <h2 className="text-text-main mt-6 text-3xl font-bold">{t("auth.set_new_password")}</h2>
        <p className="text-text-muted mt-2">{t("auth.enter_new_password")}</p>
      </div>

      <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
        {error && (
          <div className="rounded-xl bg-red-500/10 p-4 text-center text-sm font-medium text-red-500">
            {error}
          </div>
        )}
        {success && (
          <div className="rounded-xl bg-green-500/10 p-4 text-center text-sm font-medium text-green-500">
            {t("auth.password_updated")}
          </div>
        )}

        <div className="space-y-4">
          <PasswordInput
            id="password"
            name="password"
            label={t("auth.new_password")}
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            disabled={loading || success}
          />
          <PasswordInput
            id="confirmPassword"
            name="confirmPassword"
            label={t("auth.confirm_password")}
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="••••••••"
            disabled={loading || success}
          />
        </div>

        <div>
          <Button
            type="submit"
            disabled={loading || success}
            className="w-full py-4 text-lg font-bold"
          >
            {loading ? t("auth.updating") : t("auth.update_password")}
          </Button>
        </div>
      </form>
    </div>
  );
}

export default function ResetPasswordPage() {
  const { t } = useTranslation();
  return (
    <div className="bg-app-bg flex min-h-screen flex-col items-center justify-center p-6">
      <Suspense fallback={<div>{t("common.loading")}</div>}>
        <ResetPasswordForm />
      </Suspense>
    </div>
  );
}
