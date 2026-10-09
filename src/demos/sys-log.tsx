// 系统 / 日志 Logger：解释自研双层日志（系统日志 / 用户日志）的落盘设计 —— 目录、日期+分片命名、
// 单文件 1MB 轮转、系统日志由核心自动写不可干预、用户日志默认允许直接写（无需注册），并提供真跑交互。
import React from 'react';
import { View, Text, Button, Input, Tag, Segmented, useToken, Application, logOverview, readLogEntries, loggerConfig, type LogFileInfo } from 'react-native-flux-desktop';
import { LogViewer } from 'react-native-flux-desktop-dev';
import { DemoPage, type DemoItem } from '../DemoPage';

/** 一段说明文字（自动换行） */
function Prose(props: { lines: string[] }): React.ReactElement {
  const { token } = useToken();
  return (
    <View style={{ marginTop: token.margin }}>
      {props.lines.map((l, i) => (
        <Text key={i} style={{ fontSize: token.fontSize, color: token.colorTextSecondary, lineHeight: token.lineHeight * token.fontSize * 1.4, marginBottom: token.marginXXS }}>
          {l}
        </Text>
      ))}
    </View>
  );
}

const msg = (e: unknown): string => (e && (e as Error).message ? (e as Error).message : String(e));
const fmtSize = (n: number): string => (n < 1024 ? `${n} B` : n < 1024 * 1024 ? `${(n / 1024).toFixed(1)} KB` : `${(n / 1024 / 1024).toFixed(2)} MB`);

/** 文件列表行：名称 + 大小 */
function FileList(props: { files: LogFileInfo[] }): React.ReactElement {
  const { token } = useToken();
  if (props.files.length === 0) return <Text style={{ fontSize: token.fontSizeSM, color: token.colorTextTertiary }}>（暂无日志文件）</Text>;
  return (
    <View style={{ gap: 2 }}>
      {props.files.map((f) => (
        <View key={f.name} style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <Text style={{ fontSize: token.fontSizeSM, color: token.colorText }}>{f.name}</Text>
          <Text style={{ fontSize: token.fontSizeSM, color: token.colorTextTertiary }}>{fmtSize(f.size)}</Text>
        </View>
      ))}
    </View>
  );
}

/** 日志实况：目录 + 级别 + system/user 分片文件（读磁盘真实产物） */
function LoggerStatus(): React.ReactElement {
  const { token } = useToken();
  const [tick, force] = React.useState(0);
  void tick;
  const cfg = loggerConfig();
  const ov = logOverview();
  const line = (label: string, value: string): React.ReactElement => (
    <View style={{ flexDirection: 'row', marginTop: token.marginXXS }}>
      <Text style={{ fontSize: token.fontSizeSM, color: token.colorTextTertiary, width: 88 }}>{label}</Text>
      <Text style={{ fontSize: token.fontSizeSM, color: token.colorText, flex: 1 }}>{value}</Text>
    </View>
  );
  return (
    <View>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: token.marginXS }}>
        <Tag color="processing">{`级别：${cfg.level}`}</Tag>
        <Button size="small" onClick={() => force((n) => n + 1)}>刷新</Button>
      </View>
      <View style={{ marginTop: token.marginSM }}>
        {line('日志根目录', cfg.dir)}
      </View>
      <View style={{ marginTop: token.margin, gap: token.marginXS }}>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: token.fontSizeSM, color: token.colorTextSecondary, marginBottom: token.marginXXS }}>系统日志 system/</Text>
          <FileList files={ov.system} />
        </View>
        <View style={{ width: 1, alignSelf: 'stretch', backgroundColor: token.colorBorderSecondary }} />
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: token.fontSizeSM, color: token.colorTextSecondary, marginBottom: token.marginXXS }}>用户日志 user/</Text>
          <FileList files={ov.user} />
        </View>
      </View>
      <Prose
        lines={[
          '· 落盘：根目录/logs/{system,user}/<YYYY-MM-DD>-<序号>.log；单文件 ≤ 1MB 自动滚动到下一序号，跨天重置。',
          '· 打包后落在按应用隔离的应用数据目录（%APPDATA%\\<应用名>\\logs，由启动器透传的应用名决定），开发落在工程源码目录；app.json 的 logger.path 可覆盖，logger.level 调 console 捕获阈值。',
        ]}
      />
    </View>
  );
}

