"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

export function DeleteBuildingButton({ buildingId }: { buildingId: string }) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    if (!confirm("Bu binayı kaldırmak istediğinize emin misiniz?")) return;
    setDeleting(true);
    const supabase = createClient();
    const { error } = await supabase.from("buildings").delete().eq("id", buildingId);
    setDeleting(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Building removed.");
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={deleting}
      className="inline-flex items-center gap-1.5 px-3 py-1.5 sm:px-3 sm:py-2 rounded-lg sm:rounded-xl border border-red-200 text-red-700 text-xs sm:text-sm font-semibold hover:bg-red-50 hover:border-red-300 disabled:opacity-50 transition-colors"
    >
      <i className="las la-trash text-sm" aria-hidden />
      {deleting ? "..." : "Delete"}
    </button>
  );
}
