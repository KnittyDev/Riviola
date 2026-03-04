"use client";

import Link from "next/link";
import { useState } from "react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    // TODO: connect to auth (e.g. Supabase, NextAuth)
    window.location.href = "/dashboard";
  }

  return (
    <div className="min-h-screen bg-[#f9fafb] flex flex-col">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="size-10 flex items-center justify-center rounded-xl bg-[#134e4a] text-white">
              <i className="las la-building text-2xl" aria-hidden />
            </div>
            <span className="text-xl font-extrabold tracking-tight text-[#134e4a]">
              Riviola
            </span>
          </Link>
          <Link
            href="/"
            className="text-sm font-semibold text-gray-600 hover:text-[#134e4a] transition-colors"
          >
            Back to home
          </Link>
        </div>
      </header>

      {/* Form */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 sm:p-8">
            <div className="text-center mb-8">
              <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">
                Sign in
              </h1>
              <p className="text-gray-500 text-sm mt-2">
                Enter your credentials to access your account.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-semibold text-gray-700 mb-1.5"
                >
                  Email
                </label>
                <div className="relative">
                  <i
                    className="las la-envelope absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-lg"
                    aria-hidden
                  />
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@company.com"
                    required
                    autoComplete="email"
                    className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#134e4a]/20 focus:border-[#134e4a] transition-all"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-semibold text-gray-700 mb-1.5"
                >
                  Password
                </label>
                <div className="relative">
                  <i
                    className="las la-lock absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-lg"
                    aria-hidden
                  />
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    autoComplete="current-password"
                    className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#134e4a]/20 focus:border-[#134e4a] transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 rounded-xl bg-[#134e4a] text-white font-bold text-sm hover:bg-[#115e59] transition-colors shadow-lg shadow-[#134e4a]/20"
              >
                Sign in
              </button>
            </form>
          </div>

          <p className="text-center text-gray-500 text-xs mt-6">
            By signing in, you agree to our Terms of Service and Privacy Policy.
          </p>
        </div>
      </main>
    </div>
  );
}
