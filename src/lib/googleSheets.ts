export const GOOGLE_SHEET_API =
  "https://script.google.com/macros/s/AKfycbwgZU6Qln77FaLaLZM6EFlxLnXggj5wOF_YrgU92Bc1EB63TDm7QiZ_OTon-JVXYd9B/exec";

/**
 * Universal request handler for Google Apps Script Web App.
 * POST requests use 'text/plain' payload to avoid CORS preflight issues on Apps Script.
 */
async function callSheetApi<T = any>(action: string, payload: Record<string, any> = {}, method: 'GET' | 'POST' = 'POST'): Promise<T | null> {
  try {
    if (method === 'GET') {
      const params = new URLSearchParams({ action, ...payload });
      const response = await fetch(`${GOOGLE_SHEET_API}?${params.toString()}`, {
        method: 'GET',
        redirect: 'follow',
      });
      if (!response.ok) {
        throw new Error(`Google Sheets GET failed: ${response.statusText}`);
      }
      const data = await response.json();
      return data;
    } else {
      const response = await fetch(GOOGLE_SHEET_API, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8',
        },
        body: JSON.stringify({ action, ...payload }),
        redirect: 'follow',
      });
      if (!response.ok) {
        throw new Error(`Google Sheets POST failed: ${response.statusText}`);
      }
      const data = await response.json();
      return data;
    }
  } catch (error) {
    console.error(`[GoogleSheetsAPI] Action '${action}' failed:`, error);
    return null;
  }
}

// USER OPERATIONS
export async function saveUser(userData: {
  id: string;
  name?: string;
  email?: string;
  accountId?: string;
  image?: string;
  country?: string;
  bio?: string;
  backCover?: string;
  album?: string;
  gender?: string;
  age?: string | number;
  [key: string]: any;
}) {
  return await callSheetApi('saveUser', {
    userId: userData.id,
    appLongId: userData.id,
    name: userData.name || '',
    email: userData.email || '',
    accountNumber: userData.accountId || '',
    avatar: userData.image || userData.photo || userData.photoURL || '',
    country: userData.country || '',
    bio: userData.bio || '',
    backCover: userData.backCover || '',
    album: userData.album || '',
    gender: userData.gender || '',
    age: userData.age || '',
    ...userData,
  });
}

export async function getUser(userId: string) {
  if (!userId) return null;
  return await callSheetApi('getUser', { userId, appLongId: userId });
}

export async function updateUser(userData: Record<string, any>) {
  return await callSheetApi('updateUser', {
    userId: userData.id || userData.appLongId,
    appLongId: userData.id || userData.appLongId,
    ...userData,
  });
}

// GLOBAL ROOM OPERATIONS
export async function createRoom(roomData: Record<string, any>) {
  return await callSheetApi('createRoom', {
    roomId: roomData.id || roomData.roomId,
    roomName: roomData.name || roomData.roomName || '',
    roomDp: roomData.image || roomData.roomDp || '',
    country: roomData.country || '',
    micMode: roomData.micMode || '',
    roomTarget: roomData.roomTarget || '',
    roomTask: roomData.roomTask || '',
    roomAdmin: roomData.roomAdmin || roomData.accountId || '',
    message: roomData.notice || roomData.message || '',
    theme: roomData.theme || '',
    ...roomData,
  });
}

export async function getRooms() {
  const result = await callSheetApi('getRooms', {}, 'GET');
  if (Array.isArray(result)) return result;
  if (result && Array.isArray(result.rooms)) return result.rooms;
  if (result && Array.isArray(result.data)) return result.data;
  return [];
}

export async function getRoom(roomId: string) {
  if (!roomId) return null;
  return await callSheetApi('getRoom', { roomId, id: roomId });
}

export async function updateRoom(roomData: Record<string, any>) {
  return await callSheetApi('updateRoom', {
    roomId: roomData.id || roomData.roomId,
    id: roomData.id || roomData.roomId,
    ...roomData,
  });
}

export async function deleteRoom(roomId: string) {
  return await callSheetApi('deleteRoom', { roomId, id: roomId });
}

