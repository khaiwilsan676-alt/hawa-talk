'use client';

import { useState, useEffect } from 'react';
import { CheckCircle } from 'lucide-react';
import Image from 'next/image';
import {
  collection,
  query,
  where,
  onSnapshot,
  orderBy,
  doc,
  updateDoc,
} from 'firebase/firestore';
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
  unreadCount: number;
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
  sharedRoomData?: {
    roomId: string;
    roomName: string;
    roomImage: string;
  } | null;
}

export default function MessagePage({ onChatOpen, sharedRoomData }: MessagePageProps) {
  const [fixedChats] = useState<FixedChat[]>([
    { id: 'hawa-team', name: 'Hurry Team', image: '/logo.png', uid: 'hurry_team_official', isFixed: true },
    { id: 'hawa-system', name: 'Hurry System', image: '/1784465161302~2.jpg', uid: 'hurry_system_official', isFixed: true }
  ]);

  const [dynamicChats, setDynamicChats] = useState<ChatPreview[]>([]);
  const [activeChat, setActiveChat] = useState<{ uid: string; name: string; photo: string } | null>(null);
  const [users, setUsers] = useState<AppUser[]>([]);

  const getCurrentUserData = () => {
    const uid = typeof window !== 'undefined' ? localStorage.getItem('userUID') || localStorage.getItem('userPhone') || 'N/A' : 'N/A';
    const name = typeof window !== 'undefined' ? localStorage.getItem('userName') || 'Me' : 'Me';
    const photo = typeof window !== 'undefined' ? localStorage.getItem('userPhoto') || '' : '';
    return { uid, name, photo };
  };

  const currentUserUid = getCurrentUserData().uid;

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
      const seenUids = new Set();
      snapshot.docs.forEach((doc) => {
        const data = doc.data();
        const participantsData = data.participantsData || [];
        const otherUser = participantsData.find((p: any) => p.uid !== currentUserUid);

        // Filter out if the conversation was cleared after the last message
        const clearedAt = data.clearedAtRef?.[currentUserUid] || 0;
        const lastTimestamp = data.lastTimestamp?.toMillis?.() || 0;

        if (otherUser && !seenUids.has(otherUser.uid) && lastTimestamp >= clearedAt) {
          seenUids.add(otherUser.uid);
          chats.push({
            chatId: doc.id,
            otherUser: {
              uid: otherUser.uid,
              name: otherUser.name,
              photo: otherUser.photo || '',
            },
            lastMessage: data.lastMessage || '',
            lastTimestamp: lastTimestamp,
            unreadCount: data.unreadCounts?.[currentUserUid] || 0,
          });
        }
      });
      setDynamicChats(chats);
    });

    return () => unsubscribe();
  }, [currentUserUid]);

  useEffect(() => {
    if (!currentUserUid || currentUserUid === 'N/A') return;

    const usersRef = collection(db, 'users');
    const q = query(usersRef);
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const allUsers = snapshot.docs.map((doc) => ({
        uid: doc.id,
        name: doc.data().name,
        photo: doc.data().photoURL || '',
      }));
      setUsers(allUsers.filter((u) => u.uid !== currentUserUid));
    });

    return () => unsubscribe();
  }, [currentUserUid]);

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

  const handleOpenDynamicChat = async (chat: ChatPreview) => {
    setActiveChat({ uid: chat.otherUser.uid, name: chat.otherUser.name, photo: chat.otherUser.photo });
    try {
      const convoRef = doc(db, 'conversations', chat.chatId);
      await updateDoc(convoRef, {
        [`unreadCounts.${currentUserUid}`]: 0,
      });
    } catch (error) {
      console.error('Failed to reset unread count:', error);
    }
  };

  const handleSelectUser = (user: AppUser) => {
    setActiveChat({ uid: user.uid, name: user.name, photo: user.photo });
  };

  const handleCloseChat = () => {
    setActiveChat(null);
  };

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
        <CheckCircle size={28} className="text-green-500" />
      </div>

      {/* Main content: Chats + Users list */}
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

        {/* Dynamic chats with unread badges */}
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
            <div className="flex flex-col items-end gap-1">
              <span className="text-[10px] text-gray-400">{formatTime(chat.lastTimestamp)}</span>
              {chat.unreadCount > 0 && (
                <span className="bg-red-500 text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
                  {chat.unreadCount > 99 ? '99+' : chat.unreadCount}
                </span>
              )}
            </div>
          </div>
        ))}

        {/* Users section (no heading) */}
        <div className="mt-6">
          <div className="flex flex-col gap-2">
            {(() => {
              const activeChatUids = new Set([
                ...fixedChats.map(c => c.uid),
                ...dynamicChats.map(c => c.otherUser.uid)
              ]);
              return users.filter(user => !activeChatUids.has(user.uid)).map((user) => (
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
              ));
            })()}
          </div>
        </div>
      </div>

      {/* Chat Screen Overlay */}
      {activeChat && (
        <ChatScreen
          currentUser={getCurrentUserData()}
          targetUser={activeChat}
          onClose={handleCloseChat}
          sharedRoomData={sharedRoomData}
        />
      )}
    </div>
  );
            }
