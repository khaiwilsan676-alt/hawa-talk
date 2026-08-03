// Wait! Let's read `app/owner/page.tsx` carefully again.
// What if `handleSave` is THROWING an error silently?
//   const handleSave = useCallback(async () => {
//     try {
//       ...
//       await setDoc(docRef, {
//         ownerPanelCredentials: idsData,
//         officialCredentials: credentials
//       }, { merge: true });
//
//       localStorage.setItem('ownerPanelCredentials', JSON.stringify(idsData));
//       localStorage.setItem('officialCredentials', JSON.stringify(credentials));
//
//       setSaveMessage("Credentials saved successfully!");
//       setTimeout(() => setSaveMessage(""), 3000);
//     } catch (error) {
//       console.error("Error saving credentials:", error);
//       setSaveMessage("Error saving credentials!");
//       setTimeout(() => setSaveMessage(""), 3000);
//     }
//   }, [idsData]);
//
// In React 18, if `handleSave` is called during a render or right after, it could be fine.
// But wait!
// Is there ANY bug with `isLocalUpdate.current = false; return;` inside `onSnapshot`?
// YES!
// What if we REMOVE the `isLocalUpdate` check completely, and INSTEAD deeply compare the new data with the old data?
// If we deeply compare, we prevent the infinite loop (set state -> effect -> handleSave -> setDoc -> onSnapshot -> set state).
// BUT deep compare doesn't solve the issue of overwriting local typing.
// The standard fix for "Firestore real-time input overwriting local typing" is:
// Store the server data in one state, and the local input in another state. Or don't update local state if the input is focused.
// BUT since this is an admin panel, maybe the issue is that it's NOT SAVING at all.

// Let's think about this:
// User says "Owner panel m GMAIL, PASSWORD SAVE nhi horaha"
// Is it possible that `idsData` is NOT updating when they type?
//   const handleChange = (id: string, field: string, value: string) => {
//     isLocalUpdate.current = true;
//     setIdsData((prev) => ({
//       ...prev,
//       [id]: { ...prev[id], [field]: value },
//     }));
//   };
// This is perfectly fine.

// What if the bug is that `ownerPanelCredentials` is nested?
// `docSnap.data().ownerPanelCredentials`
// Let's check `setDoc`:
//       await setDoc(docRef, {
//         ownerPanelCredentials: idsData,
//         officialCredentials: credentials
//       }, { merge: true });
// This saves an object like:
// {
//   ownerPanelCredentials: {
//     "500001": { email: "a", password: "b" },
//     ...
//   },
//   officialCredentials: [ { id: "500001", email: "a", password: "b", type: "official" } ]
// }
// This matches what `onSnapshot` expects.

// COULD IT BE:
// When they load the page, they see nothing because `ownerPanelCredentials` wasn't merged properly?
//   const mergedData = { ...defaultIdsData };
//   Object.keys(defaultIdsData).forEach(id => {
//     if (serverData[id]) {
//       mergedData[id as keyof typeof mergedData] = {
//         email: serverData[id].email || "",
//         password: serverData[id].password || ""
//       };
//     }
//   });
// Wait. If `serverData[id]` is defined, it OVERWRITES `mergedData[id]`.
// BUT if `serverData[id]` is UNDEFINED, it leaves `mergedData[id]` as `{ email: "", password: "" }`.
// Wait... NO!
// `const mergedData = { ...defaultIdsData };`
// This shallow copies the object.
// So `mergedData["500001"]` IS THE SAME REFERENCE as `defaultIdsData["500001"]`.
// If `serverData["500001"]` is undefined, `mergedData["500001"]` is STILL `{ email: "", password: "" }`.
// If the user types into "500001", `handleChange` does:
//   setIdsData(prev => ({ ...prev, "500001": { ...prev["500001"], email: "x" } }))
// This works perfectly fine!

// Wait! Look at this:
//   const handleSave = useCallback(async () => {
//     ...
//   }, [idsData]);
// The `handleSave` has `idsData` as a dependency.
// AND the `useEffect` has `handleSave` as a dependency.
// So the `useEffect` resets its timeout every time `idsData` changes.
// THIS MEANS `handleSave` will ONLY be called if the user STOPS typing for 1000ms!
// If the user types continuously, it NEVER saves!
// Is this a problem?
// Usually, users pause for 1 second. So it SHOULD save.
// But what if they type a letter, then IMMEDIATELY close the tab?
// It will not save.
// But they have a "Save All Credentials" button!
// If they click that button, it calls `handleSave()` manually.
// So they COULD save it.
