import re

with open('components/HomePage.tsx', 'r') as f:
    content = f.read()

# Instead of passing roomPassword in plain text to the client on every search result/room card,
# we can just use `selectedLockedRoom.roomPassword` if it's there. However, the code reviewer noted passing it is bad practice.
# But checking the password on the client side requires it to be on the client side.
# A more secure way would be to check it against the DB dynamically when they click enter, but that requires async db calls in handleRoomPasswordSubmit.

async_submit = """  const handleRoomPasswordSubmit = async () => {
    if (!selectedLockedRoom) return;

    // Fetch latest room data to check password securely
    const { getDoc, doc } = require('firebase/firestore');
    try {
      const docRef = doc(db, "globalRooms", selectedLockedRoom.id || selectedLockedRoom.accountId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.isLocked && data.roomPassword === enteredRoomPassword) {
          setShowRoomPasswordCard(false)
          setEnteredFromKept(false)
          addToRecent({ name: selectedLockedRoom.name, image: selectedLockedRoom.image, accountId: selectedLockedRoom.accountId || selectedLockedRoom.id, isLocked: true })
          setSelectedUser(selectedLockedRoom)
          setCurrentPage('room')
          if (isSearchOpen) {
            setIsSearchOpen(false)
          }
        } else {
          alert('Incorrect Password')
        }
      } else {
        alert('Room not found')
      }
    } catch (e) {
      console.error(e);
      alert('Error verifying password')
    }
  }"""

content = content.replace(
"""  const handleRoomPasswordSubmit = () => {
    if (selectedLockedRoom && enteredRoomPassword === selectedLockedRoom.roomPassword) {
      setShowRoomPasswordCard(false)
      setEnteredFromKept(false)
      addToRecent({ name: selectedLockedRoom.name, image: selectedLockedRoom.image, accountId: selectedLockedRoom.accountId || selectedLockedRoom.id, isLocked: selectedLockedRoom.isLocked, roomPassword: selectedLockedRoom.roomPassword })
      setSelectedUser(selectedLockedRoom)
      setCurrentPage('room')
      if (isSearchOpen) {
        setIsSearchOpen(false)
      }
    } else {
      alert('Incorrect Password')
    }
  }""",
async_submit
)

# And remove roomPassword from addToRecent so it's not stored in localStorage unnecessarily
content = content.replace(
"""      addToRecent({ name: selectedLockedRoom.name, image: selectedLockedRoom.image, accountId: selectedLockedRoom.accountId || selectedLockedRoom.id, isLocked: selectedLockedRoom.isLocked, roomPassword: selectedLockedRoom.roomPassword })""",
"""      addToRecent({ name: selectedLockedRoom.name, image: selectedLockedRoom.image, accountId: selectedLockedRoom.accountId || selectedLockedRoom.id, isLocked: selectedLockedRoom.isLocked })"""
)

with open('components/HomePage.tsx', 'w') as f:
    f.write(content)
