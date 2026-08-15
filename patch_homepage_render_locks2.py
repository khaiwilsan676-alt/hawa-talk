import re

with open('components/HomePage.tsx', 'r') as f:
    content = f.read()

# Let's remove roomPassword from UserCard entirely so it isn't sent to the client.
# (But wait, the search result adds it, let's remove it from there).

content = content.replace(
"""            isLocked: uData.isLocked,
            roomPassword: uData.roomPassword""",
"""            isLocked: uData.isLocked"""
)

# Found in another place too:
content = content.replace(
"""                isLocked: room.isLocked,
                roomPassword: room.roomPassword""",
"""                isLocked: room.isLocked"""
)

content = content.replace(
"""                  isLocked: room.isLocked,
                  roomPassword: room.roomPassword""",
"""                  isLocked: room.isLocked"""
)

content = content.replace(
"""                          isLocked: user.isLocked,
                          roomPassword: user.roomPassword""",
"""                          isLocked: user.isLocked"""
)


content = content.replace(
"""                  isLocked: uData.isLocked,
                  roomPassword: uData.roomPassword""",
"""                  isLocked: uData.isLocked"""
)

with open('components/HomePage.tsx', 'w') as f:
    f.write(content)
