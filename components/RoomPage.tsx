'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import EmojiPicker from './Emojipicker';
import GiftPicker from './GiftPicker';
import RoomSettingPage, { RoomSettingsData } from './RoomSettingPage';
import MessagePage from './MessagePage';
import RoomProfile from './RoomProfile';
import Fourgride from './Fourgride';
import WhiteColorRemovalShader from './WhiteColorRemovalShader';
import { db } from "../src/lib/firebase";
import { doc, setDoc, getDoc, onSnapshot, addDoc, serverTimestamp, query, orderBy, deleteDoc, collection } from "firebase/firestore";
// LiveKit imports for Voice Audio - Fixed imports
import { 
  LiveKitRoom, 
  RoomAudioRenderer, 
  useLocalParticipant, 
  useRemoteParticipants 
} from "@livekit/components-react";
import "@livekit/components-styles";
import { 
  Room, 
  RoomEvent, 
  Track as LKTrack, 
  RemoteParticipant, 
  RemoteTrackPublication
} from "livekit-client";

interface RoomPageProps {
  roomOwner: {
    id?: string;
    uid?: string;
    accountId?: string;
    name: string;
    image: string;
  };
  currentUser: {
    id?: string;
    uid?: string;
    accountId: string;
    name: string;
    image: string;
  };
  onClose?: () => void;
  onBack?: () => void;
  onKeepRoom?: (roomData: { name: string; image: string; accountId: string }) => void;
  onFollowToggle?: (roomId: string, follow: boolean) => void;
}

interface Seat {
  number: number;
  isOccupied: boolean;
  isLocked?: boolean;
  user?: { name: string; image: string; accountId: string };
  isMuted?: boolean;
  isSpeaking?: boolean;
}

interface Message {
  id: string;
  text: string;
  sender: string;
  senderImage: string;
  senderAccountId?: string;
  timestamp: number;
  type?: 'message' | 'join' | 'leave';
  imageUrl?: string;
}

interface RoomUser {
  accountId: string;
  name: string;
  image: string;
}

interface MusicTrack {
  id: string;
  name: string;
  url: string;
}

const THEME_BACKGROUNDS: { [key: string]: string } = {
  'forest-night': '/1784875884052~2.jpg',
  'mood-light': '/1784533036732~2.jpg',
};

export default function RoomPage({ roomOwner, currentUser, onClose, onBack, onKeepRoom, onFollowToggle }: RoomPageProps) {
  // LiveKit Token State
  const [livekitToken, setLivekitToken] = useState<string>("");
  const livekitUrl = process.env.NEXT_PUBLIC_LIVEKIT_URL || "";

  const roomId = roomOwner.id || roomOwner.accountId || 'default-room';
  const userAccountId = currentUser.accountId || currentUser.uid || currentUser.id || "guest";
  const roomOwnerId = roomOwner.accountId || roomOwner.uid || roomOwner.id || "";
  const isRoomOwner = userAccountId === roomOwnerId;

  // Fetch LiveKit Token from API route
  useEffect(() => {
    const fetchToken = async () => {
      try {
        const res = await fetch(`/api/livekit?room=${roomId}&username=${encodeURIComponent(currentUser.name)}&identity=${userAccountId}`);
        const data = await res.json();
        if (data.token) {
          setLivekitToken(data.token);
        }
      } catch (err) {
        console.error("Error fetching LiveKit token:", err);
      }
    };
    if (roomId && currentUser.name && userAccountId !== "guest") {
      fetchToken();
    }
  }, [roomId, currentUser.name, userAccountId]);

  return (
    <LiveKitRoom
      audio={false}
      video={false}
      token={livekitToken}
      serverUrl={livekitUrl}
      connect={Boolean(livekitToken)}
      className="fixed inset-0 z-50 bg-black flex flex-col"
      options={{
        adaptiveStream: true,
        dynacast: true,
        publishDefaults: {
          simulcast: false,
        },
      }}
    >
      <RoomContent
        roomOwner={roomOwner}
        currentUser={currentUser}
        onClose={onClose}
        onBack={onBack}
        onKeepRoom={onKeepRoom}
        onFollowToggle={onFollowToggle}
      />
    </LiveKitRoom>
  );
}

