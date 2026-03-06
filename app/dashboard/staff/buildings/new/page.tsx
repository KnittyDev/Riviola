"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { toast } from "@/lib/toast";
import type { BuildingStatus } from "@/lib/supabase/types";
import type { PlannedMilestone } from "@/lib/staffBuildingOverrides";
import { computeProgressFromMilestones } from "@/lib/buildings";

const BANNER_BUCKET = "building_banners";
const ACCEPT_IMAGE = "image/jpeg,image/png,image/webp";

const inputClass =
  "w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#134e4a] focus:ring-2 focus:ring-[#134e4a]/20 outline-none transition-colors";
const labelClass = "block text-sm font-semibold text-gray-700 mb-1";

export default function NewBuildingPage() {
  const router = useRouter();
  const [blocks, setBlocks] = useState<string[]>(["Block A"]);
  const [newBlockName, setNewBlockName] = useState("");
  const [status, setStatus] = useState<BuildingStatus>("Planned");
  const [plannedMilestones, setPlannedMilestones] = useState<PlannedMilestone[]>([]);
  const [currentMilestoneId, setCurrentMilestoneId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);

  const sortedPlanned = useMemo(() => plannedMilestones, [plannedMilestones]);

  useEffect(() => {
    if (!bannerFile) {
      setBannerPreview(null);
      return;
    }
    const url = URL.createObjectURL(bannerFile);
    setBannerPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [bannerFile]);

  function newId() {
    if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
    return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  }

  const DRAFT_KEY = "riviola.new_building_draft.v1";
  useEffect(() => {
    const raw = window.localStorage.getItem(DRAFT_KEY);
    if (!raw) return;
    try {
      const draft = JSON.parse(raw) as {
        status?: BuildingStatus;
        plannedMilestones?: PlannedMilestone[];
        currentMilestoneId?: string | null;
      };
      if (draft.status) setStatus(draft.status);
      if (Array.isArray(draft.plannedMilestones)) setPlannedMilestones(draft.plannedMilestones);
      if (typeof draft.currentMilestoneId === "string" || draft.currentMilestoneId === null) {
        setCurrentMilestoneId(draft.currentMilestoneId ?? null);
      }
    } catch {
      // ignore draft errors
    }
  }, []);

  useEffect(() => {
    const draft = { status, plannedMilestones, currentMilestoneId };
    window.localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
  }, [status, plannedMilestones, currentMilestoneId]);

  function addBlock() {
    const name = newBlockName.trim() || `Block ${String.fromCharCode(65 + blocks.length)}`;
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

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const form = e.currentTarget;
    const name = (form.querySelector('[name="name"]') as HTMLInputElement)?.value?.trim() ?? "";
    const location = (form.querySelector('[name="location"]') as HTMLInputElement)?.value?.trim() ?? "";
    const floors = parseInt((form.querySelector('[name="floors"]') as HTMLInputElement)?.value ?? "1", 10) || 1;
    const units = parseInt((form.querySelector('[name="units"]') as HTMLInputElement)?.value ?? "1", 10) || 1;
    if (!name) {
      setError("Building name is required.");
      return;
    }
    setSaving(true);
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setError("Not signed in.");
      setSaving(false);
      return;
    }
    const { data: profile } = await supabase
      .from("profiles")
      .select("company_id")
      .eq("id", user.id)
      .single();
    const companyId = profile?.company_id ?? null;
    if (!companyId) {
      setError("No company assigned. Set your company in profile settings.");
      setSaving(false);
      return;
    }
    const progress = computeProgressFromMilestones(plannedMilestones, currentMilestoneId);
    const { data: building, error: insertError } = await supabase
      .from("buildings")
      .insert({
        company_id: companyId,
        name,
        location: location || null,
        status,
        progress,
        units,
        floors,
        blocks: blocks.length ? blocks : ["Block A"],
        planned_milestones: plannedMilestones,
        current_milestone_id: currentMilestoneId,
      })
      .select("id")
      .single();
    if (insertError) {
      setSaving(false);
      setError(insertError.message);
      return;
    }
    let imageUrl: string | null = null;
    if (building && bannerFile) {
      const ext = bannerFile.name.split(".").pop()?.toLowerCase() || "jpg";
      const path = `${building.id}.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from(BANNER_BUCKET)
        .upload(path, bannerFile, { upsert: true, contentType: bannerFile.type });
      if (!uploadError) {
        const { data: urlData } = supabase.storage.from(BANNER_BUCKET).getPublicUrl(path);
        imageUrl = urlData.publicUrl;
        await supabase.from("buildings").update({ image_url: imageUrl }).eq("id", building.id);
      }
    }
    toast.success("Building created successfully.");
    setSaving(false);
    router.push(building ? `/dashboard/staff/buildings/${building.id}` : "/dashboard/staff/buildings");
    router.refresh();
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
      <Link
        href="/dashboard/staff"
        className="inline-flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-[#134e4a] mb-6"
      >
        <i className="las la-arrow-left" aria-hidden />
        Back to overview
      </Link>
      <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">
        Add building
      </h1>
      <p className="text-gray-500 mt-1 mb-8">
        Create a new project or building record. Set block names, floors and units so investors can be assigned to specific units.
      </p>
      {error && (
        <p className="text-red-600 text-sm mb-4" role="alert">
          {error}
        </p>
      )}
      <form
        className="space-y-6 bg-white rounded-2xl border border-gray-200 p-6 shadow-sm"
        onSubmit={handleSubmit}
      >
        <div>
          <label htmlFor="name" className={labelClass}>
            Building / project name
          </label>
          <input
            id="name"
            name="name"
            type="text"
            placeholder="e.g. Avala Resort"
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="location" className={labelClass}>
            Location
          </label>
          <input
            id="location"
            name="location"
            type="text"
            placeholder="e.g. Adriatic Coast, Montenegro"
            className={inputClass}
          />
        </div>

        <div>
          <span className={labelClass}>Banner photo</span>
          <p className="text-xs text-gray-500 mb-2">
            Banner image for the building detail page. Recommended: wide image (e.g. 1200×400).
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
            {bannerPreview ? (
              <div className="relative w-full aspect-[3/1] max-h-48 rounded-lg overflow-hidden bg-gray-100 mb-3">
                <Image
                  src={bannerPreview}
                  alt="Banner preview"
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 640px"
                />
                <button
                  type="button"
                  onClick={() => setBannerFile(null)}
                  className="absolute top-2 right-2 size-8 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70"
                  aria-label="Remove photo"
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
              {bannerPreview ? "Change photo" : "Upload banner photo"}
            </label>
          </div>
        </div>

        <div>
          <span className={labelClass}>Status</span>
          <p className="text-xs text-gray-500 mb-3">
            Set the current state of this building/project.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {(
              [
                { value: "Planned", icon: "las la-calendar", helper: "Preparing to start", tone: "bg-sky-100 text-sky-700" },
                { value: "In progress", icon: "las la-hourglass-half", helper: "Construction ongoing", tone: "bg-amber-100 text-amber-700" },
                { value: "At risk", icon: "las la-exclamation-triangle", helper: "Needs attention", tone: "bg-red-100 text-red-700" },
                { value: "On hold", icon: "las la-pause-circle", helper: "Paused temporarily", tone: "bg-gray-100 text-gray-700" },
                { value: "Completed", icon: "las la-check-circle", helper: "Handover done", tone: "bg-emerald-100 text-emerald-700" },
                { value: "Cancelled", icon: "las la-times-circle", helper: "Stopped permanently", tone: "bg-zinc-100 text-zinc-700" },
              ] as const
            ).map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setStatus(opt.value)}
                className={`relative flex items-center gap-3 rounded-xl border-2 p-4 text-left transition-all duration-200 ${
                  status === opt.value
                    ? "border-[#134e4a] bg-[#134e4a]/5 shadow-sm shadow-[#134e4a]/10"
                    : "border-gray-200 hover:border-gray-300 hover:bg-gray-50/50"
                }`}
              >
                <span className={`flex size-10 shrink-0 items-center justify-center rounded-lg ${opt.tone}`}>
                  <i className={`${opt.icon} text-xl`} aria-hidden />
                </span>
                <div className="min-w-0">
                  <span className="block text-sm font-semibold text-gray-900">{opt.value}</span>
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

        <hr className="border-gray-200" />

        <div>
          <span className={labelClass}>Block names</span>
          <p className="text-xs text-gray-500 mb-2">
            Define the blocks or towers in this project (e.g. Block A, Tower East). These will be used when assigning investors to a unit.
          </p>
          <ul className="space-y-2 mb-2">
            {blocks.map((block, index) => (
              <li
                key={index}
                className="flex items-center gap-2"
              >
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
              placeholder="New block name"
              className={inputClass}
            />
            <button
              type="button"
              onClick={addBlock}
              className="shrink-0 px-4 py-3 rounded-xl border border-gray-200 text-gray-700 font-semibold hover:bg-gray-50 transition-colors"
            >
              Add block
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="floors" className={labelClass}>
              Number of floors
            </label>
            <input
              id="floors"
              name="floors"
              type="number"
              min={1}
              max={99}
              placeholder="e.g. 8"
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="units" className={labelClass}>
              Number of units
            </label>
            <input
              id="units"
              name="units"
              type="number"
              min={1}
              placeholder="e.g. 24"
              className={inputClass}
            />
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 p-5 bg-gray-50/40">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-gray-900">Milestone plan</p>
              <p className="text-xs text-gray-500 mt-1">Add milestones and select which one is current.</p>
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
              <i className="las la-plus text-base" aria-hidden /> Add milestone
            </button>
          </div>

          <div className="mt-4 space-y-3">
            {sortedPlanned.length === 0 ? (
              <div className="rounded-xl bg-white border border-gray-200 p-4 text-sm text-gray-500">
                No planned milestones yet.
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
                        className={`shrink-0 inline-flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-semibold transition-colors ${
                          isCurrent
                            ? "border-[#134e4a] bg-[#134e4a]/5 text-[#134e4a]"
                            : "border-gray-200 text-gray-600 hover:bg-gray-50"
                        }`}
                        aria-label="Set as current milestone"
                      >
                        <i className="las la-flag text-sm" aria-hidden />
                        Current
                      </button>
                      <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Title</label>
                          <input
                            type="text"
                            value={m.title}
                            onChange={(e) => {
                              const value = e.target.value;
                              setPlannedMilestones((prev) =>
                                prev.map((x) => (x.id === m.id ? { ...x, title: value } : x))
                              );
                            }}
                            placeholder="e.g. Roofing structure"
                            className={inputClass}
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Target date & time</label>
                          <input
                            type="datetime-local"
                            value={m.dateTimeLocal}
                            onChange={(e) => {
                              const value = e.target.value;
                              setPlannedMilestones((prev) =>
                                prev.map((x) => (x.id === m.id ? { ...x, dateTimeLocal: value } : x))
                              );
                            }}
                            className={inputClass}
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
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-3 rounded-xl bg-[#134e4a] text-white font-semibold hover:bg-[#115e59] disabled:opacity-50 transition-colors"
          >
            {saving ? "Adding..." : "Add building"}
          </button>
          <Link
            href="/dashboard/staff/buildings"
            className="px-6 py-3 rounded-xl border border-gray-200 text-gray-700 font-semibold hover:bg-gray-50 transition-colors"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
