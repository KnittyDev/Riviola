"use client";

import { useEffect, useMemo, useState } from "react";
import { PhoneInput } from "react-international-phone";
import "react-international-phone/style.css";
import { createClient } from "@/lib/supabase/client";
import type { Profile, ProfileUpdate, ProfileRole } from "@/lib/supabase/types";

const LANGUAGE_OPTIONS = [
  { value: "en" as const, label: "English" },
  { value: "tr" as const, label: "Turkish" },
];

const CURRENCY_OPTIONS = [
  { value: "EUR" as const, label: "EUR (€)" },
  { value: "USD" as const, label: "USD ($)" },
  { value: "GBP" as const, label: "GBP (£)" },
  { value: "TRY" as const, label: "TRY (₺)" },
  { value: "CHF" as const, label: "CHF (Fr)" },
  { value: "AUD" as const, label: "AUD (A$)" },
  { value: "CAD" as const, label: "CAD (C$)" },
  { value: "NOK" as const, label: "NOK (kr)" },
  { value: "SEK" as const, label: "SEK (kr)" },
  { value: "AED" as const, label: "AED (د.إ)" },
  { value: "SAR" as const, label: "SAR (﷼)" },
  { value: "ALL" as const, label: "ALL (L)" },
];

const ROLE_LABELS: Record<ProfileRole, string> = {
  investor: "Investor",
  staff: "Staff",
  admin: "Admin",
};

function normalizePhone(s: string): string {
  return (s ?? "").replace(/\D/g, "").trim();
}

