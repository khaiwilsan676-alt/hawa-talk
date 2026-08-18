'use client' 

import React, { useEffect, useState, useRef } from 'react'
import { ChevronRight, Copy, ArrowLeft } from 'lucide-react'
import SettingPage from './settingpage'
import PublicProfile from './PublicProfile'
import HurrySupport from './HurrySupport'
import LanguagePage from './LanguagePage'
import { translations, getTranslation, LanguageCode } from '../lib/translations'
import { db } from "../src/lib/firebase"
import { doc, getDoc, onSnapshot, collection, addDoc } from "firebase/firestore"

// ============ IndexedDB Functions for User Data ============
const USER_DB_NAME = 'UserDataDB';
const USER_STORE = 'userData';
const FEEDBACK_STORE = 'feedbacks';

const openUserDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(USER_DB_NAME, 1);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(USER_STORE)) {
        const userStore = db.createObjectStore(USER_STORE, { keyPath: 'uid' });
        // Indexes for faster queries
        userStore.createIndex('name', 'name', { unique: false });
        userStore.createIndex('updatedAt', 'updatedAt', { unique: false });
      }
      if (!db.objectStoreNames.contains(FEEDBACK_STORE)) {
        const feedbackStore = db.createObjectStore(FEEDBACK_STORE, { keyPath: 'id', autoIncrement: true });
        feedbackStore.createIndex('timestamp', 'timestamp', { unique: false });
      }
    };
  });
};

// User data save karo IndexedDB mein (PERMANENT - with image and all data)
const saveUserToDB = async (userData: any) => {
  try {
    const db = await openUserDB();
    const transaction = db.transaction([USER_STORE], 'readwrite');
    const store = transaction.objectStore(USER_STORE);
    
    const completeUserData = {
      ...userData,
      cachedAt: Date.now(),
      updatedAt: new Date().toISOString(),
    };
    
    await new Promise<void>((resolve, reject) => {
      const request = store.put(completeUserData);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });

    db.close();
    console.log('✅ User data IndexedDB mein save hua (PERMANENT):', {
      name: completeUserData.name,
      uid: completeUserData.uid,
      hasPhoto: !!completeUserData.photo,
      accountNumber: completeUserData.accountNumber
    });
  } catch (error) {
    console.error('❌ User save error:', error);
  }
};

// User data load karo IndexedDB se (PERMANENT - no expiry)
const loadUserFromDB = async (uid: string): Promise<any> => {
  try {
    const db = await openUserDB();
    const transaction = db.transaction([USER_STORE], 'readonly');
    const store = transaction.objectStore(USER_STORE);

    const userData = await new Promise<any>((resolve, reject) => {
      const request = store.get(uid);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });

    db.close();
    
    if (userData) {
      console.log('✅ IndexedDB se user data mila:', {
        name: userData.name,
        hasPhoto: !!userData.photo,
        accountNumber: userData.accountNumber
      });
    }
    
    return userData || null;
  } catch (error) {
    console.error('❌ User load error:', error);
    return null;
  }
};

// All users data load karo (for debugging)
const getAllUsersFromDB = async (): Promise<any[]> => {
  try {
    const db = await openUserDB();
    const transaction = db.transaction([USER_STORE], 'readonly');
    const store = transaction.objectStore(USER_STORE);

    const allUsers = await new Promise<any[]>((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });

    db.close();
    return allUsers;
  } catch (error) {
    console.error('Get all users error:', error);
    return [];
  }
};

// Delete user from IndexedDB (only when app is deleted)
const deleteUserFromDB = async (uid: string) => {
  try {
    const db = await openUserDB();
    const transaction = db.transaction([USER_STORE], 'readwrite');
    const store = transaction.objectStore(USER_STORE);
    
    await new Promise<void>((resolve, reject) => {
      const request = store.delete(uid);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });

    db.close();
    console.log('🗑️ User data IndexedDB se delete hua');
  } catch (error) {
    console.error('Delete user error:', error);
  }
};

// Feedback functions (unchanged)
const saveFeedbackToDB = async (feedbackData: any) => {
  try {
    const db = await openUserDB();
    const transaction = db.transaction([FEEDBACK_STORE], 'readwrite');
    const store = transaction.objectStore(FEEDBACK_STORE);
    
    store.add({
      ...feedbackData,
      cachedAt: Date.now(),
      synced: false,
    });

    db.close();
    console.log('Feedback IndexedDB mein save hua (offline)');
  } catch (error) {
    console.error('Feedback save error:', error);
  }
};

