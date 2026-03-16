"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "@/lib/toast";
import {
  REQUEST_TYPES,
  requestTypeIcons,
  requestTypeColors,
  type RequestType,
  type RequestStatus,
} from "@/lib/staffRequestsData";
import type { InvestorRequestView } from "@/lib/investorRequests";
import { createInvestorRequestAction, cancelInvestorRequestAction } from "./actions";
import { createClient } from "@/lib/supabase/client";
import Image from "next/image";
import Lightbox from "yet-another-react-lightbox";
import Zoom from "yet-another-react-lightbox/plugins/zoom";
import "yet-another-react-lightbox/styles.css";

export type BuildingForDropdown = {
  building_id: string;
  name: string;
  location: string | null;
};

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

const STATUS_LABELS: Record<RequestStatus, string> = {
  Pending: "Pending",
  "In progress": "In progress",
  Done: "Done",
  Cancelled: "Cancelled",
};

function getStatusBadgeClass(status: RequestStatus): string {
  switch (status) {
    case "Done":
      return "bg-emerald-50 text-emerald-700";
    case "In progress":
      return "bg-amber-50 text-amber-700";
    case "Cancelled":
      return "bg-gray-100 text-gray-500";
    default:
      return "bg-gray-100 text-gray-600";
  }
}

type Props = {
  initialRequests: InvestorRequestView[];
  buildingsForDropdown: BuildingForDropdown[];
};

