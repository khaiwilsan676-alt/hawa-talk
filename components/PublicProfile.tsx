'use client'

import React, { useEffect, useState, useRef } from 'react'
import {
  ChevronLeft,
  Edit3,
  MapPin,
  Copy,
  Camera,
  ChevronRight,
  X,
  Heart,
  MessageCircle,
  MoreHorizontal,
} from 'lucide-react'
import { supabase } from '../src/lib/supabase'
import ChatScreen from './ChatScreen'

export interface TargetUser {
  id?: string
  uid?: string
  name?: string
  displayAccountNumber?: string
  accountId?: string
  photo?: string
  image?: string
  coverPhoto?: string
  gender?: string
  age?: number | string
  followers?: number
  bio?: string
  location?: string
  country?: string
  flag?: string
}

interface PublicProfileProps {
  onBack?: () => void
  isOtherUser?: boolean
  targetUser?: TargetUser | null
}

const COUNTRIES = [
  { code: 'IN', name: 'India', flag: '🇮🇳' },
  { code: 'US', name: 'United States', flag: '🇺🇸' },
  { code: 'GB', name: 'United Kingdom', flag: '🇬🇧' },
  { code: 'CA', name: 'Canada', flag: '🇨🇦' },
  { code: 'AU', name: 'Australia', flag: '🇦🇺' },
  { code: 'AE', name: 'UAE', flag: '🇦🇪' },
  { code: 'SA', name: 'Saudi Arabia', flag: '🇸🇦' },
  { code: 'PK', name: 'Pakistan', flag: '🇵🇰' },
  { code: 'BD', name: 'Bangladesh', flag: '🇧🇩' },
  { code: 'NP', name: 'Nepal', flag: '🇳🇵' },
  { code: 'LK', name: 'Sri Lanka', flag: '🇱🇰' },
  { code: 'SG', name: 'Singapore', flag: '🇸🇬' },
  { code: 'MY', name: 'Malaysia', flag: '🇲🇾' },
  { code: 'ID', name: 'Indonesia', flag: '🇮🇩' },
  { code: 'PH', name: 'Philippines', flag: '🇵🇭' },
  { code: 'JP', name: 'Japan', flag: '🇯🇵' },
  { code: 'KR', name: 'South Korea', flag: '🇰🇷' },
  { code: 'CN', name: 'China', flag: '🇨🇳' },
  { code: 'DE', name: 'Germany', flag: '🇩🇪' },
  { code: 'FR', name: 'France', flag: '🇫🇷' },
  { code: 'IT', name: 'Italy', flag: '🇮🇹' },
  { code: 'ES', name: 'Spain', flag: '🇪🇸' },
  { code: 'BR', name: 'Brazil', flag: '🇧🇷' },
  { code: 'MX', name: 'Mexico', flag: '🇲🇽' },
  { code: 'ZA', name: 'South Africa', flag: '🇿🇦' },
  { code: 'NG', name: 'Nigeria', flag: '🇳🇬' },
  { code: 'EG', name: 'Egypt', flag: '🇪🇬' },
  { code: 'RU', name: 'Russia', flag: '🇷🇺' },
  { code: 'TR', name: 'Turkey', flag: '🇹🇷' },
  { code: 'NL', name: 'Netherlands', flag: '🇳🇱' },
]

const SPECIAL_ACCOUNTS: { [key: string]: string } = {
  HUSxSvQnabgU029dWYt1TUV04hd2: '100002',
  ADqW31RGBMaosOzy0HiqexKSD7h1: '100003',
}

const OFFICIAL_IDS = ['500001', '500002', '500003', '500004', '500005']
const ADMIN_IDS = ['700001', '700002', '700003']

const getDefaultAvatar = (gender: string): string => {
  if (gender === '♀' || gender === 'female') {
    return '/IMG_20260804_211013.jpg'
  }
  return '/IMG_20260804_211031.jpg'
}

const compressImage = (
  file: File,
  maxWidth: number,
  maxHeight: number,
  quality: number
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = (event) => {
      const img = new Image()
      img.src = event.target?.result as string
      img.onload = () => {
        const canvas = document.createElement('canvas')
        let width = img.width
        let height = img.height

        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width)
            width = maxWidth
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height)
            height = maxHeight
          }
        }

        canvas.width = width
        canvas.height = height

        const ctx = canvas.getContext('2d')
        ctx?.drawImage(img, 0, 0, width, height)
        resolve(canvas.toDataURL('image/jpeg', quality))
      }
      img.onerror = (error) => reject(error)
    }
    reader.onerror = (error) => reject(error)
  })
}

