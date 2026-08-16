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
  getDoc,
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

interface MessagePageProps {
  onChatOpen?: (open: boolean) => void;
  onJoinRoom?: (roomId: string) => void;
  sharedRoomData?: {
    roomId: string;
    roomName: string;
    roomImage: string;
  } | null;
}

export default function MessagePage({ onChatOpen, onJoinRoom, sharedRoomData }: MessagePageProps) {
  const [fixedChats] = useState<FixedChat[]>([
    { id: 'hawa-team', name: 'Hurry Team', image: '/logo.png', uid: 'hurry_team_official', isFixed: true },
    { id: 'hawa-system', name: 'Hurry System', image: '/1784465161302~2.jpg', uid: 'hurry_system_official', isFixed: true }
  ]);

  const [dynamicChats, setDynamicChats] = useState<ChatPreview[]>([]);
  const [activeChat, setActiveChat] = useState<{ uid: string; name: string; photo: string } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const getCurrentUserData = () => {
    const uid = typeof window !== 'undefined' ? localStorage.getItem('userUID') || localStorage.getItem('userPhone') || 'N/A' : 'N/A';
    const name = typeof window !== 'undefined' ? localStorage.getItem('userName') || 'Me' : 'Me';
    const photo = typeof window !== 'undefined' ? localStorage.getItem('userPhoto') || '' : '';
    return { uid, name, photo };
  };

  const currentUserUid = getCurrentUserData().uid;

  // ---------- Listen to conversations ----------
  useEffect(() => {
    if (!currentUserUid || currentUserUid === 'N/A') {
      setIsLoading(false);
      return;
    }

    const conversationsRef = collection(db, 'conversations');
    const q = query(
      conversationsRef,
      where('participants', 'array-contains', currentUserUid),
      orderBy('lastTimestamp', 'desc')
    );

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      try {
        const chats: ChatPreview[] = [];
        const seenUids = new Set<string>();

        for (const docSnapshot of snapshot.docs) {
          const data = docSnapshot.data();
          const participantsData = data.participantsData || [];
          let otherUser = participantsData.find((p: any) => p.uid !== currentUserUid);

          // Get lastTimestamp
          const lastTimestamp = typeof data.lastTimestamp?.toMillis === "function"
            ? data.lastTimestamp.toMillis()
            : (data.lastTimestamp || 0);

          // Skip if no other user or no messages
          if (!otherUser || seenUids.has(otherUser.uid) || lastTimestamp === 0) {
            continue;
          }

          seenUids.add(otherUser.uid);

          // Fetch fresh user data from users collection
          try {
            const userDocRef = doc(db, 'users', otherUser.uid);
            const userDocSnap = await getDoc(userDocRef);
            if (userDocSnap.exists()) {
              const userData = userDocSnap.data();
              otherUser = {
                uid: otherUser.uid,
                name: userData.name || userData.displayName || otherUser.name || 'User',
                photo: userData.photoURL || userData.photo || userData.image || otherUser.photo || '',
              };
            }
          } catch (error) {
            console.error('Error fetching user data:', error);
          }

          chats.push({
            chatId: docSnapshot.id,
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

        // Sort by timestamp
        chats.sort((a, b) => b.lastTimestamp - a.lastTimestamp);
        setDynamicChats(chats);
        setIsLoading(false);
      } catch (error) {
        console.error('Error processing conversations:', error);
        setIsLoading(false);
      }
    }, (error) => {
      console.error('Firestore listener error:', error);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [currentUserUid]);

  // ---------- Helpers ----------
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

  const handleCloseChat = () => {
    setActiveChat(null);
  };

  // ---------- Notify parent about chat open state ----------
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

      {/* Main content: Chats only */}
      <div className="px-4 pt-4 pb-24 flex flex-col gap-1">
        {/* Fixed chats */}
        {fixedChats.map((chat) => (
          <div
            key={chat.id}
            onClick={() => handleOpenFixedChat(chat)}
            className="flex items-center gap-4 px-2 py-2.5 cursor-pointer active:opacity-60 transition-opacity"
          >
            <div className="w-14 h-14 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden">
              <Image src={chat.image} alt={chat.name} width={56} height={56} className="object-cover" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-800 text-base">{chat.name}</h3>
            </div>
          </div>
        ))}

        {/* Dynamic chats – no loading spinner, just show the list */}
        {dynamicChats.map((chat) => (
          <div
            key={chat.chatId}
            onClick={() => handleOpenDynamicChat(chat)}
            className="flex items-center gap-4 px-2 py-2.5 cursor-pointer active:opacity-60 transition-opacity"
          >
            <div className="w-14 h-14 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden">
              <Image
                src={chat.otherUser.photo || '/default-avatar.png'}
                alt={chat.otherUser.name}
                width={56}
                height={56}
                className="object-cover"
              />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-800 text-base">{chat.otherUser.name}</h3>
              <p className="text-sm text-gray-500 truncate">{chat.lastMessage}</p>
            </div>
            <div className="flex flex-col items-end gap-1">
              <span className="text-xs text-gray-400">{formatTime(chat.lastTimestamp)}</span>
              {chat.unreadCount > 0 && (
                <span className="bg-red-500 text-white text-xs font-bold rounded-full min-w-[22px] h-[22px] flex items-center justify-center px-1.5">
                  {chat.unreadCount > 99 ? '99+' : chat.unreadCount}
                </span>
              )}
            </div>
          </div>
        ))}

        {/* Show message if no conversations (and not loading) */}
        {!isLoading && dynamicChats.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-400 text-sm">No conversations yet</p>
          </div>
        )}
      </div>

      {/* Chat Screen Overlay */}
      {activeChat && (
        <ChatScreen
          currentUser={getCurrentUserData()}
          targetUser={activeChat}
          onClose={handleCloseChat}
          onJoinRoom={onJoinRoom}
          sharedRoomData={sharedRoomData}
        />
      )}
    </div>
  );
    }
