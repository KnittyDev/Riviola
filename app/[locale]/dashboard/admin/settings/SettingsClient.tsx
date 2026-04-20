"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "@/lib/toast";
import { toggleMaintenanceMode } from "./actions";

export function SettingsClient({ initialMaintenanceMode }: { initialMaintenanceMode: boolean }) {
  const t = useTranslations("Admin");
  const [maintenanceMode, setMaintenanceMode] = useState(initialMaintenanceMode);
  const [loading, setLoading] = useState(false);

  async function handleToggle() {
    setLoading(true);
    const result = await toggleMaintenanceMode(maintenanceMode);

    if (result.error) {
      toast.error(result.error);
    } else {
      setMaintenanceMode(!maintenanceMode);
      toast.success(
        !maintenanceMode ? t("settingsClient.toastMaintenanceEnabled") : t("settingsClient.toastMaintenanceDisabled")
      );
    }
    setLoading(false);
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      <div
        className={`bg-white p-10 rounded-[3.5rem] border-2 transition-all duration-500 overflow-hidden relative group ${
          maintenanceMode ? "border-orange-600 shadow-2xl shadow-orange-600/10" : "border-gray-100 shadow-xl shadow-black/5"
        }`}
      >
        <div className="relative z-10 flex flex-col items-center justify-center space-y-6">
          <div
            className={`size-20 rounded-3xl flex items-center justify-center transition-all duration-500 ${
              maintenanceMode ? "bg-orange-600 text-white rotate-12" : "bg-orange-50 text-orange-600"
            }`}
          >
            <i className={`las ${maintenanceMode ? "la-tools animate-pulse" : "la-server"} text-4xl`} />
          </div>

          <div className="text-center">
            <h3 className="text-2xl font-black text-gray-900 tracking-tight mb-2">{t("settingsClient.maintenanceTitle")}</h3>
            <p className="text-gray-400 text-sm font-medium font-inter max-w-[280px] leading-relaxed">
              {maintenanceMode ? t("settingsClient.maintenanceOn") : t("settingsClient.maintenanceOff")}
            </p>
          </div>

          <button
            onClick={handleToggle}
            disabled={loading}
            className={`px-12 py-5 rounded-[2rem] font-black uppercase text-xs tracking-[0.2em] transition-all active:scale-95 shadow-xl ${
              maintenanceMode ? "bg-rose-600 text-white shadow-rose-600/30" : "bg-[#134e4a] text-white shadow-[#134e4a]/20"
            } ${loading && "opacity-50 pointer-events-none"}`}
          >
            {loading ? t("settingsClient.toggleLoading") : maintenanceMode ? t("settingsClient.disableMaintenance") : t("settingsClient.enableMaintenance")}
          </button>

          {maintenanceMode && (
            <div className="mt-4 flex items-center gap-2 px-4 py-2 bg-orange-50 rounded-full border border-orange-100">
              <div className="size-2 bg-orange-600 rounded-full animate-ping" />
              <span className="text-[10px] font-black text-orange-600 uppercase tracking-widest">{t("settingsClient.activeOverride")}</span>
            </div>
          )}
        </div>

        <div
          className={`absolute top-0 right-0 w-40 h-40 rounded-full -translate-y-1/2 translate-x-1/2 transition-all duration-1000 ${
            maintenanceMode ? "bg-orange-600/5" : "bg-gray-50"
          }`}
        />
      </div>

      <div className="bg-white p-10 rounded-[3.5rem] border border-gray-100 shadow-xl shadow-black/5 opacity-60 flex flex-col items-center justify-center space-y-6 grayscale relative overflow-hidden">
        <div className="size-20 rounded-3xl bg-[#134e4a]/10 flex items-center justify-center text-[#134e4a]">
          <i className="las la-coins text-4xl" />
        </div>
        <div className="text-center">
          <h3 className="text-2xl font-black text-gray-900 tracking-tight mb-2">{t("settingsClient.feesTitle")}</h3>
          <p className="text-gray-400 text-sm font-medium font-inter max-w-[280px] leading-relaxed">{t("settingsClient.feesBody")}</p>
        </div>
        <button className="px-12 py-5 rounded-[2rem] bg-gray-100 text-gray-300 font-black uppercase text-xs tracking-[0.2em] cursor-not-allowed">
          {t("settingsClient.comingSoon")}
        </button>
        <div className="absolute top-0 right-0 w-40 h-40 bg-gray-50 rounded-full -translate-y-1/2 translate-x-1/2" />
      </div>
    </div>
  );
}
