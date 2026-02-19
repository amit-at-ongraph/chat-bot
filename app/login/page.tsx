"use client";

import { Button } from "@/app/components/ui/Button";
import { Input } from "@/app/components/ui/Input";
import { PasswordInput } from "@/app/components/ui/PasswordInput";
import { useTranslation } from "@/app/i18n/useTranslation";
import { useAuthStore } from "@/app/store/authStore";
import { AUTH_CONFIG } from "@/config";
import { signIn } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/upload";
  const { t } = useTranslation();

  const { loginForm, setLoginField, resetLoginForm } = useAuthStore();
  const { email, password, error, loading } = loginForm;

  useEffect(() => {
    return () => resetLoginForm();
  }, [resetLoginForm]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginField("loading", true);
    setLoginField("error", "");

    try {
      const result = await signIn("credentials", {
        redirect: false,
        email,
        password,
        callbackUrl,
      });

      console.log(result);

      if (result?.error) {
        setLoginField("error", result.error);
      } else {
        resetLoginForm();
        router.push(callbackUrl);
        router.refresh();
      }
    } catch (_err: any) {
      setLoginField("error", t("auth.unexpected_error"));
    } finally {
      setLoginField("loading", false);
    }
  };

  return (
    <div className="bg-app-bg flex min-h-full flex-col items-center justify-center p-4 px-6">
      <div className="border-border-light bg-app-bg w-full max-w-md space-y-6 rounded-3xl border p-6 shadow-2xl sm:p-10">
        {AUTH_CONFIG.USER_AUTH_ENABLED && <div className="text-center">
          <h2 className="text-text-main mt-4 text-3xl font-bold sm:mt-6">
            {t("auth.welcome_back")}
          </h2>
          <p className="text-text-muted mt-2">{t("auth.sign_in_title")}</p>
        </div>
}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="rounded-xl bg-red-500/10 p-4 text-center text-sm font-medium text-red-500">
              {error}
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
              onChange={(e) => setLoginField("email", e.target.value)}
              placeholder="you@example.com"
            />
            <PasswordInput
              id="password"
              name="password"
              label={t("auth.password")}
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setLoginField("password", e.target.value)}
              placeholder="••••••••"
            />
            {AUTH_CONFIG.FORGOT_PASSWORD_ENABLED && <div className="flex justify-end">
              <Link
                href="/forgot-password"
                className="text-primary text-sm font-medium hover:underline"
              >
                {t("auth.forgot_password")}
              </Link>
            </div>}
          </div>

          <div>
            <Button type="submit" disabled={loading} className="w-full py-4 text-lg font-bold">
              {loading ? t("auth.signing_in") : t("auth.sign_in")}
            </Button>
          </div>
        </form>

        {AUTH_CONFIG.GOOGLE_LOGIN_ENABLED && (
          <>
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="border-border-light w-full border-t"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-app-bg text-text-muted px-2">{t("auth.or_continue_with")}</span>
              </div>
            </div>

            <div className="mt-6">
              <Button
                onClick={() => signIn("google", { callbackUrl })}
                variant="ghost"
                className="border-border-base text-text-main hover:bg-muted flex w-full items-center justify-center gap-3 border py-3 font-semibold"
              >
                <Image
                  src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                  alt="Google"
                  className="h-5 w-5"
                  width={24}
                  height={24}
                />
                {t("auth.google")}
              </Button>
            </div>
          </>
        )}

        {
          AUTH_CONFIG.REGISTER_ENABLED && (
            <p className="text-text-muted text-center text-sm">
              {t("auth.dont_have_account")}{" "}
              <Link href="/register" className="text-primary font-semibold hover:underline">
                {t("auth.register_here")}
              </Link>
            </p>
          )
        }
      </div>
    </div>
  );
}
