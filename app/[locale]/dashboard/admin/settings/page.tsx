export default function AdminSettingsPage() {
  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col gap-2">
        <h1 className="text-4xl font-black text-gray-900 tracking-tight">Global Platform Settings</h1>
        <p className="text-gray-500 font-medium">Configure platform-wide parameters and Riviola HQ constants.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-[3rem] border border-gray-100 shadow-xl shadow-black/5 flex flex-col items-center justify-center space-y-4">
           <div className="size-16 rounded-2xl bg-orange-600/10 flex items-center justify-center">
              <i className="las la-server text-3xl text-orange-600" />
           </div>
           <h3 className="text-xl font-black text-gray-900">Maintenance Mode</h3>
           <p className="text-center text-gray-500 text-sm">Temporarily disable platform access for all users except admins during system upgrades.</p>
           <button className="px-8 py-3 rounded-2xl bg-gray-100 text-gray-400 font-black uppercase text-xs tracking-widest cursor-not-allowed">Coming Soon</button>
        </div>

        <div className="bg-white p-8 rounded-[3rem] border border-gray-100 shadow-xl shadow-black/5 flex flex-col items-center justify-center space-y-4">
           <div className="size-16 rounded-2xl bg-[#134e4a]/10 flex items-center justify-center">
              <i className="las la-coins text-3xl text-[#134e4a]" />
           </div>
           <h3 className="text-xl font-black text-gray-900">Global Service Fees</h3>
           <p className="text-center text-gray-500 text-sm">Configure standard service fees applied to all automated dues and transaction processing.</p>
           <button className="px-8 py-3 rounded-2xl bg-gray-100 text-gray-400 font-black uppercase text-xs tracking-widest cursor-not-allowed">Coming Soon</button>
        </div>
      </div>
    </div>
  );
}
