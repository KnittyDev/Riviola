"use client";

import { useState } from "react";
import Link from "next/link";

const USE_CASES = [
  {
    id: "project-management",
    icon: "las la-tasks",
    label: "Project management",
    desc: "Tasks, progress, and team coordination.",
  },
  {
    id: "investor-communication",
    icon: "las la-users",
    label: "Communication with investors",
    desc: "Stakeholder updates and transparent reporting.",
  },
  {
    id: "photo-documentation",
    icon: "las la-camera",
    label: "Photo documentation",
    desc: "Construction site and progress visual documentation.",
  },
  {
    id: "financial-tracking",
    icon: "las la-chart-line",
    label: "Financial tracking",
    desc: "Budget, cost, and reporting.",
  },
  {
    id: "milestones",
    icon: "las la-flag-checkered",
    label: "Task tracking and milestones",
    desc: "Stages, delivery dates, and status.",
  },
] as const;

type UseCaseId = (typeof USE_CASES)[number]["id"];

export default function OnboardingPage() {
  const [step, setStep] = useState<0 | 1 | 2 | 3>(0);
  const [step1Confirming, setStep1Confirming] = useState(false);
  const [useCases, setUseCases] = useState<UseCaseId[]>([]);
  const [projectName, setProjectName] = useState("");
  const [location, setLocation] = useState("");
  const [unitCount, setUnitCount] = useState("");
  const [done, setDone] = useState(false);

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
  const canProceed2 = projectName.trim() && location.trim() && unitCount;

  if (done) {
    return (
      <div className="min-h-screen bg-[#f9fafb] flex items-center justify-center px-6">
        <div className="max-w-lg w-full text-center animate-fade-in-up">
          <div className="size-20 rounded-full bg-[#134e4a]/10 flex items-center justify-center mx-auto mb-6 transition-transform duration-300 hover:scale-105">
            <i className="las la-calendar-check text-4xl text-[#134e4a]" aria-hidden />
          </div>
          <h2 className="text-2xl font-extrabold text-gray-900 mb-3">
            Your demo is booked.
          </h2>
          <p className="text-gray-500 text-sm leading-relaxed mb-8">
            A Riviola specialist will reach out within 24 hours to confirm your personalised session. In the meantime, explore the platform.
          </p>
          <Link
            href="/dashboard/staff"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#134e4a] text-white font-semibold hover:bg-[#115e59] transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
          >
            Enter platform
            <i className="las la-arrow-right" aria-hidden />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f9fafb] flex flex-col">
      {/* Top bar */}
      <div className="flex items-center justify-between px-8 py-5 border-b border-gray-200 bg-white">
        <Link href="/" className="flex items-center gap-2">
          <div className="size-8 rounded-lg bg-[#134e4a] flex items-center justify-center text-white">
            <i className="las la-building" aria-hidden />
          </div>
          <span className="text-base font-extrabold text-[#134e4a]">Riviola</span>
        </Link>
        {/* Step indicator */}
        <div className={`flex items-center gap-2 transition-opacity duration-300 ${step === 0 ? "opacity-0 pointer-events-none" : "opacity-100"}`}>
          {([1, 2, 3] as const).map((s) => (
            <div
              key={s}
              className={`flex items-center gap-2 ${s < 3 ? "after:content-[''] after:w-8 after:h-px after:mx-1 after:bg-gray-200" : ""}`}
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
                const isLast = idx === USE_CASES.length - 1;
                const card = (
                  <button
                    key={u.id}
                    type="button"
                    onClick={() => toggleUseCase(u.id)}
                    className={`relative text-left p-5 rounded-2xl border-2 transition-all duration-300 ease-out animate-fade-in-up w-full ${isLast ? "sm:w-[calc((100%-0.75rem)/2)]" : ""
                      } ${idx === 0 ? "delay-50" : idx === 1 ? "delay-100" : idx === 2 ? "delay-150" : idx === 3 ? "delay-200" : "delay-250"
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
                if (isLast) {
                  return (
                    <div key={u.id} className="sm:col-span-2 flex sm:justify-center">
                      {card}
                    </div>
                  );
                }
                return card;
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
                Three fields — that is all we need to tailor your experience.
              </p>
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm space-y-5 transition-shadow duration-300 hover:shadow-md">
              <div>
                <label htmlFor="pname" className="block text-sm font-semibold text-gray-700 mb-1">
                  Project name
                </label>
                <input
                  id="pname"
                  type="text"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  placeholder="e.g. Porto Budva"
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
                <label htmlFor="punits" className="block text-sm font-semibold text-gray-700 mb-1">
                  Unit count
                </label>
                <input
                  id="punits"
                  type="number"
                  min={1}
                  value={unitCount}
                  onChange={(e) => setUnitCount(e.target.value)}
                  placeholder="How many units / apartments?"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#134e4a] focus:ring-2 focus:ring-[#134e4a]/15 outline-none transition-colors text-sm"
                />
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
                onClick={() => setDone(true)}
                className="flex items-center gap-2 px-7 py-3 rounded-xl bg-[#134e4a] text-white font-semibold hover:bg-[#115e59] transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
              >
                Book my demo <i className="las la-arrow-right" aria-hidden />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
