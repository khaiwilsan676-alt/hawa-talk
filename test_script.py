import re

with open('app/owner/page.tsx', 'r') as f:
    content = f.read()

content = content.replace("snapshot.forEach((docSnap: any)", "snapshot.docs.forEach((docSnap: any)")

with open('app/owner/page.tsx', 'w') as f:
    f.write(content)
