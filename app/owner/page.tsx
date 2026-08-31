'use client';

import React, { useState, useEffect } from 'react';
import {
  Loader2,
  Search,
  CheckCircle,
  XCircle,
  Tag
} from 'lucide-react';
import { getUser, updateUser, updateRoom, getRooms } from '../../src/lib/googleSheets';

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

// Available Tags Data
const AVAILABLE_TAGS = [
  {
    id: 'adminTag',
    name: 'Admin',
    image: '/1788021461820~2.jpg',
    description: 'Admin badge',
    color: 'bg-rose-50 border-rose-200',
    isGreenRemoval: true
  },
  {
    id: 'officialTag',
    name: 'Official',
    image: '/1788021468845~2.jpg',
    description: 'Official verified badge',
    color: 'bg-blue-50 border-blue-200',
    isGreenRemoval: true
  },
  {
    id: 'vipTag',
    name: 'VIP',
    image: '/1785469775751.png',
    description: 'VIP member badge',
    color: 'bg-amber-50 border-amber-200',
    isWhiteRemoval: true
  },
  {
    id: 'premiumTag',
    name: 'Premium',
    image: '/1785469784333.png',
    description: 'Premium user badge',
    color: 'bg-purple-50 border-purple-200',
    isWhiteRemoval: true
  }
];

