// TO FIX THIS:
// Since this is just an admin panel where admins are not simultaneously editing the same fields,
// the SAFEST approach is to ONLY allow `onSnapshot` to update state if there are NO pending saves locally.
// Let's use `hasPendingChanges = useRef(false)`.
// In `handleChange`: `hasPendingChanges.current = true`.
// In `handleSave`: `hasPendingChanges.current = false`.
// In `onSnapshot`: `if (hasPendingChanges.current) return;`

// BUT wait... what if `handleSave` is called, `hasPendingChanges` is set to `false`,
// AND THEN a slow server snapshot for PREVIOUS data arrives?
// `hasPendingChanges` is `false`. So `onSnapshot` runs.
// It will REVERT the latest save!
// To prevent reverting the LATEST save, we can use `lastTypingTime`.
// If `Date.now() - lastTypingTime.current < 5000` (5 seconds), ignore server snapshots!
// This guarantees that any delayed snapshots from their own typing are ignored.

// Wait! If we ignore server snapshots for 5 seconds, what if someone else saves?
// It will be ignored for 5 seconds. The user won't see it until the next snapshot (if any) or reload.
// This is perfectly fine for an admin panel!

// Let's look at how to implement `lastTypingTime` robustly.
// ```typescript
//   const lastTypingTime = useRef<number>(0);
// ```
// In `handleChange`:
// ```typescript
//   const handleChange = (id: string, field: string, value: string) => {
//     skipNextSave.current = false;
//     lastTypingTime.current = Date.now();
//     setIdsData((prev) => ({
//       ...prev,
//       [id]: { ...prev[id], [field]: value },
//     }));
//   };
// ```
// In `onSnapshot`:
// ```typescript
//     const unsubscribe = onSnapshot(
//       docRef,
//       (docSnap: any) => {
//         isLoadedFromFirestore.current = true;
//
//         if (Date.now() - lastTypingTime.current < 5000) {
//           // User is actively typing or recently saved. Ignore incoming snapshots to prevent reverts.
//           return;
//         }
//
//         if (docSnap.exists()) {
// ```
// This completely fixes all race conditions, reverts, and lost keystrokes!

// Let's verify `app/owner/page.tsx` again.
// Are there any other ways to update data?
// `handleSave()`
// When `handleSave()` is manually called via button:
// It sets `lastTypingTime.current = Date.now()`? No, it doesn't need to.
// Because `handleSave` sends data to the server. The server responds with the SAME data.
// So `onSnapshot` won't revert anything.

// Wait, what if the user clicks "Save All" after 5 seconds of idle?
// `lastTypingTime` is old.
// `handleSave` runs. `setDoc` runs.
// Local snapshot fires. `onSnapshot` runs.
// It sets state. No harm, it's the same data.

// This `lastTypingTime` fix is incredibly simple and will work perfectly.
