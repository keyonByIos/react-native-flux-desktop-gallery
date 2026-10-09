#!/usr/bin/env node
'use strict';
// 视觉回归 CI —— 把 grabAll 抓帧升级为「基线对比 + 差异高亮」自动回归。
//
// 原理：对每个 demo（section+active key）无头启动 gallery（dist/App.js），
//      经 FLUX_GRAB_DIR/FLUX_GRAB_DELAY 触发 grabAll 写 PNG 后 process.exit(0)，
//      再用 @napi-rs/canvas 解码本次帧与基线帧逐像素比对，超阈值判失败并输出差异高亮图。
//
// 用法：
//   node tools/vreg.js update [--only=k1,k2] [--all]   抓取并把本次帧写为基线
//   node tools/vreg.js          [--only=k1,k2] [--all]  抓取并与基线比对（有回归 exit 1）
//   选项：--algo=dark|light（默认 dark）  --win=860（窗口逻辑高，宽固定 1280）
//         --delay=800（抓帧延时 ms）  --threshold=0.05（允许差异像素占比 %）  --tol=0（单通道容差）
//
// 产物（均在 .vreg/ 下）：
//   shots/<key>.png     本次抓取
//   baselines/<key>.png 基线（纳入版本控制）
//   diffs/<key>.png     失败时的差异高亮（红=变化像素，底=基线）
//
// 注意：SMOKE 冒烟集只收录「确定性」demo（无实时时钟/网络图/ticker/瞬态浮层）。
//      含动画或外部数据的页面（dashboard 时钟、crypto-live、avatar 远程图、statistic count-up 等）
//      跨帧不稳定，勿加入基线，需要时用 --only 单独纳入并确保数据冻结。
const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const { loadImage, createCanvas } = require('@napi-rs/canvas');

const ROOT = path.resolve(__dirname, '..'); // gallery/
const NAV = require(path.join(ROOT, 'dist/data/nav.js'));
const VREG = path.join(ROOT, '.vreg');
const SHOTS = path.join(VREG, 'shots');
const BASE = path.join(VREG, 'baselines');
const DIFFS = path.join(VREG, 'diffs');

// key → section 映射：遍历六段菜单树叶子（section 决定 App 侧栏，content 由 active 决定）
const SECTION_OF = {};
function walk(items, section) {
  for (const it of items || []) {
    if (!it || it.type === 'divider') continue;
    if (Array.isArray(it.children) && it.children.length) walk(it.children, section);
    else if (it.key) SECTION_OF[it.key] = section;
  }
}
walk(NAV.NAV_SYSTEM, 'sys');
walk(NAV.NAV_UI, 'ui');
walk(NAV.NAV_WEB3, 'web3');
walk(NAV.NAV_DEV, 'dev');
walk(NAV.NAV_CHART, 'chart');
walk(NAV.NAV_CASE, 'case');

// 冒烟集：确定性代表页，覆盖六段（详见文件头「注意」）
const SMOKE = [
  'sys-welcome',
  'button', 'tag', 'badge', 'segmented', 'alert', 'steps', 'descriptions',
  'virtual-list', 'list', 'cell', 'empty', 'result', 'calendar', 'tree', 'timeline',
  'checkbox', 'radio', 'switch', 'divider', 'breadcrumb', 'pagination', 'typography', 'table',
  'code-block', 'json-viewer', 'diff-viewer', 'regex-tester', 'cron-parser', 'time-converter',
  'line', 'area', 'column', 'bar', 'pie', 'radar',
  'coin-icon', 'token-price', 'price-range', 'web3-avatar',
];

function parseArgs(argv) {
  const a = { mode: 'check', only: null, all: false, algo: 'dark', win: 860, delay: 800, tol: 0, threshold: 0.05 };
  for (const s of argv) {
    if (s === 'update') a.mode = 'update';
    else if (s === '--all') a.all = true;
    else if (s.startsWith('--only=')) a.only = s.slice(7).split(',').map((x) => x.trim()).filter(Boolean);
    else if (s.startsWith('--algo=')) a.algo = s.slice(7);
    else if (s.startsWith('--win=')) a.win = Number(s.slice(6));
    else if (s.startsWith('--delay=')) a.delay = Number(s.slice(8));
    else if (s.startsWith('--threshold=')) a.threshold = Number(s.slice(12));
    else if (s.startsWith('--tol=')) a.tol = Number(s.slice(6));
  }
  return a;
}

// 无头启动一次，抓一帧到 shots/<key>.png
function capture(key, cfg) {
  const section = SECTION_OF[key] || 'ui';
  const outDir = path.join(SHOTS, key);
  fs.rmSync(outDir, { recursive: true, force: true });
  const env = Object.assign({}, process.env, {
    FLUX_PACKAGED: '1',
    FLUX_APP_DIR: 'ReactNativeFluxDesktopGallery',
    FLUX_SECTION: section,
    FLUX_ACTIVE: key,
    FLUX_ALGO: cfg.algo,
    FLUX_WIN_H: String(cfg.win),
    FLUX_IDLE_SKIP: '0',
    FLUX_GRAB_DIR: outDir,
    FLUX_GRAB_DELAY: String(cfg.delay),
  });
  const r = spawnSync(process.execPath, ['dist/App.js'], { cwd: ROOT, env, timeout: 25000, stdio: 'ignore' });
  const png = path.join(outDir, 'window-0.png');
  if (!fs.existsSync(png)) return { ok: false, err: 'no-shot exit=' + r.status + ' signal=' + r.signal };
  const dst = path.join(SHOTS, key + '.png');
  fs.copyFileSync(png, dst);
  return { ok: true, file: dst };
}

