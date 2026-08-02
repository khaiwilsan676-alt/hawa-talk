// If we look at the effect that calls handleSave:
// useEffect(() => {
//   if (!isLocalUpdate.current) return;
//   const timeoutId = setTimeout(() => {
//     handleSave();
//   }, 1000);
//   return () => clearTimeout(timeoutId);
// }, [idsData, handleSave]);

// The problem is that when handleSave completes, `isLocalUpdate.current` is STILL true.
// Because it's never set to false in handleSave!
// Wait, the onSnapshot sets it to false.
// But if there's no internet, or firestore fails, onSnapshot might not be triggered immediately.
// Or if the save succeeds, onSnapshot triggers, sets isLocalUpdate.current = false.
// BUT there is a bug here:
// When the debounced handleSave runs, it awaits setDoc.
// Let's trace it:
// 1. handleChange changes state, sets isLocalUpdate.current = true.
// 2. React re-renders, useEffect runs. Sets timeout for 1000ms.
// 3. User types again. handleChange sets state.
// 4. Timeout cleared, new timeout for 1000ms.
// 5. Timeout fires, calls handleSave().
// 6. handleSave awaits setDoc.
// 7. onSnapshot fires locally immediately (latency compensation), sees isLocalUpdate.current == true.
// 8. onSnapshot sets isLocalUpdate.current = false, returns!
// 9. When handleSave completes, it DOES NOT set isLocalUpdate.current = false.

// BUT wait!
// When the real onSnapshot from the server fires, isLocalUpdate.current is now false!
// So it WILL update the state with the docSnap data!
// This actually shouldn't cause a bug of "GMAIL, PASSWORD SAVE nhi horaha", UNLESS it reverts the state?
// If it reverts the state, it's because docSnap.data() is stale? No, from server it's fresh.
// Let's check `handleChange`:
//   const handleChange = (id: string, field: string, value: string) => {
//     isLocalUpdate.current = true;
//     setIdsData((prev) => ({
//       ...prev,
//       [id]: { ...prev[id], [field]: value },
//     }));
//   };

// Let's remove the whole `if (isLocalUpdate.current) { isLocalUpdate.current = false; return; }` logic
// and simply compare if the incoming data is deeply equal?
// Actually, no. The bug is that `isLocalUpdate.current` is being set to false prematurely, or preventing the first local save?
// The user says: "Owner panel m GMAIL, PASSWORD SAVE nhi horaha kyuu real time save hojeyga globally Bss Without any error"
// Wait! If they say "Owner panel m GMAIL, PASSWORD SAVE nhi horaha" (Owner panel GMAIL, PASSWORD IS NOT SAVING)
// "kyuu real time save hojeyga globally" (because it will be saved in real time globally)
// "Bss Without any error" (Just without any error)

// Wait! If they try to type, it doesn't save?
// Let's look at the actual error! When I ran playwright, I got "Firestore (12.16.0): Database '(default)' not found."
// But in the user's real app, they have valid credentials.

// Wait. Look at handleSave.
// ```javascript
//   const handleSave = useCallback(async () => {
//     try {
//       // ...
//     } catch (error) {
//       console.error("Error saving credentials:", error);
//     }
//   }, [idsData]);
// ```
// If `isLocalUpdate.current` is set to `true`, and then the `onSnapshot` runs and sets it to `false`.
// Then what?

// Wait! The problem is that the useEffect for debouncing is:
// ```javascript
//   useEffect(() => {
//     if (!isLocalUpdate.current) return;
//     const timeoutId = setTimeout(() => {
//       handleSave();
//     }, 1000);
//     return () => clearTimeout(timeoutId);
//   }, [idsData, handleSave]);
// ```
// Here, `handleSave` has `idsData` in its dependency array.
// `handleSave` changes on EVERY render when `idsData` changes.
// So `idsData` changes -> `handleSave` changes -> `useEffect` runs -> sets timeout.
// When timeout runs, it calls `handleSave`.
// BUT, `isLocalUpdate.current` might be `false`?
// No, when `idsData` changes, `handleChange` sets `isLocalUpdate.current = true`.

