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
  deleteField,
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

  // ---------- Hidden conversations (chatId → hiddenAt timestamp) ----------
  const [hiddenMap, setHiddenMap] = useState<Record<string, number>>({});

  // ---------- UI state for hiding confirmation ----------
  const [chatToHide, setChatToHide] = useState<{ chatId: string; name: string } | null>(null);
  const [showHideConfirm, setShowHideConfirm] = useState(false);

  // ---------- Long‑press detection (for the conversation cards) ----------
  const [longPressTimer, setLongPressTimer] = useState<NodeJS.Timeout | null>(null);
  const [pressTarget, setPressTarget] = useState<string | null>(null);

  const getCurrentUserData = () => {
    const uid = typeof window !== 'undefined' ? localStorage.getItem('userUID') || localStorage.getItem('userPhone') || 'N/A' : 'N/A';
    const name = typeof window !== 'undefined' ? localStorage.getItem('userName') || 'Me' : 'Me';
    const photo = typeof window !== 'undefined' ? localStorage.getItem('userPhoto') || '' : '';
    return { uid, name, photo };
  };

  const currentUserUid = getCurrentUserData().uid;

  // ---------- Listen to hidden conversations in the user's document ----------
  useEffect(() => {
    if (!currentUserUid || currentUserUid === 'N/A') return;

    const userRef = doc(db, 'users', currentUserUid);
    const unsubscribe = onSnapshot(userRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setHiddenMap(data.hiddenConversations || {});
      } else {
        setHiddenMap({});
      }
    });

    return () => unsubscribe();
  }, [currentUserUid]);

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
          const chatId = docSnapshot.id;
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

          // ---------- HIDDEN CONVERSATION LOGIC ----------
          const hiddenAt = hiddenMap[chatId];
          if (hiddenAt !== undefined) {
            const lastSenderUid = data.lastSenderUid || '';
            // If the other user sent a message AFTER we hid it → auto‑unhide
            if (lastSenderUid !== currentUserUid && lastTimestamp > hiddenAt) {
              // Remove from hidden map in Firestore (fire and forget)
              const userRef = doc(db, 'users', currentUserUid);
              updateDoc(userRef, {
                [`hiddenConversations.${chatId}`]: deleteField(),
              }).catch((err) => console.error('Failed to unhide:', err));
              // Continue processing – this conversation will be shown
            } else {
              // Still hidden – skip adding to the list
              continue;
            }
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
            chatId,
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
  }, [currentUserUid, hiddenMap]); // Re‑run when hiddenMap changes

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

  // ---------- Hide conversation ----------
  const handleHideConversation = async (chatId: string) => {
    try {
      const userRef = doc(db, 'users', currentUserUid);
      await updateDoc(userRef, {
        [`hiddenConversations.${chatId}`]: Date.now(),
      });
      setShowHideConfirm(false);
      setChatToHide(null);
    } catch (error) {
      console.error('Failed to hide conversation:', error);
      alert('Could not hide conversation.');
    }
  };

  // ---------- Long‑press handlers for mobile ----------
  const handlePressStart = (chatId: string) => {
    const timer = setTimeout(() => {
      // Find the chat name
      const chat = dynamicChats.find((c) => c.chatId === chatId);
      if (chat) {
        setChatToHide({ chatId, name: chat.otherUser.name });
        setShowHideConfirm(true);
      }
      setPressTarget(null);
    }, 500); // 500ms long press
    setLongPressTimer(timer);
    setPressTarget(chatId);
  };

  const handlePressEnd = () => {
    if (longPressTimer) {
      clearTimeout(longPressTimer);
      setLongPressTimer(null);
    }
    setPressTarget(null);
  };

  // ---------- Effect to notify parent about chat open state ----------
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

        {/* Loading indicator */}
        {isLoading && (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        )}

        {/* Dynamic chats with unread badges */}
        {!isLoading && dynamicChats.map((chat) => (
          <div
            key={chat.chatId}
            onClick={() => handleOpenDynamicChat(chat)}
            // Long press to hide
            onTouchStart={() => handlePressStart(chat.chatId)}
            onTouchEnd={handlePressEnd}
            onTouchCancel={handlePressEnd}
            onMouseDown={() => handlePressStart(chat.chatId)}
            onMouseUp={handlePressEnd}
            onMouseLeave={handlePressEnd}
            // Also provide a context menu for desktop right‑click
            onContextMenu={(e) => {
              e.preventDefault();
              setChatToHide({ chatId: chat.chatId, name: chat.otherUser.name });
              setShowHideConfirm(true);
            }}
            className="flex items-center gap-4 px-2 py-2.5 cursor-pointer active:opacity-60 transition-opacity relative"
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

        {/* Empty state */}
        {!isLoading && dynamicChats.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-400 text-sm">No conversations yet</p>
          </div>
        )}
      </div>

      {/* -------- Hide Conversation Confirmation Modal -------- */}
      {showHideConfirm && chatToHide && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
          onClick={() => {
            setShowHideConfirm(false);
            setChatToHide(null);
          }}
        >
          <div
            className="bg-white rounded-2xl px-6 py-5 shadow-xl max-w-xs w-full text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-bold text-gray-800 mb-1">
              Hide conversation with {chatToHide.name}?
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              You won’t see it in your list until they message you again.
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setShowHideConfirm(false);
                  setChatToHide(null);
                }}
                className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-full transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => handleHideConversation(chatToHide.chatId)}
                className="flex-1 py-2.5 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-full transition-colors cursor-pointer"
              >
                Hide
              </button>
            </div>
          </div>
        </div>
      )}

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
