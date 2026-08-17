// A MUCH BETTER FIX for the "reverting" bug:
// Currently, `onSnapshot` updates state by merging `serverData` with `defaultIdsData`, and then EXCEPTIONALLY copying the currently FOCUSED field from `currentData` to `finalData`.
// But any field that is NOT currently focused, but HAS unsaved changes, gets REVERTED.
// If the user tabs quickly, the previous field loses focus. It is no longer protected by `focusedField.current`.
// So it gets reverted by any incoming snapshot (including the delayed snapshot of their own previous save!).

// The absolute best way to handle this in a form where users type across multiple fields:
// Track `pendingChanges` at the FIELD level?
// Or simply NEVER overwrite local state with `onSnapshot` UNLESS the user explicitly refreshes, OR we use a "last write timestamp" approach.
// But the simplest fix is to recognize that `onSnapshot` for `ownerPanelCredentials` is ONLY meant to sync changes made by OTHER admins.
// In practice, this admin panel is rarely used by multiple people editing the EXACT SAME ID concurrently.
// What if we just deeply merge `serverData` but ONLY for fields that the user HASN'T changed locally?
// That requires tracking `dirtyFields`.
// A simpler approach: If the user has ANY pending changes in the timer queue, completely ignore `onSnapshot`!
// We can use a `pendingSaveCount` ref.
// In `handleChange`: `pendingSaveCount.current++`
// In `handleSave`: `pendingSaveCount.current = 0` (or decrement).
// But timers can overlap.
// A simpler way:
// Just use a `isTyping` ref that is set to `true` on focus, and `false` on blur? No, user might click somewhere else and wait 1s.

// Let's use `lastTypingTime.current = Date.now()`.
// In `onSnapshot`:
//   if (Date.now() - lastTypingTime.current < 2000) {
//     return; // User is actively typing or just finished. Ignore server snapshots to prevent reverts.
//   }
//
// In `handleChange`:
//   lastTypingTime.current = Date.now();
//
// This is incredibly simple and robust.
// If they type, we ignore server snapshots for 2 seconds.
// Since the auto-save is 1 second, the save will complete within 2 seconds.
// The local snapshot will be ignored. The server snapshot will likely be ignored.
// After 2 seconds, if another snapshot arrives, it will update the state.
// BUT wait, what if the server snapshot for their OWN save arrives after 3 seconds?
// It will update the state.
// Is `finalData` identical to `currentData`?
// Yes, their save was the last one! So it will update to the same data.
// So there is NO reversion.

// Let's verify `app/owner/page.tsx` again.
// We can just add `lastTypingTime = useRef(0);`
// In `handleChange`: `lastTypingTime.current = Date.now();`
// In `onSnapshot`: `if (Date.now() - lastTypingTime.current < 2000) return;`
// Wait! If `onSnapshot` returns early, does it skip `isLoadedFromFirestore.current = true`?
// Yes!
// But if they are typing, they already loaded it. (You can't type if it's not loaded).
// What if they type before it loads? (From `localStorage`).
// `isLoadedFromFirestore` is only used to prevent auto-save from firing ON LOAD.
//   if (!isLoadedFromFirestore.current) {
//     return;
//   }
// If we return early in `onSnapshot`, `isLoadedFromFirestore.current` remains `false`.
// So their typing WILL NEVER BE SAVED!
// Ah! We must ensure `isLoadedFromFirestore.current = true` is still set!

// Let's do this:
//   const unsubscribe = onSnapshot(docRef, (docSnap) => {
//     isLoadedFromFirestore.current = true; // ALWAYS set it!
//     if (Date.now() - lastTypingTime.current < 3000) {
//        return; // Ignore updates while typing to prevent overwriting
//     }
//     ...
//   })

// Wait! This works!
// But what about the `focusedField` logic?
// We can KEEP the `focusedField` logic as a secondary protection!
// And add `lastTypingTime.current`.

