'use client';

import { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Send, ImageIcon, MoreHorizontal, LogIn, Trash2, Flag, Ban, X, Copy, Check } from 'lucide-react';
import {
  collection,
  onSnapshot,
  query,
  orderBy,
  addDoc,
  serverTimestamp,
  doc,
  setDoc,
  updateDoc,
  getDoc,
  deleteDoc,
  writeBatch,
} from 'firebase/firestore';
import { db } from '../src/lib/firebase';

interface Message {
  id: string;
  text: string;
  sender: 'me' | 'other';
  timestamp: number;
  type?: 'message' | 'room_invite' | 'image';
  imageUrl?: string;
  roomData?: {
    roomId: string;
    roomName: string;
    roomImage: string;
  };
  replyTo?: {
    id: string;
    text: string;
    senderName: string;
  } | null;
}

interface ChatScreenProps {
  currentUser: { uid: string; name: string; photo: string };
  targetUser: { uid: string; name: string; photo: string };
  onClose: () => void;
  onJoinRoom?: (roomId: string) => void;
  sharedRoomData?: {
    roomId: string;
    roomName: string;
    roomImage: string;
  } | null;
}

const FIXED_CHAT_UIDS = ['hurry_team_official', 'hurry_system_official'];

export default function ChatScreen({ currentUser, targetUser, onClose, onJoinRoom, sharedRoomData }: ChatScreenProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [connected, setConnected] = useState(false);
  const [online, setOnline] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [showBlockConfirm, setShowBlockConfirm] = useState(false);
  const [showReportConfirm, setShowReportConfirm] = useState(false);
  const [replyTo, setReplyTo] = useState<Message | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteMode, setDeleteMode] = useState(false);
  const [selectedMessages, setSelectedMessages] = useState<Set<string>>(new Set());
  const [copiedMsgId, setCopiedMsgId] = useState<string | null>(null);
  const [showFullImage, setShowFullImage] = useState<string | null>(null);
  const longPressTimerRef = useRef<NodeJS.Timeout | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const lastSentInviteRoomIdRef = useRef<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isFixedChat = FIXED_CHAT_UIDS.includes(targetUser.uid);

  // Unique chat ID for both users
  const chatId = [currentUser.uid, targetUser.uid].sort().join('_');

  // Check online status
  useEffect(() => {
    if (isFixedChat) {
      setOnline(true);
      return;
    }
    
    const presenceRef = doc(db, 'presence', targetUser.uid);
    const unsubscribe = onSnapshot(presenceRef, (snap) => {
      if (snap.exists()) {
        setOnline(snap.data()?.online || false);
      } else {
        setOnline(false);
      }
    });

    return () => unsubscribe();
  }, [targetUser.uid, isFixedChat]);

  // Firestore listener for messages
  useEffect(() => {
    if (typeof window === 'undefined') return;

    let unsubMessages: (() => void) | null = null;

    const chatDocRef = doc(db, 'chats', chatId);
    const unsubChatDoc = onSnapshot(chatDocRef, (docSnap) => {
      const chatData = docSnap.data();
      const clearedAt = chatData?.clearedAtRef?.[currentUser.uid] || 0;

      const messagesRef = collection(db, 'chats', chatId, 'messages');
      const q = query(messagesRef, orderBy('timestamp', 'asc'));

      if (unsubMessages) {
        unsubMessages();
      }

      unsubMessages = onSnapshot(
        q,
        (snapshot) => {
          const loadedMessages: Message[] = snapshot.docs.map((doc) => {
            const data = doc.data();
            return {
              id: doc.id,
              text: data.text || '',
              sender: data.senderUid === currentUser.uid ? 'me' : 'other',
              timestamp: data.timestamp?.toMillis?.() ?? Date.now(),
              type: data.type || 'message',
              imageUrl: data.imageUrl || undefined,
              roomData: data.roomData || undefined,
              replyTo: data.replyTo || null,
            };
          }).filter(msg => msg.timestamp > clearedAt);

          setMessages(loadedMessages);
          setConnected(true);
        },
        (error) => {
          console.error('Firestore listener error:', error);
          setConnected(false);
        }
      );
    });

    return () => {
      unsubChatDoc();
      if (unsubMessages) {
        unsubMessages();
      }
    };
  }, [chatId, currentUser.uid]);

  // Auto-send room invite if sharedRoomData exists
  useEffect(() => {
    if (sharedRoomData && connected && !isFixedChat && lastSentInviteRoomIdRef.current !== sharedRoomData.roomId) {
      lastSentInviteRoomIdRef.current = sharedRoomData.roomId;
      sendRoomInvite(sharedRoomData);
    }
  }, [sharedRoomData, connected, isFixedChat]);

  const updateConversation = async (
    chatId: string,
    senderUid: string,
    targetUser: { uid: string; name: string; photo: string },
    messageText: string,
    isImage: boolean = false
  ) => {
    try {
      const convoRef = doc(db, 'conversations', chatId);
      const convoSnap = await getDoc(convoRef);
      
      const lastMessageText = isImage ? '📷 Photo' : messageText;
      
      if (convoSnap.exists()) {
        await updateDoc(convoRef, {
          lastMessage: lastMessageText,
          lastTimestamp: serverTimestamp(),
          [`unreadCounts.${targetUser.uid}`]: (convoSnap.data().unreadCounts?.[targetUser.uid] || 0) + 1,
        });
      } else {
        await setDoc(convoRef, {
          participants: [senderUid, targetUser.uid],
          participantsData: [
            {
              uid: senderUid,
              name: currentUser.name,
              photo: currentUser.photo,
            },
            {
              uid: targetUser.uid,
              name: targetUser.name,
              photo: targetUser.photo,
            }
          ],
          lastMessage: lastMessageText,
          lastTimestamp: serverTimestamp(),
          unreadCounts: {
            [targetUser.uid]: 1,
          },
        });
      }
    } catch (error) {
      console.error('Error updating conversation:', error);
    }
  };

  const sendRoomInvite = async (roomData: { roomId: string; roomName: string; roomImage: string }) => {
    if (isFixedChat) {
      console.log('Cannot send room invite to fixed chat');
      return;
    }
    
    try {
      const messagesRef = collection(db, 'chats', chatId, 'messages');
      await addDoc(messagesRef, {
        text: `Joins our Party Room: ${roomData.roomName}`,
        senderUid: currentUser.uid,
        timestamp: serverTimestamp(),
        type: 'room_invite',
        roomData: {
          roomId: roomData.roomId,
          roomName: roomData.roomName,
          roomImage: roomData.roomImage,
        },
      });
      
      await updateConversation(chatId, currentUser.uid, targetUser, `🎉 Party Room: ${roomData.roomName}`);
    } catch (error) {
      console.error('Error sending room invite:', error);
    }
  };

  const handleSend = async () => {
    if (!newMessage.trim()) return;
    
    if (isFixedChat) {
      alert('You cannot send messages to this official account');
      return;
    }
    
    const messageText = newMessage.trim();
    setNewMessage('');

    try {
      const messagesRef = collection(db, 'chats', chatId, 'messages');
      await addDoc(messagesRef, {
        text: messageText,
        senderUid: currentUser.uid,
        timestamp: serverTimestamp(),
        type: 'message',
        replyTo: replyTo ? {
          id: replyTo.id,
          text: replyTo.text,
          senderName: replyTo.sender === 'me' ? currentUser.name : targetUser.name,
        } : null,
      });

      await updateConversation(chatId, currentUser.uid, targetUser, messageText);
      setReplyTo(null);
    } catch (error) {
      console.error('Error sending message:', error);
      setNewMessage(messageText);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (isFixedChat) {
        alert('You cannot send images to this official account');
        return;
      }
      
      try {
        const compressedBase64 = await compressImage(file, 800, 800, 0.7);
        
        const messagesRef = collection(db, 'chats', chatId, 'messages');
        await addDoc(messagesRef, {
          text: '',
          senderUid: currentUser.uid,
          timestamp: serverTimestamp(),
          type: 'image',
          imageUrl: compressedBase64,
        });

        await updateConversation(chatId, currentUser.uid, targetUser, '', true);
      } catch (error) {
        console.error('Error sending image:', error);
        alert('Failed to send image');
      }
    }
  };

  const compressImage = (file: File, maxWidth: number, maxHeight: number, quality: number): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > maxWidth) {
              height = Math.round((height * maxWidth) / width);
              width = maxWidth;
            }
          } else {
            if (height > maxHeight) {
              width = Math.round((width * maxHeight) / height);
              height = maxHeight;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', quality));
        };
        img.onerror = reject;
      };
      reader.onerror = reject;
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleJoinRoom = (roomId: string) => {
    if (onJoinRoom) {
      onJoinRoom(roomId);
    }
  };

  const handleClearChat = async () => {
    try {
      const timestamp = Date.now();
      
      const chatDocRef = doc(db, 'chats', chatId);
      await setDoc(chatDocRef, {
        clearedAtRef: {
          [currentUser.uid]: timestamp
        }
      }, { merge: true });

      const convoDocRef = doc(db, 'conversations', chatId);
      await setDoc(convoDocRef, {
        clearedAtRef: {
          [currentUser.uid]: timestamp
        }
      }, { merge: true });
      
      setMessages([]);
      setShowOptions(false);
    } catch (error) {
      console.error('Error clearing chat:', error);
    }
  };

  const handleDeleteSelectedMessages = async () => {
    try {
      const batch = writeBatch(db);
      selectedMessages.forEach((messageId) => {
        const messageRef = doc(db, 'chats', chatId, 'messages', messageId);
        batch.delete(messageRef);
      });
      await batch.commit();
      setDeleteMode(false);
      setSelectedMessages(new Set());
      setShowOptions(false);
    } catch (error) {
      console.error('Error deleting messages:', error);
    }
  };

  const handleBlockUser = async () => {
    try {
      const blockRef = doc(db, 'blocks', `${currentUser.uid}_${targetUser.uid}`);
      await setDoc(blockRef, {
        blockedBy: currentUser.uid,
        blockedUser: targetUser.uid,
        timestamp: serverTimestamp(),
      });
      setShowBlockConfirm(false);
      setShowOptions(false);
      onClose();
    } catch (error) {
      console.error('Error blocking user:', error);
    }
  };

  const handleReportUser = async () => {
    try {
      const reportRef = doc(db, 'reports', `${currentUser.uid}_${targetUser.uid}_${Date.now()}`);
      await setDoc(reportRef, {
        reportedBy: currentUser.uid,
        reportedUser: targetUser.uid,
        reportedUserName: targetUser.name,
        timestamp: serverTimestamp(),
      });
      setShowReportConfirm(false);
      setShowOptions(false);
      alert('User reported');
    } catch (error) {
      console.error('Error reporting user:', error);
    }
  };

  const handleReply = (msg: Message) => {
    setReplyTo(msg);
  };

  const handleCopyMessage = async (msg: Message) => {
    try {
      await navigator.clipboard.writeText(msg.text);
      setCopiedMsgId(msg.id);
      setTimeout(() => setCopiedMsgId(null), 2000);
    } catch (error) {
      console.error('Error copying message:', error);
    }
  };

  // Long press handlers (1 second for copy)
  const handleTouchStart = (msg: Message) => {
    longPressTimerRef.current = setTimeout(() => {
      handleCopyMessage(msg);
    }, 1000);
  };

  const handleTouchEnd = () => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  };

  const handleMouseDown = (msg: Message) => {
    longPressTimerRef.current = setTimeout(() => {
      handleCopyMessage(msg);
    }, 1000);
  };

  const handleMouseUp = () => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  };

  // Swipe RIGHT to reply
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);
  const [swipingMsgId, setSwipeMsgId] = useState<string | null>(null);
  const [swipeOffset, setSwipeOffset] = useState(0);

  const handleSwipeStart = (e: React.TouchEvent, msg: Message) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
    setSwipeMsgId(msg.id);
  };

  const handleSwipeMove = (e: React.TouchEvent) => {
    if (touchStartX.current !== null && touchStartY.current !== null) {
      const deltaX = e.touches[0].clientX - touchStartX.current;
      const deltaY = e.touches[0].clientY - touchStartY.current;
      
      // Only handle horizontal swipe to RIGHT (positive deltaX)
      if (Math.abs(deltaX) > Math.abs(deltaY) && deltaX > 0) {
        setSwipeOffset(Math.min(80, deltaX));
      }
    }
  };

  const handleSwipeEnd = (msg: Message) => {
    if (swipeOffset > 50) {
      handleReply(msg);
    }
    setSwipeOffset(0);
    setSwipeMsgId(null);
    touchStartX.current = null;
    touchStartY.current = null;
  };

  // Auto-scroll on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const toggleMessageSelection = (msgId: string) => {
    const newSelected = new Set(selectedMessages);
    if (newSelected.has(msgId)) {
      newSelected.delete(msgId);
    } else {
      newSelected.add(msgId);
    }
    setSelectedMessages(newSelected);
  };

  return (
    <div className="fixed inset-0 z-50 bg-white flex flex-col">
      {/* Header */}
      <div
        className="px-4 pb-3 flex items-center gap-3 sticky top-0 z-10"
        style={{
          background: 'linear-gradient(to bottom, #3b82f6 0%, #eff6ff 70%, #ffffff 100%)',
          paddingTop: 'calc(env(safe-area-inset-top, 0px) + 12px)',
        }}
      >
        <button onClick={onClose} className="flex-shrink-0 hover:bg-white/30 rounded-full p-1">
          <ArrowLeft size={24} className="text-gray-800" />
        </button>

        <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
          <img
            src={targetUser.photo || '/default-avatar.png'}
            alt={targetUser.name}
            className="w-full h-full object-cover"
          />
        </div>

        <div className="flex-1 min-w-0">
          <h2 className="text-lg font-bold text-gray-800 truncate">{targetUser.name}</h2>
          {!isFixedChat && (
            <span className={`text-xs ${online ? 'text-green-500' : 'text-gray-400'}`}>
              {online ? 'Online' : 'Offline'}
            </span>
          )}
        </div>

        {!isFixedChat && (
          <div className="relative">
            <button 
              onClick={() => setShowOptions(!showOptions)} 
              className="flex-shrink-0 hover:bg-white/30 rounded-full p-1"
            >
              <MoreHorizontal size={24} className="text-gray-800" />
            </button>

            {/* Dropdown menu - BLACK TEXT */}
            {showOptions && (
              <div className="absolute right-0 top-12 w-48 bg-white rounded-xl shadow-lg py-2 z-50 border border-gray-100">
                <button
                  onClick={() => {
                    setShowOptions(false);
                    setShowReportConfirm(true);
                  }}
                  className="w-full text-left px-4 py-2.5 text-sm text-black hover:bg-gray-50 transition-colors flex items-center gap-2"
                >
                  <Flag size={16} className="text-gray-600" /> Report
                </button>
                <button
                  onClick={handleClearChat}
                  className="w-full text-left px-4 py-2.5 text-sm text-black hover:bg-gray-50 transition-colors flex items-center gap-2"
                >
                  <Trash2 size={16} className="text-gray-600" /> Clear Chat
                </button>
                <button
                  onClick={() => {
                    setShowOptions(false);
                    setShowBlockConfirm(true);
                  }}
                  className="w-full text-left px-4 py-2.5 text-sm text-black hover:bg-gray-50 transition-colors flex items-center gap-2"
                >
                  <Ban size={16} className="text-gray-600" /> Block
                </button>
                <button
                  onClick={() => {
                    setShowOptions(false);
                    setDeleteMode(true);
                  }}
                  className="w-full text-left px-4 py-2.5 text-sm text-black hover:bg-gray-50 transition-colors flex items-center gap-2"
                >
                  <Trash2 size={16} className="text-gray-600" /> Delete
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Delete mode banner */}
      {deleteMode && (
        <div className="bg-red-50 px-4 py-2 flex items-center justify-between border-b border-red-100">
          <span className="text-sm text-black font-medium">
            {selectedMessages.size} selected
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => {
                setDeleteMode(false);
                setSelectedMessages(new Set());
              }}
              className="px-3 py-1 text-xs text-black hover:bg-gray-200 rounded-full"
            >
              Cancel
            </button>
            <button
              onClick={handleDeleteSelectedMessages}
              disabled={selectedMessages.size === 0}
              className="px-3 py-1 text-xs bg-red-500 text-white rounded-full disabled:opacity-50"
            >
              Delete Selected
            </button>
          </div>
        </div>
      )}

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-gray-50">
        {messages.length === 0 && (
          <p className="text-center text-gray-400 mt-20">
            {isFixedChat
              ? 'No messages from ' + targetUser.name + ' yet'
              : 'No messages yet. Say hello!'}
          </p>
        )}
        {messages.map((msg) => {
          const isMine = msg.sender === 'me';
          const isSelected = selectedMessages.has(msg.id);

          // Image Message
          if (msg.type === 'image' && msg.imageUrl) {
            return (
              <div
                key={msg.id}
                className={`flex ${isMine ? 'justify-end' : 'justify-start'} relative`}
                style={{ transform: `translateX(${swipeMsgId === msg.id ? swipeOffset : 0}px)` }}
                onTouchStart={(e) => handleSwipeStart(e, msg)}
                onTouchMove={handleSwipeMove}
                onTouchEnd={() => handleSwipeEnd(msg)}
                onMouseDown={() => handleMouseDown(msg)}
                onMouseUp={handleMouseUp}
              >
                {deleteMode && (
                  <button
                    onClick={() => toggleMessageSelection(msg.id)}
                    className={`absolute -left-8 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full border-2 ${
                      isSelected ? 'bg-red-500 border-red-500' : 'border-gray-400'
                    }`}
                  >
                    {isSelected && <Check size={14} className="text-white mx-auto" />}
                  </button>
                )}
                {!isMine && (
                  <div className="w-7 h-7 rounded-full overflow-hidden flex-shrink-0 mr-2 mt-auto">
                    <img
                      src={targetUser.photo || '/default-avatar.png'}
                      alt={targetUser.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div
                  className={`max-w-[70%] cursor-pointer ${isMine ? 'items-end' : 'items-start'}`}
                  onClick={() => {
                    if (deleteMode) {
                      toggleMessageSelection(msg.id);
                    } else {
                      setShowFullImage(msg.imageUrl!);
                    }
                  }}
                >
                  <img
                    src={msg.imageUrl}
                    alt=""
                    className="rounded-2xl max-h-64 object-cover"
                  />
                  <p className={`text-[10px] mt-1 ${isMine ? 'text-right' : 'text-left'} text-gray-400`}>
                    {formatTime(msg.timestamp)}
                  </p>
                </div>
                {isMine && (
                  <div className="w-7 h-7 rounded-full overflow-hidden flex-shrink-0 ml-2 mt-auto">
                    <img
                      src={currentUser.photo || '/default-avatar.png'}
                      alt={currentUser.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
              </div>
            );
          }

          // Room Invite Message
          if (msg.type === 'room_invite' && msg.roomData) {
            return (
              <div key={msg.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] overflow-hidden rounded-2xl shadow-md ${isMine ? 'rounded-br-md' : 'rounded-bl-md'}`}>
                  <div className="relative h-40 bg-gray-200">
                    <img
                      src={msg.roomData.roomImage || '/default-avatar.png'}
                      alt={msg.roomData.roomName}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute bottom-2 left-3 right-3">
                      <p className="text-white font-bold text-sm truncate">{msg.roomData.roomName}</p>
                    </div>
                  </div>
                  <div className="bg-white p-3">
                    <p className="text-sm text-gray-700 mb-2">Joins our Party Room</p>
                    <button
                      onClick={() => handleJoinRoom(msg.roomData!.roomId)}
                      className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2.5 rounded-full flex items-center justify-center gap-2 transition-colors cursor-pointer"
                    >
                      <LogIn size={18} />
                      Enter
                    </button>
                    <p className="text-[10px] text-gray-400 mt-1 text-center">
                      {formatTime(msg.timestamp)}
                    </p>
                  </div>
                </div>
              </div>
            );
          }

          // Regular message
          return (
            <div
              key={msg.id}
              className={`flex ${isMine ? 'justify-end' : 'justify-start'} relative`}
              style={{ transform: `translateX(${swipeMsgId === msg.id ? swipeOffset : 0}px)` }}
              onTouchStart={(e) => handleSwipeStart(e, msg)}
              onTouchMove={handleSwipeMove}
              onTouchEnd={() => handleSwipeEnd(msg)}
              onMouseDown={() => handleMouseDown(msg)}
              onMouseUp={handleMouseUp}
            >
              {deleteMode && (
                <button
                  onClick={() => toggleMessageSelection(msg.id)}
                  className={`absolute -left-8 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full border-2 z-10 ${
                    isSelected ? 'bg-red-500 border-red-500' : 'border-gray-400'
                  }`}
                >
                  {isSelected && <Check size={14} className="text-white mx-auto" />}
                </button>
              )}
              {!isMine && (
                <div className="w-7 h-7 rounded-full overflow-hidden flex-shrink-0 mr-2 mt-auto">
                  <img
                    src={targetUser.photo || '/default-avatar.png'}
                    alt={targetUser.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <div className={`flex flex-col ${isMine ? 'items-end' : 'items-start'} max-w-[75%]`}>
                {!isMine && (
                  <span className="text-[10px] text-gray-500 ml-1 mb-0.5">{targetUser.name}</span>
                )}
                <div
                  className={`px-3 py-2 rounded-2xl break-words relative ${
                    isMine
                      ? 'bg-[#dcf8c6] text-gray-800 rounded-br-md'
                      : 'bg-white text-gray-800 rounded-bl-md shadow-sm'
                  } ${isSelected ? 'opacity-50' : ''}`}
                >
                  {msg.replyTo && (
                    <div className="border-l-4 border-blue-400 pl-2 mb-1 bg-black/5 rounded p-1">
                      <p className="text-[10px] font-semibold text-blue-600">{msg.replyTo.senderName}</p>
                      <p className="text-[11px] text-gray-600 truncate">{msg.replyTo.text}</p>
                    </div>
                  )}
                  <p className="text-sm">{msg.text}</p>
                  <div className="flex items-center gap-1 justify-end">
                    {copiedMsgId === msg.id && (
                      <span className="text-[10px] text-green-500">Copied!</span>
                    )}
                    <p className={`text-[10px] ${isMine ? 'text-gray-500' : 'text-gray-400'}`}>
                      {formatTime(msg.timestamp)}
                    </p>
                  </div>
                </div>
              </div>
              {isMine && (
                <div className="w-7 h-7 rounded-full overflow-hidden flex-shrink-0 ml-2 mt-auto">
                  <img
                    src={currentUser.photo || '/default-avatar.png'}
                    alt={currentUser.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Reply bar */}
      {replyTo && !isFixedChat && (
        <div className="px-4 py-2 bg-gray-100 border-t border-gray-200 flex items-center gap-2">
          <div className="flex-1 border-l-4 border-blue-400 pl-2 bg-white rounded p-2">
            <p className="text-[10px] font-semibold text-blue-600">
              Replying to {replyTo.sender === 'me' ? 'yourself' : targetUser.name}
            </p>
            <p className="text-xs text-gray-600 truncate">{replyTo.text || 'Photo'}</p>
          </div>
          <button onClick={() => setReplyTo(null)} className="p-1 hover:bg-gray-200 rounded-full">
            <X size={18} className="text-gray-500" />
          </button>
        </div>
      )}

      {/* Input bar - Hidden for fixed chats */}
      {!isFixedChat ? (
        <div className="px-4 py-3 bg-white border-t border-gray-200 flex items-center gap-2">
          <input
            type="file"
            ref={fileInputRef}
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
          />
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="text-gray-500 hover:text-gray-700"
          >
            <ImageIcon size={24} />
          </button>
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            className="flex-1 bg-gray-100 rounded-full px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-300"
          />
          <button
            onClick={handleSend}
            disabled={!newMessage.trim()}
            className="text-blue-500 disabled:text-gray-300 hover:text-blue-600"
          >
            <Send size={24} />
          </button>
        </div>
      ) : (
        <div className="px-4 py-3 bg-gray-50 border-t border-gray-200 text-center">
          <p className="text-xs text-gray-400">This is an official account. You cannot reply here.</p>
        </div>
      )}

      {/* Report Confirmation */}
      {showReportConfirm && (
        <div className="absolute inset-0 z-[70] flex items-center justify-center bg-black/50" onClick={() => setShowReportConfirm(false)}>
          <div className="bg-white rounded-2xl px-6 py-5 shadow-xl max-w-xs w-full text-center" onClick={(e) => e.stopPropagation()}>
            <div className="text-4xl mb-3">⚠️</div>
            <h3 className="text-lg font-bold text-gray-800 mb-1">Report {targetUser.name}?</h3>
            <p className="text-sm text-gray-500 mb-4">This user will be reported to our team for review.</p>
            <div className="flex gap-2">
              <button
                onClick={() => setShowReportConfirm(false)}
                className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-full transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleReportUser}
                className="flex-1 py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-full transition-colors cursor-pointer"
              >
                Report
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Block Confirmation */}
      {showBlockConfirm && (
        <div className="absolute inset-0 z-[70] flex items-center justify-center bg-black/50" onClick={() => setShowBlockConfirm(false)}>
          <div className="bg-white rounded-2xl px-6 py-5 shadow-xl max-w-xs w-full text-center" onClick={(e) => e.stopPropagation()}>
            <div className="text-4xl mb-3">🚫</div>
            <h3 className="text-lg font-bold text-gray-800 mb-1">Block {targetUser.name}?</h3>
            <p className="text-sm text-gray-500 mb-4">You won't receive messages from this user.</p>
            <div className="flex gap-2">
              <button
                onClick={() => setShowBlockConfirm(false)}
                className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-full transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleBlockUser}
                className="flex-1 py-2.5 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-full transition-colors cursor-pointer"
              >
                Block
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Full Image View */}
      {showFullImage && (
        <div
          className="fixed inset-0 z-[80] bg-black/90 flex items-center justify-center p-4"
          onClick={() => setShowFullImage(null)}
        >
          <button
            onClick={() => setShowFullImage(null)}
            className="absolute top-4 right-4 text-white bg-black/50 rounded-full p-2 hover:bg-black/70 transition-colors"
          >
            <X size={24} />
          </button>
          <img
            src={showFullImage}
            alt=""
            className="max-w-full max-h-[90vh] object-contain rounded-lg"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}

      <style jsx>{`
        @keyframes slideUp {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
        .animate-slide-up {
          animation: slideUp 0.3s ease-out;
        }
      `}</style>
    </div>
  );
                      }
