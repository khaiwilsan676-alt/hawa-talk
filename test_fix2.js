// Wait! Let's think. If the user clicks "Save All Credentials".
// `handleSave()` is called immediately.
// `setDoc()` is executed.
// Firestore immediately triggers `onSnapshot` locally.
// `onSnapshot` runs.
// `finalData` is identical to `currentData` (because we just saved it).
// `JSON.stringify(currentData) === JSON.stringify(finalData)` is TRUE!
// It returns `currentData`.
// State DOES NOT UPDATE.
// `skipNextSave.current` is NOT SET to `true`.
// BUT, since state didn't update, `useEffect` DOES NOT RUN.
// This works perfectly!

// SO when does the bug happen?
// What if the user types "A". `handleChange` runs. `skipNextSave.current = false`.
// State updates. `useEffect` starts 1000ms timer.
// BUT WAIT!
// What if `isLoadedFromFirestore.current` is `false` initially?
// On page load, `useEffect` runs. `skipNextSave.current` is initialized to `true`.
// `skipNextSave.current` becomes `false` and returns early.
// Then `onSnapshot` fires for the FIRST time.
// It sets `skipNextSave.current = true`.
// It sets `idsData` state.
// Component re-renders.
// `useEffect` runs. `skipNextSave.current` is `true`.
// It becomes `false` and returns early.
// PERFECT!

// Now, the user types something. "test"
// `handleChange` runs.
// `skipNextSave.current = false`.
// State updates.
// `useEffect` runs. `skipNextSave.current` is `false`.
// Starts 1000ms timer.
// Timer finishes. `handleSave()` called.
// `setDoc` executes.
// Local `onSnapshot` fires.
// `finalData` === `currentData`. Returns `currentData`.
// NO state update.
// Server `onSnapshot` fires.
// `finalData` === `currentData`. Returns `currentData`.
// NO state update.
// THIS ALL WORKS PERFECTLY!

// THEN WHY IS THE USER SAYING "SAVE nhi horaha"?
// IS IT FAILING TO SAVE?
// Is there a case where `finalData !== currentData` AFTER `handleSave`?
// YES!
// Look at `handleSave`:
//       Object.entries(targetData).forEach(([id, data]: [string, any]) => {
//         const email = (data.email || "").trim();
//         const password = (data.password || "").trim();
//         if (email && password) {
//           credentials.push({
//             ...
//           });
//         }
//       });
//       const docRef = doc(db, "adminSettings", "credentials");
//       await setDoc(docRef, {
//         ownerPanelCredentials: targetData,
//         officialCredentials: credentials
//       }, { merge: true });
//
// In `onSnapshot`:
//       (docSnap: any) => {
//         if (docSnap.exists()) {
//           const serverData = docSnap.data().ownerPanelCredentials || {};
//           const mergedData = getDefaultIdsData();
//           Object.keys(getDefaultIdsData()).forEach(id => {
//             if (serverData[id]) {
//               mergedData[id as keyof typeof mergedData] = {
//                 email: serverData[id].email || "",
//                 password: serverData[id].password || ""
//               };
//             }
//           });
//           setIdsData(currentData => {
//             const finalData = JSON.parse(JSON.stringify(mergedData));
//             ...
//
// Is `finalData` always equal to `targetData` (which is `idsData`)?
// Let's check `targetData`:
// If `targetData` has extra spaces!
// User types "test ".
// `handleChange` sets `email` to "test ".
// `handleSave` does: `const email = (data.email || "").trim();` BUT WAIT!
// `trim()` is ONLY applied when pushing to `credentials` array!
// `await setDoc(..., { ownerPanelCredentials: targetData, ... })`
// It saves `targetData` EXACTLY AS IT IS.
// So `ownerPanelCredentials` in Firestore gets "test ".
// Then `onSnapshot` reads "test ".
// `mergedData` gets "test ".
// `finalData` gets "test ".
// `currentData` has "test ".
// They are exactly equal!
//
// So when does `finalData !== currentData` happen?
// What if `serverData` has NO data for "500001"?
// But `getDefaultIdsData` has `{ email: "", password: "" }`.
// `mergedData["500001"]` will be `{ email: "", password: "" }`.
// `currentData["500001"]` will be `{ email: "", password: "" }`.
// Still exactly equal!

// WAIT! What if the user is typing in a field, and `focusedField.current` is SET!
// User focuses "500001-email". `focusedField.current = "500001-email"`.
// User types "H". `handleChange` sets "H".
// `useEffect` sets 1000ms timer.
// `handleSave` saves "H".
// `onSnapshot` runs.
// `serverData` has "H".
// `mergedData` has "H".
// BUT WAIT!
//             if (focusedField.current) {
//               const [focusedId, focusedKey] = focusedField.current.split('-');
//               if (finalData[focusedId] && currentData[focusedId]) {
//                 finalData[focusedId][focusedKey] = currentData[focusedId][focusedKey];
//               }
//             }
// Here, `finalData` gets overwritten by `currentData` for the focused field.
// `finalData["500001"]["email"]` is set to "H" (from `currentData`).
// This is STILL "H".
// So `finalData === currentData`.
// Returns `currentData`.

// SO WHEN DOES THE BUG HAPPEN???
// "Owner panel m GMAIL, PASSWORD SAVE nhi horaha"
// Is it NOT saving at all?
// WHAT IF `isLoadedFromFirestore.current` is ALWAYS `false`???
//   const isLoadedFromFirestore = useRef(false);
//   useEffect(() => { ... onSnapshot ...
//     if (docSnap.exists()) {
//       setIdsData(currentData => { ...
//         isLoadedFromFirestore.current = true;
//       });
//     } else {
//       isLoadedFromFirestore.current = true;
//     }
//   }, ...
// It is set to `true` when the first snapshot arrives.
// BUT WAIT!
// `setIdsData(currentData => { ... isLoadedFromFirestore.current = true; ... })`
// This is inside the state updater function!
// State updater functions are PURE! They shouldn't have side effects like mutating refs!
// In React Strict Mode, state updater functions run TWICE!
// But running twice and setting a ref to `true` twice is harmless.

