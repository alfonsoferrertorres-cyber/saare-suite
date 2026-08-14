const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'audit_db.json');

if (fs.existsSync(file)) {
  const data = JSON.parse(fs.readFileSync(file, 'utf8'));
  const clean = data.filter(item => item.promptSummary && item.promptSummary !== '""' && item.promptSummary.trim() !== '');
  fs.writeFileSync(file, JSON.stringify(clean, null, 2), 'utf8');
  console.log(`=== AUDIT DB LIMPIADA: Quedan ${clean.length} registros válidos ===`);
}
