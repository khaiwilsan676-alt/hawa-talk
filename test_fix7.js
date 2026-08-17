// Wait! Let's check `isLoadedFromFirestore.current = true;` inside `onSnapshot`.
//     const unsubscribe = onSnapshot(
//       docRef,
//       (docSnap: any) => {
//         if (docSnap.exists()) {
//           const serverData = docSnap.data().ownerPanelCredentials || {};
//           ...
//           setIdsData(currentData => {
//             ...
//             skipNextSave.current = true;
//             isLoadedFromFirestore.current = true;
//             return finalData;
//           });
//         } else {
//           isLoadedFromFirestore.current = true;
//         }
//       },
//
// If we add `if (Date.now() - lastTypingTime.current < 5000) return;` BEFORE `docSnap.exists()`.
// Then `isLoadedFromFirestore.current` might NOT be set to `true` if the user typed quickly after page load!
// We should do:
//       (docSnap: any) => {
//         isLoadedFromFirestore.current = true; // Set it immediately!
//
//         if (Date.now() - lastTypingTime.current < 5000) {
//           return;
//         }
//
//         if (docSnap.exists()) {
//
// Wait! `isLoadedFromFirestore.current = true` was previously set INSIDE `setIdsData`.
// If we set it outside, it's a mutation during render? No, `onSnapshot` callback is NOT a render function. It's a side-effect. So mutating a ref is perfectly fine!

// Let's implement this!
