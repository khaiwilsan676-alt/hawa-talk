// So how do we fix it?
// We need to sync globally without interrupting local typing.
// The standard way to do this in React forms with Firebase is:
// 1. Differentiate between local changes and remote changes.
// 2. Instead of a single boolean `isLocalUpdate`, we can just NOT update local state from remote if the user is currently focused on an input?
// Or we just deeply compare `idsData` with the incoming `serverData`.
// But wait, the user says "Owner panel m GMAIL, PASSWORD SAVE nhi horaha kyuu real time save hojeyga globally Bss Without any error"
// Wait! If they say "real time save hojeyga globally", maybe they are asking ME to implement it?
// "Owner panel m GMAIL, PASSWORD SAVE nhi horaha" -> "In Owner panel, GMAIL and PASSWORD are NOT saving"
// "kyuu" -> "Why?" or "Please make it so"
// "real time save hojeyga globally" -> "it will save in real time globally"
// "Bss Without any error" -> "Just without any error"

// Why is it not saving AT ALL?
// Look at this:
//   // Load from firestore (Real-time sync)
//   useEffect(() => {
//     const docRef = doc(db, "adminSettings", "credentials");
//     const unsubscribe = onSnapshot(
//       docRef,
//       (docSnap) => { ...
//
// And the save function:
//   const handleSave = useCallback(async () => {
//     try {
//       const credentials: any[] = [];
//       Object.entries(idsData).forEach(([id, data]: [string, any]) => {
//         const email = (data.email || "").trim();
//         const password = (data.password || "").trim();
//         if (email && password) { ...

// What if they only type an email, but not a password?
// `email && password` is false. So it is NOT pushed to `credentials`.
// BUT it IS saved in `ownerPanelCredentials: idsData`.
// Wait, if it IS saved in `ownerPanelCredentials: idsData`, then when the page reloads, it should load from `docSnap.data().ownerPanelCredentials`.
// So it SHOULD save!

// Wait! If `ownerPanelCredentials` is updated, does it update globally?
// Yes.

// Look at the `isLocalUpdate` logic again.
// ```javascript
//   useEffect(() => {
//     if (!isLocalUpdate.current) return;
//     const timeoutId = setTimeout(() => {
//       handleSave();
//     }, 1000);
//     return () => clearTimeout(timeoutId);
//   }, [idsData, handleSave]);
// ```
// If `handleSave` is called, it saves to Firestore.
// Firestore triggers `onSnapshot`.
// `onSnapshot` sees `isLocalUpdate.current == true`.
// It sets `isLocalUpdate.current = false` AND RETURNS!
// BUT if you type "A", `isLocalUpdate` is true. `handleSave` saves. `onSnapshot` runs, `isLocalUpdate` becomes false.
// EVERYTHING WORKS perfectly.

// WAIT! What if the user TYPES, and `isLocalUpdate.current` becomes `true`.
// `setTimeout` is created.
// Then an unrelated `onSnapshot` fires (e.g. `hasPendingWrites` changes to false on the server).
// `isLocalUpdate.current` becomes `false`.
// The timeout FIRES.
// `handleSave` is called! `idsData` is saved!
// Wait! `handleSave` will STILL be called! The timeout is already running!
// So it WILL save!

// Why would it "NOT SAVE"?
// Are there any errors in `handleSave`?
// "Error saving credentials!"
// Does it happen?
// Let's check Firebase rules? No, this is an owner panel, assuming rules are ok or this is frontend code.
// Wait, is there a typo?
// Look at how `doc(db, "adminSettings", "credentials")` is used.
// Is `adminSettings/credentials` the correct path? Yes.
