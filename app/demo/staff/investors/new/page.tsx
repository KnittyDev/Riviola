"use client";

import { useState } from "react";
import Link from "next/link";
import {
  staffBuildings,
  buildingBlocks,
  buildingFloors,
} from "@/lib/staffBuildingsData";

const inputClass =
  "w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#134e4a] focus:ring-2 focus:ring-[#134e4a]/20 outline-none transition-colors";
const labelClass = "block text-sm font-semibold text-gray-700 mb-1";

export default function NewInvestorPage() {
  const [buildingId, setBuildingId] = useState("");
  const [paymentPlanType, setPaymentPlanType] = useState<"full" | "installments">("full");
  const [installmentCount, setInstallmentCount] = useState<number>(6);
  const blocks = buildingId ? buildingBlocks[buildingId] ?? [] : [];
  const floorCount = buildingId ? buildingFloors[buildingId] ?? 6 : 0;
  const floorOptions = Array.from({ length: floorCount }, (_, i) => i + 1);

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
      <Link
        href="/demo/staff"
        className="inline-flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-[#134e4a] mb-6"
      >
        <i className="las la-arrow-left" aria-hidden />
        Back to overview
      </Link>
      <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">
        Create investor account
      </h1>
      <p className="text-gray-500 mt-1 mb-8">
        Create a login account for an investor and assign them to a project, block, unit and payment plan.
      </p>
      <form
        className="space-y-6 bg-white rounded-2xl border border-gray-200 p-6 shadow-sm"
        onSubmit={(e) => e.preventDefault()}
      >
        <div>
          <label htmlFor="name" className={labelClass}>
            Full name
          </label>
          <input
            id="name"
            name="name"
            type="text"
            placeholder="e.g. John Smith"
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="email" className={labelClass}>
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            placeholder="investor@example.com"
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="password" className={labelClass}>
            Temporary password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            placeholder="Initial password (can be changed later)"
            className={inputClass}
          />
        </div>

        <hr className="border-gray-200" />

        <div>
          <label htmlFor="building" className={labelClass}>
            Project / building
          </label>
          <select
            id="building"
            name="building"
            value={buildingId}
            onChange={(e) => setBuildingId(e.target.value)}
            className={inputClass}
          >
            <option value="">Select project</option>
            {staffBuildings.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name} – {b.location}
              </option>
            ))}
          </select>
        </div>

        {buildingId && (
          <>
            <div>
              <label htmlFor="block" className={labelClass}>
                Block name
              </label>
              <select
                id="block"
                name="block"
                className={inputClass}
              >
                <option value="">Select block</option>
                {blocks.map((block) => (
                  <option key={block} value={block}>
                    {block}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="floor" className={labelClass}>
                  Floor
                </label>
                <select
                  id="floor"
                  name="floor"
                  className={inputClass}
                >
                  <option value="">Select floor</option>
                  {floorOptions.map((f) => (
                    <option key={f} value={f}>
                      {f}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="unit" className={labelClass}>
                  Unit / apartment
                </label>
                <input
                  id="unit"
                  name="unit"
                  type="text"
                  placeholder="e.g. 402"
                  className={inputClass}
                />
              </div>
            </div>
          </>
        )}

        <hr className="border-gray-200" />

        <div>
          <span className={labelClass}>Payment plan</span>
          <p className="text-xs text-gray-500 mb-3">
            Full payment at once or pay in installments (enter a custom number).
          </p>
          <div className="space-y-2">
            <label className="flex items-center gap-3 p-3 rounded-xl border border-gray-200 hover:bg-gray-50 cursor-pointer">
              <input
                type="radio"
                name="paymentPlan"
                value="full"
                checked={paymentPlanType === "full"}
                onChange={() => setPaymentPlanType("full")}
                className="rounded-full border-gray-300 accent-[#134e4a] focus:ring-[#134e4a] focus:ring-offset-0"
              />
              <span className="text-sm font-medium text-gray-900">Full payment (one-time)</span>
            </label>
            <label className="flex items-center gap-3 p-3 rounded-xl border border-gray-200 hover:bg-gray-50 cursor-pointer">
              <input
                type="radio"
                name="paymentPlan"
                value="installments"
                checked={paymentPlanType === "installments"}
                onChange={() => setPaymentPlanType("installments")}
                className="rounded-full border-gray-300 accent-[#134e4a] focus:ring-[#134e4a] focus:ring-offset-0"
              />
              <span className="text-sm font-medium text-gray-900">Installments</span>
            </label>
          </div>
          {paymentPlanType === "installments" && (
            <div className="mt-4 pl-9">
              <label htmlFor="installmentCount" className={labelClass}>
                Number of installments
              </label>
              <input
                id="installmentCount"
                name="installmentCount"
                type="number"
                min={2}
                max={120}
                value={installmentCount}
                onChange={(e) => setInstallmentCount(Math.max(2, parseInt(e.target.value, 10) || 2))}
                className={`${inputClass} max-w-[8rem]`}
              />
            </div>
          )}
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            className="px-6 py-3 rounded-xl bg-[#134e4a] text-white font-semibold hover:bg-[#115e59] transition-colors"
          >
            Create account
          </button>
          <Link
            href="/demo/staff"
            className="px-6 py-3 rounded-xl border border-gray-200 text-gray-700 font-semibold hover:bg-gray-50 transition-colors"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
