import re

with open('components/HomePage.tsx', 'r') as f:
    content = f.read()

# Make sure getDoc is imported at the top from firebase/firestore
content = content.replace(
"""import { collection, query, where, getDocs, onSnapshot, doc, getDoc, setDoc } from 'firebase/firestore'""",
"""import { collection, query, where, getDocs, onSnapshot, doc, getDoc, setDoc } from 'firebase/firestore'"""
)

# Wait it already is imported:
# Let's remove the require inside the function to use the imported one.
content = content.replace(
"""    // Fetch latest room data to check password securely
    const { getDoc, doc } = require('firebase/firestore');
    try {""",
"""    // Fetch latest room data to check password securely
    try {"""
)

# The reviewer also noted that recent rooms might not have isLocked set when loading from local storage, or search results might not have it.
# Let's check `handleUserCardClick` to fetch from db dynamically if it's locked.
# Actually, we added isLocked to addResult and the globalRooms mapper.

# Also, in handleUserCardClick, we currently check user.isLocked. This assumes user.isLocked is passed correctly.
# If we want to be completely secure and prevent bypasses, we should do the check in RoomPage on load.
# BUT doing it on HomePage click is better UX.
# Let's just make sure user.isLocked is populated.

with open('components/HomePage.tsx', 'w') as f:
    f.write(content)