async function toRGBA(p) {
  const img = await loadImage(p);
  const c = createCanvas(img.width, img.height);
  const ctx = c.getContext('2d');
  ctx.drawImage(img, 0, 0);
  const d = ctx.getImageData(0, 0, c.width, c.height);
  return { w: c.width, h: c.height, data: d.data };
}

// 逐像素比对；变化像素在差异图里涂红，其余铺基线。返回 changed/total/pct/dims。
async function diff(curPath, basePath, diffOut, tol) {
  const a = await toRGBA(curPath);
  const b = await toRGBA(basePath);
  if (a.w !== b.w || a.h !== b.h) return { dims: true, changed: a.w * a.h, total: a.w * a.h, pct: 100 };
  const n = a.w * a.h;
  let changed = 0;
  const out = createCanvas(a.w, a.h);
  const octx = out.getContext('2d');
  const img = octx.createImageData(a.w, a.h);
  const od = img.data;
  for (let i = 0; i < n; i++) {
    const o = i * 4;
    const isDiff =
      Math.abs(a.data[o] - b.data[o]) > tol ||
      Math.abs(a.data[o + 1] - b.data[o + 1]) > tol ||
      Math.abs(a.data[o + 2] - b.data[o + 2]) > tol;
    if (isDiff) {
      changed++;
      od[o] = 255; od[o + 1] = 0; od[o + 2] = 0; od[o + 3] = 255;
    } else {
      od[o] = b.data[o]; od[o + 1] = b.data[o + 1]; od[o + 2] = b.data[o + 2]; od[o + 3] = 255;
    }
  }
  octx.putImageData(img, 0, 0);
  if (changed > 0 && diffOut) {
    fs.mkdirSync(path.dirname(diffOut), { recursive: true });
    fs.writeFileSync(diffOut, out.toBuffer('image/png'));
  }
  return { dims: false, changed, total: n, pct: (changed / n) * 100 };
}

async function main() {
  const cfg = parseArgs(process.argv.slice(2));
  fs.mkdirSync(SHOTS, { recursive: true });
  fs.mkdirSync(BASE, { recursive: true });
  const keys = cfg.only ? cfg.only : cfg.all ? Object.keys(SECTION_OF) : SMOKE;
  const bad = [];
  const missing = [];
  console.log('[vreg] mode=' + cfg.mode + ' algo=' + cfg.algo + ' win=' + cfg.win + ' targets=' + keys.length);
  for (const key of keys) {
    if (!SECTION_OF[key]) { console.log('  ? ' + key + ' - 不在 nav 树，跳过'); missing.push(key); continue; }
    const cap = capture(key, cfg);
    if (!cap.ok) { console.log('  x ' + key + ' - 抓取失败 ' + cap.err); bad.push({ key, reason: 'capture' }); continue; }
    if (cfg.mode === 'update') {
      fs.copyFileSync(cap.file, path.join(BASE, key + '.png'));
      console.log('  + ' + key + ' - 基线已更新');
      continue;
    }
    const baseP = path.join(BASE, key + '.png');
    if (!fs.existsSync(baseP)) { console.log('  ! ' + key + ' - 无基线（先跑 update）'); missing.push(key); continue; }
    const d = await diff(cap.file, baseP, path.join(DIFFS, key + '.png'), cfg.tol);
    if (d.dims) { console.log('  x ' + key + ' - 尺寸变化'); bad.push({ key, pct: 100, dims: true }); }
    else if (d.pct > cfg.threshold) { console.log('  x ' + key + ' - 差异 ' + d.pct.toFixed(3) + '% (' + d.changed + '/' + d.total + ')'); bad.push({ key, pct: d.pct }); }
    else console.log('  . ' + key + ' - ' + d.pct.toFixed(3) + '%');
  }
  console.log('');
  if (cfg.mode === 'update') { console.log('[vreg] 基线目录 ' + BASE); return 0; }
  if (missing.length) console.log('[vreg] 缺基线/未知 key ' + missing.length + ': ' + missing.join(', '));
  if (bad.length) {
    console.log('[vreg] 回归失败 ' + bad.length + ' 项: ' + bad.map((b) => b.key + '(' + (b.pct != null ? b.pct.toFixed(2) + '%' : b.reason) + ')').join(', '));
    return 1;
  }
  console.log('[vreg] 全部通过');
  return 0;
}

main().then((c) => process.exit(c)).catch((e) => { console.error(e); process.exit(2); });
