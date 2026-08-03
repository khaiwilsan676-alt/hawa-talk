const fs = require('fs');
const path = 'components/HomePage.tsx';
let content = fs.readFileSync(path, 'utf8');

// The PublicProfile component is actually imported and rendered inside MePage right now. We need to import it in HomePage.
const importRegex = /import MePage from '\.\/MePage'/;
const importReplacement = `import MePage from './MePage'
import PublicProfile from './PublicProfile'`;
content = content.replace(importRegex, importReplacement);

// Render PublicProfile if isPublicProfileActive and selectedProfileUser is set
const renderRegex = /{currentPage === 'room' && selectedUser && \(\n          <RoomPage\n            user=\{selectedUser\}\n            onClose=\{handleBackFromRoom\}\n            onKeepRoom=\{handleKeepRoom\}\n          \/>\n        \)}/;
const renderReplacement = `{currentPage === 'room' && selectedUser && (
          <RoomPage
            user={selectedUser}
            onClose={handleBackFromRoom}
            onKeepRoom={handleKeepRoom}
          />
        )}

        {isPublicProfileActive && selectedProfileUser && (
          <div className="fixed inset-0 z-[100] bg-white overflow-y-auto">
            <PublicProfile
              profileData={{
                uid: selectedProfileUser.id,
                name: selectedProfileUser.name,
                photo: selectedProfileUser.image,
                country: selectedProfileUser.country,
                displayAccountNumber: selectedProfileUser.id
              }}
              onBack={() => {
                setIsPublicProfileActive(false)
                setSelectedProfileUser(null)
              }}
            />
          </div>
        )}`;
content = content.replace(renderRegex, renderReplacement);

// We need to stop the MePage effect from resetting isPublicProfileActive when navigating, or just change the logic.
// In HomePage:
// useEffect(() => {
//   if (currentPage !== 'me') {
//     setIsPublicProfileActive(false)
//   }
// }, [currentPage])
// This is currently hiding it if currentPage !== 'me'.
// But when clicking a user, currentPage is 'home'.
// We should update that useEffect so it ONLY resets if we are NOT viewing a searched user.
const effectRegex = /\/\/ Reset public profile active state when page changes\n  useEffect\(\(\) => {\n    if \(currentPage !== 'me'\) {\n      setIsPublicProfileActive\(false\)\n    }\n  }, \[currentPage\]\)/;
const effectReplacement = `// Reset public profile active state when page changes
  useEffect(() => {
    if (currentPage !== 'me' && !selectedProfileUser) {
      setIsPublicProfileActive(false)
    }
  }, [currentPage, selectedProfileUser])`;
content = content.replace(effectRegex, effectReplacement);

fs.writeFileSync(path, content, 'utf8');
console.log('HomePage render logic updated');