// What if the user types something BEFORE the first snapshot arrives?
// `handleChange` runs. `skipNextSave.current = false`. State updates.
// `useEffect` runs. `isLoadedFromFirestore.current` is `false`!
// IT RETURNS EARLY!
// The 1000ms timer is NEVER STARTED!
// Then the first snapshot arrives.
// It overwrites the user's typing with the server data!
// AND it sets `isLoadedFromFirestore.current = true`.
// But the user's typing is GONE and NEVER SAVED!
// This explains a loss of initial keystrokes. But what about continuous typing?

// Let's review the `useEffect` for auto-saving:
//   useEffect(() => {
//     if (skipNextSave.current) {
//       skipNextSave.current = false;
//       return;
//     }
//
//     if (!isLoadedFromFirestore.current) {
//       return;
//     }
//
//     const timeoutId = setTimeout(() => {
//       handleSave();
//     }, 1000);
//
//     return () => clearTimeout(timeoutId);
//   }, [idsData, handleSave]);
//
// Let's trace carefully:
// 1. User is idle. `idsData` is stable.
// 2. User types "H" in an input.
// 3. `handleChange` runs:
//      `skipNextSave.current = false;`
//      `setIdsData(prev => ... "H" ...)`
// 4. React re-renders with new `idsData`.
// 5. `useEffect` runs because `idsData` changed.
// 6. `skipNextSave.current` is `false`. So we don't return early.
// 7. `isLoadedFromFirestore.current` is `true`.
// 8. We set a timeout for 1000ms.
// 9. After 1000ms, `handleSave()` is called.
// 10. `setDoc` executes. This triggers a local `onSnapshot` IMMEDIATELY.
// 11. `onSnapshot` callback runs:
//       `serverData` contains "H" (from local cache).
//       `mergedData` is constructed with "H".
//       `setIdsData` state updater runs:
//         `finalData` has "H".
//         `currentData` has "H".
//         They are strictly equal!
//         Returns `currentData`.
// 12. Since state updater returned EXACTLY `currentData`, React bails out! NO RE-RENDER!
// 13. Because there's no re-render, `skipNextSave.current` REMAINS `false`!
// 14. `isLoadedFromFirestore.current` is still `true`.
// 15. Then, the ACTUAL server response arrives (latency could be 100ms or 2 seconds).
// 16. `onSnapshot` callback runs:
//       `serverData` contains "H" (from server).
//       `mergedData` is constructed with "H".
//       `setIdsData` state updater runs:
//         `finalData` has "H".
//         `currentData` has "H".
//         They are strictly equal!
//         Returns `currentData`.
// 17. React bails out. NO RE-RENDER!
// 18. This is PERFECT!

// WAIT. WHAT IF `currentData` IS NOT EQUAL TO `finalData`?
// Why would they be different?
// Suppose `getDefaultIdsData()` returns objects with order of keys `{ email: "", password: "" }`.
// `handleChange` does: `[id]: { ...prev[id], [field]: value }`.
// This preserves key order.
// `JSON.stringify` relies on key order!
// Wait! `mergedData` is constructed by:
//             mergedData[id as keyof typeof mergedData] = {
//               email: serverData[id].email || "",
//               password: serverData[id].password || ""
//             };
// `handleChange` modifies `email` or `password`. The key order in the nested object is still `email` then `password` (because `{...prev}` spreads `email` then `password`, and `[field]: value` overwrites it in place, preserving order in modern JS!).
// SO `JSON.stringify` WILL MATCH!

// WHAT IF the user types something ELSE while the server request is in flight?
// 1. User types "H". `skipNextSave` = false. Timeout 1000ms.
// 2. 1000ms passes. `handleSave()` runs. `setDoc` runs.
// 3. Local `onSnapshot` fires. Equal. No render.
// 4. User types "e". `skipNextSave` = false.
// 5. State updates to "He".
// 6. `useEffect` runs. `skipNextSave` is `false`. Timeout 1000ms.
// 7. Server `onSnapshot` for "H" arrives!
// 8. `onSnapshot` runs.
//      `serverData` contains "H".
//      `mergedData` contains "H".
//      `setIdsData` state updater runs:
//         `currentData` is "He".
//         `focusedField.current` is SET! (User is still focused on the input!).
//         ```
//             if (focusedField.current) {
//               const [focusedId, focusedKey] = focusedField.current.split('-');
//               if (finalData[focusedId] && currentData[focusedId]) {
//                 finalData[focusedId][focusedKey] = currentData[focusedId][focusedKey];
//               }
//             }
//         ```
//         `finalData[focusedId]["email"]` becomes "He" (copied from `currentData`).
//         NOW `finalData` has "He".
//         `currentData` has "He".
//         Are they equal? YES!
//         `JSON.stringify(currentData) === JSON.stringify(finalData)` IS TRUE!
//         Returns `currentData`.
// 9. React bails out. NO RE-RENDER!
// 10. The 1000ms timeout for "He" continues!
// 11. It fires, saves "He".

// EVERYTHING WORKS PERFECTLY!!!

// THEN WHAT IS THE BUG???
// "Owner panel m GMAIL, PASSWORD SAVE nhi horaha"