export function InvestorRequestsClient({
  initialRequests,
  buildingsForDropdown,
}: Props) {
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const [type, setType] = useState<RequestType>("Information");
  const [buildingId, setBuildingId] = useState("");
  const [note, setNote] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [requestToCancel, setRequestToCancel] = useState<InvestorRequestView | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [lightboxSlides, setLightboxSlides] = useState<{src: string; alt: string}[]>([]);
  
  // Filters
  const [statusFilter, setStatusFilter] = useState<RequestStatus | "All">("All");
  const [typeFilter, setTypeFilter] = useState<RequestType | "All">("All");
  const [buildingFilter, setBuildingFilter] = useState<string>("All");

  function openLightbox(urls: string[], index: number) {
    setLightboxSlides(urls.map(url => ({ src: url, alt: "Request attachment" })));
    setLightboxIndex(index);
    setLightboxOpen(true);
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
    }
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!buildingId.trim()) return;
    setError(null);
    setSubmitting(true);
    
    let imageUrls: string[] = [];
    if (files.length > 0) {
      const supabase = createClient();
      for (const file of files) {
        const ext = file.name.split(".").pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${ext}`;
        const { error: uploadError, data } = await supabase.storage
          .from("investor_requests")
          .upload(fileName, file);
        
        if (uploadError) {
          setError(`Failed to upload ${file.name}`);
          setSubmitting(false);
          return;
        }
        
        const { data: publicUrlData } = supabase.storage
          .from("investor_requests")
          .getPublicUrl(fileName);
          
        imageUrls.push(publicUrlData.publicUrl);
      }
    }

    const result = await createInvestorRequestAction(
      buildingId,
      type,
      note.trim() || undefined,
      imageUrls
    );
    setSubmitting(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    toast.success("Request submitted successfully.");
    setType("Information");
    setBuildingId("");
    setNote("");
    setFiles([]);
    setShowForm(false);
    router.refresh();
  }

  const canCancel = (status: RequestStatus) =>
    status === "Pending" || status === "In progress";

  function openCancelModal(req: InvestorRequestView) {
    if (!canCancel(req.status)) return;
    setRequestToCancel(req);
  }

  async function confirmCancel() {
    if (!requestToCancel) return;
    setCancellingId(requestToCancel.id);
    const result = await cancelInvestorRequestAction(requestToCancel.id);
    setRequestToCancel(null);
    setCancellingId(null);
    if (result.error) {
      toast.error(result.error);
      return;
    }
    toast.success("Request cancelled.");
    router.refresh();
  }

  const filteredRequests = initialRequests.filter((req) => {
    const matchStatus = statusFilter === "All" || req.status === statusFilter;
    const matchType = typeFilter === "All" || req.type === typeFilter;
    const matchBuilding = buildingFilter === "All" || req.buildingId === buildingFilter;
    return matchStatus && matchType && matchBuilding;
  });

  const pendingCount = filteredRequests.filter((r) => r.status === "Pending").length;

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-6 sm:mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
            My requests
          </h1>
          <p className="text-gray-500 mt-1">
            Submit and track site tours, utility connections, documents and other
            requests.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowForm(true)}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#134e4a] text-white font-bold text-sm hover:bg-[#115e59] transition-colors shrink-0"
        >
          <i className="las la-plus text-lg" aria-hidden />
          New request
        </button>
      </div>

      {showForm && (
        <div className="mb-8 p-6 bg-white rounded-2xl border border-gray-200 shadow-sm">
          <h2 className="text-lg font-bold text-gray-900 mb-4">
            Submit a new request
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="request-type"
                className="block text-sm font-semibold text-gray-700 mb-1"
              >
                Request type
              </label>
              <select
                id="request-type"
                value={type}
                onChange={(e) => setType(e.target.value as RequestType)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#134e4a] focus:ring-2 focus:ring-[#134e4a]/20 outline-none bg-white text-sm"
                required
              >
                {REQUEST_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label
                htmlFor="request-building"
                className="block text-sm font-semibold text-gray-700 mb-1"
              >
                Property / building
              </label>
              <select
                id="request-building"
                value={buildingId}
                onChange={(e) => setBuildingId(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#134e4a] focus:ring-2 focus:ring-[#134e4a]/20 outline-none bg-white text-sm"
                required
              >
                <option value="">Select property</option>
                {buildingsForDropdown.map((b) => (
                  <option key={b.building_id} value={b.building_id}>
                    {b.name} – {b.location ?? ""}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label
                htmlFor="request-note"
                className="block text-sm font-semibold text-gray-700 mb-1"
              >
                Note (optional)
              </label>
              <textarea
                id="request-note"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="e.g. Preferred date for site tour, or details for utility connection"
                rows={3}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#134e4a] focus:ring-2 focus:ring-[#134e4a]/20 outline-none bg-white text-sm resize-none"
              />
            </div>
            <div>
              <label
                htmlFor="request-images"
                className="block text-sm font-semibold text-gray-700 mb-1"
              >
                Attach photos (optional)
              </label>
              <input
                id="request-images"
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileChange}
                className="w-full text-sm text-gray-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-[#134e4a]/10 file:text-[#134e4a] hover:file:bg-[#134e4a]/20 transition-colors"
              />
              {files.length > 0 && (
                <p className="text-xs text-gray-500 mt-2">{files.length} file(s) selected</p>
              )}
            </div>
            {error && (
              <p className="text-sm text-red-600 font-medium">{error}</p>
            )}
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={submitting || !buildingId.trim()}
                className="px-5 py-2.5 rounded-xl bg-[#134e4a] text-white font-bold text-sm hover:bg-[#115e59] disabled:opacity-50 transition-colors"
              >
                {submitting ? "Submitting…" : "Submit request"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setBuildingId("");
                  setNote("");
                  setFiles([]);
                  setError(null);
                }}
                className="px-5 py-2.5 rounded-xl border border-gray-200 text-gray-700 font-semibold text-sm hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {pendingCount > 0 && (
        <p className="text-sm text-[#134e4a] font-medium mb-4">
          Showing {filteredRequests.length} request{filteredRequests.length !== 1 ? "s" : ""} ({pendingCount} pending).
        </p>
      )}

      {/* Filters UI */}
      <div className="mb-6 flex flex-wrap gap-3 p-4 bg-gray-50 rounded-2xl border border-gray-100">
        <div className="flex-1 min-w-[140px]">
          <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Type</label>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as any)}
            className="w-full px-3 py-2 rounded-xl border border-gray-200 bg-white text-xs font-semibold focus:border-[#134e4a] outline-none transition-colors"
          >
            <option value="All">All Types</option>
            {REQUEST_TYPES.map(t => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>

        <div className="flex-1 min-w-[140px]">
          <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Building</label>
          <select
            value={buildingFilter}
            onChange={(e) => setBuildingFilter(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-gray-200 bg-white text-xs font-semibold focus:border-[#134e4a] outline-none transition-colors"
          >
            <option value="All">All Buildings</option>
            {buildingsForDropdown.map(b => (
              <option key={b.building_id} value={b.building_id}>{b.name}</option>
            ))}
          </select>
        </div>

        <div className="flex-1 min-w-[140px]">
          <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Status</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="w-full px-3 py-2 rounded-xl border border-gray-200 bg-white text-xs font-semibold focus:border-[#134e4a] outline-none transition-colors"
          >
            <option value="All">All Statuses</option>
            {Object.keys(STATUS_LABELS).map(s => (
              <option key={s} value={s}>{STATUS_LABELS[s as RequestStatus]}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        {filteredRequests.length === 0 ? (
          <div className="p-12 text-center">
            <i
              className="las la-filter text-4xl text-gray-300 mb-4"
              aria-hidden
            />
            <p className="text-gray-500 font-medium">
              No requests found matching your filters.
            </p>
            <button
              onClick={() => {
                setTypeFilter("All");
                setBuildingFilter("All");
                setStatusFilter("All");
              }}
              className="mt-2 text-sm text-[#134e4a] font-bold hover:underline"
            >
              Clear all filters
            </button>
          </div>
        ) : (
          <ul className="divide-y divide-gray-100">
            {filteredRequests.map((req) => (
              <li
                key={req.id}
                className="px-4 sm:px-6 py-4 hover:bg-gray-50/80 transition-colors"
              >
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex gap-4 min-w-0">
                    <div
                      className={`size-10 rounded-xl flex items-center justify-center shrink-0 ${requestTypeColors[req.type]}`}
                    >
                      <i
                        className={`las ${requestTypeIcons[req.type]} text-lg`}
                        aria-hidden
                      />
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-gray-900">{req.type}</p>
                      <p className="text-sm text-gray-500 mt-0.5">
                        {req.buildingName}
                      </p>
                      {req.note && (
                        <p className="text-xs text-gray-400 mt-1 line-clamp-2">
                          {req.note}
                        </p>
                      )}
                      {req.imageUrls && req.imageUrls.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-2">
                          {req.imageUrls.map((url, i) => (
                            <button
                              key={i}
                              type="button"
                              onClick={() => openLightbox(req.imageUrls!, i)}
                              className="relative size-12 rounded-lg overflow-hidden border border-gray-200 hover:opacity-80 transition-opacity"
                            >
                              <Image src={url} alt="Attachment" fill className="object-cover" />
                            </button>
                          ))}
                        </div>
                      )}
                      <p className="text-xs text-gray-400 mt-1">
                        Submitted {formatDate(req.requestedAt)}
                      </p>
                    </div>
                  </div>
                  <div className="shrink-0 flex items-center gap-2">
                    <span
                      className={`inline-flex px-3 py-1 rounded-lg text-xs font-semibold ${getStatusBadgeClass(req.status)}`}
                    >
                      {STATUS_LABELS[req.status]}
                    </span>
                    {canCancel(req.status) && (
                      <button
                        type="button"
                        onClick={() => openCancelModal(req)}
                        disabled={cancellingId === req.id}
                        className="text-xs font-semibold text-red-600 hover:text-red-700 disabled:opacity-50"
                      >
                        {cancellingId === req.id ? "Cancelling…" : "Cancel request"}
                      </button>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {requestToCancel && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
          role="dialog"
          aria-modal="true"
          aria-labelledby="cancel-modal-title"
          onClick={() => setRequestToCancel(null)}
        >
          <div
            className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 id="cancel-modal-title" className="text-lg font-bold text-gray-900 mb-2">
              Cancel request?
            </h2>
            <p className="text-gray-600 text-sm mb-6">
              Are you sure you want to cancel this request?{" "}
              <span className="font-semibold text-gray-900">
                {requestToCancel.type}
              </span>{" "}
              for {requestToCancel.buildingName} will be cancelled.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                type="button"
                onClick={() => setRequestToCancel(null)}
                className="px-5 py-2.5 rounded-xl border border-gray-200 text-gray-700 font-semibold text-sm hover:bg-gray-50 transition-colors"
              >
                Keep request
              </button>
              <button
                type="button"
                onClick={confirmCancel}
                disabled={cancellingId === requestToCancel.id}
                className="px-5 py-2.5 rounded-xl bg-red-600 text-white font-semibold text-sm hover:bg-red-700 disabled:opacity-50 transition-colors"
              >
                {cancellingId === requestToCancel.id ? "Cancelling…" : "Yes, cancel"}
              </button>
            </div>
          </div>
        </div>
      )}

      <Lightbox
        open={lightboxOpen}
        close={() => setLightboxOpen(false)}
        index={lightboxIndex}
        slides={lightboxSlides}
        on={{
          view: ({ index }) => setLightboxIndex(index),
        }}
        plugins={[Zoom]}
        zoom={{
          maxZoomPixelRatio: 4,
          scrollToZoom: true,
        }}
      />
    </div>
  );
}
