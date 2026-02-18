"use client";

import { Button } from "@/app/components/ui/Button";
import { Input } from "@/app/components/ui/Input";
import { PasswordInput } from "@/app/components/ui/PasswordInput";
import { useTranslation } from "@/app/i18n/useTranslation";
import { useAuthStore } from "@/app/store/authStore";
import { signUpAction } from "@/lib/db/auth-actions";
import Link from "next/link";
import { useEffect } from "react";

export default function RegisterPage() {
  const { registerForm, setRegisterField, resetRegisterForm } = useAuthStore();
  const { email, name, password, error, loading, success } = registerForm;
  const { t } = useTranslation();

  useEffect(() => {
    return () => resetRegisterForm();
  }, [resetRegisterForm]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegisterField("loading", true);
    setRegisterField("error", "");

    try {
      const result = await signUpAction({
        email,
        name,
        password,
        origin: window.location.origin,
      });

      if (result.error) {
        setRegisterField("error", result.error);
      } else {
        setRegisterField("success", true);
      }
    } catch (_: any) {
      setRegisterField("error", t("auth.unexpected_error"));
    } finally {
      setRegisterField("loading", false);
    }
  };

  if (success) {
    return (
      <div className="bg-app-bg flex min-h-screen flex-col items-center justify-center p-6 text-center">
        <div className="border-border-light bg-app-bg w-full max-w-md space-y-6 rounded-3xl border p-10 shadow-2xl">
          <h2 className="text-text-main text-3xl font-bold">{t("auth.check_email")}</h2>
          <p className="text-text-muted mt-2">
            {t("auth.verification_sent", { email })} {t("auth.verify_note")}
          </p>
          <div className="mt-8">
            <Link href="/login">
              <Button className="w-full py-4 text-lg font-bold">{t("auth.go_to_login")}</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-app-bg flex min-h-full flex-col items-center justify-center p-4 px-6">
      <div className="border-border-light bg-app-bg w-full max-w-md space-y-6 rounded-3xl border sm:p-10 p-6 shadow-2xl">
        <div className="text-center">
          <h2 className="text-text-main sm:mt-6 mt-4 text-3xl font-bold">{t("auth.create_account")}</h2>
          <p className="text-text-muted mt-2">{t("auth.join_us")}</p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="rounded-xl bg-red-500/10 p-4 text-center text-sm font-medium text-red-500">
              {error}
            </div>
          )}
          <div className="space-y-4">
            <Input
              id="name"
              name="name"
              type="text"
              label={t("auth.full_name")}
              required
              value={name}
              onChange={(e) => setRegisterField("name", e.target.value)}
              placeholder="John Doe"
            />
            <Input
              id="email"
              name="email"
              type="email"
              label={t("auth.email_address")}
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setRegisterField("email", e.target.value)}
              placeholder="you@example.com"
            />
            <PasswordInput
              id="password"
              name="password"
              label={t("auth.password")}
              autoComplete="new-password"
              required
              value={password}
              onChange={(e) => setRegisterField("password", e.target.value)}
              placeholder="••••••••"
            />
          </div>

          <div>
            <Button type="submit" disabled={loading} className="w-full py-4 text-lg font-bold">
              {loading ? t("auth.creating_account") : t("auth.register")}
            </Button>
          </div>
        </form>

        <p className="text-text-muted text-center text-sm">
          {t("auth.already_have_account")
            .split("{n}")
            .map((part: string, index: number, array: string[]) => (
              <span key={index}>
                {part}
                {index < array.length - 1 && (
                  <Link href="/login" className="text-primary font-semibold hover:underline">
                    {t("auth.sign_in")}
                  </Link>
                )}
              </span>
            ))}
        </p>
      </div>
    </div>
  );
}
