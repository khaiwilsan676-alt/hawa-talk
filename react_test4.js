// Wait! What if the user types "A" in email, and "B" in password?
// Email: handleChange("500001", "email", "A")
// Password: handleChange("500001", "password", "B")
// Both work.

// What if they click "Save"?
// It saves.

// Wait. Is the issue that `idsData` state NEVER actually updates on other clients?
// Let's trace it.
// Client 1 types "A". `isLocalUpdate.current = true`.
// Timeout 1s. `handleSave` saves.
// `setDoc` updates Firestore.
// Client 2 receives `onSnapshot`.
// Client 2's `isLocalUpdate.current` is `false`.
// Client 2 updates `idsData` state to "A".
// Client 2 sees "A".
// It works perfectly!

// SO WHY IS IT NOT SAVING?
// Let's re-read the code very carefully.
// ```javascript
//   const handleChange = (id: string, field: string, value: string) => {
//     isLocalUpdate.current = true;
//     setIdsData((prev) => ({
//       ...prev,
//       [id]: { ...prev[id], [field]: value },
//     }));
//   };
// ```
// ```javascript
//   const handleSave = useCallback(async () => {
//     try { ...
// ```
// ```javascript
//   useEffect(() => {
//     if (!isLocalUpdate.current) return;
//     const timeoutId = setTimeout(() => {
//       handleSave();
//     }, 1000);
//     return () => clearTimeout(timeoutId);
//   }, [idsData, handleSave]);
// ```
// Wait. What if `isLocalUpdate.current` is `true`.
// `timeoutId` starts.
// BEFORE 1000ms, `handleSave` is NOT CALLED yet.
// Then `onSnapshot` fires!
// Why would `onSnapshot` fire BEFORE 1000ms?
// Suppose Client 2 saves something. Client 1 receives `onSnapshot`!
// Client 1's `isLocalUpdate.current` is `true`!
// So Client 1's `onSnapshot` returns early:
// ```javascript
//         if (isLocalUpdate.current) {
//           isLocalUpdate.current = false;
//           return;
//         }
// ```
// And `isLocalUpdate.current` becomes `false`.
// Then Client 1's timeout fires, saves Client 1's local changes (overwriting Client 2's changes).
// This is typical last-write-wins. It shouldn't prevent saving!

// WHAT IF the problem is that `isLocalUpdate.current` is set to `false` by `onSnapshot` BEFORE the user finishes typing?
// Suppose the user types "A". `isLocalUpdate = true`.
// Firestore triggers a delayed `onSnapshot` from a PREVIOUS save (like the server confirming the write).
// It sets `isLocalUpdate = false`.
// Now the user types "B". `handleChange` sets `isLocalUpdate = true`.
// This seems fine!

// Wait... what if `idsData` is NOT updating in `handleSave` because `handleSave` is cached?
// `handleSave` has `[idsData]` in its dependency array. It shouldn't be stale.

// What if `onSnapshot` triggers CONTINUOUSLY?
// No, it only triggers on data change.

// Wait. Look at the `isLocalUpdate.current = false` inside `onSnapshot`.
// If I type a letter, `isLocalUpdate` becomes `true`.
// The debouncer starts a 1-second timer.
// When the timer finishes, `handleSave` calls `setDoc`.
// This `setDoc` will trigger `onSnapshot` locally immediately.
// In `onSnapshot`, `isLocalUpdate` is `true`, so it skips state update and sets `isLocalUpdate` to `false`.
// THEN, a few milliseconds later, the server acknowledges the write.
// This triggers `onSnapshot` AGAIN! (Because the `metadata.hasPendingWrites` changes from `true` to `false`!).
// But wait! By default, `onSnapshot` does NOT trigger for metadata-only changes unless `includeMetadataChanges: true` is set!
// In our code: `onSnapshot(docRef, (docSnap) => { ... })`
// It does NOT include metadata changes!
// So it does NOT trigger again!
// BUT wait, if it DOES trigger again for some reason (e.g. server timestamp, which we don't use here),
// `isLocalUpdate` is now `false`.
// So it WILL update the state!
// It sets `idsData` to the SAME data that was just saved.
// This is harmless.

