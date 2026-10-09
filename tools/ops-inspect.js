// 临时：Phase 2 靶点定位——统计「未被位图缓存」的 view/text 落笔节点在场景树里的分布，
// 按子树聚合，揪出 op 最密的区（live 图表/表格/迷你走势），供瘦身决策。
process.env.FLUX_PACKAGED = '1';
process.env.FLUX_APP_DIR = process.env.FLUX_APP_DIR || 'ops-inspect';
process.env.FLUX_IDLE_SKIP = '0';
process.env.FLUX_SCROLLBLIT = '0';

const lib = require('react-native-flux-desktop');
const React = require('react');
const { HeavyChartsDemo } = require('../dist/cases/heavy-charts.js');

// 返回 { view, text, other } 未缓存落笔计数；遇 cacheAsBitmap 子树则整块记为 1 次 cached 并停止下探。
function census(n, acc) {
  if (n.style && n.style.cacheAsBitmap === true) { acc.cached++; return; }
  if (n.kind === 'view') acc.view++;
  else if (n.kind === 'text') acc.text++;
  else acc.other++;
  for (const c of n.children || []) census(c, acc);
}
// 找子树里第一个文本内容做人类可读标签
function label(n) {
  if (n.kind === 'text' && typeof n.props?.text === 'string' && n.props.text.trim()) return n.props.text.trim().slice(0, 12);
  const t = n.text;
  if (typeof t === 'string' && t.trim()) return t.trim().slice(0, 12);
  for (const c of n.children || []) { const s = label(c); if (s) return s; }
  return '';
}
function size(n) { return (n.children || []).reduce((a, c) => { const acc = { view: 0, text: 0, other: 0, cached: 0 }; census(c, acc); return a + acc.view + acc.text + acc.other; }, 0); }

(async () => {
  await lib.render(React.createElement(HeavyChartsDemo), { width: 1400, height: 900, title: 'ops-inspect' });
  await new Promise((r) => setTimeout(r, 600));
  const recs = lib.Application.windows();
  const host = recs && recs[0] && recs[0].host;
  for (let i = 0; i < 40; i++) host.renderFrame();
  const rows = [];
  (function walk(n, depth) {
    if (n.style && n.style.cacheAsBitmap === true) return; // 缓存子树整体不再下探
    const acc = { view: 0, text: 0, other: 0, cached: 0 };
    census(n, acc);
    if (acc.view + acc.text + acc.other >= 12) rows.push({ depth, id: n.id, kind: n.kind, lbl: label(n), view: acc.view, text: acc.text, other: acc.other, cached: acc.cached });
    for (const c of n.children || []) walk(c, depth + 1);
  })(host.root, 0);
  // 只保留「自身即热区根」的浅层行：按 view+text 降序，打印前 25
  rows.sort((a, b) => (b.view + b.text + b.other) - (a.view + a.text + a.other));
  console.log('[census] top uncached-op subtrees (view/text/other/cached-under):');
  for (const r of rows.slice(0, 25)) {
    console.log(`  d=${r.depth} #${r.id} ${r.kind} "${r.lbl}" view=${r.view} text=${r.text} other=${r.other} cached=${r.cached}`);
  }
  process.exit(0);
})().catch((e) => { console.log('[census] ERR ' + (e && e.stack ? e.stack : e.message)); process.exit(1); });
