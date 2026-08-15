import re

with open('components/HomePage.tsx', 'r') as f:
    content = f.read()

# Modify handleUserCardClick to check for password
new_click_handler = """  // Handle Room Card Click from Search Overlay or Home Grid
  const handleUserCardClick = (user: UserCard) => {
    if (user.isLocked && user.accountId !== userUID) {
      setSelectedLockedRoom(user)
      setShowRoomPasswordCard(true)
      setEnteredRoomPassword('')
      return
    }
    setEnteredFromKept(false)
    addToRecent({ name: user.name, image: user.image, accountId: user.accountId || user.id })
    setSelectedUser(user)
    setCurrentPage('room')
    if (isSearchOpen) {
      setIsSearchOpen(false)
    }
  }

  const handleRoomPasswordSubmit = () => {
    if (selectedLockedRoom && enteredRoomPassword === selectedLockedRoom.roomPassword) {
      setShowRoomPasswordCard(false)
      setEnteredFromKept(false)
      addToRecent({ name: selectedLockedRoom.name, image: selectedLockedRoom.image, accountId: selectedLockedRoom.accountId || selectedLockedRoom.id })
      setSelectedUser(selectedLockedRoom)
      setCurrentPage('room')
      if (isSearchOpen) {
        setIsSearchOpen(false)
      }
    } else {
      alert('Incorrect Password')
    }
  }"""

content = content.replace(
"""  // Handle Room Card Click from Search Overlay or Home Grid
  const handleUserCardClick = (user: UserCard) => {
    setEnteredFromKept(false)
    addToRecent({ name: user.name, image: user.image, accountId: user.accountId || user.id })
    setSelectedUser(user)
    setCurrentPage('room')
    if (isSearchOpen) {
      setIsSearchOpen(false)
    }
  }""",
new_click_handler
)

with open('components/HomePage.tsx', 'w') as f:
    f.write(content)
