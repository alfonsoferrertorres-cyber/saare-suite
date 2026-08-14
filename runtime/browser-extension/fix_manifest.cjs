const fs = require('fs');
const path = require('path');

const manifestContent = {
  "manifest_version": 3,
  "name": "S.A.A.R.E. AI Runtime Interceptor",
  "version": "2.5.0",
  "description": "Interceptor L7 in-memory y sellado de evidencia para chats de IA.",
  "permissions": ["activeTab", "scripting"],
  "host_permissions": [
    "http://localhost:3001/*",
    "https://gemini.google.com/*"
  ],
  "content_scripts": [
    {
      "matches": ["https://gemini.google.com/*"],
      "js": ["content.js"],
      "run_at": "document_end"
    }
  ]
};

fs.writeFileSync(path.join(__dirname, 'manifest.json'), JSON.stringify(manifestContent, null, 2), 'utf8');
console.log('=== MANIFEST DE LA EXTENSIÓN ACTUALIZADO CON HOST PERMISSIONS ===');
