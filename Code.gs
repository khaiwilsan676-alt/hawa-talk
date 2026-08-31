const SHEET_ID = "1YCIA1jZ6P8CnfjVo9aVMSHo5IASg2oIvHrv9oC6Q9lQ";

const SHEETS = {
  USER: "User",
  GLOBAL_ROOM: "GlobalRoom",
  ROOM_MEMBERS: "Room members",
  MESSAGE: "Message",
  FEEDBACK: "Feedback",
  AI_CHAT: "Ai chat"
};

// ===============================
// BASIC RESPONSE
// ===============================

function json(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

// ===============================
// GET
// ===============================

function doGet(e) {
  try {
    const action = e?.parameter?.action || "test";

    if (action === "test") {
      return json({
        success: true,
        message: "Himo API is working 🚀"
      });
    }

    if (action === "users" || action === "getUsers") {
      return getUsers();
    }

    if (action === "getUser") {
      return getUser(e.parameter.userId || e.parameter.appLongId);
    }

    if (action === "rooms" || action === "getRooms") {
      return getRooms();
    }

    if (action === "getRoom") {
      return getRoom(e.parameter.roomId || e.parameter.id);
    }

    if (action === "roomMembers" || action === "getRoomMembers") {
      return getRoomMembers(e.parameter.roomId);
    }

    if (action === "messages" || action === "getMessages") {
      return getMessages(
        e.parameter.userAId || e.parameter.senderId || e.parameter.userA,
        e.parameter.userBId || e.parameter.receiverId || e.parameter.userB
      );
    }

    if (action === "getRoomMessages") {
      return getRoomMessages(e.parameter.roomId);
    }

    if (action === "getFeedback") {
      return getFeedback();
    }

    if (action === "getAiChat") {
      return getAiChat(e.parameter.userId);
    }

    return json({
      success: false,
      error: "Unknown action"
    });

  } catch (error) {
    return json({
      success: false,
      error: error.message
    });
  }
}

// ===============================
// POST
// ===============================

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents || "{}");
    const action = data.action;

    if (action === "saveUser") {
      return saveUser(data);
    }
    if (action === "updateUser") {
      return updateUser(data);
    }
    if (action === "getUser") {
      return getUser(data.userId || data.appLongId);
    }
    if (action === "getUsers") {
      return getUsers();
    }

    if (action === "createRoom") {
      return createRoom(data);
    }
    if (action === "updateRoom") {
      return updateRoom(data);
    }
    if (action === "getRoom") {
      return getRoom(data.roomId || data.id);
    }
    if (action === "getRooms") {
      return getRooms();
    }
    if (action === "deleteRoom") {
      return deleteRoom(data.roomId || data.id);
    }

    if (action === "joinRoom") {
      return joinRoom(data);
    }
    if (action === "leaveRoom") {
      return leaveRoom(data.roomId, data.userId || data.appLongId);
    }
    if (action === "getRoomMembers") {
      return getRoomMembers(data.roomId);
    }

    if (action === "sendMessage") {
      return sendMessage(data);
    }
    if (action === "getMessages") {
      return getMessages(data.userAId || data.senderId, data.userBId || data.receiverId);
    }

    if (action === "sendRoomMessage") {
      return sendRoomMessage(data);
    }
    if (action === "getRoomMessages") {
      return getRoomMessages(data.roomId);
    }

    if (action === "saveFeedback") {
      return saveFeedback(data);
    }
    if (action === "getFeedback") {
      return getFeedback();
    }

    if (action === "saveAiChat") {
      return saveAiChat(data);
    }
    if (action === "getAiChat") {
      return getAiChat(data.userId);
    }

    return json({
      success: false,
      error: "Unknown action: " + action
    });

  } catch (error) {
    return json({
      success: false,
      error: error.message
    });
  }
}

// ===============================
// GET SHEET
// ===============================

function getSheet(name) {
  const ss = SpreadsheetApp.openById(SHEET_ID);
  let sheet = ss.getSheetByName(name);

  if (!sheet) {
    sheet = ss.insertSheet(name);
  }

  return sheet;
}

