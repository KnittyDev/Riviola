"use client";

import { useTranslations } from "next-intl";
import { useState, useMemo } from "react";
import Image from "next/image";

interface UserProfile {
  id: string;
  full_name: string | null;
  email: string | null;
  role: string;
  avatar_url: string | null;
  created_at: string;
  investor_type: "buyer" | "renter" | null;
  companies: {
    name: string;
  } | null;
  investor_properties: Array<{
    building_id: string;
    buildings: {
      id: string;
      name: string;
      companies: {
        name: string;
      }
    }
  }>;
}

interface Building {
  id: string;
  name: string;
}

export function UsersClient({ initialUsers, buildings }: { initialUsers: UserProfile[], buildings: Building[] }) {
  const commonT = useTranslations("Sidebar");
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [buildingFilter, setBuildingFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");

  // Helper function to get companies associated with an investor
  const getInvestorCompanies = (user: UserProfile) => {
    if (user.role !== 'investor') return [];
    const companyNames = new Set<string>();
    user.investor_properties?.forEach(prop => {
      const name = prop.buildings?.companies?.name;
      if (name) companyNames.add(name);
    });
    return Array.from(companyNames);
  };

  const filteredUsers = useMemo(() => {
    return initialUsers.filter((user) => {
      const matchesSearch = 
        (user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
         user.email?.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesRole = roleFilter === "all" || user.role === roleFilter;
      
      const matchesBuilding = buildingFilter === "all" || 
        user.investor_properties?.some(p => p.building_id === buildingFilter);

      const matchesType = typeFilter === "all" || user.investor_type === typeFilter;

      return matchesSearch && matchesRole && matchesBuilding && matchesType;
    });
  }, [initialUsers, searchTerm, roleFilter, buildingFilter, typeFilter]);

  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-4xl font-black text-gray-900 tracking-tight">{commonT("users")}</h1>
          <p className="text-gray-500 font-medium font-inter">Administrative stakeholder directory with building-specific precision and status tracking.</p>
        </div>
        
        <div className="flex items-center gap-3">
           <div className="px-4 py-2 bg-orange-50 text-orange-600 rounded-2xl text-xs font-black uppercase tracking-widest border border-orange-100 flex items-center gap-2 shadow-sm shadow-orange-600/5 transition-transform hover:scale-105">
              <span className="size-2 bg-orange-600 rounded-full animate-pulse" />
              {filteredUsers.length} Users Listed
           </div>
        </div>
      </div>

      {/* Advanced Filters */}
      <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-xl shadow-black/5 space-y-8 animate-in slide-in-from-top-4 duration-500">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Search */}
          <div className="relative group/search flex-1">
            <input 
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name or email..."
              className="w-full pl-12 pr-4 py-4 rounded-2xl border-2 border-gray-50 bg-gray-50/30 focus:border-[#134e4a] focus:bg-white outline-none transition-all font-medium text-gray-900 shadow-sm group-hover/search:bg-gray-50"
            />
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within/search:text-[#134e4a] transition-colors">
              <i className="las la-search text-xl" />
            </div>
          </div>

          {/* Role Filter */}
          <div className="relative group">
            <select 
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="w-full pl-12 pr-4 py-4 rounded-2xl border-2 border-gray-50 bg-gray-50/30 focus:border-[#134e4a] focus:bg-white outline-none transition-all font-black text-gray-900 appearance-none shadow-sm group-hover:bg-gray-50 uppercase text-[10px] tracking-widest"
            >
              <option value="all">Global Roles</option>
              <option value="admin">Administrators</option>
              <option value="staff">Staff Members</option>
              <option value="investor">Investors</option>
            </select>
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none">
              <i className="las la-id-badge text-xl" />
            </div>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
              <i className="las la-angle-down" />
            </div>
          </div>

          {/* Building Filter */}
          <div className="relative group">
            <select 
              value={buildingFilter}
              onChange={(e) => setBuildingFilter(e.target.value)}
              className="w-full pl-12 pr-4 py-4 rounded-2xl border-2 border-gray-50 bg-gray-50/30 focus:border-[#134e4a] focus:bg-white outline-none transition-all font-black text-gray-900 appearance-none shadow-sm group-hover:bg-gray-50 uppercase text-[10px] tracking-widest"
            >
              <option value="all">All Buildings</option>
              {buildings.map(b => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none">
              <i className="las la-building text-xl" />
            </div>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
              <i className="las la-angle-down" />
            </div>
          </div>

          {/* Type Filter */}
          <div className="relative group">
            <select 
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full pl-12 pr-4 py-4 rounded-2xl border-2 border-gray-50 bg-gray-50/30 focus:border-[#134e4a] focus:bg-white outline-none transition-all font-black text-gray-900 appearance-none shadow-sm group-hover:bg-gray-50 uppercase text-[10px] tracking-widest"
            >
              <option value="all">Status: Any</option>
              <option value="buyer">Buyer</option>
              <option value="renter">Renter</option>
            </select>
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none">
              <i className="las la-tags text-xl" />
            </div>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
              <i className="las la-angle-down" />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-xl shadow-black/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100 uppercase">
                <th className="px-8 py-5 text-[10px] font-black tracking-widest text-gray-400">User / Identity</th>
                <th className="px-8 py-5 text-[10px] font-black tracking-widest text-gray-400">Classification</th>
                <th className="px-8 py-5 text-[10px] font-black tracking-widest text-gray-400">Projects / Portfolios</th>
                <th className="px-8 py-5 text-[10px] font-black tracking-widest text-gray-400 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 font-inter">
              {filteredUsers.length === 0 ? (
                <tr>
                   <td colSpan={4} className="px-8 py-12 text-center text-gray-300 italic">No stakeholders matching these filters.</td>
                </tr>
              ) : (
                filteredUsers.map((user) => {
                  const investorCos = getInvestorCompanies(user);
                  
                  return (
                    <tr key={user.id} className="hover:bg-gray-50/30 transition-colors group">
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-4">
                          <div className="size-12 rounded-2xl bg-gray-100 flex items-center justify-center overflow-hidden border border-gray-100 shrink-0 shadow-inner group-hover:scale-105 transition-transform duration-300">
                            {user.avatar_url ? (
                              <Image src={user.avatar_url} alt="" width={48} height={48} className="w-full h-full object-cover" />
                            ) : (
                              <span className="text-gray-300 font-black text-lg">{user.full_name?.charAt(0) || user.email?.charAt(0)}</span>
                            )}
                          </div>
                          <div className="flex flex-col">
                            <span className="text-sm font-black text-gray-900 leading-tight mb-0.5 group-hover:text-orange-600 transition-colors">
                              {user.full_name || "Anonymous User"}
                            </span>
                            <span className="text-xs text-gray-400 font-medium lowercase">
                              {user.email}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex flex-col gap-2">
                          <span className={`
                            px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border w-fit
                            ${user.role === 'admin' ? 'bg-orange-50 border-orange-100 text-orange-600' : 
                              user.role === 'staff' ? 'bg-[#134e4a]/10 border-[#134e4a]/10 text-[#134e4a]' : 
                              'bg-blue-50 border-blue-100 text-blue-600 shadow-sm'}
                          `}>
                            {user.role}
                          </span>
                          {user.role === 'investor' && user.investor_type && (
                             <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] pl-1">
                                — {user.investor_type}
                             </span>
                          )}
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex flex-wrap gap-2">
                          {user.role === 'investor' ? (
                            investorCos.length > 0 ? (
                              investorCos.map((co, idx) => (
                                <span key={idx} className="bg-gray-50 text-gray-600 text-[10px] font-black px-3 py-1.5 rounded-xl uppercase tracking-tight border border-gray-100 flex items-center gap-2 group-hover:bg-white group-hover:border-orange-100 transition-all">
                                  <div className="size-1.5 bg-gray-300 rounded-full group-hover:bg-orange-600 transition-colors" />
                                  {co}
                                </span>
                              ))
                            ) : (
                              <span className="text-gray-300 font-black italic text-xs tracking-tighter">No Active Portfolios</span>
                            )
                          ) : (
                            <span className="text-sm font-bold text-gray-700 bg-gray-50 px-4 py-2 rounded-2xl border border-gray-100 group-hover:border-[#134e4a]/20 group-hover:text-[#134e4a] transition-all">
                              {user.companies?.name || "Riviola HQ"}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex justify-end gap-2 isolate opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
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
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
