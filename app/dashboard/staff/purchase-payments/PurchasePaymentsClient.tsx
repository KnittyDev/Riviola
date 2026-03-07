"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { toast } from "@/lib/toast";
import type { BuyerUnitWithInstallments } from "@/lib/purchaseInstallments";
import type { PurchaseInstallment } from "@/lib/supabase/types";
import {
  createPurchasePlanAction,
  markInstallmentPaidAction,
  unmarkInstallmentPaidAction,
  deletePurchasePlanAction,
} from "./actions";

const CURRENCY_SYMBOLS: Record<string, string> = {
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
};

function formatAmount(value: number, currency: string): string {
  const sym = CURRENCY_SYMBOLS[currency] ?? currency + " ";
  const formatted = value.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 2 });
  return sym === "€" || sym === "£" || sym === "₺" ? `${formatted} ${sym}` : `${sym}${formatted}`;
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "—";
  try {
    return new Date(dateStr).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
  } catch {
    return "—";
  }
}

type Building = { id: string; name: string };

type Props = {
  buildings: Building[];
  selectedBuildingId: string;
  blocks: string[];
  selectedBlock: string;
  selectedUnitId: string;
  units: BuyerUnitWithInstallments[];
  unitsInBlock: BuyerUnitWithInstallments[];
};

