const fs = require('node:fs');
const path = require('node:path');
const root = process.cwd();
const out = path.join(root, 'dist');
const bundleDir = path.join(out, 'ui-dist');
fs.mkdirSync(bundleDir, { recursive: true });
for (const file of ['index.html', 'app.html', 'favicon.svg']) {
  fs.copyFileSync(path.join(root, file), path.join(out, file));
}
for (const dir of ['css', 'images', 'js']) {
  fs.cpSync(path.join(root, dir), path.join(out, dir), { recursive: true });
}
for (const file of ['rise-ui.js', 'rise-ui.css']) {
  fs.copyFileSync(path.join(out, file), path.join(bundleDir, file));
  fs.unlinkSync(path.join(out, file));
}
