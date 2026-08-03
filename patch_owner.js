const fs = require('fs');
let code = fs.readFileSync('app/owner/page.tsx', 'utf-8');

// The issue the user reported:
// "Bhai dekh save Hui wi gmail y password Dubare If hm Panel restart kerengy tho refresh nhi hogii bss"
// Meaning: if we restart the panel, the saved gmail or password isn't there anymore.
// Let's look at `handleSave`. It only saves to `officialCredentials` if BOTH email and password are provided.
// If one is missing, it still saves to `ownerPanelCredentials`.
// Wait...
// Let's look at `onSnapshot`.
// It loads `ownerPanelCredentials`.
// If `ownerPanelCredentials` is loaded, it should populate the fields.
// Let's check `setIdsData(currentData => ...)`
// It does:
// `const mergedData = { ...defaultIdsData };`
// BUT `defaultIdsData` objects are shared references!
// E.g. `const mergedData = { ...defaultIdsData }` does a SHALLOW copy.
// So `mergedData["500001"]` IS the same object as `defaultIdsData["500001"]`.
// If we then do:
// `mergedData[id] = { email: ..., password: ... }`
// We are REPLACING the reference for that key. This is fine.
// BUT what if `serverData[id]` does NOT exist?
// Then `mergedData[id]` remains `defaultIdsData[id]`, which is `{ email: "", password: "" }`.
// Wait... `idsData` is initialized as `defaultIdsData`.
// `const [idsData, setIdsData] = useState<Record<string, any>>(defaultIdsData);`
// In React, if you modify state, you should create a deep copy or use `prev`.
// The user says when the panel is restarted, it's not refreshing.

// Let's rethink. If they type email and password, click save.
// It saves successfully.
// They refresh the page.
// `onSnapshot` runs.
// Does it read `ownerPanelCredentials` correctly?
// Yes, `docSnap.data().ownerPanelCredentials`.
// Wait, is it possible `handleSave` has a bug?
code = code.replace(
  /const defaultIdsData = \{[\s\S]*?\};/,
  `const getDefaultIdsData = () => ({
    "500001": { email: "", password: "" },
    "500002": { email: "", password: "" },
    "500003": { email: "", password: "" },
    "500004": { email: "", password: "" },
    "500005": { email: "", password: "" },
    "700001": { email: "", password: "" },
    "700002": { email: "", password: "" },
    "700003": { email: "", password: "" },
  });`
);

code = code.replace(
  /const \[idsData, setIdsData\] = useState<Record<string, any>>\(defaultIdsData\);/,
  `const [idsData, setIdsData] = useState<Record<string, any>>(getDefaultIdsData());`
);

code = code.replace(
  /const mergedData = \{ \.\.\.defaultIdsData \};/g,
  `const mergedData = getDefaultIdsData();`
);
code = code.replace(
  /Object\.keys\(defaultIdsData\)\.forEach\(id => \{/g,
  `Object.keys(getDefaultIdsData()).forEach(id => {`
);

// I should implement a solution for the real-time input dropping as well.
// The user says "real time save hojeyga globally". This implies they WANT real-time syncing.
// If I use the `focusedField` ref, it prevents drops while typing.

code = code.replace(
  /const isLocalUpdate = useRef\(false\);/,
  `const focusedField = useRef<string | null>(null);
  const skipNextSave = useRef(false);`
);

code = code.replace(
  /if \(isLocalUpdate\.current\) \{\s*\/\/\s*Skip updating state if the change originated locally\s*\/\/\s*DO NOT reset isLocalUpdate\.current here, wait for the actual save to complete\s*return;\s*\}/,
  `// Removed isLocalUpdate check to allow continuous real-time sync`
);

code = code.replace(
  /setIdsData\(currentData => \{\s*if \(JSON\.stringify\(currentData\) === JSON\.stringify\(mergedData\)\) \{\s*return currentData; \/\/ Deep equal, do not trigger a state update\s*\}\s*return mergedData;\s*\}\);/,
  `setIdsData(currentData => {
            const finalData = JSON.parse(JSON.stringify(mergedData));

            // Preserve the currently focused field's value to prevent dropped keystrokes
            if (focusedField.current) {
              const [focusedId, focusedKey] = focusedField.current.split('-');
              if (finalData[focusedId] && currentData[focusedId]) {
                finalData[focusedId][focusedKey] = currentData[focusedId][focusedKey];
              }
            }

            if (JSON.stringify(currentData) === JSON.stringify(finalData)) {
              return currentData; // Deep equal, do not trigger a state update
            }
            skipNextSave.current = true;
            return finalData;
          });`
);

code = code.replace(
  /useEffect\(\(\) => \{\s*if \(\!isLocalUpdate\.current\) return;\s*const timeoutId = setTimeout\(\(\) => \{\s*isLocalUpdate\.current = false;\s*handleSave\(\);\s*\}, 1000\);\s*return \(\) => clearTimeout\(timeoutId\);\s*\}, \[idsData, handleSave\]\);/,
  `useEffect(() => {
    if (skipNextSave.current) {
      skipNextSave.current = false;
      return;
    }

    const timeoutId = setTimeout(() => {
      handleSave();
    }, 1000);

    return () => clearTimeout(timeoutId);
  }, [idsData, handleSave]);`
);

code = code.replace(
  /isLocalUpdate\.current = true;/,
  `skipNextSave.current = false;`
);

code = code.replace(
  /onChange=\{\(e\) => handleChange\(id, "email", e.target.value\)\}/g,
  `onChange={(e) => handleChange(id, "email", e.target.value)}
                        onFocus={() => focusedField.current = \`\${id}-email\`}
                        onBlur={() => focusedField.current = null}`
);

code = code.replace(
  /onChange=\{\(e\) => handleChange\(id, "password", e.target.value\)\}/g,
  `onChange={(e) => handleChange(id, "password", e.target.value)}
                        onFocus={() => focusedField.current = \`\${id}-password\`}
                        onBlur={() => focusedField.current = null}`
);

// Fix hydration error
code = code.replace(
  /const \[isLoggedIn, setIsLoggedIn\] = useState\(\(\) => \{[\s\S]*?return false;\s*\}\);/,
  `const [isLoggedIn, setIsLoggedIn] = useState(false);
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsLoggedIn(localStorage.getItem('ownerPanelLoggedIn') === 'true');
    }
  }, []);`
);

fs.writeFileSync('app/owner/page.tsx', code);
console.log("Patched everything!");