function RoomContent({ roomOwner, currentUser, onClose, onBack, onKeepRoom, onFollowToggle }: RoomPageProps) {
  // UI state
  const [showExitMenu, setShowExitMenu] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showGiftPicker, setShowGiftPicker] = useState(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState(true);
  const [showMessageSheet, setShowMessageSheet] = useState(false);
  const [showSettingPage, setShowSettingPage] = useState(false);
  const [showRoomInfo, setShowRoomInfo] = useState(false);
  const [showActiveUsers, setShowActiveUsers] = useState(false);
  const [showFourGride, setShowFourGride] = useState(false);
  const [isFollowed, setIsFollowed] = useState(false);
  const [copied, setCopied] = useState(false);
  const [localUser, setLocalUser] = useState<{ name: string; image: string; accountId: string }>({ name: 'User', image: '/default-avatar.png', accountId: '' });

  // LiveKit Hook for Microphone Control
  const { localParticipant } = useLocalParticipant();
  const remoteParticipants = useRemoteParticipants();

  // Music controller state
  const [musicControllerState, setMusicControllerState] = useState<'hidden' | 'full' | 'minimized'>('hidden');
  const [currentTrack, setCurrentTrack] = useState<MusicTrack | null>(null);
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const [musicVolume, setMusicVolume] = useState(1);
  const [musicPlaylist, setMusicPlaylist] = useState<MusicTrack[]>([]);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [musicCurrentTime, setMusicCurrentTime] = useState(0);
  const [musicDuration, setMusicDuration] = useState(0);
  const musicAudioRef = useRef<HTMLAudioElement | null>(null);

  // Message restriction state
  const [publicMsgOff, setPublicMsgOff] = useState(false);
  const [showPublicMsgModal, setShowPublicMsgModal] = useState(false);

  // User data
  useEffect(() => {
    const name = localStorage.getItem('userName') || 'User';
    const image = localStorage.getItem('userPhoto') || '/default-avatar.png';
    const storedAccNum = localStorage.getItem('accountNumber') || localStorage.getItem('userUID') || '10000000';
    setLocalUser({ name, image, accountId: storedAccNum });
  }, []);

  const [showUserProfile, setShowUserProfile] = useState(false);
  const [profileUser, setProfileUser] = useState<{
    name: string;
    image: string;
    accountId: string;
    isInSeat?: boolean;
  } | null>(null);

  const userAccountId = currentUser.accountId || currentUser.uid || currentUser.id || "guest";
  const roomOwnerId = roomOwner.accountId || roomOwner.uid || roomOwner.id || "";
  const isRoomOwner = userAccountId === roomOwnerId;

  // Message state
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [fullImageModal, setFullImageModal] = useState<string | null>(null);

  // Room data state
  const [roomName, setRoomName] = useState<string>("");
  const [roomAnnouncement, setRoomAnnouncement] = useState<string>("");
  const [isLocked, setIsLocked] = useState<boolean>(false);
  const [roomPassword, setRoomPassword] = useState<string>("");
  const [roomImage, setRoomImage] = useState<string>(roomOwner.image || "/1784533036732~2.jpg");
  const [micMode, setMicMode] = useState<number>(9);
  const [roomInfoTab, setRoomInfoTab] = useState<'profile' | 'members'>('profile');
  const [backgroundImage, setBackgroundImage] = useState<string>("/1784533036732~2.jpg");

  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const inputContainerRef = useRef<HTMLDivElement>(null);

  // Presence and users
  const [showChatInput, setShowChatInput] = useState(false);
  const [roomUsers, setRoomUsers] = useState<RoomUser[]>([]);
  const [roomFollowers, setRoomFollowers] = useState<RoomUser[]>([]);

  // Seat helpers
  const getInitialSeats = (mode: number): Seat[] => {
    const seats: Seat[] = [];
    for (let i = 1; i <= mode; i++) {
      seats.push({ number: i, isOccupied: false, isLocked: false, isMuted: false, isSpeaking: false });
    }
    return seats;
  };

  const [seats, setSeats] = useState<Seat[]>([]);
  const [selectedSeat, setSelectedSeat] = useState<number | null>(null);
  const [showSeatSheet, setShowSeatSheet] = useState(false);

  const hasSeat = seats.some(s => s.isOccupied && s.user?.accountId === userAccountId);
  const currentUserSeat = seats.find(s => s.isOccupied && s.user?.accountId === userAccountId);

  const roomId = roomOwner.id || roomOwner.accountId || 'default-room';

  const displayRoomName = roomName
    ? (roomName.length > 6 ? roomName.substring(0, 6) + '...' : roomName)
    : 'Room';

  const openProfile = (user: { name: string; image: string; accountId: string }) => {
    const userInSeat = seats.some(s => s.isOccupied && s.user?.accountId === user.accountId);
    setProfileUser({
      name: user.name,
      image: user.image,
      accountId: user.accountId,
      isInSeat: userInSeat
    });
    setShowUserProfile(true);
  };

  // Sync LiveKit Microphone state with Seat Mute & Occupied Status
  const desiredAudioStateRef = useRef<boolean | null>(null);

  useEffect(() => {
    if (localParticipant) {
      const isMuted = currentUserSeat?.isMuted ?? true;
      const isInSeat = hasSeat;
      const desiredState = isInSeat && !isMuted;

      if (desiredAudioStateRef.current !== desiredState) {
        desiredAudioStateRef.current = desiredState;
        localParticipant.setMicrophoneEnabled(desiredState).catch(console.error);
        console.log("Microphone state synced to:", desiredState);
      }
    }
  }, [currentUserSeat?.isMuted, hasSeat, localParticipant]);

  // Monitor remote participants for seat synchronization
  useEffect(() => {
    if (!remoteParticipants || remoteParticipants.length === 0) return;
    
    const updateSeatsWithRemoteParticipants = async () => {
      const updatedSeats = [...seats];
      let hasChanges = false;
      
      for (const participant of remoteParticipants) {
        const seatIndex = updatedSeats.findIndex(s => 
          s.isOccupied && s.user?.accountId === participant.identity
        );
        
        if (seatIndex !== -1) {
          const audioPublication = participant.getTrackPublication(LKTrack.Source.Microphone);
          const isMuted = audioPublication ? audioPublication.isMuted : true;
          
          if (updatedSeats[seatIndex].isMuted !== isMuted) {
            updatedSeats[seatIndex] = {
              ...updatedSeats[seatIndex],
              isMuted,
            };
            hasChanges = true;
          }
        }
      }
      
      if (hasChanges) {
        setSeats(updatedSeats);
      }
    };
    
    updateSeatsWithRemoteParticipants();
  }, [remoteParticipants, seats]);

  // Fetch room data from Firestore
  useEffect(() => {
    const fetchRoomData = async () => {
      if (roomId && db) {
        try {
          const snap = await getDoc(doc(db, "globalRooms", roomId));
          if (snap.exists()) {
            const data = snap.data();
            setRoomName(data.name || "");
            setRoomAnnouncement(data.announcement || "");
            setRoomImage(data.image || roomOwner.image);
            if (data.micMode && data.micMode !== micMode) {
              setMicMode(data.micMode);
            }
            if (data.theme && THEME_BACKGROUNDS[data.theme]) {
              setBackgroundImage(THEME_BACKGROUNDS[data.theme]);
            } else {
              setBackgroundImage('/1784533036732~2.jpg');
            }
            const followerIds: string[] = data.followers || [];
            const followersList: RoomUser[] = followerIds.map((id: string) => ({
              accountId: id,
              name: `User ${id.slice(0, 5)}`,
              image: ''
            }));
            setRoomFollowers(followersList);
          }
        } catch (err) {
          console.error("Error loading room data:", err);
        }
      }
    };
    fetchRoomData();
  }, [roomId, roomOwner.image]);

  useEffect(() => {
    setSeats(prev => {
      const newSeats = getInitialSeats(micMode);
      return newSeats.map(newSeat => {
        const oldSeat = prev.find(s => s.number === newSeat.number);
        if (oldSeat && oldSeat.isOccupied) {
          return { ...newSeat, isOccupied: oldSeat.isOccupied, user: oldSeat.user, isMuted: oldSeat.isMuted, isSpeaking: oldSeat.isSpeaking, isLocked: oldSeat.isLocked };
        }
        return newSeat;
      });
    });
  }, [micMode]);

  const presenceCollection = `roomPresence/${roomId}/users`;
  const messagesCollection = `roomMessages/${roomId}/messages`;
  const seatsCollection = `roomSeats/${roomId}/seats`;

  useEffect(() => {
    setMessages([]);
    joinMessageSentRef.current = false;
    joinedAtRef.current = Date.now();
    clearedAtRef.current = null;
  }, [roomId]);

  useEffect(() => {
    if (!db) return;

    const unsubPresence = onSnapshot(collection(db, presenceCollection), (snapshot) => {
      const users = snapshot.docs.map(d => d.data() as RoomUser);
      setRoomUsers(users);
    }, (error) => {
      console.error("Presence listener error:", error);
    });

    const messagesQuery = query(collection(db, messagesCollection), orderBy('timestamp', 'asc'));
    const unsubMessages = onSnapshot(messagesQuery, (snapshot) => {
      const msgs = snapshot.docs
        .map(d => {
          const data = d.data();
          return {
            id: d.id,
            text: data.text || '',
            sender: data.sender || 'Unknown',
            senderImage: data.senderImage || '/default-avatar.png',
            senderAccountId: data.senderAccountId || '',
            timestamp: data.timestamp?.toMillis ? data.timestamp.toMillis() : data.timestamp || Date.now(),
            type: data.type || 'message',
            imageUrl: data.imageUrl || undefined
          } as Message;
        })
        .filter(msg => {
          if (clearedAtRef.current && msg.timestamp <= clearedAtRef.current) return false;
          if (msg.timestamp < joinedAtRef.current) return false;
          return true;
        });
      setMessages(msgs);
    }, (error) => {
      console.error("Messages listener error:", error);
    });

    return () => {
      unsubPresence();
      unsubMessages();
    };
  }, [roomId]);

  useEffect(() => {
    if (!db) return;

    const unsubSeats = onSnapshot(collection(db, seatsCollection), (snapshot) => {
      const seatMap = new Map<number, Seat>();
      snapshot.docs.forEach(doc => {
        const data = doc.data() as Seat;
        seatMap.set(data.number, {
          number: data.number,
          isOccupied: data.isOccupied || false,
          isLocked: data.isLocked || false,
          isMuted: data.isMuted || false,
          isSpeaking: data.isSpeaking || false,
          user: data.user || undefined
        });
      });

      const initialSeats = getInitialSeats(micMode);
      const mergedSeats = initialSeats.map(seat => {
        const syncedSeat = seatMap.get(seat.number);
        return syncedSeat ? { ...seat, ...syncedSeat } : seat;
      });
      setSeats(mergedSeats);
    }, (error) => {
      console.error("Seats listener error:", error);
    });

    return () => unsubSeats();
  }, [roomId, micMode]);

  useEffect(() => {
    if (!db) return;
    const initialSeats = getInitialSeats(micMode);
    initialSeats.forEach(seat => {
      setDoc(doc(db, seatsCollection, String(seat.number)), seat, { merge: true });
    });
  }, [micMode, roomId]);

  useEffect(() => {
    if (!db || userAccountId === "guest") return;

    const presenceDocRef = doc(db, presenceCollection, userAccountId);
    const userData: RoomUser = {
      accountId: userAccountId,
      name: currentUser.name,
      image: currentUser.image
    };

    setDoc(presenceDocRef, userData, { merge: true })
      .catch(err => console.error("Error adding presence:", err));

    return () => {
      deleteDoc(presenceDocRef).catch(err => console.error("Error removing presence:", err));
    };
  }, [userAccountId, currentUser.name, currentUser.image, roomId]);

  const sendMessageToFirestore = async (text: string, imageUrl?: string, type: 'message' | 'join' | 'leave' = 'message') => {
    if (!db) return;
    try {
      await addDoc(collection(db, messagesCollection), {
        text,
        sender: currentUser.name,
        senderImage: currentUser.image,
        senderAccountId: userAccountId,
        timestamp: serverTimestamp(),
        type,
        imageUrl: imageUrl || null
      });
    } catch (err) {
      console.error("Error sending message:", err);
    }
  };

  const joinMessageSentRef = useRef(false);
  const joinedAtRef = useRef(Date.now());
  const clearedAtRef = useRef<number | null>(null);

  useEffect(() => {
    if (joinMessageSentRef.current || userAccountId === "guest" || !currentUser.name) return;
    joinMessageSentRef.current = true;
    sendMessageToFirestore('Enter the Room', undefined, 'join');
  }, [userAccountId, currentUser.name, roomId]);

  useEffect(() => {
    if (messagesEndRef.current) messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (showChatInput && inputRef.current) {
      const timer = setTimeout(() => { if (inputRef.current) inputRef.current.focus(); }, 100);
      return () => clearTimeout(timer);
    }
  }, [showChatInput]);

  useEffect(() => {
    if (!showChatInput) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (inputContainerRef.current && !inputContainerRef.current.contains(e.target as Node)) {
        setShowChatInput(false);
        setMessage("");
      }
    };
    const handleTouchOutside = (e: TouchEvent) => {
      if (inputContainerRef.current && !inputContainerRef.current.contains(e.target as Node)) {
        setShowChatInput(false);
        setMessage("");
      }
    };
    const timer = setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleTouchOutside);
    }, 300);
    return () => {
      clearTimeout(timer);
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleTouchOutside);
    };
  }, [showChatInput]);

  const handleCopyId = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(roomOwner.accountId || '');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyUserId = (accountId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(accountId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleImageClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (fileInputRef.current) fileInputRef.current.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { alert('Please select an image file'); return; }
    if (file.size > 5 * 1024 * 1024) { alert('Image size should be less than 5MB'); return; }
    const reader = new FileReader();
    reader.onload = (event) => {
      const imageUrl = event.target?.result as string;
      sendMessageToFirestore('', imageUrl);
    };
    reader.readAsDataURL(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSeatClick = (seatNumber: number) => (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setSelectedSeat(seatNumber);
    setShowSeatSheet(true);
  };

  const handleSeatAvatarClick = (seat: Seat) => (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (seat.isOccupied && seat.user) {
      openProfile({
        name: seat.user.name,
        image: seat.user.image,
        accountId: seat.user.accountId
      });
    }
  };

  const updateSeatInFirestore = async (seat: Seat) => {
    if (!db) return;
    try {
      await setDoc(doc(db, seatsCollection, String(seat.number)), seat, { merge: true });
    } catch (err) {
      console.error("Error updating seat:", err);
    }
  };

  const handleTakeSeat = async (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (selectedSeat === null) return;
    
    try {
      const targetSeat = seats.find(s => s.number === selectedSeat);
      if (targetSeat?.isLocked && !targetSeat.isOccupied) { 
        alert("This seat is locked!"); 
        return; 
      }
      if (targetSeat?.isOccupied && targetSeat.user?.accountId !== userAccountId) { 
        alert("This seat is already taken!"); 
        return; 
      }

      const updatedSeats = seats.map(s => {
        if (s.isOccupied && s.user?.accountId === userAccountId && s.number !== selectedSeat) {
          return { ...s, isOccupied: false, user: undefined, isSpeaking: false, isMuted: false };
        }
        if (s.number === selectedSeat) {
          return {
            ...s,
            isOccupied: true,
            user: { name: currentUser.name, image: currentUser.image, accountId: userAccountId },
            isMuted: false,
            isSpeaking: false
          };
        }
        return s;
      });

      setSeats(updatedSeats);

      const updatePromises = updatedSeats.map(seat => updateSeatInFirestore(seat));
      await Promise.all(updatePromises);

      setShowSeatSheet(false);
      setSelectedSeat(null);
    } catch (err) {
      console.error("Error taking seat:", err);
    }
  };

  const handleLeaveSeat = async (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (selectedSeat === null) return;
    
    try {
      const updatedSeats = seats.map(s => {
        if (s.number === selectedSeat && s.user?.accountId === userAccountId) {
          return { ...s, isOccupied: false, user: undefined, isSpeaking: false, isMuted: false };
        }
        return s;
      });
      
      setSeats(updatedSeats);
      
      const updatePromises = updatedSeats.map(seat => updateSeatInFirestore(seat));
      await Promise.all(updatePromises);

      setShowSeatSheet(false);
      setSelectedSeat(null);
    } catch (err) {
      console.error("Error leaving seat:", err);
    }
  };

  const handleBottomMicToggle = async (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!currentUserSeat) return;

    const newMuteState = !currentUserSeat.isMuted;
    const updatedSeats = seats.map(seat => 
      seat.number === currentUserSeat.number 
        ? { ...seat, isMuted: newMuteState } 
        : seat
    );
    
    setSeats(updatedSeats);
    await Promise.all(updatedSeats.map(seat => updateSeatInFirestore(seat)));
  };

  const handleToggleMute = async (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (selectedSeat === null) return;
    
    const updatedSeats = seats.map(s => {
      if (s.number === selectedSeat) {
        const newMuteState = !s.isMuted;
        return { ...s, isMuted: newMuteState };
      }
      return s;
    });
    
    setSeats(updatedSeats);
    updatedSeats.forEach(seat => updateSeatInFirestore(seat));

    setShowSeatSheet(false);
    setSelectedSeat(null);
  };

  const handleToggleLock = async (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (selectedSeat === null) return;
    const updatedSeats = seats.map(s => {
      if (s.number === selectedSeat) return { ...s, isLocked: !s.isLocked };
      return s;
    });
    setSeats(updatedSeats);
    updatedSeats.forEach(seat => updateSeatInFirestore(seat));
    setShowSeatSheet(false);
    setSelectedSeat(null);
  };

  const handleInvite = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (selectedSeat === null) return;
    alert(`Invite sent to join seat ${selectedSeat}!`);
    setShowSeatSheet(false);
    setSelectedSeat(null);
  };

  const isCurrentUsersSeat = (seat?: Seat) => Boolean(seat && seat.isOccupied && seat.user?.accountId === userAccountId);

  const showPublicMsgOffAlert = () => {
    setShowPublicMsgModal(true);
  };

  const handleSendMessage = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (publicMsgOff && !isRoomOwner) {
      showPublicMsgOffAlert();
      return;
    }
    if (!message.trim()) return;
    sendMessageToFirestore(message.trim());
    setMessage("");
    if (inputRef.current) inputRef.current.focus();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') { e.preventDefault(); handleSendMessage(); }
  };

  const handleInputFocus = () => setShowChatInput(true);

  const openChatInput = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (publicMsgOff && !isRoomOwner) {
      showPublicMsgOffAlert();
      return;
    }
    setShowChatInput(true);
    setTimeout(() => { if (inputRef.current) inputRef.current.focus(); }, 100);
  };

  const closeBottomSheet = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setShowSeatSheet(false);
    setSelectedSeat(null);
  };

  const closeExitMenu = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setShowExitMenu(false);
  };

  const openExitMenu = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setShowExitMenu(true);
  };

  const openSettings = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setShowSettingPage(true);
  };

  const closeSettings = () => setShowSettingPage(false);

  const handleSaveSettings = async (data: Partial<RoomSettingsData>) => {
    if (data.roomName) setRoomName(data.roomName);
    if (data.announcement !== undefined) setRoomAnnouncement(data.announcement);
    if (data.roomImage) setRoomImage(data.roomImage);
    if (data.micMode) setMicMode(data.micMode);
    if (data.theme && THEME_BACKGROUNDS[data.theme]) {
      setBackgroundImage(THEME_BACKGROUNDS[data.theme]);
    }
    if (data.isLocked !== undefined) setIsLocked(data.isLocked);
    if (data.roomPassword !== undefined) setRoomPassword(data.roomPassword);

    if (roomId && db) {
      await setDoc(doc(db, "globalRooms", roomId), {
        name: data.roomName,
        image: data.roomImage,
        announcement: data.announcement,
        micMode: data.micMode,
        theme: data.theme,
        isLocked: data.isLocked,
        roomPassword: data.roomPassword,
      }, { merge: true });
    }
  };

  const handleExit = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setShowExitMenu(false);
    localStorage.removeItem('keptRoom');
    setMessages([]);
    
    if (onBack) onBack();
    if (onClose) onClose();
  };

  const handleKeep = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const roomData = { name: roomOwner.name, image: roomOwner.image, accountId: roomOwner.accountId || '' };
    localStorage.setItem('keptRoom', JSON.stringify(roomData));
    setShowExitMenu(false);
    if (onKeepRoom) onKeepRoom(roomData);
    if (onBack) onBack();
  };

  const handleEmojiSelect = (emoji: string) => console.log("Selected Emoji:", emoji);

  const handleClearChat = () => {
    clearedAtRef.current = Date.now();
    setMessages([]);
  };

  const liveUserCount = roomUsers.length;
  const selectedSeatData = selectedSeat !== null ? seats.find(s => s.number === selectedSeat) : null;
  const isSelectedSeatMySeat = selectedSeatData ? isCurrentUsersSeat(selectedSeatData) : false;
  const isSelectedSeatTakenByOther = selectedSeatData ? (selectedSeatData.isOccupied && !isSelectedSeatMySeat) : false;

  const renderSeats = () => {
    const renderSeatItems = (seatNumbers: number[]) => {
      return seatNumbers.map(num => {
        const seat = seats.find(s => s.number === num);
        return (
          <SeatItem
            key={num}
            seatNumber={num}
            seatData={seat}
            onClick={handleSeatClick(num)}
            onAvatarClick={handleSeatAvatarClick(seat!)}
            accountId={userAccountId}
            roomOwnerId={roomOwnerId}
          />
        );
      });
    };

    if (micMode === 5) {
      return (
        <>
          <div className="flex justify-center">{renderSeatItems([1])}</div>
          <div className="flex justify-around items-center px-1">{renderSeatItems([2,3,4,5])}</div>
        </>
      );
    }
    if (micMode === 10) {
      return (
        <>
          <div className="flex justify-center gap-4">{renderSeatItems([1,2])}</div>
          <div className="flex justify-around items-center px-1">{renderSeatItems([3,4,5,6])}</div>
          <div className="flex justify-around items-center px-1">{renderSeatItems([7,8,9,10])}</div>
        </>
      );
    }
    if (micMode === 13) {
      return (
        <>
          <div className="flex justify-center">{renderSeatItems([1])}</div>
          <div className="flex justify-around items-center px-1">{renderSeatItems([2,3,4,5])}</div>
          <div className="flex justify-around items-center px-1">{renderSeatItems([6,7,8,9])}</div>
          <div className="flex justify-around items-center px-1">{renderSeatItems([10,11,12,13])}</div>
        </>
      );
    }
    return (
      <>
        <div className="flex justify-center">{renderSeatItems([1])}</div>
        <div className="flex justify-around items-center px-1">{renderSeatItems([2,3,4,5])}</div>
        <div className="flex justify-around items-center px-1">{renderSeatItems([6,7,8,9])}</div>
      </>
    );
  };

  const handlePlayMusic = (track: MusicTrack, playlist?: MusicTrack[]) => {
    if (playlist && playlist.length > 0) {
      setMusicPlaylist(playlist);
      const index = playlist.findIndex(t => t.id === track.id);
      setCurrentTrackIndex(index >= 0 ? index : 0);
    } else {
      setMusicPlaylist([track]);
      setCurrentTrackIndex(0);
    }

    if (musicAudioRef.current) {
      musicAudioRef.current.pause();
      musicAudioRef.current.src = track.url;
      musicAudioRef.current.volume = musicVolume;
      musicAudioRef.current.play();
    } else {
      const audio = new Audio(track.url);
      audio.volume = musicVolume;
      musicAudioRef.current = audio;
      audio.play();
      
      audio.addEventListener('timeupdate', () => {
        setMusicCurrentTime(audio.currentTime);
      });
      audio.addEventListener('loadedmetadata', () => {
        setMusicDuration(audio.duration);
      });
      audio.addEventListener('ended', () => {
        handleNextTrack();
      });
    }
    
    setCurrentTrack(track);
    setIsMusicPlaying(true);
    setMusicControllerState('full');
    setMusicCurrentTime(0);
    setMusicDuration(0);
  };

  const handleToggleMusicPlay = () => {
    if (!musicAudioRef.current || !currentTrack) return;
    if (isMusicPlaying) {
      musicAudioRef.current.pause();
      setIsMusicPlaying(false);
    } else {
      musicAudioRef.current.play();
      setIsMusicPlaying(true);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setMusicVolume(newVolume);
    if (musicAudioRef.current) {
      musicAudioRef.current.volume = newVolume;
    }
  };

  const handleProgressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(e.target.value);
    setMusicCurrentTime(newTime);
    if (musicAudioRef.current) {
      musicAudioRef.current.currentTime = newTime;
    }
  };

  const handleNextTrack = () => {
    if (musicPlaylist.length === 0) return;
    const nextIndex = (currentTrackIndex + 1) % musicPlaylist.length;
    const nextTrack = musicPlaylist[nextIndex];
    
    if (musicAudioRef.current) {
      musicAudioRef.current.src = nextTrack.url;
      musicAudioRef.current.volume = musicVolume;
      musicAudioRef.current.play();
    }
    
    setCurrentTrackIndex(nextIndex);
    setCurrentTrack(nextTrack);
    setIsMusicPlaying(true);
    setMusicCurrentTime(0);
    setMusicDuration(0);
  };

  const handlePrevTrack = () => {
    if (musicPlaylist.length === 0) return;
    const prevIndex = (currentTrackIndex - 1 + musicPlaylist.length) % musicPlaylist.length;
    const prevTrack = musicPlaylist[prevIndex];
    
    if (musicAudioRef.current) {
      musicAudioRef.current.src = prevTrack.url;
      musicAudioRef.current.volume = musicVolume;
      musicAudioRef.current.play();
    }
    
    setCurrentTrackIndex(prevIndex);
    setCurrentTrack(prevTrack);
    setIsMusicPlaying(true);
    setMusicCurrentTime(0);
    setMusicDuration(0);
  };

  const handleCloseMusicController = () => {
    if (musicAudioRef.current) {
      musicAudioRef.current.pause();
      musicAudioRef.current = null;
    }
    setMusicControllerState('hidden');
    setCurrentTrack(null);
    setIsMusicPlaying(false);
  };

  const handleMinimizeMusicController = () => {
    setMusicControllerState('minimized');
  };

  const handleMaximizeMusicController = () => {
    setMusicControllerState('full');
  };

  useEffect(() => {
    return () => {
      if (musicAudioRef.current) {
        musicAudioRef.current.pause();
        musicAudioRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (musicAudioRef.current) {
      musicAudioRef.current.volume = musicVolume;
    }
  }, [musicVolume]);

  const formatTime = (seconds: number) => {
    if (isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (showSettingPage) {
    return (
      <RoomSettingPage
        onBack={closeSettings}
        roomOwnerId={roomId}
        roomData={{ roomName, roomImage, announcement: roomAnnouncement, micMode, isLocked, roomPassword, theme: Object.keys(THEME_BACKGROUNDS).find(key => THEME_BACKGROUNDS[key] === backgroundImage) || 'mood-light' }}
        onSave={handleSaveSettings}
      />
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col" onClick={() => {
      if (musicControllerState === 'full') {
        setMusicControllerState('minimized');
      }
    }}>
      <img
        src={backgroundImage}
        alt="Room Background"
        className="absolute inset-0 w-full h-full object-cover opacity-60 pointer-events-none"
        draggable={false}
      />

      <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" aria-label="Upload image" />

      <div className="relative z-10 flex flex-col h-full px-4" style={{ paddingTop: 'calc(env(safe-area-inset-top, 0px) + 4px)', paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 16px)' }} onClick={(e) => e.stopPropagation()}>

        {/* Top Header */}
        <div className="flex justify-between items-center text-white flex-shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => { setRoomInfoTab('profile'); setShowRoomInfo(true); }}
              className="w-10 h-10 rounded-lg overflow-hidden border-2 border-white/30 flex-shrink-0 cursor-pointer hover:border-white/50 transition-colors"
            >
              <img src={roomImage} alt="Room Cover" className="w-full h-full object-cover" draggable={false} />
            </button>
            <div className="text-left">
              <div className="flex items-center gap-2">
                <h2 className="font-bold text-lg">{displayRoomName}</h2>
                {!isRoomOwner && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      const newFollow = !isFollowed;
                      setIsFollowed(newFollow);
                      if (onFollowToggle) onFollowToggle(roomId, newFollow);
                    }}
                    className={`w-6 h-6 rounded-full flex items-center justify-center transition-all cursor-pointer ${isFollowed ? 'bg-gray-500' : 'bg-blue-500'}`}
                    title={isFollowed ? 'Unfollow Room' : 'Follow Room'}
                  >
                    {isFollowed ? (
                      <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-white">
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                      </svg>
                    ) : (
                      <>
                        <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-white absolute">
                          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                        </svg>
                        <svg viewBox="0 0 24 24" className="w-2.5 h-2.5 relative">
                          <line x1="12" y1="5" x2="12" y2="19" stroke="white" strokeWidth="3" strokeLinecap="round" />
                          <line x1="5" y1="12" x2="19" y2="12" stroke="white" strokeWidth="3" strokeLinecap="round" />
                        </svg>
                      </>
                    )}
                  </button>
                )}
              </div>
              <p className="text-xs text-gray-300">ID: {roomOwner.accountId || roomOwner.id || ''}</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button onClick={(e) => { e.stopPropagation(); setShowActiveUsers(true); }} className="flex items-center gap-1 bg-black/40 backdrop-blur-md px-2 py-0.5 rounded-full border border-white/10 h-7 cursor-pointer hover:bg-black/60 transition-colors">
              <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 fill-none stroke-white stroke-[2] stroke-linecap-round stroke-linejoin-round">
                <circle cx="9" cy="7" r="4" />
                <path d="M 2 20 C 2 15 5 13 9 13 C 13 13 16 15 16 20" />
                <line x1="18" y1="8" x2="21" y2="8" /><line x1="18" y1="12" x2="21" y2="12" /><line x1="18" y1="16" x2="20" y2="16" />
              </svg>
              <span className="text-white text-xs font-semibold leading-none">{liveUserCount}</span>
            </button>

            {isRoomOwner && (
              <button onClick={openSettings} aria-label="Settings" className="p-1.5 bg-black/40 backdrop-blur-md rounded-full border border-white/10 hover:bg-black/60 transition-colors cursor-pointer">
                <svg viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-white stroke-[2.2] stroke-linecap-round stroke-linejoin-round">
                  <polygon points="12 2.5 20.2 7.25 20.2 16.75 12 21.5 3.8 16.75 3.8 7.25" />
                  <circle cx="12" cy="12" r="2.8" />
                </svg>
              </button>
            )}

            <button onClick={(e) => { e.stopPropagation(); setShowMessageSheet(true); }} aria-label="Share" className="p-1.5 bg-black/40 backdrop-blur-md rounded-full border border-white/10 hover:bg-black/60 transition-colors cursor-pointer">
              <svg viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-white stroke-[2.2] stroke-linecap-round stroke-linejoin-round">
                <path d="M4 14.5C4.5 10 8 7 14 7V3L21 10.5L14 18V14C9.5 14 6 15.5 4 19.5C4 18 4 16 4 14.5Z" />
              </svg>
            </button>

            <button onClick={openExitMenu} aria-label="Power" className="p-1.5 bg-black/50 backdrop-blur-md rounded-full hover:bg-black/70 transition-colors flex items-center justify-center w-9 h-9 cursor-pointer">
              <svg viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-white stroke-[2.5] stroke-linecap-round stroke-linejoin-round">
                <path d="M12 4v8" /><path d="M18.36 6.64a9 9 0 1 1-12.72 0" />
              </svg>
            </button>
          </div>
        </div>

        {/* Middle Section - Fixed spacing */}
        <div className="flex-1 flex flex-col min-h-0">
          <div className="flex-shrink-0 flex flex-col gap-2 pt-2">
            {renderSeats()}
          </div>

          <div ref={messagesContainerRef} className="mx-1 mt-2 flex-1 overflow-y-auto scrollbar-none">
            <div className="mx-1 mb-2 flex justify-start">
              <div className="bg-white/5 backdrop-blur-sm rounded-lg border border-white/5 px-3 py-2 max-w-[80%]">
                <p className="text-white text-[12px] leading-snug font-medium">
                  Welcome to Hurry any content Related to porn, Froud, Violence fake official will be ban!
                </p>
                {roomAnnouncement && (
                  <div className="flex items-start gap-1.5 mt-1">
                    <span className="text-white text-[11px] font-semibold whitespace-nowrap shrink-0">ANNOUNCEMENT:</span>
                    <p className="text-white text-[12px] leading-snug font-medium">{roomAnnouncement}</p>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-0.5">
              {messages.map((msg) => (
                <div key={msg.id} className="leading-[1.9rem]">
                  {msg.type === 'join' ? (
                    <div className="flex items-start gap-1.5 px-1">
                      <div
                        className="w-6 h-6 rounded-full overflow-hidden flex-shrink-0 mt-0.5 cursor-pointer"
                        onClick={() => openProfile({ name: msg.sender, image: msg.senderImage, accountId: msg.senderAccountId || '' })}
                      >
                        <img src={msg.senderImage || "/default-avatar.png"} alt={msg.sender} className="w-full h-full object-cover" draggable={false} onError={(e) => { (e.target as HTMLImageElement).src = "/default-avatar.png" }} />
                      </div>
                      <div className="flex flex-col bg-white/8 backdrop-blur-sm rounded-md px-2 py-0.5 border border-white/5">
                        <span className="text-[9px] font-semibold text-white/80 leading-tight">{msg.sender}</span>
                        <span className="text-[8px] text-white/50 leading-tight mt-0.5">Enter the Room</span>
                      </div>
                    </div>
                  ) : msg.imageUrl ? (
                    <div className="flex items-start gap-2" style={{ height: 'calc(4 * 1.9rem)' }}>
                      <div
                        className="w-7 h-7 rounded-full overflow-hidden flex-shrink-0 mt-0.5 cursor-pointer"
                        onClick={() => openProfile({ name: msg.sender, image: msg.senderImage, accountId: msg.senderAccountId || (msg.sender === currentUser.name ? userAccountId : '') })}
                      >
                        <img src={msg.senderImage || "/default-avatar.png"} alt={msg.sender} className="w-full h-full object-cover" draggable={false} onError={(e) => { (e.target as HTMLImageElement).src = "/default-avatar.png" }} />
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="text-[9px] font-semibold text-white/70 leading-tight">{msg.sender}</span>
                        <div onClick={() => setFullImageModal(msg.imageUrl || null)} className="rounded-lg overflow-hidden border border-white/20 cursor-pointer hover:opacity-90 transition-opacity bg-black/40 flex items-center justify-center mt-0.5" style={{ height: 'calc(3.5 * 1.9rem)', width: 'calc(3.5 * 1.9rem)' }}>
                          <img src={msg.imageUrl} alt="Shared image" className="w-full h-full object-cover" draggable={false} />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-start gap-2">
                      <div
                        className="w-7 h-7 rounded-full overflow-hidden flex-shrink-0 mt-0.5 cursor-pointer"
                        onClick={() => openProfile({ name: msg.sender, image: msg.senderImage, accountId: msg.senderAccountId || (msg.sender === currentUser.name ? userAccountId : '') })}
                      >
                        <img src={msg.senderImage || "/default-avatar.png"} alt={msg.sender} className="w-full h-full object-cover" draggable={false} onError={(e) => { (e.target as HTMLImageElement).src = "/default-avatar.png" }} />
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="text-[9px] font-semibold text-white/70 leading-tight">{msg.sender}</span>
                        <div className="px-2.5 py-1 rounded-lg bg-white/15 text-white rounded-bl-none mt-0.5">
                          <p className="text-[11px] break-words leading-tight">{msg.text}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          </div>
        </div>

        {/* Footer Controls */}
        <div className="flex-shrink-0 pt-2">
          {showChatInput && (
            <div ref={inputContainerRef} className="flex items-center gap-0 mb-2 -mx-4 w-screen">
              <div className="flex-1 bg-white flex items-center px-4 py-3 shadow-lg w-full">
                <button onMouseDown={(e) => e.preventDefault()} onClick={handleImageClick} className="p-1.5 hover:bg-gray-100 rounded-full transition-colors flex-shrink-0 cursor-pointer">
                  <svg viewBox="0 0 24 24" className="w-6 h-6 fill-none stroke-gray-500 stroke-[2] stroke-linecap-round stroke-linejoin-round">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" />
                  </svg>
                </button>
                <input
                  ref={inputRef}
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  onFocus={handleInputFocus}
                  placeholder="Type a message..."
                  className="flex-1 bg-transparent text-gray-800 placeholder-gray-400 px-3 py-2 text-base outline-none border-none"
                />
                <button
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={handleSendMessage}
                  className="p-1.5 hover:bg-blue-50 rounded-full transition-colors cursor-pointer flex-shrink-0"
                >
                  <svg viewBox="0 0 24 24" className="w-6 h-6 fill-none stroke-blue-500 stroke-[2] stroke-linecap-round stroke-linejoin-round">
                    <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
                  </svg>
                </button>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between gap-2">
            <button
              onClick={openChatInput}
              className="bg-black/40 backdrop-blur-md border border-white/10 text-white text-xs font-semibold px-4 py-2 rounded-full hover:bg-black/60 transition-colors shadow-md shrink-0 cursor-pointer"
            >
              Say Hi
            </button>
            <div className="flex items-center gap-2">
              {hasSeat && (
                <button onClick={handleBottomMicToggle} className="bg-black/30 backdrop-blur-md p-2 rounded-full border border-white/20 hover:bg-black/50 transition-colors shrink-0 w-10 h-10 flex items-center justify-center cursor-pointer">
                  {currentUserSeat?.isMuted ? (
                    <svg viewBox="0 0 24 24" className="w-5 h-5 fill-none stroke-red-400 stroke-[2] stroke-linecap-round stroke-linejoin-round">
                      <line x1="1" y1="1" x2="23" y2="23" /><path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6" /><path d="M17 16.95A7 7 0 0 1 5 12v-2m14 0v2a7 7 0 0 1-.11 1.23" /><line x1="12" y1="19" x2="12" y2="23" /><line x1="8" y1="23" x2="16" y2="23" />
                    </svg>
                  ) : (
                    <svg viewBox="0 0 24 24" className="w-5 h-5 fill-none stroke-white stroke-[2] stroke-linecap-round stroke-linejoin-round">
                      <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" /><path d="M19 10v2a7 7 0 0 1-14 0v-2" /><line x1="12" y1="19" x2="12" y2="23" /><line x1="8" y1="23" x2="16" y2="23" />
                    </svg>
                  )}
                </button>
              )}
              <button onClick={(e) => { e.stopPropagation(); setShowEmojiPicker(true); }} className="bg-black/30 backdrop-blur-md p-2 rounded-full border border-white/20 hover:bg-black/50 transition-colors shrink-0 w-10 h-10 flex items-center justify-center cursor-pointer">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              </button>
              <button onClick={(e) => { e.stopPropagation(); setShowGiftPicker(true); }} aria-label="Gift" className="bg-black/40 backdrop-blur-md rounded-full border border-white/10 hover:bg-black/60 transition-colors flex items-center justify-center shrink-0 w-10 h-10 overflow-hidden cursor-pointer">
                <img src="/file_000000008e508208b1353ae33e2abef9.png" alt="Gift" className="w-full h-full object-cover" draggable={false} />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); setShowMessageSheet(true); }}
                aria-label="Message Box Menu"
                className="bg-black/40 backdrop-blur-md p-2 rounded-full border border-white/10 hover:bg-black/60 transition-colors flex items-center justify-center shrink-0 w-10 h-10 cursor-pointer"
              >
                <svg viewBox="0 0 24 24" className="w-5 h-5 fill-none stroke-white stroke-[2.2] stroke-linecap-round stroke-linejoin-round"><rect x="4" y="4" width="16" height="16" rx="4" /><path d="M7 9.5L12 14.5L17 9.5" /></svg>
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); setShowFourGride(true); }}
                aria-label="Apps Menu"
                className="bg-black/40 backdrop-blur-md p-2 rounded-full border border-white/10 hover:bg-black/60 transition-colors flex items-center justify-center shrink-0 w-10 h-10 cursor-pointer"
              >
                <svg viewBox="0 0 24 24" className="w-5 h-5 fill-white"><rect x="3" y="3" width="7.5" height="7.5" rx="2.5" /><rect x="13.5" y="3" width="7.5" height="7.5" rx="2.5" /><rect x="3" y="13.5" width="7.5" height="7.5" rx="2.5" /><rect x="13.5" y="13.5" width="7.5" height="7.5" rx="2.5" /></svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Public Msg Off Modal */}
      {showPublicMsgModal && (
        <div className="absolute inset-0 z-[70] flex items-center justify-center bg-black/50" onClick={() => setShowPublicMsgModal(false)}>
          <div className="bg-white rounded-2xl px-6 py-5 shadow-xl max-w-xs w-full text-center" onClick={(e) => e.stopPropagation()}>
            <div className="text-4xl mb-3"></div>
            <h3 className="text-lg font-bold text-gray-800 mb-1">Public msg are off</h3>
            <p className="text-sm text-gray-500 mb-4">Only the room owner can send messages right now.</p>
            <button
              onClick={() => setShowPublicMsgModal(false)}
              className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-6 rounded-full transition-colors cursor-pointer"
            >
              OK
            </button>
          </div>
        </div>
      )}

      {/* Active Users Sheet */}
      {showActiveUsers && (
        <div className="absolute inset-0 z-40 flex items-end justify-center">
          <div className="absolute inset-0 bg-black/30" onClick={() => setShowActiveUsers(false)} />
          <div className="relative bg-white w-full max-w-md rounded-t-3xl shadow-2xl animate-slide-up overflow-hidden flex flex-col" style={{ height: '40vh', maxHeight: '40vh' }} onClick={(e) => e.stopPropagation()}>
            <div className="px-6 pt-5 pb-3 border-b border-gray-200 flex-shrink-0">
              <h2 className="text-lg font-bold text-gray-800 text-center">Active Users</h2>
            </div>
            <div className="flex-1 overflow-y-auto px-4 py-3" style={{ minHeight: 0 }}>
              {roomUsers.length > 0 ? (
                <div className="space-y-2 pb-4">
                  {roomUsers.map((user) => (
                    <div key={user.accountId} className="flex items-center gap-3 bg-gray-50 rounded-lg px-3 py-2.5">
                      <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0 cursor-pointer" onClick={() => openProfile({ name: user.name, image: user.image, accountId: user.accountId })}>
                        <img src={user.image || "/default-avatar.png"} alt={user.name} className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).src = "/default-avatar.png" }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-semibold text-gray-800 truncate">{user.name}</h4>
                        <div className="flex items-center gap-1">
                          <p className="text-xs text-gray-400">ID: {user.accountId}</p>
                          <button onClick={(e) => handleCopyUserId(user.accountId, e)} className="p-0.5 hover:bg-gray-200 rounded transition-colors cursor-pointer" title="Copy ID">
                            <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-none stroke-gray-400 stroke-[2] stroke-linecap-round stroke-linejoin-round">
                              <rect x="9" y="9" width="13" height="13" rx="2" ry="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <p className="text-gray-400 text-sm">No active users</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Room Info Sheet */}
      {showRoomInfo && (
        <div className="absolute inset-0 z-40 flex items-end justify-center">
          <div className="absolute inset-0 bg-black/30" onClick={() => setShowRoomInfo(false)} />
          <div className="relative bg-white w-full max-w-md rounded-t-3xl shadow-2xl animate-slide-up overflow-hidden" style={{ height: '50vh' }} onClick={(e) => e.stopPropagation()}>
            {!isRoomOwner && (
              <svg viewBox="0 0 24 24" className="absolute top-3 left-3 w-6 h-6 fill-none stroke-black stroke-[2] stroke-linecap-round stroke-linejoin-round">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                <line x1="12" y1="9" x2="12" y2="13" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
            )}

            <div className="px-6 pt-6 pb-2 flex items-center justify-center">
              <h2 className="text-lg font-bold text-gray-800">Room Information</h2>
            </div>
            <div className="flex border-b border-gray-200 px-6">
              <button onClick={() => setRoomInfoTab('profile')} className={`flex-1 py-3 text-sm font-semibold transition-all cursor-pointer ${roomInfoTab === 'profile' ? 'text-black border-b-2 border-black' : 'text-gray-400 hover:text-gray-600'}`}>Profile</button>
              <button onClick={() => setRoomInfoTab('members')} className={`flex-1 py-3 text-sm font-semibold transition-all cursor-pointer ${roomInfoTab === 'members' ? 'text-black border-b-2 border-black' : 'text-gray-400 hover:text-gray-600'}`}>Members</button>
            </div>
            <div className="flex-1 overflow-y-auto px-6 py-4">
              {roomInfoTab === 'profile' ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-14 h-14 rounded-xl overflow-hidden border border-gray-200 flex-shrink-0">
                      <img src={roomImage} alt="Room" className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800">{roomName || 'Room'}</h3>
                      <div className="flex items-center gap-1 text-xs text-gray-400">
                        <span>ID: {roomOwner.accountId}</span>
                        <button onClick={handleCopyId} className="p-0.5 hover:bg-gray-100 rounded transition-colors cursor-pointer" title="Copy ID">
                          <svg viewBox="0 0 24 24" className="w-4 h-4 fill-none stroke-gray-500 stroke-[2] stroke-linecap-round stroke-linejoin-round">
                            <rect x="9" y="9" width="13" height="13" rx="2" ry="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                          </svg>
                        </button>
                        {copied && <span className="text-green-500 text-xs">Copied!</span>}
                      </div>
                    </div>
                  </div>
                  <div>
                    <span className="text-xs text-gray-400 font-medium">Host</span>
                    <p className="text-sm font-medium text-gray-800 mt-1">{roomOwner.name || "Unknown"}</p>
                  </div>
                  <div>
                    <span className="text-xs text-gray-400 font-medium">Announcement:</span>
                    <p className="text-sm text-gray-700 mt-1 leading-relaxed">{roomAnnouncement || '—'}</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex items-center gap-3 bg-gray-50 rounded-lg px-3 py-2.5">
                    <div className="w-9 h-9 rounded-full overflow-hidden flex-shrink-0 cursor-pointer" onClick={() => openProfile({ name: roomOwner.name, image: roomOwner.image, accountId: roomOwner.accountId || roomOwner.id || '' })}>
                      <img src={roomOwner.image || "/default-avatar.png"} alt={roomOwner.name} className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).src = "/default-avatar.png" }} />
                    </div>
                    <div className="flex-1 min-w-0 flex items-center gap-2">
                      <h4 className="text-sm font-medium text-gray-800 truncate">{roomOwner.name}</h4>
                      <span className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0">
                        <svg viewBox="0 0 24 24" className="w-3 h-3 fill-white"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /></svg>
                      </span>
                    </div>
                  </div>
                  {roomFollowers.map(follower => (
                    <div key={follower.accountId} className="flex items-center gap-3 bg-gray-50 rounded-lg px-3 py-2.5">
                      <div className="w-9 h-9 rounded-full overflow-hidden flex-shrink-0 cursor-pointer" onClick={() => openProfile({ name: follower.name, image: follower.image || "/default-avatar.png", accountId: follower.accountId })}>
                        <img src={follower.image || "/default-avatar.png"} alt={follower.name} className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).src = "/default-avatar.png" }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-medium text-gray-800 truncate">{follower.name}</h4>
                      </div>
                    </div>
                  ))}
                  {roomFollowers.length === 0 && <p className="text-center text-gray-400 text-sm py-8">No followers yet</p>}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* RoomProfile Bottom Sheet */}
      {showUserProfile && profileUser && (
        <RoomProfile
          user={{ 
            name: profileUser.name, 
            image: profileUser.image, 
            accountId: profileUser.accountId,
            isInSeat: profileUser.isInSeat,
            isMuted: seats.find(s => s.user?.accountId === profileUser.accountId)?.isMuted || false,
            isLocked: seats.find(s => s.user?.accountId === profileUser.accountId)?.isLocked || false
          }}
          isCurrentUser={profileUser.accountId === userAccountId}
          isRoomOwner={isRoomOwner}
          onClose={() => setShowUserProfile(false)}
          onFollow={() => console.log('Follow clicked for', profileUser.accountId)}
          onMessage={() => {
            setShowUserProfile(false);
            setShowChatInput(true);
            setTimeout(() => { if (inputRef.current) inputRef.current.focus(); }, 200);
          }}
          onCopyId={() => console.log('Copy ID clicked')}
          onMention={(username?: string) => {
            setShowUserProfile(false);
            setShowChatInput(true);
            setMessage(`@${username} `);
            setTimeout(() => { if (inputRef.current) inputRef.current.focus(); }, 200);
          }}
          onLeaveSeat={() => {
            const userSeat = seats.find(s => s.isOccupied && s.user?.accountId === profileUser.accountId);
            if (userSeat) {
              setSelectedSeat(userSeat.number);
              setTimeout(() => handleLeaveSeat(), 100);
            }
            setShowUserProfile(false);
          }}
          onMute={() => {
            const userSeat = seats.find(s => s.isOccupied && s.user?.accountId === profileUser.accountId);
            if (userSeat) {
              setSelectedSeat(userSeat.number);
              setTimeout(() => handleToggleMute(), 100);
            }
            setShowUserProfile(false);
          }}
          onLock={() => {
            const userSeat = seats.find(s => s.isOccupied && s.user?.accountId === profileUser.accountId);
            if (userSeat) {
              setSelectedSeat(userSeat.number);
              setTimeout(() => handleToggleLock(), 100);
            }
            setShowUserProfile(false);
          }}
          onKickOut={() => {
            const userSeat = seats.find(s => s.isOccupied && s.user?.accountId === profileUser.accountId);
            if (userSeat) {
              setSelectedSeat(userSeat.number);
              setTimeout(() => handleLeaveSeat(), 100);
            }
            setShowUserProfile(false);
          }}
        />
      )}

      {/* Exit Menu */}
      {showExitMenu && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/40" onClick={closeExitMenu}>
          <div className="flex flex-col items-center gap-8" onClick={(e) => e.stopPropagation()}>
            <div className="flex flex-col items-center gap-2">
              <button onClick={handleKeep} className="w-20 h-20 rounded-full bg-blue-500 hover:bg-blue-600 flex items-center justify-center transition-all duration-200 shadow-lg shadow-blue-500/30 cursor-pointer">
                <svg viewBox="0 0 24 24" className="h-8 w-8 fill-none stroke-white stroke-[2.5] stroke-linecap-round stroke-linejoin-round"><line x1="5" y1="12" x2="19" y2="12" /></svg>
              </button>
              <span className="text-white font-semibold text-base">Keep</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <button onClick={handleExit} className="w-20 h-20 rounded-full bg-blue-500 hover:bg-blue-600 flex items-center justify-center transition-all duration-200 shadow-lg shadow-blue-500/30 cursor-pointer">
                <svg viewBox="0 0 24 24" className="h-8 w-8 fill-none stroke-white stroke-[2] stroke-linecap-round stroke-linejoin-round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>
              </button>
              <span className="text-white/70 font-medium text-sm">Exit</span>
            </div>
          </div>
          <button onClick={closeExitMenu} className="absolute bottom-8 left-1/2 -translate-x-1/2 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 flex items-center justify-center transition-all duration-200 cursor-pointer">
            <svg viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-white stroke-[2.5] stroke-linecap-round stroke-linejoin-round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
          </button>
        </div>
      )}

      {/* Seat Actions Sheet */}
      {showSeatSheet && selectedSeat !== null && (
        <div className="absolute inset-0 z-30 flex items-end justify-center">
          <div className="absolute inset-0 bg-black/30" onClick={closeBottomSheet} />
          <div className="relative bg-white/95 backdrop-blur-xl w-full max-w-md rounded-t-3xl shadow-2xl px-6 py-4 animate-slide-up max-h-[25vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="space-y-2">
              {!isSelectedSeatTakenByOther && !isSelectedSeatMySeat && (
                <button onClick={handleTakeSeat} disabled={selectedSeatData?.isLocked && !selectedSeatData?.isOccupied} className="w-full py-2.5 text-black font-medium text-base hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer">Take Mic</button>
              )}
              {isSelectedSeatMySeat && <button onClick={handleLeaveSeat} className="w-full py-2.5 text-black font-medium text-base hover:bg-gray-100 rounded-lg transition-colors cursor-pointer">Leave Seat</button>}
              {isSelectedSeatMySeat && (
                <button onClick={handleToggleMute} className="w-full py-2.5 text-black font-medium text-base hover:bg-gray-100 rounded-lg transition-colors cursor-pointer">
                  {selectedSeatData?.isMuted ? 'Unmute' : 'Mute'}
                </button>
              )}
              <button onClick={handleToggleLock} className="w-full py-2.5 text-black font-medium text-base hover:bg-gray-100 rounded-lg transition-colors cursor-pointer">{selectedSeatData?.isLocked ? 'Unlock Mic' : 'Lock Mic'}</button>
              <button onClick={handleInvite} className="w-full py-2.5 text-black font-medium text-base hover:bg-gray-100 rounded-lg transition-colors cursor-pointer">Invite</button>
            </div>
          </div>
        </div>
      )}

      {/* Full Image Modal */}
      {fullImageModal && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4 cursor-pointer" onClick={() => setFullImageModal(null)}>
          <div className="relative max-w-full max-h-full">
            <img src={fullImageModal} alt="Full preview" className="max-w-full max-h-[85vh] object-contain rounded-lg" />
            <button onClick={() => setFullImageModal(null)} className="absolute -top-10 right-0 text-white bg-white/20 rounded-full p-2 hover:bg-white/40">
              <svg viewBox="0 0 24 24" className="w-6 h-6 fill-none stroke-white stroke-[2.5]"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
            </button>
          </div>
        </div>
      )}

      {/* Message Sheet */}
      {showMessageSheet && (
        <div className="absolute inset-0 z-40 flex items-end justify-center">
          <div className="absolute inset-0 bg-black/30" onClick={() => setShowMessageSheet(false)} />
          <div className="relative bg-white w-full max-w-md rounded-t-3xl shadow-2xl animate-slide-up overflow-hidden" style={{ height: '60vh' }} onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setShowMessageSheet(false)} className="absolute top-3 left-3 z-20 p-1.5 bg-white/80 rounded-full shadow hover:bg-white transition-colors">
              <svg viewBox="0 0 24 24" className="w-5 h-5 fill-none stroke-gray-700 stroke-[2.5] stroke-linecap-round stroke-linejoin-round">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>
            <div className="h-full overflow-y-auto">
              <MessagePage sharedRoomData={{ roomId: roomId, roomName: roomOwner.name, roomImage: roomOwner.image }} />
            </div>
          </div>
        </div>
      )}

      {/* Four Grid Tools Sheet */}
      {showFourGride && (
        <Fourgride
          onClose={() => setShowFourGride(false)}
          onClearChat={handleClearChat}
          publicMsgOff={publicMsgOff}
          onTogglePublicMsg={() => setPublicMsgOff(prev => !prev)}
          speaker={isSpeakerOn}
          onToggleSpeaker={() => setIsSpeakerOn(prev => !prev)}
          onMusicPlay={(track) => {
            const db = indexedDB.open('HurryMusicDB', 1);
            db.onsuccess = () => {
              const request = db.result
                .transaction('music', 'readonly')
                .objectStore('music')
                .getAll();
              
              request.onsuccess = () => {
                const allTracks = request.result.map((item: any) => ({
                  id: item.id,
                  name: item.name,
                  url: URL.createObjectURL(item.blob)
                }));
                handlePlayMusic(track, allTracks);
              };
            };
          }}
        />
      )}

      {/* Music Controller - Full Size */}
      {musicControllerState === 'full' && currentTrack && !showFourGride && (
        <div 
          className="fixed left-1/2 transform -translate-x-1/2 z-[45] w-full max-w-md px-4"
          style={{ 
            bottom: '10vh',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div 
            className="relative rounded-2xl overflow-hidden bg-black/90 backdrop-blur-md border border-white/10"
            style={{
              padding: '12px',
              boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
            }}
          >
            <button
              onClick={handleCloseMusicController}
              className="absolute top-2 left-2 p-1.5 rounded-full bg-white/10 hover:bg-white/20 transition-colors cursor-pointer z-10"
              aria-label="Close music controller"
            >
              <svg viewBox="0 0 24 24" className="w-5 h-5 fill-none stroke-white stroke-[2] stroke-linecap-round stroke-linejoin-round">
                <path d="M18.36 6.64a9 9 0 1 1-12.72 0" />
                <line x1="12" y1="2" x2="12" y2="12" />
              </svg>
            </button>

            <button
              onClick={handleMinimizeMusicController}
              className="absolute top-2 right-2 p-1.5 rounded-full bg-white/10 hover:bg-white/20 transition-colors cursor-pointer z-10"
              aria-label="Minimize music controller"
            >
              <svg viewBox="0 0 24 24" className="w-5 h-5 fill-none stroke-white stroke-[2] stroke-linecap-round stroke-linejoin-round">
                <line x1="7" y1="17" x2="17" y2="7" />
                <polyline points="7 7 17 7 17 17" />
              </svg>
            </button>

            <div className="text-center mb-2 mt-5">
              <p className="text-white text-sm font-semibold truncate px-8">
                {currentTrack.name}
              </p>
            </div>

            <div className="px-2 mb-2">
              <input
                type="range"
                min="0"
                max={musicDuration || 0}
                step="0.1"
                value={musicCurrentTime}
                onChange={handleProgressChange}
                className="w-full h-1.5 rounded-lg appearance-none cursor-pointer music-progress-slider"
                style={{
                  background: `linear-gradient(to right, #3b82f6 ${musicDuration ? (musicCurrentTime / musicDuration) * 100 : 0}%, rgba(255,255,255,0.3) ${musicDuration ? (musicCurrentTime / musicDuration) * 100 : 0}%)`,
                }}
              />
              <div className="flex justify-between text-[10px] text-white/60 mt-1">
                <span>{formatTime(musicCurrentTime)}</span>
                <span>{formatTime(musicDuration)}</span>
              </div>
            </div>

            <div className="flex items-center justify-center gap-6 mb-2">
              <button
                onClick={handlePrevTrack}
                className="p-2 rounded-full hover:bg-white/10 transition-colors cursor-pointer"
                aria-label="Previous track"
              >
                <svg viewBox="0 0 24 24" className="w-7 h-7 fill-white">
                  <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z" />
                </svg>
              </button>

              <button
                onClick={handleToggleMusicPlay}
                className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 transition-colors cursor-pointer"
                aria-label={isMusicPlaying ? 'Pause' : 'Play'}
              >
                {isMusicPlaying ? (
                  <svg viewBox="0 0 24 24" className="w-8 h-8 fill-white">
                    <rect x="6" y="4" width="4" height="16" rx="1" />
                    <rect x="14" y="4" width="4" height="16" rx="1" />
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24" className="w-8 h-8 fill-white">
                    <polygon points="5 3 19 12 5 21 5 3" />
                  </svg>
                )}
              </button>

              <button
                onClick={handleNextTrack}
                className="p-2 rounded-full hover:bg-white/10 transition-colors cursor-pointer"
                aria-label="Next track"
              >
                <svg viewBox="0 0 24 24" className="w-7 h-7 fill-white">
                  <path d="M16 6h2v12h-2zm-2.5 6l-8.5 6V6z" />
                </svg>
              </button>
            </div>

            <div className="flex items-center gap-2 px-2">
              <svg viewBox="0 0 24 24" className="w-4 h-4 fill-white shrink-0">
                <path d="M3 9v6h4l5 5V4L7 9H3z" />
              </svg>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={musicVolume}
                onChange={handleVolumeChange}
                className="flex-1 h-2 rounded-lg appearance-none cursor-pointer music-volume-slider"
                style={{
                  background: `linear-gradient(to right, #3b82f6 ${musicVolume * 100}%, rgba(255,255,255,0.3) ${musicVolume * 100}%)`,
                }}
              />
              <span className="text-white text-xs font-semibold w-8 text-right">
                {Math.round(musicVolume * 100)}%
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Music Controller - Minimized */}
      {musicControllerState === 'minimized' && currentTrack && !showFourGride && (
        <div
          className="fixed z-[45]"
          style={{ 
            bottom: '8vh', 
            right: '12px',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={handleMaximizeMusicController}
            className="relative rounded-full overflow-hidden shadow-lg cursor-pointer transition-transform hover:scale-105"
            style={{
              width: '56px',
              height: '56px',
              border: '3px solid black',
              backgroundColor: 'black',
            }}
            aria-label="Maximize music controller"
          >
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
              <div className="relative w-full h-full flex items-center justify-center">
                <div className="absolute w-18 h-18 rounded-full border-2 border-red-500 animate-ping-slow" style={{ animationDuration: '1.5s' }} />
                <div className="absolute w-18 h-18 rounded-full border-2 border-red-400 animate-ping-slow" style={{ animationDuration: '1.5s', animationDelay: '0.5s' }} />
                <div className="absolute w-18 h-18 rounded-full border-2 border-red-300 animate-ping-slow" style={{ animationDuration: '1.5s', animationDelay: '1s' }} />
                <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
              </div>
            </div>

            <div className="absolute inset-0 flex items-center justify-center music-minimize-icon z-20">
              <img 
                src="/IMG_20260815_133309.png" 
                alt="Music" 
                className="w-full h-full object-cover rounded-full" 
                style={{ borderRadius: '50%' }}
              />
            </div>
          </button>
        </div>
      )}

      {/* Custom styles for sliders */}
      <style jsx global>{`
        .music-volume-slider {
          -webkit-appearance: none;
          appearance: none;
        }
        .music-volume-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 0px;
          height: 0px;
          background: transparent;
        }
        .music-volume-slider::-moz-range-thumb {
          width: 0px;
          height: 0px;
          background: transparent;
          border: none;
        }
        .music-volume-slider::-webkit-slider-runnable-track {
          height: 8px;
          border-radius: 4px;
        }
        .music-volume-slider::-moz-range-track {
          height: 8px;
          border-radius: 4px;
        }

        .music-progress-slider {
          -webkit-appearance: none;
          appearance: none;
        }
        .music-progress-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 0px;
          height: 0px;
          background: transparent;
        }
        .music-progress-slider::-moz-range-thumb {
          width: 0px;
          height: 0px;
          background: transparent;
          border: none;
        }
        .music-progress-slider::-webkit-slider-runnable-track {
          height: 6px;
          border-radius: 3px;
        }
        .music-progress-slider::-moz-range-track {
          height: 6px;
          border-radius: 3px;
        }

        @keyframes ping-slow {
          0% { transform: scale(1); opacity: 1; }
          100% { transform: scale(1.5); opacity: 0; }
        }
        .animate-ping-slow {
          animation: ping-slow 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;
        }

        @keyframes rotate-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .music-minimize-icon {
          animation: rotate-slow 4s linear infinite;
        }
      `}</style>

      {/* Emoji & Gift Pickers */}
      {showEmojiPicker && <EmojiPicker onClose={() => setShowEmojiPicker(false)} onSelectEmoji={handleEmojiSelect} />}
      {showGiftPicker && <GiftPicker onClose={() => setShowGiftPicker(false)} />}

      {isSpeakerOn && <RoomAudioRenderer />}

      <style jsx>{`
        @keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }
        .animate-slide-up { animation: slideUp 0.3s ease-out; }
        @keyframes waveBehind { 0% { transform: translate(-50%, -50%) scale(0.85); opacity: 0.9; } 50% { transform: translate(-50%, -50%) scale(1.35); opacity: 0.4; } 100% { transform: translate(-50%, -50%) scale(1.6); opacity: 0; } }
        @keyframes voicePulse { 0%, 100% { transform: translate(-50%, -50%) scale(1); } 50% { transform: translate(-50%, -50%) scale(1.08); } }
        .wave-ripple { animation: waveBehind 1.2s ease-out infinite; }
        .wave-ripple-delayed { animation: waveBehind 1.2s ease-out 0.4s infinite; }
        .scrollbar-none { -ms-overflow-style: none; scrollbar-width: none; }
        .scrollbar-none::-webkit-scrollbar { display: none; }
        
        @keyframes ping-slow {
          0% { transform: scale(0.8); opacity: 1; }
          100% { transform: scale(1.5); opacity: 0; }
        }
        .animate-ping-slow {
          animation: ping-slow 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;
        }
      `}</style>
    </div>
  );
}

// SeatItem Component - Images at seat row corners
function SeatItem({ seatNumber, seatData, onClick, onAvatarClick, accountId, roomOwnerId }: {
  seatNumber: number;
  seatData?: Seat;
  onClick: (e: React.MouseEvent) => void;
  onAvatarClick?: (e: React.MouseEvent) => void;
  accountId: string;
  roomOwnerId: string;
}) {
  const isLocked = seatData?.isLocked ?? false;
  const isOccupied = seatData?.isOccupied ?? false;
  const isSpeaking = seatData?.isSpeaking ?? false;
  const isMuted = seatData?.isMuted ?? false;
  const user = seatData?.user;
  const isRoomOwnerSeat = isOccupied && user?.accountId === roomOwnerId;

  const remoteParticipants = useRemoteParticipants();
  const { localParticipant } = useLocalParticipant();

  const isUserSpeaking = React.useMemo(() => {
    if (!isOccupied || isMuted) return false;
    if (user?.accountId === accountId) {
      return localParticipant?.isSpeaking ?? false;
    } else {
      const p = remoteParticipants.find(rp => rp.identity === user?.accountId);
      return p?.isSpeaking ?? false;
    }
  }, [isOccupied, isMuted, user?.accountId, accountId, localParticipant, remoteParticipants]);

  const activeSpeaking = isSpeaking || isUserSpeaking;

  return (
    <div className="relative flex flex-col items-center gap-1 cursor-pointer" onClick={onClick}>
      {/* LEFT side image - positioned relative to seat */}
      {seatNumber === 1 && (
        <div 
          className="absolute pointer-events-none"
          style={{
            left: '-130px', // Adjust this value for spacing from seat
            top: '-10px',
            transform: 'translateY(-50%)',
            zIndex: 40,
            display: 'flex',
            alignItems: 'center',
            gap: '2px',
          }}
        >
          <div 
            className="relative overflow-visible"
            style={{
              width: '20px',
              height: '20px',
              flexShrink: 0,
            }}
          >
            <WhiteColorRemovalShader
              imageSrc="/1787158869902.png"
              threshold={0.85}
              className="w-full h-full"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'contain',
                maxWidth: 'none',
                maxHeight: 'none',
                pointerEvents: 'none',
              }}
            />
          </div>
          
          <span 
            className="text-[9px] font-bold whitespace-nowrap"
            style={{
              color: '#FFD700',
              textShadow: '0 0 4px rgba(255,215,0,0.8), 0 0 8px rgba(255,215,0,0.5)',
              letterSpacing: '0.5px',
            }}
          >
            500K
          </span>
        </div>
      )}

      {/* RIGHT side image - positioned relative to seat */}
      {seatNumber === 1 && (
        <div 
          className="absolute pointer-events-none"
          style={{
            right: '-130px', // Adjust this value for spacing from seat
            top: '-10px',
            transform: 'translateY(-50%)',
            zIndex: 40,
          }}
        >
          <div 
            className="relative overflow-visible"
            style={{
              width: '40px',
              height: '40px',
              backgroundColor: 'transparent',
              border: 'none',
              boxShadow: 'none',
            }}
          >
            <WhiteColorRemovalShader
              imageSrc="/1787162568668.png"
              threshold={0.85}
              removeColor="white"
              className="w-full h-full"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'contain',
                maxWidth: 'none',
                maxHeight: 'none',
                pointerEvents: 'none',
              }}
            />
          </div>
        </div>
      )}

      {/* Seat circle */}
      <div className="relative overflow-visible">
        {activeSpeaking && (
          <>
            <div className="absolute rounded-full bg-blue-400 wave-ripple pointer-events-none" style={{ width: '60px', height: '60px', left: '50%', top: '50%', zIndex: 0 }} />
            <div className="absolute rounded-full bg-blue-500 wave-ripple-delayed pointer-events-none" style={{ width: '60px', height: '60px', left: '50%', top: '50%', zIndex: 0 }} />
            <div className="absolute rounded-full pointer-events-none" style={{ width: '64px', height: '64px', left: '50%', top: '50%', zIndex: 0, backgroundColor: 'rgba(59, 130, 246, 0.35)', filter: 'blur(6px)', animation: 'voicePulse 1.2s ease-in-out infinite' }} />
          </>
        )}
        <div className={`w-[60px] h-[60px] rounded-full flex items-center justify-center shrink-0 relative z-10 bg-[rgba(125,143,168,0.32)] backdrop-blur-[12px] border transition-all duration-300 hover:scale-105 pointer-events-auto ${activeSpeaking ? 'border-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.8)]' : 'border-[rgba(210,220,235,0.55)] shadow-[inset_0_1px_1.5px_rgba(255,255,255,0.45),inset_0_-1px_1.5px_rgba(0,0,0,0.18),inset_0_0_22px_rgba(255,255,255,0.12),0_8px_32px_rgba(0,0,0,0.28)]'}`}>
          {isLocked ? (
            <div className="w-8 h-8 flex items-center justify-center">
              <svg viewBox="0 0 24 24" className="w-full h-full fill-none stroke-[#94a7be] stroke-[2] stroke-linecap-round stroke-linejoin-round"><rect x="5" y="11" width="14" height="10" rx="2.5" /><path d="M8 11V7a4 4 0 0 1 8 0v4" /><circle cx="12" cy="16" r="1.2" fill="#94a7be" /></svg>
            </div>
          ) : isOccupied && user ? (
            <>
              <div className="relative w-full h-full rounded-full overflow-visible">
                <img
                  src={user.image || "/default-avatar.png"}
                  alt={user.name}
                  className="w-full h-full rounded-full object-cover pointer-events-none"
                  draggable={false}
                  onError={(e) => { (e.target as HTMLImageElement).src = "/default-avatar.png" }}
                  onClick={onAvatarClick}
                  style={{ 
                    cursor: 'pointer', 
                    pointerEvents: 'auto',
                    borderRadius: '50%',
                    position: 'relative',
                    zIndex: 1
                  }}
                />
                <div 
                  className="absolute pointer-events-none"
                  style={{
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: '160%',
                    height: '160%',
                    zIndex: 2,
                    overflow: 'visible',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <WhiteColorRemovalShader
                    imageSrc="/1786867564769.png"
                    threshold={0.85}
                    className="w-full h-full"
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'contain',
                      maxWidth: 'none',
                      maxHeight: 'none',
                      overflow: 'visible',
                    }}
                  />
                </div>
              </div>
              {isMuted && (
                <div className={`absolute -right-1 -bottom-1 w-5 h-5 rounded-full flex items-center justify-center shadow-md pointer-events-none z-10 ${user.accountId === accountId ? 'bg-gray-400' : 'bg-red-500'}`}>
                  <svg viewBox="0 0 24 24" className="w-3 h-3 fill-none stroke-white stroke-[3] stroke-linecap-round stroke-linejoin-round"><line x1="1" y1="1" x2="23" y2="23" /><path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6" /><path d="M17 16.95A7 7 0 0 1 5 12v-2m14 0v2a7 7 0 0 1-.11 1.23" /></svg>
                </div>
              )}
            </>
          ) : (
            <div className="w-[58%] h-[58%] flex items-center justify-center pointer-events-none relative">
              <svg viewBox="0 0 100 100" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" style={{ overflow: "visible", display: "block" }}>
                <g fill="none" stroke="#94a7be" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round"><path d="M 28 44 Q 28 74 50 74 Q 72 74 72 44" /><path d="M 50 74 L 50 86" /><path d="M 38 90 L 62 90" /></g>
                <g fill="#94a7be" stroke="#5a6d89" strokeWidth="2.8" strokeLinejoin="round" strokeLinecap="round" transform="translate(0, 6)"><path d="M 36 18 Q 36 10 50 10 Q 64 10 64 18 L 64 42 Q 64 52 50 52 Q 36 52 36 42 Z" /></g>
              </svg>
              {isMuted && (
                <div className="absolute -right-2 -bottom-2 w-5 h-5 rounded-full bg-red-500 flex items-center justify-center shadow-md">
                  <svg viewBox="0 0 24 24" className="w-3 h-3 fill-none stroke-white stroke-[3] stroke-linecap-round stroke-linejoin-round"><line x1="1" y1="1" x2="23" y2="23" /><path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6" /><path d="M17 16.95A7 7 0 0 1 5 12v-2m14 0v2a7 7 0 0 1-.11 1.23" /></svg>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      <span className="text-[10px] font-medium text-white/80 pointer-events-none flex items-center gap-1">
        {isRoomOwnerSeat && (
          <span className="w-3 h-3 rounded-full bg-blue-500 flex items-center justify-center inline-flex">
            <svg viewBox="0 0 24 24" className="w-2 h-2 fill-white"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /></svg>
          </span>
        )}
        {isLocked ? `No ${seatNumber}` : (isOccupied && user ? user.name : `No ${seatNumber}`)}
      </span>
    </div>
  );
            }
