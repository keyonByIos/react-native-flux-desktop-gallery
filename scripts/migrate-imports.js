// migrate-imports.js —— 把 gallery/src 里对本地库的相对引用统一改写为包名引用。
// from '../../src' | '../src' | '../../src/utils/color' ...  →  from 'react-native-flux-desktop'
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..', 'src');
let n = 0;
function walk(d) {
  for (const f of fs.readdirSync(d)) {
    const fp = path.join(d, f);
    if (fs.statSync(fp).isDirectory()) walk(fp);
    else if (/\.tsx?$/.test(f)) {
      const t = fs.readFileSync(fp, 'utf8');
      const o = t;
      const next = t.replace(
        /from\s+'(?:\.\.\/)+src(?:\/[A-Za-z0-9_./-]+)?'/g,
        "from 'react-native-flux-desktop'",
      );
      if (next !== o) {
        fs.writeFileSync(fp, next);
        n++;
        console.log('rewrote', path.relative(root, fp));
      }
    }
  }
}
walk(root);
console.log('total rewritten files =', n);
