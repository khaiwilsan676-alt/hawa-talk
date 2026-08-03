const fs = require('fs');
const path = 'components/HomePage.tsx';
let content = fs.readFileSync(path, 'utf8');

const regex = /const withTimeout = \(promise: Promise<any>, ms: number\) => {/g;

const replacement = `const withTimeout = (promise: Promise<any>, ms: number): Promise<any> => {`;

content = content.replace(regex, replacement);
fs.writeFileSync(path, content, 'utf8');