export function ProfileSettingsForm() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [initialProfile, setInitialProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [companyName, setCompanyName] = useState<string | null>(null);

  const form = useMemo(() => {
    if (!profile) return null;
    return {
      full_name: profile.full_name ?? "",
      email: profile.email ?? "",
      phone: profile.phone ?? "",
      language: profile.language ?? "en",
      currency: profile.currency ?? "EUR",
      notify_payments: profile.notify_payments ?? true,
      notify_milestones: profile.notify_milestones ?? true,
      notify_documents: profile.notify_documents ?? false,
    };
  }, [profile]);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) {
        setLoading(false);
        setError("Not signed in.");
        return;
      }
      supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single()
        .then(({ data, error: fetchError }) => {
          setLoading(false);
          if (fetchError) {
            setError(fetchError.message);
            return;
          }
          const p = data as Profile;
          setProfile(p);
          setInitialProfile(p);
          if (p?.company_id) {
            supabase
              .from("companies")
              .select("name")
              .eq("id", p.company_id)
              .single()
              .then(({ data: company }) => setCompanyName(company?.name ?? null));
          } else {
            setCompanyName(null);
          }
        });
    });
  }, []);

  useEffect(() => {
    if (!saved) return;
    const t = window.setTimeout(() => setSaved(false), 2000);
    return () => clearTimeout(t);
  }, [saved]);

  const hasChanges = useMemo(() => {
    if (!initialProfile || !form) return false;
    return (
      (form.full_name || "").trim() !== (initialProfile.full_name ?? "").trim() ||
      normalizePhone(form.phone) !== normalizePhone(initialProfile.phone ?? "") ||
      form.language !== (initialProfile.language ?? "en") ||
      form.currency !== (initialProfile.currency ?? "EUR") ||
      Boolean(form.notify_payments) !== Boolean(initialProfile.notify_payments ?? true) ||
      Boolean(form.notify_milestones) !== Boolean(initialProfile.notify_milestones ?? true) ||
      Boolean(form.notify_documents) !== Boolean(initialProfile.notify_documents ?? false)
    );
  }, [initialProfile, form]);

  function update<K extends keyof NonNullable<typeof form>>(key: K, value: NonNullable<typeof form>[K]) {
    if (!profile) return;
    setProfile({
      ...profile,
      [key]: value,
    });
  }

  async function onSave() {
    if (!profile || !form) return;
    setSaving(true);
    setError(null);
    const supabase = createClient();
    const updatePayload: ProfileUpdate = {
      full_name: form.full_name || null,
      phone: form.phone || null,
      language: form.language,
      currency: form.currency,
      notify_payments: form.notify_payments,
      notify_milestones: form.notify_milestones,
      notify_documents: form.notify_documents,
    };
    const { error: updateError } = await supabase
      .from("profiles")
      .update(updatePayload)
      .eq("id", profile.id);
    setSaving(false);
    if (updateError) {
      setError(updateError.message);
      return;
    }
    const updated = profile ? { ...profile, ...updatePayload } : null;
    setProfile(updated);
    setInitialProfile(updated);
    setSaved(true);
  }

  if (loading) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 max-w-4xl flex items-center justify-center min-h-[40vh]">
        <i className="las la-spinner animate-spin text-3xl text-[#134e4a]" aria-hidden />
      </div>
    );
  }

  if (error && !profile) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 max-w-4xl">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  if (!form) return null;

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8 animate-fade-in">
        <div>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-gray-900">
            Profile settings
          </h1>
          <p className="text-gray-500 mt-2">
            Update your profile details and preferences.
          </p>
        </div>
        <button
          type="button"
          onClick={onSave}
          disabled={!hasChanges || saving}
          className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-[#134e4a] text-white font-semibold hover:bg-[#115e59] disabled:opacity-40 disabled:pointer-events-none transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
        >
          <i className="las la-save text-lg" aria-hidden />
          {saved ? "Saved" : saving ? "Saving..." : "Save changes"}
        </button>
      </div>

      {error && (
        <p className="text-red-600 text-sm mb-4" role="alert">
          {error}
        </p>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-1">Profile</h2>
          <p className="text-sm text-gray-500 mb-6">These details appear on your account.</p>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1" htmlFor="fullName">
                Full name
              </label>
              <input
                id="fullName"
                value={form.full_name}
                onChange={(e) => update("full_name", e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#134e4a] focus:ring-2 focus:ring-[#134e4a]/20 outline-none transition-colors"
                placeholder="Your name"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1" htmlFor="email">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={form.email}
                readOnly
                aria-readonly="true"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-500 outline-none"
                placeholder="name@example.com"
              />
              <p className="text-xs text-gray-400 mt-1">Email is managed by your account.</p>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1" htmlFor="phone">
                Phone
              </label>
              <div className="w-full [&_.react-international-phone-input-container]:!w-full [&_.react-international-phone-input]:!w-full [&_.react-international-phone-input]:!rounded-xl [&_.react-international-phone-input]:!border-gray-200 [&_.react-international-phone-input]:!px-4 [&_.react-international-phone-input]:!py-3 [&_.react-international-phone-input]:!text-sm">
                <PhoneInput
                  defaultCountry="tr"
                  value={form.phone}
                  onChange={(value) => update("phone", value)}
                  inputProps={{ id: "phone", name: "phone", placeholder: "+90 5xx xxx xx xx" }}
                />
              </div>
            </div>
            {(profile?.role === "staff" || profile?.role === "admin") && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Company</label>
                <p className="text-sm text-gray-700 py-2">
                  {companyName ?? "—"}
                </p>
                <p className="text-xs text-gray-400">Your company is linked via your account; staff panel shows this company.</p>
              </div>
            )}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Role</label>
              <p className="text-sm text-gray-700 py-2">
                {profile ? ROLE_LABELS[profile.role] : "—"}
              </p>
              <p className="text-xs text-gray-400">Your role determines which dashboard you can access.</p>
            </div>
          </div>
        </div>

        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-1">Preferences</h2>
            <p className="text-sm text-gray-500 mb-6">Control how Riviola behaves for you.</p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1" htmlFor="language">
                  Language
                </label>
                <select
                  id="language"
                  value={form.language}
                  onChange={(e) => update("language", e.target.value as "en" | "tr")}
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm font-semibold text-gray-700 bg-white focus:border-[#134e4a] focus:ring-2 focus:ring-[#134e4a]/20 outline-none"
                >
                  {LANGUAGE_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1" htmlFor="currency">
                  Currency
                </label>
                {profile?.role === "investor" ? (
                  <div className="py-2">
                    <p className="text-sm text-gray-700 font-medium">
                      {form.currency}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      Your currency is managed by staff and cannot be changed here.
                    </p>
                  </div>
                ) : (
                  <select
                    id="currency"
                    value={form.currency}
                    onChange={(e) =>
                      update(
                        "currency",
                        e.target.value as
                          | "EUR"
                          | "USD"
                          | "GBP"
                          | "TRY"
                          | "CHF"
                          | "AUD"
                          | "CAD"
                          | "NOK"
                          | "SEK"
                          | "AED"
                          | "SAR"
                      )
                    }
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm font-semibold text-gray-700 bg-white focus:border-[#134e4a] focus:ring-2 focus:ring-[#134e4a]/20 outline-none"
                  >
                    {CURRENCY_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-1">Notifications</h2>
            <p className="text-sm text-gray-500 mb-6">Choose what we should email you about.</p>

            <div className="space-y-3">
              {[
                {
                  key: "notify_payments" as const,
                  title: "Payments & fees",
                  desc: "Aidat due dates, confirmations, and failed payments.",
                },
                {
                  key: "notify_milestones" as const,
                  title: "Milestones",
                  desc: "Updates when progress milestones are logged.",
                },
                {
                  key: "notify_documents" as const,
                  title: "Documents",
                  desc: "New invoices and shared files.",
                },
              ].map((n) => (
                <label
                  key={n.key}
                  className="flex items-start justify-between gap-4 rounded-xl border border-gray-200 p-4 hover:bg-gray-50/50 transition-colors cursor-pointer"
                >
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{n.title}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{n.desc}</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={form[n.key]}
                    onChange={(e) => update(n.key, e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 accent-[#134e4a] focus:ring-2 focus:ring-[#134e4a]/20 focus:ring-offset-0 mt-1"
                  />
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
