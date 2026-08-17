import re

with open('app/owner/page.tsx', 'r') as f:
    content = f.read()

content = content.replace("querySnapshot.forEach((doc", "(querySnapshot.docs || querySnapshot).forEach((doc")
content = content.replace("querySnapshot.forEach(async (document)", "(querySnapshot.docs || querySnapshot).forEach(async (document)")

with open('app/owner/page.tsx', 'w') as f:
    f.write(content)
