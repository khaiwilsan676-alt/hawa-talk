import re

with open('components/HomePage.tsx', 'r') as f:
    content = f.read()

# Let's ensure handleUserCardClick queries the DB to check for lock status if it's not present,
# OR we just query the DB every time to be safe before entering.
# This prevents trivial bypasses if isLocked is undefined on the client object (e.g., from keptRoom).

safe_click = """  // Handle Room Card Click from Search Overlay or Home Grid
  const handleUserCardClick = async (user: UserCard) => {
    try {
      const docRef = doc(db, "globalRooms", user.accountId || user.id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.isLocked && data.accountId !== userUID) {
          setSelectedLockedRoom(user)
          setShowRoomPasswordCard(true)
          setEnteredRoomPassword('')
          return
        }
      }
    } catch (e) {
      console.warn("Failed to fetch lock status:", e);
    }

    setEnteredFromKept(false)
    addToRecent({ name: user.name, image: user.image, accountId: user.accountId || user.id, isLocked: user.isLocked })
    setSelectedUser(user)
    setCurrentPage('room')
    if (isSearchOpen) {
      setIsSearchOpen(false)
    }
  }"""

content = content.replace(
"""  // Handle Room Card Click from Search Overlay or Home Grid
  const handleUserCardClick = (user: UserCard) => {
    if (user.isLocked && user.accountId !== userUID) {
      setSelectedLockedRoom(user)
      setShowRoomPasswordCard(true)
      setEnteredRoomPassword('')
      return
    }
    setEnteredFromKept(false)
    addToRecent({ name: user.name, image: user.image, accountId: user.accountId || user.id, isLocked: user.isLocked, roomPassword: user.roomPassword })
    setSelectedUser(user)
    setCurrentPage('room')
    if (isSearchOpen) {
      setIsSearchOpen(false)
    }
  }""",
safe_click
)

with open('components/HomePage.tsx', 'w') as f:
    f.write(content)