// Actually, wait! In `handleSave`, it saves:
//       const docRef = doc(db, "adminSettings", "credentials");
//       await setDoc(docRef, {
//         ownerPanelCredentials: idsData,
//         officialCredentials: credentials
//       }, { merge: true });

// BUT what happens when `onSnapshot` runs?
// ```javascript
//   useEffect(() => {
//     const docRef = doc(db, "adminSettings", "credentials");
//     const unsubscribe = onSnapshot(
//       docRef,
//       (docSnap) => {
//         if (isLocalUpdate.current) {
//           // Skip updating state if the change originated locally
//           isLocalUpdate.current = false;
//           return;
//         }
// ```
// If the user types "A", `isLocalUpdate.current` becomes `true`.
// `idsData` state updates.
// The `onSnapshot` might NOT be triggered immediately because `setDoc` hasn't been called yet.
// So `isLocalUpdate.current` REMAINS `true`.
// 1000ms later, `handleSave` runs.
// `handleSave` calls `setDoc`.
// This triggers `onSnapshot` LOCALLY (latency compensation).
// `onSnapshot` sees `isLocalUpdate.current` is `true`.
// It sets `isLocalUpdate.current = false`, and returns.
// THEN, `handleSave` finishes, and maybe a real server snapshot triggers.
// The real server snapshot triggers, sees `isLocalUpdate.current` is `false`.
// It updates the state using `docSnap.data()`.
// Since the data is the same (because we just saved it), it updates the state with the same data.
// So far, no data loss.

// What if the user types "A", then 500ms later types "B"?
// 1. types "A" -> isLocalUpdate = true.
// 2. types "B" -> isLocalUpdate = true.
// 3. 1000ms later -> handleSave runs with "AB".
// 4. setDoc called with "AB".
// 5. local onSnapshot fires. isLocalUpdate = true -> false. returns.
// 6. server onSnapshot fires with "AB". isLocalUpdate = false. State updated with "AB".
// Everything seems fine.

// What if the user types "A", and BEFORE 1000ms passes, ANOTHER user's changes arrive via onSnapshot?
// 1. User 1 types "A". isLocalUpdate = true.
// 2. Server onSnapshot arrives for User 2's changes.
// 3. onSnapshot sees isLocalUpdate = true.
// 4. It sets isLocalUpdate = false and RETURNS. (Wait! It ignored User 2's changes!)
// But this is just a missed update, which isn't the main issue.

// Wait, the main issue:
// "Owner panel m GMAIL, PASSWORD SAVE nhi horaha kyuu real time save hojeyga globally Bss Without any error"
// Is it because `idsData` is NOT deeply copied properly, and we are mutating state?
// Let's check `handleChange`:
// ```javascript
//   const handleChange = (id: string, field: string, value: string) => {
//     isLocalUpdate.current = true;
//     setIdsData((prev) => ({
//       ...prev,
//       [id]: { ...prev[id], [field]: value },
//     }));
//   };
// ```
// This looks correct (shallow copy of prev, shallow copy of prev[id]).

// Let's check the button!
// ```javascript
//             <button
//               onClick={() => handleSave()}
//               className="w-full py-4 bg-blue-600 hover:bg-blue-500 active:scale-98 text-white font-bold text-base rounded-xl shadow-lg shadow-blue-200 transition flex items-center justify-center gap-2 cursor-pointer"
//             >
//               <Save className="w-5 h-5" /> Save All Credentials
//             </button>
// ```
// Wait, if I click the save button, `handleSave` is called manually.
// BUT `isLocalUpdate.current` might be `false` (if no typing happened recently, or if `onSnapshot` already reset it).
// If `handleSave` is called manually, it calls `setDoc`.
// This triggers `onSnapshot` LOCALLY.
// `onSnapshot` sees `isLocalUpdate.current` is `false`.
// It proceeds to update state.
// It gets `docSnap.data()`.
// `serverData` is `{ ... }`.
// It sets `idsData` state.
// This is also fine.

