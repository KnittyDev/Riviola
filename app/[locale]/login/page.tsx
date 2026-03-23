"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { createClient } from "@/lib/supabase/client";

function LoginForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const t = useTranslations("Login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [registeredMessage, setRegisteredMessage] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    if (searchParams.get("registered") === "1") setRegisteredMessage(true);
  }, [searchParams]);

  useEffect(() => {
    async function checkUser() {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setCheckingAuth(false);
          return;
        }

        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .single();

        const role = profile?.role ?? "investor";
        if (role === "staff" || role === "admin") {
          router.replace("/dashboard/staff");
        } else {
          router.replace("/dashboard");
        }
      } catch (err) {
        setCheckingAuth(false);
      }
    }
    checkUser();
  }, [router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const supabase = createClient();
      const { data, error: signInError } = await supabase.auth.signInWithPassword({ email, password });
      if (signInError) {
        setError(
          signInError.message === "Invalid login credentials"
            ? t("invalidCredentials")
            : signInError.message
        );
        setLoading(false);
        return;
      }
      if (!data?.user) {
        setError(t("signInFailed"));
        setLoading(false);
        return;
      }
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", data.user.id)
        .single();
      const role = profile?.role ?? "investor";
      if (role === "staff" || role === "admin") {
        window.location.href = "/dashboard/staff";
      } else {
        window.location.href = "/dashboard";
      }
    } catch (err) {
      setError(t("genericError"));
      setLoading(false);
    }
  }

  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-[#f9fafb] flex items-center justify-center">
        <i className="las la-spinner animate-spin text-3xl text-[#134e4a]" aria-hidden />
      </div>
    );
  }

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
              {registeredMessage && (
                <p className="text-[#134e4a] text-sm mt-2 font-medium">
                  {t("registered")}
                </p>
              )}
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
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
                    autoComplete="current-password"
                    className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#134e4a]/20 focus:border-[#134e4a] transition-all"
                  />
                </div>
              </div>

              {error && (
              <p className="text-red-600 text-sm text-center" role="alert">
                {error}
              </p>
            )}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-xl bg-[#134e4a] text-white font-bold text-sm hover:bg-[#115e59] disabled:opacity-70 transition-colors shadow-lg shadow-[#134e4a]/20"
              >
                {loading ? t("signingIn") : t("signIn")}
              </button>
            </form>

            <p className="text-center text-gray-500 text-sm mt-6">
              {t("noAccount")}{" "}
              <Link href="/register" className="font-semibold text-[#134e4a] hover:underline">
                {t("createAccount")}
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

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#f9fafb] flex items-center justify-center">
        <i className="las la-spinner animate-spin text-3xl text-[#134e4a]" aria-hidden />
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}