const loadPendingFeedbacksFromDB = async (): Promise<any[]> => {
  try {
    const db = await openUserDB();
    const transaction = db.transaction([FEEDBACK_STORE], 'readonly');
    const store = transaction.objectStore(FEEDBACK_STORE);

    const feedbacks = await new Promise<any[]>((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });

    db.close();
    return feedbacks.filter(fb => !fb.synced);
  } catch (error) {
    console.error('Feedback load error:', error);
    return [];
  }
};

interface MenuItem {
  id: string
  labelKey: keyof typeof translations['en']
  src?: string
  icon?: React.ReactNode
  action?: string
  badge?: string
}

interface MePageProps {
  onLogout?: () => void
  onPublicProfileChange?: (isOpen: boolean) => void
}

const menuItems: MenuItem[] = [
  { id: '1', labelKey: 'inviteFriends', src: '/1784562849790.png' },
  { id: '2', labelKey: 'family', src: '/IMG_20260720_142354.png' },
  { id: '3', labelKey: 'level', src: '/IMG_20260720_211413.png' },
  { id: '4', labelKey: 'medal', src: '/1784621763019.png' },
  { id: '5', labelKey: 'store', src: '/IMG_20260720_142332.png' },
  { id: '6', labelKey: 'bag', src: '/IMG_20260720_142227.png' }
]

const bottomMenuItems: MenuItem[] = [
  {
    id: '7',
    labelKey: 'languageSetting',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="2" y1="12" x2="22" y2="12"></line>
        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10z"></path>
      </svg>
    )
  },
  {
    id: '8',
    labelKey: 'settings',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2l8 4.67v9.33L12 22l-8-4.67V6.67L12 2z"></path>
        <circle cx="12" cy="12" r="3"></circle>
      </svg>
    )
  },
  {
    id: '9',
    labelKey: 'customerService',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#1E1E1E" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M5.5 11 V8.5 C5.5 5 8.2 3 12 3 C15.8 3 18.5 5 18.5 8.5 V15.2 C18.5 18.5 16.2 21 12 21"/>
        <path d="M3 10.2 V13.8 C3 13.8 3.5 15.2 4.2 15.2 H5.5 V9 H4.2 C3.5 9 3 9.5 3 10.2 Z"/>
        <path d="M18.5 9 V15.2 H19.8 C20.5 15.2 21 14.6 21 13.8 V10.2 C21 9.4 20.5 9 19.8 9 H18.5"/>
        <path d="M9.2 13.8 C9.2 15 10.3 16 12 16 C13.7 16 14.8 15 14.8 13.8"/>
      </svg>
    )
  },
  {
    id: '10',
    labelKey: 'helpFeedback',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"></circle>
        <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
        <line x1="12" y1="17" x2="12.01" y2="17"></line>
      </svg>
    )
  }
]

// Official/Admin IDs list
const OFFICIAL_IDS = ['500001', '500002', '500003', '500004', '500005']
const ADMIN_IDS = ['700001', '700002', '700003']

// Feedback Types
const FEEDBACK_TYPES = [
  { id: 'app_bug', label: 'App Bug', icon: '' },
  { id: 'suggestion', label: 'Suggestion', icon: '' },
  { id: 'recharge', label: 'Recharge', icon: '' },
  { id: 'others', label: 'Others', icon: '' }
]

export const getOrCreateAccountNumber = (uid: string) => {
  if (!uid || uid === 'N/A') return { fullAccNum: 'N/A', displayAccNum: 'N/A' }

  // Check if it's an official or admin ID
  if (OFFICIAL_IDS.includes(uid) || ADMIN_IDS.includes(uid)) {
    return { fullAccNum: uid, displayAccNum: uid }
  }

  // Check stored account number first
  const savedAcc = localStorage.getItem('accountNumber')
  if (savedAcc) {
    return { fullAccNum: savedAcc, displayAccNum: savedAcc }
  }

  // Consistent 8-digit calculation based on UID
  let hash = 0
  for (let i = 0; i < uid.length; i++) {
    hash = (hash << 5) - hash + uid.charCodeAt(i)
    hash |= 0
  }
  const positiveHash = Math.abs(hash)
  const generated = String(10000000 + (positiveHash % 90000000))
  
  return { fullAccNum: generated, displayAccNum: generated }
}

