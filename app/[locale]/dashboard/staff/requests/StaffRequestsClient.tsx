"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Link } from "@/i18n/routing";
import { useTranslations, useLocale } from "next-intl";
import {
  REQUEST_TYPES,
  requestTypeIcons,
  requestTypeColors,
  type RequestStatus,
} from "@/lib/staffRequestsData";
import type { StaffRequestView } from "@/lib/investorRequests";
import { updateRequestStatusAction } from "./actions";
import Image from "next/image";
import Lightbox from "yet-another-react-lightbox";
import Zoom from "yet-another-react-lightbox/plugins/zoom";
import "yet-another-react-lightbox/styles.css";

function formatDate(dateStr: string, locale: string) {
  return new Date(dateStr).toLocaleDateString(locale === "tr" ? "tr-TR" : "en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

type Props = { initialRequests: StaffRequestView[] };

export function StaffRequestsClient({ initialRequests }: Props) {
  const t = useTranslations("Requests");
  const locale = useLocale();
  const router = useRouter();
  const [statusFilter, setStatusFilter] = useState<RequestStatus | "All">("All");
  const [typeFilter, setTypeFilter] = useState<string>("All");
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [lightboxSlides, setLightboxSlides] = useState<{src: string; alt: string}[]>([]);

  const STATUS_TABS: { value: RequestStatus | "All"; label: string }[] = [
    { value: "All", label: t("all") },
    { value: "Pending", label: t("pending") },
    { value: "In progress", label: t("inProgress") },
    { value: "Done", label: t("done") },
    { value: "Cancelled", label: t("cancelled") },
  ];

  const STATUS_OPTIONS: RequestStatus[] = ["Pending", "In progress", "Done", "Cancelled"];

  function openLightbox(urls: string[], index: number) {
    setLightboxSlides(urls.map(url => ({ src: url, alt: "Request attachment" })));
    setLightboxIndex(index);
    setLightboxOpen(true);
  }

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
          <option value="All">{t("allTypes")}</option>
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
            <p className="text-gray-500 font-medium">{t("noMatch")}</p>
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
                      <p className="font-bold text-gray-900">{t(`types.${req.type}`)}</p>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-x-3 gap-y-1 mt-0.5">
                        <p className="text-sm font-semibold text-gray-900">{req.investorName}</p>
                        {req.investorPhone && (
                          <div className="flex items-center gap-1.5 text-sm text-gray-500">
                            <i className="las la-phone text-gray-400" aria-hidden />
                            <a href={`tel:${req.investorPhone}`} className="hover:text-[#134e4a] transition-colors">
                              {req.investorPhone}
                            </a>
                          </div>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        {req.buildingName}
                      </p>
                      <div className="mt-2">
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">{t("projectBlockUnit")}</p>
                        {req.investorUnits.length > 0 ? (
                          <div className="flex flex-wrap gap-2">
                            {req.investorUnits.map((u, i) => (
                              <span
                                key={`${u.block}-${u.unit}-${i}`}
                                className="inline-flex flex-wrap items-center gap-x-2 gap-y-0.5 rounded-lg bg-gray-100 px-2.5 py-1.5 text-xs font-medium text-gray-700"
                              >
                                <span><span className="text-gray-500">{t("block")}:</span> {u.block}</span>
                                <span><span className="text-gray-500">{t("unit")}:</span> {u.unit}</span>
                                {u.area_m2 != null && (
                                  <span><span className="text-gray-500">{t("m2")}:</span> {u.area_m2}</span>
                                )}
                                {u.delivery_period && (
                                  <span><span className="text-gray-500">{t("delivery")}:</span> {u.delivery_period}</span>
                                )}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-gray-400">{t("noUnit")}</p>
                        )}
                      </div>
                      {req.note && (
                        <p className="text-sm text-gray-500 mt-1.5">
                          <span className="font-semibold text-gray-700">{t("note")}:</span> {req.note}
                        </p>
                      )}
                      {req.imageUrls && req.imageUrls.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-3">
                          {req.imageUrls.map((url, i) => (
                            <button
                              key={i}
                              type="button"
                              onClick={() => openLightbox(req.imageUrls!, i)}
                              className="relative size-16 rounded-lg overflow-hidden border border-gray-200 hover:opacity-80 transition-opacity bg-gray-100"
                            >
                              <Image src={url} alt="Attachment" fill className="object-cover" />
                            </button>
                          ))}
                        </div>
                      )}
                      <p className="text-xs text-gray-400 mt-3">
                        {t("requestedAt", { date: formatDate(req.requestedAt, locale) })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0 flex-wrap sm:pt-0.5">
                    {req.status === "Cancelled" ? (
                      <span className="rounded-lg border border-gray-200 bg-gray-100 px-3 py-1.5 text-xs font-semibold text-gray-500 cursor-default">
                        {t("cancelled")}
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
                            {s === "Pending" ? t("pending") : s === "In progress" ? t("inProgress") : t("done")}
                          </option>
                        ))}
                      </select>
                    )}
                    <Link
                      href={`/dashboard/staff/buildings/${req.buildingId}`}
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
