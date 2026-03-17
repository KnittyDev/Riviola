"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "@/lib/toast";
import type { BuildingStatus } from "@/lib/supabase/types";
import type { PlannedMilestone } from "@/lib/staffBuildingOverrides";
import { computeProgressFromMilestones } from "@/lib/buildings";
import { LocationSelector } from "@/components/dashboard/staff/LocationSelector";
import { useTranslations } from "next-intl";

const BANNER_BUCKET = "building_banners";
const ACCEPT_IMAGE = "image/jpeg,image/png,image/webp";

type Props = {
  id: string;
  defaultName: string;
  defaultLocation: string;
  defaultUnits: number;
  defaultStatus: BuildingStatus;
  defaultProgress: number;
  defaultBlocks: string[];
  defaultFloors: number;
  defaultImageUrl?: string | null;
  defaultCountry?: string | null;
  defaultCity?: string | null;
  defaultPlannedMilestones?: PlannedMilestone[];
  defaultCurrentMilestoneId?: string | null;
  defaultSustainabilityScore?: number;
  defaultSustainabilityFeatures?: string[];
  /** Base path for redirect/cancel (e.g. /dashboard/staff or /demo/staff). Defaults to /dashboard/staff. */
  basePath?: string;
};

const PREDEFINED_GREEN_FEATURES = [
  { id: "solar", labelKey: "Solar Panels", icon: "las la-solar-panel" },
  { id: "ev", labelKey: "EV Charging Stations", icon: "las la-charging-station" },
  { id: "rainwater", labelKey: "Rainwater Harvesting", icon: "las la-tint" },
  { id: "led", labelKey: "Energy Efficient Lighting", icon: "las la-lightbulb" },
  { id: "waste", labelKey: "Waste & Recycling Management", icon: "las la-recycle" },
  { id: "smart", labelKey: "Smart Home Tech", icon: "las la-home" },
  { id: "ventilation", labelKey: "Natural Ventilation", icon: "las la-wind" },
  { id: "garden", labelKey: "Green Roof / Sky Garden", icon: "las la-leaf" },
  { id: "insulation", labelKey: "Advanced Thermal Insulation", icon: "las la-thermometer-half" },
  { id: "materials", labelKey: "Eco-friendly Materials", icon: "las la-tree" },
  { id: "garden_design", labelKey: "Professional Garden Design", icon: "las la-seedling" },
  { id: "eco_infra", labelKey: "Eco-friendly Infrastructure", icon: "las la-cog" },
  { id: "pet_friendly", labelKey: "Pet Friendly Spaces", icon: "las la-paw" },
  { id: "bike", labelKey: "Secure Bicycle Parking", icon: "las la-bicycle" },
  { id: "hvac", labelKey: "High-efficiency HVAC", icon: "las la-fan" },
  { id: "water", labelKey: "Water-saving Fixtures", icon: "las la-water" },
];

function newId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

const DEFAULT_BASE = "/dashboard/staff";

