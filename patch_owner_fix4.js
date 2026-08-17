// AND there is another issue:
// The user says "Owner panel m GMAIL, PASSWORD SAVE nhi horaha kyuu real time save hojeyga globally Bss Without any error"
// Why do they say "Bss Without any error"?
// Because it just silently fails to save their data!
// Whenever ANY snapshot arrives (even latency compensation from their OWN previous saves, or other users), it cancels their current debounce!

// Wait! If I save "a", it triggers a local `onSnapshot`!
// The local `onSnapshot` sets `skipNextSave.current = true`.
// So if I type "b" IMMEDIATELY after "a" is saved (or during the save process), the `onSnapshot` from "a" might arrive and CANCEL my debounce for "b"!
// EXACTLY!
// If I type "a", wait 1000ms. It saves.
// The save triggers `onSnapshot` which takes maybe 50ms locally.
// If I type "b" during that 50ms, `skipNextSave` becomes `false`.
// Then `onSnapshot` runs and sets `skipNextSave.current = true`.
// Then `useEffect` runs, sees `skipNextSave == true`, cancels the save for "b"!
// My typing is SILENTLY LOST!

// HOW TO FIX THIS?
// We need to NOT cancel the save!
// Wait, why did we add `skipNextSave` in the first place?
// We added it to prevent INFINITE LOOPS!
// If `onSnapshot` updates state, it changes `idsData`.
// This triggers `useEffect`.
// `useEffect` sets a timeout to `handleSave`.
// `handleSave` saves to Firestore.
// Firestore triggers `onSnapshot`.
// `onSnapshot` updates state.
// Infinite loop!

// BUT wait!
// Look at `onSnapshot`:
// ```javascript
//             if (JSON.stringify(currentData) === JSON.stringify(finalData)) {
//               return currentData;
//             }
// ```
// If the data is EXACTLY the same, it returns `currentData` without setting state!
// If it returns `currentData`, React DOES NOT RE-RENDER!
// So `idsData` does NOT change!
// So `useEffect` does NOT run!
// So NO infinite loop!

// So we DON'T NEED `skipNextSave` to prevent infinite loops! The deep equality check is sufficient!
// We can just completely remove `skipNextSave`!
