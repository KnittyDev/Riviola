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

  const selectedUnit = selectedUnitId
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

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="p-6 border-b border-gray-100">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-lg font-bold text-gray-900">
              {unit.block} / {unit.unit}
            </h3>
            <p className="text-sm text-gray-500">{unit.full_name ?? "—"}</p>
            {unit.purchase_value != null && (
              <p className="text-sm font-medium text-[#134e4a] mt-1">
                Contract: {formatAmount(unit.purchase_value, unit.purchase_currency ?? "EUR")}
              </p>
            )}
          </div>
          {unit.installments.length > 0 && (
            <button
              type="button"
              onClick={() => onDeletePlan(unit.id)}
              className="text-sm font-medium text-red-600 hover:text-red-700"
            >
              Delete plan
            </button>
          )}
        </div>
      </div>

      {unit.installments.length === 0 ? (
        <div className="p-6">
          {!isAdding ? (
            <button
              type="button"
              onClick={() => setAddingPlanFor(unit.id)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#134e4a] text-white text-sm font-semibold hover:bg-[#115e59]"
            >
              <i className="las la-plus" aria-hidden />
              Add payment plan
            </button>
          ) : (
            <form onSubmit={submitAddPlan} className="space-y-4 max-w-md">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Plan type</label>
                <select
                  value={planType}
                  onChange={(e) => setPlanType(e.target.value as "full" | "installments")}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                >
                  <option value="full">Full payment (one installment)</option>
                  <option value="installments">Down payment + installments</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Total amount</label>
                  <input
                    type="number"
                    min={0}
                    step={0.01}
                    value={totalAmount}
                    onChange={(e) => setTotalAmount(e.target.value)}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Currency</label>
                  <select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                  >
                    {Object.entries(CURRENCY_SYMBOLS).map(([code, sym]) => (
                      <option key={code} value={code}>{code} ({sym})</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Due date (optional)</label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                />
              </div>
              {planType === "installments" && (
                <>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Down payment (optional)</label>
                    <input
                      type="number"
                      min={0}
                      step={0.01}
                      value={downPayment}
                      onChange={(e) => setDownPayment(e.target.value)}
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Number of installments</label>
                    <input
                      type="number"
                      min={1}
                      value={installmentCount}
                      onChange={(e) => setInstallmentCount(parseInt(e.target.value, 10) || 1)}
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                    />
                  </div>
                </>
              )}
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={!canCreate}
                  className="px-4 py-2 rounded-xl bg-[#134e4a] text-white text-sm font-semibold hover:bg-[#115e59] disabled:opacity-50"
                >
                  Create plan
                </button>
                <button
                  type="button"
                  onClick={() => setAddingPlanFor(null)}
                  className="px-4 py-2 rounded-xl border border-gray-200 text-gray-700 text-sm font-semibold hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
<thead>
            <tr className="bg-gray-50/80 border-b border-gray-200">
                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Payment</th>
                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Amount</th>
                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Due date</th>
                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {unit.installments.map((inst) => (
                <InstallmentRow
                  key={inst.id}
                  inst={inst}
                  formatAmount={formatAmount}
                  formatDate={formatDate}
                  togglingId={togglingId}
                  onMarkPaid={onMarkPaid}
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
}: {
  inst: PurchaseInstallment;
  formatAmount: (v: number, c: string) => string;
  formatDate: (d: string | null) => string;
  togglingId: string | null;
  onMarkPaid: (id: string, isPaid: boolean) => Promise<void>;
}) {
  const isPaid = !!inst.paid_at;
  const loading = togglingId === inst.id;

  return (
    <tr className="hover:bg-gray-50/80">
      <td className="px-6 py-4 font-medium text-gray-900">{inst.label}</td>
      <td className="px-6 py-4 text-sm text-gray-700">
        {formatAmount(Number(inst.amount), inst.currency)}
      </td>
      <td className="px-6 py-4 text-sm text-gray-500">{formatDate(inst.due_date)}</td>
      <td className="px-6 py-4">
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
            isPaid ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
          }`}
        >
          {isPaid ? "Paid" : "Pending"}
        </span>
      </td>
      <td className="px-6 py-4 text-right">
        <button
          type="button"
          disabled={loading}
          onClick={() => onMarkPaid(inst.id, isPaid)}
          className="text-sm font-medium text-[#134e4a] hover:underline disabled:opacity-50"
        >
          {loading ? "…" : isPaid ? "Unmark paid" : "Mark as paid"}
        </button>
      </td>
    </tr>
  );
}