export function EditBuildingForm({
  id,
  defaultName,
  defaultLocation,
  defaultUnits,
  defaultStatus,
  defaultProgress,
  defaultBlocks,
  defaultFloors,
  defaultImageUrl = null,
  defaultCountry = "",
  defaultCity = "",
  defaultPlannedMilestones = [],
  defaultCurrentMilestoneId = null,
  defaultSustainabilityScore = 0,
  defaultSustainabilityFeatures = [],
  basePath = DEFAULT_BASE,
}: Props) {
  const t = useTranslations("EditBuilding");
  const tStatus = useTranslations("StatusOptions");
  const tFeatures = useTranslations("SustainabilityFeatures");
  const router = useRouter();

  const statusOptions = useMemo(() => [
    {
      value: "Planned" as BuildingStatus,
      label: tStatus("Planned.label"),
      helper: tStatus("Planned.helper"),
      icon: "las la-calendar",
      toneClass: "bg-sky-100 text-sky-700",
    },
    {
      value: "In progress" as BuildingStatus,
      label: tStatus("In progress.label"),
      helper: tStatus("In progress.helper"),
      icon: "las la-hourglass-half",
      toneClass: "bg-amber-100 text-amber-700",
    },
    {
      value: "At risk" as BuildingStatus,
      label: tStatus("At risk.label"),
      helper: tStatus("At risk.helper"),
      icon: "las la-exclamation-triangle",
      toneClass: "bg-red-100 text-red-700",
    },
    {
      value: "On hold" as BuildingStatus,
      label: tStatus("On hold.label"),
      helper: tStatus("On hold.helper"),
      icon: "las la-pause-circle",
      toneClass: "bg-gray-100 text-gray-700",
    },
    {
      value: "Completed" as BuildingStatus,
      label: tStatus("Completed.label"),
      helper: tStatus("Completed.helper"),
      icon: "las la-check-circle",
      toneClass: "bg-emerald-100 text-emerald-700",
    },
    {
      value: "Cancelled" as BuildingStatus,
      label: tStatus("Cancelled.label"),
      helper: tStatus("Cancelled.helper"),
      icon: "las la-times-circle",
      toneClass: "bg-zinc-100 text-zinc-700",
    },
  ], [tStatus]);

  const [name, setName] = useState<string>(defaultName);
  const [location, setLocation] = useState<string>(defaultLocation);
  const [status, setStatus] = useState<BuildingStatus>(defaultStatus);
  const [units, setUnits] = useState<number>(defaultUnits);
  const [floors, setFloors] = useState<number>(defaultFloors);
  const [blocks, setBlocks] = useState<string[]>(defaultBlocks.length ? defaultBlocks : [t("defaultBlock")]);
  const [newBlockName, setNewBlockName] = useState("");
  const [country, setCountry] = useState<string>(defaultCountry ?? "");
  const [city, setCity] = useState<string>(defaultCity ?? "");
  const [plannedMilestones, setPlannedMilestones] = useState<PlannedMilestone[]>(defaultPlannedMilestones);
  const [currentMilestoneId, setCurrentMilestoneId] = useState<string | null>(defaultCurrentMilestoneId ?? null);
  const [sustainabilityFeatures, setSustainabilityFeatures] = useState<string[]>(defaultSustainabilityFeatures);

  const sustainabilityScore = useMemo(() => {
    // Each feature contributes a certain amount to the total score, capped at 100.
    // Simple logic: 7 points per feature (predefined or custom).
    return Math.min(100, sustainabilityFeatures.length * 7);
  }, [sustainabilityFeatures]);
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!bannerFile) {
      setBannerPreview(null);
      return;
    }
    const url = URL.createObjectURL(bannerFile);
    setBannerPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [bannerFile]);

  function addBlock() {
    const nameStr =
      newBlockName.trim() || `${t("defaultBlock")} ${String.fromCharCode(65 + blocks.length)}`;
    if (!blocks.includes(nameStr)) {
      setBlocks((prev) => [...prev, nameStr]);
      setNewBlockName("");
    }
  }

  function removeBlock(index: number) {
    setBlocks((prev) => prev.filter((_, i) => i !== index));
  }

  function toggleFeature(label: string) {
    if (sustainabilityFeatures.includes(label)) {
      setSustainabilityFeatures((prev) => prev.filter((f) => f !== label));
    } else {
      setSustainabilityFeatures((prev) => [...prev, label]);
    }
  }

  function updateBlock(index: number, value: string) {
    setBlocks((prev) => prev.map((b, i) => (i === index ? value : b)));
  }

  const sortedPlanned = useMemo(() => plannedMilestones, [plannedMilestones]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSaving(true);
    const supabase = createClient();
    let imageUrl: string | null | undefined = undefined;
    if (bannerFile) {
      const ext = bannerFile.name.split(".").pop()?.toLowerCase() || "jpg";
      const path = `${id}.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from(BANNER_BUCKET)
        .upload(path, bannerFile, { upsert: true, contentType: bannerFile.type });
      if (!uploadError) {
        const { data: urlData } = supabase.storage.from(BANNER_BUCKET).getPublicUrl(path);
        imageUrl = urlData.publicUrl;
      }
    }
    const progress = computeProgressFromMilestones(plannedMilestones, currentMilestoneId);
    const payload: Record<string, unknown> = {
      name: name.trim() || defaultName,
      location: location.trim() || null,
      country: country || null,
      city: city || null,
      status,
      progress,
      units,
      floors,
      blocks: blocks.length ? blocks : [t("defaultBlock")],
      planned_milestones: plannedMilestones,
      current_milestone_id: currentMilestoneId,
      sustainability_score: sustainabilityScore,
      sustainability_features: sustainabilityFeatures,
    };
    if (imageUrl !== undefined) payload.image_url = imageUrl;
    const { error: updateError } = await supabase.from("buildings").update(payload).eq("id", id);
    setSaving(false);
    if (updateError) {
      setError(updateError.message);
      return;
    }
    toast.success(t("saveSuccess"));
    router.push(`${basePath}/buildings/${id}`);
    router.refresh();
  }

  return (
    <form
      className="space-y-6 bg-white rounded-2xl border border-gray-200 p-6 shadow-sm"
      onSubmit={handleSubmit}
    >
      <input type="hidden" name="id" value={id} />
      {error && (
        <p className="text-red-600 text-sm mb-4" role="alert">
          {error}
        </p>
      )}
      <div>
        <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-1">
          {t("form.nameLabel")}
        </label>
        <input
          id="name"
          name="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={t("form.namePlaceholder")}
          className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#134e4a] focus:ring-2 focus:ring-[#134e4a]/20 outline-none transition-colors"
        />
      </div>
      <LocationSelector
        selectedCountry={country}
        selectedCity={city}
        onCountryChange={setCountry}
        onCityChange={setCity}
      />
      <div>
        <label htmlFor="location" className="block text-sm font-semibold text-gray-700 mb-1">
          {t("form.addressLabel")}
        </label>
        <input
          id="location"
          name="location"
          type="text"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder={t("form.addressPlaceholder")}
          className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#134e4a] focus:ring-2 focus:ring-[#134e4a]/20 outline-none transition-colors"
        />
      </div>
      <div>
        <span className="block text-sm font-semibold text-gray-700 mb-1">{t("form.bannerLabel")}</span>
        <p className="text-xs text-gray-500 mb-2">
          {t("form.bannerSubtitle")}
        </p>
        <div className="rounded-xl border-2 border-dashed border-gray-200 p-6 text-center bg-gray-50/50">
          <input
            id="banner"
            name="banner"
            type="file"
            accept={ACCEPT_IMAGE}
            className="hidden"
            onChange={(e) => setBannerFile(e.target.files?.[0] ?? null)}
          />
          {(bannerPreview || defaultImageUrl) ? (
            <div className="relative w-full aspect-[3/1] max-h-48 rounded-lg overflow-hidden bg-gray-100 mb-3">
              <Image
                src={bannerPreview || defaultImageUrl || ""}
                alt="Banner"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 640px"
              />
              <button
                type="button"
                onClick={() => setBannerFile(null)}
                className="absolute top-2 right-2 size-8 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70"
                aria-label={t("form.removePhoto")}
              >
                <i className="las la-times text-lg" aria-hidden />
              </button>
            </div>
          ) : null}
          <label
            htmlFor="banner"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#134e4a] text-white text-sm font-semibold hover:bg-[#115e59] cursor-pointer transition-colors"
          >
            <i className="las la-camera text-lg" aria-hidden />
            {bannerPreview || defaultImageUrl ? t("form.changePhoto") : t("form.uploadPhoto")}
          </label>
        </div>
      </div>
      <div>
        <label htmlFor="units" className="block text-sm font-semibold text-gray-700 mb-1">
          {t("form.unitsLabel")}
        </label>
        <input
          id="units"
          name="units"
          type="number"
          min={1}
          value={units}
          onChange={(e) => setUnits(Number(e.target.value))}
          placeholder={t("form.unitsPlaceholder")}
          className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#134e4a] focus:ring-2 focus:ring-[#134e4a]/20 outline-none transition-colors"
        />
      </div>

      <hr className="border-gray-200" />

      <div>
        <span className="block text-sm font-semibold text-gray-700 mb-1">{t("form.blocksLabel")}</span>
        <p className="text-xs text-gray-500 mb-3">
          {t("form.blocksSubtitle")}
        </p>
        <ul className="space-y-2 mb-3">
          {blocks.map((block, index) => (
            <li key={index} className="flex items-center gap-2">
              <input
                type="text"
                value={block}
                onChange={(e) => updateBlock(index, e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#134e4a] focus:ring-2 focus:ring-[#134e4a]/20 outline-none transition-colors"
                placeholder={t("form.blockPlaceholder")}
              />
              <button
                type="button"
                onClick={() => removeBlock(index)}
                disabled={blocks.length <= 1}
                className="shrink-0 p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 disabled:opacity-50 disabled:pointer-events-none transition-colors"
                aria-label={t("form.removeBlock")}
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
            placeholder={t("form.newBlockName")}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#134e4a] focus:ring-2 focus:ring-[#134e4a]/20 outline-none transition-colors"
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
          <label htmlFor="floors" className="block text-sm font-semibold text-gray-700 mb-1">
            {t("form.floorsLabel")}
          </label>
          <input
            id="floors"
            name="floors"
            type="number"
            min={1}
            max={99}
            value={floors}
            onChange={(e) => setFloors(Number(e.target.value))}
            placeholder={t("form.floorsPlaceholder")}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#134e4a] focus:ring-2 focus:ring-[#134e4a]/20 outline-none transition-colors"
          />
        </div>
        <div>
          <label htmlFor="unitsGrid" className="block text-sm font-semibold text-gray-700 mb-1">
            {t("form.unitsLabel")}
          </label>
          <input
            id="unitsGrid"
            type="number"
            min={1}
            value={units}
            onChange={(e) => setUnits(Number(e.target.value))}
            placeholder={t("form.unitsPlaceholder")}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#134e4a] focus:ring-2 focus:ring-[#134e4a]/20 outline-none transition-colors"
          />
        </div>
      </div>
      <div>
        <span className="block text-sm font-semibold text-gray-700 mb-3">{t("form.statusLabel")}</span>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {statusOptions.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setStatus(opt.value)}
              className={`relative flex items-center gap-3 rounded-xl border-2 p-4 text-left transition-all duration-200 ${status === opt.value
                ? "border-[#134e4a] bg-[#134e4a]/5 shadow-sm shadow-[#134e4a]/10"
                : "border-gray-200 hover:border-gray-300 hover:bg-gray-50/50"
                }`}
            >
              <span className={`flex size-10 shrink-0 items-center justify-center rounded-lg ${opt.toneClass}`}>
                <i className={`${opt.icon} text-xl`} aria-hidden />
              </span>
              <div className="min-w-0">
                <span className="block text-sm font-semibold text-gray-900">{opt.label}</span>
                <span className="block text-xs text-gray-500 mt-0.5">{opt.helper}</span>
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

      <div className="rounded-2xl border border-gray-200 p-5 bg-gray-50/40">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-gray-900">{t("form.milestonePlan")}</p>
            <p className="text-xs text-gray-500 mt-1">{t("form.milestoneSubtitle")}</p>
          </div>
          <button
            type="button"
            onClick={() =>
              setPlannedMilestones((prev) => [
                ...prev,
                { id: newId(), title: "", dateTimeLocal: "" },
              ])
            }
            className="shrink-0 px-3 py-2 rounded-xl border border-gray-200 bg-white text-gray-700 text-sm font-semibold hover:bg-gray-50 transition-colors"
          >
            <i className="las la-plus text-base" aria-hidden /> {t("form.addMilestone")}
          </button>
        </div>

        <div className="mt-4 space-y-3">
          {sortedPlanned.length === 0 ? (
            <div className="rounded-xl bg-white border border-gray-200 p-4 text-sm text-gray-500">
              {t("form.noMilestones")}
            </div>
          ) : (
            sortedPlanned.map((m) => {
              const isCurrent = currentMilestoneId === m.id;
              return (
                <div key={m.id} className="rounded-xl bg-white border border-gray-200 p-4">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setCurrentMilestoneId(m.id)}
                      className={`shrink-0 inline-flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-semibold transition-colors ${isCurrent
                        ? "border-[#134e4a] bg-[#134e4a]/5 text-[#134e4a]"
                        : "border-gray-200 text-gray-600 hover:bg-gray-50"
                        }`}
                      aria-label={t("form.setAsCurrent")}
                    >
                      <i className="las la-flag text-sm" aria-hidden />
                      {t("form.current")}
                    </button>
                    <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">{t("form.milestoneTitle")}</label>
                        <input
                          type="text"
                          value={m.title}
                          onChange={(e) => {
                            const value = e.target.value;
                            setPlannedMilestones((prev) =>
                              prev.map((x) => (x.id === m.id ? { ...x, title: value } : x))
                            );
                          }}
                          placeholder={t("form.milestoneTitlePlaceholder")}
                          className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:border-[#134e4a] focus:ring-2 focus:ring-[#134e4a]/20 outline-none transition-colors text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">{t("form.targetDate")}</label>
                        <input
                          type="datetime-local"
                          value={m.dateTimeLocal}
                          onChange={(e) => {
                            const value = e.target.value;
                            setPlannedMilestones((prev) =>
                              prev.map((x) => (x.id === m.id ? { ...x, dateTimeLocal: value } : x))
                            );
                          }}
                          className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:border-[#134e4a] focus:ring-2 focus:ring-[#134e4a]/20 outline-none transition-colors text-sm"
                        />
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setPlannedMilestones((prev) => prev.filter((x) => x.id !== m.id));
                        if (currentMilestoneId === m.id) setCurrentMilestoneId(null);
                      }}
                      className="shrink-0 p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                      aria-label={t("form.removeMilestone")}
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

      <div className="rounded-2xl border border-[#134e4a]/20 p-5 bg-emerald-50/20">
        <div className="flex items-start gap-4">
          <div className="size-10 rounded-xl bg-[#134e4a] text-white flex items-center justify-center shrink-0">
            <i className="las la-leaf text-xl" />
          </div>
          <div>
            <p className="text-sm font-bold text-gray-900">{t("form.sustainabilityDashboard")}</p>
            <p className="text-xs text-gray-500 mt-0.5">{t("form.sustainabilitySubtitle")}</p>
          </div>
        </div>

        <div className="mt-6 space-y-8">
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
              {t("form.greenScoreLabel")}
            </label>
            <div className="flex items-center gap-4">
              <div className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden text-center">
                <div 
                  className="h-full bg-[#134e4a] transition-all duration-500"
                  style={{ width: `${sustainabilityScore}%` }}
                />
              </div>
              <span className="shrink-0 size-12 flex items-center justify-center rounded-xl bg-white border-2 border-[#134e4a] text-lg font-bold text-[#134e4a] shadow-sm">
                {sustainabilityScore}
              </span>
            </div>
            <p className="text-[10px] text-gray-400 mt-2 italic">{t("form.greenScoreHint")}</p>
          </div>

          <div className="border-t border-[#134e4a]/10 pt-6">
            <span className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-4">{t("form.addFeatures")}</span>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 pr-1">
              {PREDEFINED_GREEN_FEATURES.map((feat) => {
                const isSelected = sustainabilityFeatures.includes(feat.labelKey);
                return (
                  <button
                    key={feat.id}
                    type="button"
                    onClick={() => toggleFeature(feat.labelKey)}
                    className={`flex items-start gap-2 p-2.5 rounded-xl border-2 text-left transition-all ${isSelected
                      ? "border-[#134e4a] bg-[#134e4a]/10 text-[#134e4a] font-bold"
                      : "border-gray-100 bg-white text-gray-500 hover:border-gray-200"
                      }`}
                  >
                    <span className={`size-7 rounded-lg flex items-center justify-center shrink-0 ${isSelected ? 'bg-[#134e4a] text-white' : 'bg-gray-50 text-gray-400 group-hover:bg-gray-100'}`}>
                      <i className={`${feat.icon} text-base`} />
                    </span>
                    <span className="text-[11px] leading-tight mt-0.5">{tFeatures(feat.labelKey)}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={saving}
          className="px-6 py-3 rounded-xl bg-[#134e4a] text-white font-semibold hover:bg-[#115e59] disabled:opacity-50 transition-colors"
        >
          {saving ? t("saving") : t("saveChanges")}
        </button>
        <Link
          href={`${basePath}/buildings/${id}`}
          className="px-6 py-3 rounded-xl border border-gray-200 text-gray-700 font-semibold hover:bg-gray-50 transition-colors"
        >
          {t("cancel")}
        </Link>
      </div>
    </form>
  );
}
