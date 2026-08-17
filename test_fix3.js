// Wait! `targetData` inside `handleSave` has the LATEST data.
// Is it possible that `idsData` inside `handleSave` is STALE?
// No, `handleSave` has `[idsData]` dependency.
// But what if `handleSave` is called from the `setTimeout` closure?
// The `useEffect` has `[idsData, handleSave]` dependencies.
// When `idsData` changes, the effect is cleaned up, `clearTimeout` runs.
// Then a NEW timeout is created, with the NEW `handleSave`.
// So it ALWAYS has the latest `idsData`.

// What if `handleSave` is failing because of RULES?
// They said "Without any error".

// Let's reconsider `JSON.stringify(currentData) === JSON.stringify(finalData)`
// If `finalData` has different key order, they are NOT equal.
// What if `finalData` has keys in a DIFFERENT ORDER?
// `mergedData` is constructed by copying `defaultIdsData` keys first:
// `Object.keys(defaultIdsData).forEach(id => { ... })`
// So `mergedData` has keys in order of `defaultIdsData` keys.
// What about `currentData`?
// It was initialized with `getDefaultIdsData()`.
// When `handleChange` runs:
// `setIdsData((prev) => ({ ...prev, [id]: { ...prev[id], [field]: value } }));`
// Object spread `{...prev}` preserves key order!
// `[id]: { ... }` OVERWRITES the existing key.
// In modern JS, overwriting an existing key DOES NOT move it to the end.
// So `currentData` keys are ALWAYS in `defaultIdsData` order!
// Inside the nested object `{ ...prev[id], [field]: value }`:
// `prev[id]` has `email`, `password`.
// Overwriting `email` keeps it first.
// Overwriting `password` keeps it second.
// So key order is IDENTICAL!

// So `JSON.stringify` works perfectly.

// THEN WHAT IS THE PROBLEM?
// WHAT IF... `skipNextSave.current` is preventing auto-save, but NOT because of the bug I found?
// Oh wait.
// In `onSnapshot`:
//             if (JSON.stringify(currentData) === JSON.stringify(finalData)) {
//               return currentData;
//             }
//             skipNextSave.current = true;
//             isLoadedFromFirestore.current = true;
//             return finalData;
// If the user's data DOES NOT MATCH the server's data.
// Why wouldn't it match?
// Because the server snapshot is from BEFORE the user finished typing!
// E.g. User types "A". Saves.
// User types "B".
// Server snapshot for "A" arrives!
// `finalData` has "A".
// `currentData` has "AB".
// `focusedField.current` is STILL SET to the input!
// Wait. If `focusedField.current` is set, `finalData`'s field is overwritten by `currentData`'s field!
// So `finalData` gets "AB" for that specific field!
// `currentData` has "AB" for that field.
// WHAT ABOUT OTHER FIELDS?
// If no other fields were changed, `finalData` and `currentData` are EXACTLY EQUAL!
// So it returns `currentData`!
// IT DOES NOT SET `skipNextSave.current = true`!
// Wait! If they are exactly equal, it returns `currentData`.
// And `skipNextSave.current` remains `false`!
// So the auto-save for "AB" CONTINUES AND WORKS!

// THERE IS NO BUG HERE EITHER!

// WAIT. WHAT IF THE USER CLICKS "Save All Credentials"?
// `onClick={() => handleSave()}`
// It saves.
// Does it work? Yes.

// "Owner panel m GMAIL, PASSWORD SAVE nhi horaha"
// Is it possible they are typing into a field that they are NOT focused on? No.
// Is it possible that `onBlur` happens BEFORE `onSnapshot`?
// User types "H". Then clicks outside the input.
// `onBlur` sets `focusedField.current = null`.
// The 1000ms timer is running.
// If the server snapshot for previous data arrives NOW!
// `focusedField.current` is `null`.
// `finalData` does NOT get overwritten by `currentData`.
// `finalData` has old data.
// `currentData` has "H".
// They are NOT equal!
// `onSnapshot` SETS STATE TO `finalData` (old data)!
// IT REVERTS THE USER'S INPUT "H"!
// AND sets `skipNextSave.current = true`.
// So the 1000ms timer for "H" fires.
// But `skipNextSave.current` is `true`.
// So the `useEffect` doesn't do anything... wait!
// The `useEffect` has ALREADY run and set the timer!
// The timer fires `handleSave()`.
// BUT `idsData` in `handleSave` is... STALE?
// Let's check `useEffect`:
//   useEffect(() => { ... timeout = setTimeout(() => handleSave(), 1000) ... }, [idsData, handleSave]);
// If `idsData` changes (due to the `onSnapshot` revert), the `useEffect` cleans up!
// It `clearTimeout(timeoutId)`!
// The timer for "H" is CANCELLED!
// And the NEW `useEffect` runs for the reverted data.
// It checks `skipNextSave.current`. It is `true`!
// It sets `skipNextSave.current = false` AND RETURNS EARLY!
// SO "H" IS REVERTED AND NEVER SAVED!
// AND NO ERROR IS SHOWN!

// YES!!! THIS IS THE BUG!!!
