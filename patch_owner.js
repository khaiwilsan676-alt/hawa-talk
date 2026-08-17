const fs = require('fs');
let code = fs.readFileSync('app/owner/page.tsx', 'utf8');

code = code.replace(/const skipNextSave = useRef\(true\);\n/g, '');
code = code.replace(/skipNextSave\.current = true;\n/g, '');
code = code.replace(/skipNextSave\.current = false;\n/g, '');
code = code.replace(/if \(skipNextSave\.current\) {\n\s+skipNextSave\.current = false;\n\s+return;\n\s+}\n/g, '');

fs.writeFileSync('app/owner/page.tsx', code);
