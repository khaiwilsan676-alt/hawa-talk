import re

with open('components/RoomPage.tsx', 'r') as f:
    content = f.read()

# Add lock checking inside RoomPage to handle situations where a user bypassed the homepage (e.g. direct link if that was possible, or just as a secondary guard)
# Or we can just ensure KeptRoom data and Search results are properly hydrated with isLocked in HomePage.

with open('components/RoomPage.tsx', 'w') as f:
    f.write(content)
