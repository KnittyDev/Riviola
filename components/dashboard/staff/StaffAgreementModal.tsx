"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { toast } from "@/lib/toast";

export function StaffAgreementModal({ userId }: { userId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [accepted, setAccepted] = useState(false);

  const handleAccept = async () => {
    if (!accepted) {
      toast.error("Please read and check the acceptance box.");
      return;
    }

    setLoading(true);
    const supabase = createClient();
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ staff_agreement_accepted: true })
        .eq("id", userId);

      if (error) throw error;
      
      toast.success("Agreement accepted successfully.");
      router.refresh();
    } catch (error) {
      console.error(error);
      toast.error("Failed to update agreement status.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] bg-gray-900/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-fade-in-up">
        {/* Header */}
        <div className="px-8 py-6 border-b border-gray-100 flex items-center gap-4 bg-teal-50/50">
          <div className="size-12 rounded-2xl bg-teal-600 text-white flex items-center justify-center shrink-0 shadow-lg shadow-teal-600/20">
            <i className="las la-file-contract text-2xl" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-[#134e4a]">Service Agreement</h2>
            <p className="text-xs text-gray-500 font-medium">Please review and accept our professional terms of service.</p>
          </div>
        </div>

        {/* Content (Scrollable) */}
        <div className="flex-1 overflow-y-auto p-8 space-y-6 custom-scrollbar">
          <section className="space-y-2">
            <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
              <span className="size-5 rounded bg-teal-100 text-teal-700 text-[10px] flex items-center justify-center">01</span>
              Data Ownership & Privacy
            </h3>
            <p className="text-sm text-gray-600 leading-relaxed italic border-l-2 border-teal-100 pl-4">
              The User (Contractor/Staff) owns all uploaded content (photos, documents); however, Riviola is granted the right to process and store this data to ensure system functionality and service delivery.
            </p>
          </section>

          <section className="space-y-2">
            <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
              <span className="size-5 rounded bg-teal-100 text-teal-700 text-[10px] flex items-center justify-center">02</span>
              Liability Limitation
            </h3>
            <p className="text-sm text-gray-600 leading-relaxed italic border-l-2 border-teal-100 pl-4">
              Riviola is strictly an information-sharing platform. The User is solely responsible for the accuracy of all data entered into the system. Riviola remains neutral in disputes between Developers and Investors and cannot be held liable for discrepancies.
            </p>
          </section>

          <section className="space-y-2">
            <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
              <span className="size-5 rounded bg-teal-100 text-teal-700 text-[10px] flex items-center justify-center">03</span>
              The SaaS License
            </h3>
            <p className="text-sm text-gray-600 leading-relaxed italic border-l-2 border-teal-100 pl-4">
              This is a Software as a Service (SaaS). Ownership of the software, its source code, design, and intellectual property belongs exclusively to Riviola. No ownership rights are transferred to the User.
            </p>
          </section>

          <section className="space-y-2">
            <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
              <span className="size-5 rounded bg-teal-100 text-teal-700 text-[10px] flex items-center justify-center">04</span>
              Payment & Suspension
            </h3>
            <p className="text-sm text-gray-600 leading-relaxed italic border-l-2 border-teal-100 pl-4">
              Continuous access is contingent upon timely payment. In the event of a payment delay exceeding seven (7) business days, system access (including Investor Panels) will be automatically suspended until the account is settled.
            </p>
          </section>

          <section className="space-y-2">
            <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
              <span className="size-5 rounded bg-teal-100 text-teal-700 text-[10px] flex items-center justify-center">05</span>
              Independent Contractor Status
            </h3>
            <p className="text-sm text-gray-600 leading-relaxed italic border-l-2 border-teal-100 pl-4">
              Using Riviola does not create an employer-employee relationship, partnership, or joint venture between the User and Riviola. The User operates as an independent professional.
            </p>
          </section>
        </div>

        {/* Footer */}
        <div className="p-8 border-t border-gray-100 bg-gray-50/50">
          <label className="flex items-start gap-3 cursor-pointer group mb-6">
            <div className="relative flex items-center">
              <input
                type="checkbox"
                checked={accepted}
                onChange={(e) => setAccepted(e.target.checked)}
                className="peer sr-only"
              />
              <div className="size-5 rounded-md border-2 border-gray-300 peer-checked:border-teal-600 peer-checked:bg-teal-600 transition-all group-hover:border-teal-400" />
              <i className="las la-check absolute text-[10px] text-white opacity-0 peer-checked:opacity-100 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 transition-opacity" />
            </div>
            <span className="text-sm text-gray-600 font-medium select-none">
              I have read, understood, and accept the Riviola Professional Service Agreement.
            </span>
          </label>

          <button
            onClick={handleAccept}
            disabled={!accepted || loading}
            className="w-full py-4 rounded-2xl bg-teal-600 text-white font-bold hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-teal-600/20 active:scale-[0.98]"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                Processing... <i className="las la-spinner animate-spin" />
              </span>
            ) : (
              "Confirm & Access Dashboard"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
