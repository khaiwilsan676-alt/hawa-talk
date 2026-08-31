const SHEET_ID = "1YCIA1jZ6P8CnfjVo9aVMSHo5IASg2oIvHrv9oC6Q9lQ";

const SHEETS = {
  USER: "User",
  GLOBAL_ROOM: "GlobalRoom",
  ROOM_MEMBERS: "Room members",
  MESSAGE: "Message"
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

    if (action === "users") {
      return getUsers();
    }

    if (action === "rooms") {
      return getRooms();
    }

    if (action === "roomMembers") {
      return getRoomMembers();
    }

    if (action === "messages") {
      return getMessages(
        e.parameter.userA,
        e.parameter.userB
      );
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

    if (action === "createRoom") {
      return createRoom(data);
    }

    if (action === "joinRoom") {
      return joinRoom(data);
    }

    if (action === "sendMessage") {
      return sendMessage(data);
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
// GET SHEET
// ===============================

function getSheet(name) {
  const ss = SpreadsheetApp.openById(SHEET_ID);
  const sheet = ss.getSheetByName(name);

  if (!sheet) {
    throw new Error("Sheet not found: " + name);
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

function saveUser(data) {

  const sheet = getSheet(SHEETS.USER);

  const values = sheet.getDataRange().getValues();

  const headers = values[0];

  const appIdIndex =
    headers.indexOf("App long ID");

  if (appIdIndex === -1) {
    throw new Error("App long ID column missing");
  }

  // Check existing user
  for (let i = 1; i < values.length; i++) {

    if (
      String(values[i][appIdIndex]) ===
      String(data.appLongId)
    ) {

      return json({
        success: true,
        message: "User already exists",
        row: i + 1
      });
    }
  }

  const row = headers.map(header => {

    switch (String(header).trim()) {

      case "Name":
        return data.name || "";

      case "E-mail":
        return data.email || "";

      case "App long ID":
        return data.appLongId || "";

      case "Account Number":
        return data.accountNumber || "";

      case "Avtar":
        return data.avatar || "";

      case "Country":
        return data.country || "";

      case "Bio":
        return data.bio || "";

      case "Back Cover":
        return data.backCover || "";

      case "Album":
        return data.album || "";

      case "Gender":
        return data.gender || "";

      case "Age":
        return data.age || "";

      default:
        return "";
    }
  });

  sheet.appendRow(row);

  return json({
    success: true,
    message: "User saved"
  });
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

function createRoom(data) {

  const sheet = getSheet(SHEETS.GLOBAL_ROOM);

  const values = sheet.getDataRange().getValues();
  const headers = values[0];

  const roomId =
    data.id ||
    Utilities.getUuid();

  const row = headers.map(header => {

    switch (String(header).trim()) {

      case "Room Name":
        return data.roomName || "";

      case "ID":
        return roomId;

      case "Room dp":
        return data.roomDp || "";

      case "Country":
        return data.country || "";

      case "Mic Mode":
        return data.micMode || "";

      case "Room Target":
        return data.roomTarget || "";

      case "Room task":
        return data.roomTask || "";

      case "Room Admin":
        return data.roomAdmin || "";

      case "Message":
        return data.message || "";

      case "Theme":
        return data.theme || "";

      default:
        return "";
    }
  });

  sheet.appendRow(row);

  return json({
    success: true,
    message: "Room created",
    roomId: roomId
  });
}

// ===============================
// ROOM MEMBERS
// ===============================

function getRoomMembers() {

  const sheet = getSheet(SHEETS.ROOM_MEMBERS);

  const members = rowsToObjects(sheet);

  return json({
    success: true,
    members: members
  });
}

function joinRoom(data) {

  const sheet = getSheet(SHEETS.ROOM_MEMBERS);

  sheet.appendRow([
    data.dp || "",
    data.name || ""
  ]);

  return json({
    success: true,
    message: "Joined room"
  });
}

// ===============================
// PRIVATE MESSAGES
// ===============================

function getMessages(userA, userB) {

  const sheet = getSheet(SHEETS.MESSAGE);

  const values = sheet.getDataRange().getValues();

  if (values.length < 2) {
    return json({
      success: true,
      messages: []
    });
  }

  const messages = [];

  for (let i = 1; i < values.length; i++) {

    const row = values[i];

    const userAId = row[0];
    const chatA = row[1];
    const dpA = row[2];
    const nameA = row[3];

    const userBId = row[4];
    const chatB = row[5];
    const dpB = row[6];
    const nameB = row[7];

    if (
      String(userAId) === String(userA) &&
      String(userBId) === String(userB)
    ) {

      messages.push({
        from: userAId,
        text: chatA,
        dp: dpA,
        name: nameA,
        to: userBId
      });

    } else if (
      String(userAId) === String(userB) &&
      String(userBId) === String(userA)
    ) {

      messages.push({
        from: userBId,
        text: chatB,
        dp: dpB,
        name: nameB,
        to: userAId
      });
    }
  }

  return json({
    success: true,
    messages: messages
  });
}

function sendMessage(data) {

  const sheet = getSheet(SHEETS.MESSAGE);

  sheet.appendRow([
    data.userAId || "",
    data.chatA || "",
    data.dpA || "",
    data.nameA || "",

    data.userBId || "",
    data.chatB || "",
    data.dpB || "",
    data.nameB || ""
  ]);

  return json({
    success: true,
    message: "Message saved"
  });
}
