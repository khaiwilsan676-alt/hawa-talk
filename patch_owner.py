import re

with open('app/owner/page.tsx', 'r') as f:
    content = f.read()

# Replace skipNextSave with isLocalUpdate logic

content = content.replace('const skipNextSave = useRef(true);', 'const isLocalUpdate = useRef(false);')

# In onSnapshot
# Remove skipNextSave.current = true;
content = content.replace('skipNextSave.current = true;', '')

# In useEffect
effect_search = """  useEffect(() => {
    if (skipNextSave.current) {
      skipNextSave.current = false;
      return;
    }

    if (!isLoadedFromFirestore.current) {
      return;
    }

    const timeoutId = setTimeout(() => {
      handleSave();
    }, 1000);

    return () => clearTimeout(timeoutId);
  }, [idsData, handleSave]);"""

effect_replace = """  useEffect(() => {
    if (!isLocalUpdate.current) {
      return;
    }

    if (!isLoadedFromFirestore.current) {
      return;
    }

    const timeoutId = setTimeout(() => {
      handleSave();
      isLocalUpdate.current = false;
    }, 1000);

    return () => clearTimeout(timeoutId);
  }, [idsData, handleSave]);"""

content = content.replace(effect_search, effect_replace)

# In handleChange
content = content.replace('skipNextSave.current = false;', 'isLocalUpdate.current = true;')

with open('app/owner/page.tsx', 'w') as f:
    f.write(content)
