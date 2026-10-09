// cases/terminal.tsx —— 「终端 / SSH 面板 Terminal」整合案例。
// 左=会话列表（本地 PowerShell / CMD、SSH 主机 ×2、只读部署日志回放），右=当前会话主体。
// 三种后端复用库自绘终端组件族（src/dev/terminal）：
//   · LiveTerminal：node-pty 起真实本地 shell，VT 网格屏 + SGR 配色，可直接打字（缺 node-pty 时组件内部优雅降级）。
//   · SshTerminal：ssh2 远程 shell，先出连接表单（host/port/user/password），连上后同网格屏。
//   · Terminal：纯静态着色日志（cmd/out/ok/err/warn/info/muted 七种语义色），无外部依赖，作默认视图（开窗不 spawn 进程）。
// 设计取舍：终端类 App 惯例恒为深色（对标 Tabby / Warp / VSCode 集成终端），故本案例 chrome 固定 GitHub Dark 配色，不随明暗主题切换。
import React from 'react';
import {
  View,
  Text,
  Pressable,
  Icon,
  Terminal,
  LiveTerminal,
  SshTerminal,
  type TermLine,
} from 'react-native-flux-desktop';

// —— GitHub Dark 固定色板（终端 App 专用，不走 token）——
const BG = '#0d1117';
const PANEL = '#010409';
const CARD = '#161b22';
const HOVER = '#21262d';
const LINE = '#30363d';
const TXT = '#e6edf3';
const TXT2 = '#8b949e';
const ACCENT = '#3fb950';

const SIDEBAR_W = 244;
const TERM_COLS = 132;
const TERM_ROWS = 26;

type Kind = 'local' | 'ssh' | 'log';
interface Session {
  id: string;
  label: string;
  sub: string;
  kind: Kind;
  icon: string;
  shell?: string;
  host?: string;
}

const SESSIONS: Session[] = [
  { id: 'pwsh', label: '本地 · PowerShell', sub: 'powershell.exe', kind: 'local', icon: 'code', shell: 'powershell.exe' },
  { id: 'cmd', label: '本地 · 命令提示符', sub: 'cmd.exe', kind: 'local', icon: 'code', shell: 'cmd.exe' },
  { id: 'ssh-prod', label: 'SSH · prod-web-01', sub: 'root@10.0.0.21:22', kind: 'ssh', icon: 'cloud', host: '10.0.0.21' },
  { id: 'ssh-db', label: 'SSH · db-01', sub: 'admin@10.0.0.35:22', kind: 'ssh', icon: 'cloud', host: '10.0.0.35' },
  { id: 'log', label: '部署日志 · deploy.log', sub: '只读回放', kind: 'log', icon: 'folder' },
];

// 静态部署日志：全 ASCII，避免等宽字体缺字形变豆腐；覆盖七种语义色
const DEPLOY_LOG: TermLine[] = [
  { text: 'git pull origin main', kind: 'cmd' },
  { text: 'From github.com:flux/gallery', kind: 'muted' },
  { text: ' * branch main -> FETCH_HEAD', kind: 'muted' },
  { text: 'Already up to date.', kind: 'out' },
  { text: 'npm run build', kind: 'cmd' },
  { text: '> tsc -p tsconfig.json && vite build', kind: 'muted' },
  { text: 'vite v5.2.0 building for production...', kind: 'info' },
  { text: '[OK] 1284 modules transformed.', kind: 'ok' },
  { text: 'dist/assets/index-3f9a2c.js   248.13 kB | gzip: 82.40 kB', kind: 'out' },
  { text: 'dist/assets/index-b71.css      31.02 kB | gzip:  6.18 kB', kind: 'out' },
  { text: '[OK] built in 4.82s', kind: 'ok' },
  { text: 'docker build -t flux/gallery:latest .', kind: 'cmd' },
  { text: '#6 [builder 3/5] RUN npm ci', kind: 'out' },
  { text: '#6 2.341 added 812 packages in 2s', kind: 'muted' },
  { text: '#12 exporting manifest sha256:9c1f done', kind: 'info' },
  { text: '[WARN] unused var `tmp` in shell.ts:88', kind: 'warn' },
  { text: 'kubectl rollout restart deploy/gallery', kind: 'cmd' },
  { text: 'deployment.apps/gallery restarted', kind: 'ok' },
  { text: '[ERR] failed to pull image "registry/flux:edge"', kind: 'err' },
  { text: '  -> fallback to :latest, retrying (1/3)', kind: 'muted' },
  { text: '[OK] rollout complete, 3/3 pods ready', kind: 'ok' },
];

