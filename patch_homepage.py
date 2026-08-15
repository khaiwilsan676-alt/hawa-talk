import re

with open('components/HomePage.tsx', 'r') as f:
    content = f.read()

# 1. Update Interfaces
content = content.replace(
    'interface UserCard {\n  id: string\n  accountId?: string\n  name: string\n  country: string\n  image: string\n}',
    'interface UserCard {\n  id: string\n  accountId?: string\n  name: string\n  country: string\n  image: string\n  isLocked?: boolean\n  roomPassword?: string\n}'
)

content = content.replace(
    'interface GlobalRoom {\n  id: string\n  name: string\n  country: string\n  image: string\n  accountId: string\n  createdAt: number\n}',
    'interface GlobalRoom {\n  id: string\n  name: string\n  country: string\n  image: string\n  accountId: string\n  createdAt: number\n  isLocked?: boolean\n  roomPassword?: string\n}'
)

with open('components/HomePage.tsx', 'w') as f:
    f.write(content)
