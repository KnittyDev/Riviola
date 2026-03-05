"use client";

import { useState, useMemo, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

export type BuildingOption = {
  id: string;
  name: string;
  location: string | null;
  blocks: string[];
};

export function NewWeeklyPhotoForm({ buildings }: { buildings: BuildingOption[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selectedBuildingId, setSelectedBuildingId] = useState("");
  const [selectedBlocks, setSelectedBlocks] = useState<string[]>([]);
  const [dateRange, setDateRange] = useState("");
  const [weekLabel, setWeekLabel] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);

  useEffect(() => {
    const buildingId = searchParams.get("buildingId");
    if (buildingId && buildings.some((b) => b.id === buildingId)) {
      setSelectedBuildingId(buildingId);
    }
  }, [searchParams, buildings]);

  useEffect(() => {
    return () => {
      previews.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [previews]);

  const availableBlocks = useMemo(() => {
    if (!selectedBuildingId) return [];
    const b = buildings.find((x) => x.id === selectedBuildingId);
    return b?.blocks ?? [];
  }, [selectedBuildingId, buildings]);

  const handleBuildingChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedBuildingId(e.target.value);
    setSelectedBlocks([]);
  };

  const toggleBlock = (block: string) => {
    setSelectedBlocks((prev) =>
      prev.includes(block) ? prev.filter((b) => b !== block) : [...prev, block]
    );
  };

  const selectAllBlocks = () => {
    if (selectedBlocks.length === availableBlocks.length) {
      setSelectedBlocks([]);
    } else {
      setSelectedBlocks([...availableBlocks]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      const newPreviews = files.map((file) => URL.createObjectURL(file));
      setSelectedFiles((prev) => [...prev, ...files]);
      setPreviews((prev) => [...prev, ...newPreviews]);
    }
  };

  const removeFile = (index: number) => {
    URL.revokeObjectURL(previews[index]);
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    setIsSubmitting(true);
    const supabase = createClient();

    const { data: updateRow, error: insertUpdateError } = await supabase
      .from("building_weekly_updates")
      .insert({
        building_id: selectedBuildingId,
        week_label: weekLabel.trim() || null,
        date_range: dateRange.trim(),
        description: description.trim() || "",
        blocks: selectedBlocks,
      })
      .select("id")
      .single();

    if (insertUpdateError || !updateRow?.id) {
      setIsSubmitting(false);
      setSubmitError(insertUpdateError?.message ?? "Failed to create update.");
      toast.error(insertUpdateError?.message ?? "Failed to create update.");
      return;
    }

    const updateId = updateRow.id;
    const bucket = "weekly_photos";
    const basePath = `${selectedBuildingId}/${updateId}`;

    for (let i = 0; i < selectedFiles.length; i++) {
      const file = selectedFiles[i];
      const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
      const path = `${basePath}/${crypto.randomUUID()}.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(path, file, { contentType: file.type, upsert: false });
      if (uploadError) {
        setIsSubmitting(false);
        setSubmitError(uploadError.message);
        toast.error(`Upload failed: ${uploadError.message}`);
        return;
      }
      const { error: imgError } = await supabase
        .from("building_weekly_update_images")
        .insert({
          building_weekly_update_id: updateId,
          storage_path: path,
          alt: `Photo ${i + 1}`,
          sort_order: i,
        });
      if (imgError) {
        setIsSubmitting(false);
        setSubmitError(imgError.message);
        toast.error(`Failed to save image record: ${imgError.message}`);
        return;
      }
    }

    setIsSubmitting(false);
    toast.success("Weekly update uploaded successfully.");
    router.push("/dashboard/staff");
    router.refresh();
  };

  const canSubmit =
    selectedBuildingId &&
    selectedBlocks.length > 0 &&
    dateRange &&
    description &&
    selectedFiles.length > 0;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <Link
            href="/dashboard/staff"
            className="text-sm font-semibold text-gray-500 hover:text-[#134e4a] transition-colors flex items-center gap-1 mb-2"
          >
            <i className="las la-arrow-left" aria-hidden /> Back to dashboard
          </Link>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
            Add Weekly Photo
          </h1>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
          <label className="block text-sm font-bold text-gray-700 mb-2">
            Select Building
          </label>
          <select
            value={selectedBuildingId}
            onChange={handleBuildingChange}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#134e4a] focus:ring-2 focus:ring-[#134e4a]/15 outline-none transition-colors bg-white text-sm"
            required
          >
            <option value="">Select a project...</option>
            {buildings.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name} — {b.location || "—"}
              </option>
            ))}
          </select>
        </div>

        {selectedBuildingId && (
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm animate-fade-in-up">
            <div className="flex items-center justify-between mb-4">
              <label className="text-sm font-bold text-gray-700">
                Which block(s) is this for?
              </label>
              <button
                type="button"
                onClick={selectAllBlocks}
                className="text-xs font-bold text-[#134e4a] hover:underline"
              >
                {selectedBlocks.length === availableBlocks.length
                  ? "Deselect All"
                  : "Select All Blocks"}
              </button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {availableBlocks.map((block) => {
                const isSelected = selectedBlocks.includes(block);
                return (
                  <button
                    key={block}
                    type="button"
                    onClick={() => toggleBlock(block)}
                    className={`p-3 rounded-xl border-2 text-sm font-semibold transition-all text-center ${
                      isSelected
                        ? "border-[#134e4a] bg-[#134e4a]/5 text-[#134e4a]"
                        : "border-gray-100 bg-gray-50 text-gray-500 hover:border-gray-200"
                    }`}
                  >
                    {block}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Date Range (e.g. 13-20 Dec)
              </label>
              <input
                type="text"
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                placeholder="13-20 Dec 2024"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#134e4a] focus:ring-2 focus:ring-[#134e4a]/15 outline-none transition-colors text-sm"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Week Label
              </label>
              <input
                type="text"
                value={weekLabel}
                onChange={(e) => setWeekLabel(e.target.value)}
                placeholder="Week 51"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#134e4a] focus:ring-2 focus:ring-[#134e4a]/15 outline-none transition-colors text-sm"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Progress Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide a brief update on what's visible in the photos..."
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#134e4a] focus:ring-2 focus:ring-[#134e4a]/15 outline-none transition-colors text-sm min-h-[100px] resize-none"
              required
            />
          </div>
        </div>

        {previews.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 animate-fade-in-up">
            {previews.map((url, idx) => (
              <div
                key={url}
                className="relative aspect-square rounded-2xl overflow-hidden border border-gray-200 shadow-sm group"
              >
                <Image src={url} alt={`Preview ${idx + 1}`} fill className="object-cover" />
                <button
                  type="button"
                  onClick={() => removeFile(idx)}
                  className="absolute top-2 right-2 size-8 rounded-full bg-white/90 text-red-600 flex items-center justify-center shadow-lg transform scale-0 group-hover:scale-100 transition-transform duration-200 hover:bg-red-50"
                >
                  <i className="las la-times text-lg" />
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="bg-white rounded-2xl border-2 border-dashed border-gray-300 p-10 shadow-sm text-center hover:border-[#134e4a] transition-colors group">
          <div className="size-16 rounded-full bg-[#134e4a]/10 flex items-center justify-center mx-auto mb-4 text-[#134e4a] group-hover:bg-[#134e4a] group-hover:text-white transition-all">
            <i className="las la-cloud-upload-alt text-3xl" aria-hidden />
          </div>
          <p className="font-bold text-gray-900 text-lg">Upload photos</p>
          <p className="text-sm text-gray-500 mt-1 max-w-xs mx-auto">
            Click to browse or drag and drop your weekly update photos here.
          </p>
          <input
            type="file"
            multiple
            accept="image/*"
            className="hidden"
            id="photo-upload"
            onChange={handleFileChange}
          />
          <label
            htmlFor="photo-upload"
            className="mt-6 inline-flex items-center gap-2 px-8 py-3 rounded-xl bg-[#134e4a] text-white font-bold hover:bg-[#115e59] transition-all cursor-pointer shadow-md shadow-[#134e4a]/10 active:scale-95"
          >
            Select Files
          </label>
        </div>

        {submitError && (
          <p className="text-red-600 text-sm text-center" role="alert">
            {submitError}
          </p>
        )}

        <button
          type="submit"
          disabled={!canSubmit || isSubmitting}
          className="w-full py-4 rounded-2xl bg-[#134e4a] text-white font-bold hover:bg-[#115e59] disabled:opacity-40 disabled:pointer-events-none transition-all duration-200 shadow-lg shadow-[#134e4a]/20 text-lg"
        >
          {isSubmitting ? (
            <span className="flex items-center justify-center gap-2">
              <i className="las la-spinner animate-spin" aria-hidden />
              Submitting...
            </span>
          ) : (
            "Upload Weekly Update"
          )}
        </button>
      </form>
    </div>
  );
}
