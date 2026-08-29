
'use client';

import React, { useState } from 'react';
import {
  LayoutDashboard,
  Users,
  UserCheck,
  Radio,
  ShoppingBag,
  Palette,
  Star,
  Gift,
  Landmark,
  Wallet,
  History,
  Coins,
  ArrowDownCircle,
  Banknote,
  TrendingUp,
  FileText,
  Trophy,
  Image as ImageIcon,
  ShieldAlert,
  HelpCircle,
  AlertTriangle,
  BarChart3,
  Building2,
  Gamepad2,
  Settings,
  ChevronDown,
  ChevronRight,
  Search,
  ArrowUpDown,
  Filter
} from 'lucide-react';

interface UserData {
  id: string;
  name: string;
  username?: string;
  hakaId: string;
  emailPhone: string;
  role: 'NORMAL' | 'HOST' | 'AGENCY';
  roleColor: string;
  avatarLetter: string;
  avatarBg: string;
}

const mockUsers: UserData[] = [
  { id: '1', name: 'Robot Gaming Master', username: '', hakaId: '—', emailPhone: 'abhishekumar912004@gmail.com', role: 'NORMAL', roleColor: 'bg-blue-100 text-blue-600', avatarLetter: 'R', avatarBg: 'bg-purple-100 text-purple-600' },
  { id: '2', name: 'Uuhbh Bhhhn', username: '', hakaId: '—', emailPhone: 'bhhhnuthbh@gmail.com', role: 'HOST', roleColor: 'bg-purple-100 text-purple-600', avatarLetter: 'U', avatarBg: 'bg-purple-100 text-purple-600' },
  { id: '3', name: 'Riya', username: '', hakaId: '—', emailPhone: 'riyag3383@gmail.com', role: 'HOST', roleColor: 'bg-purple-100 text-purple-600', avatarLetter: 'R', avatarBg: 'bg-purple-100 text-purple-600' },
  { id: '4', name: 'Rider', username: '', hakaId: '—', emailPhone: 'coosaksha@gmail.com', role: 'HOST', roleColor: 'bg-purple-100 text-purple-600', avatarLetter: 'R', avatarBg: 'bg-purple-100 text-purple-600' },
  { id: '5', name: 'Samir', username: '', hakaId: '—', emailPhone: 'mdsamira153@gmail.com', role: 'HOST', roleColor: 'bg-purple-100 text-purple-600', avatarLetter: 'S', avatarBg: 'bg-purple-100 text-purple-600' },
  { id: '6', name: 'Newbie Fan', username: 'newbie_fan', hakaId: '531006005', emailPhone: '—', role: 'NORMAL', roleColor: 'bg-blue-100 text-blue-600', avatarLetter: 'N', avatarBg: 'bg-purple-100 text-purple-600' },
  { id: '7', name: 'Luna Star', username: 'luna_star', hakaId: '821004571', emailPhone: '—', role: 'HOST', roleColor: 'bg-purple-100 text-purple-600', avatarLetter: 'L', avatarBg: 'bg-purple-100 text-purple-600' },
  { id: '8', name: 'Agent Boss', username: 'agent_boss', hakaId: '320919038', emailPhone: '—', role: 'AGENCY', roleColor: 'bg-amber-100 text-amber-600', avatarLetter: 'A', avatarBg: 'bg-purple-100 text-purple-600' },
  { id: '9', name: 'Marco 🎤', username: 'marco_talks', hakaId: '486052034', emailPhone: '—', role: 'HOST', roleColor: 'bg-purple-100 text-purple-600', avatarLetter: 'M', avatarBg: 'bg-purple-100 text-purple-600' },
  { id: '10', name: 'Zara Beats 🎵', username: 'zara_beats', hakaId: '927199637', emailPhone: '—', role: 'HOST', roleColor: 'bg-purple-100 text-purple-600', avatarLetter: 'Z', avatarBg: 'bg-purple-100 text-purple-600' },
  { id: '11', name: 'Nova ✨', username: 'nova_live', hakaId: '248708597', emailPhone: '—', role: 'HOST', roleColor: 'bg-purple-100 text-purple-600', avatarLetter: 'N', avatarBg: 'bg-purple-100 text-purple-600' },
  { id: '12', name: 'Mia Chen', username: 'ts_mia', hakaId: '941224460', emailPhone: '—', role: 'NORMAL', roleColor: 'bg-blue-100 text-blue-600', avatarLetter: 'M', avatarBg: 'bg-purple-100 text-purple-600' },
  { id: '13', name: 'Leo Stone', username: 'ts_leo', hakaId: '265022948', emailPhone: '—', role: 'NORMAL', roleColor: 'bg-blue-100 text-blue-600', avatarLetter: 'L', avatarBg: 'bg-purple-100 text-purple-600' },
  { id: '14', name: 'Sara Lin', username: 'ts_sara', hakaId: '621965153', emailPhone: '—', role: 'NORMAL', roleColor: 'bg-blue-100 text-blue-600', avatarLetter: 'S', avatarBg: 'bg-purple-100 text-purple-600' },
  { id: '15', name: 'Kai Rivera', username: 'ts_kai', hakaId: '028452631', emailPhone: '—', role: 'NORMAL', roleColor: 'bg-blue-100 text-blue-600', avatarLetter: 'K', avatarBg: 'bg-purple-100 text-purple-600' },
  { id: '16', name: 'Aisha Malik', username: 'ts_aisha', hakaId: '219185727', emailPhone: '—', role: 'NORMAL', roleColor: 'bg-blue-100 text-blue-600', avatarLetter: 'A', avatarBg: 'bg-purple-100 text-purple-600' },
  { id: '17', name: 'Yuki Tanaka', username: 'ts_yuki', hakaId: '063153655', emailPhone: '—', role: 'HOST', roleColor: 'bg-purple-100 text-purple-600', avatarLetter: 'Y', avatarBg: 'bg-purple-100 text-purple-600' },
  { id: '18', name: 'JjayFabor', username: 'jjayfabor', hakaId: '917144229', emailPhone: '—', role: 'HOST', roleColor: 'bg-purple-100 text-purple-600', avatarLetter: 'J', avatarBg: 'bg-purple-100 text-purple-600' }
];

