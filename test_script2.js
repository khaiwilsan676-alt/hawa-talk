const fs = require('fs');

const hawaSupport = fs.readFileSync('components/HawaSupport.tsx', 'utf8');

if (hawaSupport.includes('h-[100dvh]') && !hawaSupport.includes('h-screen')) {
  console.log('✅ HawaSupport wrapper successfully changed to use 100dvh.');
} else {
  console.log('❌ HawaSupport still uses h-screen or does not use h-[100dvh].');
}
