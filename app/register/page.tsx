"use client";

import { Button } from "@/app/components/ui/Button";
import { Input } from "@/app/components/ui/Input";
import { PasswordInput } from "@/app/components/ui/PasswordInput";
import { useAuthStore } from "@/app/store/authStore";
import { signUpAction } from "@/lib/db/auth-actions";
import Link from "next/link";
import { useEffect } from "react";

export default function RegisterPage() {
  const { registerForm, setRegisterField, resetRegisterForm } = useAuthStore();
  const { email, name, password, error, loading, success } = registerForm;

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
      setRegisterField("error", "An unexpected error occurred");
    } finally {
      setRegisterField("loading", false);
    }
  };

  if (success) {
    return (
      <div className="bg-app-bg flex min-h-screen flex-col items-center justify-center p-6 text-center">
        <div className="border-border-light bg-app-bg w-full max-w-md space-y-8 rounded-3xl border p-10 shadow-2xl">
          <h2 className="text-text-main text-3xl font-bold">Check your email</h2>
          <p className="text-text-muted mt-2">
            {"We've sent a verification link to "}
            <span className="text-text-main font-semibold">{email}</span>. Please verify your email
            to finish setting up your account.
          </p>
          <div className="mt-8">
            <Link href="/login">
              <Button className="w-full py-4 text-lg font-bold">Go to Login</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-app-bg flex min-h-screen flex-col items-center justify-center p-6">
      <div className="border-border-light bg-app-bg w-full max-w-md space-y-8 rounded-3xl border p-10 shadow-2xl">
        <div className="text-center">
          <h2 className="text-text-main mt-6 text-3xl font-bold">Create Account</h2>
          <p className="text-text-muted mt-2">Join us today!</p>
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
              label="Full Name"
              required
              value={name}
              onChange={(e) => setRegisterField("name", e.target.value)}
              placeholder="John Doe"
            />
            <Input
              id="email"
              name="email"
              type="email"
              label="Email Address"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setRegisterField("email", e.target.value)}
              placeholder="you@example.com"
            />
            <PasswordInput
              id="password"
              name="password"
              label="Password"
              autoComplete="new-password"
              required
              value={password}
              onChange={(e) => setRegisterField("password", e.target.value)}
              placeholder="••••••••"
            />
          </div>

          <div>
            <Button type="submit" disabled={loading} className="w-full py-4 text-lg font-bold">
              {loading ? "Creating account..." : "Register"}
            </Button>
          </div>
        </form>

        <p className="text-text-muted text-center text-sm">
          Already have an account?{" "}
          <Link href="/login" className="text-primary font-semibold hover:underline">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}