// BUT wait... what if we type ANOTHER character during that 1 second?
// Type "H". `isLocalUpdate` = `true`. Timer starts.
// Type "e" (after 500ms). `isLocalUpdate` = `true`. Timer restarts.
// After 1 second, `handleSave` runs. `setDoc` called.
// Local `onSnapshot` fires. `isLocalUpdate` is `true`. It sets `isLocalUpdate` to `false` and skips.
// All good.

// So what is the bug?
// "Owner panel m GMAIL, PASSWORD SAVE nhi horaha kyuu real time save hojeyga globally Bss Without any error"
// Is it because `idsData` in the useEffect dependency array causes an infinite loop?
// No, because `!isLocalUpdate.current` returns early.

// Let's re-read: "SAVE nhi horaha kyuu real time save hojeyga globally"
// If it's NOT saving... maybe `idsData` is not being passed correctly to Firestore?
// Look at `idsData` inside `handleSave`:
// ```javascript
//   const handleSave = useCallback(async () => {
//     try {
//       const credentials: any[] = [];
//       Object.entries(idsData).forEach(([id, data]: [string, any]) => {
//         const email = (data.email || "").trim();
//         const password = (data.password || "").trim();
//         if (email && password) {
// ```
// Wait! If they only type an email, `email && password` is FALSE.
// So `credentials` array is EMPTY.
// So `officialCredentials` will be EMPTY!
// BUT `ownerPanelCredentials` will be `idsData`.
// And `setDoc` does `{ merge: true }`.
// Wait! `setDoc(docRef, { ownerPanelCredentials: idsData, officialCredentials: credentials }, { merge: true })`
// If `ownerPanelCredentials` is passed, it merges it!
// Is there a bug where it throws an error?
// No.

// Wait. Is the bug that `onSnapshot` does NOT merge correctly?
// ```javascript
//         if (docSnap.exists()) {
//           const serverData = docSnap.data().ownerPanelCredentials || {};
//           // Merge with defaults to ensure all IDs exist
//           const mergedData = { ...defaultIdsData };
//           Object.keys(defaultIdsData).forEach(id => {
//             if (serverData[id]) {
//               mergedData[id as keyof typeof mergedData] = {
//                 email: serverData[id].email || "",
//                 password: serverData[id].password || ""
//               };
//             }
//           });
//           setIdsData(mergedData);
// ```
// If `serverData` contains ONLY updated fields?
// No, `handleSave` saves the ENTIRE `idsData` object.
// So `ownerPanelCredentials` has all 8 IDs.

// Look at the UI!
// `<input value={idsData[id]?.email || ""} onChange={(e) => handleChange(id, "email", e.target.value)} />`
// This perfectly binds to `idsData`.

// What if the user types quickly and clicks "Save All Credentials" immediately?
// `onClick={() => handleSave()}`
// `handleSave` is called. It works.

// Could it be that `isLocalUpdate.current = false` inside `onSnapshot` is WRONG?
// Imagine this:
// 1. User types "H". `isLocalUpdate.current = true`. Timer starts.
// 2. Timer fires after 1s. `handleSave` called.
// 3. `setDoc` executes.
// 4. Firestore triggers local `onSnapshot` IMMEDIATELY.
// 5. In `onSnapshot`, `isLocalUpdate.current` is `true`. It sets it to `false` and skips updating state.
// 6. User continues typing: "e".
// 7. `handleChange` runs: `isLocalUpdate.current = true`, `setIdsData` updates state to "He".
// 8. Wait! What if the server response for "H" comes BACK right now?
// 9. Firestore triggers `onSnapshot` AGAIN for the server response!
// 10. `onSnapshot` runs!
// 11. What is `isLocalUpdate.current`?
// It was set to `true` in step 7!
// 12. So `onSnapshot` sees `isLocalUpdate.current === true`!
// 13. It sets `isLocalUpdate.current = false` and SKIPS updating the state!
// 14. What happens to the "He" that the user just typed?
// The timer for "He" is running (started in step 7).
// It will fire in 1s.
// When it fires, it calls `handleSave` with "He".
// `setDoc` executes for "He".
// Local `onSnapshot` fires. `isLocalUpdate.current` is `false` (set in step 13)!
// 15. Wait. If `isLocalUpdate.current` is `false`, then `onSnapshot` WILL NOT SKIP!
// 16. It will UPDATE THE STATE to "He" (which is what `docSnap.data()` has from the local write).
// 17. The state is updated to "He".
// This doesn't seem to break anything or cause data loss.

