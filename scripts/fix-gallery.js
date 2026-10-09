// fix-gallery.js —— 剔除被跳过的重原生 demo（终端/音频/视频）在 Gallery 里的引用；
// 并修正 sys-kv 的 kv 命名空间导入。按 ASCII key 精确删行，避免依赖中文正文匹配。
const fs = require('fs');
const path = require('path');

const gPath = path.resolve(__dirname, '..', 'src', 'Gallery.tsx');
const kvPath = path.resolve(__dirname, '..', 'src', 'demos', 'sys-kv.tsx');

let g = fs.readFileSync(gPath, 'utf8');
const before = g.split('\n').length;

const dropPatterns = [
  // demo 组件 import
  /^\s*import \{ (?:DevTerminalDemo|IoAudioDemo|IoVideoDemo) \} from '\.\/demos\/(?:dev-terminal|io-audio|io-video)';\s*$/,
  // NAV 叶子项
  /^\s*\{ key: '(?:io-audio|io-video|dev-terminal)',.*\},\s*$/,
  // 注册表条目（整行对象，末尾 },）
  /^\s*'(?:dev-terminal|io-audio|io-video)': \{.*\},\s*$/,
];

g = g
  .split('\n')
  .filter((line) => !dropPatterns.some((re) => re.test(line)))
  .join('\n');

// dev 段兜底 key 由被删的 'dev-terminal' 改为保留的 'code-block'
g = g.replace(/'dashboard' : 'dev-terminal';/, "'dashboard' : 'code-block';");

fs.writeFileSync(gPath, g);
const after = g.split('\n').length;
console.log(`Gallery.tsx lines ${before} -> ${after}`);

// sys-kv：命名空间导入改写为具名 kv（barrel 现导出 `export * as kv`）
let k = fs.readFileSync(kvPath, 'utf8');
const kBefore = k;
k = k.replace(
  /import \* as kv from 'react-native-flux-desktop';/,
  "import { kv } from 'react-native-flux-desktop';",
);
fs.writeFileSync(kvPath, k);
console.log('sys-kv kv import', kBefore === k ? 'UNCHANGED(!)' : 'fixed');
