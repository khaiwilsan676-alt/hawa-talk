const fs = require('fs');
let code = fs.readFileSync('app/owner/page.tsx', 'utf-8');

console.log(code.includes("focusedField.current") ? "Yes" : "No");
console.log(code.includes("getDefaultIdsData") ? "Yes" : "No");