// BUT wait... what if the problem is:
// User clicks "Save All Credentials".
// `handleSave` is called.
// `setDoc` executes.
// `onSnapshot` fires.
// Since it was a manual click, `isLocalUpdate.current` might be `false` (if 1s has passed since last typing, or if there was no typing).
// `onSnapshot` runs. `isLocalUpdate.current` is `false`.
// It updates the state using `docSnap.data()`.
// This works perfectly.

// So why is it NOT SAVING globally?
// Ah! Look at `handleSave` AGAIN.
// ```javascript
//   const handleSave = useCallback(async () => {
//     try {
//       // ...
//       const docRef = doc(db, "adminSettings", "credentials");
//       await setDoc(docRef, {
//         ownerPanelCredentials: idsData,
//         officialCredentials: credentials
//       }, { merge: true });
// ```
// What if we remove `isLocalUpdate.current = false` entirely, and simply check deep equality?
// OR, the user is saying "GMAIL, PASSWORD SAVE nhi horaha" because they EXPECT real-time saving on EVERY keystroke GLOBALLY, but because of the debouncer, it takes 1 second, and if they close the app before 1 second, it doesn't save?
// No, 1 second is very fast.

// Wait. Let's look at `isLocalUpdate.current = true;` inside `handleChange`:
// ```javascript
//   const handleChange = (id: string, field: string, value: string) => {
//     isLocalUpdate.current = true;
//     setIdsData((prev) => ({
//       ...prev,
//       [id]: { ...prev[id], [field]: value },
//     }));
//   };
// ```
// This triggers a re-render.
// `useEffect` runs:
// ```javascript
//   useEffect(() => {
//     if (!isLocalUpdate.current) return;
//     const timeoutId = setTimeout(() => {
//       handleSave();
//     }, 1000);
//     return () => clearTimeout(timeoutId);
//   }, [idsData, handleSave]);
// ```
// What if `handleSave` fails silently?
// No, it logs "Error saving credentials!".

// Let's reconsider `isLocalUpdate` flag in `onSnapshot`:
// ```javascript
//         if (isLocalUpdate.current) {
//           // Skip updating state if the change originated locally
//           isLocalUpdate.current = false;
//           return;
//         }
// ```
// If User A is typing continuously (e.g., typing a long email).
// `handleChange` fires repeatedly.
// `isLocalUpdate` is kept at `true`.
// At some point (1s pause), `handleSave` runs.
// `setDoc` runs.
// `onSnapshot` triggers locally. `isLocalUpdate` becomes `false`.
// Then, the server `onSnapshot` arrives, `isLocalUpdate` is `false`.
// State is updated with `docSnap.data()`.
// If the user starts typing AGAIN, `isLocalUpdate` becomes `true`.

// WAIT! What if `idsData` has NOT been updated in `docSnap.data()` properly?
// When `onSnapshot` sets state, it sets it to `mergedData`.
// `mergedData` is built from `serverData`, which is `docSnap.data().ownerPanelCredentials`.
// If `ownerPanelCredentials` on the server matches exactly what we have, `setIdsData(mergedData)` sets a NEW OBJECT REFERENCE.
// Since `idsData` is a new object reference, the `useEffect` for auto-save re-runs!
// BUT `isLocalUpdate.current` is `false`. So it returns early.
// So far, so good.
