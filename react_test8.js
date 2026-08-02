// Wait! Let's check `isLocalUpdate.current = false` inside `onSnapshot` again!
// If the user clicks "Save All Credentials", it triggers `handleSave()`.
// `handleSave` saves to Firestore.
// `onSnapshot` runs (local latency compensation).
// BUT! When the user clicks the button, `isLocalUpdate.current` might be `false`!
// (Because they probably paused for >1s, the auto-save ran, and `onSnapshot` reset it to `false`).
// IF `isLocalUpdate.current` is `false`, `onSnapshot` DOES NOT return early!
// It continues:
//   const serverData = docSnap.data().ownerPanelCredentials || {};
//   const mergedData = { ...defaultIdsData };
//   ...
//   setIdsData(mergedData);
// It sets the state with the NEW data from Firestore.
// Since the data from Firestore is EXACTLY what the user just saved, the state is set to the SAME values.
// This is perfectly fine.

// THEN WHAT IS THE PROBLEM?
// "Owner panel m GMAIL, PASSWORD SAVE nhi horaha kyuu real time save hojeyga globally Bss Without any error"
// Is it possible the problem is that `ownerPanelCredentials` is completely EMPTY when it's saved?
// Let's check `handleSave` again.
//       const credentials: any[] = [];
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
// What if `idsData` is EMPTY?
// No, it's initialized with `defaultIdsData`, which has 8 keys.
// So `ownerPanelCredentials` will have 8 keys.

// WAIT! What if the user types an email, and it auto-saves.
// Then they type a password.
// When they type the password, does it save? Yes.

// LET'S LOOK AT THE BUG ONE MORE TIME.
// What if the user's internet is slow.
// User types "A". `isLocalUpdate = true`. Auto-saves in 1s.
// Local `onSnapshot` sets `isLocalUpdate = false`.
// User types "B". `isLocalUpdate = true`.
// Wait... if the server snapshot for "A" arrives NOW, it sees `isLocalUpdate = true`.
// It sets `isLocalUpdate = false` and returns.
// The user has typed "B". But `isLocalUpdate` is now `false`.
// The 1s timer for "B" fires!
// It calls `handleSave()` with "B".
// `setDoc` executes.
// Local `onSnapshot` fires for "B".
// What is `isLocalUpdate`? It is `false`.
// So it DOES NOT RETURN EARLY!
// It sets state to "B".
// STILL NO BUG!

// What if the auto-save effect DOES NOT HAVE the right dependencies?
//   useEffect(() => {
//     if (!isLocalUpdate.current) return;
//     const timeoutId = setTimeout(() => {
//       handleSave();
//     }, 1000);
//     return () => clearTimeout(timeoutId);
//   }, [idsData, handleSave]);
// This is perfect.

// WAIT... What if the `onSnapshot` is missing something?
//     const unsubscribe = onSnapshot(
//       docRef,
//       (docSnap) => {
//         if (isLocalUpdate.current) {
//           // Skip updating state if the change originated locally
//           isLocalUpdate.current = false;
//           return;
//         }
// What if the user types "A".
// `handleChange` sets `isLocalUpdate = true`.
// `idsData` is updated.
// `useEffect` sets a 1000ms timeout.
// BEFORE 1000ms, ANOTHER CLIENT saves data to Firestore.
// The SERVER `onSnapshot` arrives!
// `onSnapshot` runs!
// It sees `isLocalUpdate.current` is `true`.
// It sets `isLocalUpdate.current = false` AND RETURNS!
// IT IGNORES THE OTHER CLIENT'S DATA!!!
// The user is typing "A", so their local data doesn't have the other client's changes.
// After 1000ms, `handleSave` saves the user's data ("A"), OVERWRITING the other client's data completely!
// This is a concurrency issue.
// BUT that's normal for a simple app without CRDTs.

// Is there ANY situation where the USER'S OWN typing is lost?
// User types "A". `isLocalUpdate = true`.
// Timer starts.
// BEFORE timer fires, server snapshot (from another client) arrives.
// `isLocalUpdate` is set to `false`.
// Timer for "A" fires. `handleSave` saves "A".
// `setDoc` triggers local snapshot. `isLocalUpdate` is `false`. State updates to "A".
// Server snapshot for "A" arrives. `isLocalUpdate` is `false`. State updates to "A".
// NO, "A" is NEVER lost.

// Wait. What if `docSnap.exists()` is false initially?
// Then the user types "A". `isLocalUpdate = true`.
// Timer starts.
// Server snapshot arrives (still doesn't exist). `isLocalUpdate` becomes `false`.
// Timer for "A" fires. `handleSave` saves "A".
// EVERYTHING WORKS.

// SO WHAT IS THE PROBLEM?
// "Owner panel m GMAIL, PASSWORD SAVE nhi horaha kyuu real time save hojeyga globally Bss Without any error"
// Is it because `idsData` is somehow not being mutated?
// No, `setIdsData` works.

// What if the problem is in `handleChange`?
//   const handleChange = (id: string, field: string, value: string) => {
//     isLocalUpdate.current = true;
//     setIdsData((prev) => ({
//       ...prev,
//       [id]: { ...prev[id], [field]: value },
//     }));
//   };
// This looks perfect.

// Wait! Look at `idsData` in the initial state!
//   const [idsData, setIdsData] = useState<Record<string, any>>(defaultIdsData);
// `defaultIdsData` is an object of objects.
// When `onSnapshot` runs and `isLocalUpdate` is false:
//           const mergedData = { ...defaultIdsData };
//           Object.keys(defaultIdsData).forEach(id => {
//             if (serverData[id]) {
//               mergedData[id as keyof typeof mergedData] = {
//                 email: serverData[id].email || "",
//                 password: serverData[id].password || ""
//               };
//             }
//           });
//           setIdsData(mergedData);
// If `serverData["500001"]` doesn't exist, `mergedData["500001"]` is EXACTLY `defaultIdsData["500001"]`.
// This means multiple renders might share the SAME REFERENCE to `defaultIdsData["500001"]`.
// Does this matter?
// `handleChange` does: `[id]: { ...prev[id], [field]: value }`.
// It creates a NEW object for `id`. It DOES NOT mutate `defaultIdsData["500001"]`.
// So this is perfectly fine.
