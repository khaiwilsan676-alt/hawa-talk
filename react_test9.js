// Wait! Let's think about Firebase's `onSnapshot` behavior.
// When you call `onSnapshot`, it immediately fires with the CURRENT cached state.
// So:
// 1. Component mounts.
// 2. `useEffect` runs.
// 3. `onSnapshot` is called.
// 4. `onSnapshot` FIRES IMMEDIATELY with cached data.
// 5. Is `isLocalUpdate.current` true or false?
// It is initialized to `false`: `const isLocalUpdate = useRef(false);`
// So it is `false`.
// 6. It updates `idsData` from the cache.
// 7. THEN the server responds.
// 8. `onSnapshot` FIRES AGAIN with server data.
// 9. `isLocalUpdate.current` is `false`.
// 10. It updates `idsData` from the server.
//
// What if the user types something BETWEEN step 4 and step 8?
// User types "A". `isLocalUpdate` becomes `true`.
// `idsData` is updated to "A".
// Then the server response (step 8) arrives!
// `onSnapshot` FIRES!
// It sees `isLocalUpdate.current` is `true`!
// It sets `isLocalUpdate.current = false` AND RETURNS!
// It skips updating the state from the server.
// The user's typing "A" is preserved.
// 1000ms later, it saves "A" to the server.
// THIS IS PERFECT!

// So there is absolutely nothing wrong with `isLocalUpdate` logically in standard scenarios.
// EXCEPT for one edge case:
// If `isLocalUpdate` is set to `false` by `onSnapshot` (because of a server response),
// AND THEN the user types "B", `handleChange` sets `isLocalUpdate = true`.
// Wait...
// If the user types "B", `isLocalUpdate` becomes `true`. The timer for "B" is set.
// There is no bug here.

// What if the problem is:
// "Owner panel m GMAIL, PASSWORD SAVE nhi horaha"
// Is there ANY field named "GMAIL"?
// Ah. "User Name", "Password", "Key" for the LOGIN.
// Then for IDs: "Email" and "Password".
// The user is talking about "GMAIL" (Email) and "PASSWORD".

// Let's look at this part of `onSnapshot`:
//   useEffect(() => {
//     const docRef = doc(db, "adminSettings", "credentials");
//     const unsubscribe = onSnapshot(
//       docRef,
//       (docSnap) => {
//         if (isLocalUpdate.current) {
//           // Skip updating state if the change originated locally
//           isLocalUpdate.current = false;
//           return;
//         }
//
// If we have MULTIPLE `onSnapshot` calls in a row that we want to skip.
// E.g., user is typing. `isLocalUpdate` = true.
// `setDoc` is called.
// Local `onSnapshot` fires -> `isLocalUpdate` = false, returns.
// Wait! What if the user CONTINUES TYPING?
// After local `onSnapshot` fires, `isLocalUpdate` is `false`.
// If the user types "C" BEFORE the next render?
// `handleChange` sets `isLocalUpdate = true`.
// Then SERVER `onSnapshot` fires.
// It sees `isLocalUpdate = true`. It sets it to `false` and returns.
// EVERYTHING is fine!

// BUT WHAT IF the user does NOT type "C".
// Local `onSnapshot` fires -> `isLocalUpdate` = false, returns.
// User does NOT type anything.
// Server `onSnapshot` fires -> `isLocalUpdate` is `false`.
// It DOES NOT RETURN!
// It continues and does:
//           const serverData = docSnap.data().ownerPanelCredentials || {};
//           const mergedData = { ...defaultIdsData };
//           ...
//           setIdsData(mergedData);
// It sets state.
// THIS HAPPENS on EVERY successful save!
// Every time the user stops typing for 1 second, it saves.
// Then the server responds.
// Then `setIdsData(mergedData)` is called!
// Wait... if `setIdsData` is called, does it overwrite the focused input?
// If the user's cursor is in the input, and `setIdsData` changes the state reference, does the input lose focus?
// NO, because React reconciles the DOM tree. The input element `value` is updated, but it doesn't lose focus.
// BUT WHAT IF `mergedData` DOES NOT MATCH the user's input exactly?
// Let's say the user typed "test@gmail.com".
// When they typed "m", it triggered a save (maybe 1 second after "o", they typed "m" just before the save?).
// No, if they typed "m", the timeout was reset to 1000ms.
// 1000ms later, it saves "test@gmail.com".
// The server responds with "test@gmail.com".
// `mergedData` is exactly "test@gmail.com".
// It updates the state. No glitch.

// Is it possible that `defaultIdsData` mutation is causing issues?
//   const mergedData = { ...defaultIdsData };
//   Object.keys(defaultIdsData).forEach(id => {
//     if (serverData[id]) {
//       mergedData[id as keyof typeof mergedData] = {
//         email: serverData[id].email || "",
//         password: serverData[id].password || ""
//       };
//     }
//   });
// Here, `mergedData` is a NEW object.
// But `mergedData["500001"]` is EITHER a new object `{ email: ..., password: ... }` OR it is `defaultIdsData["500001"]`.
// If `serverData` has NO data for "500001", it uses `defaultIdsData["500001"]`.
// And `defaultIdsData["500001"]` is `{ email: "", password: "" }`.
// Wait... what if `idsData` had data for "500001" that WAS NOT SAVED YET?
// E.g., user is typing in "500001", but the save hasn't happened.
// If the server snapshot arrives, it will overwrite "500001" with `{ email: "", password: "" }`!
// BUT we already proved that if the user is typing, `isLocalUpdate.current` is `true`, so the server snapshot is IGNORED.
// What if `isLocalUpdate.current` is `false`, but the user has unsaved data?
// How could they have unsaved data if `isLocalUpdate` is `false`?
// They can't. If they changed data, `handleChange` set it to `true`.
// It only becomes `false` when an `onSnapshot` runs.
// And if an `onSnapshot` runs and resets it to `false`, it means a snapshot arrived.
// If it was a local snapshot from `setDoc`, it means the data was ALREADY saved.
// So there is NO UNSAVED DATA when a server snapshot overwrites the state.
