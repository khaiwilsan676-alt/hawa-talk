import re

with open('components/HomePage.tsx', 'r') as f:
    content = f.read()

# Update KeptRoomData and RecentRoom to include isLocked and roomPassword
content = content.replace(
"""interface KeptRoomData {
  name: string
  country?: string
  image: string
  accountId: string
}""",
"""interface KeptRoomData {
  name: string
  country?: string
  image: string
  accountId: string
  isLocked?: boolean
  roomPassword?: string
}"""
)

with open('components/HomePage.tsx', 'w') as f:
    f.write(content)