// Let's check the structure of what is saved vs what is loaded.
// SAVING:
//       const docRef = doc(db, "adminSettings", "credentials");
//       await setDoc(docRef, {
//         ownerPanelCredentials: idsData,
//         officialCredentials: credentials
//       }, { merge: true });

// LOADING:
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
//         }

// Is it because when `handleSave` saves `idsData`, it contains:
// {
//   "500001": { email: "...", password: "..." },
//   ...
// }
// Yes, `idsData` state matches exactly this structure.

// Wait, what if `docSnap.data().ownerPanelCredentials` doesn't exist initially?
// Then `serverData` is `{}`.
// `mergedData` is `defaultIdsData`.
// It calls `setIdsData(defaultIdsData)`.
// But wait! If `serverData` doesn't have the keys, it uses `defaultIdsData`!
// What if `serverData[id]` exists but lacks `email`?
//   email: serverData[id].email || "",

// WAIT... Look at the `isLocalUpdate` logic again.
// ```javascript
//   useEffect(() => {
//     if (!isLocalUpdate.current) return;
//     const timeoutId = setTimeout(() => {
//       handleSave();
//     }, 1000);
//     return () => clearTimeout(timeoutId);
//   }, [idsData, handleSave]);
// ```
// If `handleSave` calls `setDoc`.
// `setDoc` updates Firestore.
// `onSnapshot` is triggered LOCALLY by Firestore due to the local write.
// `onSnapshot` runs:
// ```javascript
//         if (isLocalUpdate.current) {
//           // Skip updating state if the change originated locally
//           isLocalUpdate.current = false;
//           return;
//         }
// ```
// So it skips updating state, and sets `isLocalUpdate.current = false`.
// ALL GOOD.

// NOW, what happens on the next render?
// `handleSave` completes. `isLocalUpdate.current` is `false`.
// Does the server send ANOTHER snapshot?
// Yes, usually Firestore sends a local snapshot (hasPendingWrites=true), then a server snapshot (hasPendingWrites=false).
// When the server snapshot arrives, `isLocalUpdate.current` is `false`.
// So it DOES NOT return early.
// It proceeds to:
// ```javascript
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
// AND THEN IT SETS STATE!
// By setting state, it triggers a re-render!
// Wait... if `setIdsData` is called, React re-renders.
// `idsData` is a NEW OBJECT reference.
// The `useEffect` for debounced auto-save runs again!
// ```javascript
//   useEffect(() => {
//     if (!isLocalUpdate.current) return;
// ...
// ```
// Ah! `isLocalUpdate.current` is `false`, so it returns early!
// So it does NOT trigger another auto-save!
// This is completely correct!

// Let me look at the `handleSave` function again.
// ```javascript
//   const handleSave = useCallback(async () => {
//     try {
//       const credentials: any[] = [];
//       Object.entries(idsData).forEach(([id, data]: [string, any]) => {
//         const email = (data.email || "").trim();
//         const password = (data.password || "").trim();
//         if (email && password) {
//           credentials.push({
//             id: id,
//             email: email,
//             password: password,
//             type: id.startsWith('5') ? 'official' : 'admin'
//           });
//         }
//       });
// ```
// Wait. What if `idsData` has NO filled email/passwords?
// `credentials` will be `[]`.
// `setDoc` will set `officialCredentials: []`.
// That's fine.

// Is there a bug in `handleSave` useCallback dependencies?
// `const handleSave = useCallback(async () => { ... }, [idsData]);`
// `handleSave` depends on `idsData`.
// This means every time `idsData` changes, `handleSave` is a new function reference.
// The `useEffect` depends on `[idsData, handleSave]`.
// So it correctly resets the timeout.

