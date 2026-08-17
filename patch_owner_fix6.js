// How to fix:
// We just remove `skipNextSave`.
// Why did we add `skipNextSave`?
// To prevent the `useEffect` from triggering `handleSave()` when `idsData` updates purely from an `onSnapshot`!
// If `onSnapshot` updates `idsData`, it will trigger `useEffect`, which will `setTimeout` to `handleSave()`.
// This means every time we receive a remote update, we wait 1000ms and then SAVE IT BACK to Firestore!
// This is exactly what we want to avoid.

// How to avoid saving remote updates back to Firestore?
// We only want to save if the `idsData` change was initiated LOCALLY by the user typing!
// We can use a `isLocalUpdate` ref.
// When `handleChange` is called:
// `isLocalUpdate.current = true;`
//
// In `useEffect`:
// ```javascript
//   useEffect(() => {
//     if (!isLocalUpdate.current) {
//       return;
//     }
//     if (!isLoadedFromFirestore.current) {
//       return;
//     }
//     const timeoutId = setTimeout(() => {
//       handleSave();
//       isLocalUpdate.current = false; // Reset AFTER saving!
//     }, 1000);
//     return () => clearTimeout(timeoutId);
//   }, [idsData, handleSave]);
// ```
// If `handleChange` runs rapidly, `isLocalUpdate.current` remains `true`.
// `idsData` changes, `useEffect` clears old timeout, sets new timeout.
// When timeout fires, it calls `handleSave()`, then sets `isLocalUpdate.current = false`.
// If `onSnapshot` updates `idsData` (e.g. remote update), `idsData` changes.
// React re-renders. `useEffect` runs.
// `isLocalUpdate.current` is `false`. It returns early. No auto-save.
// This is flawless!

// What if the user types AGAIN while `handleSave()` is running?
// The timeout already fired. `isLocalUpdate.current = false` immediately after `handleSave()`.
// If user types again, `handleChange` sets `isLocalUpdate.current = true`.
// `idsData` changes.
// React re-renders. `useEffect` runs, sees `isLocalUpdate.current` is true.
// Sets new timeout! Flawless!
