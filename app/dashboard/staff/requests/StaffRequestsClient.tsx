"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  REQUEST_TYPES,
  requestTypeIcons,
  requestTypeColors,
  type RequestStatus,
} from "@/lib/staffRequestsData";
import type { StaffRequestView } from "@/lib/investorRequests";
import { updateRequestStatusAction } from "./actions";

const STATUS_TABS: { value: RequestStatus | "All"; label: string }[] = [
  { value: "All", label: "All" },
  { value: "Pending", label: "Pending" },
  { value: "In progress", label: "In progress" },
  { value: "Done", label: "Done" },
  { value: "Cancelled", label: "Cancelled" },
];

const STATUS_OPTIONS: RequestStatus[] = ["Pending", "In progress", "Done", "Cancelled"];

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

type Props = { initialRequests: StaffRequestView[] };

export function StaffRequestsClient({ initialRequests }: Props) {
  const router = useRouter();
  const [statusFilter, setStatusFilter] = useState<RequestStatus | "All">("All");
  const [typeFilter, setTypeFilter] = useState<string>("All");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const filtered = initialRequests.filter((r) => {
    const matchStatus = statusFilter === "All" || r.status === statusFilter;
    const matchType = typeFilter === "All" || r.type === typeFilter;
    return matchStatus && matchType;
  });

  async function handleStatusChange(id: string, status: RequestStatus) {
    setUpdatingId(id);
    const result = await updateRequestStatusAction(id, status);
    setUpdatingId(null);
    if (result.ok) router.refresh();
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
          Investor requests
        </h1>
        <p className="text-gray-500 mt-1">
          Site tours, information, utility connections (water, electricity, gas) and other requests from investors.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6">
        <div className="flex rounded-xl border border-gray-200 bg-white p-1">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab.value}
              type="button"
              onClick={() => setStatusFilter(tab.value)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                statusFilter === tab.value
                  ? "bg-[#134e4a] text-white"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 bg-white focus:border-[#134e4a] focus:ring-2 focus:ring-[#134e4a]/20 outline-none"
        >
          <option value="All">All types</option>
          {REQUEST_TYPES.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        {filtered.length === 0 ? (
          <div className="p-12 text-center">
            <i className="las la-inbox text-4xl text-gray-300 mb-4" aria-hidden />
            <p className="text-gray-500 font-medium">No requests match the filters.</p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-100">
            {filtered.map((req) => (
              <li
                key={req.id}
                className="px-6 py-4 hover:bg-gray-50/80 transition-colors"
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex gap-4 min-w-0 flex-1">
                    <div
                      className={`size-10 rounded-xl flex items-center justify-center shrink-0 ${requestTypeColors[req.type]}`}
                    >
                      <i className={`las ${requestTypeIcons[req.type]} text-lg`} aria-hidden />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-bold text-gray-900">{req.type}</p>
                      <p className="text-sm text-gray-600 mt-0.5">
                        <span className="font-semibold text-gray-900">{req.investorName}</span>
                        {" · "}
                        {req.buildingName}
                      </p>
                      {req.investorUnits.length > 0 && (
                        <div className="mt-2 text-sm text-gray-600">
                          <span className="font-semibold text-gray-700">Unit(s):</span>{" "}
                          {req.investorUnits.map((u, i) => (
                            <span key={`${u.block}-${u.unit}-${i}`}>
                              {i > 0 && " · "}
                              Block {u.block}, Unit {u.unit}
                              {u.area_m2 != null && ` (${u.area_m2} m²)`}
                              {u.delivery_period && ` · ${u.delivery_period}`}
                            </span>
                          ))}
                        </div>
                      )}
                      {req.note && (
                        <p className="text-sm text-gray-500 mt-1.5">
                          <span className="font-semibold text-gray-700">Note:</span> {req.note}
                        </p>
                      )}
                      <p className="text-xs text-gray-400 mt-1">
                        Requested {formatDate(req.requestedAt)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0 flex-wrap sm:pt-0.5">
                    {req.status === "Cancelled" ? (
                      <span className="rounded-lg border border-gray-200 bg-gray-100 px-3 py-1.5 text-xs font-semibold text-gray-500 cursor-default">
                        Cancelled
                      </span>
                    ) : (
                      <select
                        value={req.status}
                        onChange={(e) => handleStatusChange(req.id, e.target.value as RequestStatus)}
                        disabled={updatingId === req.id}
                        className={`rounded-lg border px-3 py-1.5 text-xs font-semibold focus:border-[#134e4a] focus:ring-2 focus:ring-[#134e4a]/20 outline-none ${
                          req.status === "Done"
                            ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                            : req.status === "In progress"
                              ? "bg-amber-50 border-amber-200 text-amber-700"
                              : "bg-gray-50 border-gray-200 text-gray-700"
                        }`}
                      >
                        {STATUS_OPTIONS.filter((s) => s !== "Cancelled").map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    )}
                    <Link
                      href={`/dashboard/staff/buildings/${req.buildingId}`}
                      className="text-sm font-semibold text-[#134e4a] hover:text-[#115e59]"
                    >
                      View building
                    </Link>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