export default function PublicProfile({
  onBack,
  isOtherUser = false,
  targetUser = null,
}: PublicProfileProps) {
  const avatarInputRef = useRef<HTMLInputElement>(null)
  const albumInputRef = useRef<HTMLInputElement>(null)
  const coverInputRef = useRef<HTMLInputElement>(null)

  const [user, setUser] = useState({
    name: 'Hurry User',
    uid: '',
    displayAccountNumber: '10037962',
    photo: '',
    coverPhoto: '',
    gender: '♂',
    age: 24,
    followers: 0,
    bio: '',
    location: 'India',
    flag: '🇮🇳',
    countryCode: 'IN',
  })

  const [albumImages, setAlbumImages] = useState<string[]>([])
  const [showEditSheet, setShowEditSheet] = useState(false)
  const [editName, setEditName] = useState('')
  const [editAge, setEditAge] = useState('')
  const [editBio, setEditBio] = useState('')
  const [editGender, setEditGender] = useState('')
  const [genderLocked, setGenderLocked] = useState(false)
  const [editCountry, setEditCountry] = useState('India')
  const [editCountryCode, setEditCountryCode] = useState('IN')
  const [countryLocked, setCountryLocked] = useState(false)
  const [showBioInput, setShowBioInput] = useState(false)
  const [activeTab, setActiveTab] = useState('profile')
  const [fullImageView, setFullImageView] = useState<string | null>(null)
  const [isFollowing, setIsFollowing] = useState(false)
  const [showThreeDotMenu, setShowThreeDotMenu] = useState(false)
  const [showChat, setShowChat] = useState(false)

  const isSpecialAccount = SPECIAL_ACCOUNTS.hasOwnProperty(user.uid || '')

  // Force Mobile Viewport
  useEffect(() => {
    let meta = document.querySelector('meta[name="viewport"]') as HTMLMetaElement
    if (!meta) {
      meta = document.createElement('meta')
      meta.name = 'viewport'
      document.head.appendChild(meta)
    }
    meta.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover')

    document.documentElement.style.setProperty('max-width', '480px')
    document.documentElement.style.setProperty('margin', '0 auto')
    document.body.style.setProperty('max-width', '480px')
    document.body.style.setProperty('margin', '0 auto')
    document.body.style.setProperty('overflow-x', 'hidden')
  }, [])

  const saveToSupabase = async (updateData: Record<string, any>) => {
    const currentUid =
      user.uid || localStorage.getItem('userUID') || localStorage.getItem('userPhone')
    if (currentUid && currentUid !== 'N/A') {
      try {
        // Update users table
        const { error: userError } = await supabase
          .from('users')
          .upsert({ id: currentUid, ...updateData }, { onConflict: 'id' })

        if (userError) throw userError

        // Update global_rooms table
        const { error: roomError } = await supabase
          .from('global_rooms')
          .upsert({ id: currentUid, ...updateData }, { onConflict: 'id' })

        if (roomError) throw roomError
      } catch (err) {
        console.error('Error saving data to Supabase:', err)
      }
    }
  }

  useEffect(() => {
    let subscription: any

    const loadProfileData = async () => {
      if (isOtherUser && targetUser) {
        const targetUid = targetUser.uid || targetUser.id || 'N/A'

        let displayAccNum = targetUser.displayAccountNumber || targetUser.accountId || ''
        let initialName = targetUser.name || 'User'
        let photo = targetUser.photo || targetUser.image || ''
        let coverPhoto = targetUser.coverPhoto || ''
        let bio = targetUser.bio || ''
        let country = targetUser.country || targetUser.location || 'India'
        let countryCode = targetUser.countryCode || 'IN'
        let gender = targetUser.gender || '♂'
        let age = targetUser.age
          ? typeof targetUser.age === 'number'
            ? targetUser.age
            : parseInt(targetUser.age)
          : 22
        let followers = targetUser.followers || 0
        let album: string[] = []

        if (targetUid && targetUid !== 'N/A') {
          try {
            // Direct Supabase fetch
            const { data: supabaseData } = await supabase
              .from('users')
              .select('*')
              .eq('id', targetUid)
              .single()

            if (supabaseData) {
              // ID from Supabase (8 digits)
              displayAccNum = supabaseData.account_id
                ? String(supabaseData.account_id).slice(0, 8)
                : displayAccNum

              initialName = supabaseData.name || initialName
              photo = supabaseData.avatar_url || supabaseData.photo || photo
              coverPhoto = supabaseData.cover_photo || coverPhoto
              bio = supabaseData.bio || bio
              country = supabaseData.country || country
              countryCode = supabaseData.country_code || countryCode
              gender = supabaseData.gender || gender
              age = supabaseData.age ? parseInt(supabaseData.age) : age
              followers = supabaseData.followers !== undefined ? supabaseData.followers : followers

              if (supabaseData.album_images && Array.isArray(supabaseData.album_images)) {
                album = supabaseData.album_images
              }
            }

            // Real-time subscription
            subscription = supabase
              .channel(`public_profile_${targetUid}`)
              .on('postgres_changes',
                {
                  event: '*',
                  schema: 'public',
                  table: 'users',
                  filter: `id=eq.${targetUid}`
                },
                (payload) => {
                  const data = payload.new
                  if (data) {
                    displayAccNum = data.account_id
                      ? String(data.account_id).slice(0, 8)
                      : displayAccNum

                    const finalName = data.name || initialName
                    photo = data.avatar_url || data.photo || photo
                    coverPhoto = data.cover_photo || coverPhoto
                    bio = data.bio || bio
                    country = data.country || country
                    countryCode = data.country_code || countryCode
                    gender = data.gender || gender
                    age = data.age ? parseInt(data.age) : age
                    followers = data.followers !== undefined ? data.followers : followers

                    if (data.album_images && Array.isArray(data.album_images)) {
                      album = data.album_images
                    }

                    const matchedCountry = COUNTRIES.find(
                      (c) =>
                        c.code === countryCode || c.name === country || c.flag === country
                    ) || { name: 'India', flag: '🇮🇳', code: 'IN' }

                    setAlbumImages(album)
                    setUser({
                      name: finalName,
                      uid: targetUid,
                      displayAccountNumber: displayAccNum,
                      photo,
                      coverPhoto,
                      gender: gender === 'female' || gender === '♀' ? '♀' : '♂',
                      age,
                      followers,
                      bio,
                      location: matchedCountry.name,
                      flag: matchedCountry.flag,
                      countryCode: matchedCountry.code,
                    })
                  }
                }
              )
              .subscribe()

            // Set initial state
            const matchedCountry = COUNTRIES.find(
              (c) =>
                c.code === countryCode || c.name === country || c.flag === country
            ) || { name: 'India', flag: '🇮🇳', code: 'IN' }

            setAlbumImages(album)
            setUser({
              name: initialName,
              uid: targetUid,
              displayAccountNumber: displayAccNum,
              photo,
              coverPhoto,
              gender: gender === 'female' || gender === '♀' ? '♀' : '♂',
              age,
              followers,
              bio,
              location: matchedCountry.name,
              flag: matchedCountry.flag,
              countryCode: matchedCountry.code,
            })
          } catch (err) {
            console.warn('Supabase fetch error for Target User:', err)
          }
        }
        return
      }

      // For current user - ID from localStorage (MePage se aaygi)
      const uid =
        localStorage.getItem('userUID') || localStorage.getItem('userPhone') || 'N/A'
      
      let storedName = localStorage.getItem('userName') || ''
      let photo = localStorage.getItem('userPhoto') || ''
      let coverPhoto = localStorage.getItem('userCoverPhoto') || ''
      let storedBio = localStorage.getItem('userBio') || ''
      let storedCountry = localStorage.getItem('userCountry') || '🇮🇳'
      let storedCountryCode = localStorage.getItem('userCountryCode') || 'IN'
      let storedAge = localStorage.getItem('userAge') || '24'
      let storedGender =
        localStorage.getItem('userGender') ||
        localStorage.getItem('userGenderLocked') ||
        ''
      let isCountryLockedInStorage =
        localStorage.getItem('userCountryLocked') === 'true' ||
        localStorage.getItem('setupComplete') === 'true'

      const storedAlbum = localStorage.getItem('userAlbumImages')
      if (storedAlbum) {
        setAlbumImages(JSON.parse(storedAlbum))
      }

      // ID from localStorage (MePage ne set kiya hai)
      let displayAccNum = localStorage.getItem('accountNumber') || 
                          localStorage.getItem(`user_account_number_${uid}`) || 
                          '10037962'

      if (uid && uid !== 'N/A') {
        try {
          // Supabase se fresh data fetch karo
          const { data: supabaseData } = await supabase
            .from('users')
            .select('*')
            .eq('id', uid)
            .single()

          if (supabaseData) {
            if (supabaseData.account_id) {
              displayAccNum = String(supabaseData.account_id).slice(0, 8)
              localStorage.setItem('accountNumber', displayAccNum)
              localStorage.setItem(`user_account_number_${uid}`, displayAccNum)
            }
            if (supabaseData.name) {
              storedName = supabaseData.name
              localStorage.setItem('userName', storedName)
            }
            if (supabaseData.avatar_url) {
              photo = supabaseData.avatar_url
              localStorage.setItem('userPhoto', photo)
            } else if (supabaseData.photo) {
              photo = supabaseData.photo
              localStorage.setItem('userPhoto', photo)
            }
            if (supabaseData.cover_photo) {
              coverPhoto = supabaseData.cover_photo
              localStorage.setItem('userCoverPhoto', coverPhoto)
            }
            if (supabaseData.bio) {
              storedBio = supabaseData.bio
              localStorage.setItem('userBio', storedBio)
            }
            if (supabaseData.country) {
              storedCountry = supabaseData.country
              localStorage.setItem('userCountry', storedCountry)
            }
            if (supabaseData.country_code) {
              storedCountryCode = supabaseData.country_code
              localStorage.setItem('userCountryCode', storedCountryCode)
            }
            if (supabaseData.gender) {
              storedGender = supabaseData.gender
              localStorage.setItem('userGender', storedGender)
            }
            if (supabaseData.age) {
              storedAge = String(supabaseData.age)
              localStorage.setItem('userAge', storedAge)
            }
            if (supabaseData.album_images && Array.isArray(supabaseData.album_images)) {
              setAlbumImages(supabaseData.album_images)
              localStorage.setItem('userAlbumImages', JSON.stringify(supabaseData.album_images))
            }
          }

          // Real-time subscription
          subscription = supabase
            .channel(`public_profile_own_${uid}`)
            .on('postgres_changes',
              {
                event: '*',
                schema: 'public',
                table: 'users',
                filter: `id=eq.${uid}`
              },
              (payload) => {
                const data = payload.new
                if (data) {
                  if (data.account_id) {
                    displayAccNum = String(data.account_id).slice(0, 8)
                    localStorage.setItem('accountNumber', displayAccNum)
                  }
                  if (data.name) {
                    storedName = data.name
                    localStorage.setItem('userName', storedName)
                  }
                  if (data.avatar_url) {
                    photo = data.avatar_url
                    localStorage.setItem('userPhoto', photo)
                  }
                  if (data.cover_photo) {
                    coverPhoto = data.cover_photo
                    localStorage.setItem('userCoverPhoto', coverPhoto)
                  }
                  if (data.bio) {
                    storedBio = data.bio
                    localStorage.setItem('userBio', storedBio)
                  }

                  const matchedCountry = COUNTRIES.find(
                    (c) =>
                      c.code === storedCountryCode ||
                      c.flag === storedCountry ||
                      c.name === storedCountry
                  ) || { name: 'India', flag: '🇮🇳', code: 'IN' }

                  setUser({
                    name: storedName || 'Hurry User',
                    uid: uid,
                    displayAccountNumber: displayAccNum,
                    photo,
                    coverPhoto,
                    bio: storedBio,
                    location: matchedCountry.name,
                    flag: matchedCountry.flag,
                    countryCode: matchedCountry.code,
                    gender: storedGender === 'female' || storedGender === '♀' ? '♀' : '♂',
                    age: storedAge ? parseInt(storedAge) : 24,
                    followers: data.followers || 0,
                  })
                }
              }
            )
            .subscribe()
        } catch (err) {
          console.warn('Supabase fetch error in PublicProfile:', err)
        }
      }

      // Set initial state from localStorage
      const matchedCountry = COUNTRIES.find(
        (c) =>
          c.code === storedCountryCode ||
          c.flag === storedCountry ||
          c.name === storedCountry
      ) || { name: 'India', flag: '🇮🇳', code: 'IN' }

      setUser({
        name: storedName || 'Hurry User',
        uid: uid,
        displayAccountNumber: displayAccNum,
        photo,
        coverPhoto,
        bio: storedBio,
        location: matchedCountry.name,
        flag: matchedCountry.flag,
        countryCode: matchedCountry.code,
        gender: storedGender === 'female' || storedGender === '♀' ? '♀' : '♂',
        age: storedAge ? parseInt(storedAge) : 24,
        followers: 0,
      })

      setEditName(storedName || 'Hurry User')
      setEditAge(storedAge || '24')
      setEditBio(storedBio || '')
      setEditCountry(matchedCountry.name)
      setEditCountryCode(matchedCountry.code)
      setCountryLocked(isCountryLockedInStorage)

      if (storedGender) {
        setEditGender(
          storedGender === 'female' || storedGender === '♀' ? 'female' : 'male'
        )
        setGenderLocked(true)
      }
    }

    loadProfileData()

    return () => {
      if (subscription) {
        supabase.removeChannel(subscription)
      }
    }
  }, [isOtherUser, targetUser])

  const handleCopyID = () => {
    if (user.displayAccountNumber && user.displayAccountNumber !== 'N/A') {
      navigator.clipboard.writeText(user.displayAccountNumber)
      alert('ID Copied!')
    }
  }

  const handleOpenEditSheet = () => {
    if (isOtherUser) return
    setEditName(user.name)
    setEditAge(user.age.toString())
    setEditBio(user.bio)
    setEditCountry(user.location || 'India')
    setEditCountryCode(user.countryCode || 'IN')
    setShowEditSheet(true)
  }

  const handleCloseEditSheet = () => {
    setShowEditSheet(false)
    setShowBioInput(false)
  }

  const handleGenderSelect = async (gender: string) => {
    if (genderLocked) return
    setEditGender(gender)
    setGenderLocked(true)
    const formattedGender = gender === 'male' ? '♂' : '♀'
    localStorage.setItem('userGender', gender)
    localStorage.setItem('userGenderLocked', gender)
    setUser((prev) => ({ ...prev, gender: formattedGender }))

    await saveToSupabase({ gender: formattedGender })
  }

  const handleCountrySelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (countryLocked) return
    const selectedCountryName = e.target.value
    const matchedCountry = COUNTRIES.find((c) => c.name === selectedCountryName)
    setEditCountry(selectedCountryName)
    if (matchedCountry) {
      setEditCountryCode(matchedCountry.code)
    }
  }

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      try {
        const compressedBase64 = await compressImage(file, 300, 300, 0.7)
        localStorage.setItem('userPhoto', compressedBase64)
        setUser((prev) => ({ ...prev, photo: compressedBase64 }))

        await saveToSupabase({
          photo: compressedBase64,
          avatar_url: compressedBase64,
        })
      } catch (err) {
        console.error('Avatar compression error:', err)
      }
    }
  }

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      try {
        const compressedBase64 = await compressImage(file, 800, 400, 0.7)
        localStorage.setItem('userCoverPhoto', compressedBase64)
        setUser((prev) => ({ ...prev, coverPhoto: compressedBase64 }))

        await saveToSupabase({
          cover_photo: compressedBase64,
        })
      } catch (err) {
        console.error('Cover compression error:', err)
      }
    }
  }

  const handleRemoveCoverPhoto = async () => {
    localStorage.removeItem('userCoverPhoto')
    setUser((prev) => ({ ...prev, coverPhoto: '' }))
    await saveToSupabase({ cover_photo: '' })
  }

  const handleAlbumUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (albumImages.length >= 4) {
        alert('You can only upload up to 4 images in the album.')
        return
      }
      try {
        const compressedBase64 = await compressImage(file, 600, 600, 0.7)
        const updatedAlbum = [...albumImages, compressedBase64]
        setAlbumImages(updatedAlbum)
        localStorage.setItem('userAlbumImages', JSON.stringify(updatedAlbum))

        await saveToSupabase({ album_images: updatedAlbum })
      } catch (err) {
        console.error('Album image compression error:', err)
      }
    }
  }

  const handleRemoveAlbumImage = async (indexToRemove: number) => {
    const updated = albumImages.filter((_, index) => index !== indexToRemove)
    setAlbumImages(updated)
    localStorage.setItem('userAlbumImages', JSON.stringify(updated))
    await saveToSupabase({ album_images: updated })
  }

  const handleSaveEdit = async () => {
    localStorage.setItem('userName', editName)
    if (editAge) localStorage.setItem('userAge', editAge)
    if (editBio) localStorage.setItem('userBio', editBio)

    if (editCountry && editCountryCode) {
      localStorage.setItem('userCountry', editCountry)
      localStorage.setItem('userCountryCode', editCountryCode)
      localStorage.setItem('userCountryLocked', 'true')
      setCountryLocked(true)
    }

    const matchedCountry = COUNTRIES.find(
      (c) => c.name === editCountry || c.code === editCountryCode
    ) || { name: 'India', flag: '🇮🇳', code: 'IN' }

    setUser((prev) => ({
      ...prev,
      name: editName,
      age: parseInt(editAge) || prev.age,
      bio: editBio,
      location: matchedCountry.name,
      flag: matchedCountry.flag,
      countryCode: matchedCountry.code,
    }))

    await saveToSupabase({
      name: editName,
      age: parseInt(editAge) || user.age,
      bio: editBio,
      country: matchedCountry.flag,
      country_code: matchedCountry.code,
      location: matchedCountry.name,
      country_locked: true,
    })

    setShowEditSheet(false)
    setShowBioInput(false)
  }

  const handleBioSave = async () => {
    localStorage.setItem('userBio', editBio)
    setUser((prev) => ({ ...prev, bio: editBio }))
    setShowBioInput(false)
    await saveToSupabase({ bio: editBio })
  }

  const getDisplayID = () => {
    return user.displayAccountNumber
  }

  const handleToggleFollow = () => {
    setIsFollowing((prev) => {
      const nextState = !prev
      setUser((u) => ({
        ...u,
        followers: nextState ? u.followers + 1 : Math.max(0, u.followers - 1),
      }))
      return nextState
    })
  }

  const getCurrentUserData = () => {
    const uid =
      user.uid || localStorage.getItem('userUID') || localStorage.getItem('userPhone') || 'N/A'
    const name = user.name || localStorage.getItem('userName') || 'Me'
    const photo = user.photo || localStorage.getItem('userPhoto') || ''
    return { uid, name, photo }
  }

  return (
    <div
      className={`w-full bg-white min-h-screen text-gray-900 relative ${
        isOtherUser ? 'pb-24' : 'pb-10'
      }`}
      style={{ maxWidth: '480px', margin: '0 auto' }}
    >
      {/* Cover Image & Header Section */}
      <div className="relative w-full h-[340px] bg-gray-800">
        {user.coverPhoto ? (
          <img src={user.coverPhoto} alt="" className="w-full h-full object-cover" />
        ) : user.photo ? (
          <img src={user.photo} alt="" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gray-800 flex items-center justify-center text-white text-4xl font-bold">
            {user.name.charAt(0).toUpperCase()}
          </div>
        )}

        <div className="absolute top-4 left-0 right-0 px-4 flex items-center justify-between z-10">
          <button onClick={onBack} className="text-white">
            <ChevronLeft size={28} />
          </button>

          {isOtherUser ? (
            <div className="relative">
              <button
                onClick={() => setShowThreeDotMenu(!showThreeDotMenu)}
                className="text-white"
              >
                <MoreHorizontal size={24} />
              </button>

              {showThreeDotMenu && (
                <div className="absolute right-0 top-8 bg-white rounded-xl shadow-lg py-2 w-48 z-50">
                  <button
                    onClick={() => {
                      setShowThreeDotMenu(false)
                      alert('Report user')
                    }}
                    className="w-full text-left px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors"
                  >
                    Report
                  </button>
                  <button
                    onClick={() => {
                      setShowThreeDotMenu(false)
                      alert('Block user')
                    }}
                    className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Block
                  </button>
                  <button
                    onClick={() => {
                      setShowThreeDotMenu(false)
                      alert('Share profile')
                    }}
                    className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Share Profile
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button onClick={handleOpenEditSheet} className="text-white">
              <Edit3 size={22} />
            </button>
          )}
        </div>

        <div className="absolute top-16 right-4 bg-emerald-500/90 text-white text-xs px-2.5 py-1 rounded-full flex items-center gap-1.5 font-medium shadow-sm">
          <span className="w-2 h-2 rounded-full bg-white animate-pulse"></span> Online
        </div>

        {/* Avatar */}
        <div className="absolute bottom-2 left-6 flex items-center">
          <div className="w-24 h-24 rounded-full shadow-lg overflow-hidden border-3 border-white bg-gray-700">
            {user.photo ? (
              <img src={user.photo} alt="" className="w-full h-full object-cover" />
            ) : (
              <img
                src={getDefaultAvatar(user.gender)}
                alt=""
                className="w-full h-full object-cover"
              />
            )}
          </div>
        </div>
      </div>

      {/* Profile Info Details Section */}
      <div className="px-5 pt-5">
        <div className="flex flex-wrap items-center gap-0.5">
          <h1 className="text-2xl font-bold text-black tracking-wide">{user.name}</h1>
          <span className="bg-blue-500 text-white text-xs px-2 py-0.5 rounded-full font-bold inline-flex items-center gap-0.5 whitespace-nowrap">
            {user.gender} {user.age}
          </span>
          <img src="/1785131462125.png" alt="" className="h-9 w-auto object-contain" />
          <img src="/1785131792693.png" alt="" className="h-9 w-auto object-contain" />
          <img src="/1785469775751.png" alt="" className="h-7 w-auto object-contain" />
          <img src="/1785469365805.png" alt="" className="h-7 w-auto object-contain" />
        </div>

        <div className="flex items-center gap-1 text-xs mt-0.5 font-medium">
          <div className="flex items-center gap-1">
            {isSpecialAccount ? (
              <>
                <span
                  className="relative font-bold rounded text-white -ml-2.5"
                  style={{
                    backgroundImage: 'url(/1785137282040.png)',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    minWidth: '90px',
                    paddingLeft: '0px',
                    paddingRight: '5px',
                    paddingTop: '2px',
                    paddingBottom: '2px',
                  }}
                >
                  <span className="relative text-xs" style={{ paddingLeft: '32px' }}>
                    {user.displayAccountNumber}
                  </span>
                </span>
                <button onClick={handleCopyID} className="text-gray-400 hover:text-gray-600">
                  <Copy size={12} />
                </button>
              </>
            ) : (
              <>
                <span className="text-gray-500">ID:{getDisplayID()}</span>
                <button onClick={handleCopyID} className="text-gray-400 hover:text-gray-600">
                  <Copy size={12} />
                </button>
              </>
            )}
          </div>
          <span className="text-gray-300">|</span>
          <span className="text-gray-500">{user.followers} Fans</span>
        </div>

        <div className="mt-1 flex items-center gap-1 -ml-2">
          <div className="relative inline-flex items-center justify-center ml-0.5">
            <img src="/1785137410522.png" alt="" className="h-6 w-auto object-contain" />
            <span
              className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-white drop-shadow-sm"
              style={{ paddingLeft: '10px' }}
            >
              Lv.1
            </span>
          </div>
          <img src="/1785486414756.png" alt="" className="h-6 w-auto object-contain" />
        </div>

        <div className="flex items-center gap-1.5 text-xs text-gray-600 mt-3">
          <MapPin size={14} className="text-gray-400" />
          <span className="text-base">{user.flag}</span>
          <span className="text-gray-500">{user.location || 'India'}</span>
        </div>

        {/* Bio Section */}
        <div className="flex items-start gap-2 mt-2">
          <button
            onClick={!isOtherUser ? handleOpenEditSheet : undefined}
            className={`mt-0.5 shrink-0 ${isOtherUser ? 'text-gray-400' : 'text-gray-400 hover:text-gray-600'}`}
          >
            <Edit3 size={14} />
          </button>
          {user.bio ? (
            <p className="text-xs text-gray-500 italic">{user.bio}</p>
          ) : (
            <p className="text-xs text-gray-400 italic">
              {isOtherUser ? 'No bio added yet' : 'Add bio...'}
            </p>
          )}
        </div>

        <div className="flex gap-0 mt-4 border-b border-gray-200">
          <button
            onClick={() => setActiveTab('profile')}
            className={`px-6 py-2 text-sm font-semibold transition-colors relative ${
              activeTab === 'profile' ? 'text-blue-500' : 'text-gray-500'
            }`}
          >
            Profile
            {activeTab === 'profile' && (
              <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-4 h-1 bg-blue-500 rounded-full"></div>
            )}
          </button>
        </div>
      </div>

      {/* Content Tabs Section */}
      <div className="px-5 mt-6 space-y-4">
        <div>
          <h3 className="text-sm font-bold text-gray-800 mb-2 flex justify-between items-center">
            Albums
            <span className="text-xs text-gray-400 font-normal">{albumImages.length}/4</span>
          </h3>
          {albumImages.length > 0 ? (
            <div className="flex gap-2 overflow-x-auto">
              {albumImages.map((img, index) => (
                <div
                  key={index}
                  className="w-20 h-20 rounded-xl overflow-hidden bg-gray-100 shrink-0 cursor-pointer hover:opacity-90 transition-opacity"
                  onClick={() => setFullImageView(img)}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          ) : (
            <div className="w-full h-28 rounded-2xl overflow-hidden bg-gray-100">
              <img
                src="/IMG_20260726_225835.jpg"
                alt=""
                className="w-full h-full object-cover"
              />
            </div>
          )}
        </div>

        <div>
          <h3 className="text-sm font-bold text-gray-800 mb-2">Vehicle</h3>
          <div className="w-full h-28 rounded-2xl overflow-hidden">
            <img src="/1785091443553.png" alt="" className="w-full h-full object-cover" />
          </div>
        </div>

        <div>
          <h3 className="text-sm font-bold text-gray-800 mb-2">Medal</h3>
          <div className="w-full h-28 rounded-2xl overflow-hidden">
            <img src="/1785091431545.png" alt="" className="w-full h-full object-cover" />
          </div>
        </div>

        <div>
          <h3 className="text-sm font-bold text-gray-800 mb-2">Frame</h3>
          <div className="w-full h-28 rounded-2xl overflow-hidden">
            <img src="/1785091457562.png" alt="" className="w-full h-full object-cover" />
          </div>
        </div>

        <div>
          <h3 className="text-sm font-bold text-gray-800 mb-2">Gift</h3>
          <div className="w-full h-28 rounded-2xl overflow-hidden">
            <img src="/1785091520912.png" alt="" className="w-full h-full object-cover" />
          </div>
        </div>
      </div>

      {/* Bottom Action Bar for Other User */}
      {isOtherUser && (
        <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md px-6 py-3.5 border-t border-gray-100 flex items-center justify-between gap-4 max-w-md mx-auto shadow-lg">
          <button
            onClick={handleToggleFollow}
            className="flex-1 h-12 rounded-2xl bg-gradient-to-r from-[#ff5874] to-[#ff6b8b] active:scale-95 transition-all duration-200 flex items-center justify-center gap-2 text-white font-medium text-lg shadow-md shadow-pink-200"
          >
            <Heart className="w-6 h-6 fill-white stroke-none" />
            <span>{isFollowing ? 'Following' : 'Follow'}</span>
          </button>

          <button
            onClick={() => setShowChat(true)}
            className="flex-1 h-12 rounded-2xl bg-gradient-to-r from-[#1dc4e9] to-[#1de9b6] active:scale-95 transition-all duration-200 flex items-center justify-center gap-2 text-white font-medium text-lg shadow-md shadow-cyan-200"
          >
            <MessageCircle className="w-6 h-6 fill-white stroke-none" />
            <span>Chat</span>
          </button>
        </div>
      )}

      {/* Full Image View Modal */}
      {fullImageView && (
        <div
          className="fixed inset-0 z-[60] bg-black/90 flex items-center justify-center p-4"
          onClick={() => setFullImageView(null)}
        >
          <button
            onClick={() => setFullImageView(null)}
            className="absolute top-4 right-4 text-white bg-black/50 rounded-full p-2 hover:bg-black/70 transition-colors"
          >
            <X size={24} />
          </button>
          <img
            src={fullImageView}
            alt=""
            className="max-w-full max-h-[90vh] object-contain rounded-lg"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}

      {/* Edit Profile Bottom Sheet */}
      {!isOtherUser && showEditSheet && (
        <div className="fixed inset-0 z-50 flex items-end justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={handleCloseEditSheet}></div>

          <div className="relative bg-white w-full max-w-md rounded-t-3xl animate-slide-up flex flex-col h-[70vh]">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 shrink-0">
              <button onClick={handleCloseEditSheet}>
                <ChevronLeft size={24} className="text-gray-700" />
              </button>
              <h2 className="text-lg font-bold text-gray-900">Edit Information</h2>
              <div className="w-6"></div>
            </div>

            <div className="overflow-y-auto px-5 py-4 space-y-5 flex-1 pb-24">
              <input
                type="file"
                ref={avatarInputRef}
                accept="image/*"
                onChange={handleAvatarUpload}
                className="hidden"
              />
              <input
                type="file"
                ref={albumInputRef}
                accept="image/*"
                onChange={handleAlbumUpload}
                className="hidden"
              />
              <input
                type="file"
                ref={coverInputRef}
                accept="image/*"
                onChange={handleCoverUpload}
                className="hidden"
              />

              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Avatar</span>
                <div
                  onClick={() => avatarInputRef.current?.click()}
                  className="w-14 h-14 rounded-full overflow-hidden bg-gray-200 border-2 border-gray-300 cursor-pointer"
                >
                  {user.photo ? (
                    <img src={user.photo} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <img
                      src={getDefaultAvatar(user.gender)}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Background Cover</span>
                  <div className="flex items-center gap-2">
                    {user.coverPhoto && (
                      <button
                        onClick={handleRemoveCoverPhoto}
                        className="px-2 py-1 rounded-lg bg-red-50 text-red-500 text-xs font-semibold hover:bg-red-100 transition-colors"
                      >
                        Remove
                      </button>
                    )}
                    <button
                      onClick={() => coverInputRef.current?.click()}
                      className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-50 text-blue-600 text-xs font-semibold hover:bg-blue-100 transition-colors"
                    >
                      <Camera size={14} /> Add Photo
                    </button>
                  </div>
                </div>
                {user.coverPhoto && (
                  <div className="w-full h-20 rounded-xl overflow-hidden border border-gray-200">
                    <img
                      src={user.coverPhoto}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">
                    Album Photos ({albumImages.length}/4)
                  </span>
                  {albumImages.length < 4 && (
                    <button
                      onClick={() => albumInputRef.current?.click()}
                      className="px-3 py-1.5 rounded-lg bg-blue-50 text-blue-600 text-xs font-semibold flex items-center gap-1 hover:bg-blue-100 transition-colors"
                    >
                      <Camera size={14} /> Add Photo
                    </button>
                  )}
                </div>

                {albumImages.length > 0 && (
                  <div className="grid grid-cols-4 gap-2 pt-1">
                    {albumImages.map((img, idx) => (
                      <div
                        key={idx}
                        className="relative w-full h-16 rounded-xl overflow-hidden border border-gray-200 group"
                      >
                        <img src={img} alt="" className="w-full h-full object-cover" />
                        <button
                          onClick={() => handleRemoveAlbumImage(idx)}
                          className="absolute top-1 right-1 bg-black/60 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600 transition-colors shadow"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Name</span>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="text-sm text-gray-900 text-right bg-transparent border-b border-gray-200 focus:border-blue-500 outline-none px-2 py-1 w-48"
                  placeholder="Enter name"
                />
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Age</span>
                <input
                  type="number"
                  value={editAge}
                  onChange={(e) => setEditAge(e.target.value)}
                  className="text-sm text-gray-900 text-right bg-transparent border-b border-gray-200 focus:border-blue-500 outline-none px-2 py-1 w-48"
                  placeholder="0"
                  min="0"
                  max="150"
                />
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Bio</span>
                {showBioInput ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={editBio}
                      onChange={(e) => setEditBio(e.target.value)}
                      className="text-sm text-gray-900 text-right bg-transparent border-b border-gray-200 focus:border-blue-500 outline-none px-2 py-1 w-36"
                      placeholder="Add bio"
                      autoFocus
                    />
                    <button
                      onClick={handleBioSave}
                      className="text-xs text-blue-500 font-medium"
                    >
                      Save
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowBioInput(true)}
                    className="flex items-center gap-1 text-sm text-gray-400"
                  >
                    <span className="max-w-[180px] truncate">
                      {editBio || 'Add bio'}
                    </span>
                    <ChevronRight size={16} />
                  </button>
                )}
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Country</span>
                <select
                  value={editCountry}
                  onChange={handleCountrySelect}
                  disabled={countryLocked}
                  className={`text-sm text-right outline-none px-2 py-1 bg-transparent border-b w-48 ${
                    countryLocked
                      ? 'text-gray-400 border-transparent cursor-not-allowed'
                      : 'text-gray-900 border-gray-200 focus:border-blue-500'
                  }`}
                >
                  {COUNTRIES.map((c) => (
                    <option key={c.code} value={c.name}>
                      {c.flag} {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Gender</span>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleGenderSelect('male')}
                    disabled={genderLocked && editGender !== 'male'}
                    className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all ${
                      editGender === 'male'
                        ? 'bg-blue-500 text-white'
                        : genderLocked
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    ♂ Male
                  </button>
                  <button
                    onClick={() => handleGenderSelect('female')}
                    disabled={genderLocked && editGender !== 'female'}
                    className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all ${
                      editGender === 'female'
                        ? 'bg-pink-500 text-white'
                        : genderLocked
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    ♀ Female
                  </button>
                </div>
              </div>
            </div>

            <div className="absolute bottom-0 left-0 right-0 px-5 py-4 bg-white border-t border-gray-100 shrink-0">
              <button
                onClick={handleSaveEdit}
                className="w-full bg-blue-500 text-white py-3 rounded-xl font-semibold hover:bg-blue-600 transition-colors"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ChatScreen Overlay */}
      {isOtherUser && showChat && targetUser && (
        <ChatScreen
          currentUser={getCurrentUserData()}
          targetUser={{
            uid: targetUser.uid || targetUser.id || '',
            name: targetUser.name || 'User',
            photo: targetUser.photo || targetUser.image || '',
          }}
          onClose={() => setShowChat(false)}
        />
      )}

      <style jsx>{`
        @keyframes slideUp {
          from {
            transform: translateY(100%);
          }
          to {
            transform: translateY(0);
          }
        }
        .animate-slide-up {
          animation: slideUp 0.3s ease-out;
        }
      `}</style>
    </div>
  )
                                      }
