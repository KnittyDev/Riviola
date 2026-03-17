"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PhoneInput } from "react-international-phone";
import "react-international-phone/style.css";
import { createInvestorAction } from "@/app/[locale]/dashboard/staff/investors/actions";
import { useTranslations } from "next-intl";

const inputClass =
  "w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#134e4a] focus:ring-2 focus:ring-[#134e4a]/20 outline-none transition-colors";
const labelClass = "block text-sm font-semibold text-gray-700 mb-1";

export type BuildingOption = {
  id: string;
  name: string;
  location: string | null;
  blocks: string[];
  floors: number;
};

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

function formatAmount(value: number, currency: string): string {
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
  const sym = symbols[currency] ?? currency + " ";
  return `${sym}${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function NewInvestorForm({ buildings }: { buildings: BuildingOption[] }) {
  const t = useTranslations("Investors.newAccount");
  const tModal = useTranslations("Investors.modal");
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [buildingId, setBuildingId] = useState("");
  const [block, setBlock] = useState("");
  const [unit, setUnit] = useState("");
  const [areaM2, setAreaM2] = useState<string>("");
  const [deliveryPeriod, setDeliveryPeriod] = useState("");
  const [totalAmount, setTotalAmount] = useState<string>("");
  const [currency, setCurrency] = useState<string>("EUR");
  const [investorType, setInvestorType] = useState<"renter" | "buyer">("buyer");
  const [paymentPlanType, setPaymentPlanType] = useState<"full" | "installments">("full");
  const [installmentCount, setInstallmentCount] = useState<number>(6);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const errorRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    if (error) errorRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [error]);

  const selected = buildings.find((b) => b.id === buildingId);
  const blocks = selected?.blocks ?? [];
  const floorCount = selected?.floors ?? 6;
  const floorOptions = Array.from({ length: floorCount }, (_, i) => i + 1);

  const totalNum = totalAmount.trim() === "" ? null : parseFloat(totalAmount);
  const isValidTotal = totalNum != null && !Number.isNaN(totalNum) && totalNum >= 0;
  const installmentPreview =
    paymentPlanType === "installments" && isValidTotal && installmentCount >= 1
      ? totalNum! / installmentCount
      : null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const areaNum = areaM2.trim() === "" ? null : parseFloat(areaM2);
      const validArea = areaNum != null && !Number.isNaN(areaNum) && areaNum >= 0;
      const result = await createInvestorAction({
        fullName: fullName.trim(),
        email: email.trim(),
        password,
        phone: phone.trim() || null,
        buildingId,
        block: block.trim(),
        unit: unit.trim(),
        areaM2: validArea ? areaNum : null,
        deliveryPeriod: deliveryPeriod.trim() || null,
        purchaseValue: isValidTotal ? totalNum! : null,
        purchaseCurrency: currency.trim() || null,
        investorType,
      });
      if (!result) {
        setError(t("serverError"));
        return;
      }
      if (result.ok) {
        setSuccess(true);
        router.refresh();
        router.push("/dashboard/staff/investors");
        return;
      }
      const message =
        typeof result.error === "string"
          ? result.error
          : (result as { message?: string }).message ?? t("fallbackError");
      setError(message);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : t("genericError");
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
      <Link
        href="/dashboard/staff"
        className="inline-flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-[#134e4a] mb-6"
      >
        <i className="las la-arrow-left" aria-hidden />
        {t("back")}
      </Link>
      <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">
        {t("title")}
      </h1>
      <p className="text-gray-500 mt-1 mb-8">
        {t("subtitle")}
      </p>
      <form
        className="space-y-6 bg-white rounded-2xl border border-gray-200 p-6 shadow-sm"
        onSubmit={handleSubmit}
      >
        {error && (
          <p
            ref={errorRef}
            className="text-red-600 text-sm p-3 rounded-xl bg-red-50 border border-red-100"
            role="alert"
          >
            {error}
          </p>
        )}
        {success && (
          <p className="text-green-700 text-sm p-3 rounded-xl bg-green-50 border border-green-100">
            {t("successRedirect")}
          </p>
        )}
        <div>
          <label htmlFor="name" className={labelClass}>
            {t("fullName")}
          </label>
          <input
            id="name"
            name="name"
            type="text"
            placeholder={t("fullNamePlaceholder")}
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="email" className={labelClass}>
            {t("email")}
          </label>
          <input
            id="email"
            name="email"
            type="email"
            placeholder={t("emailPlaceholder")}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="password" className={labelClass}>
            {t("password")}
          </label>
          <input
            id="password"
            name="password"
            type="password"
            placeholder={t("passwordPlaceholder")}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="phone" className={labelClass}>
            {t("phone")}
          </label>
          <div className="w-full [&_.react-international-phone-input-container]:!w-full [&_.react-international-phone-input]:!w-full [&_.react-international-phone-input]:!rounded-xl [&_.react-international-phone-input]:!border-gray-200 [&_.react-international-phone-input]:!px-4 [&_.react-international-phone-input]:!py-3 [&_.react-international-phone-input]:!text-sm">
            <PhoneInput
              defaultCountry="tr"
              value={phone}
              onChange={(value) => setPhone(value)}
              inputProps={{ 
                id: "phone", 
                name: "phone", 
                placeholder: t("phonePlaceholder") 
              }}
            />
          </div>
          <p className="text-[10px] text-gray-400 mt-1 font-medium italic">
            {t("phoneNote")}
          </p>
        </div>
        <div>
          <label htmlFor="investorType" className={labelClass}>
            {t("investorType")}
          </label>
          <select
            id="investorType"
            name="investorType"
            value={investorType}
            onChange={(e) => setInvestorType(e.target.value as "renter" | "buyer")}
            className={inputClass}
          >
            <option value="buyer">{tModal("investorTypeOptions.buyer")}</option>
            <option value="renter">{tModal("investorTypeOptions.renter")}</option>
          </select>
        </div>

        <hr className="border-gray-200" />

        <div>
          <label htmlFor="building" className={labelClass}>
            {t("project")}
          </label>
          <select
            id="building"
            name="building"
            value={buildingId}
            onChange={(e) => {
              setBuildingId(e.target.value);
              setBlock("");
            }}
            className={inputClass}
          >
            <option value="">{t("selectProject")}</option>
            {buildings.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name} – {b.location || "—"}
              </option>
            ))}
          </select>
        </div>

        {buildingId && (
          <>
            <div>
              <label htmlFor="block" className={labelClass}>
                {t("block")}
              </label>
              <select
                id="block"
                name="block"
                value={block}
                onChange={(e) => setBlock(e.target.value)}
                required
                className={inputClass}
              >
                <option value="">{t("selectBlock")}</option>
                {blocks.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="floor" className={labelClass}>
                  {t("floor")}
                </label>
                <select id="floor" name="floor" className={inputClass}>
                  <option value="">{t("selectFloor")}</option>
                  {floorOptions.map((f) => (
                    <option key={f} value={f}>
                      {f}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="unit" className={labelClass}>
                  {t("unit")}
                </label>
                <input
                  id="unit"
                  name="unit"
                  type="text"
                  placeholder={t("unitPlaceholder")}
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  required
                  className={inputClass}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="areaM2" className={labelClass}>
                  {t("area")}
                </label>
                <input
                  id="areaM2"
                  name="areaM2"
                  type="number"
                  min={0}
                  step={0.01}
                  placeholder={t("areaPlaceholder")}
                  value={areaM2}
                  onChange={(e) => setAreaM2(e.target.value)}
                  className={inputClass}
                />
              </div>
              <div>
                <label htmlFor="deliveryPeriod" className={labelClass}>
                  {t("deliveryPeriod")}
                </label>
                <input
                  id="deliveryPeriod"
                  name="deliveryPeriod"
                  type="text"
                  placeholder={t("deliveryPeriodPlaceholder")}
                  value={deliveryPeriod}
                  onChange={(e) => setDeliveryPeriod(e.target.value)}
                  className={inputClass}
                />
              </div>
            </div>
          </>
        )}

        <hr className="border-gray-200" />

        <div>
          <span className={labelClass}>{t("amountTitle")}</span>
          <p className="text-xs text-gray-500 mb-2">
            {t("amountSubtitle")}
          </p>
          <div className="flex flex-wrap gap-3 items-end">
            <div className="flex-1 min-w-[10rem]">
              <input
                id="totalAmount"
                name="totalAmount"
                type="number"
                min={0}
                step={0.01}
                placeholder={t("amountPlaceholder")}
                value={totalAmount}
                onChange={(e) => setTotalAmount(e.target.value)}
                className={inputClass}
              />
            </div>
            <div className="w-32">
              <label htmlFor="currency" className="sr-only">Currency</label>
              <select
                id="currency"
                name="currency"
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className={inputClass}
              >
                {CURRENCIES.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div>
          <span className={labelClass}>{t("paymentPlan")}</span>
          <p className="text-xs text-gray-500 mb-3">
            {t("paymentPlanSubtitle")}
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
              <span className="text-sm font-medium text-gray-900">{t("fullPayment")}</span>
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
              <span className="text-sm font-medium text-gray-900">{t("installments")}</span>
            </label>
          </div>
          {paymentPlanType === "installments" && (
            <div className="mt-4 pl-9">
              <label htmlFor="installmentCount" className={labelClass}>
                {t("installmentCount")}
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

          {/* Payment preview */}
          <div className="mt-4 p-4 rounded-xl bg-teal-50 border border-teal-100">
            <p className="text-sm font-semibold text-teal-900 mb-1">{t("preview")}</p>
            {!isValidTotal ? (
              <p className="text-sm text-teal-700">{t("previewHint")}</p>
            ) : paymentPlanType === "full" ? (
              <p className="text-sm text-teal-800">
                {t("onetimePayment", { amount: formatAmount(totalNum!, currency) })}
              </p>
            ) : (
              <div className="text-sm text-teal-800 space-y-0.5">
                <p>
                  {t("installmentsOf", { 
                    count: installmentCount, 
                    amount: formatAmount(installmentPreview!, currency) 
                  })}
                </p>
                <p>
                  {t("totalPreview", { amount: formatAmount(totalNum!, currency) })}
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 rounded-xl bg-[#134e4a] text-white font-semibold hover:bg-[#115e59] disabled:opacity-60 disabled:pointer-events-none transition-colors"
          >
            {loading ? t("creating") : t("create")}
          </button>
          <Link
            href="/dashboard/staff"
            className="px-6 py-3 rounded-xl border border-gray-200 text-gray-700 font-semibold hover:bg-gray-50 transition-colors"
          >
            {t("cancel")}
          </Link>
        </div>
      </form>
    </div>
  );
}
