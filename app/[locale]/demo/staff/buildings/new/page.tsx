"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import type { BuildingStatus, PlannedMilestone } from "@/lib/staffBuildingOverrides";
import { LocationSelector } from "@/components/dashboard/staff/LocationSelector";
import { useTranslations } from "next-intl";

const inputClass =
  "w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#134e4a] focus:ring-2 focus:ring-[#134e4a]/20 outline-none transition-colors";
const labelClass = "block text-sm font-semibold text-gray-700 mb-1";

export default function NewBuildingPage() {
  const t = useTranslations("Demo.buildings.addPage");
  const [blocks, setBlocks] = useState<string[]>(["Block A"]);
  const [newBlockName, setNewBlockName] = useState("");
  const [status, setStatus] = useState<BuildingStatus>("Planned");
  const [plannedMilestones, setPlannedMilestones] = useState<PlannedMilestone[]>([]);
  const [nextMilestoneId, setNextMilestoneId] = useState<string | null>(null);
  const [country, setCountry] = useState("");
  const [city, setCity] = useState("");

  const sortedPlanned = useMemo(() => plannedMilestones, [plannedMilestones]);

  function newId() {
    if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
    return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  }

  const DRAFT_KEY = "riviola.demo.new_building_draft.v1";
  useEffect(() => {
    const raw = window.localStorage.getItem(DRAFT_KEY);
    if (!raw) return;
    try {
      const draft = JSON.parse(raw) as {
        status?: BuildingStatus;
        plannedMilestones?: PlannedMilestone[];
        nextMilestoneId?: string | null;
        country?: string;
        city?: string;
      };
      if (draft.status) setStatus(draft.status);
      if (Array.isArray(draft.plannedMilestones)) setPlannedMilestones(draft.plannedMilestones);
      if (typeof draft.nextMilestoneId === "string" || draft.nextMilestoneId === null) {
        setNextMilestoneId(draft.nextMilestoneId ?? null);
      }
      if (typeof draft.country === "string") setCountry(draft.country);
      if (typeof draft.city === "string") setCity(draft.city);
    } catch {
      // ignore draft errors
    }
  }, []);

  useEffect(() => {
    const draft = { status, plannedMilestones, nextMilestoneId, country, city };
    window.localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
  }, [status, plannedMilestones, nextMilestoneId, country, city]);

  function addBlock() {
    const defaultBlockName = `Block ${String.fromCharCode(65 + blocks.length)}`;
    const name = newBlockName.trim() || defaultBlockName;
    if (!blocks.includes(name)) {
      setBlocks((prev) => [...prev, name]);
      setNewBlockName("");
    }
  }

  function removeBlock(index: number) {
    setBlocks((prev) => prev.filter((_, i) => i !== index));
  }

  function updateBlock(index: number, value: string) {
    setBlocks((prev) => prev.map((b, i) => (i === index ? value : b)));
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
      <Link
        href="/demo/staff"
        className="inline-flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-[#134e4a] mb-6"
      >
        <i className="las la-arrow-left" aria-hidden />
        {t("back")}
      </Link>
      <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">
        {t("title")}
      </h1>
      <p className="text-gray-500 mt-1 mb-8">
        {t("description")}
      </p>
      <form
        className="space-y-6 bg-white rounded-2xl border border-gray-200 p-6 shadow-sm"
        onSubmit={(e) => e.preventDefault()}
      >
        <div>
          <label htmlFor="name" className={labelClass}>
            {t("form.name")}
          </label>
          <input
            id="name"
            name="name"
            type="text"
            placeholder={t("form.namePlaceholder")}
            className={inputClass}
          />
        </div>
        <LocationSelector
          selectedCountry={country}
          selectedCity={city}
          onCountryChange={setCountry}
          onCityChange={setCity}
        />

        <div>
          <label htmlFor="location" className={labelClass}>
            {t("form.address")}
          </label>
          <input
            id="location"
            name="location"
            type="text"
            placeholder={t("form.addressPlaceholder")}
            className={inputClass}
          />
        </div>

        <div>
          <span className={labelClass}>{t("form.status")}</span>
          <p className="text-xs text-gray-500 mb-3">
            {t("form.statusHint")}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {(
              [
                { value: "Planned", icon: "las la-calendar", tone: "bg-sky-100 text-sky-700" },
                { value: "In progress", icon: "las la-hourglass-half", tone: "bg-amber-100 text-amber-700" },
                { value: "At risk", icon: "las la-exclamation-triangle", tone: "bg-red-100 text-red-700" },
                { value: "On hold", icon: "las la-pause-circle", tone: "bg-gray-100 text-gray-700" },
                { value: "Completed", icon: "las la-check-circle", tone: "bg-emerald-100 text-emerald-700" },
                { value: "Cancelled", icon: "las la-times-circle", tone: "bg-zinc-100 text-zinc-700" },
              ] as const
            ).map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setStatus(opt.value)}
                className={`relative flex items-center gap-3 rounded-xl border-2 p-4 text-left transition-all duration-200 ${status === opt.value
                    ? "border-[#134e4a] bg-[#134e4a]/5 shadow-sm shadow-[#134e4a]/10"
                    : "border-gray-200 hover:border-gray-300 hover:bg-gray-50/50"
                  }`}
              >
                <span className={`flex size-10 shrink-0 items-center justify-center rounded-lg ${opt.tone}`}>
                  <i className={`${opt.icon} text-xl`} aria-hidden />
                </span>
                <div className="min-w-0">
                  <span className="block text-sm font-semibold text-gray-900">{t(`form.statusOptions.${opt.value}.label`)}</span>
                  <span className="block text-xs text-gray-500 mt-0.5">{t(`form.statusOptions.${opt.value}.helper`)}</span>
                </div>
                {status === opt.value && (
                  <span className="absolute top-3 right-3 flex size-5 items-center justify-center rounded-full bg-[#134e4a]">
                    <i className="las la-check text-xs text-white" aria-hidden />
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        <hr className="border-gray-200" />

        <div>
          <span className={labelClass}>{t("form.blocks")}</span>
          <p className="text-xs text-gray-500 mb-2">
            {t("form.blocksHint")}
          </p>
          <ul className="space-y-2 mb-2">
            {blocks.map((block, index) => (
              <li key={index} className="flex items-center gap-2">
                <input
                  type="text"
                  name={`block-${index}`}
                  value={block}
                  onChange={(e) => updateBlock(index, e.target.value)}
                  className={inputClass}
                  placeholder="e.g. Block A"
                />
                <button
                  type="button"
                  onClick={() => removeBlock(index)}
                  disabled={blocks.length <= 1}
                  className="shrink-0 p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 disabled:opacity-50 disabled:pointer-events-none transition-colors"
                  aria-label="Remove block"
                >
                  <i className="las la-times text-lg" aria-hidden />
                </button>
              </li>
            ))}
          </ul>
          <div className="flex gap-2">
            <input
              type="text"
              value={newBlockName}
              onChange={(e) => setNewBlockName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addBlock())}
              placeholder={t("form.newBlockPlaceholder")}
              className={inputClass}
            />
            <button
              type="button"
              onClick={addBlock}
              className="shrink-0 px-4 py-3 rounded-xl border border-gray-200 text-gray-700 font-semibold hover:bg-gray-50 transition-colors"
            >
              {t("form.addBlock")}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="floors" className={labelClass}>
              {t("form.floors")}
            </label>
            <input id="floors" name="floors" type="number" min={1} max={99} placeholder={t("form.floorsPlaceholder")} className={inputClass} />
          </div>
          <div>
            <label htmlFor="units" className={labelClass}>
              {t("form.units")}
            </label>
            <input id="units" name="units" type="number" min={1} placeholder={t("form.unitsPlaceholder")} className={inputClass} />
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 p-5 bg-gray-50/40">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-gray-900">{t("form.milestones.title")}</p>
              <p className="text-xs text-gray-500 mt-1">{t("form.milestones.subtitle")}</p>
            </div>
            <button
              type="button"
              onClick={() => setPlannedMilestones((prev) => [...prev, { id: newId(), title: "", dateTimeLocal: "" }])}
              className="shrink-0 px-3 py-2 rounded-xl border border-gray-200 bg-white text-gray-700 text-sm font-semibold hover:bg-gray-50 transition-colors"
            >
              <i className="las la-plus text-base" aria-hidden /> {t("form.milestones.add")}
            </button>
          </div>
          <div className="mt-4 space-y-3">
            {sortedPlanned.length === 0 ? (
              <div className="rounded-xl bg-white border border-gray-200 p-4 text-sm text-gray-500">{t("form.milestones.empty")}</div>
            ) : (
              sortedPlanned.map((m, idx) => {
                const isNext = nextMilestoneId ? nextMilestoneId === m.id : idx === 0;
                return (
                  <div key={m.id} className="rounded-xl bg-white border border-gray-200 p-4">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                      <button
                        type="button"
                        onClick={() => setNextMilestoneId(m.id)}
                        className={`shrink-0 inline-flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-semibold transition-colors ${isNext ? "border-[#134e4a] bg-[#134e4a]/5 text-[#134e4a]" : "border-gray-200 text-gray-600 hover:bg-gray-50"
                          }`}
                      >
                        <i className="las la-flag text-sm" aria-hidden /> {t("form.milestones.next")}
                      </button>
                      <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">{t("form.milestones.milestoneTitle")}</label>
                          <input
                            type="text"
                            value={m.title}
                            onChange={(e) => setPlannedMilestones((prev) => prev.map((x) => (x.id === m.id ? { ...x, title: e.target.value } : x)))}
                            placeholder={t("form.milestones.milestoneTitlePlaceholder")}
                            className={inputClass}
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">{t("form.milestones.targetDate")}</label>
                          <input
                            type="datetime-local"
                            value={m.dateTimeLocal}
                            onChange={(e) => setPlannedMilestones((prev) => prev.map((x) => (x.id === m.id ? { ...x, dateTimeLocal: e.target.value } : x)))}
                            className={inputClass}
                          />
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => { setPlannedMilestones((prev) => prev.filter((x) => x.id !== m.id)); if (nextMilestoneId === m.id) setNextMilestoneId(null); }}
                        className="shrink-0 p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                        aria-label="Remove milestone"
                      >
                        <i className="las la-times text-lg" aria-hidden />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <button type="submit" className="px-6 py-3 rounded-xl bg-[#134e4a] text-white font-semibold hover:bg-[#115e59] transition-colors">
            {t("form.submit")}
          </button>
          <Link href="/demo/staff" className="px-6 py-3 rounded-xl border border-gray-200 text-gray-700 font-semibold hover:bg-gray-50 transition-colors">
            {t("form.cancel")}
          </Link>
        </div>
      </form>
    </div>
  );
}
