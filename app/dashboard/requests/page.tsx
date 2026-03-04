"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  getAllRequests,
  addRequest,
  getRequestsByInvestor,
  type RequestType,
} from "@/lib/requestStore";
import {
  REQUEST_TYPES,
  requestTypeIcons,
  requestTypeColors,
  type InvestorRequest,
  type RequestStatus,
} from "@/lib/staffRequestsData";
import { staffBuildings } from "@/lib/staffBuildingsData";

/** Demo: giriş yapmış yatırımcı (gerçek uygulamada auth’tan gelir). */
const CURRENT_INVESTOR_NAME = "Alex Sterling";

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
};

export default function InvestorRequestsPage() {
  const [requests, setRequests] = useState<InvestorRequest[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [type, setType] = useState<RequestType>("Information");
  const [buildingId, setBuildingId] = useState("");
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function loadRequests() {
    setRequests(getRequestsByInvestor(CURRENT_INVESTOR_NAME));
  }

  useEffect(() => {
    loadRequests();
  }, []);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!buildingId.trim()) return;
    const building = staffBuildings.find((b) => b.id === buildingId);
    if (!building) return;
    setSubmitting(true);
    addRequest({
      type,
      status: "Pending",
      investorName: CURRENT_INVESTOR_NAME,
      buildingName: building.name,
      buildingId: building.id,
      note: note.trim() || undefined,
    });
    setSubmitting(false);
    setType("Information");
    setBuildingId("");
    setNote("");
    setShowForm(false);
    loadRequests();
  }

  const pendingCount = requests.filter((r) => r.status === "Pending").length;

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
                {staffBuildings.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name} – {b.location}
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
          You have {pendingCount} pending request{pendingCount !== 1 ? "s" : ""}.
        </p>
      )}

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        {requests.length === 0 ? (
          <div className="p-12 text-center">
            <i
              className="las la-paper-plane text-4xl text-gray-300 mb-4"
              aria-hidden
            />
            <p className="text-gray-500 font-medium">
              You haven’t submitted any requests yet.
            </p>
            <p className="text-sm text-gray-400 mt-1 mb-6">
              Use “New request” to ask for a site tour, utility connection,
              documents or other support.
            </p>
            <button
              type="button"
              onClick={() => setShowForm(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#134e4a] text-white font-bold text-sm hover:bg-[#115e59] transition-colors"
            >
              <i className="las la-plus" aria-hidden />
              New request
            </button>
          </div>
        ) : (
          <ul className="divide-y divide-gray-100">
            {requests.map((req) => (
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
                      <p className="text-xs text-gray-400 mt-1">
                        Submitted {formatDate(req.requestedAt)}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`shrink-0 inline-flex px-3 py-1 rounded-lg text-xs font-semibold ${
                      req.status === "Done"
                        ? "bg-emerald-50 text-emerald-700"
                        : req.status === "In progress"
                          ? "bg-amber-50 text-amber-700"
                          : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {STATUS_LABELS[req.status]}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
