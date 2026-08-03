// Look at `isLocalUpdate.current = false; return;` again!
// If I type "test@email.com", `isLocalUpdate` is true.
// The 1s timeout fires, `handleSave` saves.
// `setDoc` updates local cache immediately, and FIRES `onSnapshot` with `hasPendingWrites=true`.
// `isLocalUpdate` is TRUE.
// So `onSnapshot` DOES:
//   isLocalUpdate.current = false;
//   return; // SKIPS UPDATING STATE
//
// Then the server receives the write, and confirms it.
// Firestore FIRES `onSnapshot` AGAIN with `hasPendingWrites=false`.
// BUT `isLocalUpdate.current` is NOW FALSE.
// So it DOES NOT RETURN EARLY.
// It proceeds:
//   const serverData = docSnap.data().ownerPanelCredentials || {};
//   const mergedData = { ...defaultIdsData };
//   ...
//   setIdsData(mergedData);
//
// THIS CALLS `setIdsData`, which triggers a re-render.
// Is `mergedData` deep equal to `idsData`?
// Let's see: `serverData` is the newly saved `idsData`.
// Yes, `mergedData` is effectively deeply equal.
// BUT `setIdsData(mergedData)` gives a NEW OBJECT REFERENCE.
//
// Because `idsData` changed reference, the `useEffect` runs:
//   useEffect(() => {
//     if (!isLocalUpdate.current) return;
//     ...
//   }, [idsData, handleSave]);
// `isLocalUpdate.current` is FALSE, so it returns early.
//
// THIS WHOLE FLOW IS CORRECT. NO DATA LOSS.

// Wait. "Owner panel m GMAIL, PASSWORD SAVE nhi horaha"
// What if `onSnapshot` sets state and because `idsData` changes, `handleSave` is recreated, but it's a no-op.
// What if someone else saves?
// If someone else saves, `onSnapshot` runs, `isLocalUpdate` is FALSE. State updates.

// COULD IT BE:
// When the user loads the page, `docSnap.exists()` is true.
// It sets `idsData`.
// `idsData` changes, but `isLocalUpdate` is false.
// Does it save immediately? No.

// WHAT IF the user has a slow connection?
// User types "A" (isLocalUpdate=true).
// 1s passes. `handleSave` called.
// `setDoc` called.
// Local snapshot fires. `isLocalUpdate` = false.
// User types "B" (isLocalUpdate=true).
// 1s passes. `handleSave` called.
// `setDoc` called.
// Local snapshot fires. `isLocalUpdate` = false.
// Then SERVER snapshots arrive for "A" and "B" after 5 seconds!
// First server snapshot arrives for "A".
// `isLocalUpdate` is currently false!
// SO it DOES NOT RETURN EARLY!
// It sets state to "A"!
// "B" IS LOST!!!
// THE STATE REVERTS TO "A"!
// AND SINCE THE STATE REVERTED TO "A" (via `setIdsData`), `isLocalUpdate` REMAINS FALSE!
// (Because `handleChange` wasn't called, we just called `setIdsData`).
// So the debouncer does NOT trigger a save for "A"!
// BUT WAIT! We ALREADY saved "B" to Firestore (locally). The server snapshot for "B" is still queued up and will arrive shortly.
// When server snapshot for "B" arrives, it will set state to "B".
// It will look like a glitch to the user ("B" disappears and becomes "A", then becomes "B").
// But it doesn't cause PERMANENT data loss.

// WAIT! What if `isLocalUpdate.current = true` is NOT sufficient for multiple fields?
// What if we type email for ID 1, then password for ID 1.
// They both trigger `handleChange`.

// IS IT POSSIBLE THAT `idsData` in `handleSave` is STALE?
// No, `useCallback(..., [idsData])` ensures it has the latest `idsData`.
// BUT, what if `handleSave` is called inside `setTimeout`?
//   useEffect(() => {
//     const timeoutId = setTimeout(() => {
//       handleSave();
//     }, 1000);
//   }, [idsData, handleSave]);
// When `timeoutId` fires, it calls the `handleSave` that was captured in the closure of the effect!
// Is the captured `handleSave` the latest one?
// Yes, because whenever `idsData` changes, the effect is cleaned up (`clearTimeout`) and re-run with the NEW `handleSave`.
// So it always uses the latest `handleSave`.

// IS THE PROBLEM THAT `handleSave` IS NOT SAVING `email` OR `password` PROPERLY?
// Look closely at the UI inputs:
// onChange={(e) => handleChange(id, "email", e.target.value)}
// This works.

// What if the user says "Owner panel m GMAIL, PASSWORD SAVE nhi horaha" because they click "Logout All Official" and the fields are NOT clearing?
// No, they explicitly say "SAVE nhi horaha".

// Could the issue be Firebase rules? "Without any error" means no permissions error.

// Let's rethink the `onSnapshot` logic completely.
// If you want real-time sync WITHOUT interrupting local typing and WITHOUT glitching, you should simply deeply compare the incoming server data with the local data.
// But wait, if you deeply compare, and they differ (e.g. someone else changed it), you DO want to update local data.
// A better pattern:
// ONLY update local state from `onSnapshot` IF the user is NOT currently focused on an input? No, that's complex.
// The easiest fix that guarantees no data loss and "real time save":
// When `onSnapshot` receives data, merge it field by field, ONLY for fields that the user hasn't touched recently?
// Or just REMOVE `isLocalUpdate` and rely on deep equals to avoid infinite loops, but how do we prevent overwriting the user's typing?
// Actually, `isLocalUpdate` is trying to prevent overwriting.

// Why did they say "Without any error"?
// "Owner panel m GMAIL, PASSWORD SAVE nhi horaha kyuu real time save hojeyga globally Bss Without any error"
// Bss Without any error -> Just do it without introducing any errors?
// Or "It is currently not saving. Please make it save in real-time globally, just without any error."

// Let's look at `doc(db, "adminSettings", "credentials")`.
// This is exactly where it is saved.
// But wait, look at this:
//   Object.keys(defaultIdsData).forEach(id => {
//     if (serverData[id]) {
//       mergedData[id as keyof typeof mergedData] = {
//         email: serverData[id].email || "",
//         password: serverData[id].password || ""
//       };
//     }
//   });
// If I type an email, it gets saved.
// Is it possible the `email` field is not correctly picked up by the other components?
// "GMAIL, PASSWORD SAVE nhi horaha"
// Could it be that the OTHER components (e.g. `LoginPage.tsx` or `settingpage.tsx`) expect `officialCredentials`?
// Yes! Look at `handleSave`:
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
// IF THE USER ONLY ENTERS EMAIL (but not password), it is NOT added to `credentials`.
// Then in `LoginPage.tsx`:
//   const checkOfficialCredentials = async (email: string, password: string) => {
//     try {
//       const docRef = doc(db, "adminSettings", "credentials");
//       const docSnap = await getDoc(docRef);
//       if (docSnap.exists() && docSnap.data().officialCredentials) {
//         const credentials = docSnap.data().officialCredentials;
//         const matched = credentials.find(
//           (cred: any) => cred.email === email && cred.password === password
//         );
// This means the user CANNOT login unless BOTH email and password are provided.
// This is correct behavior! You need both to login.
