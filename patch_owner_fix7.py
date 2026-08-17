import re

with open('app/owner/page.tsx', 'r') as f:
    content = f.read()

content = content.replace("import React, { useState, useEffect, useRef, useCallback } from \"react\";", "import * as React from \"react\";\nimport { useState, useEffect, useRef, useCallback } from \"react\";")

with open('app/owner/page.tsx', 'w') as f:
    f.write(content)