// Let's refine the `handleSave` bug.
// The user says: "Owner panel m GMAIL, PASSWORD SAVE nhi horaha"
// Is it possible the bug is just the `skipNextSave` bug I found earlier?
// Let's re-read the `skipNextSave` issue.
// If `finalData` is different from `currentData`, it updates state and `skipNextSave.current = true`.
// So the NEXT `useEffect` run will return early.
// If the user types "H", `handleChange` runs, `skipNextSave.current = false`.
// State updates, `useEffect` sets timeout.
// IF a server snapshot arrives before 1s, it updates state (if different).
// `skipNextSave.current` becomes `true`.
// The state update triggers `useEffect`.
// The OLD timeout is cancelled!
// `skipNextSave.current` is `true`, so it returns early!
// The NEW timeout is NEVER set!
// "H" IS LOST AND NEVER SAVED!
// AND this happens ANY TIME a server snapshot arrives while you are typing!
// Why would a server snapshot arrive while you are typing?
// Because you JUST finished typing a previous field!
// You typed the Email field. 1s passed. `handleSave` fired. `setDoc` started.
// You quickly tab to Password field and type "P".
// Timeout for "P" starts.
// `setDoc` for Email finishes.
// Server `onSnapshot` for Email arrives!
// `onSnapshot` sees `finalData` (which has the old Password, because the server doesn't have "P" yet).
// `currentData` has "P".
// Wait! `focusedField` is on the Password field!
// So `finalData` copies "P" from `currentData`!
// So `finalData` and `currentData` are EQUAL!
// It returns `currentData`!
// IT DOES NOT SET `skipNextSave.current = true`!
// State DOES NOT update!
// `useEffect` DOES NOT run!
// Timeout for "P" IS NOT CANCELLED!
// "P" IS SAVED CORRECTLY!

// WAIT! What if the user tabs to the next user's Email field?
// They type "Email 1". 1s passes. Saves.
// They tab to "Password 1". Type "Pass 1". 1s passes. Saves.
// They tab to "Email 2". Type "Email 2".
// Server snapshot for "Pass 1" arrives!
// `focusedField` is on "Email 2".
// `finalData` copies "Email 2" from `currentData`.
// BUT `finalData` DOES NOT have "Pass 1" yet?
// Wait, the server snapshot FOR "Pass 1" has "Pass 1"!
// `currentData` ALSO has "Pass 1"!
// So `finalData` and `currentData` are EQUAL!

// WHAT IF `focusedField` is NOT set?
// User clicks OUTSIDE the input.
// `focusedField.current = null`.
// Server snapshot for "Pass 1" arrives!
// `finalData` and `currentData` are BOTH "Pass 1".
// They are EQUAL!

// WHEN ARE THEY NOT EQUAL?
// They are ONLY not equal if another admin is editing, OR if there's a race condition where the local state has pending changes that the server snapshot doesn't have.
// E.g. User types "A" in Email 1.
// User types "B" in Email 2.
// Server snapshot for "A" arrives.
// Server snapshot does NOT have "B".
// `currentData` has "B".
// `focusedField.current` is on Email 2.
// `finalData` copies "B" into Email 2.
// NOW `finalData` has "B".
// Are they equal? YES!

// WHAT IF the user clicked OUTSIDE after typing "B"?
// User types "A" in Email 1.
// User types "B" in Email 2.
// User clicks outside. `focusedField.current = null`.
// Server snapshot for "A" arrives!
// Server snapshot does NOT have "B".
// `currentData` has "B".
// `focusedField.current` is `null`.
// `finalData` does NOT copy "B".
// `finalData` has whatever was in Email 2 before (e.g. "").
// `currentData` has "B".
// THEY ARE NOT EQUAL!
// `onSnapshot` sets state to `finalData` (which has "")!
// "B" IS REVERTED AND LOST!
// AND `skipNextSave.current = true` is set.
// So "B" is NEVER SAVED!

// THIS IS THE EXACT BUG!
// It happens if you type quickly across fields and click outside, OR if you type in a field and tab to a field but don't focus it properly, OR if multiple fields are pending!
