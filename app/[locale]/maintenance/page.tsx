import Image from "next/image";
import { Link } from "@/i18n/routing";

export default function MaintenancePage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-orange-600/5 rounded-full blur-[120px] -translate-y-1/3 translate-x-1/3" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[#134e4a]/5 rounded-full blur-[100px] translate-y-1/3 -translate-x-1/3" />
      
      <div className="max-w-2xl w-full text-center space-y-12 relative z-10 animate-in fade-in slide-in-from-bottom-8 duration-1000">
        {/* Brand Icon */}
        <div className="flex flex-col items-center gap-4 group">
           <div className="size-24 rounded-[2.5rem] bg-white shadow-2xl flex items-center justify-center border border-gray-100 relative group-hover:scale-105 transition-transform duration-500">
              <div className="size-16 rounded-3xl bg-[#134e4a] flex items-center justify-center text-white text-3xl font-black">
                 R
              </div>
              <div className="absolute -top-3 -right-3 size-10 rounded-2xl bg-orange-600 flex items-center justify-center text-white shadow-lg animate-bounce">
                 <i className="las la-tools text-xl" />
              </div>
           </div>
           <span className="text-[10px] font-black text-orange-600 bg-orange-50 px-4 py-1.5 rounded-full uppercase tracking-[0.3em] border border-orange-100/50 shadow-sm">Protocol 404: Active Maintenance</span>
        </div>

        <div className="space-y-6">
           <h1 className="text-5xl font-black text-gray-900 tracking-tight leading-tight px-4 sm:px-0">
              Upgrading the <span className="text-[#134e4a] relative inline-block">Future<div className="absolute bottom-1 left-0 w-full h-2 bg-[#134e4a]/10 -z-10" /></span> of Property Management
           </h1>
           <p className="text-gray-500 text-lg font-medium font-inter max-w-lg mx-auto leading-relaxed">
              We are currently optimizing the Riviola HQ infrastructure. All platform-wide services are temporarily suspended for high-precision system calibrations.
           </p>
        </div>

        {/* Progress Visualizer */}
        <div className="max-w-md mx-auto bg-white p-8 rounded-[3rem] border border-gray-100 shadow-2xl shadow-black/5 space-y-8">
           <div className="space-y-3">
              <div className="flex justify-between items-end px-1">
                 <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Calibration Progress</span>
                 <span className="text-[10px] font-black text-[#134e4a] uppercase tracking-widest">In Sequence</span>
              </div>
              <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                 <div className="h-full w-2/3 bg-[#134e4a] rounded-full animate-pulse relative">
                    <div className="absolute top-0 left-0 w-full h-full bg-white/20 animate-shimmer" />
                 </div>
              </div>
           </div>
           
           <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 flex flex-col items-center gap-2">
                 <i className="las la-database text-orange-600 text-xl" />
                 <span className="text-[9px] font-black text-gray-400 uppercase tracking-tighter">Vault Encryption</span>
              </div>
              <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 flex flex-col items-center gap-2">
                 <i className="las la-cloud-upload-alt text-[#134e4a] text-xl" />
                 <span className="text-[9px] font-black text-gray-400 uppercase tracking-tighter">API Refresh</span>
              </div>
           </div>
        </div>

        <div className="flex flex-col items-center gap-8">
           <div className="flex items-center gap-4 text-gray-400">
              <div className="size-2 bg-teal-500 rounded-full animate-ping" />
              <span className="text-[10px] font-black uppercase tracking-widest">Check platform status on Twitter/X</span>
           </div>
           
           <Link href="/" className="text-[10px] font-black text-[#134e4a] uppercase tracking-[0.2em] hover:text-orange-600 transition-colors flex items-center gap-2">
              <i className="las la-undo-alt text-lg" />
              Return to Landing
           </Link>
        </div>
        
        <div className="pt-12 border-t border-gray-100">
           <p className="text-[9px] font-black text-gray-300 uppercase tracking-[0.3em]">
              © 2026 RIVIOLA HQ • ALL RIGHTS RESERVED
           </p>
        </div>
      </div>
    </div>
  );
}