/** 用户日志交互：注册通道 → 写入（统一进 user 日志），真实落盘可回看 */
function UserLogDemo(): React.ReactElement {
  const { token } = useToken();
  const [channel, setChannel] = React.useState('app');
  const [text, setText] = React.useState('一条用户业务日志');
  const [log, setLog] = React.useState<string[]>([]);
  const push = (m: string): void => setLog((l) => [`${new Date().toLocaleTimeString()} · ${m}`, ...l].slice(0, 6));

  const doFakeBatch = (): void => {
    try {
      const ch = channel || 'app';
      Application.log.trace(ch, '追踪 trace：进入渲染管线，场景节点 128');
      Application.log.debug(ch, '调试 debug：Yoga 布局耗时 12ms');
      Application.log.info(ch, '信息 info：用户点击「提交」按钮');
      Application.log.warn(ch, '警告 warn：接口响应偏慢 1.2s');
      Application.log.error(ch, '错误 error：POST /api/save 返回 500');
      Application.log.fatal(ch, '致命 fatal：渲染上下文丢失，帧循环中止');
      push('已生成 6 级假日志 → 下方「用户日志 LogViewer」点刷新查看');
    } catch (e) {
      push(`生成 ✗ ${msg(e)}`);
    }
  };
  const doWrite = (): void => {
    try {
      Application.log.write(channel, text, { at: Date.now() });
      push(`write("${channel}") ✓ info 级已落用户日志`);
    } catch (e) {
      push(`write ✗ ${msg(e)}`);
    }
  };
  const doLevel = (lv: 'debug' | 'warn' | 'error'): void => {
    try {
      if (lv === 'debug') Application.log.debug(channel, `${text}（debug）`);
      else if (lv === 'warn') Application.log.warn(channel, `${text}（warn）`);
      else Application.log.error(channel, `${text}（error）`);
      push(`${lv}("${channel}") ✓ ${lv.toUpperCase()} 级已落用户日志`);
    } catch (e) {
      push(`${lv} ✗ ${msg(e)}`);
    }
  };

  return (
    <View>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: token.marginXS, alignItems: 'center' }}>
        <Input style={{ width: 160 }} value={channel} onChange={setChannel} placeholder="通道名 channel" />
        <Input style={{ width: 240 }} value={text} onChange={setText} placeholder="日志内容" />
      </View>
      <View style={{ flexDirection: 'row', gap: token.marginXS, marginTop: token.marginSM, flexWrap: 'wrap', alignItems: 'center' }}>
        <Button type="primary" onClick={doFakeBatch}>生成 6 级假日志</Button>
        <Button onClick={doWrite}>write（info）</Button>
        <Button onClick={() => doLevel('debug')}>debug</Button>
        <Button onClick={() => doLevel('warn')}>warn</Button>
        <Button danger onClick={() => doLevel('error')}>error</Button>
        <Tag color={Application.log.isInit(channel) ? 'success' : 'default'}>{Application.log.isInit(channel) ? '已注册' : '未注册'}</Tag>
      </View>
      <View style={{ marginTop: token.marginSM, gap: 2 }}>
        {log.map((l, i) => (
          <Text key={i} style={{ fontSize: token.fontSizeSM, color: i === 0 ? token.colorText : token.colorTextTertiary }}>{l}</Text>
        ))}
      </View>
    </View>
  );
}

/** 校验演示：未注册也能写（默认允许）；系统保留名 system 仍被拒（写前抛错，不落盘） */
function GuardDemo(): React.ReactElement {
  const { token } = useToken();
  const [log, setLog] = React.useState<{ ok: boolean; m: string }[]>([]);
  const push = (ok: boolean, m: string): void => setLog((l) => [{ ok, m }, ...l].slice(0, 5));
  const tryWriteNoInit = (): void => {
    try {
      Application.log.write('auto_channel', '未预先 init 也能写（默认允许）');
      push(true, '未注册直接写：✓ 已落用户日志（默认允许）');
    } catch (e) {
      push(false, `异常：${msg(e)}`);
    }
  };
  const tryReserved = (): void => {
    try {
      Application.log.write('system', '试图写入系统保留名');
      push(false, '占用保留名 system：竟然通过了？（不应发生）');
    } catch (e) {
      push(true, `拒绝：${msg(e)}`);
    }
  };
  return (
    <View>
      <View style={{ flexDirection: 'row', gap: token.marginXS, flexWrap: 'wrap' }}>
        <Button onClick={tryWriteNoInit}>未注册通道直接写（默认允许）</Button>
        <Button danger onClick={tryReserved}>占用系统保留名 system</Button>
      </View>
      <View style={{ marginTop: token.marginSM, gap: 2 }}>
        {log.length === 0 ? (
          <Text style={{ fontSize: token.fontSizeSM, color: token.colorTextTertiary }}>点上面按钮：默认允许写未注册通道；系统保留名 system 被拒。</Text>
        ) : (
          log.map((l, i) => (
            <Text key={i} style={{ fontSize: token.fontSizeSM, color: l.ok ? token.colorText : token.colorErrorText }}>{l.m}</Text>
          ))
        )}
      </View>
    </View>
  );
}

