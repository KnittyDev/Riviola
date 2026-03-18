"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  getAllRequests,
  updateRequestStatus as updateRequestStatusInStore,
} from "@/lib/requestStore";
import {
  REQUEST_TYPES,
  requestTypeIcons,
  requestTypeColors,
  type RequestStatus,
  type InvestorRequest,
} from "@/lib/staffRequestsData";
import { useTranslations, useLocale } from "next-intl";

export default function StaffRequestsPage() {
  const t = useTranslations("Demo.requests");
  const locale = useLocale();
  const [requests, setRequests] = useState<InvestorRequest[]>([]);
  const [statusFilter, setStatusFilter] = useState<RequestStatus | "All">("All");
  const [typeFilter, setTypeFilter] = useState<string>("All");

  const STATUS_TABS: { value: RequestStatus | "All"; label: string }[] = [
    { value: "All", label: t("status.all") },
    { value: "Pending", label: t("status.Pending") },
    { value: "In progress", label: t("status.In progress") },
    { value: "Done", label: t("status.Done") },
  ];

  const STATUS_OPTIONS: RequestStatus[] = ["Pending", "In progress", "Done"];

  useEffect(() => {
    setRequests(getAllRequests());
  }, []);

  const filtered = requests.filter((r) => {
    const matchStatus = statusFilter === "All" || r.status === statusFilter;
    const matchType = typeFilter === "All" || r.type === typeFilter;
    return matchStatus && matchType;
  });

  function updateRequestStatus(id: string, status: RequestStatus) {
    updateRequestStatusInStore(id, status);
    setRequests(getAllRequests());
  }

  function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString(locale === "tr" ? "tr-TR" : "en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
          {t("title")}
        </h1>
        <p className="text-gray-500 mt-1">
          {t("subtitle")}
        </p>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6">
        <div className="flex rounded-xl border border-gray-200 bg-white p-1">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab.value}
              type="button"
              onClick={() => setStatusFilter(tab.value as RequestStatus | "All")}
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
          <option value="All">{t("types.all")}</option>
          {REQUEST_TYPES.map((type) => (
            <option key={type} value={type}>
              {t(`types.${type}`)}
            </option>
          ))}
        </select>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        {filtered.length === 0 ? (
          <div className="p-12 text-center">
            <i className="las la-inbox text-4xl text-gray-300 mb-4" aria-hidden />
            <p className="text-gray-500 font-medium">{t("empty")}</p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-100">
            {filtered.map((req) => (
              <li
                key={req.id}
                className="px-6 py-4 hover:bg-gray-50/80 transition-colors"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex gap-4 min-w-0">
                    <div
                      className={`size-10 rounded-xl flex items-center justify-center shrink-0 ${requestTypeColors[req.type]}`}
                    >
                      <i className={`las ${requestTypeIcons[req.type]} text-lg`} aria-hidden />
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-gray-900">{t(`types.${req.type}`)}</p>
                      <p className="text-sm text-gray-500 mt-0.5">
                        {req.investorName} · {req.buildingName}
                      </p>
                      {req.note && (
                        <p className="text-xs text-gray-400 mt-1 line-clamp-1">{req.note}</p>
                      )}
                      <p className="text-xs text-gray-400 mt-1">
                        {t("requestedOn", { date: formatDate(req.requestedAt) })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0 flex-wrap">
                    <select
                      value={req.status}
                      onChange={(e) => updateRequestStatus(req.id, e.target.value as RequestStatus)}
                      className={`rounded-lg border px-3 py-1.5 text-xs font-semibold focus:border-[#134e4a] focus:ring-2 focus:ring-[#134e4a]/20 outline-none ${
                        req.status === "Done"
                          ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                          : req.status === "In progress"
                            ? "bg-amber-50 border-amber-200 text-amber-700"
                            : "bg-gray-50 border-gray-200 text-gray-700"
                      }`}
                    >
                      {STATUS_OPTIONS.map((s) => (
                        <option key={s} value={s}>
                          {t(`status.${s}`)}
                        </option>
                      ))}
                    </select>
                    <Link
                      href={`/demo/staff/buildings/${req.buildingId}`}
                      className="text-sm font-semibold text-[#134e4a] hover:text-[#115e59]"
                    >
                      {t("viewBuilding")}
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
