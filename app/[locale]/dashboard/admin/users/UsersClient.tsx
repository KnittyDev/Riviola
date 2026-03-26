"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import Image from "next/image";

interface UserProfile {
  id: string;
  full_name: string | null;
  email: string | null;
  role: string;
  avatar_url: string | null;
  created_at: string;
  companies: {
    name: string;
  } | null;
  investor_properties: Array<{
    buildings: {
      companies: {
        name: string;
      }
    }
  }>;
}

export function UsersClient({ initialUsers }: { initialUsers: UserProfile[] }) {
  const commonT = useTranslations("Sidebar");
  const [users] = useState(initialUsers);

  // Helper function to get companies associated with an investor
  const getInvestorCompanies = (user: UserProfile) => {
    if (user.role !== 'investor') return [];
    
    // Get unique company names through buildings
    const companyNames = new Set<string>();
    user.investor_properties?.forEach(prop => {
      const name = prop.buildings?.companies?.name;
      if (name) companyNames.add(name);
    });
    
    return Array.from(companyNames);
  };

  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col gap-2">
        <h1 className="text-4xl font-black text-gray-900 tracking-tight">{commonT("users")}</h1>
        <p className="text-gray-500 font-medium font-inter">Manage all platform users, their roles and property-based organizational associations.</p>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-xl shadow-black/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                <th className="px-8 py-5 text-xs font-black uppercase tracking-widest text-gray-400">User / Identity</th>
                <th className="px-8 py-5 text-xs font-black uppercase tracking-widest text-gray-400">Role</th>
                <th className="px-8 py-5 text-xs font-black uppercase tracking-widest text-gray-400">Organization / Properties</th>
                <th className="px-8 py-5 text-xs font-black uppercase tracking-widest text-gray-400">Joined</th>
                <th className="px-8 py-5 text-xs font-black uppercase tracking-widest text-gray-400 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {users.map((user) => {
                const investorCos = getInvestorCompanies(user);
                
                return (
                  <tr key={user.id} className="hover:bg-gray-50/30 transition-colors group animate-in slide-in-from-left-2 duration-300">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="size-12 rounded-2xl bg-gray-100 flex items-center justify-center overflow-hidden border border-gray-100 shadow-inner shrink-0 group-hover:scale-105 transition-transform duration-300">
                          {user.avatar_url ? (
                            <Image
                              src={user.avatar_url}
                              alt=""
                              width={48}
                              height={48}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span className="text-gray-300 font-black text-lg">{user.full_name?.charAt(0) || user.email?.charAt(0)}</span>
                          )}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-sm font-black text-gray-900 leading-tight mb-0.5 group-hover:text-orange-600 transition-colors">
                            {user.full_name || "Anonymous User"}
                          </span>
                          <span className="text-xs text-gray-400 font-medium font-inter">
                            {user.email}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className={`
                        px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border
                        ${user.role === 'admin' ? 'bg-orange-50 border-orange-100 text-orange-600' : 
                          user.role === 'staff' ? 'bg-[#134e4a]/10 border-[#134e4a]/10 text-[#134e4a]' : 
                          'bg-blue-50 border-blue-100 text-blue-600 shadow-sm'}
                      `}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex flex-wrap gap-2 animate-in fade-in zoom-in duration-500">
                        {user.role === 'investor' ? (
                          investorCos.length > 0 ? (
                            investorCos.map((co, idx) => (
                              <span key={idx} className="bg-gray-100 text-gray-700 text-[10px] font-black px-2.5 py-1 rounded-lg uppercase tracking-tight border border-gray-200/50">
                                {co}
                              </span>
                            ))
                          ) : (
                            <span className="text-gray-300 font-black italic text-xs tracking-tighter">No Active Portfolios</span>
                          )
                        ) : (
                          <span className="text-sm font-bold text-gray-700">
                            {user.companies?.name || <span className="text-gray-300 font-black italic">—</span>}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className="text-xs text-gray-500 font-bold tabular-nums font-inter">
                        {new Date(user.created_at).toLocaleDateString()}
                      </span>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex justify-end gap-2 isolate opacity-0 group-hover:opacity-100 transition-opacity translate-x-4 group-hover:translate-x-0 transition-all duration-300">
                        <button className="size-10 rounded-xl bg-gray-100 text-gray-500 hover:bg-[#134e4a] hover:text-white transition-all flex items-center justify-center shadow-sm">
                          <i className="las la-pen text-lg" />
                        </button>
                        <button className="size-10 rounded-xl bg-gray-100 text-gray-400 hover:bg-rose-500 hover:text-white transition-all flex items-center justify-center shadow-sm">
                          <i className="las la-trash-alt text-lg" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