// WebGL Shader Component (unchanged)
const WhiteColorRemovalShader = ({ 
  imageSrc, 
  threshold = 0.9,
  className = "",
  style = {}
}: { 
  imageSrc: string
  threshold?: number
  className?: string
  style?: React.CSSProperties
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const gl = canvas.getContext('webgl', { premultipliedAlpha: true })
    if (!gl) {
      console.warn('WebGL not supported')
      return
    }

    // Vertex shader
    const vertexShaderSource = `
      attribute vec2 a_position;
      attribute vec2 a_texCoord;
      varying vec2 v_texCoord;
      
      void main() {
        gl_Position = vec4(a_position, 0.0, 1.0);
        v_texCoord = a_texCoord;
      }
    `

    // Fragment shader with white color removal
    const fragmentShaderSource = `
      precision mediump float;
      
      varying vec2 v_texCoord;
      uniform sampler2D u_texture;
      uniform float u_threshold;
      
      void main() {
        vec4 color = texture2D(u_texture, v_texCoord);
        
        // Calculate whiteness
        float maxColor = max(color.r, max(color.g, color.b));
        float minColor = min(color.r, min(color.g, color.b));
        float lightness = (maxColor + minColor) / 2.0;
        float saturation = maxColor - minColor;
        
        // If pixel is white (high lightness, low saturation), make it transparent
        if (lightness > u_threshold && saturation < 0.3) {
          gl_FragColor = vec4(0.0, 0.0, 0.0, 0.0);
        } else {
          gl_FragColor = color;
        }
      }
    `

    // Compile shaders
    const compileShader = (type: number, source: string) => {
      const shader = gl.createShader(type)
      if (!shader) return null
      gl.shaderSource(shader, source)
      gl.compileShader(shader)
      
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error('Shader compile error:', gl.getShaderInfoLog(shader))
        gl.deleteShader(shader)
        return null
      }
      return shader
    }

    const vertexShader = compileShader(gl.VERTEX_SHADER, vertexShaderSource)
    const fragmentShader = compileShader(gl.FRAGMENT_SHADER, fragmentShaderSource)
    
    if (!vertexShader || !fragmentShader) return

    // Create program
    const program = gl.createProgram()
    if (!program) return
    
    gl.attachShader(program, vertexShader)
    gl.attachShader(program, fragmentShader)
    gl.linkProgram(program)

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error('Program link error:', gl.getProgramInfoLog(program))
      return
    }

    gl.useProgram(program)

    // Setup geometry
    const positionBuffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer)
    const positions = new Float32Array([
      -1.0, -1.0,
       1.0, -1.0,
      -1.0,  1.0,
      -1.0,  1.0,
       1.0, -1.0,
       1.0,  1.0,
    ])
    gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW)

    const positionLocation = gl.getAttribLocation(program, 'a_position')
    gl.enableVertexAttribArray(positionLocation)
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0)

    // Setup texture coordinates - FLIP Y axis
    const texCoordBuffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer)
    const texCoords = new Float32Array([
      0.0, 1.0,  // Bottom-left
      1.0, 1.0,  // Bottom-right
      0.0, 0.0,  // Top-left
      0.0, 0.0,  // Top-left
      1.0, 1.0,  // Bottom-right
      1.0, 0.0,  // Top-right
    ])
    gl.bufferData(gl.ARRAY_BUFFER, texCoords, gl.STATIC_DRAW)

    const texCoordLocation = gl.getAttribLocation(program, 'a_texCoord')
    gl.enableVertexAttribArray(texCoordLocation)
    gl.vertexAttribPointer(texCoordLocation, 2, gl.FLOAT, false, 0, 0)

    // Load and create texture
    const texture = gl.createTexture()
    gl.bindTexture(gl.TEXTURE_2D, texture)
    
    // Set texture parameters
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
    
    // Enable blending for transparency
    gl.enable(gl.BLEND)
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA)

    const image = new Image()
    image.crossOrigin = 'anonymous'
    image.onload = () => {
      gl.bindTexture(gl.TEXTURE_2D, texture)
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image)
      
      // Set threshold uniform
      const thresholdLocation = gl.getUniformLocation(program, 'u_threshold')
      gl.uniform1f(thresholdLocation, threshold)
      
      // Set canvas size to match image
      canvas.width = image.width
      canvas.height = image.height
      gl.viewport(0, 0, canvas.width, canvas.height)
      
      // Draw
      gl.clearColor(0.0, 0.0, 0.0, 0.0)
      gl.clear(gl.COLOR_BUFFER_BIT)
      gl.drawArrays(gl.TRIANGLES, 0, 6)
      
      setIsLoaded(true)
    }
    image.onerror = () => {
      console.error('Failed to load image for WebGL processing')
    }
    image.src = imageSrc

    // Cleanup
    return () => {
      gl.deleteProgram(program)
      gl.deleteShader(vertexShader)
      gl.deleteShader(fragmentShader)
      gl.deleteBuffer(positionBuffer)
      gl.deleteBuffer(texCoordBuffer)
      gl.deleteTexture(texture)
    }
  }, [imageSrc, threshold])

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{
        ...style,
        opacity: isLoaded ? 1 : 0,
        transition: 'opacity 0.3s ease-in-out'
      }}
    />
  )
}