// ===============================
// CONVERT ROWS TO OBJECTS
// ===============================

function rowsToObjects(sheet) {
  const values = sheet.getDataRange().getValues();

  if (values.length < 2) {
    return [];
  }

  const headers = values[0];

  return values.slice(1).map(row => {
    const obj = {};

    headers.forEach((header, index) => {
      obj[String(header).trim()] = row[index];
    });

    return obj;
  });
}

// ===============================
// USERS
// ===============================

function getUsers() {
  const sheet = getSheet(SHEETS.USER);
  const users = rowsToObjects(sheet);

  return json({
    success: true,
    users: users
  });
}

function getUser(userId) {
  const sheet = getSheet(SHEETS.USER);
  const users = rowsToObjects(sheet);
  const found = users.find(u => String(u["App long ID"]) === String(userId) || String(u["Account Number"]) === String(userId));

  return json({
    success: true,
    user: found || null,
    data: found || null
  });
}

function saveUser(data) {
  const sheet = getSheet(SHEETS.USER);
  const values = sheet.getDataRange().getValues();
  const headers = values[0];

  const appIdIndex = headers.indexOf("App long ID");

  if (appIdIndex !== -1) {
    for (let i = 1; i < values.length; i++) {
      if (String(values[i][appIdIndex]) === String(data.appLongId || data.userId)) {
        return json({
          success: true,
          message: "User already exists",
          row: i + 1
        });
      }
    }
  }

  const row = headers.map(header => {
    switch (String(header).trim()) {
      case "Name": return data.name || "";
      case "E-mail": return data.email || "";
      case "App long ID": return data.appLongId || data.userId || "";
      case "Account Number": return data.accountNumber || data.accountId || "";
      case "Avtar": return data.avatar || data.image || data.photo || "";
      case "Country": return data.country || "";
      case "Bio": return data.bio || "";
      case "Back Cover": return data.backCover || "";
      case "Album": return data.album || "";
      case "Gender": return data.gender || "";
      case "Age": return data.age || "";
      default: return data[String(header).trim()] || "";
    }
  });

  sheet.appendRow(row);

  return json({
    success: true,
    message: "User saved"
  });
}

function updateUser(data) {
  const sheet = getSheet(SHEETS.USER);
  const values = sheet.getDataRange().getValues();
  const headers = values[0];
  const appIdIndex = headers.indexOf("App long ID");

  if (appIdIndex === -1) {
    return json({ success: false, error: "App long ID column missing" });
  }

  const targetId = String(data.appLongId || data.userId || data.id);

  for (let i = 1; i < values.length; i++) {
    if (String(values[i][appIdIndex]) === targetId) {
      Object.keys(data).forEach(key => {
        let colName = key;
        if (key === "name") colName = "Name";
        if (key === "email") colName = "E-mail";
        if (key === "accountId") colName = "Account Number";
        if (key === "avatar" || key === "image" || key === "photo") colName = "Avtar";
        if (key === "country") colName = "Country";
        if (key === "bio") colName = "Bio";
        if (key === "backCover") colName = "Back Cover";
        if (key === "album") colName = "Album";
        if (key === "gender") colName = "Gender";
        if (key === "age") colName = "Age";

        const colIndex = headers.indexOf(colName);
        if (colIndex !== -1) {
          sheet.getRange(i + 1, colIndex + 1).setValue(data[key]);
        }
      });

      return json({ success: true, message: "User updated" });
    }
  }

  return saveUser(data);
}

// ===============================
// GLOBAL ROOMS
// ===============================

function getRooms() {
  const sheet = getSheet(SHEETS.GLOBAL_ROOM);
  const rooms = rowsToObjects(sheet);

  return json({
    success: true,
    rooms: rooms
  });
}

function getRoom(roomId) {
  const sheet = getSheet(SHEETS.GLOBAL_ROOM);
  const rooms = rowsToObjects(sheet);
  const found = rooms.find(r => String(r["ID"]) === String(roomId) || String(r["Room Admin"]) === String(roomId));

  return json({
    success: true,
    room: found || null,
    data: found || null
  });
}

