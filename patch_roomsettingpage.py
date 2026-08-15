import re

with open('components/RoomSettingPage.tsx', 'r') as f:
    content = f.read()

# Update RoomSettingPageProps interface
content = content.replace(
"""  roomData?: {
    roomName?: string
    roomImage?: string
    announcement?: string
    theme?: string
    admin?: string[]
    isLocked?: boolean
    micMode?: number
  }""",
"""  roomData?: {
    roomName?: string
    roomImage?: string
    announcement?: string
    theme?: string
    admin?: string[]
    isLocked?: boolean
    roomPassword?: string
    micMode?: number
  }"""
)

# Initialize password state from roomData
content = content.replace(
"""  const [password, setPassword] = useState<string>('')""",
"""  const [password, setPassword] = useState<string>('')
  const [roomPassword, setRoomPassword] = useState<string>(roomData?.roomPassword || '')"""
)

# Modify handleSetPassword to save roomPassword
content = content.replace(
"""  const handleSetPassword = () => {
    if (password.length === 4) {
      setIsLocked(true)
      setShowLockCard(false)
      setPassword('')
    }
  }""",
"""  const handleSetPassword = () => {
    if (password.length === 4) {
      setIsLocked(true)
      setRoomPassword(password)
      setShowLockCard(false)
      setPassword('')
    }
  }"""
)

# Modify handleSave to include roomPassword
content = content.replace(
"""  const handleSave = async () => {
    const settingsData = {
      roomImage,
      roomName,
      announcement,
      isLocked,
      micMode: selectedMicMode,
      theme: selectedTheme,
    }

    if (roomOwnerId && db) {
      try {
        await setDoc(doc(db, "globalRooms", roomOwnerId), {
          name: roomName,
          image: roomImage,
          announcement: announcement,
          micMode: selectedMicMode,
          theme: selectedTheme,
        }, { merge: true })""",
"""  const handleSave = async () => {
    const settingsData = {
      roomImage,
      roomName,
      announcement,
      isLocked,
      roomPassword,
      micMode: selectedMicMode,
      theme: selectedTheme,
    }

    if (roomOwnerId && db) {
      try {
        await setDoc(doc(db, "globalRooms", roomOwnerId), {
          name: roomName,
          image: roomImage,
          announcement: announcement,
          micMode: selectedMicMode,
          theme: selectedTheme,
          isLocked: isLocked,
          roomPassword: roomPassword,
        }, { merge: true })"""
)

with open('components/RoomSettingPage.tsx', 'w') as f:
    f.write(content)
