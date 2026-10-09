// 系统 / 系统常量 SystemConstants：进程启动即确定的静态环境事实的统一取数门面演示。
// 与「系统取数 SystemStats」（动态运行时快照）互补：这里全是运行期基本不变的量——平台/架构/OS/用户/硬件容量/Node 版本/时区。
// 数据源为 systemConstants 单例（纯 os + process，模块加载时算一次并冻结），demo 只负责把它铺成可读卡片。
import React from 'react';
import {
  View,
  Text,
  Button,
  Tag,
  useToken,
  writeClipboard,
  systemConstants,
  systemConstantsJSON,
} from 'react-native-flux-desktop';
import { DemoPage, type DemoItem, type ApiRow } from '../DemoPage';

const c = systemConstants;

/** 布尔 → 彩色 Tag（真=success 显示值名，假=default 显示「否」） */
function Bool(props: { on: boolean; label?: string }): React.ReactElement {
  return <Tag color={props.on ? 'success' : 'default'}>{props.on ? props.label ?? '是' : '否'}</Tag>;
}

/** 一键复制全部常量为 JSON */
function CopyRow(): React.ReactElement {
  const { token } = useToken();
  const [copied, setCopied] = React.useState(false);
  const doCopy = (): void => {
    const ok = writeClipboard(systemConstantsJSON());
    setCopied(ok);
    setTimeout(() => setCopied(false), 1600);
  };
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: token.marginXS, flexWrap: 'wrap' }}>
      <Button size="small" type="primary" onClick={doCopy}>复制全部常量 JSON</Button>
      {copied && <Tag color="success">已复制到剪贴板</Tag>}
      <Text style={{ fontSize: token.fontSizeSM, color: token.colorTextTertiary }}>
        {systemConstantsJSON(0).length} 字符 · {Object.keys(c).length} 个顶层字段
      </Text>
    </View>
  );
}

/** 一行键值：字符串值走 Text，ReactNode（如布尔 Tag）单独渲染，避免把非文本元素塞进 <Text> */
function Row(props: { k: string; v: React.ReactNode }): React.ReactElement {
  const { token } = useToken();
  const isNode = React.isValidElement(props.v);
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: token.marginSM, paddingVertical: 3, borderBottomWidth: 1, borderStyle: 'solid', borderBottomColor: token.colorSplit }}>
      <Text style={{ fontSize: token.fontSizeSM, color: token.colorTextTertiary, flexShrink: 0 }} numberOfLines={1}>{props.k}</Text>
      {isNode ? (
        <View style={{ flex: 1, alignItems: 'flex-end' }}>{props.v}</View>
      ) : (
        <Text style={{ fontSize: token.fontSizeSM, color: token.colorText, textAlign: 'right', flex: 1, fontVariant: ['tabular-nums'] }} numberOfLines={2}>{props.v}</Text>
      )}
    </View>
  );
}

/** 一组常量卡片 */
function Group(props: { title: string; rows: { k: string; v: React.ReactNode }[] }): React.ReactElement {
  const { token } = useToken();
  return (
    <View style={{ width: '100%', marginBottom: token.marginSM, padding: token.paddingSM, borderRadius: token.borderRadiusLG, borderWidth: token.lineWidth, borderStyle: 'solid', borderColor: token.colorBorderSecondary, backgroundColor: token.colorBgContainer }}>
      <Text style={{ fontSize: token.fontSize, color: token.colorText, fontWeight: '600' as const, marginBottom: token.marginXS }}>{props.title}</Text>
      {props.rows.map((r) => <Row key={r.k} k={r.k} v={r.v} />)}
    </View>
  );
}