export default function OwnerPage() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);

  // Tag assignment states
  const [tagSearchUserId, setTagSearchUserId] = useState('');
  const [selectedTagUserData, setSelectedTagUserData] = useState<any>(null);
  const [selectedTagUserId, setSelectedTagUserId] = useState<string>('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [tagSearching, setTagSearching] = useState(false);
  const [tagAssigning, setTagAssigning] = useState(false);
  const [tagSuccess, setTagSuccess] = useState('');
  const [tagError, setTagError] = useState('');

  // Fetch all users via getRooms / getUser
  useEffect(() => {
    const loadUsers = async () => {
      try {
        const rawRooms = await getRooms();
        if (Array.isArray(rawRooms)) {
          const fetchedUsers: UserData[] = rawRooms.map((data: any) => {
            const roomId = String(data.ID || data.id || data.roomId || '');
            const accId = String(data['Room Admin'] || data.accountId || '—');

            let userRole: 'NORMAL' | 'HOST' | 'AGENCY' | 'ADMIN' = 'NORMAL';
            if (data.type === 'admin' || data.isOfficial) {
              userRole = 'ADMIN';
            } else if (data.role === 'HOST' || data.type === 'host') {
              userRole = 'HOST';
            } else if (data.role === 'AGENCY' || data.type === 'agency') {
              userRole = 'AGENCY';
            }

            return {
              id: roomId,
              name: data['Room Name'] || data.name || 'User',
              username: data.username || '',
              hurryId: accId,
              emailPhone: data.email || data.phone || '—',
              role: userRole,
              gender: data.gender || '',
              country: data.Country || data.country || '🇮🇳',
              image: data['Room dp'] || data.image || '/default-avatar.png'
            };
          });

          setUsers(fetchedUsers);
        }
      } catch (err) {
        console.error("Error loading users from Google Sheets:", err);
      } finally {
        setLoading(false);
      }
    };

    loadUsers();
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

  // Search user by ID for tag assignment
  const handleTagUserSearch = async () => {
    if (!tagSearchUserId.trim()) {
      setTagError('Please enter a User ID');
      return;
    }

    setTagSearching(true);
    setTagError('');
    setTagSuccess('');
    setSelectedTagUserData(null);
    setSelectedTags([]);

    try {
      const res = await getUser(tagSearchUserId.trim());
      const userData = res && (res.user || res.data || res);

      if (userData && (userData.id || userData.AppLongId || userData['App long ID'] || userData.Name || userData.name)) {
        const uId = userData.id || userData.AppLongId || userData['App long ID'] || tagSearchUserId.trim();
        setSelectedTagUserData({
          id: uId,
          name: userData.name || userData.Name || 'User',
          accountId: userData.accountId || userData.accountNumber || userData['Account Number'] || uId,
          image: userData.photo || userData.avatar || userData.Avtar || userData.image || '/default-avatar.png'
        });
        setSelectedTagUserId(uId);

        // Pre-select existing tags
        const existingTags: string[] = [];
        if (userData.adminTag) existingTags.push('adminTag');
        if (userData.officialTag) existingTags.push('officialTag');
        if (userData.vipTag) existingTags.push('vipTag');
        if (userData.premiumTag) existingTags.push('premiumTag');

        setSelectedTags(existingTags);
      } else {
        setTagError(`No user found with ID: ${tagSearchUserId}`);
      }
    } catch (err) {
      console.error('Error searching user:', err);
      setTagError('Error searching user. Please try again.');
    } finally {
      setTagSearching(false);
    }
  };

  // Toggle tag selection
  const handleTagToggle = (tagId: string) => {
    if (selectedTags.includes(tagId)) {
      setSelectedTags(selectedTags.filter((t) => t !== tagId));
    } else {
      setSelectedTags([...selectedTags, tagId]);
    }
  };

  // Assign selected tags to user
  const handleAssignTags = async () => {
    if (!selectedTagUserId) {
      setTagError('Please search and select a user first');
      return;
    }

    if (selectedTags.length === 0) {
      setTagError('Please select at least one tag');
      return;
    }

    setTagAssigning(true);
    setTagError('');
    setTagSuccess('');

    try {
      const tagUpdate = {
        id: selectedTagUserId,
        appLongId: selectedTagUserId,
        adminTag: selectedTags.includes('adminTag'),
        officialTag: selectedTags.includes('officialTag'),
        vipTag: selectedTags.includes('vipTag'),
        premiumTag: selectedTags.includes('premiumTag'),
      };

      await updateUser(tagUpdate);
      await updateRoom({ roomId: selectedTagUserId, id: selectedTagUserId, ...tagUpdate });

      setTagSuccess(`✅ Tags assigned successfully to ${selectedTagUserData?.name}!`);
      
      setTagSearchUserId('');
      setSelectedTagUserData(null);
      setSelectedTagUserId('');
      setSelectedTags([]);
      
      setTimeout(() => {
        setTagSuccess('');
      }, 3000);
    } catch (err) {
      console.error('Error assigning tags:', err);
      setTagError('Error assigning tags. Please try again.');
    } finally {
      setTagAssigning(false);
    }
  };

  // Remove all tags from user
  const handleRemoveAllTags = async () => {
    if (!selectedTagUserId) {
      setTagError('Please search and select a user first');
      return;
    }

    setTagAssigning(true);
    setTagError('');
    setTagSuccess('');

    try {
      const tagUpdate = {
        id: selectedTagUserId,
        appLongId: selectedTagUserId,
        adminTag: false,
        officialTag: false,
        vipTag: false,
        premiumTag: false,
      };

      await updateUser(tagUpdate);
      await updateRoom({ roomId: selectedTagUserId, id: selectedTagUserId, ...tagUpdate });

      setSelectedTags([]);
      setTagSuccess('✅ All tags removed successfully!');
      
      setTimeout(() => {
        setTagSuccess('');
      }, 3000);
    } catch (err) {
      console.error('Error removing tags:', err);
      setTagError('Error removing tags. Please try again.');
    } finally {
      setTagAssigning(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8 font-sans">
      <div className="max-w-6xl mx-auto space-y-6">

        {/* Header */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Owner Management Panel</h1>
            <p className="text-xs text-slate-500 mt-1">Manage user tags, roles, and profiles</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="bg-blue-50 text-blue-600 px-3 py-1.5 rounded-full text-xs font-bold border border-blue-100">
              Total Rooms: {users.length}
            </span>
          </div>
        </div>

        {/* Tag Assignment Section */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 space-y-5">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-4">
            <Tag className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-bold text-slate-800">Assign Profile Tags</h2>
          </div>

          {/* Search Bar */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <input
                type="text"
                value={tagSearchUserId}
                onChange={(e) => setTagSearchUserId(e.target.value)}
                placeholder="Enter User UID or Account Number..."
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                onKeyDown={(e) => e.key === 'Enter' && handleTagUserSearch()}
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            </div>
            <button
              onClick={handleTagUserSearch}
              disabled={tagSearching}
              className="px-6 py-3 bg-blue-600 text-white font-bold text-xs rounded-2xl shadow-md hover:bg-blue-700 transition flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              {tagSearching ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Searching...</span>
                </>
              ) : (
                <span>Search User</span>
              )}
            </button>
          </div>

          {/* Error / Success Messages */}
          {tagError && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-600 text-xs rounded-2xl flex items-center gap-2">
              <XCircle className="w-4 h-4 flex-shrink-0" />
              <span>{tagError}</span>
            </div>
          )}
          {tagSuccess && (
            <div className="p-3 bg-green-50 border border-green-200 text-green-600 text-xs rounded-2xl flex items-center gap-2">
              <CheckCircle className="w-4 h-4 flex-shrink-0" />
              <span>{tagSuccess}</span>
            </div>
          )}

          {/* User Selected Info & Tags List */}
          {selectedTagUserData && (
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-4 animate-in fade-in-50 duration-200">

              {/* User Details */}
              <div className="flex items-center gap-3 border-b border-slate-200/60 pb-3">
                <img
                  src={selectedTagUserData.image}
                  alt={selectedTagUserData.name}
                  className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm"
                />
                <div>
                  <h3 className="font-bold text-slate-800 text-sm">{selectedTagUserData.name}</h3>
                  <p className="text-xs text-slate-500">ID: {selectedTagUserData.accountId}</p>
                </div>
              </div>

              {/* Tag Options Grid */}
              <div>
                <p className="text-xs font-bold text-slate-700 mb-2">Select Tags to Assign:</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {AVAILABLE_TAGS.map((tag) => {
                    const isSelected = selectedTags.includes(tag.id);
                    return (
                      <div
                        key={tag.id}
                        onClick={() => handleTagToggle(tag.id)}
                        className={`p-3 rounded-2xl border-2 transition cursor-pointer flex items-center gap-3 ${
                          isSelected
                            ? 'bg-blue-50 border-blue-500 shadow-xs'
                            : 'bg-white border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <div className="w-8 h-8 rounded-full overflow-hidden bg-slate-100 flex items-center justify-center flex-shrink-0">
                          <img src={tag.image} alt={tag.name} className="w-full h-full object-contain" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-xs text-slate-800">{tag.name}</p>
                          <p className="text-[10px] text-slate-400 truncate">{tag.description}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 justify-end pt-2">
                <button
                  onClick={handleRemoveAllTags}
                  disabled={tagAssigning}
                  className="px-4 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold text-xs rounded-xl border border-rose-200 transition cursor-pointer disabled:opacity-50"
                >
                  Remove All Tags
                </button>
                <button
                  onClick={handleAssignTags}
                  disabled={tagAssigning}
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {tagAssigning ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <span>Save Tag Changes</span>
                  )}
                </button>
              </div>

            </div>
          )}
        </div>

        {/* User Table List */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-800">Global Rooms & Admin Users</h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-slate-400 uppercase font-bold border-b border-slate-100">
                <tr>
                  <th className="p-4">User / Room Name</th>
                  <th className="p-4">Account ID</th>
                  <th className="p-4">Country</th>
                  <th className="p-4">Role</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-slate-400">
                      <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-blue-500" />
                      <span>Loading database records...</span>
                    </td>
                  </tr>
                ) : users.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-slate-400">
                      No user records found.
                    </td>
                  </tr>
                ) : (
                  users.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-50/80 transition">
                      <td className="p-4 font-bold text-slate-800 flex items-center gap-3">
                        <img
                          src={u.image || '/default-avatar.png'}
                          alt={u.name}
                          className="w-8 h-8 rounded-full object-cover border border-slate-200"
                        />
                        <span>{u.name}</span>
                      </td>
                      <td className="p-4 font-mono">{u.hurryId}</td>
                      <td className="p-4">{u.country}</td>
                      <td className="p-4">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${getRoleBadge(u.role)}`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <button
                          onClick={() => {
                            setTagSearchUserId(u.id);
                            handleTagUserSearch();
                          }}
                          className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-xl font-bold text-[11px] transition cursor-pointer"
                        >
                          Manage Tags
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}