/** 分级查看：把最新分片解析成结构化记录喂进开发日志组件 LogViewer */
function LogViewerPanel(props: { scope: 'system' | 'user'; height: number }): React.ReactElement {
  const { token } = useToken();
  const [tick, force] = React.useState(0);
  void tick;
  const logs = readLogEntries(props.scope, 500);
  return (
    <View>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: token.marginXS, marginBottom: token.marginXS, flexWrap: 'wrap' }}>
        <Tag color={props.scope === 'system' ? 'blue' : 'green'}>{props.scope === 'system' ? '系统日志（生命周期 + console，分级）' : '用户日志（Application.log，分级）'}</Tag>
        <Button size="small" onClick={() => force((n) => n + 1)}>刷新</Button>
        <Text style={{ fontSize: token.fontSizeSM, color: token.colorTextTertiary }}>可点上方级别 chips 阈值过滤 / 搜索 / 自动跟随底部</Text>
      </View>
      <LogViewer logs={logs} height={props.height} defaultMinLevel="trace" />
    </View>
  );
}

/** Console 捕获演示：触发不同级别的 console 打印 → 被系统日志按级捕获 */
function ConsoleDemo(): React.ReactElement {
  const { token } = useToken();
  const fire = (m: 'debug' | 'info' | 'warn' | 'error'): void => {
    (console as any)[m](`模拟 ${m} 打印 @ ${new Date().toLocaleTimeString()}`);
  };
  return (
    <View>
      <Text style={{ fontSize: token.fontSizeSM, color: token.colorTextSecondary, marginBottom: token.marginXS }}>
        点按钮触发对应级别的 console 打印 → 系统日志按方法映射级别全量捕获 → 到下方「系统日志 LogViewer」点「刷新」即可看到着色。
      </Text>
      <View style={{ flexDirection: 'row', gap: token.marginXS, flexWrap: 'wrap' }}>
        <Button onClick={() => fire('debug')}>console.debug</Button>
        <Button onClick={() => fire('info')}>console.info</Button>
        <Button type="primary" onClick={() => fire('warn')}>console.warn</Button>
        <Button danger onClick={() => fire('error')}>console.error</Button>
      </View>
    </View>
  );
}

