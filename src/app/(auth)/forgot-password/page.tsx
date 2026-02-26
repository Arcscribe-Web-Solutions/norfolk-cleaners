"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { BsArrowLeft, BsEnvelope, BsCheckCircle, BsExclamationTriangle } from "react-icons/bs";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "sent" | "error">("idle");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setStatus("loading");

    if (!email) {
      setError("Please enter your email address.");
      setStatus("idle");
      return;
    }

    try {
      // TODO: Replace with real password reset API call
      await new Promise((resolve) => setTimeout(resolve, 800));
      setStatus("sent");
    } catch {
      setError("Something went wrong. Please try again.");
      setStatus("error");
    }
  };

  return (
    <div className="w-full max-w-md">
      {/* Logo */}
      <div className="mb-10 flex justify-center">
        <Image
          src="/logo.png"
          alt="Norfolk Cleaners"
          width={240}
          height={52}
          className="h-12 w-auto"
          priority
        />
      </div>

      {/* Card */}
      <div className="rounded-sm border border-gray-300 bg-white p-6 sm:p-8 shadow-sm">
        {status === "sent" ? (
          /* Success state */
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-green-50">
              <BsCheckCircle className="h-7 w-7 text-green-500" />
            </div>
            <h1 className="text-xl font-semibold text-slate-900">Check your email</h1>
            <p className="mt-2 text-sm text-slate-500">
              We&apos;ve sent a password reset link to{" "}
              <span className="font-medium text-slate-700">{email}</span>.
              Check your inbox and follow the instructions.
            </p>
            <p className="mt-4 text-xs text-slate-400">
              Didn&apos;t receive it? Check your spam folder or try again.
            </p>
            <div className="mt-6 space-y-3">
              <button
                onClick={() => { setStatus("idle"); setEmail(""); }}
                className="flex w-full items-center justify-center gap-2 rounded-sm bg-[#2563eb] px-4 py-2 text-[12px] font-bold text-white shadow-sm transition-colors hover:bg-blue-700"
              >
                Try another email
              </button>
              <Link
                href="/"
                className="flex w-full items-center justify-center gap-2 rounded-sm border border-gray-300 px-4 py-2 text-[12px] font-semibold text-gray-700 transition-colors hover:bg-gray-50"
              >
                <BsArrowLeft className="h-4 w-4" />
                Back to sign in
              </Link>
            </div>
          </div>
        ) : (
          /* Form state */
          <>
            <div className="mb-8">
              <h1 className="text-sm font-bold text-gray-800 text-center uppercase tracking-wide">
                Reset your password
              </h1>
              <p className="text-[11px] text-gray-500 text-center mt-1">
                Enter your email and we&apos;ll send you a reset link.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label htmlFor="email" className="block text-[11px] font-semibold text-gray-600 mb-1">
                  Email address
                </label>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full rounded-sm border border-gray-300 px-2.5 py-1.5 text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-[12px] transition-colors"
                  placeholder="you@example.com"
                />
              </div>

              {error && (
                <div className="flex items-center gap-2 rounded-sm bg-red-50 border border-red-200 px-2.5 py-2 text-[12px] text-red-700">
                  <BsExclamationTriangle className="h-4 w-4 shrink-0" />
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={status === "loading"}
                className="flex w-full items-center justify-center gap-2 rounded-sm bg-[#2563eb] px-4 py-2 text-[12px] font-bold text-white shadow-sm transition-colors hover:bg-blue-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {status === "loading" ? (
                  <span className="flex items-center gap-2">
                    <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Sending…
                  </span>
                ) : (
                  <>
                    <BsEnvelope className="h-4 w-4" />
                    Send reset link
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 text-center">
              <Link
                href="/"
                className="inline-flex items-center gap-1.5 text-[12px] font-medium text-gray-500 hover:text-blue-600 transition-colors"
              >
                <BsArrowLeft className="h-3.5 w-3.5" />
                Back to sign in
              </Link>
            </div>
          </>
        )}
      </div>

      <p className="mt-6 text-center text-[10px] text-gray-400">
        &copy; {new Date().getFullYear()} Norfolk Cleaners. All rights reserved.
      </p>
    </div>
  );
}
