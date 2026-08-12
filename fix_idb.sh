#!/bin/bash
sed -i "s/const request = indexedDB.open('HurryChatDB', 1)/if (typeof indexedDB === 'undefined') { resolve(null as any); return; }; const request = indexedDB.open('HurryChatDB', 1)/g" components/MessagePage.tsx
