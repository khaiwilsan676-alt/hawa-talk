
'use client';

import React, { useState, useEffect, useRef } from 'react';
import EmojiPicker from './Emojipicker';
import GiftPicker from './GiftPicker';
import RoomSettingPage from './RoomSettingPage';
import MessagePage from './MessagePage';
import RoomProfile from './RoomProfile';
import RoomInfo from './RoomInfo';
import ActiveUsers from './ActiveUsers';
import ExitMenu from './ExitMenu';
import SeatActions from './SeatActions';
import MusicController from './MusicController';
import SeatItem from './SeatItem';
import Fourgride from './Fourgride';
import { db } from "../src/lib/firebase";
import { doc, setDoc, getDoc, onSnapshot, addDoc, serverTimestamp, query, orderBy, deleteDoc, collection } from "firebase/firestore";
// LiveKit imports for Voice Audio
import { 
  LiveKitRoom, 
  RoomAudioRenderer, 
  useLocalParticipant,
  LocalAudioTrack,
  RemoteAudioTrack,
  AudioCaptureOptions
} from "@livekit/components-react";
import "@livekit/components-styles";

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

type AudioDeviceType = 'bluetooth' | 'headphones' | 'speaker';

interface AudioDevice {
  deviceId: string;
  label: string;
  type: AudioDeviceType;
}

const THEME_BACKGROUNDS: { [key: string]: string } = {
  'forest-night': '/1784875884052~2.jpg',
  'mood-light': '/1784533036732~2.jpg',
};

export default function RoomPage({ roomOwner, currentUser, onClose, onBack, onKeepRoom, onFollowToggle }: RoomPageProps) {
  // LiveKit Token & Connection States
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
    if (roomId && currentUser.name) {
      fetchToken();
    }
  }, [roomId, currentUser.name, userAccountId]);

  return (
    <LiveKitRoom
      audio={true}
      video={false}
      token={livekitToken}
      serverUrl={livekitUrl}
      connect={Boolean(livekitToken)}
      className="fixed inset-0 z-50 bg-black flex flex-col"
    >
      <RoomContent
        roomOwner={roomOwner}
        currentUser={currentUser}
        onClose={onClose}
        onBack={onBack}
        onKeepRoom={onKeepRoom}
        onFollowToggle={onFollowToggle}
      />
      <RoomAudioRenderer />
    </LiveKitRoom>
  );
}

