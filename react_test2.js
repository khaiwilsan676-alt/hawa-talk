// Let's test the hypothesis about the user's issue:
// The user says "real time save hojeyga globally". This implies they expect real-time synchronization,
// but they ALSO expect it to save "Without any error".
// Wait, maybe the bug is that the onSnapshot overwrites the local state WHILE the user is typing?
// No, the `isLocalUpdate.current = false; return;` prevents this.
// BUT WAIT!
// If the user types "A" (isLocalUpdate=true), then 1s later handleSave is called.
// `setDoc` triggers local snapshot -> `isLocalUpdate=false`.
// Then SERVER snapshot triggers a few ms later -> updates state.
// BUT what if the user types "B" EXACTLY between the local snapshot and the server snapshot?
// Local snapshot -> `isLocalUpdate = false`.
// User types "B" -> `isLocalUpdate = true`.
// Server snapshot arrives -> `isLocalUpdate = true`!!!
// So server snapshot is SKIPPED, `isLocalUpdate` becomes `false`!!!
// User typed "B", but `isLocalUpdate` is now `false`!
// So the debounced effect will NOT call `handleSave` for "B", because `!isLocalUpdate.current` returns early!
// YES! THIS IS THE BUG!
// If `isLocalUpdate` becomes `false` due to `onSnapshot`, the `useEffect` for auto-save will RETURN EARLY and NEVER SAVE "B"!
// And because the server snapshot was skipped, the server only knows about "A".
// The local state has "B". But it never gets saved!
// AND the user says "SAVE nhi horaha"!

// Let's verify this!
// In `useEffect`:
// ```javascript
//   useEffect(() => {
//     if (!isLocalUpdate.current) return;
//     const timeoutId = setTimeout(() => {
//       handleSave();
//     }, 1000);
//     return () => clearTimeout(timeoutId);
//   }, [idsData, handleSave]);
// ```
// If `idsData` changes to "AB", `isLocalUpdate` is `true`.
// `useEffect` runs. Sets timeout for 1000ms.
// Then `onSnapshot` fires (say, a late one from previous "A" save).
// It sees `isLocalUpdate` is `true`. It sets it to `false` and returns.
// The timeout for "AB" is ALREADY running (it was set before `onSnapshot` fired).
// So when the timeout fires, it WILL call `handleSave`!
// Wait. The timeout is already set. `isLocalUpdate` being `false` doesn't clear the timeout!
// So `handleSave` will still run for "AB"!

// Wait, what if the late `onSnapshot` comes, sets `isLocalUpdate` to `false`.
// THEN the user types "C" (idsData="ABC"). `isLocalUpdate` becomes `true`.
// Timeout is cleared and reset for 1000ms. This is fine.

// What if the user types "B", `handleChange` sets `isLocalUpdate = true` and `idsData` = "B".
// React re-renders.
// BUT before the `useEffect` runs, `onSnapshot` fires and sets `isLocalUpdate = false`!
// In React 18, effects run asynchronously after render.
// So `isLocalUpdate` is set to `false` BEFORE the effect runs.
// The effect runs, sees `isLocalUpdate == false`, and RETURNS EARLY!
// Thus, no timeout is set! "B" is NEVER saved!
// THIS IS THE BUG!
