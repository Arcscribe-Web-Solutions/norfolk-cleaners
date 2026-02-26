"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BsBoxArrowInRight, BsExclamationTriangle, BsEye, BsEyeSlash } from "react-icons/bs";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!email || !password) {
      setError("Please enter your email and password.");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.error ?? "Invalid email or password.");
        setLoading(false);
        return;
      }

      // Redirect to the originally requested page, or /dashboard
      const params = new URLSearchParams(window.location.search);
      const redirect = params.get("redirect") || "/dashboard";
      router.push(redirect);
    } catch {
      setError("Unable to connect. Please try again.");
      setLoading(false);
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

      {/* Login Card */}
      <div className="rounded-sm border border-gray-300 bg-white p-6 sm:p-8 shadow-sm">
        <div className="mb-8">
          <h1 className="text-sm font-bold text-gray-800 text-center uppercase tracking-wide">
            Sign In
          </h1>
          <p className="text-[11px] text-gray-500 text-center mt-1">
            Enter your credentials to continue
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email */}
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

          {/* Password */}
          <div>
            <label htmlFor="password" className="block text-[11px] font-semibold text-gray-600 mb-1">
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full rounded-sm border border-gray-300 px-2.5 py-1.5 pr-10 text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-[12px] transition-colors"
                placeholder="••••••••"
              />
              <button
                type="button"
                tabIndex={-1}
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600 transition-colors"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <BsEyeSlash className="h-4 w-4" />
                ) : (
                  <BsEye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          {/* Remember me + Forgot password */}
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="h-3.5 w-3.5 rounded-sm border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-[12px] text-gray-600">Remember me</span>
            </label>
            <Link
              href="/forgot-password"
              className="text-[12px] font-medium text-blue-600 hover:text-blue-700 transition-colors"
            >
              Forgot password?
            </Link>
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-center gap-2 rounded-sm bg-red-50 border border-red-200 px-2.5 py-2 text-[12px] text-red-700">
              <BsExclamationTriangle className="h-4 w-4 shrink-0" />
              {error}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-sm bg-[#2563eb] px-4 py-2 text-[12px] font-bold text-white shadow-sm transition-colors hover:bg-blue-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Signing in…
              </span>
            ) : (
              <>
                <BsBoxArrowInRight className="h-4 w-4" />
                Sign in
              </>
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="relative mt-8">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-200" />
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="bg-white px-3 text-slate-400">Managed by</span>
          </div>
        </div>

        <p className="mt-4 text-center text-xs text-slate-400">
          <a
            href="https://arcscribe.co.uk"
            target="_blank"
            rel="noopener noreferrer"
                className="font-medium text-gray-500 hover:text-blue-600 transition-colors"
          >
            Arcscribe Web Solutions
          </a>
        </p>
      </div>

      <p className="mt-6 text-center text-[10px] text-gray-400">
        &copy; {new Date().getFullYear()} Norfolk Cleaners. All rights reserved.
      </p>
    </div>
  );
}
