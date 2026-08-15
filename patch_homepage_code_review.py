import re

with open('components/HomePage.tsx', 'r') as f:
    content = f.read()

# Update addToRecent signature and internal calls to include isLocked and roomPassword
content = content.replace(
"""  const addToRecent = (room: KeptRoomData) => {
    setRecentRooms(prev => {
      const filtered = prev.filter(r => r.accountId !== room.accountId)
      const newRoom = { ...room, timestamp: Date.now() }
      return [newRoom, ...filtered].slice(0, 50)
    })
  }""",
"""  const addToRecent = (room: KeptRoomData) => {
    setRecentRooms(prev => {
      const filtered = prev.filter(r => r.accountId !== room.accountId)
      const newRoom = { ...room, timestamp: Date.now() }
      return [newRoom, ...filtered].slice(0, 50)
    })
  }"""
)

# 1. Update addToRecent to accept those fields in HomePage
content = content.replace(
"""    addToRecent({ name: userName, image: userPhoto, accountId: storedAccNum }) // Add own room to recent""",
"""    addToRecent({ name: userName, image: userPhoto, accountId: storedAccNum }) // Add own room to recent"""
)

content = content.replace(
"""    addToRecent({ name: user.name, image: user.image, accountId: user.accountId || user.id })""",
"""    addToRecent({ name: user.name, image: user.image, accountId: user.accountId || user.id, isLocked: user.isLocked, roomPassword: user.roomPassword })"""
)

content = content.replace(
"""      addToRecent({ name: selectedLockedRoom.name, image: selectedLockedRoom.image, accountId: selectedLockedRoom.accountId || selectedLockedRoom.id })""",
"""      addToRecent({ name: selectedLockedRoom.name, image: selectedLockedRoom.image, accountId: selectedLockedRoom.accountId || selectedLockedRoom.id, isLocked: selectedLockedRoom.isLocked, roomPassword: selectedLockedRoom.roomPassword })"""
)


# 2. Fix search to use globalRooms directly instead of users if we want to get isLocked correctly
# It currently queries globalRooms but we need to ensure the objects have isLocked and roomPassword when we build the user card.
# The search function sets foundList
search_addResult_fix = """      const addResult = (docId: string, uData: any, isGlobalRoom: boolean = false) => {
        const accId = String(uData.accountId || uData.id || docId)
        if (!addedIds.has(docId) && !addedIds.has(accId)) {
          addedIds.add(docId)
          addedIds.add(accId)
          foundList.push({
            id: docId,
            name: uData.name || 'User',
            country: uData.country || '🇮🇳',
            image: uData.image || uData.photo || '/default-avatar.png',
            accountId: accId,
            createdAt: uData.createdAt || Date.now(),
            isLocked: uData.isLocked,
            roomPassword: uData.roomPassword
          })
        }
      }"""

content = content.replace(
"""      const addResult = (docId: string, uData: any) => {
        const accId = String(uData.accountId || uData.id || docId)
        if (!addedIds.has(docId) && !addedIds.has(accId)) {
          addedIds.add(docId)
          addedIds.add(accId)
          foundList.push({
            id: docId,
            name: uData.name || 'User',
            country: uData.country || '🇮🇳',
            image: uData.image || uData.photo || '/default-avatar.png',
            accountId: accId,
            createdAt: uData.createdAt || Date.now()
          })
        }
      }""",
search_addResult_fix
)

with open('components/HomePage.tsx', 'w') as f:
    f.write(content)
