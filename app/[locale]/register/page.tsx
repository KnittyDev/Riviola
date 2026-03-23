"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { createClient } from "@/lib/supabase/client";

export default function RegisterPage() {
  const t = useTranslations("Register");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password !== confirmPassword) return;
    setError(null);
    setLoading(true);
    try {
      const supabase = createClient();
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: fullName } },
      });
      if (signUpError) {
        setError(
          signUpError.message.includes("already registered")
            ? t("emailRegistered")
            : signUpError.message
        );
        setLoading(false);
        return;
      }
      if (data.user && !data.session) {
        setError(null);
        window.location.href = "/login?registered=1";
        return;
      }
      if (data.session && data.user) {
        window.location.href = "/dashboard/staff";
        return;
      }
      setLoading(false);
    } catch (err) {
      setError(t("genericError"));
      setLoading(false);
    }
  }

  const passwordsMatch = !confirmPassword || password === confirmPassword;

  return (
    <div className="min-h-screen bg-[#f9fafb] flex flex-col">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-3">
            <Image
              src="/mainlogo.png"
              alt="Riviola"
              width={40}
              height={40}
              className="size-10 rounded-xl object-contain shrink-0"
              priority
            />
            <span className="text-xl font-extrabold tracking-tight text-[#134e4a]">
              Riviola
            </span>
          </Link>
          <Link
            href="/"
            className="text-sm font-semibold text-gray-600 hover:text-[#134e4a] transition-colors"
          >
            {t("backHome")}
          </Link>
        </div>
      </header>

      {/* Form */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 sm:p-8">
            <div className="text-center mb-8">
              <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">
                {t("title")}
              </h1>
              <p className="text-gray-500 text-sm mt-2">
                {t("subtitle")}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label
                  htmlFor="fullName"
                  className="block text-sm font-semibold text-gray-700 mb-1.5"
                >
                  {t("fullName")}
                </label>
                <div className="relative">
                  <i
                    className="las la-user absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-lg"
                    aria-hidden
                  />
                  <input
                    id="fullName"
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Alex Sterling"
                    required
                    autoComplete="name"
                    className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#134e4a]/20 focus:border-[#134e4a] transition-all"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-semibold text-gray-700 mb-1.5"
                >
                  {t("email")}
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
                  {t("password")}
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
                    minLength={8}
                    autoComplete="new-password"
                    className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#134e4a]/20 focus:border-[#134e4a] transition-all"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="confirmPassword"
                  className="block text-sm font-semibold text-gray-700 mb-1.5"
                >
                  {t("confirmPassword")}
                </label>
                <div className="relative">
                  <i
                    className="las la-lock absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-lg"
                    aria-hidden
                  />
                  <input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    minLength={8}
                    autoComplete="new-password"
                    className={`w-full pl-11 pr-4 py-3 rounded-xl border text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#134e4a]/20 transition-all ${
                      confirmPassword && !passwordsMatch
                        ? "border-red-300 focus:border-red-500"
                        : "border-gray-200 focus:border-[#134e4a]"
                    }`}
                  />
                  {confirmPassword && !passwordsMatch && (
                    <p className="text-red-600 text-xs mt-1.5">{t("passwordsDoNotMatch")}</p>
                  )}
                </div>
              </div>

              {error && (
              <p className="text-red-600 text-sm text-center" role="alert">
                {error}
              </p>
            )}
              <button
                type="submit"
                disabled={!passwordsMatch || loading}
                className="w-full py-3.5 rounded-xl bg-[#134e4a] text-white font-bold text-sm hover:bg-[#115e59] disabled:opacity-50 disabled:pointer-events-none transition-colors shadow-lg shadow-[#134e4a]/20"
              >
                {loading ? t("creatingAccount") : t("createAccount")}
              </button>
            </form>

            <p className="text-center text-gray-500 text-sm mt-6">
              {t("alreadyHaveAccount")}{" "}
              <Link href="/login" className="font-semibold text-[#134e4a] hover:underline">
                {t("signIn")}
              </Link>
            </p>
          </div>

          <p className="text-center text-gray-500 text-xs mt-6">
            {t("agreement")}
          </p>
        </div>
      </main>
    </div>
  );
}
