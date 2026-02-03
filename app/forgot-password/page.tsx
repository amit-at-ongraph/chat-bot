"use client";

import { Button } from "@/app/components/ui/Button";
import { Input } from "@/app/components/ui/Input";
import Link from "next/link";
import { useState } from "react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Something went wrong");
      }

      setSuccess(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-app-bg flex min-h-screen flex-col items-center justify-center p-6">
      <div className="border-border-light bg-app-bg w-full max-w-md space-y-8 rounded-3xl border p-10 shadow-2xl">
        <div className="text-center">
          <h2 className="text-text-main mt-6 text-3xl font-bold">Reset Password</h2>
          <p className="text-text-muted mt-2">Enter your email to receive a reset link</p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="rounded-xl bg-red-500/10 p-4 text-center text-sm font-medium text-red-500">
              {error}
            </div>
          )}
          {success && (
            <div className="rounded-xl bg-green-500/10 p-4 text-center text-sm font-medium text-green-500">
              Check your email for the reset link!
            </div>
          )}
          
          <div className="space-y-4">
            <Input
              id="email"
              name="email"
              type="email"
              label="Email Address"
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
              {loading ? "Sending Link..." : "Send Reset Link"}
            </Button>
          </div>
        </form>

        <div className="flex justify-end">
          <Link
            href="/login"
            className="text-primary text-sm font-medium hover:underline"
          >
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
}
