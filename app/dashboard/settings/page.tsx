"use client";

import { useEffect, useMemo, useState } from "react";

type ProfileSettings = {
  fullName: string;
  email: string;
  phone: string;
  company: string;
  language: "English" | "Turkish";
  currency: "EUR" | "USD" | "GBP";
  notifyPayments: boolean;
  notifyMilestones: boolean;
  notifyDocuments: boolean;
};

const STORAGE_KEY = "riviola.profile_settings.v1";

function safeParseJson<T>(value: string | null): T | null {
  if (!value) return null;
  try {
    return JSON.parse(value) as T;
  } catch {
    return null;
  }
}

const defaults: ProfileSettings = {
  fullName: "Alex Sterling",
  email: "alex.sterling@example.com",
  phone: "",
  company: "Riviola Investor",
  language: "English",
  currency: "EUR",
  notifyPayments: true,
  notifyMilestones: true,
  notifyDocuments: false,
};

export default function SettingsPage() {
  const [form, setForm] = useState<ProfileSettings>(defaults);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const parsed = safeParseJson<ProfileSettings>(window.localStorage.getItem(STORAGE_KEY));
    if (parsed) setForm({ ...defaults, ...parsed });
  }, []);

  useEffect(() => {
    if (!saved) return;
    const t = window.setTimeout(() => setSaved(false), 2000);
    return () => clearTimeout(t);
  }, [saved]);

  const hasChanges = useMemo(() => {
    const stored = safeParseJson<ProfileSettings>(window.localStorage.getItem(STORAGE_KEY));
    const baseline = stored ? { ...defaults, ...stored } : defaults;
    const pickEditable = (s: ProfileSettings) => ({
      fullName: s.fullName,
      phone: s.phone,
      language: s.language,
      currency: s.currency,
      notifyPayments: s.notifyPayments,
      notifyMilestones: s.notifyMilestones,
      notifyDocuments: s.notifyDocuments,
    });
    return JSON.stringify(pickEditable(form)) !== JSON.stringify(pickEditable(baseline));
  }, [form]);

  function update<K extends keyof ProfileSettings>(key: K, value: ProfileSettings[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function onSave() {
    // Email & company are managed fields (read-only in UI)
    const payload: ProfileSettings = {
      ...form,
      email: defaults.email,
      company: defaults.company,
    };
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    setSaved(true);
  }

  return (
    <div className="p-8 max-w-4xl">
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
          disabled={!hasChanges}
          className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-[#134e4a] text-white font-semibold hover:bg-[#115e59] disabled:opacity-40 disabled:pointer-events-none transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
        >
          <i className="las la-save text-lg" aria-hidden />
          {saved ? "Saved" : "Save changes"}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Profile */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-1">Profile</h2>
          <p className="text-sm text-gray-500 mb-6">These details appear on your investor account.</p>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1" htmlFor="fullName">Full name</label>
              <input
                id="fullName"
                value={form.fullName}
                onChange={(e) => update("fullName", e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#134e4a] focus:ring-2 focus:ring-[#134e4a]/20 outline-none transition-colors"
                placeholder="Your name"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1" htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                value={form.email}
                readOnly
                aria-readonly="true"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-500 outline-none"
                placeholder="name@example.com"
              />
              <p className="text-xs text-gray-400 mt-1">Email can&apos;t be changed.</p>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1" htmlFor="phone">Phone</label>
              <input
                id="phone"
                value={form.phone}
                onChange={(e) => update("phone", e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#134e4a] focus:ring-2 focus:ring-[#134e4a]/20 outline-none transition-colors"
                placeholder="+90 5xx xxx xx xx"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1" htmlFor="company">Company</label>
              <input
                id="company"
                value={form.company}
                readOnly
                aria-readonly="true"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-500 outline-none"
                placeholder="Company name"
              />
              <p className="text-xs text-gray-400 mt-1">Company is managed by your organisation.</p>
            </div>
          </div>
        </div>

        {/* Preferences */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-1">Preferences</h2>
            <p className="text-sm text-gray-500 mb-6">Control how Riviola behaves for you.</p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1" htmlFor="language">Language</label>
                <select
                  id="language"
                  value={form.language}
                  onChange={(e) => update("language", e.target.value as ProfileSettings["language"])}
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm font-semibold text-gray-700 bg-white focus:border-[#134e4a] focus:ring-2 focus:ring-[#134e4a]/20 outline-none"
                >
                  <option value="English">English</option>
                  <option value="Turkish">Turkish</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1" htmlFor="currency">Currency</label>
                <select
                  id="currency"
                  value={form.currency}
                  onChange={(e) => update("currency", e.target.value as ProfileSettings["currency"])}
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm font-semibold text-gray-700 bg-white focus:border-[#134e4a] focus:ring-2 focus:ring-[#134e4a]/20 outline-none"
                >
                  <option value="EUR">EUR (€)</option>
                  <option value="USD">USD ($)</option>
                  <option value="GBP">GBP (£)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Notifications */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-1">Notifications</h2>
            <p className="text-sm text-gray-500 mb-6">Choose what we should email you about.</p>

            <div className="space-y-3">
              {[
                {
                  key: "notifyPayments" as const,
                  title: "Payments & fees",
                  desc: "Aidat due dates, confirmations, and failed payments.",
                },
                {
                  key: "notifyMilestones" as const,
                  title: "Milestones",
                  desc: "Updates when progress milestones are logged.",
                },
                {
                  key: "notifyDocuments" as const,
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
                    className="h-4 w-4 rounded border-gray-300 text-[#134e4a] focus:ring-2 focus:ring-[#134e4a]/20 focus:ring-offset-0 mt-1"
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