/** 总览：把全部常量按维度铺成卡片网格 */
function Overview(): React.ReactElement {
  const { token } = useToken();
  const groups: { title: string; rows: { k: string; v: React.ReactNode }[] }[] = [
    {
      title: '平台 / 架构',
      rows: [
        { k: 'platform', v: c.platform },
        { k: 'platformName', v: c.platformName },
        { k: 'arch', v: c.arch },
        { k: 'bits', v: `${c.bits} 位` },
        { k: 'isWindows', v: <Bool on={c.isWindows} /> },
        { k: 'isMacOS', v: <Bool on={c.isMacOS} /> },
        { k: 'isLinux', v: <Bool on={c.isLinux} /> },
        { k: 'isUnix', v: <Bool on={c.isUnix} /> },
      ],
    },
    {
      title: '操作系统 / 主机',
      rows: [
        { k: 'osType', v: c.osType },
        { k: 'osRelease', v: c.osRelease },
        { k: 'endianness', v: c.endianness },
        { k: 'hostname', v: c.hostname || '—' },
      ],
    },
    {
      title: '用户 / 会话',
      rows: [
        { k: 'username', v: c.username || '—' },
        { k: 'homedir', v: c.homedir || '—' },
        { k: 'tmpdir', v: c.tmpdir || '—' },
        { k: 'shell', v: c.shell || '—' },
        { k: 'uid / gid', v: `${c.uid} / ${c.gid}` },
      ],
    },
    {
      title: '硬件容量（开机即定）',
      rows: [
        { k: 'cpuCount', v: `${c.cpuCount} 逻辑核` },
        { k: 'cpu.model', v: c.cpu.model || '—' },
        { k: 'cpu.speedMHz', v: c.cpu.speedMHz ? `${c.cpu.speedMHz} MHz` : '—' },
        { k: 'totalMemGB', v: `${c.totalMemGB} GB` },
        { k: 'totalMemBytes', v: c.totalMemBytes.toLocaleString() },
      ],
    },
    {
      title: 'Node 运行时版本',
      rows: [
        { k: 'nodeVersion', v: c.nodeVersion },
        { k: 'major.minor.patch', v: `${c.nodeMajor}.${c.nodeMinor}.${c.nodePatch}` },
        { k: 'v8', v: c.v8Version || '—' },
        { k: 'uv', v: c.versions.uv || '—' },
        { k: 'napi', v: c.napiVersion || '—' },
        { k: 'openssl', v: c.opensslVersion || '—' },
        { k: 'modules(ABI)', v: c.modulesVersion || '—' },
        { k: 'zlib', v: c.versions.zlib || '—' },
        { k: 'ares', v: c.versions.ares || '—' },
      ],
    },
    {
      title: '进程 / 区域时区',
      rows: [
        { k: 'pid', v: String(c.pid) },
        { k: 'ppid', v: String(c.ppid) },
        { k: 'title', v: c.title || '—' },
        { k: 'execPath', v: c.execPath || '—' },
        { k: 'timezone', v: c.timezone || '—' },
        { k: 'timezoneOffsetMin', v: `UTC${c.timezoneOffsetMin <= 0 ? '+' : '-'}${Math.abs(c.timezoneOffsetMin / 60)}` },
        { k: 'locale', v: c.locale || '—' },
        { k: 'language', v: c.language || '—' },
      ],
    },
  ];
  return (
    <View>
      <CopyRow />
      <View style={{ height: token.marginSM }} />
      <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: token.marginSM }}>
        <View style={{ flex: 1 }}>
          {groups.slice(0, 3).map((g) => <Group key={g.title} title={g.title} rows={g.rows} />)}
        </View>
        <View style={{ flex: 1 }}>
          {groups.slice(3).map((g) => <Group key={g.title} title={g.title} rows={g.rows} />)}
        </View>
      </View>
      <Text style={{ marginTop: token.margin, fontSize: token.fontSizeSM, color: token.colorTextTertiary, lineHeight: token.lineHeight * token.fontSize * 1.4 }}>
        · 全部为即时只读快照：systemConstants 在模块加载时算一次并 Object.freeze，之后 import 即用、无副作用、无原生依赖（纯 os + process）。
        · Windows 下 uid/gid 常为 -1、shell 常为空，属平台差异而非取数失败。
      </Text>
    </View>
  );
}

