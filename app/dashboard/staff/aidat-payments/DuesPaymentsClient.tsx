"use client";

import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "@/lib/toast";
import type { UnitForDues } from "@/lib/duesPayments";
// Actions are now passed as props to allow demo/production swapping
type ActionResult = { ok?: boolean; error?: string };
type MarkAction = (unitId: string, period: string) => Promise<ActionResult>;
type UnmarkAction = (unitId: string, period: string) => Promise<ActionResult>;
type SettingsAction = (buildingId: string, input: any) => Promise<ActionResult>;

function formatMonthLabel(period: string): string {
  const [y, m] = period.split("-").map(Number);
  const date = new Date(y, m - 1, 1);
  return date.toLocaleDateString("en-GB", { month: "short", year: "numeric" });
}

function formatDuesAmount(cents: number, currency: string | null): string {
  const symbols: Record<string, string> = {
    EUR: "€",
    USD: "$",
    GBP: "£",
    TRY: "₺",
    CHF: "Fr",
    AUD: "A$",
    CAD: "C$",
    NOK: "kr",
    SEK: "kr",
    AED: "د.إ",
    SAR: "﷼",
    ALL: "L",
  };
  const sym = symbols[currency ?? "EUR"] ?? (currency ?? "EUR") + " ";
  return `${sym} ${(cents / 100).toLocaleString("en-US", { minimumFractionDigits: 2 })}`;
}

type Building = { id: string; name: string };

type Props = {
  buildings: Building[];
  selectedBuildingId: string;
  periods: string[];
  settings: {
    payment_window_start_day: number;
    payment_window_end_day: number;
    amount_cents: number | null;
    currency: string | null;
    area_pricing: { min: number; max: number; amount_cents: number }[] | null;
  } | null;
  units: UnitForDues[];
  paidByPeriod: Record<string, Record<string, { paid_at: string | null; marked_by: string | null }>>;
};

