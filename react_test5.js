// Look at this:
//   const handleChange = (id: string, field: string, value: string) => {
//     isLocalUpdate.current = true;
//     setIdsData((prev) => ({
//       ...prev,
//       [id]: { ...prev[id], [field]: value },
//     }));
//   };

//   useEffect(() => {
//     if (!isLocalUpdate.current) return;
//     const timeoutId = setTimeout(() => {
//       handleSave();
//     }, 1000);
//     return () => clearTimeout(timeoutId);
//   }, [idsData, handleSave]);

// BUG:
// In `useEffect`, if `isLocalUpdate.current` is TRUE, it sets a timeout.
// When the timeout executes `handleSave()`, it uses the LATEST `idsData` (because `handleSave` has `idsData` in its dependencies, and the `useEffect` cleans up and re-runs on `idsData` change).
// BUT! When `handleSave()` executes, it calls `setDoc`.
// `setDoc` triggers `onSnapshot` LOCALLY.
// In `onSnapshot`:
//   if (isLocalUpdate.current) {
//     isLocalUpdate.current = false;
//     return;
//   }
// So `isLocalUpdate.current` becomes FALSE.
// BUT `idsData` DID NOT CHANGE in state yet!
// Then, when the server confirms the write, `onSnapshot` triggers AGAIN!
// Because `isLocalUpdate.current` is FALSE, it executes:
//   setIdsData(mergedData);
// THIS CHANGES `idsData` reference!
// This triggers the `useEffect` again.
// But `isLocalUpdate.current` is FALSE, so it returns early.
// THIS IS FINE!

// BUT what if `docSnap.exists()` is FALSE on the first load?
//   if (docSnap.exists()) {
//     ...
//   } else {
//     // use local storage
//   }
// That's fine.

// What if the user types quickly, and `handleSave` is called.
// Is it possible that `onSnapshot` overwrites the user's NEW typing?
// YES!
// Imagine this sequence:
// 1. User types "a". `isLocalUpdate` = true. `timeout` set.
// 2. 1000ms passes. `handleSave()` called for "a".
// 3. `setDoc()` executed.
// 4. Local `onSnapshot` fires for "a". `isLocalUpdate` becomes `false`.
// 5. User immediately types "b". `idsData` becomes "ab". `isLocalUpdate` becomes `true`.
// 6. Server `onSnapshot` fires for "a".
// 7. What is `isLocalUpdate`? It was set to `true` in step 5!
// 8. So Server `onSnapshot` for "a" sees `isLocalUpdate == true`.
// 9. It sets `isLocalUpdate = false` AND RETURNS!
// 10. Wait! The user's typing "b" set `isLocalUpdate = true`. The server snapshot for "a" reset it to `false`.
// 11. Now `isLocalUpdate` is `false`.
// 12. But the timeout for "ab" is ALREADY running (started in step 5).
// 13. When the timeout for "ab" fires after 1000ms, it calls `handleSave()`.
// 14. `setDoc()` executed for "ab".
// 15. Local `onSnapshot` fires for "ab".
// 16. What is `isLocalUpdate`? It is `false` (reset in step 9)!
// 17. So Local `onSnapshot` for "ab" DOES NOT RETURN EARLY!
// 18. It updates state with `docSnap.data()` (which is "ab").
// 19. State is updated to "ab".
// STILL NO DATA LOSS! "ab" was saved, state is "ab".

// THERE MUST BE ANOTHER REASON.
// Look at the UI for Owner Panel Login.
// "HAWA.IN", "HAWA.OWNER/CEO", "25/7/2026"
// It uses `localStorage.setItem('ownerPanelLoggedIn', 'true')`
// And `localStorage.setItem('ownerPanelCredentials', JSON.stringify(idsData));`
// Wait. Could `ownerPanelCredentials` in local storage be overriding something?
// In `onSnapshot`, if `docSnap.exists()` is true, it ignores local storage.

// Let's re-read the exact problem statement.
// "Owner panel m GMAIL, PASSWORD SAVE nhi horaha kyuu real time save hojeyga globally Bss Without any error"
// "Owner panel in GMAIL, PASSWORD SAVE not happening, why? real time save will happen globally just Without any error"
// Is there a typo in `handleSave`?
//   Object.entries(idsData).forEach(([id, data]: [string, any]) => {
//     const email = (data.email || "").trim();
//     const password = (data.password || "").trim();
//     if (email && password) {
//       credentials.push({
//         id: id,
//         email: email,
//         password: password,
//         type: id.startsWith('5') ? 'official' : 'admin'
//       });
//     }
//   });
// Wait. If the user only enters an email, but no password, `email && password` is falsy.
// So the ID is NOT added to `credentials`.
// Then:
//   await setDoc(docRef, {
//     ownerPanelCredentials: idsData,
//     officialCredentials: credentials
//   }, { merge: true });
// If the user expects it to be saved globally, maybe they are checking the `officialCredentials` array in the database?
// And since they only entered email OR password (not both), it doesn't get saved to `officialCredentials`?
// But it DOES get saved to `ownerPanelCredentials`.
// And in the Owner Panel, it loads from `ownerPanelCredentials`. So they would SEE it saved.

// Wait. Look at the `onSnapshot` inside `OwnerPanel`.
//   useEffect(() => {
//     const docRef = doc(db, "adminSettings", "credentials");
//     const unsubscribe = onSnapshot(docRef, (docSnap) => { ...
// It sets `idsData`.
// But wait! Look at the `handleSave` in `app/owner/page.tsx` again.
// Is `handleSave` working?