function SessionRow(props: { s: Session; on: boolean; onPress: () => void }): React.ReactElement {
  const { s, on } = props;
  return (
    <Pressable
      onPress={props.onPress}
      style={{ flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 12, paddingVertical: 9, borderRadius: 6, backgroundColor: on ? CARD : 'transparent', cursor: 'pointer' }}
    >
      <View style={{ width: 3, height: 26, borderRadius: 2, backgroundColor: on ? ACCENT : 'transparent' }} />
      <View style={{ width: 26, height: 26, borderRadius: 6, alignItems: 'center', justifyContent: 'center', backgroundColor: on ? '#0d1117' : HOVER }}>
        <Icon name={s.icon} size={14} color={on ? ACCENT : TXT2} />
      </View>
      <View style={{ flex: 1, minWidth: 0 }}>
        <Text style={{ fontSize: 13, fontWeight: on ? '600' : '500', color: on ? TXT : TXT2 }} numberOfLines={1}>{s.label}</Text>
        <Text style={{ fontSize: 11, color: TXT2, marginTop: 1 }} numberOfLines={1}>{s.sub}</Text>
      </View>
    </Pressable>
  );
}

export function TerminalPanelDemo(): React.ReactElement {
  const [activeId, setActiveId] = React.useState<string>('log');
  const cur = SESSIONS.find((s) => s.id === activeId) ?? SESSIONS[SESSIONS.length - 1];

  return (
    <View style={{ flex: 1, flexDirection: 'row', backgroundColor: BG }}>
      {/* 左：会话列表 */}
      <View style={{ width: SIDEBAR_W, backgroundColor: PANEL, borderRightWidth: 1, borderRightColor: LINE, paddingTop: 14, paddingBottom: 10, paddingHorizontal: 10, gap: 2 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 6, paddingBottom: 10 }}>
          <Icon name="code" size={15} color={ACCENT} />
          <Text style={{ fontSize: 12, fontWeight: '700', color: TXT, letterSpacing: 0.6 }}>会话 SESSIONS</Text>
        </View>
        {SESSIONS.map((s) => (
          <SessionRow key={s.id} s={s} on={s.id === activeId} onPress={() => setActiveId(s.id)} />
        ))}
        <View style={{ flex: 1 }} />
        <Text style={{ fontSize: 11, color: TXT2, paddingHorizontal: 6, paddingTop: 8 }}>node-pty / ssh2 缺失时对应会话自动降级提示</Text>
      </View>

      {/* 右：当前会话主体 */}
      <View style={{ flex: 1, minWidth: 0 }}>
        {/* 顶部标签栏 */}
        <View style={{ height: 42, flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 14, borderBottomWidth: 1, borderBottomColor: LINE, backgroundColor: PANEL }}>
          <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: cur.kind === 'log' ? TXT2 : ACCENT }} />
          <Text style={{ fontSize: 13, fontWeight: '600', color: TXT }}>{cur.label}</Text>
          <Text style={{ fontSize: 11, color: TXT2 }}>{cur.sub}</Text>
          <View style={{ flex: 1 }} />
          <Text style={{ fontSize: 11, color: TXT2 }}>
            {cur.kind === 'local' ? '本地 shell · 可直接打字' : cur.kind === 'ssh' ? '远程 SSH · 填表连接' : '只读日志回放'}
          </Text>
        </View>

        {/* 终端主体：key 绑会话，切换即重挂载（同一时刻仅一个 pty） */}
        <View style={{ flex: 1, minHeight: 0, padding: 12 }}>
          {cur.kind === 'local' ? (
            <LiveTerminal key={cur.id} title={cur.label} shell={cur.shell} cols={TERM_COLS} rows={TERM_ROWS} autoFocus style={{ flex: 1 }} />
          ) : cur.kind === 'ssh' ? (
            <SshTerminal key={cur.id} title={cur.label} defaultHost={cur.host} cols={TERM_COLS} rows={TERM_ROWS} style={{ flex: 1 }} />
          ) : (
            <Terminal key={cur.id} title="deploy.log" lines={DEPLOY_LOG} showCursor={false} style={{ flex: 1 }} />
          )}
        </View>
      </View>
    </View>
  );
}