// ROOM MEMBERS OPERATIONS
export async function joinRoom(memberData: Record<string, any>) {
  return await callSheetApi('joinRoom', {
    roomId: memberData.roomId,
    userId: memberData.userId || memberData.appLongId,
    appLongId: memberData.userId || memberData.appLongId,
    name: memberData.name || memberData.userName || '',
    dp: memberData.dp || memberData.avatar || memberData.image || '',
    avatar: memberData.dp || memberData.avatar || memberData.image || '',
    joinedTime: memberData.joinedTime || Date.now(),
    membership: memberData.membership || 'member',
    ...memberData,
  });
}

export async function leaveRoom(roomId: string, userId: string) {
  return await callSheetApi('leaveRoom', { roomId, userId, appLongId: userId });
}

export async function getRoomMembers(roomId: string) {
  if (!roomId) return [];
  const result = await callSheetApi('getRoomMembers', { roomId });
  if (Array.isArray(result)) return result;
  if (result && Array.isArray(result.members)) return result.members;
  if (result && Array.isArray(result.data)) return result.data;
  return [];
}

// PRIVATE MESSAGE OPERATIONS
export async function sendMessage(msgData: Record<string, any>) {
  return await callSheetApi('sendMessage', {
    senderId: msgData.senderId || msgData.userAId,
    userAId: msgData.senderId || msgData.userAId,
    receiverId: msgData.receiverId || msgData.userBId,
    userBId: msgData.receiverId || msgData.userBId,
    chat: msgData.chat || msgData.text || '',
    dp: msgData.dp || msgData.senderAvatar || '',
    name: msgData.name || msgData.senderName || '',
    createdAt: msgData.createdAt || Date.now(),
    ...msgData,
  });
}

export async function getMessages(userAId: string, userBId?: string) {
  const result = await callSheetApi('getMessages', { userAId, userBId, senderId: userAId, receiverId: userBId });
  if (Array.isArray(result)) return result;
  if (result && Array.isArray(result.messages)) return result.messages;
  if (result && Array.isArray(result.data)) return result.data;
  return [];
}

// ROOM MESSAGES OPERATIONS
export async function sendRoomMessage(msgData: Record<string, any>) {
  return await callSheetApi('sendRoomMessage', {
    roomId: msgData.roomId,
    senderId: msgData.senderId || msgData.userId,
    senderName: msgData.senderName || msgData.name || '',
    senderAvatar: msgData.senderAvatar || msgData.dp || msgData.avatar || '',
    text: msgData.text || msgData.chat || '',
    createdAt: msgData.createdAt || Date.now(),
    ...msgData,
  });
}

export async function getRoomMessages(roomId: string) {
  if (!roomId) return [];
  const result = await callSheetApi('getRoomMessages', { roomId });
  if (Array.isArray(result)) return result;
  if (result && Array.isArray(result.messages)) return result.messages;
  if (result && Array.isArray(result.data)) return result.data;
  return [];
}

// FEEDBACK OPERATIONS
export async function saveFeedback(feedbackData: Record<string, any>) {
  return await callSheetApi('saveFeedback', {
    userId: feedbackData.userId || feedbackData.contactInfo || '',
    name: feedbackData.name || '',
    type: feedbackData.type || '',
    typeLabel: feedbackData.typeLabel || '',
    description: feedbackData.description || '',
    contactInfo: feedbackData.contactInfo || '',
    createdAt: feedbackData.createdAt || new Date().toISOString(),
    timestamp: feedbackData.timestamp || Date.now(),
    status: feedbackData.status || 'pending',
    ...feedbackData,
  });
}

export async function getFeedback() {
  const result = await callSheetApi('getFeedback', {}, 'GET');
  if (Array.isArray(result)) return result;
  if (result && Array.isArray(result.feedback)) return result.feedback;
  if (result && Array.isArray(result.data)) return result.data;
  return [];
}

// AI CHAT OPERATIONS
export async function saveAiChat(chatData: Record<string, any>) {
  return await callSheetApi('saveAiChat', {
    userId: chatData.userId,
    userName: chatData.userName || '',
    userEmail: chatData.userEmail || '',
    userMessage: chatData.userMessage || '',
    aiResponse: chatData.aiResponse || '',
    messages: chatData.messages || [],
    createdAt: chatData.createdAt || Date.now(),
    timestamp: chatData.timestamp || Date.now(),
    ...chatData,
  });
}

export async function getAiChat(userId: string) {
  if (!userId) return null;
  return await callSheetApi('getAiChat', { userId });
}