// What if the user types quickly?
// 1. types "A": isLocalUpdate = true. setTimeout(1000).
// 2. types "B" (at 500ms): isLocalUpdate = true. clearTimeout. setTimeout(1000).
// 3. at 1500ms: timeout fires. handleSave() uses `idsData` with "AB".
// 4. `setDoc` runs.
// 5. local snapshot: `isLocalUpdate = true`, so it returns, and sets `isLocalUpdate = false`.
// 6. server snapshot: `isLocalUpdate = false`. It sets state with "AB".
// 7. This state set triggers re-render, BUT it's the SAME data (deeply), but a NEW object reference!
// Wait! It sets state with a NEW object reference.
// So React re-renders.
// But `isLocalUpdate.current` is `false`. So `useEffect` does NOT set a timeout.
// But WAIT!
// When the server snapshot sets state with "AB", `idsData` changes!
// So `handleSave` is re-created with the NEW `idsData` reference.
// But we just said `isLocalUpdate.current` is `false`, so the `useEffect` returns early!
// So no infinite loop.

// BUT wait... what if the user types "C" RIGHT AFTER the server snapshot arrives?
// 1. Server snapshot arrives, sets state to "AB". `idsData` is now the server's "AB".
// 2. User types "C". `idsData` becomes "ABC". `isLocalUpdate` = true.
// 3. Timeout starts for 1000ms.
// 4. Everything works perfectly!

// SO WHAT IS THE BUG?
// "Owner panel m GMAIL, PASSWORD SAVE nhi horaha kyuu real time save hojeyga globally Bss Without any error"
// Is it because we are using `isLocalUpdate` globally across ALL fields?
// Yes! `isLocalUpdate` is a single boolean.
// What if User 1 is typing, and User 2 is also typing?
// Well, there is NO collaborative editing logic here (OT/CRDT). Last write wins.

// WAIT! What if the user clicks the "Save All Credentials" button?
// If they click the button, `handleSave` runs.
// Does it work? Yes.

// Wait. Look at the data fetching in `useEffect`:
// ```javascript
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
// If `docSnap.data()` exists but `ownerPanelCredentials` is undefined, `serverData` is `{}`.
// Then `mergedData` remains `{ ...defaultIdsData }`.
// Wait...
// `const mergedData = { ...defaultIdsData };`
// Because `defaultIdsData` is an object of objects, doing a SHALLOW clone:
// `const mergedData = { ...defaultIdsData };`
// means `mergedData["500001"]` IS THE SAME REFERENCE as `defaultIdsData["500001"]`!
// ```javascript
//           Object.keys(defaultIdsData).forEach(id => {
//             if (serverData[id]) {
//               mergedData[id as keyof typeof mergedData] = {
//                 email: serverData[id].email || "",
//                 password: serverData[id].password || ""
//               };
//             }
//           });
// ```
// If `serverData[id]` does NOT exist, `mergedData[id]` keeps pointing to `defaultIdsData[id]`.
// Is that a problem?
// YES! If `mergedData[id]` points to `defaultIdsData[id]`, when `handleChange` runs:
// ```javascript
//   const handleChange = (id: string, field: string, value: string) => {
//     isLocalUpdate.current = true;
//     setIdsData((prev) => ({
//       ...prev,
//       [id]: { ...prev[id], [field]: value },
//     }));
//   };
// ```
// `handleChange` does a shallow copy of `prev[id]`, which creates a new object. So `defaultIdsData` is NOT mutated.
// This is not a bug.

// What if the bug is something else?
// The user says: "Owner panel m GMAIL, PASSWORD SAVE nhi horaha kyuu real time save hojeyga globally Bss Without any error"
// Is it because `onSnapshot` is missing a dependency?
// No, `useEffect` for `onSnapshot` has `[]` as dependency. It runs once.
// It calls `setIdsData`. `setIdsData` works.

// BUT LOOK AT THIS:
// ```javascript
//     const unsubscribe = onSnapshot(
//       docRef,
//       (docSnap) => {
//         if (isLocalUpdate.current) {
//           // Skip updating state if the change originated locally
//           isLocalUpdate.current = false;
//           return;
//         }
// ```
// What if `handleSave` is called manually (by button click)?
// `isLocalUpdate.current` is `false`.
// `handleSave` is called.
// `setDoc` triggers local `onSnapshot`.
// `isLocalUpdate.current` is `false`.
// So it DOES NOT return early!
// It continues, gets data from `docSnap.data()`.
// This is fine, it just resets state to the same data.

