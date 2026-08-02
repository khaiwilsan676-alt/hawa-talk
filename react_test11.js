// Is it possible the real bug is that `ownerPanelCredentials` data is lost when merging with `defaultIdsData`?
//   const mergedData = { ...defaultIdsData };
//   Object.keys(defaultIdsData).forEach(id => {
//     if (serverData[id]) {
//       mergedData[id as keyof typeof mergedData] = {
//         email: serverData[id].email || "",
//         password: serverData[id].password || ""
//       };
//     }
//   });
// Here, we loop over keys of `defaultIdsData` ("500001" to "700003").
// We check if `serverData[id]` exists.
// If it does, we set `mergedData[id]`.
// If it doesn't, `mergedData[id]` remains the default `{ email: "", password: "" }`.
// Wait...
// `const mergedData = { ...defaultIdsData };`
// If `serverData` has NO data for "500001", `mergedData["500001"]` will be `{ email: "", password: "" }`.
// BUT `mergedData["500001"]` is a reference to `defaultIdsData["500001"]`.
// This doesn't matter because we only modify it via `setIdsData(prev => ({ ...prev, [id]: ... }))`.

// WHAT IF `serverData[id]` HAS data, but the `email` is NOT string?
// `email: serverData[id].email || ""`
// That's fine.

// What if the issue is in `handleChange`?
//   const handleChange = (id: string, field: string, value: string) => {
//     isLocalUpdate.current = true;
//     setIdsData((prev) => ({
//       ...prev,
//       [id]: { ...prev[id], [field]: value },
//     }));
//   };
// This properly updates state.

// So what is the ACTUAL issue the user reported?
// "Owner panel m GMAIL, PASSWORD SAVE nhi horaha"
// Is it possible that `idsData` is NOT `ownerPanelCredentials`?
// Let's check `LoginPage.tsx` or wherever these credentials are used.
// If they are used for login in `LoginPage.tsx`:
//   const docRef = doc(db, "adminSettings", "credentials");
//   const docSnap = await getDoc(docRef);
//   if (docSnap.exists() && docSnap.data().officialCredentials) {
//     const credentials = docSnap.data().officialCredentials;
//     const matched = credentials.find( ... );
//
// Yes, `LoginPage.tsx` uses `officialCredentials`.
// And `handleSave` creates `officialCredentials` by iterating over `idsData`.
// BUT it ONLY adds to `officialCredentials` if BOTH `email` AND `password` are present!
//   if (email && password) {
//     credentials.push({ ... });
//   }
// So if the user ONLY types the email, it does NOT get added to `officialCredentials`.
// But it DOES get saved to `ownerPanelCredentials`.
// The Owner Panel UI will show the email.
// But the login will NOT work for that user.
// But the user didn't say "Login is not working". They said "Owner panel m GMAIL, PASSWORD SAVE nhi horaha".
// "In Owner panel, GMAIL and PASSWORD are NOT saving".
