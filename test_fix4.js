// Wait! Let's think how `focusedField` handles it.
// `onFocus={() => focusedField.current = ... }`
// `onBlur={() => focusedField.current = null}`
// When the user is typing, they are focused.
// If they type, wait 1s, it saves.
// But what if they type a full email, and IMMEDIATELY click the next input field?
// 1. `onBlur` for email field runs. `focusedField.current = null`.
// 2. `onFocus` for password field runs. `focusedField.current = "id-password"`.
// 3. User types in password.
// The email they typed is NOT focused anymore!
// 4. `handleChange` for password runs. Starts 1000ms timer.
// 5. What if an `onSnapshot` for PREVIOUS data arrives right now?
// It will overwrite the EMAIL they just typed!
// Because `focusedField` is only protecting the PASSWORD field!
// AND when it overwrites the email, it sets `skipNextSave.current = true`.
// And cancels the timer.
// The password AND the email are LOST!
// AND THEY WERE JUST TYPING!
// "Owner panel m GMAIL, PASSWORD SAVE nhi horaha" -> GMAIL and PASSWORD are NOT saving!
// This PERFECTLY matches the user experience of filling out the form, tabbing through inputs, and suddenly everything reverts and doesn't save!

// TO FIX THIS:
// We need to NOT rely on `onSnapshot` CONTINUOUSLY overwriting local state if there are pending local changes.
// Or, track `isLocalUpdate` better.
// The easiest and most robust fix for an admin panel that doesn't need perfect collaborative editing:
// ONLY process `onSnapshot` if there are NO pending saves!
// How to track pending saves?
// We have `skipNextSave.current`. But it's used for skipping the auto-save.
// What if we track `hasPendingChanges.current`?
// In `handleChange`: `hasPendingChanges.current = true`.
// In `handleSave`: `hasPendingChanges.current = false` BEFORE calling `setDoc`.
// In `onSnapshot`: `if (hasPendingChanges.current) return;`

// Let's trace this fix:
// 1. User types "H". `hasPendingChanges` = true.
// 2. Server snapshot arrives for previous data. `hasPendingChanges` is true. RETURNS EARLY! (Ignores server snapshot).
// 3. 1000ms timer finishes.
// 4. `handleSave` runs. Sets `hasPendingChanges = false`.
// 5. Calls `setDoc`.
// 6. Local snapshot fires. `hasPendingChanges` is false.
// 7. Updates state with local snapshot data. `skipNextSave = true`.
// 8. Auto-save is skipped.
// THIS WORKS FLAWLESSLY! It prevents all reversions!

// Wait! What if they click "Save All"?
// `onClick={() => handleSave()}`
// `handleSave` sets `hasPendingChanges = false`.
// This is also perfect!

// Let's implement `hasPendingChanges` fix!
// Wait! What if the server snapshot arrives BETWEEN `hasPendingChanges = false` and `setDoc` finishing?
// `handleSave` is async.
//   const handleSave = useCallback(async () => {
//     hasPendingChanges.current = false;
//     try {
//       await setDoc(...)
//     } ...
// If we set it to false before `setDoc`, and a slow server snapshot arrives during `await setDoc`, it will overwrite!
// BUT we just saved the LATEST data. `handleSave` uses the latest `idsData`.
// If it overwrites with the old server data, it's bad.
// It's better to set `hasPendingChanges.current = false` AFTER `setDoc` finishes!
//   await setDoc(...)
//   hasPendingChanges.current = false;

// Wait, what if the user types DURING `await setDoc`?
// 1. `handleSave` starts. `await setDoc`.
// 2. User types "B". `hasPendingChanges.current = true`.
// 3. `await setDoc` finishes.
// 4. `hasPendingChanges.current = false`.
// 5. NOW the user's typing "B" is marked as NOT pending!
// 6. Server snapshot for "A" arrives. `hasPendingChanges` is false.
// 7. Reverts to "A"!
// This is a race condition.
