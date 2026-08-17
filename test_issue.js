// Read the code
const fs = require('fs');
let code = fs.readFileSync('app/owner/page.tsx', 'utf-8');

// I am trying to figure out why the user says "Owner panel m GMAIL, PASSWORD SAVE nhi horaha kyuu real time save hojeyga globally Bss Without any error"
// What if it's about the fact that `onSnapshot` OVERWRITES what they are typing?
// Imagine I'm typing "abc".
// handleChange is called. skipNextSave.current = false. idsData is updated.
// Then `onSnapshot` arrives from SOMEWHERE else (or a delayed network packet).
// It runs:
//           setIdsData(currentData => {
//             const finalData = JSON.parse(JSON.stringify(mergedData));
//
//             if (focusedField.current) {
//               const [focusedId, focusedKey] = focusedField.current.split('-');
//               if (finalData[focusedId] && currentData[focusedId]) {
//                 finalData[focusedId][focusedKey] = currentData[focusedId][focusedKey];
//               }
//             }
//
//             if (JSON.stringify(currentData) === JSON.stringify(finalData)) {
//               return currentData;
//             }
//
//             skipNextSave.current = true;
//             isLoadedFromFirestore.current = true;
//             return finalData;
//           });
// Wait. This logic PRESERVES the currently focused field!
// So it DOES NOT overwrite what they are typing!
// BUT what if they are NOT focused on the field? (e.g. they typed, then clicked away).
// If they clicked away, `focusedField.current` is NULL!
// If they click away BEFORE 1000ms, then `onSnapshot` arrives, it OVERWRITES the field with the OLD data!
// Ah!
// Imagine:
// 1. User types "a" in email field.
// 2. User immediately clicks outside (onBlur fires -> focusedField.current = null).
// 3. User clicked outside at 500ms.
// 4. At 800ms, a delayed `onSnapshot` arrives! Or a completely unrelated `onSnapshot` arrives.
// 5. `onSnapshot` runs. `focusedField.current` is null.
// 6. It overwrites `currentData` with `finalData` (which has the OLD email).
// 7. At 1000ms, `handleSave` runs... but `idsData` has been reverted! So it saves the OLD email!
