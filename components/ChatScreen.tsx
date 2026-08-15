'use client';

import { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Send, ImageIcon, MoreHorizontal, LogIn, Trash2, Flag, Ban, X } from 'lucide-react';
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
  type?: 'message' | 'room_invite';
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
  const [replyTo, setReplyTo] = useState<Message | null>(null);
  const [longPressMsg, setLongPressMsg] = useState<Message | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const longPressTimerRef = useRef<NodeJS.Timeout | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

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

    const messagesRef = collection(db, 'chats', chatId, 'messages');
    const q = query(messagesRef, orderBy('timestamp', 'asc'));

    const unsubscribe = onSnapshot(
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
            roomData: data.roomData || undefined,
            replyTo: data.replyTo || null,
          };
        });
        setMessages(loadedMessages);
        setConnected(true);
      },
      (error) => {
        console.error('Firestore listener error:', error);
        setConnected(false);
      }
    );

    return () => unsubscribe();
  }, [chatId, currentUser.uid]);

  // Auto-send room invite if sharedRoomData exists
  useEffect(() => {
    if (sharedRoomData && connected) {
      sendRoomInvite(sharedRoomData);
    }
  }, [sharedRoomData, connected]);

  const sendRoomInvite = async (roomData: { roomId: string; roomName: string; roomImage: string }) => {
    try {
      const messagesRef = collection(db, 'chats', chatId, 'messages');
      await addDoc(messagesRef, {
        text: `Join my room: ${roomData.roomName}`,
        senderUid: currentUser.uid,
        timestamp: serverTimestamp(),
        type: 'room_invite',
        roomData: {
          roomId: roomData.roomId,
          roomName: roomData.roomName,
          roomImage: roomData.roomImage,
        },
      });
    } catch (error) {
      console.error('Error sending room invite:', error);
    }
  };

  const handleSend = async () => {
    if (!newMessage.trim()) return;
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

      setReplyTo(null);
    } catch (error) {
      console.error('Error sending message:', error);
      setNewMessage(messageText);
    }
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
      const messagesRef = collection(db, 'chats', chatId, 'messages');
      const snapshot = await getDoc(doc(db, 'chats', chatId));
      // Delete all messages
      const q = query(messagesRef);
      const batch = writeBatch(db);
      
      // Get all messages
      const { docs } = await getDoc(doc(db, 'chats', chatId)).then(() => ({ docs: [] }));
      
      setMessages([]);
      setShowOptions(false);
    } catch (error) {
      console.error('Error clearing chat:', error);
    }
  };

  const handleDeleteMessage = async (messageId: string) => {
    try {
      const messageRef = doc(db, 'chats', chatId, 'messages', messageId);
      await deleteDoc(messageRef);
      setLongPressMsg(null);
      setShowDeleteConfirm(false);
    } catch (error) {
      console.error('Error deleting message:', error);
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

  const handleReply = (msg: Message) => {
    setReplyTo(msg);
    setLongPressMsg(null);
  };

  // Long press handlers
  const handleTouchStart = (msg: Message) => {
    longPressTimerRef.current = setTimeout(() => {
      setLongPressMsg(msg);
    }, 500);
  };

  const handleTouchEnd = () => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  };

  const handleMouseDown = (msg: Message) => {
    longPressTimerRef.current = setTimeout(() => {
      setLongPressMsg(msg);
    }, 500);
  };

  const handleMouseUp = () => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  };

  // Auto-scroll on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
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
          <button 
            onClick={() => setShowOptions(true)} 
            className="flex-shrink-0 hover:bg-white/30 rounded-full p-1"
          >
            <MoreHorizontal size={24} className="text-gray-800" />
          </button>
        )}
      </div>

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
                    <p className="text-sm text-gray-700 mb-2">Join my room</p>
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

          // WhatsApp style with avatar
          return (
            <div
              key={msg.id}
              className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}
              onTouchStart={() => handleTouchStart(msg)}
              onTouchEnd={handleTouchEnd}
              onMouseDown={() => handleMouseDown(msg)}
              onMouseUp={handleMouseUp}
            >
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
                  }`}
                >
                  {msg.replyTo && (
                    <div className="border-l-4 border-blue-400 pl-2 mb-1 bg-black/5 rounded p-1">
                      <p className="text-[10px] font-semibold text-blue-600">{msg.replyTo.senderName}</p>
                      <p className="text-[11px] text-gray-600 truncate">{msg.replyTo.text}</p>
                    </div>
                  )}
                  <p className="text-sm">{msg.text}</p>
                  <p className={`text-[10px] mt-1 ${isMine ? 'text-gray-500' : 'text-gray-400'}`}>
                    {formatTime(msg.timestamp)}
                  </p>
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
      {replyTo && (
        <div className="px-4 py-2 bg-gray-100 border-t border-gray-200 flex items-center gap-2">
          <div className="flex-1 border-l-4 border-blue-400 pl-2 bg-white rounded p-2">
            <p className="text-[10px] font-semibold text-blue-600">
              Replying to {replyTo.sender === 'me' ? 'yourself' : targetUser.name}
            </p>
            <p className="text-xs text-gray-600 truncate">{replyTo.text}</p>
          </div>
          <button onClick={() => setReplyTo(null)} className="p-1 hover:bg-gray-200 rounded-full">
            <X size={18} className="text-gray-500" />
          </button>
        </div>
      )}

      {/* Input bar */}
      {!isFixedChat && (
        <div className="px-4 py-3 bg-white border-t border-gray-200 flex items-center gap-2">
          <button className="text-gray-500 hover:text-gray-700">
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
      )}

      {isFixedChat && (
        <div className="px-4 py-3 bg-gray-50 border-t border-gray-200 text-center">
          <p className="text-xs text-gray-400">This is an official account. You cannot reply here.</p>
        </div>
      )}

      {/* 3 Dot Options Sheet */}
      {showOptions && (
        <div className="absolute inset-0 z-[60] flex items-end justify-center">
          <div className="absolute inset-0 bg-black/30" onClick={() => setShowOptions(false)} />
          <div className="relative bg-white w-full max-w-md rounded-t-3xl shadow-2xl animate-slide-up overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="px-6 pt-4 pb-2 text-center">
              <h3 className="text-lg font-bold text-gray-800">Chat Options</h3>
            </div>
            <div className="px-4 pb-6 space-y-1">
              <button
                onClick={() => {
                  setShowOptions(false);
                  setShowBlockConfirm(true);
                }}
                className="w-full py-3.5 text-left text-red-600 font-medium text-base hover:bg-red-50 rounded-lg transition-colors cursor-pointer px-4"
              >
                Block
              </button>
              <button
                onClick={handleClearChat}
                className="w-full py-3.5 text-left text-gray-800 font-medium text-base hover:bg-gray-100 rounded-lg transition-colors cursor-pointer px-4"
              >
                Clear Chat
              </button>
              <button
                onClick={() => setShowOptions(false)}
                className="w-full py-3.5 text-center text-gray-500 font-medium text-base hover:bg-gray-100 rounded-lg transition-colors cursor-pointer px-4"
              >
                Cancel
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

      {/* Long Press Options */}
      {longPressMsg && (
        <div className="absolute inset-0 z-[60] flex items-center justify-center bg-black/30" onClick={() => setLongPressMsg(null)}>
          <div className="bg-white rounded-2xl shadow-xl max-w-xs w-full mx-4 overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => handleReply(longPressMsg)}
              className="w-full py-3.5 text-left text-gray-800 font-medium text-base hover:bg-gray-100 transition-colors cursor-pointer px-5"
            >
              Reply
            </button>
            {longPressMsg.sender === 'me' && (
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="w-full py-3.5 text-left text-red-600 font-medium text-base hover:bg-red-50 transition-colors cursor-pointer px-5"
              >
                Delete
              </button>
            )}
            <button
              onClick={() => setLongPressMsg(null)}
              className="w-full py-3.5 text-center text-gray-500 font-medium text-base hover:bg-gray-100 transition-colors cursor-pointer px-5 border-t border-gray-200"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {showDeleteConfirm && longPressMsg && (
        <div className="absolute inset-0 z-[70] flex items-center justify-center bg-black/50" onClick={() => setShowDeleteConfirm(false)}>
          <div className="bg-white rounded-2xl px-6 py-5 shadow-xl max-w-xs w-full text-center" onClick={(e) => e.stopPropagation()}>
            <div className="text-4xl mb-3">🗑️</div>
            <h3 className="text-lg font-bold text-gray-800 mb-1">Delete Message?</h3>
            <p className="text-sm text-gray-500 mb-4">This message will be permanently deleted.</p>
            <div className="flex gap-2">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-full transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteMessage(longPressMsg.id)}
                className="flex-1 py-2.5 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-full transition-colors cursor-pointer"
              >
                Delete
              </button>
            </div>
          </div>
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