function createRoom(data) {
  const sheet = getSheet(SHEETS.GLOBAL_ROOM);
  const values = sheet.getDataRange().getValues();
  const headers = values[0];

  const roomId = data.id || data.roomId || Utilities.getUuid();

  const row = headers.map(header => {
    switch (String(header).trim()) {
      case "Room Name": return data.roomName || data.name || "";
      case "ID": return roomId;
      case "Room dp": return data.roomDp || data.image || "";
      case "Country": return data.country || "";
      case "Mic Mode": return data.micMode || "";
      case "Room Target": return data.roomTarget || "";
      case "Room task": return data.roomTask || "";
      case "Room Admin": return data.roomAdmin || data.accountId || "";
      case "Message": return data.message || data.notice || "";
      case "Theme": return data.theme || "";
      default: return data[String(header).trim()] || "";
    }
  });

  sheet.appendRow(row);

  return json({
    success: true,
    message: "Room created",
    roomId: roomId
  });
}

function updateRoom(data) {
  const sheet = getSheet(SHEETS.GLOBAL_ROOM);
  const values = sheet.getDataRange().getValues();
  const headers = values[0];
  const idIndex = headers.indexOf("ID");

  const targetId = String(data.id || data.roomId);

  for (let i = 1; i < values.length; i++) {
    if (String(values[i][idIndex]) === targetId) {
      Object.keys(data).forEach(key => {
        let colName = key;
        if (key === "roomName" || key === "name") colName = "Room Name";
        if (key === "roomDp" || key === "image") colName = "Room dp";
        if (key === "country") colName = "Country";
        if (key === "micMode") colName = "Mic Mode";
        if (key === "roomAdmin" || key === "accountId") colName = "Room Admin";
        if (key === "message" || key === "announcement" || key === "notice") colName = "Message";
        if (key === "theme") colName = "Theme";

        const colIndex = headers.indexOf(colName);
        if (colIndex !== -1) {
          sheet.getRange(i + 1, colIndex + 1).setValue(data[key]);
        }
      });

      return json({ success: true, message: "Room updated" });
    }
  }

  return createRoom(data);
}

function deleteRoom(roomId) {
  const sheet = getSheet(SHEETS.GLOBAL_ROOM);
  const values = sheet.getDataRange().getValues();
  const idIndex = values[0].indexOf("ID");

  for (let i = 1; i < values.length; i++) {
    if (String(values[i][idIndex]) === String(roomId)) {
      sheet.deleteRow(i + 1);
      return json({ success: true, message: "Room deleted" });
    }
  }

  return json({ success: false, error: "Room not found" });
}

// ===============================
// ROOM MEMBERS
// ===============================

function getRoomMembers(roomId) {
  const sheet = getSheet(SHEETS.ROOM_MEMBERS);
  const members = rowsToObjects(sheet);

  if (!roomId) {
    return json({ success: true, members: members });
  }

  const filtered = members.filter(m => String(m.roomId || m["Room ID"]) === String(roomId));
  return json({ success: true, members: filtered });
}

function joinRoom(data) {
  const sheet = getSheet(SHEETS.ROOM_MEMBERS);
  sheet.appendRow([
    data.dp || data.avatar || "",
    data.name || "",
    data.roomId || "",
    data.userId || data.appLongId || "",
    data.membership || "member",
    data.joinedTime || Date.now()
  ]);

  return json({
    success: true,
    message: "Joined room"
  });
}

function leaveRoom(roomId, userId) {
  const sheet = getSheet(SHEETS.ROOM_MEMBERS);
  const values = sheet.getDataRange().getValues();

  for (let i = 1; i < values.length; i++) {
    if (String(values[i][2]) === String(roomId) && String(values[i][3]) === String(userId)) {
      sheet.deleteRow(i + 1);
      return json({ success: true, message: "Left room" });
    }
  }

  return json({ success: true, message: "Member not found or already left" });
}