export function DuesPaymentsClient({
  buildings,
  selectedBuildingId,
  periods,
  settings,
  units,
  paidByPeriod,
  // Add as props
  markDuesPaidFn,
  unmarkDuesPaidFn,
  setSettingsFn,
}: Props & {
  markDuesPaidFn: MarkAction;
  unmarkDuesPaidFn: UnmarkAction;
  setSettingsFn: SettingsAction;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showSettingsForm, setShowSettingsForm] = useState(false);
  const [startDay, setStartDay] = useState(settings?.payment_window_start_day ?? 4);
  const [endDay, setEndDay] = useState(settings?.payment_window_end_day ?? 12);
  const [amountValue, setAmountValue] = useState(
    settings?.amount_cents != null ? (settings.amount_cents / 100).toFixed(2) : ""
  );
  const [currency, setCurrency] = useState(settings?.currency ?? "EUR");
  const [areaPricing, setAreaPricing] = useState<{ min: string; max: string; amount: string; id: number }[]>(
    (settings?.area_pricing ?? []).map((t, i) => ({
      min: t.min.toString(),
      max: t.max.toString(),
      amount: (t.amount_cents / 100).toFixed(2),
      id: i,
    }))
  );
  const [savingSettings, setSavingSettings] = useState(false);
  const [togglingKey, setTogglingKey] = useState<string | null>(null);

  function addPricingTier() {
    setAreaPricing((prev) => [...prev, { min: "", max: "", amount: "", id: Date.now() }]);
  }

  function updatePricingTier(id: number, key: "min" | "max" | "amount", value: string) {
    setAreaPricing((prev) => prev.map((t) => (t.id === id ? { ...t, [key]: value } : t)));
  }

  function removePricingTier(id: number) {
    setAreaPricing((prev) => prev.filter((t) => t.id !== id));
  }

  const CURRENCIES = [
    { value: "EUR", label: "EUR (€)" },
    { value: "USD", label: "USD ($)" },
    { value: "GBP", label: "GBP (£)" },
    { value: "TRY", label: "TRY (₺)" },
    { value: "CHF", label: "CHF (Fr)" },
    { value: "AUD", label: "AUD (A$)" },
    { value: "CAD", label: "CAD (C$)" },
    { value: "NOK", label: "NOK (kr)" },
    { value: "SEK", label: "SEK (kr)" },
    { value: "AED", label: "AED (د.إ)" },
    { value: "SAR", label: "SAR (﷼)" },
    { value: "ALL", label: "ALL (L)" },
  ] as const;

  function updateParams(buildingId?: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (buildingId != null) params.set("building", buildingId);
    router.push(`/dashboard/staff/aidat-payments?${params.toString()}`);
  }

  async function handleSaveSettings() {
    if (!selectedBuildingId) return;
    setSavingSettings(true);
    const parsed = amountValue.trim() === "" ? null : parseFloat(amountValue);
    const amountCents =
      parsed != null && !Number.isNaN(parsed) && parsed >= 0
        ? Math.round(parsed * 100)
        : null;
        
    const parsedAreaPricing = areaPricing
      .filter((t) => t.min.trim() !== "" && t.max.trim() !== "" && t.amount.trim() !== "")
      .map((t) => {
        const min = parseFloat(t.min) || 0;
        const max = parseFloat(t.max) || 0;
        const amountCents = Math.round((parseFloat(t.amount) || 0) * 100);
        return { min, max, amount_cents: amountCents };
      });

    const result = await setSettingsFn(selectedBuildingId, {
      payment_window_start_day: startDay,
      payment_window_end_day: endDay,
      amount_cents: amountCents ?? null,
      currency: currency || null,
      area_pricing: parsedAreaPricing.length > 0 ? parsedAreaPricing : null,
    });
    setSavingSettings(false);
    if (result.error) {
      toast.error(result.error);
      return;
    }
    toast.success("Payment window saved.");
    setShowSettingsForm(false);
    router.refresh();
  }

  async function handleTogglePaid(unitId: string, period: string, currentlyPaid: boolean) {
    const key = `${unitId}-${period}`;
    setTogglingKey(key);
    const result = currentlyPaid
      ? await unmarkDuesPaidFn(unitId, period)
      : await markDuesPaidFn(unitId, period);
    setTogglingKey(null);
    if (result.error) {
      toast.error(result.error);
      return;
    }
    toast.success(currentlyPaid ? "Unmarked as paid." : "Marked as paid.");
    router.refresh();
  }

  function isPaid(unitId: string, period: string): boolean {
    return !!paidByPeriod[period]?.[unitId]?.paid_at;
  }

  function getExpectedDues(unit: UnitForDues): string {
    if (!settings) return "—";
    
    let expectedCents = settings.amount_cents;
    
    if (settings.area_pricing && settings.area_pricing.length > 0 && unit.area_m2 != null) {
      for (const tier of settings.area_pricing) {
        if (unit.area_m2 >= tier.min && unit.area_m2 <= tier.max) {
          expectedCents = tier.amount_cents;
          break;
        }
      }
    }
    
    if (expectedCents == null) return "—";
    return formatDuesAmount(expectedCents, settings.currency);
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
          Dues payments
        </h1>
        <p className="text-gray-500 mt-1">
          Set the payment window per building and track monthly dues by unit.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6">
        <label className="text-sm font-semibold text-gray-700 shrink-0">Building</label>
        <select
          value={selectedBuildingId}
          onChange={(e) => updateParams(e.target.value)}
          className="rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-700 bg-white focus:border-[#134e4a] focus:ring-2 focus:ring-[#134e4a]/20 outline-none"
        >
          {buildings.map((b) => (
            <option key={b.id} value={b.id}>
              {b.name}
            </option>
          ))}
        </select>
      </div>

      {selectedBuildingId && (
        <>
          <div className="mb-6 p-4 rounded-2xl border border-gray-200 bg-gray-50/80">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <p className="text-sm text-gray-700">
                {settings ? (
                  <>
                    Payment must be made between the <strong>{settings.payment_window_start_day}</strong>
                    {settings.payment_window_start_day === 1 ? "st" : settings.payment_window_start_day === 2 ? "nd" : settings.payment_window_start_day === 3 ? "rd" : "th"} and{" "}
                    <strong>{settings.payment_window_end_day}</strong>
                    {settings.payment_window_end_day === 1 ? "st" : settings.payment_window_end_day === 2 ? "nd" : settings.payment_window_end_day === 3 ? "rd" : "th"} of each month.
                    {settings.amount_cents != null && (
                      <> Amount: <strong>{formatDuesAmount(settings.amount_cents, settings.currency)}</strong> per month.</>
                    )}
                  </>
                ) : (
                  "Set the payment window and amount for this building (e.g. 4th–12th of each month)."
                )}
              </p>
              <button
                type="button"
                onClick={() => {
                  setShowSettingsForm(!showSettingsForm);
                  if (!showSettingsForm && settings) {
                    setStartDay(settings.payment_window_start_day);
                    setEndDay(settings.payment_window_end_day);
                    setAmountValue(
                      settings.amount_cents != null
                        ? (settings.amount_cents / 100).toFixed(2)
                        : ""
                    );
                    setCurrency(settings.currency ?? "EUR");
                    setAreaPricing(
                      (settings.area_pricing ?? []).map((t, i) => ({
                        min: t.min.toString(),
                        max: t.max.toString(),
                        amount: (t.amount_cents / 100).toFixed(2),
                        id: i,
                      }))
                    );
                  }
                }}
                className="shrink-0 text-sm font-semibold text-[#134e4a] hover:text-[#115e59]"
              >
                {showSettingsForm ? "Cancel" : "Edit window"}
              </button>
            </div>
            {showSettingsForm && (
              <div className="mt-4 flex flex-wrap items-end gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Start day (1–31)</label>
                  <input
                    type="number"
                    min={1}
                    max={31}
                    value={startDay}
                    onChange={(e) => setStartDay(Number(e.target.value))}
                    className="w-24 rounded-lg border border-gray-200 px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">End day (1–31)</label>
                  <input
                    type="number"
                    min={1}
                    max={31}
                    value={endDay}
                    onChange={(e) => setEndDay(Number(e.target.value))}
                    className="w-24 rounded-lg border border-gray-200 px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Amount (per month)</label>
                  <input
                    type="number"
                    min={0}
                    step={0.01}
                    placeholder="e.g. 420.00"
                    value={amountValue}
                    onChange={(e) => setAmountValue(e.target.value)}
                    className="w-32 rounded-lg border border-gray-200 px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Currency</label>
                  <select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    className="rounded-lg border border-gray-200 px-3 py-2 text-sm bg-white"
                  >
                    {CURRENCIES.map((c) => (
                      <option key={c.value} value={c.value}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="w-full mt-4">
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-xs font-semibold text-gray-500">
                      Area Pricing Tiers (optional overrides based on m²)
                    </label>
                    <button
                      type="button"
                      onClick={addPricingTier}
                      className="text-xs font-semibold text-[#134e4a] hover:underline"
                    >
                      + Add Tier
                    </button>
                  </div>
                  {areaPricing.length === 0 ? (
                    <p className="text-xs text-gray-400 italic">No area pricing tiers. Uses fallback amount.</p>
                  ) : (
                    <div className="space-y-2">
                      {areaPricing.map((tier) => (
                        <div key={tier.id} className="flex flex-wrap items-center gap-2 max-w-xl">
                          <input
                            type="number"
                            min={0}
                            placeholder="Min m²"
                            value={tier.min}
                            onChange={(e) => updatePricingTier(tier.id, "min", e.target.value)}
                            className="w-20 rounded-lg border border-gray-200 px-3 py-1.5 text-sm"
                            title="Minimum Area (m²)"
                          />
                          <span className="text-gray-400 text-sm">-</span>
                          <input
                            type="number"
                            min={0}
                            placeholder="Max m²"
                            value={tier.max}
                            onChange={(e) => updatePricingTier(tier.id, "max", e.target.value)}
                            className="w-20 rounded-lg border border-gray-200 px-3 py-1.5 text-sm"
                            title="Maximum Area (m²)"
                          />
                          <span className="text-gray-400 text-sm">m² →</span>
                          <input
                            type="number"
                            min={0}
                            step={0.01}
                            placeholder="Amount"
                            value={tier.amount}
                            onChange={(e) => updatePricingTier(tier.id, "amount", e.target.value)}
                            className="w-24 rounded-lg border border-gray-200 px-3 py-1.5 text-sm"
                            title="Pricing Amount"
                          />
                          <button
                            type="button"
                            onClick={() => removePricingTier(tier.id)}
                            className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded"
                            title="Remove tier"
                          >
                            <i className="las la-trash-alt" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="w-full flex justify-end mt-4">
                  <button
                    type="button"
                    onClick={handleSaveSettings}
                    disabled={savingSettings}
                    className="px-6 py-2.5 rounded-xl bg-[#134e4a] text-white text-sm font-semibold hover:bg-[#115e59] disabled:opacity-50 transition-colors"
                  >
                    {savingSettings ? "Saving…" : "Save all settings"}
                  </button>
                </div>
              </div>
            )}
          </div>

          {units.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-12 text-center">
              <p className="text-gray-500 font-medium">No units in this building.</p>
              <p className="text-sm text-gray-400 mt-1">Assign investors to units to track dues.</p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-gray-200 bg-gray-50/80">
                      <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider min-w-[4rem]">Block</th>
                      <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider min-w-[4rem]">Unit</th>
                      <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider min-w-[10rem]">Investor</th>
                      <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider min-w-[6rem]">Dues Amount</th>
                      {periods.map((p) => (
                        <th
                          key={p}
                          className="px-2 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider text-center min-w-[3.5rem]"
                          title={formatMonthLabel(p)}
                        >
                          {formatMonthLabel(p)}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {units.map((u) => (
                      <tr key={u.id} className="hover:bg-gray-50/80">
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">{u.block}</td>
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">{u.unit}</td>
                        <td className="px-4 py-3 text-sm text-gray-600 truncate max-w-[12rem]">{u.full_name ?? "—"}</td>
                        <td className="px-4 py-3 text-sm font-bold text-gray-900">{getExpectedDues(u)}</td>
                        {periods.map((p) => {
                          const paid = isPaid(u.id, p);
                          const key = `${u.id}-${p}`;
                          return (
                            <td key={p} className="px-2 py-3 text-center">
                              <label className="inline-flex items-center justify-center gap-1 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={paid}
                                  disabled={togglingKey === key}
                                  onChange={() => handleTogglePaid(u.id, p, paid)}
                                  className="h-4 w-4 rounded border-gray-300 accent-[#134e4a] focus:ring-2 focus:ring-[#134e4a]/20 focus:ring-offset-0"
                                  title={paid ? "Paid – click to unmark" : "Unpaid – click to mark paid"}
                                />
                                <span className="text-xs font-medium text-gray-600 sr-only sm:not-sr-only">
                                  {paid ? "Paid" : "—"}
                                </span>
                              </label>
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}

      {buildings.length === 0 && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-12 text-center">
          <p className="text-gray-500 font-medium">No buildings.</p>
          <p className="text-sm text-gray-400 mt-1">Add buildings to your company to track dues.</p>
        </div>
      )}
    </div>
  );
}
