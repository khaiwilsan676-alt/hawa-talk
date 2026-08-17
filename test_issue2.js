// Wait, why would an `onSnapshot` arrive randomly at 800ms?
// Firestore triggers `onSnapshot` when another field is updated, OR when connection state changes.
// Or maybe `onSnapshot` is overwriting it immediately because `onSnapshot` triggers when the component mounts!
// Component mounts -> idsData is from local storage (or default).
// User types immediately.
// Then Firestore network fetch completes (1-2 seconds later).
// It calls `onSnapshot`.
// It overwrites `idsData` with the database data!
// If the user hasn't focused, or if they focused but it was a fast click-and-type-and-blur.

// Alternatively, let's look at `handleSave` again.
// ```javascript
//   const handleSave = useCallback(async (customData?: Record<string, any>) => {
// ...
//      const docRef = doc(db, "adminSettings", "credentials");
//       await setDoc(docRef, {
//         ownerPanelCredentials: targetData,
//         officialCredentials: credentials
//       }, { merge: true });
// ```
// If `handleSave` is called, it updates Firestore.
// Firestore immediately triggers a local `onSnapshot` (latency compensation).
// The local `onSnapshot` gets the NEW data.
// So `finalData` has the new data.
// `JSON.stringify(currentData) === JSON.stringify(finalData)` -> TRUE.
// So it returns `currentData`. No state update.
// All good.

// WHAT IS THE ACTUAL BUG?!
// "Owner panel m GMAIL, PASSWORD SAVE nhi horaha kyuu real time save hojeyga globally Bss Without any error"
// Is the user complaining that the "Save All Credentials" button doesn't work?
// Or that the auto-save doesn't work?