// ===============================
// PRIVATE MESSAGES
// ===============================

function getMessages(userA, userB) {
  const sheet = getSheet(SHEETS.MESSAGE);
  const values = sheet.getDataRange().getValues();

  if (values.length < 2) {
    return json({ success: true, messages: [] });
  }

  const messages = [];

  for (let i = 1; i < values.length; i++) {
    const row = values[i];
    const userAId = row[0];
    const chatA = row[1];
    const dpA = row[2];
    const nameA = row[3];
    const userBId = row[4];

    if (!userB) {
      if (String(userAId) === String(userA) || String(userBId) === String(userA)) {
        messages.push({
          senderId: userAId,
          userAId: userAId,
          receiverId: userBId,
          userBId: userBId,
          chat: chatA,
          text: chatA,
          dp: dpA,
          name: nameA,
          createdAt: row[8] || Date.now()
        });
      }
    } else {
      if (
        (String(userAId) === String(userA) && String(userBId) === String(userB)) ||
        (String(userAId) === String(userB) && String(userBId) === String(userA))
      ) {
        messages.push({
          senderId: userAId,
          userAId: userAId,
          receiverId: userBId,
          userBId: userBId,
          chat: chatA,
          text: chatA,
          dp: dpA,
          name: nameA,
          createdAt: row[8] || Date.now()
        });
      }
    }
  }

  return json({ success: true, messages: messages });
}

function sendMessage(data) {
  const sheet = getSheet(SHEETS.MESSAGE);
  sheet.appendRow([
    data.userAId || data.senderId || "",
    data.chat || data.chatA || data.text || "",
    data.dpA || data.dp || "",
    data.nameA || data.name || "",
    data.userBId || data.receiverId || "",
    data.chatB || "",
    data.dpB || "",
    data.nameB || "",
    data.createdAt || Date.now()
  ]);

  return json({ success: true, message: "Message saved" });
}

// ===============================
// ROOM MESSAGES
// ===============================

function getRoomMessages(roomId) {
  const sheet = getSheet("RoomMessages");
  const messages = rowsToObjects(sheet);
  const filtered = messages.filter(m => String(m.roomId) === String(roomId));
  return json({ success: true, messages: filtered });
}

function sendRoomMessage(data) {
  const sheet = getSheet("RoomMessages");
  sheet.appendRow([
    data.roomId || "",
    data.senderId || data.userId || "",
    data.senderName || data.name || "",
    data.senderAvatar || data.dp || "",
    data.text || data.chat || "",
    data.createdAt || Date.now()
  ]);

  return json({ success: true, message: "Room message saved" });
}

// ===============================
// FEEDBACK
// ===============================

function saveFeedback(data) {
  const sheet = getSheet(SHEETS.FEEDBACK);
  sheet.appendRow([
    data.userId || data.contactInfo || "",
    data.name || "",
    data.type || "",
    data.typeLabel || "",
    data.description || "",
    data.contactInfo || "",
    data.createdAt || new Date().toISOString(),
    data.status || "pending"
  ]);

  return json({ success: true, message: "Feedback saved" });
}

function getFeedback() {
  const sheet = getSheet(SHEETS.FEEDBACK);
  const items = rowsToObjects(sheet);
  return json({ success: true, feedback: items });
}

// ===============================
// AI CHAT
// ===============================

function saveAiChat(data) {
  const sheet = getSheet(SHEETS.AI_CHAT);
  sheet.appendRow([
    data.userId || "",
    data.userName || "",
    data.userEmail || "",
    data.userMessage || "",
    data.aiResponse || "",
    data.createdAt || Date.now()
  ]);

  return json({ success: true, message: "AI Chat saved" });
}

function getAiChat(userId) {
  const sheet = getSheet(SHEETS.AI_CHAT);
  const items = rowsToObjects(sheet);
  const filtered = items.filter(i => String(i.userId) === String(userId));
  return json({ success: true, chats: filtered });
}
