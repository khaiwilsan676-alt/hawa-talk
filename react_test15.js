// So how do we fix it?
// We need a way to ensure that ALL user typing is saved, regardless of `onSnapshot` events.
// A common and robust way to handle debounced saving without missing keystrokes:
// Instead of a boolean `isLocalUpdate` that can be overwritten, we can use a ref to track the "last user typing timestamp", or simply not use `isLocalUpdate` at all for the auto-save!
// Wait. If we remove `isLocalUpdate`, the auto-save will trigger EVERY TIME `idsData` changes.
// Is that bad?
// If `idsData` changes due to `onSnapshot` (server update), it will trigger an auto-save.
// That auto-save will just save the SAME data back to the server.
// It's a redundant write, but it's safe.
// BUT we don't want infinite loops!
// If it saves the same data, does it trigger `onSnapshot` again?
// Yes, local `onSnapshot` triggers immediately. Server `onSnapshot` might trigger if `includeMetadataChanges` is true (it's not).
// If `onSnapshot` triggers and updates state to the SAME deep data, `idsData` reference might change.
// If we deeply compare before `setIdsData`, we can PREVENT the state from changing reference if the data is the same!
// If `idsData` doesn't change reference, `useEffect` won't run, and NO redundant save!

// Let's implement deep compare in `onSnapshot`:
//   useEffect(() => {
//     const docRef = doc(db, "adminSettings", "credentials");
//     const unsubscribe = onSnapshot(docRef, (docSnap) => {
//       if (docSnap.exists()) {
//         const serverData = docSnap.data().ownerPanelCredentials || {};
//         const mergedData = { ...defaultIdsData };
//         Object.keys(defaultIdsData).forEach(id => {
//           if (serverData[id]) {
//             mergedData[id as keyof typeof mergedData] = {
//               email: serverData[id].email || "",
//               password: serverData[id].password || ""
//             };
//           }
//         });
//
//         setIdsData((currentData) => {
//           // Deep compare currentData and mergedData
//           if (JSON.stringify(currentData) === JSON.stringify(mergedData)) {
//             return currentData; // Return existing reference!
//           }
//           return mergedData; // Only update if different
//         });
//       }
//     });
//     return () => unsubscribe();
//   }, []);
//
// Now, what about the auto-save?
//   useEffect(() => {
//     const timeoutId = setTimeout(() => {
//       handleSave();
//     }, 1000);
//     return () => clearTimeout(timeoutId);
//   }, [idsData, handleSave]);
//
// Wait! If the user types "A", `idsData` changes. `timeoutId` starts.
// 1000ms later, `handleSave` saves "A".
// `onSnapshot` fires. `mergedData` is "A".
// `currentData` is "A".
// `JSON.stringify` matches!
// `setIdsData` returns `currentData`. State does NOT change.
// `useEffect` does NOT re-run.
// No infinite loop! No redundant saves!

// BUT WAIT!
// What if a SERVER `onSnapshot` arrives (from another user's change)?
// `mergedData` is different from `currentData`.
// `setIdsData(mergedData)` changes the state reference.
// The `useEffect` for auto-save WILL RUN!
// It will start a 1000ms timer.
// 1000ms later, it will `handleSave()` and WRITE the server's data back to the server.
// Is this a problem?
// It costs 1 extra write per server update. In a low-traffic admin panel, this is completely fine.
// BUT to avoid it, we can still use `isLocalUpdate`!
// Just use it correctly.

// How to use `isLocalUpdate` correctly:
// Make `isLocalUpdate` a state, or use a separate ref `lastLocalUpdateTime`.
// Or even simpler:
// Let `isLocalUpdate` track if the CURRENT `idsData` is locally dirtied.
// Whenever `handleChange` runs, `isDirtied.current = true`.
// In the auto-save effect:
//   useEffect(() => {
//     if (!isDirtied.current) return;
//     const timeoutId = setTimeout(() => {
//       handleSave();
//       isDirtied.current = false; // Mark as saved!
//     }, 1000);
//     return () => clearTimeout(timeoutId);
//   }, [idsData, handleSave]);
//
// What about `onSnapshot`?
//   const unsubscribe = onSnapshot(docRef, (docSnap) => {
//     if (isDirtied.current) {
//       // User has unsaved local changes!
//       // DO NOT OVERWRITE THEIR TYPING!
//       return;
//     }
//     // Update state with server data
//   });
//
// Let's trace this!
// 1. User types "A". `isDirtied.current = true`. State updates.
// 2. `useEffect` starts 1000ms timer.
// 3. User types "B". `isDirtied.current = true`. Timer restarts.
// 4. Server snapshot for some previous data arrives.
// 5. `isDirtied.current` is `true`. `onSnapshot` RETURNS EARLY! (Ignores server data).
// 6. 1000ms passes.
// 7. Timer fires: calls `handleSave()`.
// 8. `isDirtied.current = false`.
// 9. `setDoc` executes.
// 10. Local `onSnapshot` fires (latency compensation).
// 11. `isDirtied.current` is `false`.
// 12. `onSnapshot` sets state with server data (which is "B").
// 13. State changes to "B". Wait, deep compare can prevent re-render here.
// 14. If we don't deep compare, state reference changes.
// 15. `useEffect` runs. `isDirtied.current` is `false`. Returns early.
//
// THIS IS FLAWLESS!
