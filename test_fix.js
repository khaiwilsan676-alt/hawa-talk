// So the bug is that `onSnapshot` sets `skipNextSave.current = true` ONLY when the state ACTUALLY updates (not deep equal).
// BUT! What if I type "A". `handleChange` sets `skipNextSave.current = false`.
// State updates. `idsData` changes.
// `useEffect` runs. `skipNextSave.current` is `false`.
// It starts a 1000ms timer.
// NOW, before the 1000ms timer fires, ANOTHER EVENT triggers `onSnapshot`.
// E.g. someone else saves, or a local confirmation.
// The `onSnapshot` runs.
// It creates `finalData`.
// It checks `JSON.stringify(currentData) === JSON.stringify(finalData)`.
// If it is different, it updates the state AND sets `skipNextSave.current = true`.
// When it updates the state, React re-renders.
// The `useEffect` for auto-save runs AGAIN!
// It clears the OLD timeout for "A".
// It checks `skipNextSave.current`. It is `true`!
// IT RETURNS EARLY!
// It sets `skipNextSave.current = false`!
// THE AUTO-SAVE TIMER IS CANCELLED AND NEVER RE-STARTED!
// "A" is NEVER saved!
// THIS IS THE EXACT BUG!
