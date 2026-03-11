"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { toast } from "@/lib/toast";
import { submitOnboarding } from "./actions";

const USE_CASES = [
  {
    id: "property-management",
    icon: "las la-building",
    label: "Property management",
    desc: "Manage buildings, units, and tenant occupancy.",
  },
  {
    id: "dues-collection",
    icon: "las la-receipt",
    label: "Dues & payments",
    desc: "Track aidat payments and automated invoicing.",
  },
  {
    id: "investor-relations",
    icon: "las la-user-friends",
    label: "Investor relations",
    desc: "Keep stakeholders updated with clear reports.",
  },
  {
    id: "maintenance-requests",
    icon: "las la-tools",
    label: "Maintenance requests",
    desc: "Collect and track staff tasks and requests.",
  },
  {
    id: "weekly-updates",
    icon: "las la-camera-retro",
    label: "Weekly photo updates",
    desc: "Document and share project progress visually.",
  },
  {
    id: "financial-reporting",
    icon: "las la-chart-pie",
    label: "Financial reporting",
    desc: "Monitor cashflow and installment payments.",
  },
] as const;

type UseCaseId = (typeof USE_CASES)[number]["id"];

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState<0 | 1 | 2 | 3 | 4>(0);
  const [step1Confirming, setStep1Confirming] = useState(false);
  const [useCases, setUseCases] = useState<UseCaseId[]>([]);
  const [projectName, setProjectName] = useState("");
  const [location, setLocation] = useState("");
  const [fullName, setFullName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [selectedTimezone, setSelectedTimezone] = useState(Intl.DateTimeFormat().resolvedOptions().timeZone);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [done, setDone] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleConfirm = async () => {
    if (!selectedDate || !selectedTime) return;

    setIsSubmitting(true);
    try {
      await submitOnboarding({
        full_name: fullName,
        company_name: companyName,
        location,
        email,
        phone,
        use_cases: [...useCases],
        demo_date: selectedDate.toISOString().split('T')[0],
        demo_time: selectedTime,
        demo_timezone: selectedTimezone,
      });
      setDone(true);
      toast.success("Demo request submitted successfully!");
    } catch (error) {
      console.error(error);
      toast.error("Failed to submit demo request. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Common timezones list
  const COMMON_TIMEZONES = [
    "UTC",
    "Europe/London",
    "Europe/Paris",
    "Europe/Belgrade",
    "Europe/Kyiv",
    "Europe/Moscow",
    "Europe/Istanbul",
    "Europe/Berlin",
    "America/New_York",
    "America/Los_Angeles",
    "America/Chicago",
    "Asia/Dubai",
    "Asia/Tokyo",
    "Asia/Singapore",
    "Australia/Sydney",
  ];

  // Add current timezone if not in list
  const timezones = Array.from(new Set([selectedTimezone, ...COMMON_TIMEZONES])).sort();

  const goToStep2 = () => {
    setStep(2);
    setStep1Confirming(false);
  };

  const toggleUseCase = (id: UseCaseId) => {
    setUseCases((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const canProceed1 = useCases.length > 0;
  const canProceed2 = fullName.trim() && companyName.trim() && location.trim() && email.trim() && phone.trim();

  if (done) {
    return (
      <div className="min-h-screen bg-[#f9fafb] flex items-center justify-center px-6">
        <div className="max-w-lg w-full text-center animate-fade-in-up">
          <div className="size-20 rounded-full bg-[#134e4a]/10 flex items-center justify-center mx-auto mb-6 transition-transform duration-300 hover:scale-105">
            <i className="las la-calendar-check text-4xl text-[#134e4a]" aria-hidden />
          </div>
          <h2 className="text-3xl font-extrabold text-gray-900 mb-4">
            You&apos;re all set!
          </h2>
          <p className="text-gray-500 text-base leading-relaxed mb-8">
            Your personalised experience is ready. Dive in now to explore the demo dashboard and see Riviola in action.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/demo/staff"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-[#134e4a] text-white font-bold hover:bg-[#115e59] transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-[#134e4a]/20"
            >
              Explore Demo Dashboard
              <i className="las la-arrow-right" aria-hidden />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f9fafb] flex flex-col">
      {/* Top bar */}
      <div className="flex items-center justify-between px-8 py-5 border-b border-gray-200 bg-white">
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="/mainlogo.png"
            alt="Riviola"
            width={32}
            height={32}
            className="size-8 rounded-lg object-contain shrink-0"
          />
          <span className="text-base font-extrabold text-[#134e4a]">Riviola</span>
        </Link>
        {/* Step indicator */}
        <div className={`flex items-center gap-2 transition-opacity duration-300 ${step === 0 ? "opacity-0 pointer-events-none" : "opacity-100"}`}>
          {([1, 2, 3, 4] as const).map((s) => (
            <div
              key={s}
              className={`flex items-center gap-2 ${s < 4 ? "after:content-[''] after:w-8 after:h-px after:mx-1 after:bg-gray-200" : ""}`}
            >
              <div
                className={`size-7 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ease-out ${step === s
                  ? "bg-[#134e4a] text-white scale-110"
                  : step > s
                    ? "bg-[#134e4a]/15 text-[#134e4a]"
                    : "bg-gray-100 text-gray-400"
                  }`}
              >
                {step > s ? <i className="las la-check text-xs" aria-hidden /> : s}
              </div>
            </div>
          ))}
        </div>
        <Link href="/" className="text-sm text-gray-400 hover:text-gray-600 transition-colors">
          Exit
        </Link>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">

        {/* ── STEP 0 → Welcome ── */}
        {step === 0 && (
          <div key="step0-welcome" className="w-full max-w-6xl px-6 flex flex-col items-center justify-center min-h-[280px]">
            <p className="text-center text-5xl md:text-7xl font-medium text-[#134e4a] animate-smooth-in w-full max-w-5xl">
              Welcome to Riviola
            </p>
            <button
              type="button"
              onClick={() => setStep(1)}
              className="animate-smooth-in animate-btn-pulse mt-10 flex items-center gap-2 px-6 py-3 rounded-xl bg-[#134e4a] text-white font-semibold hover:bg-[#115e59] transition-colors cursor-pointer"
            >
              Get Started <i className="las la-arrow-right" aria-hidden />
            </button>
          </div>
        )}

        {/* ── STEP 1 → Transition (message + blinking Continue) ── */}
        {step === 1 && step1Confirming && (
          <div key="step1-transition" className="w-full max-w-6xl px-6 flex flex-col items-center justify-center min-h-[280px]">
            <p className="text-center text-5xl md:text-7xl font-medium text-[#134e4a] animate-smooth-in w-full max-w-5xl">
              The features you selected are great. Let&apos;s move on to the next step.
            </p>
            <button
              type="button"
              onClick={goToStep2}
              className="animate-smooth-in animate-btn-pulse mt-10 flex items-center gap-2 px-6 py-3 rounded-xl bg-[#134e4a] text-white font-semibold hover:bg-[#115e59] transition-colors cursor-pointer"
            >
              Continue <i className="las la-arrow-right" aria-hidden />
            </button>
          </div>
        )}

        {/* ── STEP 1 ── */}
        {step === 1 && !step1Confirming && (
          <div key="step1" className="max-w-2xl w-full animate-fade-in-up">
            <div className="text-center mb-10">
              <p className="text-xs font-bold uppercase tracking-widest text-[#134e4a] mb-3">Step 1 of 3</p>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
                What will you use Riviola for?
              </h1>
              <p className="text-gray-500 mt-3 text-sm">
                You can select more than one option.
              </p>
            </div>
            <div className="grid sm:grid-cols-2 gap-3">
              {USE_CASES.map((u, idx) => {
                const selected = useCases.includes(u.id);
                return (
                  <button
                    key={u.id}
                    type="button"
                    onClick={() => toggleUseCase(u.id)}
                    className={`relative text-left p-5 rounded-2xl border-2 transition-all duration-300 ease-out animate-fade-in-up w-full ${idx === 0 ? "delay-50" : idx === 1 ? "delay-100" : idx === 2 ? "delay-150" : idx === 3 ? "delay-200" : idx === 4 ? "delay-250" : "delay-300"
                      } ${selected
                        ? "border-[#134e4a] bg-[#134e4a]/5 shadow-md shadow-[#134e4a]/10"
                        : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-md"
                      }`}
                  >
                    <div className={`size-12 rounded-xl flex items-center justify-center mb-3 transition-colors ${selected ? "bg-[#134e4a] text-white" : "bg-[#134e4a]/10 text-[#134e4a]"
                      }`}>
                      <i className={`las ${u.icon} text-2xl`} aria-hidden />
                    </div>
                    <p className={`font-bold ${selected ? "text-[#134e4a]" : "text-gray-900"}`}>
                      {u.label}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">
                      {u.desc}
                    </p>
                    {selected && (
                      <div className="absolute top-4 right-4 size-6 rounded-full bg-[#134e4a] flex items-center justify-center">
                        <i className="las la-check text-white text-xs" aria-hidden />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
            <div className="flex justify-end mt-8">
              <button
                type="button"
                disabled={!canProceed1}
                onClick={() => setStep1Confirming(true)}
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-[#134e4a] text-white font-semibold hover:bg-[#115e59] disabled:opacity-40 disabled:pointer-events-none transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
              >
                Continue <i className="las la-arrow-right" aria-hidden />
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 2 ── */}
        {step === 2 && (
          <div key="step2" className="max-w-xl w-full animate-fade-in-up">
            <div className="text-center mb-10">
              <p className="text-xs font-bold uppercase tracking-widest text-[#134e4a] mb-3">Step 2 of 3</p>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
                Brief project details
              </h1>
              <p className="text-gray-500 mt-3 text-sm">
                Five fields — that is all we need to tailor your experience.
              </p>
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm space-y-5 transition-shadow duration-300 hover:shadow-md">
              <div>
                <label htmlFor="pfull" className="block text-sm font-semibold text-gray-700 mb-1">
                  Full name
                </label>
                <input
                  id="pfull"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. John Doe"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#134e4a] focus:ring-2 focus:ring-[#134e4a]/15 outline-none transition-colors text-sm"
                />
              </div>
              <div>
                <label htmlFor="plocation" className="block text-sm font-semibold text-gray-700 mb-1">
                  Company name
                </label>
                <input
                  id="pcompany"
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="e.g. Riviola Ltd."
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#134e4a] focus:ring-2 focus:ring-[#134e4a]/15 outline-none transition-colors text-sm"
                />
              </div>
              <div>
                <label htmlFor="plocation" className="block text-sm font-semibold text-gray-700 mb-1">
                  Location
                </label>
                <input
                  id="plocation"
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="City, Country"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#134e4a] focus:ring-2 focus:ring-[#134e4a]/15 outline-none transition-colors text-sm"
                />
              </div>
              <div>
                <label htmlFor="pemail" className="block text-sm font-semibold text-gray-700 mb-1">
                  Contact email
                </label>
                <input
                  id="pemail"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#134e4a] focus:ring-2 focus:ring-[#134e4a]/15 outline-none transition-colors text-sm"
                />
              </div>
              <div>
                <label htmlFor="pphone" className="block text-sm font-semibold text-gray-700 mb-1">
                  Phone
                </label>
                <input
                  id="pphone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+90 5xx xxx xx xx"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#134e4a] focus:ring-2 focus:ring-[#134e4a]/15 outline-none transition-colors text-sm"
                />
                <p className="text-[10px] text-gray-400 mt-1 font-medium italic">
                  * Please do not remove or delete the country code (e.g., +90, +382).
                </p>
              </div>
            </div>
            <div className="flex items-center justify-between mt-8">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="flex items-center gap-1 text-sm font-semibold text-gray-500 hover:text-gray-700 transition-all duration-200 hover:scale-[1.02]"
              >
                <i className="las la-arrow-left" aria-hidden /> Back
              </button>
              <button
                type="button"
                disabled={!canProceed2}
                onClick={() => setStep(3)}
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-[#134e4a] text-white font-semibold hover:bg-[#115e59] disabled:opacity-40 disabled:pointer-events-none transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
              >
                Continue <i className="las la-arrow-right" aria-hidden />
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 3 ── */}
        {step === 3 && (
          <div key="step3" className="max-w-2xl w-full animate-fade-in-up">
            <div className="text-center mb-10">
              <p className="text-xs font-bold uppercase tracking-widest text-[#134e4a] mb-3">Step 3 of 3</p>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
                The Riviola experience
              </h1>
              <p className="text-gray-500 mt-3 text-sm">
                Book a private demo and we will tailor the session to your project.
              </p>
            </div>
            <div className="max-w-xl mx-auto">
              <div className="text-left p-6 rounded-2xl border-2 border-[#134e4a] bg-[#134e4a] text-white shadow-xl shadow-[#134e4a]/20 transition-all duration-300">
                <div className="size-12 rounded-xl flex items-center justify-center mb-4 bg-white/20">
                  <i className="las la-calendar-check text-2xl text-white" aria-hidden />
                </div>
                <p className="font-bold text-lg text-white">
                  Book a private demo
                </p>
                <p className="text-xs font-semibold mt-1 text-white/70">
                  Recommended
                </p>
                <p className="text-sm mt-3 leading-relaxed text-white/80">
                  Reserve a dedicated session with a Riviola specialist. We will tailor the demo to your project — live, personal, and precise.
                </p>
              </div>
            </div>
            <div className="flex items-center justify-between mt-8 max-w-xl mx-auto">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="flex items-center gap-1 text-sm font-semibold text-gray-500 hover:text-gray-700 transition-all duration-200 hover:scale-[1.02]"
              >
                <i className="las la-arrow-left" aria-hidden /> Back
              </button>
              <button
                type="button"
                onClick={() => setStep(4)}
                className="flex items-center gap-2 px-7 py-3 rounded-xl bg-[#134e4a] text-white font-semibold hover:bg-[#115e59] transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
              >
                Choose time <i className="las la-arrow-right" aria-hidden />
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 4 → Booking Calendar ── */}
        {step === 4 && (
          <div key="step4" className="max-w-4xl w-full animate-fade-in-up">
            <div className="text-center mb-10">
              <p className="text-xs font-bold uppercase tracking-widest text-[#134e4a] mb-3">Step 4 of 4</p>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
                Select a date & time
              </h1>
              <p className="text-gray-500 mt-3 text-sm">
                Pick a slot for your personalized demo session.
              </p>
            </div>

            <div className="grid lg:grid-cols-[1.2fr_0.8fr] gap-8 bg-white rounded-3xl border border-gray-100 p-8 shadow-xl shadow-gray-200/50">
              {/* Calendar Column */}
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-bold text-gray-900 text-lg">
                    {currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}
                  </h3>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setCurrentMonth(new Date(currentMonth.setMonth(currentMonth.getMonth() - 1)))}
                      className="size-10 rounded-xl flex items-center justify-center border border-gray-200 hover:bg-gray-50 transition-colors"
                    >
                      <i className="las la-angle-left" />
                    </button>
                    <button
                      onClick={() => setCurrentMonth(new Date(currentMonth.setMonth(currentMonth.getMonth() + 1)))}
                      className="size-10 rounded-xl flex items-center justify-center border border-gray-200 hover:bg-gray-50 transition-colors"
                    >
                      <i className="las la-angle-right" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-7 gap-1 mb-2">
                  {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                    <div key={day} className="text-center text-[10px] font-bold text-gray-400 uppercase tracking-wider h-8 flex items-center justify-center">
                      {day}
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-7 gap-2">
                  {(() => {
                    const days = [];
                    const firstDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
                    const lastDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);

                    // Padding for first day (Monday-based)
                    let startDay = firstDay.getDay() - 1;
                    if (startDay === -1) startDay = 6;

                    for (let i = 0; i < startDay; i++) {
                      days.push(<div key={`empty-${i}`} className="h-12" />);
                    }

                    for (let d = 1; d <= lastDay.getDate(); d++) {
                      const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), d);
                      const isToday = new Date().toDateString() === date.toDateString();
                      const isPast = date < new Date(new Date().setHours(0, 0, 0, 0));
                      const isSelected = selectedDate?.toDateString() === date.toDateString();

                      days.push(
                        <button
                          key={d}
                          onClick={() => !isPast && setSelectedDate(date)}
                          disabled={isPast}
                          className={`h-12 rounded-xl flex items-center justify-center text-sm font-semibold transition-all
                            ${isSelected ? 'bg-[#134e4a] text-white shadow-lg shadow-[#134e4a]/30 scale-105' :
                              isPast ? 'text-gray-300 cursor-not-allowed' :
                                'text-gray-700 hover:bg-gray-100'}
                            ${isToday && !isSelected ? 'text-[#134e4a] underline decoration-2 underline-offset-4' : ''}
                          `}
                        >
                          {d}
                        </button>
                      );
                    }
                    return days;
                  })()}
                </div>
              </div>

              {/* Time Slots Column */}
              <div className="border-t lg:border-t-0 lg:border-l border-gray-100 pt-8 lg:pt-0 lg:pl-8">
                <h3 className="font-bold text-gray-900 text-lg mb-6">
                  {selectedDate ? selectedDate.toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' }) : 'Select a date'}
                </h3>

                {selectedDate ? (
                  <div className="grid grid-cols-2 gap-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                    {['09:00', '10:00', '11:00', '13:00', '14:00', '15:00', '16:00', '17:00'].map(time => (
                      <button
                        key={time}
                        onClick={() => setSelectedTime(time)}
                        className={`py-3 rounded-xl text-sm font-bold border-2 transition-all
                          ${selectedTime === time
                            ? 'border-[#134e4a] bg-[#134e4a]/5 text-[#134e4a] shadow-sm'
                            : 'border-gray-100 hover:border-gray-200 text-gray-600'}
                        `}
                      >
                        {time}
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="h-40 flex flex-col items-center justify-center text-gray-400 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                    <i className="las la-calendar text-3xl mb-2" />
                    <p className="text-xs">Pick a day first</p>
                  </div>
                )}

                <div className="mt-8 space-y-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                      Timezone
                    </label>
                    <div className="relative">
                      <select
                        value={selectedTimezone}
                        onChange={(e) => setSelectedTimezone(e.target.value)}
                        className="w-full bg-gray-50 border border-gray-100 text-gray-600 text-xs rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-[#134e4a]/10 appearance-none cursor-pointer"
                      >
                        {timezones.map(tz => (
                          <option key={tz} value={tz}>{tz}</option>
                        ))}
                      </select>
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 text-xs">
                        <i className="las la-angle-down" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between mt-10">
              <button
                type="button"
                onClick={() => setStep(3)}
                className="flex items-center gap-1 text-sm font-semibold text-gray-500 hover:text-gray-700"
              >
                <i className="las la-arrow-left" /> Back
              </button>
              <button
                type="button"
                disabled={!selectedDate || !selectedTime || isSubmitting}
                onClick={handleConfirm}
                className="flex items-center gap-2 px-10 py-4 rounded-xl bg-[#134e4a] text-white font-bold hover:bg-[#115e59] disabled:opacity-40 disabled:pointer-events-none transition-all shadow-lg shadow-[#134e4a]/20"
              >
                {isSubmitting ? (
                  <>
                    Submitting... <i className="las la-spinner animate-spin" />
                  </>
                ) : (
                  <>
                    Confirm Booking <i className="las la-check" />
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