const DEMOS: DemoItem[] = [
  {
    name: '双层日志：系统日志 vs 用户日志',
    desc: '与 KV 同构的双层分离：系统日志由核心自动写、用户不可干预；用户日志需注册通道，统一归纳。',
    node: (
      <Prose
        lines={[
          '① 系统日志（system）：由组件生命周期、单实例锁、渲染启动等核心文件写入，并捕获 console；每行按级别记录（生命周期=INFO，console 按方法映射 DEBUG/INFO/WARN/ERROR），全量不丢弃。用户无写接口，干预不到。',
          '② 用户日志（user）：实际开发默认允许，直接 Application.log.write(channel,...)（info 级）或 Application.log.debug/warn/error(channel,...) 分级写入（首次自动登记通道），业务日志统一归纳到此；Application.log.init(channel) 可选。',
          '③ 落盘：dataDir()/logs 下分 system/ 与 user/，文件名「日期-序号」，单文件不超过 1MB 自动滚动下一序号。',
          '④ 配置：app.json.logger = { path, level }。path 缺省→默认目录；level 为 console 捕获最低阈值（trace/debug/info/warn/error/fatal/none，默认全记）。',
        ]}
      />
    ),
    code: [
      'import { Application, configureLogger } from "react-native-flux-desktop";',
      '',
      '// 系统日志：核心自动写 + 捕获 console，全量不丢弃，用户无写接口',
      '// 用户日志：默认允许直接写（首次自动登记通道）',
      "Application.log.write('order', '用户点击提交');      // info 级",
      "Application.log.warn('order', '接口响应偏慢');       // 分级",
      '// 落盘：dataDir()/logs 下分 system/ 与 user/，单文件≤ 1MB 自动滚动',
      "configureLogger({ level: 'debug' });              // console 捕获阈值",
    ].join('\n'),
  },
  {
    name: '实时：写用户日志（默认允许，无需注册）',
    desc: '下面真跑：“生成 6 级假日志”一键写入 trace/debug/info/warn/error/fatal 各一条，或单条 write/debug/warn/error；均可在下方「用户日志 LogViewer」里分级着色回看。',
    node: <UserLogDemo />,
    code: [
      '// 六级分级写入（无需 init，首次写自动登记通道）',
      "Application.log.trace(ch, '追踪 trace');",
      "Application.log.debug(ch, '调试 debug');",
      "Application.log.info(ch, '信息 info');",
      "Application.log.warn(ch, '警告 warn');",
      "Application.log.error(ch, '错误 error');",
      "Application.log.fatal(ch, '致命 fatal');",
      "Application.log.write(ch, '默认 info');",
    ].join('\n'),
  },
  {
    name: '默认允许写 & 保留名校验',
    desc: '用户日志默认允许直接写（无需注册）；系统保留名 system 仍被拒（写前抛错）。',
    node: <GuardDemo />,
    code: [
      '// 默认允许：直接写即可，无需 init 声明通道',
      "Application.log.write('my-channel', '业务日志');",
      "Application.log.init('my-channel'); // 可选：显式声明亦可",
      '// 保留名拦截：system 为系统层保留，写入前抛错',
      "Application.log.write('system', 'x'); // ✗ 被拒",
    ].join('\n'),
  },
  {
    name: '日志实况（目录 / 级别 / 分片文件）',
    desc: '读磁盘真实产物：根目录、当前级别，以及 system/user 各自的日期分片文件与大小（逼近 1MB 会自动滚动）。',
    node: <LoggerStatus />,
    code: [
      'import { readLogEntries, logsDir } from "react-native-flux-desktop";',
      '',
      'const dir = logsDir();           // dataDir()/logs',
      "const records = readLogEntries('system', 500); // 解析分片为结构化记录",
    ].join('\n'),
  },
  {
    name: 'Console 捕获演示（按级别进系统日志）',
    desc: '触发不同级别的 console 打印 → 系统日志按方法映射级别全量捕获；点完到下方「系统日志」刷新即可看到着色。',
    node: <ConsoleDemo />,
    code: [
      '// console 方法→日志级别映射（由 configureLogger 阈值控制）',
      "console.debug('x'); // → DEBUG",
      "console.info('x');  // → INFO",
      "console.warn('x');  // → WARN",
      "console.error('x'); // → ERROR",
    ].join('\n'),
  },
  {
    name: '日志分级查看 · 系统（LogViewer）',
    desc: '开发日志组件 LogViewer 喂结构化记录：级别 chips 阈值过滤 / 搜索 / 自动跟随底部，按级别着色。',
    node: <LogViewerPanel scope="system" height={300} />,
    code: [
      'import { readLogEntries, LogViewer } from "react-native-flux-desktop";',
      '',
      "const logs = readLogEntries('system', 500);",
      '<LogViewer logs={logs} height={300} defaultMinLevel="trace" />',
    ].join('\n'),
  },
  {
    name: '日志分级查看 · 用户（LogViewer）',
    desc: '用户日志同一 LogViewer 分级展示；上方 write/debug/warn/error 按钮写入的行会带对应级别着色。',
    node: <LogViewerPanel scope="user" height={300} />,
    code: [
      'import { readLogEntries, LogViewer } from "react-native-flux-desktop";',
      '',
      "const logs = readLogEntries('user', 500);",
      '<LogViewer logs={logs} height={300} defaultMinLevel="trace" />',
    ].join('\n'),
  },
];

export function SysLogDemo(): React.ReactElement {
  return <DemoPage demos={DEMOS} />;
}