// BUT wait!
// What if `handleSave` is debounced, and `isLocalUpdate.current` was `true`.
// The user types "A". `isLocalUpdate.current` = `true`.
// 1000ms passes. `handleSave` called.
// User types "B" EXACTLY when `handleSave` is running!
// `handleChange` sets `isLocalUpdate.current = true`.
// `setDoc` finishes, triggers local `onSnapshot`.
// `onSnapshot` sees `isLocalUpdate.current = true`. It sets it to `false` and returns.
// But wait, the user typed "B" BEFORE `onSnapshot` ran, but AFTER `handleSave` started!
// So `isLocalUpdate` was `true`, it got reset to `false`.
// Then the timeout for "B" fires 1000ms later.
// `handleSave` saves "B".
// This is slightly race-condition-y but shouldn't cause complete failure to save.

// Look closely at `handleSave`:
// ```javascript
//   const handleSave = useCallback(async () => {
//     try {
//       const credentials: any[] = [];
//       Object.entries(idsData).forEach(([id, data]: [string, any]) => {
//         const email = (data.email || "").trim();
//         const password = (data.password || "").trim();
//         if (email && password) {
//           credentials.push({
//             id: id,
//             email: email,
//             password: password,
//             type: id.startsWith('5') ? 'official' : 'admin'
//           });
//         }
//       });
// ```
// What if I type just the email, but not the password?
// `email && password` is `false`.
// So `credentials.push(...)` is skipped!
// `credentials` array won't have this user!
// BUT `idsData` DOES have the email.
// `setDoc` will save:
//       await setDoc(docRef, {
//         ownerPanelCredentials: idsData,
//         officialCredentials: credentials
//       }, { merge: true });
// It saves BOTH `ownerPanelCredentials` (which contains incomplete emails) AND `officialCredentials` (which only contains complete ones).
// That seems correct.

// Wait. When I type something into the email field, it triggers `handleChange`:
// ```javascript
//   const handleChange = (id: string, field: string, value: string) => {
//     isLocalUpdate.current = true;
//     setIdsData((prev) => ({
//       ...prev,
//       [id]: { ...prev[id], [field]: value },
//     }));
//   };
// ```
// Does it trigger `handleSave`?
// Yes, via the effect:
// ```javascript
//   useEffect(() => {
//     if (!isLocalUpdate.current) return;
//     const timeoutId = setTimeout(() => {
//       handleSave();
//     }, 1000);
//     return () => clearTimeout(timeoutId);
//   }, [idsData, handleSave]);
// ```
// Wait. Is it possible that `handleSave` is closing over STALE `idsData`?
// No, `handleSave` is recreated because `idsData` is in its dependency array.

// WAIT. LOOK AT THE RENDER!
// `idsData` is passed to the inputs:
// `<input value={idsData[id]?.email || ""} ... />`
// Everything seems perfectly fine!

// BUT wait... what if `isLocalUpdate.current = false; return;` is BAD?
// Let's think about Firestore latency compensation.
// When you call `setDoc`, Firestore IMMEDIATELY fires `onSnapshot` with the new data.
// It fires it with the new data!
// If we SKIP updating the state, we keep our local `idsData` state.
// BUT then Firestore might fire `onSnapshot` AGAIN when the server confirms the write!
// When the server confirms the write, it fires `onSnapshot` again!
// During this SECOND `onSnapshot`, `isLocalUpdate.current` is `false`!
// So it WILL update the state!
// It updates the state with the server data, which is IDENTICAL to our local data.
// So why does the user complain?
// "Owner panel m GMAIL, PASSWORD SAVE nhi horaha kyuu real time save hojeyga globally Bss Without any error"
// Translation: "In Owner panel, GMAIL, PASSWORD IS NOT SAVING, why? It should save in real time globally, just without any error."
