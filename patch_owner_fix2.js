const fs = require('fs');

// Look at the memory:
// "When utilizing the database onSnapshot for real-time, 2-way data binding on user inputs (e.g., Owner Panel credentials), avoid early returns that block server updates. Instead, track the focusedField to prevent overwriting active inputs, use deep equality checks to prevent loops, and use factory functions (e.g., getDefaultIdsData()) instead of shared objects to prevent state mutation bugs on reloads."

// I ALREADY DID THIS IN A PREVIOUS TASK!!!
// Wait!
// "Owner panel m GMAIL, PASSWORD SAVE nhi horaha kyuu real time save hojeyga globally Bss Without any error"
// Why is it not saving NOW?

// Let's check `skipNextSave`.
// When I introduced `skipNextSave`, I did this:
//   const handleChange = (id: string, field: string, value: string) => {
//     skipNextSave.current = false;
//     setIdsData((prev) => ({
//       ...prev,
//       [id]: { ...prev[id], [field]: value },
//     }));
//   };
//
//   useEffect(() => {
//     if (skipNextSave.current) {
//       skipNextSave.current = false;
//       return;
//     }
//     if (!isLoadedFromFirestore.current) {
//       return;
//     }
//     const timeoutId = setTimeout(() => {
//       handleSave();
//     }, 1000);
//     return () => clearTimeout(timeoutId);
//   }, [idsData, handleSave]);
//
// In `onSnapshot`:
//             skipNextSave.current = true;
//             isLoadedFromFirestore.current = true;
//             return finalData;

// Wait. If `handleChange` is called rapidly:
// 1. User types "a". skipNextSave = false. idsData updates.
// 2. React re-renders.
// 3. useEffect runs: skipNextSave is FALSE. It sets timeout 1000ms.
// 4. Before 1000ms, user types "b". skipNextSave = false. idsData updates.
// 5. React re-renders.
// 6. useEffect runs: clears timeout. skipNextSave is FALSE. It sets timeout 1000ms.
// 7. Timeout fires. handleSave() runs.
// 8. handleSave() calls setDoc().
// 9. setDoc() triggers local onSnapshot().
// 10. onSnapshot() runs. It sets state. `skipNextSave.current = true`.
// 11. React re-renders due to onSnapshot.
// 12. useEffect runs: `skipNextSave.current` is TRUE. It sets it to FALSE and returns.

// THIS LOOKS CORRECT!

// But what if `handleSave` is called, and `idsData` changes BEFORE `onSnapshot` runs?
// The user says it's NOT SAVING.
// Why wouldn't it save?
// What if `handleSave` has an error? "Without any error".
