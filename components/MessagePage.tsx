'use client';

import { useState, useEffect } from 'react';
import { CheckCircle, Search, ArrowLeft, Plus } from 'lucide-react';
import Image from 'next/image';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { db } from '../src/lib/firebase';
import ChatScreen from './ChatScreen';

// Types
interface ChatPreview {
  chatId: string;
  otherUser: {
    uid: string;
    name: string;
    photo: string;
  };
  lastMessage: string;
  lastTimestamp: number;
}

interface FixedChat {
  id: string;
  name: string;
  image: string;
  uid: string;
  isFixed: boolean;
}

interface AppUser {
  uid: string;
  name: string;
  photo: string;
}

interface MessagePageProps {
  onChatOpen?: (open: boolean) => void;
}

export default function MessagePage({ onChatOpen }: MessagePageProps) {
  // Fixed chats
  const [fixedChats] = useState<FixedChat[]>([
    { id: 'hawa-team', name: 'Hurry Team', image: '/logo.png', uid: 'hurry_team_official', isFixed: true },
    { id: 'hawa-system', name: 'Hurry System', image: '/1784465161302~2.jpg', uid: 'hurry_system_official', isFixed: true }
  ]);

  // Dynamic chats (Firestore)
  const [dynamicChats, setDynamicChats] = useState<ChatPreview[]>([]);
  // Active chat screen target
  const [activeChat, setActiveChat] = useState<{ uid: string; name: string; photo: string } | null>(null);
  // User list overlay state
  const [showUserList, setShowUserList] = useState(false);
  const [users, setUsers] = useState<AppUser[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  // Get current user data from localStorage
  const getCurrentUserData = () => {
    const uid = typeof window !== 'undefined' ? localStorage.getItem('userUID') || localStorage.getItem('userPhone') || 'N/A' : 'N/A';
    const name = typeof window !== 'undefined' ? localStorage.getItem('userName') || 'Me' : 'Me';
    const photo = typeof window !== 'undefined' ? localStorage.getItem('userPhoto') || '' : '';
    return { uid, name, photo };
  };

  const currentUserUid = getCurrentUserData().uid;

  // Real-time conversation listener (for chat list)
  useEffect(() => {
    if (!currentUserUid || currentUserUid === 'N/A') return;

    const conversationsRef = collection(db, 'conversations');
    const q = query(
      conversationsRef,
      where('participants', 'array-contains', currentUserUid),
      orderBy('lastTimestamp', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const chats: ChatPreview[] = [];
      snapshot.docs.forEach((doc) => {
        const data = doc.data();
        const participantsData = data.participantsData || [];
        const otherUser = participantsData.find((p: any) => p.uid !== currentUserUid);
        if (otherUser) {
          chats.push({
            chatId: doc.id,
            otherUser: {
              uid: otherUser.uid,
              name: otherUser.name,
              photo: otherUser.photo || '',
            },
            lastMessage: data.lastMessage || '',
            lastTimestamp: data.lastTimestamp?.toMillis?.() || 0,
          });
        }
      });
      setDynamicChats(chats);
    });

    return () => unsubscribe();
  }, [currentUserUid]);

  // Fetch users list when user list overlay is opened
  useEffect(() => {
    if (!showUserList || !currentUserUid || currentUserUid === 'N/A') return;

    const usersRef = collection(db, 'users');
    const q = query(usersRef);
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const allUsers = snapshot.docs.map((doc) => ({
        uid: doc.id,
        name: doc.data().name,
        photo: doc.data().photoURL || '',
      }));
      // Filter out current user
      setUsers(allUsers.filter((u) => u.uid !== currentUserUid));
    });

    return () => unsubscribe();
  }, [showUserList, currentUserUid]);

  const formatTime = (timestamp: number) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    if (days === 0) return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    if (days === 1) return 'Yesterday';
    return date.toLocaleDateString();
  };

  const handleOpenFixedChat = (chat: FixedChat) => {
    setActiveChat({ uid: chat.uid, name: chat.name, photo: chat.image });
  };

  const handleOpenDynamicChat = (chat: ChatPreview) => {
    setActiveChat({ uid: chat.otherUser.uid, name: chat.otherUser.name, photo: chat.otherUser.photo });
  };

  const handleStartNewChat = () => {
    setShowUserList(true);
  };

  const handleSelectUser = (user: AppUser) => {
    setActiveChat({ uid: user.uid, name: user.name, photo: user.photo });
    setShowUserList(false);
  };

  const handleCloseChat = () => {
    setActiveChat(null);
  };

  const handleBackFromUserList = () => {
    setShowUserList(false);
    setSearchQuery('');
  };

  // Filter users based on search
  const filteredUsers = searchQuery
    ? users.filter((u) => u.name.toLowerCase().includes(searchQuery.toLowerCase()))
    : users;

  useEffect(() => {
    if (onChatOpen) onChatOpen(!!activeChat);
  }, [activeChat, onChatOpen]);

  return (
    <div className="w-full min-h-screen bg-white">
      {/* Header */}
      <div
        className="px-4 pb-4 flex items-center justify-between sticky top-0 z-10"
        style={{
          background: 'linear-gradient(to bottom, #3b82f6 0%, #eff6ff 70%, #ffffff 100%)',
          paddingTop: 'calc(env(safe-area-inset-top, 0px) + 24px)'
        }}
      >
        <h1 className="text-3xl font-bold text-gray-800">Message</h1>
        <div className="flex items-center gap-2">
          <button
            onClick={handleStartNewChat}
            className="bg-white p-2 rounded-full shadow hover:bg-gray-100 active:scale-95 transition-transform"
          >
            <Plus size={24} className="text-blue-500" />
          </button>
          <CheckCircle size={28} className="text-green-500" />
        </div>
      </div>

      {/* Main content: Chat list or User list */}
      {!showUserList ? (
        <div className="px-4 pt-4 pb-24 flex flex-col gap-2">
          {/* Fixed chats */}
          {fixedChats.map((chat) => (
            <div
              key={chat.id}
              onClick={() => handleOpenFixedChat(chat)}
              className="flex items-center gap-3 bg-gray-100 px-3 py-2 rounded-xl cursor-pointer active:bg-gray-200 transition-colors"
            >
              <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden">
                <Image src={chat.image} alt={chat.name} width={40} height={40} className="object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-800 text-sm">{chat.name}</h3>
              </div>
            </div>
          ))}

          {/* Dynamic chats */}
          {dynamicChats.map((chat) => (
            <div
              key={chat.chatId}
              onClick={() => handleOpenDynamicChat(chat)}
              className="flex items-center gap-3 bg-gray-100 px-3 py-2 rounded-xl cursor-pointer active:bg-gray-200 transition-colors"
            >
              <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden">
                <Image
                  src={chat.otherUser.photo || '/default-avatar.png'}
                  alt={chat.otherUser.name}
                  width={40}
                  height={40}
                  className="object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-800 text-sm">{chat.otherUser.name}</h3>
                <p className="text-xs text-gray-500 truncate">{chat.lastMessage}</p>
              </div>
              <span className="text-[10px] text-gray-400">{formatTime(chat.lastTimestamp)}</span>
            </div>
          ))}

          {/* Empty state */}
          {dynamicChats.length === 0 && (
            <p className="text-center text-gray-400 mt-10">No conversations yet. Start a new chat!</p>
          )}
        </div>
      ) : (
        <div className="px-4 pt-4 pb-24">
          {/* User List Header */}
          <div className="flex items-center gap-3 mb-4">
            <button onClick={handleBackFromUserList} className="p-1 hover:bg-gray-100 rounded-full">
              <ArrowLeft size={24} />
            </button>
            <h2 className="text-xl font-bold text-gray-800">New Chat</h2>
          </div>

          {/* Search Bar */}
          <div className="flex items-center bg-gray-100 rounded-full px-4 py-2 mb-4">
            <Search size={20} className="text-gray-400 mr-2" />
            <input
              type="text"
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent outline-none flex-1 text-sm"
            />
          </div>

          {/* User List */}
          <div className="flex flex-col gap-2">
            {filteredUsers.length === 0 ? (
              <p className="text-center text-gray-400 mt-10">No users found.</p>
            ) : (
              filteredUsers.map((user) => (
                <div
                  key={user.uid}
                  onClick={() => handleSelectUser(user)}
                  className="flex items-center gap-3 bg-gray-100 px-3 py-2 rounded-xl cursor-pointer active:bg-gray-200 transition-colors"
                >
                  <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden">
                    <Image
                      src={user.photo || '/default-avatar.png'}
                      alt={user.name}
                      width={40}
                      height={40}
                      className="object-cover"
                    />
                  </div>
                  <span className="font-medium text-gray-800 text-sm">{user.name}</span>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Chat Screen Overlay */}
      {activeChat && (
        <ChatScreen
          currentUser={getCurrentUserData()}
          targetUser={activeChat}
          onClose={handleCloseChat}
        />
      )}
    </div>
  );
            }
