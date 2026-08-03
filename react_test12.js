// Is it possible the real problem is that the debouncer is broken because `isLocalUpdate.current = false` inside `onSnapshot` cancels the NEXT auto-save?
// Wait! Let's trace this again.
// User types "A".
// `handleChange` sets `isLocalUpdate = true`.
// Component re-renders.
// `useEffect` runs. `isLocalUpdate` is `true`. Timeout is set for 1000ms.
// 1000ms passes.
// `handleSave()` executes.
// `setDoc` executes.
// Firestore FIRES `onSnapshot` immediately (latency compensation).
// Inside `onSnapshot`:
//   if (isLocalUpdate.current) {
//     isLocalUpdate.current = false;
//     return;
//   }
// So `isLocalUpdate.current` becomes `false`.
// IT RETURNS EARLY. NO STATE UPDATE.
// NOW, what happens?
// The user is just sitting there.
// 100ms later, the server acknowledges the write.
// Firestore FIRES `onSnapshot` AGAIN.
// Inside `onSnapshot`:
//   `isLocalUpdate.current` is `false`.
// It DOES NOT RETURN EARLY.
// It proceeds to update state!
//   setIdsData(mergedData);
// THIS CAUSES A RE-RENDER!
// Component re-renders with `idsData` being the SAME values but a NEW reference.
// `useEffect` runs again.
// `isLocalUpdate.current` is `false`.
// So it returns early! No timeout is set.
// User is still sitting there. Everything is fine.

// BUT WHAT IF THE USER CONTINUES TYPING?
// Suppose user types "A".
// 1000ms passes. `handleSave` executes.
// `setDoc` executes.
// Local `onSnapshot` sets `isLocalUpdate` to `false`.
// User types "B" RIGHT AFTER Local `onSnapshot` fires, but BEFORE Server `onSnapshot` fires!
// So user types "B".
// `handleChange` sets `isLocalUpdate = true`.
// Component re-renders with "B".
// `useEffect` runs. `isLocalUpdate` is `true`. Timeout is set for 1000ms.
// THEN, Server `onSnapshot` for "A" arrives!
// Inside `onSnapshot`:
//   `isLocalUpdate.current` is `true`! (because the user typed "B").
// It sees `isLocalUpdate.current` is `true`.
// So it DOES:
//   isLocalUpdate.current = false;
//   return;
// IT RETURNS EARLY!
// It skips updating state to "A". (Which is GOOD, because local state is "B").
// BUT IT ALSO SETS `isLocalUpdate.current = false`!
//
// Now, what happens to the timeout for "B"?
// The timeout for "B" is ALREADY running. It was set when the component rendered with "B".
// 1000ms later, the timeout fires!
// It calls `handleSave()`.
// `handleSave` uses the latest `idsData`, which is "B".
// `setDoc` executes with "B".
// Local `onSnapshot` fires for "B".
// What is `isLocalUpdate.current`?
// It was set to `false` by the Server `onSnapshot` for "A"!
// So Local `onSnapshot` for "B" sees `isLocalUpdate.current == false`!
// IT DOES NOT RETURN EARLY!
// It proceeds to update state!
// It updates state to "B" (from local cache).
// This causes a re-render.
// `useEffect` runs. `isLocalUpdate` is `false`. Returns early.
// Server `onSnapshot` for "B" arrives.
// `isLocalUpdate` is `false`.
// Updates state to "B".
// Re-render. `useEffect` returns early.
//
// IS ANY DATA LOST?
// NO! "B" WAS SAVED!
// The timeout still fired, `handleSave` still ran, `setDoc` still saved "B".

// So there is NO data loss in this scenario either!

// IS THERE ANY SCENARIO WHERE `handleSave` IS NEVER CALLED?
// What if `isLocalUpdate.current` is `false`, and the user types "C"?
// `handleChange` sets `isLocalUpdate.current = true`.
// Re-render. `useEffect` runs. Timeout is set.
// It will ALWAYS be set.
