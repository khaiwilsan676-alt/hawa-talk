// Wait! What if the user types "A". `isLocalUpdate.current = true`.
// Component re-renders.
// `useEffect` runs. Sets timeout for 1000ms.
// Then an unrelated `onSnapshot` fires (e.g. some other admin changed a completely different field, or the server just sent a periodic snapshot).
// This unrelated `onSnapshot` runs!
// It sees `isLocalUpdate.current == true`.
// It sets `isLocalUpdate.current = false` AND RETURNS!
// It completely ignores the other admin's change!
// This is a known issue, but it doesn't explain "My changes are not saving".

// Let's re-read the code very, very carefully.
//   const [idsData, setIdsData] = useState<Record<string, any>>(defaultIdsData);
//   const isLocalUpdate = useRef(false);
//
//   useEffect(() => {
//     if (!isLocalUpdate.current) return;
//
//     const timeoutId = setTimeout(() => {
//       handleSave();
//     }, 1000);
//
//     return () => clearTimeout(timeoutId);
//   }, [idsData, handleSave]);
//
// `handleSave` is:
//   const handleSave = useCallback(async () => {
//     ...
//   }, [idsData]);
//
// Every time `idsData` changes, `handleSave` is RE-CREATED.
// Since `handleSave` is in the dependency array of `useEffect`, the `useEffect` cleans up and RE-RUNS!
// When the `useEffect` re-runs, it checks `!isLocalUpdate.current`.
// If `isLocalUpdate.current` is `false`, IT RETURNS EARLY!
//
// NOW, let's go back to the previous scenario:
// User types "B". `handleChange` sets `isLocalUpdate.current = true`.
// State `idsData` updates to "B".
// Re-render.
// `useEffect` runs. `isLocalUpdate.current` is `true`. Timeout for "B" is set.
// Then, Server `onSnapshot` for "A" arrives!
// `onSnapshot` sees `isLocalUpdate.current == true`.
// It does: `isLocalUpdate.current = false; return;`
// Now `isLocalUpdate.current` is `false`.
// Does this trigger a re-render? No, it's just a ref.
// Does it cancel the timeout? No.
// BUT WAIT! What if the user types "C" RIGHT NOW?
// User types "C". `handleChange` sets `isLocalUpdate.current = true`.
// State `idsData` updates to "C".
// Re-render!
// `useEffect` runs. `isLocalUpdate.current` is `true`.
// It clears the timeout for "B" and sets a new timeout for "C".
// THIS IS FINE.

// What if the user DOES NOT type "C"?
// The timeout for "B" fires!
// It calls `handleSave` with "B".
// `setDoc` executes.
// Local `onSnapshot` for "B" arrives.
// What is `isLocalUpdate.current`? It was set to `false` by the Server `onSnapshot` for "A"!
// So Local `onSnapshot` for "B" sees `isLocalUpdate.current == false`!
// IT DOES NOT RETURN EARLY!
// It proceeds: `setIdsData(mergedData)`.
// IT SETS STATE!
// This triggers a RE-RENDER!
// In this re-render, `idsData` changes (new reference).
// `useEffect` runs again!
// `isLocalUpdate.current` is `false`.
// It returns early.
// THIS IS ALSO FINE!

// Is there a case where it gets STUCK and never saves?
// What if `handleSave` has an error?
// What if `merge: true` is doing something weird?