export default function OwnerPanelPage() {
  const [activeMenu, setActiveMenu] = useState('Manage Users');
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="flex min-h-screen bg-[#F6F8FB] text-[#2D3748] font-sans antialiased">
      {/* Sidebar */}
      <aside className="w-[260px] bg-[#0E1322] text-[#8F9CAE] flex flex-col shrink-0 border-r border-[#1B2236]">
        {/* Brand Header */}
        <div className="p-5 border-b border-[#1A2234]">
          <h1 className="text-white text-base font-bold tracking-wide">Haka Live</h1>
          <p className="text-[10px] font-semibold tracking-wider text-slate-400 mt-0.5 uppercase">Staff Control Panel</p>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-5 text-[13px] select-none scrollbar-thin scrollbar-thumb-slate-700">
          
          <div>
            <button className="flex items-center gap-3 w-full px-3 py-2 rounded-lg hover:text-white hover:bg-white/5 transition">
              <LayoutDashboard size={16} className="text-amber-500" />
              <span>Dashboard</span>
            </button>
          </div>

          {/* User Center */}
          <div>
            <div className="flex items-center justify-between text-white font-medium px-3 py-1 mb-1">
              <div className="flex items-center gap-3 text-blue-400">
                <Users size={16} />
                <span className="text-slate-200">User Center</span>
              </div>
              <ChevronDown size={14} className="text-slate-400" />
            </div>
            <div className="space-y-0.5 ml-2 border-l border-slate-800 pl-2">
              <button 
                onClick={() => setActiveMenu('Manage Users')}
                className={`flex items-center gap-2.5 w-full px-3 py-2 rounded-lg text-xs transition font-medium ${
                  activeMenu === 'Manage Users' ? 'bg-[#1C2541] text-blue-400 font-semibold' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Users size={14} />
                <span>Manage Users</span>
              </button>
              <button 
                onClick={() => setActiveMenu('Host Applications')}
                className={`flex items-center gap-2.5 w-full px-3 py-2 rounded-lg text-xs transition font-medium ${
                  activeMenu === 'Host Applications' ? 'bg-[#1C2541] text-blue-400 font-semibold' : 'text-slate-400 hover:text-white'
                }`}
              >
                <UserCheck size={14} />
                <span>Host Applications</span>
              </button>
            </div>
          </div>

          {/* Live Rooms */}
          <div>
            <div className="flex items-center justify-between px-3 py-1 mb-1 text-slate-400 hover:text-white cursor-pointer">
              <div className="flex items-center gap-3">
                <Radio size={16} className="text-cyan-400" />
                <span>Live Rooms</span>
              </div>
              <ChevronDown size={14} />
            </div>
            <div className="ml-2 border-l border-slate-800 pl-2">
              <button className="flex items-center gap-2.5 w-full px-3 py-1.5 rounded-lg text-xs text-slate-400 hover:text-white">
                <Radio size={14} />
                <span>Manage Rooms</span>
              </button>
            </div>
          </div>

          {/* Store */}
          <div>
            <div className="flex items-center justify-between px-3 py-1 mb-1 text-slate-400 hover:text-white cursor-pointer">
              <div className="flex items-center gap-3">
                <ShoppingBag size={16} className="text-emerald-400" />
                <span>Store</span>
              </div>
              <ChevronDown size={14} />
            </div>
            <div className="space-y-0.5 ml-2 border-l border-slate-800 pl-2 text-xs">
              <button className="flex items-center gap-2.5 w-full px-3 py-1.5 rounded-lg text-slate-400 hover:text-white">
                <Palette size={14} className="text-amber-400" />
                <span>Themes</span>
              </button>
              <button className="flex items-center gap-2.5 w-full px-3 py-1.5 rounded-lg text-slate-400 hover:text-white">
                <Star size={14} className="text-yellow-400" />
                <span>Special IDs</span>
              </button>
              <button className="flex items-center gap-2.5 w-full px-3 py-1.5 rounded-lg text-slate-400 hover:text-white">
                <Gift size={14} className="text-rose-400" />
                <span>Gift Catalogue</span>
              </button>
            </div>
          </div>

          {/* Economy */}
          <div>
            <div className="flex items-center justify-between px-3 py-1 mb-1 text-slate-400 hover:text-white cursor-pointer">
              <div className="flex items-center gap-3">
                <Landmark size={16} className="text-blue-400" />
                <span>Economy</span>
              </div>
              <ChevronDown size={14} />
            </div>
            <div className="space-y-0.5 ml-2 border-l border-slate-800 pl-2 text-xs">
              <button className="flex items-center gap-2.5 w-full px-3 py-1.5 rounded-lg text-slate-400 hover:text-white">
                <Wallet size={14} className="text-blue-400" />
                <span>Master Wallet</span>
              </button>
              <button className="flex items-center gap-2.5 w-full px-3 py-1.5 rounded-lg text-slate-400 hover:text-white">
                <History size={14} className="text-slate-300" />
                <span>Gift Send History</span>
              </button>
              <button className="flex items-center gap-2.5 w-full px-3 py-1.5 rounded-lg text-slate-400 hover:text-white">
                <Coins size={14} className="text-red-400" />
                <span>Bean Revenue</span>
              </button>
              <button className="flex items-center gap-2.5 w-full px-3 py-1.5 rounded-lg text-slate-400 hover:text-white">
                <Coins size={14} className="text-amber-400" />
                <span>User Wallets</span>
              </button>
              <button className="flex items-center gap-2.5 w-full px-3 py-1.5 rounded-lg text-slate-400 hover:text-white">
                <FileText size={14} className="text-sky-400" />
                <span>Wallet History</span>
              </button>
              <button className="flex items-center gap-2.5 w-full px-3 py-1.5 rounded-lg text-slate-400 hover:text-white">
                <ArrowDownCircle size={14} className="text-emerald-400" />
                <span>Withdrawal Requests</span>
              </button>
              <button className="flex items-center gap-2.5 w-full px-3 py-1.5 rounded-lg text-slate-400 hover:text-white">
                <Coins size={14} className="text-yellow-500" />
                <span>Seller Recharges</span>
              </button>
              <button className="flex items-center gap-2.5 w-full px-3 py-1.5 rounded-lg text-slate-400 hover:text-white">
                <Banknote size={14} className="text-emerald-400" />
                <span>Currency Rates</span>
              </button>
            </div>
          </div>

          {/* Content */}
          <div>
            <div className="flex items-center justify-between px-3 py-1 mb-1 text-slate-400 hover:text-white cursor-pointer">
              <div className="flex items-center gap-3">
                <ImageIcon size={16} className="text-amber-300" />
                <span>Content</span>
              </div>
              <ChevronDown size={14} />
            </div>
            <div className="space-y-0.5 ml-2 border-l border-slate-800 pl-2 text-xs">
              <button className="flex items-center gap-2.5 w-full px-3 py-1.5 rounded-lg text-slate-400 hover:text-white">
                <Trophy size={14} className="text-amber-400" />
                <span>Events</span>
              </button>
              <button className="flex items-center gap-2.5 w-full px-3 py-1.5 rounded-lg text-slate-400 hover:text-white">
                <ImageIcon size={14} className="text-sky-400" />
                <span>Banners</span>
              </button>
            </div>
          </div>

          {/* Moderation */}
          <div>
            <div className="flex items-center justify-between px-3 py-1 mb-1 text-slate-400 hover:text-white cursor-pointer">
              <div className="flex items-center gap-3">
                <ShieldAlert size={16} className="text-rose-400" />
                <span>Moderation</span>
              </div>
              <ChevronDown size={14} />
            </div>
            <div className="space-y-0.5 ml-2 border-l border-slate-800 pl-2 text-xs">
              <button className="flex items-center gap-2.5 w-full px-3 py-1.5 rounded-lg text-slate-400 hover:text-white">
                <ShieldAlert size={14} className="text-rose-500" />
                <span>Reports & Bans</span>
              </button>
              <button className="flex items-center gap-2.5 w-full px-3 py-1.5 rounded-lg text-slate-400 hover:text-white">
                <HelpCircle size={14} className="text-blue-400" />
                <span>Support Tickets</span>
              </button>
              <button className="flex items-center gap-2.5 w-full px-3 py-1.5 rounded-lg text-slate-400 hover:text-white">
                <AlertTriangle size={14} className="text-amber-400" />
                <span>Risk Control</span>
              </button>
            </div>
          </div>

          {/* Platform */}
          <div>
            <div className="flex items-center justify-between px-3 py-1 mb-1 text-slate-400 hover:text-white cursor-pointer">
              <div className="flex items-center gap-3">
                <BarChart3 size={16} className="text-cyan-400" />
                <span>Platform</span>
              </div>
              <ChevronDown size={14} />
            </div>
            <div className="space-y-0.5 ml-2 border-l border-slate-800 pl-2 text-xs">
              <button className="flex items-center gap-2.5 w-full px-3 py-1.5 rounded-lg text-slate-400 hover:text-white">
                <TrendingUp size={14} className="text-cyan-400" />
                <span>Analytics & Reports</span>
              </button>
              <button className="flex items-center gap-2.5 w-full px-3 py-1.5 rounded-lg text-slate-400 hover:text-white">
                <Building2 size={14} className="text-slate-300" />
                <span>Agency Management</span>
              </button>
              <button className="flex items-center gap-2.5 w-full px-3 py-1.5 rounded-lg text-slate-400 hover:text-white">
                <Gamepad2 size={14} className="text-purple-400" />
                <span>Game Management</span>
              </button>
            </div>
          </div>

          {/* System */}
          <div>
            <div className="flex items-center justify-between px-3 py-1 text-slate-400 hover:text-white cursor-pointer">
              <div className="flex items-center gap-3">
                <Settings size={16} className="text-blue-400" />
                <span>System</span>
              </div>
              <ChevronRight size={14} />
            </div>
          </div>

        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 bg-[#F8FAFC]">
        {/* Top Header */}
        <header className="px-8 pt-7 pb-4 bg-white border-b border-slate-200">
          <h2 className="text-2xl font-bold text-slate-900">Users</h2>
        </header>

        {/* Content Body */}
        <div className="p-8 flex-1 flex flex-col">
          {/* Filters Bar */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm mb-6 space-y-3">
            {/* Search Input */}
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name, phone, email, Haka ID..."
                className="w-full bg-[#F8FAFC] border border-slate-200 text-sm text-slate-800 rounded-lg px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition placeholder:text-slate-400"
              />
            </div>

            {/* Filter Dropdowns */}
            <div className="flex flex-wrap items-center gap-3 pt-1">
              <select className="bg-[#F8FAFC] border border-slate-200 text-xs font-medium text-slate-700 rounded-lg px-3 py-2 outline-none cursor-pointer hover:border-slate-300">
                <option>All Roles</option>
                <option>Normal</option>
                <option>Host</option>
                <option>Agency</option>
              </select>

              <select className="bg-[#F8FAFC] border border-slate-200 text-xs font-medium text-slate-700 rounded-lg px-3 py-2 outline-none cursor-pointer hover:border-slate-300">
                <option>All Status</option>
                <option>Active</option>
                <option>Banned</option>
              </select>

              <select className="bg-[#F8FAFC] border border-slate-200 text-xs font-medium text-slate-700 rounded-lg px-3 py-2 outline-none cursor-pointer hover:border-slate-300">
                <option>All (mute)</option>
                <option>Muted</option>
                <option>Unmuted</option>
              </select>

              <input
                type="text"
                placeholder="Country..."
                className="bg-[#F8FAFC] border border-slate-200 text-xs text-slate-700 rounded-lg px-3 py-2 outline-none w-32 placeholder:text-slate-400"
              />

              <select className="bg-[#F8FAFC] border border-slate-200 text-xs font-medium text-slate-700 rounded-lg px-3 py-2 outline-none cursor-pointer hover:border-slate-300">
                <option>Sort by</option>
                <option>Created At</option>
                <option>Last Active</option>
              </select>

              <button className="flex items-center gap-1 bg-[#F8FAFC] border border-slate-200 text-xs font-medium text-slate-700 px-3 py-2 rounded-lg hover:bg-slate-100 transition">
                <span>↓ DESC</span>
              </button>
            </div>
          </div>

          {/* Users Table */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex-1">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-100 text-[11px] font-bold tracking-wider text-slate-400 uppercase bg-[#FCFDFE]">
                    <th className="py-3.5 px-6 font-semibold">User</th>
                    <th className="py-3.5 px-6 font-semibold">Haka ID</th>
                    <th className="py-3.5 px-6 font-semibold">Phone / Email</th>
                    <th className="py-3.5 px-6 font-semibold">Role</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {mockUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-slate-50/70 transition-colors">
                      {/* User Column */}
                      <td className="py-3.5 px-6">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${user.avatarBg}`}>
                            {user.avatarLetter}
                          </div>
                          <div>
                            <div className="font-semibold text-slate-800 text-sm leading-tight">{user.name}</div>
                            <div className="text-slate-400 text-[11px] mt-0.5">
                              {user.username ? `@${user.username}` : '—'}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Haka ID Column */}
                      <td className="py-3.5 px-6">
                        <span className={user.hakaId !== '—' ? 'font-semibold text-indigo-600' : 'text-slate-400'}>
                          {user.hakaId}
                        </span>
                      </td>

                      {/* Email/Phone Column */}
                      <td className="py-3.5 px-6">
                        <span className={user.emailPhone !== '—' ? 'text-slate-600 font-mono text-[11px]' : 'text-slate-400'}>
                          {user.emailPhone}
                        </span>
                      </td>

                      {/* Role Column */}
                      <td className="py-3.5 px-6">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase ${user.roleColor}`}>
                          {user.role}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

