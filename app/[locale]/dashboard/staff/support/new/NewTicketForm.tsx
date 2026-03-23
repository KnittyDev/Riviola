"use client";

import { useState } from "react";
import { useRouter } from "@/i18n/routing";
import { useTranslations } from "next-intl";
import { createClient } from "@/lib/supabase/client";
import { toast } from "@/lib/toast";
import Image from "next/image";

const ACCEPT_IMAGE = "image/jpeg,image/png,image/webp";

export function NewTicketForm() {
  const t = useTranslations("Support");
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState("");
  const [priority, setPriority] = useState("Medium");
  const [description, setDescription] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const newFiles = Array.from(e.target.files || []);
    setFiles((prev) => [...prev, ...newFiles]);
    
    const newPreviews = newFiles.map(file => URL.createObjectURL(file));
    setPreviews((prev) => [...prev, ...newPreviews]);
  }

  function removeFile(index: number) {
    URL.revokeObjectURL(previews[index]);
    setFiles((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (loading) return;
    setLoading(true);

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      toast.error("User not found");
      setLoading(false);
      return;
    }

    // 1. Upload images first
    const uploadedUrls: string[] = [];
    for (const file of files) {
      const ext = file.name.split(".").pop();
      const path = `${user.id}/${Date.now()}-${Math.random().toString(36).substring(2)}.${ext}`;
      const { data, error: uploadError } = await supabase.storage
        .from("support_tickets")
        .upload(path, file);

      if (uploadError) {
        console.error("Upload error:", uploadError);
        continue;
      }
      const { data: { publicUrl } } = supabase.storage.from("support_tickets").getPublicUrl(path);
      uploadedUrls.push(publicUrl);
    }

    // 2. Create ticket
    const { error: insertError } = await supabase.from("support_tickets").insert({
      profile_id: user.id,
      title,
      subject,
      priority,
      description,
      image_urls: uploadedUrls,
      status: "Open"
    });

    if (insertError) {
      toast.error(t("errorMessage"));
      setLoading(false);
      return;
    }

    toast.success(t("successMessage"));
    router.push("/dashboard/staff/support");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-8 shadow-sm">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="space-y-1.5">
            <label className="text-sm font-bold text-gray-700">{t("ticketTitle")}</label>
            <input
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#134e4a] focus:ring-4 focus:ring-[#134e4a]/10 outline-none transition-all placeholder:text-gray-400"
              placeholder="e.g. Password Reset"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-bold text-gray-700">{t("urgency")}</label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#134e4a] focus:ring-4 focus:ring-[#134e4a]/10 outline-none transition-all appearance-none bg-white"
            >
              <option value="Low">{t("low")}</option>
              <option value="Medium">{t("medium")}</option>
              <option value="High">{t("high")}</option>
              <option value="Urgent">{t("urgent")}</option>
            </select>
          </div>
        </div>

        <div className="mt-6 space-y-1.5">
          <label className="text-sm font-bold text-gray-700">{t("subject")}</label>
          <input
            required
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#134e4a] focus:ring-4 focus:ring-[#134e4a]/10 outline-none transition-all placeholder:text-gray-400"
            placeholder="e.g. Account Access"
          />
        </div>

        <div className="mt-6 space-y-1.5">
          <label className="text-sm font-bold text-gray-700">{t("description")}</label>
          <textarea
            required
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={5}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#134e4a] focus:ring-4 focus:ring-[#134e4a]/10 outline-none transition-all placeholder:text-gray-400 resize-none"
            placeholder="Please describe your issue in detail..."
          />
        </div>

        <div className="mt-6">
          <label className="text-sm font-bold text-gray-700 mb-2 block">{t("photo")}</label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {previews.map((preview, i) => (
              <div key={i} className="relative aspect-square rounded-xl overflow-hidden border border-gray-100 group">
                <Image src={preview} alt="preview" fill className="object-cover" />
                <button
                  type="button"
                  onClick={() => removeFile(i)}
                  className="absolute top-1 right-1 size-6 rounded-full bg-rose-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <i className="las la-times" />
                </button>
              </div>
            ))}
            <label className="aspect-square rounded-xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-[#134e4a] hover:bg-gray-50 transition-all group">
              <i className="las la-camera text-2xl text-gray-400 group-hover:text-[#134e4a]" />
              <span className="text-[10px] font-bold text-gray-400 group-hover:text-[#134e4a] uppercase tracking-wider">Add Photo</span>
              <input type="file" multiple accept={ACCEPT_IMAGE} onChange={handleFileChange} className="hidden" />
            </label>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-end gap-3 transition-all pt-2">
        <button
          type="button"
          onClick={() => router.back()}
          className="px-8 py-3 rounded-xl border border-gray-200 text-gray-600 font-bold text-sm hover:bg-gray-50 transition-colors"
        >
          {t("cancel")}
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-8 py-3 rounded-xl bg-[#134e4a] text-white font-bold text-sm hover:bg-[#115e59] disabled:opacity-50 transition-all shadow-lg shadow-[#134e4a]/10"
        >
          {loading ? t("sending") : t("send")}
        </button>
      </div>
    </form>
  );
}
