import re

with open('app/owner/page.tsx', 'r') as f:
    code = f.read()

print("Is there a bug in handleSave ?")
# "Owner panel m GMAIL, PASSWORD SAVE nhi horaha kyuu real time save hojeyga globally Bss Without any error"

# Maybe they are saying that the "Save All Credentials" button doesn't show any error but doesn't actually save?
# Wait!
# The problem is `onSnapshot` overriding it?
# The user says "kyuu real time save hojeyga globally" -> "Because it will save in real time globally"
# "Bss Without any error" -> "Just without any error"
# They want to REMOVE the "Save All Credentials" button and ONLY rely on real-time auto-save?
# "Owner panel m GMAIL, PASSWORD SAVE nhi horaha" -> "In Owner panel, GMAIL, PASSWORD IS NOT SAVING"
