// Wait! What if the user types "A". `isDirtied.current = true`. Timer starts.
// 1000ms passes.
// Timer fires. calls `handleSave()`.
// `isDirtied.current = false`.
// What if user types "B" RIGHT NOW?
// `handleChange` sets `isDirtied.current = true`.
// Component renders.
// BUT `setDoc` for "A" triggers local `onSnapshot`!
// What is `isDirtied.current`? It was just set to `true` by "B"!
// So local `onSnapshot` for "A" sees `isDirtied.current == true`.
// It returns early! (Doesn't overwrite "B" with "A").
// This is exactly what we want!

// What if `handleSave` is called manually (by button click)?
//   const handleSaveClick = () => {
//     handleSave();
//     isDirtied.current = false;
//   };
//
// Let's modify `app/owner/page.tsx` to fix the `isLocalUpdate` logic!
