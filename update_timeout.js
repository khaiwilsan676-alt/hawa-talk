const fs = require('fs');
const path = 'components/HomePage.tsx';
let content = fs.readFileSync(path, 'utf8');

const regex = /const handlePerformSearch = async \(\) => {([\s\S]*?)} finally {/g;

const replacement = `const handlePerformSearch = async () => {
    if (!searchQuery.trim()) {
      setSearchResults([])
      setHasSearched(false)
      return
    }

    setIsSearching(true)
    const query_text = searchQuery.trim().toLowerCase()

    // Helper to prevent infinite hanging
    const withTimeout = (promise: Promise<any>, ms: number) => {
      return Promise.race([
        promise,
        new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), ms))
      ]);
    };

    try {
      const foundList: GlobalRoom[] = []
      const addedIds = new Set<string>()

      if (activeSearchTab === 'room') {
        // 1. Local globalRooms se filter (exact ID match only)
        const localMatches = globalRooms.filter(r => {
          const matches = r.accountId.toLowerCase() === query_text
          if (matches) addedIds.add(r.accountId)
          return matches
        })
        foundList.push(...localMatches)

        // 2. globalRooms collection - exact accountId match
        try {
          const roomsRef = collection(db, "globalRooms")
          const q2 = query(roomsRef, where("accountId", "==", query_text));
          const snap2 = await withTimeout(getDocs(q2), 5000) as any;

          const processDocs = (snap: any) => {
            snap.docs.forEach((doc: any) => {
              const rData = doc.data()
              const accId = rData.accountId || doc.id
              if (!addedIds.has(accId)) {
                addedIds.add(accId)
                foundList.push({
                  id: doc.id,
                  name: rData.name || 'Room',
                  country: rData.country || '🇮🇳',
                  image: rData.image || '/default-avatar.png',
                  accountId: accId,
                  createdAt: rData.createdAt || Date.now()
                })
              }
            })
          };
          processDocs(snap2);
        } catch (err) {
          console.warn("globalRooms search failed:", err)
        }
      } else if (activeSearchTab === 'user') {
        // 3. Users collection - exact accountId match
        try {
          const usersRef = collection(db, "users")
          const q2 = query(usersRef, where("accountId", "==", query_text));
          const snap2 = await withTimeout(getDocs(q2), 5000) as any;

          const processDocs = (snap: any) => {
            snap.docs.forEach((doc: any) => {
              const uData = doc.data()
              const accId = uData.accountId || doc.id
              if (!addedIds.has(accId)) {
                addedIds.add(accId)
                foundList.push({
                  id: doc.id,
                  name: uData.name || 'User',
                  country: uData.country || '🇮🇳',
                  image: uData.image || '/default-avatar.png',
                  accountId: accId,
                  createdAt: uData.createdAt || Date.now()
                })
              }
            })
          };
          processDocs(snap2);
        } catch (err) {
          console.warn("Users search failed:", err)
        }
      }

      // Sort: exact match pehle
      foundList.sort((a, b) => {
        const aExact = a.accountId.toLowerCase() === query_text
        const bExact = b.accountId.toLowerCase() === query_text
        if (aExact && !bExact) return -1
        if (!aExact && bExact) return 1
        return (b.createdAt || 0) - (a.createdAt || 0)
      })

      setSearchResults(foundList.slice(0, 20))
      setHasSearched(true)

    } catch (err) {
      console.error("Search error:", err)
      // Fallback to local search for both if network fails
      const localMatches = globalRooms.filter(r =>
        r.accountId.toLowerCase() === query_text
      )
      setSearchResults(localMatches.slice(0, 20))
      setHasSearched(true)
    } finally {`;

content = content.replace(regex, replacement);
fs.writeFileSync(path, content, 'utf8');
console.log('Added timeout and unified local fallback');
