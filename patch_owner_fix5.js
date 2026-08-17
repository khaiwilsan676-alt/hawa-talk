// Wait! If `onSnapshot` arrives with NEW data from the server (e.g. another user typed).
// `JSON.stringify(currentData) !== JSON.stringify(finalData)`.
// It sets state. `idsData` changes!
// React re-renders.
// `useEffect` runs.
// It sets a timeout to save `idsData` back to the server!
// BUT wait, it's just saving the exact same data it JUST RECEIVED from the server!
// Is that bad?
// Yes, it causes an unnecessary write.
// BUT `skipNextSave` prevented this!

// Can we use `isLocalUpdate` like I did previously, but correctly?
// If we have `isLocalUpdate.current = false`.
// When user types (`handleChange`), we set `isLocalUpdate.current = true`.
// In `useEffect`:
// ```javascript
//   useEffect(() => {
//     if (!isLocalUpdate.current) return;
//     if (!isLoadedFromFirestore.current) return;
//     const timeoutId = setTimeout(() => {
//       handleSave();
//       // SHOULD WE SET IT TO FALSE HERE? No, wait until onSnapshot?
//     }, 1000);
//     return () => clearTimeout(timeoutId);
//   }, [idsData, handleSave]);
// ```
// If `isLocalUpdate.current` is true, it saves.
// When `handleSave` finishes, it triggers `onSnapshot`.
// `onSnapshot` sees it's identical, returns `currentData`. No state change.
// But what if another user changes data?
// `onSnapshot` runs, `JSON.stringify` !== `JSON.stringify`.
// It sets state.
// React re-renders.
// `useEffect` runs. `isLocalUpdate.current` is STILL TRUE?
// No, if user hasn't typed, is it true or false?
// If we set `isLocalUpdate.current = true` on `handleChange`.
// When does it become false?
// We could set it to `false` INSIDE `handleSave`?
// No, if we set it to false inside `handleSave`, then `onSnapshot` comes later, updates state, sets state, re-renders, `isLocalUpdate.current` is false, it doesn't re-save.
// BUT what if user types during `handleSave`?
// Let's use a queue or just a `lastUserEditTimestamp`.

// Let's think simpler.
// "Owner panel m GMAIL, PASSWORD SAVE nhi horaha kyuu real time save hojeyga globally Bss Without any error"
// Is it possible the user is just saying the manual save button doesn't work because `idsData` doesn't get saved, because `handleSave` has `idsData` in its dependency array? No, that works.

// What if the problem is `skipNextSave.current = true` inside `onSnapshot` PREVENTS manual saving?
// If `onSnapshot` fires, it sets `skipNextSave.current = true`.
// But `handleSave` manual button click doesn't use `skipNextSave`.

// So the bug is definitely that `skipNextSave.current = true` in `onSnapshot` CANCELS DEBOUNCED AUTO-SAVES!
