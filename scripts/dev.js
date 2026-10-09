// 开发热更新启动器：tsc -w 增量编译 src→dist；node 常驻跑 scripts/dev-runner.js（进程内热替换）。
// 热更新逻辑全部在 dev-runner（不在 src/、不随包发布）：改 src → tsc -w → dist → dev-runner 重挂内容子树，窗口不关。
// 说明：
//   - 只热重载 gallery 自身代码（src/**）。改库 react-native-flux-desktop 源码不在此列，需另行 build:lib+pack+同步副本。
//   - 库需暴露通用重渲染原语 hotReload（向已有根重提交元素树）；app 源码无需配合。
//   - 不设 FLUX_PACKAGED → React 走 development 构建（保留 warning）。
// 用法：npm run dev
const { spawn } = require('child_process');
const path = require('path');

const root = path.resolve(__dirname, '..');
const isWin = process.platform === 'win32';
const npx = isWin ? 'npx.cmd' : 'npx';

const children = [];
function run(name, cmd, args, env) {
  const child = spawn(cmd, args, {
    cwd: root,
    stdio: 'inherit',
    shell: isWin,
    env: { ...process.env, ...env },
  });
  child.on('exit', (code, sig) => console.log(`[dev] ${name} 退出 (code=${code} sig=${sig})`));
  children.push({ name, child });
  return child;
}

console.log('[dev] 启动 tsc --watch（增量编译 src → dist）…');
run('tsc', npx, ['tsc', '-w', '-p', 'tsconfig.json']);

// dist/App.js 通常已存在（历史构建）；稍延拉起运行时，避开首编译尚未产物的竞态。
console.log('[dev] 2s 后启动 node scripts/dev-runner.js（进程内热更新，改 dist 不重启、窗口不关）…');
const bootTimer = setTimeout(() => {
  run('node', 'node', ['scripts/dev-runner.js'], {
    FLUX_APP_DIR: 'ReactNativeFluxDesktopGallery',
  });
}, 2000);

let shuttingDown = false;
function shutdown(sig) {
  if (shuttingDown) return;
  shuttingDown = true;
  clearTimeout(bootTimer);
  console.log(`\n[dev] 收到 ${sig}，结束所有子进程…`);
  for (const { name, child } of children) {
    try {
      child.kill(isWin ? undefined : 'SIGTERM');
    } catch (e) {
      console.log(`[dev] 结束 ${name} 失败: ${e && e.message}`);
    }
  }
  // 给子进程一点时间收尾后强退
  setTimeout(() => process.exit(0), 500);
}
process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
