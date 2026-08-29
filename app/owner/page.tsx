
'use client';

import React, { useState, useEffect } from 'react';
import {
  ChevronDown,
  ChevronRight,
  Loader2
} from 'lucide-react';
import { db } from '../../src/lib/firebase';
import { collection, onSnapshot, query } from 'firebase/firestore';

interface UserData {
  id: string;
  name: string;
  username?: string;
  hurryId: string;
  emailPhone: string;
  role: 'NORMAL' | 'HOST' | 'AGENCY' | 'ADMIN';
  gender?: string;
  country?: string;
  image?: string;
}

export default function OwnerUsersPage() {
  const [activeMenu, setActiveMenu] = useState('Manage Users');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState('All Roles');
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const usersRef = collection(db, 'users');
      const q = query(usersRef);

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const fetchedUsers: UserData[] = snapshot.docs.map((doc) => {
          const data = doc.data();
          
          let userRole: 'NORMAL' | 'HOST' | 'AGENCY' | 'ADMIN' = 'NORMAL';
          if (data.type === 'admin' || data.isOfficial) {
            userRole = 'ADMIN';
          } else if (data.role === 'HOST' || data.type === 'host') {
            userRole = 'HOST';
          } else if (data.role === 'AGENCY' || data.type === 'agency') {
            userRole = 'AGENCY';
          }

          return {
            id: doc.id,
            name: data.name || data.displayName || 'Unnamed User',
            username: data.username || '',
            hurryId: data.accountId ? String(data.accountId) : '—',
            emailPhone: data.email || data.phone || '—',
            role: userRole,
            gender: data.gender || '',
            country: data.country || '🇮🇳',
            image: data.image || data.photo || data.photoURL || ''
          };
        });

        setUsers(fetchedUsers);
        setLoading(false);
      }, (error) => {
        console.error("Firestore read error:", error);
        setLoading(false);
      });

      return () => unsubscribe();
    } catch (err) {
      console.error("Error setting up listener:", err);
      setLoading(false);
    }
  }, []);

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'HOST':
        return 'bg-purple-100 text-purple-600 border border-purple-200';
      case 'AGENCY':
        return 'bg-amber-100 text-amber-700 border border-amber-200';
      case 'ADMIN':
        return 'bg-rose-100 text-rose-600 border border-rose-200';
      default:
        return 'bg-blue-50 text-blue-600 border border-blue-200';
    }
  };

  const filteredUsers = users.filter((user) => {
    const matchesSearch = 
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.emailPhone.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.hurryId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (user.username && user.username.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesRole = 
      selectedRole === 'All Roles' || 
      user.role.toLowerCase() === selectedRole.toLowerCase();

    return matchesSearch && matchesRole;
  });

  return (
    <div className="flex min-h-screen bg-[#F6F8FB] text-[#2D3748] font-sans antialiased">
      {/* Sidebar */}
      <aside className="w-[260px] bg-[#0E1322] text-[#8F9CAE] flex flex-col shrink-0 border-r border-[#1B2236]">
        {/* Brand Header */}
        <div className="p-5 border-b border-[#1A2234]">
          <div className="flex items-center gap-2">
            <span className="text-xl">⚡</span>
            <h1 className="text-white text-base font-bold tracking-wide">Hurry Live</h1>
          </div>
          <p className="text-[10px] font-semibold tracking-wider text-slate-400 mt-0.5 uppercase">Staff Control Panel</p>
        </div>

        {/* Navigation Items with Emoji Icons */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-4 text-[13px] select-none scrollbar-thin scrollbar-thumb-slate-700">
          <div>
            <button className="flex items-center gap-3 w-full px-3 py-2 rounded-lg hover:text-white hover:bg-white/5 transition">
              <span className="text-base">📊</span>
              <span>Dashboard</span>
            </button>
          </div>

          {/* User Center */}
          <div>
            <div className="flex items-center justify-between text-white font-medium px-3 py-1 mb-1">
              <div className="flex items-center gap-3">
                <span className="text-base">👥</span>
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
                <span>👤</span>
                <span>Manage Users</span>
              </button>
              <button 
                onClick={() => setActiveMenu('Host Applications')}
                className={`flex items-center gap-2.5 w-full px-3 py-2 rounded-lg text-xs transition font-medium ${
                  activeMenu === 'Host Applications' ? 'bg-[#1C2541] text-blue-400 font-semibold' : 'text-slate-400 hover:text-white'
                }`}
              >
                <span>📝</span>
                <span>Host Applications</span>
              </button>
            </div>
          </div>

          {/* Live Rooms */}
          <div>
            <div className="flex items-center justify-between px-3 py-1 mb-1 text-slate-400 hover:text-white cursor-pointer">
              <div className="flex items-center gap-3">
                <span className="text-base">📻</span>
                <span>Live Rooms</span>
              </div>
              <ChevronDown size={14} />
            </div>
            <div className="ml-2 border-l border-slate-800 pl-2">
              <button className="flex items-center gap-2.5 w-full px-3 py-1.5 rounded-lg text-xs text-slate-400 hover:text-white">
                <span>🎙️</span>
                <span>Manage Rooms</span>
              </button>
            </div>
          </div>

          {/* Store */}
          <div>
            <div className="flex items-center justify-between px-3 py-1 mb-1 text-slate-400 hover:text-white cursor-pointer">
              <div className="flex items-center gap-3">
                <span className="text-base">🛍️</span>
                <span>Store</span>
              </div>
              <ChevronDown size={14} />
            </div>
            <div className="space-y-0.5 ml-2 border-l border-slate-800 pl-2 text-xs">
              <button className="flex items-center gap-2.5 w-full px-3 py-1.5 rounded-lg text-slate-400 hover:text-white">
                <span>🎨</span>
                <span>Themes</span>
              </button>
              <button className="flex items-center gap-2.5 w-full px-3 py-1.5 rounded-lg text-slate-400 hover:text-white">
                <span>⭐</span>
                <span>Special IDs</span>
              </button>
              <button className="flex items-center gap-2.5 w-full px-3 py-1.5 rounded-lg text-slate-400 hover:text-white">
                <span>🎁</span>
                <span>Gift Catalogue</span>
              </button>
            </div>
          </div>

          {/* Economy */}
          <div>
            <div className="flex items-center justify-between px-3 py-1 mb-1 text-slate-400 hover:text-white cursor-pointer">
              <div className="flex items-center gap-3">
                <span className="text-base">🏛️</span>
                <span>Economy</span>
              </div>
              <ChevronDown size={14} />
            </div>
            <div className="space-y-0.5 ml-2 border-l border-slate-800 pl-2 text-xs">
              <button className="flex items-center gap-2.5 w-full px-3 py-1.5 rounded-lg text-slate-400 hover:text-white">
                <span>👛</span>
                <span>Master Wallet</span>
              </button>
              <button className="flex items-center gap-2.5 w-full px-3 py-1.5 rounded-lg text-slate-400 hover:text-white">
                <span>📜</span>
                <span>Gift Send History</span>
              </button>
              <button className="flex items-center gap-2.5 w-full px-3 py-1.5 rounded-lg text-slate-400 hover:text-white">
                <span>💰</span>
                <span>Bean Revenue</span>
              </button>
              <button className="flex items-center gap-2.5 w-full px-3 py-1.5 rounded-lg text-slate-400 hover:text-white">
                <span>🪙</span>
                <span>User Wallets</span>
              </button>
              <button className="flex items-center gap-2.5 w-full px-3 py-1.5 rounded-lg text-slate-400 hover:text-white">
                <span>📋</span>
                <span>Wallet History</span>
              </button>
              <button className="flex items-center gap-2.5 w-full px-3 py-1.5 rounded-lg text-slate-400 hover:text-white">
                <span>📥</span>
                <span>Withdrawal Requests</span>
              </button>
              <button className="flex items-center gap-2.5 w-full px-3 py-1.5 rounded-lg text-slate-400 hover:text-white">
                <span>💳</span>
                <span>Seller Recharges</span>
              </button>
              <button className="flex items-center gap-2.5 w-full px-3 py-1.5 rounded-lg text-slate-400 hover:text-white">
                <span>💵</span>
                <span>Currency Rates</span>
              </button>
            </div>
          </div>

          {/* Content */}
          <div>
            <div className="flex items-center justify-between px-3 py-1 mb-1 text-slate-400 hover:text-white cursor-pointer">
              <div className="flex items-center gap-3">
                <span className="text-base">🖼️</span>
                <span>Content</span>
              </div>
              <ChevronDown size={14} />
            </div>
            <div className="space-y-0.5 ml-2 border-l border-slate-800 pl-2 text-xs">
              <button className="flex items-center gap-2.5 w-full px-3 py-1.5 rounded-lg text-slate-400 hover:text-white">
                <span>🏆</span>
                <span>Events</span>
              </button>
              <button className="flex items-center gap-2.5 w-full px-3 py-1.5 rounded-lg text-slate-400 hover:text-white">
                <span>🚩</span>
                <span>Banners</span>
              </button>
            </div>
          </div>

          {/* Moderation */}
          <div>
            <div className="flex items-center justify-between px-3 py-1 mb-1 text-slate-400 hover:text-white cursor-pointer">
              <div className="flex items-center gap-3">
                <span className="text-base">🛡️</span>
                <span>Moderation</span>
              </div>
              <ChevronDown size={14} />
            </div>
            <div className="space-y-0.5 ml-2 border-l border-slate-800 pl-2 text-xs">
              <button className="flex items-center gap-2.5 w-full px-3 py-1.5 rounded-lg text-slate-400 hover:text-white">
                <span>🚨</span>
                <span>Reports & Bans</span>
              </button>
              <button className="flex items-center gap-2.5 w-full px-3 py-1.5 rounded-lg text-slate-400 hover:text-white">
                <span>🎫</span>
                <span>Support Tickets</span>
              </button>
              <button className="flex items-center gap-2.5 w-full px-3 py-1.5 rounded-lg text-slate-400 hover:text-white">
                <span>⚠️</span>
                <span>Risk Control</span>
              </button>
            </div>
          </div>

          {/* Platform */}
          <div>
            <div className="flex items-center justify-between px-3 py-1 mb-1 text-slate-400 hover:text-white cursor-pointer">
              <div className="flex items-center gap-3">
                <span className="text-base">📈</span>
                <span>Platform</span>
              </div>
              <ChevronDown size={14} />
            </div>
            <div className="space-y-0.5 ml-2 border-l border-slate-800 pl-2 text-xs">
              <button className="flex items-center gap-2.5 w-full px-3 py-1.5 rounded-lg text-slate-400 hover:text-white">
                <span>📊</span>
                <span>Analytics & Reports</span>
              </button>
              <button className="flex items-center gap-2.5 w-full px-3 py-1.5 rounded-lg text-slate-400 hover:text-white">
                <span>🏢</span>
                <span>Agency Management</span>
              </button>
              <button className="flex items-center gap-2.5 w-full px-3 py-1.5 rounded-lg text-slate-400 hover:text-white">
                <span>🎮</span>
                <span>Game Management</span>
              </button>
            </div>
          </div>

          {/* System */}
          <div>
            <div className="flex items-center justify-between px-3 py-1 text-slate-400 hover:text-white cursor-pointer">
              <div className="flex items-center gap-3">
                <span className="text-base">⚙️</span>
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
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <span>👥</span> Users
            </h2>
            <span className="text-xs bg-slate-100 text-slate-600 px-3 py-1 rounded-full font-medium">
              Total: {users.length} Users
            </span>
          </div>
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
                placeholder="Search by name, phone, email, Hurry ID..."
                className="w-full bg-[#F8FAFC] border border-slate-200 text-sm text-slate-800 rounded-lg px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition placeholder:text-slate-400"
              />
            </div>

            {/* Filter Dropdowns */}
            <div className="flex flex-wrap items-center gap-3 pt-1">
              <select 
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="bg-[#F8FAFC] border border-slate-200 text-xs font-medium text-slate-700 rounded-lg px-3 py-2 outline-none cursor-pointer hover:border-slate-300"
              >
                <option value="All Roles">All Roles</option>
                <option value="NORMAL">Normal</option>
                <option value="HOST">Host</option>
                <option value="AGENCY">Agency</option>
                <option value="ADMIN">Admin</option>
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
                    <th className="py-3.5 px-6 font-semibold">Hurry ID</th>
                    <th className="py-3.5 px-6 font-semibold">Phone / Email</th>
                    <th className="py-3.5 px-6 font-semibold">Role</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {loading ? (
                    <tr>
                      <td colSpan={4} className="py-12 text-center text-slate-400">
                        <div className="flex items-center justify-center gap-2">
                          <Loader2 className="animate-spin text-blue-500" size={20} />
                          <span>Loading Users from Firestore...</span>
                        </div>
                      </td>
                    </tr>
                  ) : filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-12 text-center text-slate-400">
                        No users found.
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((user) => (
                      <tr key={user.id} className="hover:bg-slate-50/70 transition-colors">
                        {/* User Column */}
                        <td className="py-3.5 px-6">
                          <div className="flex items-center gap-3">
                            {user.image ? (
                              <img 
                                src={user.image} 
                                alt={user.name} 
                                className="w-8 h-8 rounded-full object-cover border border-slate-200 shrink-0"
                                onError={(e) => {
                                  (e.target as HTMLElement).style.display = 'none';
                                }}
                              />
                            ) : (
                              <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 bg-blue-100 text-blue-600">
                                {user.name.charAt(0).toUpperCase()}
                              </div>
                            )}
                            <div>
                              <div className="font-semibold text-slate-800 text-sm leading-tight">
                                {user.name}
                              </div>
                              <div className="text-slate-400 text-[11px] mt-0.5">
                                {user.username ? `@${user.username}` : (user.country || '—')}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Hurry ID Column */}
                        <td className="py-3.5 px-6">
                          <span className={user.hurryId !== '—' ? 'font-semibold text-blue-600 font-mono' : 'text-slate-400'}>
                            {user.hurryId}
                          </span>
                        </td>

                        {/* Phone / Email Column */}
                        <td className="py-3.5 px-6">
                          <span className={user.emailPhone !== '—' ? 'text-slate-600 font-mono text-[11px]' : 'text-slate-400'}>
                            {user.emailPhone}
                          </span>
                        </td>

                        {/* Role Column */}
                        <td className="py-3.5 px-6">
                          <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase ${getRoleBadge(user.role)}`}>
                            {user.role}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