export default function MePage({ onLogout, onPublicProfileChange }: MePageProps) {
  const [currentView, setCurrentView] = useState<'me' | 'settings' | 'public_profile' | 'customer_service' | 'language'>('me')
  const [appLang, setAppLang] = useState<LanguageCode>('en')
  
  // Feedback States
  const [showFeedbackPage, setShowFeedbackPage] = useState(false)

  useEffect(() => {
    if (onPublicProfileChange) {
      onPublicProfileChange(currentView !== 'me' || showFeedbackPage)
    }
  }, [showFeedbackPage, currentView])
  
  const [selectedType, setSelectedType] = useState<string>('')
  const [problemDescription, setProblemDescription] = useState('')
  const [contactInfo, setContactInfo] = useState('')
  const [feedbackSubmitting, setFeedbackSubmitting] = useState(false)
  const [feedbackSuccess, setFeedbackSuccess] = useState(false)
  const [feedbackError, setFeedbackError] = useState<string | null>(null)

  useEffect(() => {
    const savedLang = localStorage.getItem('appLanguage') as LanguageCode
    if (savedLang) {
      setAppLang(savedLang)
    }

    const handleLangChange = (e: CustomEvent) => {
      if (e.detail && e.detail.lang) {
        setAppLang(e.detail.lang)
      }
    }

    window.addEventListener('languageChange', handleLangChange as EventListener)
    return () => window.removeEventListener('languageChange', handleLangChange as EventListener)
  }, [])

  const t = getTranslation(appLang)

  const [user, setUser] = useState({
    name: "",
    uid: "",
    accountNumber: "",
    displayAccountNumber: "",
    phone: "",
    photo: "",
  })

  const switchView = (view: 'me' | 'settings' | 'public_profile' | 'customer_service' | 'language') => {
    setCurrentView(view)
    if (onPublicProfileChange) {
      onPublicProfileChange(view !== 'me' || showFeedbackPage)
    }
  }

  // Handle Feedback Submit (unchanged)
  const handleFeedbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedbackError(null);

    if (!selectedType) {
      setFeedbackError("Please select a type of issue");
      return;
    }
    if (!problemDescription.trim()) {
      setFeedbackError("Please describe your problem");
      return;
    }
    if (!contactInfo.trim()) {
      setFeedbackError("Please enter your contact information");
      return;
    }

    setFeedbackSubmitting(true);

    const feedbackData = {
      type: selectedType,
      typeLabel: FEEDBACK_TYPES.find(t => t.id === selectedType)?.label || selectedType,
      description: problemDescription.trim(),
      contactInfo: contactInfo.trim(),
      createdAt: new Date().toISOString(),
      timestamp: Date.now(),
      status: 'pending'
    };

    try {
      // Firebase mein save karo
      await addDoc(collection(db, "feedbacks"), feedbackData);
      
      // IndexedDB mein bhi save karo (backup)
      await saveFeedbackToDB(feedbackData);
      
      setFeedbackSuccess(true);
      setSelectedType('');
      setProblemDescription('');
      setContactInfo('');
      
      // Auto close after 2 seconds
      setTimeout(() => {
        setShowFeedbackPage(false);
        setFeedbackSuccess(false);
      }, 2000);

    } catch (error) {
      console.error("Error submitting feedback:", error);
      
      // Agar Firebase fail ho jaye to IndexedDB mein save karo (offline mode)
      try {
        await saveFeedbackToDB(feedbackData);
        setFeedbackSuccess(true);
        setSelectedType('');
        setProblemDescription('');
        setContactInfo('');
        
        setTimeout(() => {
          setShowFeedbackPage(false);
          setFeedbackSuccess(false);
        }, 2000);
        
        console.log('Feedback saved offline in IndexedDB');
      } catch (dbError) {
        console.error('Failed to save feedback offline:', dbError);
        setFeedbackError("Failed to submit feedback. Please try again.");
      }
    } finally {
      setFeedbackSubmitting(false);
    }
  };

  useEffect(() => {
    let unsubscribe: (() => void) | null = null;

    const fetchUserData = async () => {
      try {
        // Step 1: Get UID from localStorage
        const uid = localStorage.getItem("userUID") || 
                    localStorage.getItem("userPhone") || 
                    localStorage.getItem("userId") || 
                    "";
        
        console.log('🔍 User data fetch kar rahe hai, UID:', uid);

        if (!uid || uid === "N/A") {
          console.log('❌ No UID found');
          setUser({
            name: "",
            uid: "N/A",
            accountNumber: "",
            displayAccountNumber: "",
            phone: "",
            photo: "",
          });
          return;
        }

        // Step 2: Check IndexedDB FIRST (PERMANENT STORAGE)
        const cachedUser = await loadUserFromDB(uid);
        
        if (cachedUser) {
          console.log('✅ IndexedDB se data mila (PERMANENT):', {
            name: cachedUser.name,
            hasPhoto: !!cachedUser.photo,
            accountNumber: cachedUser.accountNumber
          });
          setUser(cachedUser);
        }

        // Step 3: Firebase se real-time sync (background mein)
        try {
          const userDocRef = doc(db, "users", uid);
          
          // Real-time listener for Firebase updates
          unsubscribe = onSnapshot(userDocRef, async (docSnap) => {
            if (docSnap.exists()) {
              const firebaseData = docSnap.data();
              console.log('🔥 Firebase se new data mila:', {
                name: firebaseData.name,
                hasPhoto: !!firebaseData.photo
              });
              
              // Account number set karo
              let accountNumber = firebaseData.accountId || 
                                 cachedUser?.accountNumber || 
                                 localStorage.getItem("accountNumber") || 
                                 "";
              
              if (!accountNumber) {
                const { fullAccNum } = getOrCreateAccountNumber(uid);
                accountNumber = fullAccNum;
              }
              
              const updatedUserData = {
                name: firebaseData.name || cachedUser?.name || "",
                uid: uid,
                accountNumber: accountNumber,
                displayAccountNumber: accountNumber,
                phone: firebaseData.phone || cachedUser?.phone || "",
                photo: firebaseData.photo || cachedUser?.photo || "",
              };
              
              // Check if data changed
              const hasChanged = JSON.stringify(updatedUserData) !== JSON.stringify(cachedUser);
              
              if (hasChanged) {
                console.log('🔄 Firebase mein naya data hai, IndexedDB update kar rahe hai');
                
                // IndexedDB mein update karo
                await saveUserToDB(updatedUserData);
                
                // localStorage update karo
                if (updatedUserData.name) localStorage.setItem("userName", updatedUserData.name);
                if (updatedUserData.accountNumber) localStorage.setItem("accountNumber", updatedUserData.accountNumber);
                if (updatedUserData.photo) localStorage.setItem("userPhoto", updatedUserData.photo);
                if (updatedUserData.phone) localStorage.setItem("userPhone", updatedUserData.phone);
                
                // UI update karo
                setUser(updatedUserData);
              } else {
                console.log('✅ Firebase aur IndexedDB ka data same hai');
              }
            } else {
              console.log('⚠️ Firebase mein user document nahi hai');
            }
          }, (error) => {
            console.error('❌ Firebase listener error:', error);
          });
          
        } catch (firebaseError) {
          console.warn('⚠️ Firebase sync error:', firebaseError);
        }

        // Step 4: Agar IndexedDB mein data nahi tha, to Firebase se fetch karo
        if (!cachedUser) {
          try {
            const userDocRef = doc(db, "users", uid);
            const docSnap = await getDoc(userDocRef);
            
            if (docSnap.exists()) {
              const firebaseData = docSnap.data();
              console.log('✅ Firebase se initial data mila:', firebaseData);
              
              let accountNumber = firebaseData.accountId || localStorage.getItem("accountNumber") || "";
              if (!accountNumber) {
                const { fullAccNum } = getOrCreateAccountNumber(uid);
                accountNumber = fullAccNum;
              }
              
              const userData = {
                name: firebaseData.name || localStorage.getItem("userName") || "",
                uid: uid,
                accountNumber: accountNumber,
                displayAccountNumber: accountNumber,
                phone: firebaseData.phone || localStorage.getItem("userPhone") || "",
                photo: firebaseData.photo || localStorage.getItem("userPhoto") || "",
              };
              
              // IndexedDB mein save karo (PERMANENT)
              await saveUserToDB(userData);
              
              // localStorage update karo
              if (userData.name) localStorage.setItem("userName", userData.name);
              if (userData.accountNumber) localStorage.setItem("accountNumber", userData.accountNumber);
              if (userData.photo) localStorage.setItem("userPhoto", userData.photo);
              
              setUser(userData);
            }
          } catch (error) {
            console.warn('⚠️ Firebase initial fetch error:', error);
          }
        }

      } catch (error) {
        console.error('❌ Error in fetchUserData:', error);
      }
    };

    fetchUserData();

    // Cleanup function
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, []); // Only run once when component mounts

  const handleCopyAccountNumber = () => {
    if (user.displayAccountNumber && user.displayAccountNumber !== 'N/A') {
      navigator.clipboard.writeText(user.displayAccountNumber)
      alert("ID Copied to clipboard!")
    }
  }

  const isSpecialUID = user.uid === 'HUSxSvQnabgU029dWYt1TUV04hd2' || user.uid === 'ADqW31RGBMaosOzy0HiqexKSD7h1'

  // Feedback Page View (unchanged)
  if (showFeedbackPage) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        {/* Header */}
        <div className="flex items-center p-4 bg-white border-b border-gray-200">
          <button
            onClick={() => {
              setShowFeedbackPage(false);
              setFeedbackSuccess(false);
              setFeedbackError(null);
              setSelectedType('');
              setProblemDescription('');
              setContactInfo('');
            }}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
          >
            <ArrowLeft size={24} className="text-gray-700" />
          </button>
          <h1 className="text-lg font-semibold text-gray-900 ml-3">{t.helpFeedback}</h1>
        </div>

        {/* Content */}
        <div className="flex-1 p-4 overflow-y-auto">
          <div className="max-w-md mx-auto">
            {feedbackSuccess ? (
              <div className="bg-green-50 border border-green-200 rounded-2xl p-8 text-center">
                <div className="text-4xl mb-4">✅</div>
                <h2 className="text-xl font-bold text-green-700 mb-2">Thank You!</h2>
                <p className="text-green-600">Your feedback has been submitted successfully.</p>
              </div>
            ) : (
              <form onSubmit={handleFeedbackSubmit} className="space-y-6">
                {/* Type of Issue */}
                <div>
                  <h2 className="text-base font-semibold text-gray-800 mb-3">Type of Issue</h2>
                  <div className="grid grid-cols-2 gap-3">
                    {FEEDBACK_TYPES.map((type) => (
                      <button
                        key={type.id}
                        type="button"
                        onClick={() => setSelectedType(type.id)}
                        className={`p-4 rounded-2xl border-2 transition-all cursor-pointer ${
                          selectedType === type.id
                            ? 'border-blue-500 bg-blue-50 shadow-md'
                            : 'border-gray-200 bg-white hover:border-gray-300'
                        }`}
                      >
                        <div className="text-2xl mb-1">{type.icon}</div>
                        <div className={`text-sm font-medium ${
                          selectedType === type.id ? 'text-blue-700' : 'text-gray-700'
                        }`}>
                          {type.label}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Problem Description */}
                <div>
                  <h2 className="text-base font-semibold text-gray-800 mb-3">Problem Description</h2>
                  <div className="relative">
                    <textarea
                      value={problemDescription}
                      onChange={(e) => {
                        if (e.target.value.length <= 400) {
                          setProblemDescription(e.target.value);
                        }
                      }}
                      placeholder="Describe your issue or suggestion..."
                      maxLength={400}
                      rows={5}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-2xl focus:outline-none focus:border-blue-500 transition-colors text-gray-900 placeholder-gray-400 bg-white resize-none"
                    />
                    <div className="absolute bottom-3 right-3 text-xs text-gray-400">
                      {problemDescription.length}/400
                    </div>
                  </div>
                </div>

                {/* Contact Information */}
                <div>
                  <h2 className="text-base font-semibold text-gray-800 mb-3">Contact Information</h2>
                  <input
                    type="text"
                    value={contactInfo}
                    onChange={(e) => setContactInfo(e.target.value)}
                    placeholder="Enter your email, Gmail or App ID"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-2xl focus:outline-none focus:border-blue-500 transition-colors text-gray-900 placeholder-gray-400 bg-white"
                  />
                </div>

                {/* Error Message */}
                {feedbackError && (
                  <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm">
                    {feedbackError}
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={feedbackSubmitting}
                  className="w-full bg-blue-600 text-white font-semibold py-3.5 rounded-2xl transition-all hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shadow-lg shadow-blue-600/20 text-base"
                >
                  {feedbackSubmitting ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Submitting...
                    </span>
                  ) : (
                    'Submit Feedback'
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (currentView === 'language') {
    return <LanguagePage onBack={() => switchView('me')} />
  }

  if (currentView === 'customer_service') {
    return <HurrySupport onBack={() => switchView('me')} />
  }

  if (currentView === 'settings') {
    return <SettingPage onBack={() => switchView('me')} onLogout={onLogout} />
  }

  if (currentView === 'public_profile') {
    return <PublicProfile onBack={() => switchView('me')} />
  }

  return (
    <div className="w-full min-h-screen bg-white">
      {/* Profile Header */}
      <div
        className="px-4 pb-6 relative safe-top"
        style={{
          background: 'linear-gradient(to bottom, #3b82f6 0%, #eff6ff 70%, #ffffff 100%)',
          paddingTop: 'max(env(safe-area-inset-top, 0px), var(--status-bar-height, 0px), 24px)'
        }}
      >
        {/* User Card */}
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-4">
            {/* Avatar with WebGL Shader Overlay */}
            <div className="relative w-20 h-20 ml-1 shrink-0">
              {user.photo ? (
                <img
                  src={user.photo}
                  className="w-20 h-20 rounded-full object-cover border-2 border-white/60 shadow-sm"
                  alt="Profile"
                  onError={(e) => {
                    // Agar image load nahi ho to fallback dikhao
                    e.currentTarget.style.display = 'none';
                    e.currentTarget.nextElementSibling?.classList.remove('hidden');
                  }}
                />
              ) : null}
              
              {!user.photo && (
                <div className="w-20 h-20 bg-gray-600 rounded-full flex items-center justify-center text-4xl text-white font-bold border-2 border-white/60 shadow-sm">
                  {user.name ? user.name.charAt(0).toUpperCase() : "?"}
                </div>
              )}
              
              {/* WebGL Shader Overlay - FULL OVERLAP */}
              <div className="absolute inset-0 pointer-events-none">
                <WhiteColorRemovalShader
                  imageSrc="/1786867564769.png"
                  threshold={0.85}
                  className="w-full h-full"
                  style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%) scale(1.5)',
                    width: '100%',
                    height: '100%',
                  }}
                />
              </div>
            </div>

            <div className="flex flex-col">
              {/* Name */}
              <h2 className="text-2xl font-bold text-gray-900 mb-0.5">
                {user.name || "User"}
              </h2>

              {/* Account Number Display */}
              <div className="flex items-center gap-1 mt-1">
                {isSpecialUID ? (
                  <div className="relative inline-block w-22">
                    <img
                      src="/1785138451098~2.jpg"
                      alt=""
                      className="absolute inset-0 w-full h-full object-contain rounded-md"
                    />
                    <p className="relative text-white font-bold px-3 py-1.5 z-10 text-xs" style={{ paddingLeft: '30px' }}>
                      {user.accountNumber}
                    </p>
                  </div>
                ) : (
                  <p className="text-gray-700 text-xs font-semibold">
                    ID: {user.displayAccountNumber || "N/A"}
                  </p>
                )}

                {user.accountNumber && user.accountNumber !== 'N/A' && (
                  <button
                    onClick={handleCopyAccountNumber}
                    className="text-gray-600 hover:text-blue-900 transition-colors p-1 cursor-pointer"
                    title="Copy ID"
                  >
                    <Copy size={14} />
                  </button>
                )}
              </div>

              {user.phone && (
                <p className="text-gray-600 text-xs mt-0.5 font-semibold">
                  {user.phone}
                </p>
              )}
            </div>
          </div>

          {/* Top Right Arrow - View Public Profile */}
          <button
            onClick={() => switchView('public_profile')}
            className="p-2 hover:bg-white/20 rounded-full transition-colors mt-2 cursor-pointer"
            title="View Public Profile"
          >
            <ChevronRight className="text-gray-700" size={24} />
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">1</div>
            <div className="text-xs text-gray-600 mt-1">{t.followers}</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">0</div>
            <div className="text-xs text-gray-600 mt-1">{t.following}</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">1</div>
            <div className="text-xs text-gray-600 mt-1">{t.visitors}</div>
          </div>
        </div>

        {/* Banner Images */}
        <div className="flex gap-1 mt-6">
          <div className="flex-1 rounded-lg overflow-hidden">
            <img
              src="/1784480382765~2.jpg"
              alt="Feature 1"
              className="w-full h-14 object-cover"
            />
          </div>
          <div className="flex-1 rounded-lg overflow-hidden">
            <img
              src="/1784480368941~2.jpg"
              alt="Feature 2"
              className="w-full h-14 object-cover"
            />
          </div>
        </div>
      </div>

      {/* Main Menu Items */}
      <div className="px-4 mt-1">
        <div className="bg-white rounded-xl overflow-hidden shadow-sm">
          {menuItems.map((item, index) => (
            <div key={item.id}>
              <div className="flex items-center gap-4 p-4 cursor-pointer hover:bg-gray-50 transition-colors">
                <div className="w-8 h-8 flex items-center justify-center shrink-0">
                  <img
                    src={item.src}
                    alt={t[item.labelKey]}
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="flex-1">
                  <p className="font-semibold text-gray-900">{t[item.labelKey]}</p>
                </div>
                {item.action && (
                  <span className="text-sm font-medium text-gray-500">{item.action}</span>
                )}
                {item.badge && (
                  <span className="bg-blue-300 text-xs font-bold px-2 py-1 rounded-full text-gray-900">
                    {item.badge}
                  </span>
                )}
                <ChevronRight size={20} className="text-gray-400" />
              </div>
              {index < menuItems.length - 1 && (
                <div className="h-[0.5px] bg-gray-200 mx-4"></div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Menu Items */}
      <div className="px-4 mt-4 mb-6">
        <div className="bg-white rounded-xl overflow-hidden shadow-sm">
          {bottomMenuItems.map((item, index) => (
            <div
              key={item.id}
              onClick={() => {
                if (item.id === '7') switchView('language')
                if (item.id === '8') switchView('settings')
                if (item.id === '9') switchView('customer_service')
                if (item.id === '10') setShowFeedbackPage(true)
              }}
            >
              <div className="flex items-center gap-4 p-4 cursor-pointer hover:bg-gray-50 transition-colors">
                <div className="w-8 h-8 flex items-center justify-center shrink-0 text-gray-700">
                  {item.icon}
                </div>

                <div className="flex-1">
                  <p className="font-semibold text-gray-900">{t[item.labelKey]}</p>
                </div>
                {item.action && (
                  <span className="text-sm font-medium text-gray-500">{item.action}</span>
                )}
                {item.badge && (
                  <span className="bg-blue-300 text-xs font-bold px-2 py-1 rounded-full text-gray-900">
                    {item.badge}
                  </span>
                )}
                <ChevronRight size={20} className="text-gray-400" />
              </div>
              {index < bottomMenuItems.length - 1 && (
                <div className="h-[0.5px] bg-gray-200 mx-4"></div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Recharge Event Floating Card */}
      <div className="fixed bottom-24 right-4 bg-white/80 backdrop-blur-md p-2 rounded-2xl shadow-md cursor-pointer">
        <div className="text-center text-sm">
          <div className="text-2xl mb-1"></div>
          <div className="text-xs font-bold text-blue-800">Recharge</div>
          <div className="text-xs font-bold text-blue-800">Event</div>
        </div>
      </div>
    </div>
  )
}
