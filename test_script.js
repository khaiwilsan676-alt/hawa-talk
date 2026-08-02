console.log("Checking if MePage and HawaSupport files were successfully modified...")
const fs = require('fs');

const hawaSupport = fs.readFileSync('components/HawaSupport.tsx', 'utf8');
const mePage = fs.readFileSync('components/MePage.tsx', 'utf8');

if (hawaSupport.includes('onBack || (() => window.history.back())')) {
  console.log('✅ HawaSupport has been successfully modified with onBack fallback.');
} else {
  console.log('❌ HawaSupport is missing the correct onBack fallback code.');
}

if (mePage.includes('<HawaSupport onBack={() => switchView(\'me\')} />')) {
  console.log('✅ MePage has been successfully updated to pass the onBack prop.');
} else {
  console.log('❌ MePage is missing the onBack prop for HawaSupport.');
}
