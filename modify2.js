const fs = require('fs');

let content = fs.readFileSync('app/owner/page.tsx', 'utf8');

// 1. Restore the useEffect, but with our new logic!
content = content.replace(
  /  const handleChange = \(id: string, field: string, value: string\) => \{\n    setIdsData\(\(prev\) => \{\n      const updatedData = \{\n        \.\.\.prev,\n        \[id\]: \{ \.\.\.prev\[id\], \[field\]: value \},\n      \};\n      pendingSaveDataRef\.current = updatedData;\n      return updatedData;\n    \}\);\n\n    if \(saveTimeoutRef\.current\) \{\n      clearTimeout\(saveTimeoutRef\.current\);\n    \}\n    saveTimeoutRef\.current = setTimeout\(\(\) => \{\n      if \(pendingSaveDataRef\.current\) \{\n        handleSave\(pendingSaveDataRef\.current\);\n        pendingSaveDataRef\.current = null;\n      \}\n    \}, 1000\);\n  \};/,
  `  useEffect(() => {
    if (!pendingSaveDataRef.current) {
      return;
    }

    const timeoutId = setTimeout(() => {
      if (pendingSaveDataRef.current) {
        handleSave(pendingSaveDataRef.current);
        pendingSaveDataRef.current = null;
      }
    }, 1000);

    return () => clearTimeout(timeoutId);
  }, [idsData, handleSave]);

  const handleChange = (id: string, field: string, value: string) => {
    setIdsData((prev) => {
      const updatedData = {
        ...prev,
        [id]: { ...prev[id], [field]: value },
      };
      pendingSaveDataRef.current = updatedData;
      return updatedData;
    });
  };`
);

fs.writeFileSync('app/owner/page.tsx', content);
