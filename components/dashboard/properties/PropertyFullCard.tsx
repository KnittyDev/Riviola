"use client";

import Image from "next/image";
import Link from "next/link";

export type PropertyStatus = "active" | "completed" | "planning";

export interface PropertyFull {
  id: string;
  imageSrc: string;
  imageAlt: string;
  badge: string;
  status: PropertyStatus;
  title: string;
  location: string;
  progress: number;
  value: string;
  roi: string;
  roiPositive: boolean;
  area: string;
  deliveryDate: string;
  updateTime: string;
  updateText: string;
}

const STATUS_STYLES: Record<PropertyStatus, string> = {
  active: "bg-teal-50 text-[#134e4a]",
  completed: "bg-emerald-50 text-emerald-700",
  planning: "bg-amber-50 text-amber-700",
};

const STATUS_LABELS: Record<PropertyStatus, string> = {
  active: "Under Construction",
  completed: "Completed",
  planning: "Planning Phase",
};

export function PropertyFullCard({
  property,
  delay = 0,
}: {
  property: PropertyFull;
  delay?: number;
}) {
  return (
    <div
      className="animate-fade-in-up bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm group hover:shadow-md hover:-translate-y-1 transition-all duration-300"
      style={{ animationDelay: `${delay}ms` }}
    >
      {/* Image */}
      <div className="relative h-52 overflow-hidden">
        <Image
          src={property.imageSrc}
          alt={property.imageAlt}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />

        {/* Top badges */}
        <div className="absolute top-4 left-4 flex gap-2">
          <span className="px-3 py-1 bg-white/90 backdrop-blur-sm text-gray-900 text-[11px] font-bold rounded-lg uppercase tracking-wider">
            {property.badge}
          </span>
        </div>
        <div className="absolute top-4 right-4">
          <span
            className={`px-3 py-1 text-[11px] font-bold rounded-lg uppercase tracking-wider ${STATUS_STYLES[property.status]}`}
          >
            {STATUS_LABELS[property.status]}
          </span>
        </div>

        {/* Bottom info */}
        <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">
          <div>
            <p className="text-white text-lg font-bold leading-tight drop-shadow">
              {property.title}
            </p>
            <p className="text-white/80 text-xs flex items-center gap-1 mt-0.5">
              <i className="las la-map-marker-alt text-sm" aria-hidden />
              {property.location}
            </p>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="p-5 space-y-4">
        {/* Stats row */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-gray-50 rounded-xl p-3 text-center">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">
              Value
            </p>
            <p className="text-sm font-bold text-gray-900">{property.value}</p>
          </div>
          <div className="bg-gray-50 rounded-xl p-3 text-center">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">
              ROI
            </p>
            <p
              className={`text-sm font-bold ${
                property.roiPositive ? "text-emerald-600" : "text-red-500"
              }`}
            >
              {property.roi}
            </p>
          </div>
          <div className="bg-gray-50 rounded-xl p-3 text-center">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">
              Area
            </p>
            <p className="text-sm font-bold text-gray-900">{property.area}</p>
          </div>
        </div>

        {/* Progress */}
        {property.status !== "planning" && (
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <span className="text-xs font-semibold text-gray-500">
                Construction Progress
              </span>
              <span className="text-xs font-bold text-[#134e4a]">
                {property.progress}%
              </span>
            </div>
            <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
              <div
                className="bg-[#134e4a] h-full rounded-full transition-all duration-700"
                style={{ width: `${property.progress}%` }}
              />
            </div>
          </div>
        )}

        {/* Delivery */}
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span className="flex items-center gap-1">
            <i className="las la-calendar-check text-[#134e4a]" aria-hidden />
            Delivery: <span className="font-semibold text-gray-700 ml-1">{property.deliveryDate}</span>
          </span>
        </div>

        <Link
          href={`/dashboard/properties/${property.id}`}
          className="mt-4 flex items-center justify-center gap-2 w-full py-3 px-4 rounded-xl bg-[#134e4a] text-white text-sm font-bold hover:bg-[#115e59] transition-colors"
        >
          View details
          <i className="las la-arrow-right text-base" aria-hidden />
        </Link>
      </div>
    </div>
  );
}
