import re

with open('components/RoomPage.tsx', 'r') as f:
    content = f.read()

# Add states for isLocked and roomPassword to RoomPage
content = content.replace(
"""  const [roomName, setRoomName] = useState<string>("");
  const [roomAnnouncement, setRoomAnnouncement] = useState<string>("");""",
"""  const [roomName, setRoomName] = useState<string>("");
  const [roomAnnouncement, setRoomAnnouncement] = useState<string>("");
  const [isLocked, setIsLocked] = useState<boolean>(false);
  const [roomPassword, setRoomPassword] = useState<string>("");"""
)

# Fetch isLocked and roomPassword from globalRooms snapshot
content = content.replace(
"""          setMicMode(data.micMode);
        }
      }
    });

    return () => unsub();""",
"""          setMicMode(data.micMode);
        }
        if (data.isLocked !== undefined) setIsLocked(data.isLocked);
        if (data.roomPassword !== undefined) setRoomPassword(data.roomPassword);
      }
    });

    return () => unsub();"""
)

# Update handleSaveSettings
content = content.replace(
"""  const handleSaveSettings = async (data: any) => {
    if (data.roomName) setRoomName(data.roomName);
    if (data.announcement !== undefined) setRoomAnnouncement(data.announcement);
    if (data.roomImage) setRoomImage(data.roomImage);
    if (data.micMode) setMicMode(data.micMode);
    if (data.theme && THEME_BACKGROUNDS[data.theme]) {
      setBackgroundImage(THEME_BACKGROUNDS[data.theme]);
    }

    if (roomId && db) {
      await setDoc(doc(db, "globalRooms", roomId), {
        name: data.roomName,
        image: data.roomImage,
        announcement: data.announcement,
        micMode: data.micMode,
        theme: data.theme,
      }, { merge: true });
    }
  };""",
"""  const handleSaveSettings = async (data: any) => {
    if (data.roomName) setRoomName(data.roomName);
    if (data.announcement !== undefined) setRoomAnnouncement(data.announcement);
    if (data.roomImage) setRoomImage(data.roomImage);
    if (data.micMode) setMicMode(data.micMode);
    if (data.theme && THEME_BACKGROUNDS[data.theme]) {
      setBackgroundImage(THEME_BACKGROUNDS[data.theme]);
    }
    if (data.isLocked !== undefined) setIsLocked(data.isLocked);
    if (data.roomPassword !== undefined) setRoomPassword(data.roomPassword);

    if (roomId && db) {
      await setDoc(doc(db, "globalRooms", roomId), {
        name: data.roomName,
        image: data.roomImage,
        announcement: data.announcement,
        micMode: data.micMode,
        theme: data.theme,
        isLocked: data.isLocked,
        roomPassword: data.roomPassword,
      }, { merge: true });
    }
  };"""
)

# Pass isLocked and roomPassword to RoomSettingPage via roomData prop
content = content.replace(
"""        roomData={{ roomName, roomImage, announcement: roomAnnouncement, micMode, theme: Object.keys(THEME_BACKGROUNDS).find(key => THEME_BACKGROUNDS[key] === backgroundImage) || 'mood-light' }}""",
"""        roomData={{ roomName, roomImage, announcement: roomAnnouncement, micMode, isLocked, roomPassword, theme: Object.keys(THEME_BACKGROUNDS).find(key => THEME_BACKGROUNDS[key] === backgroundImage) || 'mood-light' }}"""
)

with open('components/RoomPage.tsx', 'w') as f:
    f.write(content)
