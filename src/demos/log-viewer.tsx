// 开发 / 日志查看器：级别阈值过滤 + 关键词搜索 + 自动滚到底 + 级别计数概览，程序员工具类组件。
// 演示给一组混合级别的服务日志，交互过滤/搜索/跟随均在组件内部完成。
import React from 'react';
import { View, type LogEntry } from 'react-native-flux-desktop';
import { LogViewer } from 'react-native-flux-desktop-dev';
import { DemoPage, type DemoItem, type ApiRow } from '../DemoPage';

// 一段真实感服务启动 → 运行 → 异常 → 恢复的日志
const BOOT_LOGS: LogEntry[] = [
  { time: '10:12:01', level: 'info', source: 'boot', message: 'flux-server v2.4.1 starting…' },
  { time: '10:12:01', level: 'debug', source: 'config', message: 'loaded 38 keys from env + config.yaml' },
  { time: '10:12:02', level: 'info', source: 'db', message: 'postgres pool created (min=2 max=10)' },
  { time: '10:12:02', level: 'trace', source: 'db', message: 'SELECT 1 — health probe ok' },
  { time: '10:12:03', level: 'warn', source: 'cache', message: 'redis eviction rate 12%/min above soft limit' },
  { time: '10:12:04', level: 'info', source: 'http', message: 'listening on :8080' },
  { time: '10:12:07', level: 'info', source: 'http', message: 'GET /api/users 200 14ms' },
  { time: '10:12:09', level: 'error', source: 'db', message: 'deadlock detected on orders_idx, retrying (1/3)' },
  { time: '10:12:09', level: 'warn', source: 'http', message: 'POST /login 401 unauthorized — ip 10.0.3.7' },
  { time: '10:12:10', level: 'info', source: 'db', message: 'retry succeeded, txn committed' },
  { time: '10:12:15', level: 'fatal', source: 'core', message: 'panic: nil map write in scheduler, dumping stack' },
  { time: '10:12:15', level: 'info', source: 'boot', message: 'supervisor restarting worker pid=4471' },
];

/** demo 外层铺满 */
function Block(props: { node: React.ReactNode }): React.ReactElement {
  return <View style={{ width: '100%' }}>{props.node}</View>;
}

const DEMOS: DemoItem[] = [
  {
    name: '日志查看器',
    desc: '点级别 chips 设最低阈值（≥ 该级别才显示）；搜索框对 message/source 子串过滤；右上切换「跟随底部」；下方按级别汇总计数',
    node: <Block node={<LogViewer logs={BOOT_LOGS} height={320} />} />,
    code: [
      'import { LogViewer, type LogEntry } from "react-native-flux-desktop";',
      '',
      '// 级别阈值过滤 + 关键词搜索 + 自动跟随底部 + 级别计数',
      'const logs: LogEntry[] = [',
      '  { time: \'10:12:01\', level: \'info\', source: \'boot\', message: \'flux-server starting…\' },',
      '  { time: \'10:12:15\', level: \'fatal\', source: \'core\', message: \'panic: nil map write\' },',
      '];',
      '<LogViewer logs={logs} height={320} />',
    ].join('\n'),
  },
  {
    name: '只看告警以上',
    desc: 'defaultMinLevel="warn" 初始即过滤掉 trace/debug/info，聚焦 warn/error/fatal',
    node: <Block node={<LogViewer logs={BOOT_LOGS} defaultMinLevel="warn" height={220} />} />,
    code: [
      'import { LogViewer } from "react-native-flux-desktop";',
      '',
      '// defaultMinLevel 设初始阈值，trace/debug/info 被过滤',
      '<LogViewer logs={logs} defaultMinLevel="warn" height={220} />',
    ].join('\n'),
  },
  {
    name: '精简（无工具栏）',
    desc: 'toolbar={false} 隐藏交互条，作纯展示；showSource 关闭来源列',
    node: <Block node={<LogViewer logs={BOOT_LOGS} toolbar={false} showSource={false} height={240} />} />,
    code: [
      'import { LogViewer } from "react-native-flux-desktop";',
      '',
      '// toolbar=false 隐藏交互条；showSource=false 去掉来源列',
      '<LogViewer logs={logs} toolbar={false} showSource={false} height={240} />',
    ].join('\n'),
  },
];

const API: ApiRow[] = [
  { name: 'logs', desc: '日志条目（time/level/source/message）', type: 'LogEntry[]', default: '—' },
  { name: 'height', desc: '可视高度', type: 'number', default: '320' },
  { name: 'defaultMinLevel', desc: '初始最低显示级别', type: 'LogLevel', default: "'trace'" },
  { name: 'toolbar', desc: '是否显示级别/搜索/跟随工具栏', type: 'boolean', default: 'true' },
  { name: 'showTime / showSource', desc: '时间戳列 / 来源列', type: 'boolean', default: 'true' },
  { name: 'maxRows', desc: '最多渲染行数（护栏，超出截断提示）', type: 'number', default: '500' },
];

export function LogViewerDemo(): React.ReactElement {
  return <DemoPage demos={DEMOS} api={API} />;
}
