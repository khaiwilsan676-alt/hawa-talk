import re

with open('components/HomePage.tsx', 'r') as f:
    content = f.read()

# Update mapping to include isLocked and roomPassword
content = content.replace(
"""                const user: UserCard = {
                  id: docId,
                  accountId: accId,
                  name: uData.name || 'User',
                  country: uData.country || '🇮🇳',
                  image: uData.image || uData.photo || '/default-avatar.png',
                }""",
"""                const user: UserCard = {
                  id: docId,
                  accountId: accId,
                  name: uData.name || 'User',
                  country: uData.country || '🇮🇳',
                  image: uData.image || uData.photo || '/default-avatar.png',
                  isLocked: uData.isLocked,
                  roomPassword: uData.roomPassword
                }"""
)

# Found in another place too:
content = content.replace(
"""              const user: UserCard = {
                id: room.accountId,
                accountId: room.accountId,
                name: room.name,
                country: room.country || '🇮🇳',
                image: room.image
              }""",
"""              const user: UserCard = {
                id: room.accountId,
                accountId: room.accountId,
                name: room.name,
                country: room.country || '🇮🇳',
                image: room.image,
                isLocked: room.isLocked,
                roomPassword: room.roomPassword
              }"""
)

content = content.replace(
"""                onClick={() => handleUserCardClick({
                  id: room.id || room.accountId,
                  accountId: room.accountId,
                  name: room.name,
                  country: room.country,
                  image: room.image
                })}""",
"""                onClick={() => handleUserCardClick({
                  id: room.id || room.accountId,
                  accountId: room.accountId,
                  name: room.name,
                  country: room.country,
                  image: room.image,
                  isLocked: room.isLocked,
                  roomPassword: room.roomPassword
                })}"""
)

content = content.replace(
"""                        onClick={() => handleUserCardClick({
                          id: user.id || user.accountId,
                          accountId: user.accountId,
                          name: user.name,
                          country: user.country,
                          image: user.image
                        })}""",
"""                        onClick={() => handleUserCardClick({
                          id: user.id || user.accountId,
                          accountId: user.accountId,
                          name: user.name,
                          country: user.country,
                          image: user.image,
                          isLocked: user.isLocked,
                          roomPassword: user.roomPassword
                        })}"""
)

# Add lock icon/outline to room cards
# Let's find where room cards are rendered. We will look for:
# <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex flex-col justify-end p-2.5">
lock_ui = """                {room.isLocked && (
                  <div className="absolute top-2 right-2 bg-white/20 backdrop-blur-md rounded-full p-1.5 border border-white/50">
                    <svg viewBox="0 0 24 24" className="w-4 h-4 fill-white">
                      <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zM9 6c0-1.66 1.34-3 3-3s3 1.34 3 3v2H9V6zm9 14H6V10h12v10zm-6-3c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2z"/>
                    </svg>
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex flex-col justify-end p-2.5">"""
content = content.replace(
"""                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex flex-col justify-end p-2.5">""",
lock_ui
)

with open('components/HomePage.tsx', 'w') as f:
    f.write(content)
