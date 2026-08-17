// Is it possible `handleSave` is being called, but `idsData` inside `handleSave` is STALE?
// No, `handleSave` is recreated:
// `const handleSave = useCallback(async (customData?: Record<string, any>) => { ... }, [idsData]);`
// `idsData` is in the dependency array.

// WAIT! What if `handleSave` is NOT re-created because we forgot a dependency?
// No, it has `[idsData]`.

// Look at the effect!
// ```javascript
//   useEffect(() => {
//     if (skipNextSave.current) {
//       skipNextSave.current = false;
//       return;
//     }
//     if (!isLoadedFromFirestore.current) {
//       return;
//     }
//     const timeoutId = setTimeout(() => {
//       handleSave();
//     }, 1000);
//     return () => clearTimeout(timeoutId);
//   }, [idsData, handleSave]);
// ```
// If `isLoadedFromFirestore` is FALSE initially, it returns.
// But `isLoadedFromFirestore.current = true;` is set inside `onSnapshot`.
// So after the first `onSnapshot`, it is TRUE.
// Then user types -> `handleChange` -> `skipNextSave.current = false` -> `idsData` updates.
// Effect runs -> `skipNextSave` is FALSE. -> `setTimeout`.
// Wait...
// If the user types "a", `handleChange` sets `skipNextSave.current = false`.
// But wait, `skipNextSave` is a REF.
// Does updating a ref trigger a re-render? No.
// But `setIdsData` triggers a re-render!
// So re-render happens.
// During the re-render, `skipNextSave.current` is FALSE.
// So `useEffect` runs.
// `skipNextSave.current` is FALSE. It doesn't return early.
// It sets a timeout.
// When the timeout finishes, it calls `handleSave`.

// So what is wrong?
// "Owner panel m GMAIL, PASSWORD SAVE nhi horaha kyuu real time save hojeyga globally Bss Without any error"
// Is it possible the user is complaining that when they type, it doesn't save FAST ENOUGH?
// 1 second debounce...
// Is there a bug with `handleChange` and `focusedField`?
// `focusedField.current = `${id}-email``
// In `onSnapshot`:
// `const [focusedId, focusedKey] = focusedField.current.split('-');`
// `finalData[focusedId][focusedKey] = currentData[focusedId][focusedKey];`
// So the focused field is PRESERVED.

// WHAT IF `onSnapshot` FIRES RAPIDLY?
// If another user changes data, `onSnapshot` fires.
// `finalData` gets the other user's changes.
// It merges our focused field.
// `setIdsData` runs.
// `skipNextSave.current = true`.
// So OUR debounce is CANCELLED!
// Ah!!!
// Imagine:
// 1. I type "abc" in my email field.
// 2. `handleChange` runs, `skipNextSave.current = false`.
// 3. Timeout is set for 1000ms.
// 4. At 500ms, ANOTHER user updates a completely different field.
// 5. `onSnapshot` fires!
// 6. It sets `idsData`. It sets `skipNextSave.current = true`.
// 7. React re-renders!
// 8. The previous timeout is CLEARED! (Because `useEffect` cleanup runs).
// 9. The new `useEffect` runs.
// 10. `skipNextSave.current` is TRUE. It sets it to FALSE and RETURNS!
// 11. My "abc" NEVER SAVES!
// THIS IS THE BUG!