export function PurchasePaymentsClient({
  buildings,
  selectedBuildingId,
  blocks,
  selectedBlock,
  selectedUnitId,
  units,
  unitsInBlock,
}: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [addingPlanFor, setAddingPlanFor] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const showAllUnits = selectedUnitId === "__all__";
  const selectedUnit = !showAllUnits && selectedUnitId
    ? unitsInBlock.find((u) => u.id === selectedUnitId) ?? unitsInBlock[0]
    : unitsInBlock[0];

  function updateParams(opts: { building?: string; block?: string; unit?: string }) {
    const params = new URLSearchParams(searchParams.toString());
    if (opts.building != null) {
      params.set("building", opts.building);
      params.delete("block");
      params.delete("unit");
    }
    if (opts.block != null) {
      params.set("block", opts.block);
      if (opts.unit === undefined) params.delete("unit");
    }
    if (opts.unit != null) params.set("unit", opts.unit);
    else if (opts.unit === null) params.delete("unit");
    router.push(`/dashboard/staff/purchase-payments?${params.toString()}`);
  }

  async function handleCreatePlan(
    investorPropertyId: string,
    planType: "full" | "installments",
    totalAmount: number,
    currency: string,
    downPaymentAmount: number,
    installmentCount: number,
    dueDate: string | null
  ) {
    const result = await createPurchasePlanAction({
      investorPropertyId,
      planType,
      totalAmount,
      currency,
      dueDate: dueDate?.trim() || null,
      downPaymentAmount: planType === "installments" ? downPaymentAmount : 0,
      installmentCount: planType === "installments" ? Math.max(1, installmentCount) : undefined,
    });
    if (result.error) {
      toast.error(result.error);
      return;
    }
    toast.success("Payment plan created.");
    setAddingPlanFor(null);
    router.refresh();
  }

  async function handleMarkPaid(installmentId: string, isPaid: boolean) {
    setTogglingId(installmentId);
    const result = isPaid
      ? await unmarkInstallmentPaidAction(installmentId)
      : await markInstallmentPaidAction(installmentId);
    setTogglingId(null);
    if (result.error) {
      toast.error(result.error);
      return;
    }
    toast.success(isPaid ? "Unmarked as paid." : "Marked as paid.");
    router.refresh();
  }

  async function handleDeletePlan(investorPropertyId: string) {
    if (!confirm("Delete this payment plan? Installment records will be removed.")) return;
    const result = await deletePurchasePlanAction(investorPropertyId);
    if (result.error) {
      toast.error(result.error);
      return;
    }
    toast.success("Plan deleted.");
    router.refresh();
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
          Purchase payments
        </h1>
        <p className="text-gray-500 mt-1">
          Manage buyer investors&apos; purchase installments (full or down + installments). Mark payments as completed.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6 flex-wrap">
        <div className="flex items-center gap-3">
          <label className="text-sm font-semibold text-gray-700 shrink-0">Project</label>
          <select
            value={selectedBuildingId}
            onChange={(e) => updateParams({ building: e.target.value })}
            className="rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-700 bg-white focus:border-[#134e4a] focus:ring-2 focus:ring-[#134e4a]/20 outline-none"
          >
            {buildings.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>
        </div>
        {units.length > 0 && blocks.length > 0 && (
          <div className="flex items-center gap-3">
            <label className="text-sm font-semibold text-gray-700 shrink-0">Block</label>
            <select
              value={selectedBlock}
              onChange={(e) => {
                const block = e.target.value;
                const firstInBlock = units.find((u) => u.block === block);
                updateParams({ block, unit: firstInBlock?.id ?? undefined });
              }}
              className="rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-700 bg-white focus:border-[#134e4a] focus:ring-2 focus:ring-[#134e4a]/20 outline-none"
            >
              {blocks.map((bl) => (
                <option key={bl} value={bl}>
                  {bl}
                </option>
              ))}
            </select>
          </div>
        )}
        {unitsInBlock.length > 0 && (
          <div className="flex items-center gap-3">
            <label className="text-sm font-semibold text-gray-700 shrink-0">Unit</label>
            <select
              value={selectedUnitId}
              onChange={(e) => updateParams({ unit: e.target.value })}
              className="rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-700 bg-white focus:border-[#134e4a] focus:ring-2 focus:ring-[#134e4a]/20 outline-none min-w-[180px]"
            >
              <option value="__all__">List all</option>
              {unitsInBlock.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.unit} — {u.full_name ?? "—"}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {!selectedBuildingId ? (
        <p className="text-gray-500">Select a building.</p>
      ) : units.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-12 text-center">
          <i className="las la-wallet text-4xl text-gray-300 mb-4" aria-hidden />
          <p className="text-gray-500 font-medium">No buyer units in this building.</p>
          <p className="text-sm text-gray-400 mt-1">
            Only investors with type &quot;Buyer&quot; appear here. Assign buyers to units in the Investors section.
          </p>
        </div>
      ) : showAllUnits ? (
        <ListAllView
          blockName={selectedBlock}
          units={unitsInBlock}
          formatAmount={formatAmount}
          formatDate={formatDate}
          addingPlanFor={addingPlanFor}
          setAddingPlanFor={setAddingPlanFor}
          togglingId={togglingId}
          onCreatePlan={handleCreatePlan}
          onMarkPaid={handleMarkPaid}
          onDeletePlan={handleDeletePlan}
        />
      ) : selectedUnit ? (
        <UnitCard
          key={selectedUnit.id}
          unit={selectedUnit}
          formatAmount={formatAmount}
          formatDate={formatDate}
          addingPlanFor={addingPlanFor}
          setAddingPlanFor={setAddingPlanFor}
          togglingId={togglingId}
          onCreatePlan={handleCreatePlan}
          onMarkPaid={handleMarkPaid}
          onDeletePlan={handleDeletePlan}
        />
      ) : null}
    </div>
  );
}

type ListAllViewProps = {
  blockName: string;
  units: BuyerUnitWithInstallments[];
  formatAmount: (value: number, currency: string) => string;
  formatDate: (dateStr: string | null) => string;
  addingPlanFor: string | null;
  setAddingPlanFor: (id: string | null) => void;
  togglingId: string | null;
  onCreatePlan: (
    investorPropertyId: string,
    planType: "full" | "installments",
    totalAmount: number,
    currency: string,
    downPaymentAmount: number,
    installmentCount: number,
    dueDate: string | null
  ) => Promise<void>;
  onMarkPaid: (installmentId: string, isPaid: boolean) => Promise<void>;
  onDeletePlan: (investorPropertyId: string) => Promise<void>;
};

function ListAllView({
  blockName,
  units,
  formatAmount,
  formatDate,
  addingPlanFor,
  setAddingPlanFor,
  togglingId,
  onCreatePlan,
  onMarkPaid,
  onDeletePlan,
}: ListAllViewProps) {
  return (
    <section className="space-y-5">
      <header className="flex flex-wrap items-baseline gap-3">
        <h2 className="text-lg font-bold text-gray-900">
          All units in {blockName || "block"}
        </h2>
        <span className="rounded-full bg-gray-200 px-2.5 py-0.5 text-xs font-semibold text-gray-600">
          {units.length} {units.length === 1 ? "unit" : "units"}
        </span>
      </header>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {units.map((u) => (
          <div
            key={u.id}
            className="rounded-xl border-2 border-gray-200 bg-white overflow-hidden shadow-sm hover:border-[#134e4a]/30 hover:shadow-md transition-all"
          >
            <UnitCard
              unit={u}
              formatAmount={formatAmount}
              formatDate={formatDate}
              addingPlanFor={addingPlanFor}
              setAddingPlanFor={setAddingPlanFor}
              togglingId={togglingId}
              onCreatePlan={onCreatePlan}
              onMarkPaid={onMarkPaid}
              onDeletePlan={onDeletePlan}
              variant="compact"
            />
          </div>
        ))}
      </div>
    </section>
  );
}

type UnitCardProps = {
  unit: BuyerUnitWithInstallments;
  formatAmount: (value: number, currency: string) => string;
  formatDate: (dateStr: string | null) => string;
  addingPlanFor: string | null;
  setAddingPlanFor: (id: string | null) => void;
  togglingId: string | null;
  onCreatePlan: (
    investorPropertyId: string,
    planType: "full" | "installments",
    totalAmount: number,
    currency: string,
    downPaymentAmount: number,
    installmentCount: number,
    dueDate: string | null
  ) => Promise<void>;
  onMarkPaid: (installmentId: string, isPaid: boolean) => Promise<void>;
  onDeletePlan: (investorPropertyId: string) => Promise<void>;
  variant?: "default" | "compact";
};

function UnitCard({
  unit,
  formatAmount,
  formatDate,
  addingPlanFor,
  setAddingPlanFor,
  togglingId,
  onCreatePlan,
  onMarkPaid,
  onDeletePlan,
  variant = "default",
}: UnitCardProps) {
  const [planType, setPlanType] = useState<"full" | "installments">("full");
  const [totalAmount, setTotalAmount] = useState(
    unit.purchase_value != null ? String(unit.purchase_value) : ""
  );
  const [currency, setCurrency] = useState(unit.purchase_currency ?? "EUR");
  const [downPayment, setDownPayment] = useState("");
  const [installmentCount, setInstallmentCount] = useState(6);
  const [dueDate, setDueDate] = useState("");
  const isAdding = addingPlanFor === unit.id;

  const totalNum = totalAmount.trim() === "" ? null : parseFloat(totalAmount);
  const downNum = downPayment.trim() === "" ? null : parseFloat(downPayment);
  const canCreate =
    planType === "full"
      ? totalNum != null && !Number.isNaN(totalNum) && totalNum >= 0
      : totalNum != null &&
        !Number.isNaN(totalNum) &&
        totalNum >= 0 &&
        (downNum == null || (!Number.isNaN(downNum) && downNum >= 0 && downNum <= totalNum)) &&
        installmentCount >= 1;

  async function submitAddPlan(e: React.FormEvent) {
    e.preventDefault();
    if (!canCreate || totalNum == null) return;
    await onCreatePlan(
      unit.id,
      planType,
      totalNum,
      currency,
      planType === "installments" ? downNum ?? 0 : 0,
      planType === "installments" ? installmentCount : 0,
      dueDate.trim() || null
    );
  }

  const isCompact = variant === "compact";
  return (
    <div className={isCompact ? "bg-white" : "bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden"}>
      <div className={`border-b border-gray-100 flex flex-wrap items-center gap-x-4 gap-y-1 ${isCompact ? "px-3 py-2.5" : "px-4 py-3"}`}>
        <span className="font-semibold text-gray-900 text-sm">
          {unit.block} / {unit.unit}
        </span>
        <span className="text-gray-500 text-sm">{unit.full_name ?? "—"}</span>
        {unit.purchase_value != null && (
          <span className="text-xs font-medium text-[#134e4a]">
            Contract: {formatAmount(unit.purchase_value, unit.purchase_currency ?? "EUR")}
          </span>
        )}
        <div className="ml-auto flex items-center gap-2">
          {unit.installments.length > 0 ? (
            <button
              type="button"
              onClick={() => onDeletePlan(unit.id)}
              className="text-xs font-medium text-red-600 hover:text-red-700"
            >
              Delete plan
            </button>
          ) : !isAdding ? (
            <button
              type="button"
              onClick={() => setAddingPlanFor(unit.id)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#134e4a] text-white text-xs font-semibold hover:bg-[#115e59]"
            >
              <i className="las la-plus text-sm" aria-hidden />
              Add payment plan
            </button>
          ) : null}
        </div>
      </div>

      {unit.installments.length === 0 ? (
        <div className={isCompact ? "p-3" : "p-4"}>
          {!isAdding ? null : (
            <form onSubmit={submitAddPlan} className="space-y-3 max-w-md">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-0.5">Plan type</label>
                  <select
                    value={planType}
                    onChange={(e) => setPlanType(e.target.value as "full" | "installments")}
                    className="w-full rounded-lg border border-gray-200 px-2.5 py-1.5 text-sm"
                  >
                    <option value="full">Full payment</option>
                    <option value="installments">Down + installments</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-0.5">Currency</label>
                  <select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    className="w-full rounded-lg border border-gray-200 px-2.5 py-1.5 text-sm"
                  >
                    {Object.entries(CURRENCY_SYMBOLS).map(([code, sym]) => (
                      <option key={code} value={code}>{code} ({sym})</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-0.5">Total amount</label>
                  <input
                    type="number"
                    min={0}
                    step={0.01}
                    value={totalAmount}
                    onChange={(e) => setTotalAmount(e.target.value)}
                    className="w-full rounded-lg border border-gray-200 px-2.5 py-1.5 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-0.5">Due date</label>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full rounded-lg border border-gray-200 px-2.5 py-1.5 text-sm"
                  />
                </div>
              </div>
              {planType === "installments" && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-0.5">Down payment</label>
                    <input
                      type="number"
                      min={0}
                      step={0.01}
                      value={downPayment}
                      onChange={(e) => setDownPayment(e.target.value)}
                      className="w-full rounded-lg border border-gray-200 px-2.5 py-1.5 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-0.5">Installments</label>
                    <input
                      type="number"
                      min={1}
                      value={installmentCount}
                      onChange={(e) => setInstallmentCount(parseInt(e.target.value, 10) || 1)}
                      className="w-full rounded-lg border border-gray-200 px-2.5 py-1.5 text-sm"
                    />
                  </div>
                </div>
              )}
              <div className="flex gap-2 pt-1">
                <button
                  type="submit"
                  disabled={!canCreate}
                  className="px-3 py-1.5 rounded-lg bg-[#134e4a] text-white text-xs font-semibold hover:bg-[#115e59] disabled:opacity-50"
                >
                  Create plan
                </button>
                <button
                  type="button"
                  onClick={() => setAddingPlanFor(null)}
                  className="px-3 py-1.5 rounded-lg border border-gray-200 text-gray-700 text-xs font-semibold hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      ) : (
        <div className={isCompact ? "overflow-x-auto px-3 pb-3" : "overflow-x-auto"}>
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/80 border-b border-gray-200">
                <th className={`text-xs font-semibold text-gray-500 uppercase ${isCompact ? "px-3 py-1.5" : "px-4 py-2"}`}>Payment</th>
                <th className={`text-xs font-semibold text-gray-500 uppercase ${isCompact ? "px-3 py-1.5" : "px-4 py-2"}`}>Amount</th>
                <th className={`text-xs font-semibold text-gray-500 uppercase ${isCompact ? "px-3 py-1.5" : "px-4 py-2"}`}>Due date</th>
                <th className={`text-xs font-semibold text-gray-500 uppercase ${isCompact ? "px-3 py-1.5" : "px-4 py-2"}`}>Status</th>
                <th className={`text-xs font-semibold text-gray-500 uppercase text-right ${isCompact ? "px-3 py-1.5" : "px-4 py-2"}`}>Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {unit.installments.map((inst) => (
                <InstallmentRow
                  key={inst.id}
                  inst={inst}
                  formatAmount={formatAmount}
                  formatDate={formatDate}
                  togglingId={togglingId}
                  onMarkPaid={onMarkPaid}
                  compact={isCompact}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function InstallmentRow({
  inst,
  formatAmount,
  formatDate,
  togglingId,
  onMarkPaid,
  compact,
}: {
  inst: PurchaseInstallment;
  formatAmount: (v: number, c: string) => string;
  formatDate: (d: string | null) => string;
  togglingId: string | null;
  onMarkPaid: (id: string, isPaid: boolean) => Promise<void>;
  compact?: boolean;
}) {
  const isPaid = !!inst.paid_at;
  const loading = togglingId === inst.id;
  const cellClass = compact ? "px-3 py-1.5" : "px-4 py-2.5";

  return (
    <tr className="hover:bg-gray-50/50">
      <td className={`${cellClass} font-medium text-gray-900 text-sm`}>{inst.label}</td>
      <td className={`${cellClass} text-sm text-gray-700`}>
        {formatAmount(Number(inst.amount), inst.currency)}
      </td>
      <td className={`${cellClass} text-sm text-gray-500`}>{formatDate(inst.due_date)}</td>
      <td className={cellClass}>
        <span
          className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
            isPaid ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
          }`}
        >
          {isPaid ? "Paid" : "Pending"}
        </span>
      </td>
      <td className={`${cellClass} text-right`}>
        <button
          type="button"
          disabled={loading}
          onClick={() => onMarkPaid(inst.id, isPaid)}
          className="text-xs font-medium text-[#134e4a] hover:underline disabled:opacity-50"
        >
          {loading ? "…" : isPaid ? "Unmark" : "Mark paid"}
        </button>
      </td>
    </tr>
  );
}