const DEMOS: DemoItem[] = [
  {
    name: 'SystemConstants 是什么',
    desc: '进程启动即确定、运行期基本不变的环境事实：平台 / 架构 / 操作系统 / 用户 / 硬件容量 / Node 版本 / 时区。与动态快照 SystemStats 互补。',
    node: (
      <View style={{ gap: 6, maxWidth: 720 }}>
        {[
          '① 单例 systemConstants：import { systemConstants } from "react-native-flux-desktop" 即得一个冻结对象，无需挂载、无需定时器、无副作用。',
          '② 纯 os + process 实现：不碰原生 .node，跨 win32 / darwin / linux 通用；每个字段都用 safe() 兜底，个别平台不可用时回退缺省值而非抛出。',
          '③ 与 SystemStats 分工：SystemStats 是「会变的运行时读数」（内存/帧率/逐窗面），SystemConstants 是「不变的启动事实」（平台/版本/容量）。',
          '④ 另有 systemConstantsJSON(indent?) 直接吐整表 JSON 字符串，便于打印 / 复制到剪贴板 / 随日志上报。',
        ].map((l, i) => (
          <Text key={i} style={{ fontSize: 13, color: '#8c8c8c', lineHeight: 20 }}>{l}</Text>
        ))}
      </View>
    ),
    code: [
      'import { systemConstants, systemConstantsJSON } from "react-native-flux-desktop";',
      '',
      'const c = systemConstants;               // 冻结只读对象',
      "if (c.isWindows) { /* Windows 专属分支 */ }",
      "console.log(c.platformName, c.arch, c.nodeVersion, c.totalMemGB + 'GB');",
      '',
      '// 整表 JSON（打印 / 复制 / 上报）',
      'localStorage.setItem("env", systemConstantsJSON());',
    ].join('\n'),
  },
  {
    name: '全部常量总览',
    desc: '按维度铺开的实况取值（当前这台机器），顶部可一键复制整表 JSON。',
    node: <Overview />,
    code: [
      'import { systemConstants as c } from "react-native-flux-desktop";',
      '',
      '// 典型用法：按平台分支 + 采集运行环境',
      "const env = `${c.platformName} ${c.osRelease} · ${c.arch} · Node ${c.nodeVersion} · ${c.cpuCount} 核 / ${c.totalMemGB}GB`;",
    ].join('\n'),
  },
];

const API: ApiRow[] = [
  { name: 'systemConstants', desc: '冻结只读的系统常量单例（下表字段）', type: 'SystemConstants' },
  { name: 'platform / platformName', desc: 'Node 平台标识（win32/darwin/linux…）与人类可读名', type: 'string' },
  { name: 'arch / bits', desc: 'CPU 架构与位宽（32/64，未知 0）', type: 'string / number' },
  { name: 'isWindows / isMacOS / isLinux / isUnix', desc: '平台布尔（isUnix = 非 win32）', type: 'boolean' },
  { name: 'osType / osRelease / endianness', desc: 'os.type / os.release / os.endianness', type: 'string' },
  { name: 'hostname', desc: '主机名（计算机名）', type: 'string' },
  { name: 'username / homedir / tmpdir / shell', desc: '用户与会话路径（os.userInfo / homedir / tmpdir）', type: 'string' },
  { name: 'uid / gid', desc: 'POSIX 用户/组 id（Windows 常为 -1）', type: 'number' },
  { name: 'cpu', desc: 'CPU 概要 { model, speedMHz, cores }', type: 'CpuSummary' },
  { name: 'cpuCount', desc: '逻辑核心总数', type: 'number' },
  { name: 'totalMemBytes / totalMemGB', desc: '整机物理内存（字节 / GB，1GB=1024³）', type: 'number' },
  { name: 'nodeVersion / nodeMajor / nodeMinor / nodePatch', desc: 'process.version 解析后的版本', type: 'string / number' },
  { name: 'v8Version / uvVersion / napiVersion / opensslVersion / modulesVersion', desc: 'process.versions 关键组件版本', type: 'string' },
  { name: 'versions', desc: 'process.versions 全量映射（只读）', type: 'Record<string,string>' },
  { name: 'pid / ppid / execPath / title / argv', desc: '进程定位（打包后 execPath 指向 app.exe）', type: 'number / string / string[]' },
  { name: 'timezone / timezoneOffsetMin', desc: 'IANA 时区名与 UTC 偏移（分钟）', type: 'string / number' },
  { name: 'locale / language', desc: 'BCP-47 区域与首选语言', type: 'string' },
  { name: 'systemConstantsJSON(indent?)', desc: '整表序列化为缩进 JSON 字符串（默认 2）', type: '(indent?: number): string' },
];

export function SysConstantsDemo(): React.ReactElement {
  return <DemoPage demos={DEMOS} api={API} />;
}