function RoomContent({ roomOwner, currentUser, onClose, onBack, onKeepRoom, onFollowToggle }: RoomPageProps) {
  // UI state
  const [showExitMenu, setShowExitMenu] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showGiftPicker, setShowGiftPicker] = useState(false);
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

  // Audio device state
  const [audioDevices, setAudioDevices] = useState<AudioDevice[]>([]);
  const [currentAudioDevice, setCurrentAudioDevice] = useState<AudioDeviceType>('speaker');
  const [showAudioMenu, setShowAudioMenu] = useState(false);
  const [isAudioConnected, setIsAudioConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected'>('disconnected');
  const [audioLevel, setAudioLevel] = useState(0);

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
  const [backgroundImage, setBackgroundImage] = useState<string>("/1784533036732~2.jpg");

  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
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

  // Detect audio devices
  useEffect(() => {
    const detectAudioDevices = async () => {
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const audioOutputs = devices.filter(device => device.kind === 'audiooutput');
        
        const deviceList: AudioDevice[] = [];
        
        audioOutputs.forEach(device => {
          const label = device.label.toLowerCase();
          if (label.includes('bluetooth') || label.includes('bt') || label.includes('airpods')) {
            deviceList.push({ deviceId: device.deviceId, label: device.label || 'Bluetooth Device', type: 'bluetooth' });
          } else if (label.includes('headphone') || label.includes('headset') || label.includes('earphone')) {
            deviceList.push({ deviceId: device.deviceId, label: device.label || 'Headphones', type: 'headphones' });
          } else {
            deviceList.push({ deviceId: device.deviceId, label: device.label || 'Speaker', type: 'speaker' });
          }
        });
        
        if (!deviceList.find(d => d.type === 'bluetooth')) {
          deviceList.push({ deviceId: 'default-bluetooth', label: 'Bluetooth Device', type: 'bluetooth' });
        }
        if (!deviceList.find(d => d.type === 'headphones')) {
          deviceList.push({ deviceId: 'default-headphones', label: 'Headphones', type: 'headphones' });
        }
        if (!deviceList.find(d => d.type === 'speaker')) {
          deviceList.push({ deviceId: 'default-speaker', label: 'Speaker', type: 'speaker' });
        }
        
        setAudioDevices(deviceList);
      } catch (error) {
        console.error("Error detecting audio devices:", error);
        setAudioDevices([
          { deviceId: 'default-bluetooth', label: 'Bluetooth Device', type: 'bluetooth' },
          { deviceId: 'default-headphones', label: 'Headphones', type: 'headphones' },
          { deviceId: 'default-speaker', label: 'Speaker', type: 'speaker' }
        ]);
      }
    };
    
    detectAudioDevices();
  }, []);

  // Handle audio device switching
  const handleAudioDeviceChange = async (deviceType: AudioDeviceType) => {
    try {
      setConnectionStatus('connecting');
      setCurrentAudioDevice(deviceType);
      
      const device = audioDevices.find(d => d.type === deviceType);
      
      if (device && device.deviceId !== 'default-' + deviceType) {
        if (typeof (document as any).setSinkId === 'function') {
          const audioElements = document.querySelectorAll('audio');
          audioElements.forEach(async (audio: HTMLAudioElement) => {
            try {
              await (audio as any).setSinkId(device.deviceId);
            } catch (err) {
              console.error("Error setting sink ID:", err);
            }
          });
        }
      }
      
      if (localParticipant) {
        await localParticipant.setMicrophoneEnabled(false);
        await localParticipant.setMicrophoneEnabled(hasSeat && !currentUserSeat?.isMuted);
      }
      
      setIsAudioConnected(true);
      setConnectionStatus('connected');
      
      alert(`${deviceType.charAt(0).toUpperCase() + deviceType.slice(1)} connected successfully!`);
      
    } catch (error) {
      console.error("Error switching audio device:", error);
      setConnectionStatus('disconnected');
      alert(`Failed to connect ${deviceType}. Please try again.`);
    }
  };

  // Monitor audio levels
  useEffect(() => {
    if (!localParticipant) return;
    
    const tracks = Array.from(localParticipant.audioTrackPublications.values());
    
    tracks.forEach(publication => {
      if (publication.track) {
        const audioTrack = publication.track as LocalAudioTrack;
        
        const interval = setInterval(() => {
          const level = audioTrack.getAudioLevel?.() || 0;
          setAudioLevel(level);
        }, 100);
        
        return () => clearInterval(interval);
      }
    });
  }, [localParticipant]);

  // Auto-connect to default speaker on mount
  useEffect(() => {
    if (localParticipant && !isAudioConnected) {
      handleAudioDeviceChange('speaker');
    }
  }, [localParticipant]);

  // Sync LiveKit Microphone state with Seat Mute & Occupied Status
  useEffect(() => {
    if (localParticipant) {
      const isMuted = currentUserSeat?.isMuted ?? true;
      const isInSeat = hasSeat;
      localParticipant.setMicrophoneEnabled(isInSeat && !isMuted);
    }
  }, [currentUserSeat?.isMuted, hasSeat, localParticipant]);

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

  const handleCopyId = (text: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyUserId = (accountId: string, e: React.MouseEvent) => {
    handleCopyId(accountId, e);
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

  const handleTakeSeat = async () => {
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

  const handleLeaveSeat = async () => {
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

  const handleToggleMute = async () => {
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

  const handleToggleLock = async () => {
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

  const handleInvite = () => {
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

  const closeBottomSheet = () => {
    setShowSeatSheet(false);
    setSelectedSeat(null);
  };

  const closeExitMenu = () => {
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

  const handleSaveSettings = async (data: any) => {
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

  const handleExit = () => {
    setShowExitMenu(false);
    localStorage.removeItem('keptRoom');
    setMessages([]);
    if (onBack) onBack();
    if (onClose) onClose();
  };

  const handleKeep = () => {
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
            onAvatarClick={seat ? handleSeatAvatarClick(seat) : undefined}
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

      <div className="relative z-10 flex flex-col h-full px-4" style={{ paddingTop: 'calc(env(safe-area-inset-top, 0px) + 16px)', paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 16px)' }} onClick={(e) => e.stopPropagation()}>

        {/* Top Header */}
        <div className="flex justify-between items-center text-white flex-shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowRoomInfo(true)}
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
                      <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-white">
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                      </svg>
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

        {/* Middle Section */}
        <div className="flex-1 flex flex-col min-h-0">
          <div className="flex-shrink-0 flex flex-col gap-2 pt-4">
            {renderSeats()}
          </div>

          <div className="mx-1 mt-1 flex-1 overflow-y-auto scrollbar-none">
            <div className="mx-2 mb-2 bg-black/30 backdrop-blur-md rounded-xl border border-white/10 px-4 py-3">
              <p className="text-white/80 text-[11px] leading-relaxed">
                Welcome to Hurry any content Related to porn, Froud, Violence fake official will be ban
              </p>
              {roomAnnouncement && (
                <div className="flex items-start gap-2 mt-2">
                  <span className="text-white/60 text-[10px] font-medium whitespace-nowrap">ANNOUNCEMENT:</span>
                  <p className="text-white/80 text-[11px] leading-relaxed">{roomAnnouncement}</p>
                </div>
              )}
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
              
              {/* Audio Device Button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowAudioMenu(true);
                }}
                className="bg-black/40 backdrop-blur-md p-2 rounded-full border border-white/10 hover:bg-black/60 transition-colors flex items-center justify-center shrink-0 w-10 h-10 cursor-pointer"
                aria-label="Audio Settings"
              >
                {currentAudioDevice === 'bluetooth' ? (
                  <svg viewBox="0 0 24 24" className="w-5 h-5 fill-none stroke-blue-400 stroke-[2] stroke-linecap-round stroke-linejoin-round">
                    <path d="M6.5 6.5l11 11L12 23V1l5.5 5.5-11 11" />
                  </svg>
                ) : currentAudioDevice === 'headphones' ? (
                  <svg viewBox="0 0 24 24" className="w-5 h-5 fill-none stroke-purple-400 stroke-[2] stroke-linecap-round stroke-linejoin-round">
                    <path d="M3 18v-6a9 9 0 0 1 18 0v6" />
                    <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z" />
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24" className="w-5 h-5 fill-none stroke-white stroke-[2] stroke-linecap-round stroke-linejoin-round">
                    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                    <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
                    <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
                  </svg>
                )}
              </button>

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

      {/* Audio Device Menu */}
      {showAudioMenu && (
        <div className="absolute inset-0 z-[80] flex items-center justify-center bg-black/50" onClick={() => setShowAudioMenu(false)}>
          <div className="bg-white rounded-2xl p-5 shadow-xl max-w-xs w-full" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-gray-800 mb-4 text-center">Audio Output</h3>
            
            <div className="space-y-3">
              {/* Bluetooth */}
              <button
                onClick={() => {
                  setShowAudioMenu(false);
                  handleAudioDeviceChange('bluetooth');
                }}
                className={`w-full p-4 rounded-xl border-2 transition-all cursor-pointer ${
                  currentAudioDevice === 'bluetooth' 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-200 hover:border-blue-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <svg viewBox="0 0 24 24" className="w-6 h-6 fill-none stroke-current text-blue-500" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M6.5 6.5l11 11L12 23V1l5.5 5.5-11 11" />
                  </svg>
                  <div className="text-left">
                    <p className="font-semibold text-gray-800">Bluetooth</p>
                    <p className="text-xs text-gray-500">
                      {connectionStatus === 'connected' && currentAudioDevice === 'bluetooth' ? 'Connected' : 'Wireless devices'}
                    </p>
                  </div>
                  {currentAudioDevice === 'bluetooth' && (
                    <span className="ml-auto text-green-500">✓</span>
                  )}
                </div>
              </button>

              {/* Headphones */}
              <button
                onClick={() => {
                  setShowAudioMenu(false);
                  handleAudioDeviceChange('headphones');
                }}
                className={`w-full p-4 rounded-xl border-2 transition-all cursor-pointer ${
                  currentAudioDevice === 'headphones' 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-200 hover:border-blue-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <svg viewBox="0 0 24 24" className="w-6 h-6 fill-none stroke-current text-purple-500" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 18v-6a9 9 0 0 1 18 0v6" />
                    <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z" />
                  </svg>
                  <div className="text-left">
                    <p className="font-semibold text-gray-800">Headphones</p>
                    <p className="text-xs text-gray-500">
                      {connectionStatus === 'connected' && currentAudioDevice === 'headphones' ? 'Connected' : 'Wired headsets'}
                    </p>
                  </div>
                  {currentAudioDevice === 'headphones' && (
                    <span className="ml-auto text-green-500">✓</span>
                  )}
                </div>
              </button>

              {/* Speaker */}
              <button
                onClick={() => {
                  setShowAudioMenu(false);
                  handleAudioDeviceChange('speaker');
                }}
                className={`w-full p-4 rounded-xl border-2 transition-all cursor-pointer ${
                  currentAudioDevice === 'speaker' 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-200 hover:border-blue-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <svg viewBox="0 0 24 24" className="w-6 h-6 fill-none stroke-current text-green-500" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                    <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
                    <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
                  </svg>
                  <div className="text-left">
                    <p className="font-semibold text-gray-800">Speaker</p>
                    <p className="text-xs text-gray-500">
                      {connectionStatus === 'connected' && currentAudioDevice === 'speaker' ? 'Connected' : 'Phone speaker'}
                    </p>
                  </div>
                  {currentAudioDevice === 'speaker' && (
                    <span className="ml-auto text-green-500">✓</span>
                  )}
                </div>
              </button>
            </div>

            {/* Connection Status */}
            <div className="mt-4 p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${
                  connectionStatus === 'connected' ? 'bg-green-500' : 
                  connectionStatus === 'connecting' ? 'bg-yellow-500' : 'bg-red-500'
                }`} />
                <p className="text-xs text-gray-600">
                  {connectionStatus === 'connected' ? 'Audio connected' : 
                   connectionStatus === 'connecting' ? 'Connecting...' : 'Disconnected'}
                </p>
              </div>
              {isAudioConnected && (
                <div className="mt-2">
                  <div className="w-full bg-gray-200 rounded-full h-1.5">
                    <div 
                      className="bg-blue-500 h-1.5 rounded-full transition-all" 
                      style={{ width: `${audioLevel * 100}%` }}
                    />
                  </div>
                  <p className="text-[10px] text-gray-400 mt-1">Microphone level</p>
                </div>
              )}
            </div>

            <button
              onClick={() => setShowAudioMenu(false)}
              className="w-full mt-3 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-2 px-4 rounded-full transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Public Msg Off Modal */}
      {showPublicMsgModal && (
        <div className="absolute inset-0 z-[70] flex items-center justify-center bg-black/50" onClick={() => setShowPublicMsgModal(false)}>
          <div className="bg-white rounded-2xl px-6 py-5 shadow-xl max-w-xs w-full text-center" onClick={(e) => e.stopPropagation()}>
            <div className="text-4xl mb-3">🔒</div>
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
      <ActiveUsers
        isOpen={showActiveUsers}
        onClose={() => setShowActiveUsers(false)}
        roomUsers={roomUsers}
        onOpenProfile={openProfile}
        onCopyUserId={handleCopyUserId}
      />

      {/* Room Info Sheet */}
      <RoomInfo
        isOpen={showRoomInfo}
        onClose={() => setShowRoomInfo(false)}
        isRoomOwner={isRoomOwner}
        roomOwner={roomOwner}
        roomData={{
          roomName,
          roomImage,
          roomAnnouncement,
          roomId
        }}
        roomFollowers={roomFollowers}
        onOpenProfile={openProfile}
        onCopyId={handleCopyId}
        copied={copied}
      />

      {/* RoomProfile Bottom Sheet */}
      {showUserProfile && profileUser && (
        <RoomProfile
          user={{ 
            name: profileUser.name, 
            image: profileUser.image, 
            accountId: profileUser.accountId,
            isInSeat: profileUser.isInSeat 
          }}
          onClose={() => setShowUserProfile(false)}
          onFollow={() => console.log('Follow clicked for', profileUser.accountId)}
          onMessage={() => console.log('Message clicked for', profileUser.accountId)}
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
        />
      )}

      {/* Exit Menu */}
      <ExitMenu
        isOpen={showExitMenu}
        onClose={closeExitMenu}
        onKeep={handleKeep}
        onExit={handleExit}
      />

      {/* Seat Actions Sheet */}
      <SeatActions
        isOpen={showSeatSheet}
        onClose={closeBottomSheet}
        seatNumber={selectedSeat}
        seatData={selectedSeatData}
        isMySeat={isSelectedSeatMySeat}
        isTakenByOther={isSelectedSeatTakenByOther}
        onTakeSeat={handleTakeSeat}
        onLeaveSeat={handleLeaveSeat}
        onToggleMute={handleToggleMute}
        onToggleLock={handleToggleLock}
        onInvite={handleInvite}
      />

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

      {/* Music Controller */}
      <MusicController
        state={musicControllerState}
        currentTrack={currentTrack}
        isPlaying={isMusicPlaying}
        volume={musicVolume}
        currentTime={musicCurrentTime}
        duration={musicDuration}
        onTogglePlay={handleToggleMusicPlay}
        onVolumeChange={handleVolumeChange}
        onProgressChange={handleProgressChange}
        onNextTrack={handleNextTrack}
        onPrevTrack={handlePrevTrack}
        onClose={handleCloseMusicController}
        onMinimize={handleMinimizeMusicController}
        onMaximize={handleMaximizeMusicController}
      />

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

      <style jsx>{`
        @keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }
        .animate-slide-up { animation: slideUp 0.3s ease-out; }
        @keyframes waveBehind { 0% { transform: translate(-50%, -50%) scale(0.85); opacity: 0.9; } 50% { transform: translate(-50%, -50%) scale(1.35); opacity: 0.4; } 100% { transform: translate(-50%, -50%) scale(1.6); opacity: 0; } }
        @keyframes voicePulse { 0%, 100% { transform: translate(-50%, -50%) scale(1); } 50% { transform: translate(-50%, -50%) scale(1.08); } }
        .wave-ripple { animation: waveBehind 1.2s ease-out infinite; }
        .wave-ripple-delayed { animation: waveBehind 1.2s ease-out 0.4s infinite; }
        .scrollbar-none { -ms-overflow-style: none; scrollbar-width: none; }
        .scrollbar-none::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  );
                     }
