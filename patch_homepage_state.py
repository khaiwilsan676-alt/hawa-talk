import re

with open('components/HomePage.tsx', 'r') as f:
    content = f.read()

state_additions = """
  // Password Room State
  const [showRoomPasswordCard, setShowRoomPasswordCard] = useState(false)
  const [selectedLockedRoom, setSelectedLockedRoom] = useState<UserCard | null>(null)
  const [enteredRoomPassword, setEnteredRoomPassword] = useState('')
"""

content = content.replace(
    '  const [enteredFromKept, setEnteredFromKept] = useState(false)',
    '  const [enteredFromKept, setEnteredFromKept] = useState(false)\n' + state_additions
)

with open('components/HomePage.tsx', 'w') as f:
    f.write(content)
