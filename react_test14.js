// Wait! Look at `handleSave` again!
//       Object.entries(idsData).forEach(([id, data]: [string, any]) => {
//         const email = (data.email || "").trim();
//         const password = (data.password || "").trim();
//         if (email && password) {
//           credentials.push({
//             id: id,
//             email: email,
//             password: password,
//             type: id.startsWith('5') ? 'official' : 'admin'
//           });
//         }
//       });
//       const docRef = doc(db, "adminSettings", "credentials");
//       await setDoc(docRef, {
//         ownerPanelCredentials: idsData,
//         officialCredentials: credentials
//       }, { merge: true });

// IF the user DELETES an email or password for an ID.
// `email && password` is `false`.
// It is NOT added to `credentials`.
// So `credentials` will LACK this ID.
// THEN `setDoc` runs with `{ merge: true }`.
// In Firestore, if you merge an array, it OVERWRITES the array.
// Wait! `officialCredentials: credentials`.
// If `credentials` is an array of 2 elements, and previously it was 3 elements.
// Since it's an array, `merge: true` will replace the array with the new array!
// So it correctly deletes the credential from `officialCredentials`.

// WHAT ABOUT `ownerPanelCredentials: idsData`?
// `idsData` is an object.
// `merge: true` will MERGE the keys of `idsData` with the existing keys.
// So if `idsData` has `"500001": { email: "", password: "" }`.
// It will overwrite `"500001"` in Firestore with `{ email: "", password: "" }`.
// This is also correct!

// Let's rethink. Why would the user complain "Owner panel m GMAIL, PASSWORD SAVE nhi horaha"?
// "real time save hojeyga globally" -> "it will save in real time globally"
// Is the user requesting a feature? "Why is GMAIL, PASSWORD not saving in real time globally?"
// NO, "nhi horaha" means "is not happening" or "is failing to save".
// Bss Without any error -> "Just without any error" -> Maybe it IS throwing an error?
// But `setSaveMessage("Error saving credentials!")` is present. They said "Without any error", which implies NO error message is shown, but it still doesn't save!
// WHY WOULD IT NOT SAVE AND SHOW NO ERROR MESSAGE?

// IF `handleSave` is NEVER CALLED!
// Why would `handleSave` never be called?
// Because `isLocalUpdate.current` is set to `false` BEFORE the timeout is created?
// How can that happen?
//   const handleChange = (id: string, field: string, value: string) => {
//     isLocalUpdate.current = true;
//     setIdsData((prev) => ({
//       ...prev,
//       [id]: { ...prev[id], [field]: value },
//     }));
//   };
// `handleChange` sets it to `true`.
// `setIdsData` queues a state update.
// React batches the state update and re-renders.
// During the render phase, `isLocalUpdate.current` is `true`.
// After render, the `useEffect` runs.
// BUT what if `onSnapshot` FIRES between `handleChange` and `useEffect`?
// In React 18, `onSnapshot` callbacks run asynchronously, just like React state updates.
// If an `onSnapshot` is already queued in the microtask queue, it might run BEFORE the `useEffect` runs!
// Let's trace this:
// 1. `onSnapshot` event is received from Firebase. It is queued in the event loop.
// 2. User types a key. `handleChange` runs synchronously.
//    - `isLocalUpdate.current = true;`
//    - `setIdsData` queues a React render.
// 3. The event loop proceeds. React might yield, or the `onSnapshot` callback might run!
// 4. `onSnapshot` runs!
//    - It checks `isLocalUpdate.current`. It is `true`! (Set in step 2).
//    - It does `isLocalUpdate.current = false; return;`
// 5. React render executes.
// 6. `useEffect` runs.
//    - It checks `isLocalUpdate.current`. It is `false`! (Set in step 4).
//    - IT RETURNS EARLY!
// 7. The timeout is NEVER SET!
// 8. The user's typing is NEVER SAVED!
// AND THERE IS NO ERROR MESSAGE!
// "Owner panel m GMAIL, PASSWORD SAVE nhi horaha ... Without any error"
// THIS FITS PERFECTLY!

// Why would `onSnapshot` fire exactly when the user types?
// Because if multiple admins are typing, or if there's a constant stream of updates, `onSnapshot` fires often!
// OR, more likely, because the user typed a PREVIOUS character!
// User types "A". (Timer for "A" starts).
// 1000ms passes. `handleSave` for "A" is called.
// `setDoc` for "A" is called.
// Local `onSnapshot` for "A" is queued by Firebase!
// The user types "B" AT THE EXACT SAME MILLISECOND!
// `handleChange` for "B" runs:
// - `isLocalUpdate.current = true;`
// - `setIdsData` queues render for "B".
// Now the Local `onSnapshot` for "A" runs (it was queued before the render for "B").
// It checks `isLocalUpdate.current`. It is `true`!
// It sets `isLocalUpdate.current = false` AND RETURNS!
// Now React renders for "B".
// `useEffect` runs.
// `isLocalUpdate.current` is `false`.
// IT RETURNS EARLY!
// Timeout for "B" is NEVER SET!
// User stops typing.
// "B" IS NEVER SAVED!
// AND NO ERROR IS SHOWN!

// THIS IS IT! THIS IS THE BUG!
