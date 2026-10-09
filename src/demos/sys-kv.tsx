// 系统 / 轻量级键值持久化：解释自研 bitcask 式 KV（单实体文件 + 尾部追加日志 + CRC 回放）
// 与「系统层库 / 用户层库」双层分离的设计，并提供真实可用的
// init 声明类型 → 读写 → 落盘 → 重开回灌 交互。值落二进制（首字节类型标记，非明文）。
import React from 'react';
import { View, Text, Button, Input, Tag, Segmented, useToken, Application, type ValueType, type UserSnapshot } from 'react-native-flux-desktop';
import { kv } from 'react-native-flux-desktop';
import { DemoPage, type DemoItem } from '../DemoPage';
import { StepFlow, type StepFlowItem } from './sys-steps';

/** 一段说明文字（自动换行，行高舒适） */
function Prose(props: { lines: string[] }): React.ReactElement {
  const { token } = useToken();
  return (
    <View style={{ marginTop: token.margin }}>
      {props.lines.map((l, i) => (
        <Text
          key={i}
          style={{ fontSize: token.fontSize, color: token.colorTextSecondary, lineHeight: token.lineHeight * token.fontSize * 1.4, marginBottom: token.marginXXS }}
        >
          {l}
        </Text>
      ))}
    </View>
  );
}

/** KV 写入路径的步骤流数据（关键阶段特殊着色） */
const KV_FLOW: StepFlowItem[] = [
  { title: 'kv.put(key, bytes)', desc: '上层门面调用写入（值已由 TS 编码进首字节类型标记）' },
  { title: '追加一帧到文件尾', desc: '只追加、不原地改写：key_len | val_len | op | crc32 | key | value', important: true },
  { title: '更新内存 index[key]', desc: '同步刷新 HashMap 索引' },
  { title: '（读）直接命中内存', desc: 'get 走内存索引，不落盘 IO' },
  { title: 'compact 压缩', desc: '活键重写临时文件 + rename 原子替换', important: true },
];

/** 订阅用户存储快照（任一 set 全窗刷新） */
function useUserSnap(): UserSnapshot {
  const [snap, setSnap] = React.useState<UserSnapshot>(() => Application.user.snapshot());
  React.useEffect(() => Application.user.subscribe((s) => setSnap({ ...s })), []);
  return snap;
}

const msg = (e: unknown): string => (e && (e as Error).message ? (e as Error).message : String(e));

/** 给定类型的一个合法默认值 / 解析输入 */
function defaultOf(type: ValueType): unknown {
  return type === 'bool' ? false : type === 'num' ? 0 : type === 'str' ? '' : { hello: 'world' };
}
function parseOf(type: ValueType, raw: string): unknown {
  if (type === 'bool') return raw === 'true' || raw === '1';
  if (type === 'num') return Number(raw) || 0;
  if (type === 'str') return raw;
  try {
    return JSON.parse(raw);
  } catch {
    return { raw };
  }
}

/** 交互：声明用户键 → 写 → 读回，全程真实落盘用户层库 */
function KvsDemo(): React.ReactElement {
  const { token } = useToken();
  const snap = useUserSnap();
  const [key, setKey] = React.useState('kv_demo');
  const [type, setType] = React.useState<ValueType>('str');
  const [raw, setRaw] = React.useState('你好，持久化');
  const [log, setLog] = React.useState<string[]>([]);
  const push = (m: string): void => setLog((l) => [`${new Date().toLocaleTimeString()} · ${m}`, ...l].slice(0, 6));

  const doInit = (): void => {
    try {
      Application.user.init(key, type, defaultOf(type));
      push(`init("${key}", ${type}) ✓ 已声明并落默认值`);
    } catch (e) {
      push(`init ✗ ${msg(e)}`);
    }
  };
  const doSet = (): void => {
    try {
      Application.user.set(key, parseOf(type, raw));
      push(`set("${key}") ✓ 已落盘（重启后回灌）`);
    } catch (e) {
      push(`set ✗ ${msg(e)}`);
    }
  };

  const inputRow: React.ReactElement = (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: token.marginXS, alignItems: 'center' }}>
      <Input style={{ width: 160 }} value={key} onChange={setKey} placeholder="键名 key" />
      <View style={{ width: 260 }}>
        <Segmented
          value={type}
          onChange={(v) => setType(v as ValueType)}
          options={[
            { label: 'bool', value: 'bool' },
            { label: 'num', value: 'num' },
            { label: 'str', value: 'str' },
            { label: 'json', value: 'json' },
          ]}
        />
      </View>
      <Input style={{ width: 200 }} value={raw} onChange={setRaw} placeholder="值（按所选类型解释）" />
    </View>
  );

  return (
    <View>
      {inputRow}
      <View style={{ flexDirection: 'row', gap: token.marginXS, marginTop: token.marginSM, flexWrap: 'wrap' }}>
        <Button type="primary" onClick={doInit}>init 声明类型</Button>
        <Button onClick={doSet}>set 写入并落盘</Button>
        <Tag color={Application.user.isInit(key) ? 'success' : 'default'}>{Application.user.isInit(key) ? `已 init：${Application.user.type(key) ?? ''}` : '未 init'}</Tag>
      </View>

      <View style={{ marginTop: token.margin, flexDirection: 'row', flexWrap: 'wrap', gap: token.marginXS }}>
        {Object.keys(snap).length === 0 ? (
          <Text style={{ color: token.colorTextTertiary, fontSize: token.fontSizeSM }}>（用户存储为空，先 init 一个键）</Text>
        ) : (
          Object.entries(snap).map(([k, v]) => (
            <Tag key={k} color="processing">{`${k} = ${JSON.stringify(v)}`}</Tag>
          ))
        )}
      </View>

      <View style={{ marginTop: token.marginSM, gap: 2 }}>
        {log.map((l, i) => (
          <Text key={i} style={{ fontSize: token.fontSizeSM, color: i === 0 ? token.colorText : token.colorTextTertiary }}>
            {l}
          </Text>
        ))}
      </View>
    </View>
  );
}

/** 校验演示：三类非法操作都会被 store 层拒绝（抛错，不落盘） */
function GuardDemo(): React.ReactElement {
  const { token } = useToken();
  const [log, setLog] = React.useState<string[]>([]);
  const push = (m: string): void => setLog((l) => [m, ...l].slice(0, 5));

  const tryNoInit = (): void => {
    try {
      Application.user.set('never_inited_key', 123);
      push('未 init 写入：竟然通过了？（不应发生）');
    } catch (e) {
      push(`拒绝：${msg(e)}`);
    }
  };
  const tryTypeMismatch = (): void => {
    const k = 'guard_num';
    Application.user.init(k, 'num', 0);
    try {
      Application.user.set(k, '我是字符串' as unknown as number);
      push('类型不符写入：竟然通过了？（不应发生）');
    } catch (e) {
      push(`拒绝：${msg(e)}`);
    }
  };
  const tryReserved = (): void => {
    try {
      Application.user.init('App', 'json', { hacked: true });
      push('占用保留键 App：竟然通过了？（不应发生）');
    } catch (e) {
      push(`拒绝：${msg(e)}`);
    }
  };

  return (
    <View>
      <View style={{ flexDirection: 'row', gap: token.marginXS, flexWrap: 'wrap' }}>
        <Button danger onClick={tryNoInit}>未 init 直接写</Button>
        <Button danger onClick={tryTypeMismatch}>写入类型不符</Button>
        <Button danger onClick={tryReserved}>占用系统保留键 App</Button>
      </View>
      <View style={{ marginTop: token.marginSM, gap: 2 }}>
        {log.length === 0 ? (
          <Text style={{ fontSize: token.fontSizeSM, color: token.colorTextTertiary }}>点上面任一按钮，观察 store 层的类型/保留键校验拦截。</Text>
        ) : (
          log.map((l, i) => (
            <Text key={i} style={{ fontSize: token.fontSizeSM, color: token.colorErrorText }}>{l}</Text>
          ))
        )}
      </View>
    </View>
  );
}

/** 存储实况：可用性 + 两份实体库 + 内存与磁盘键的对应关系（不展示绝对路径） */
function StorageInfo(): React.ReactElement {
  const { token } = useToken();
  const [, force] = React.useState(0);
  const snap = useUserSnap();
  const persisted = kv.available ? kv.keys('user') : [];
  const declared = Application.user.keys();
  const mono = { fontSize: token.fontSizeSM, color: token.colorText };
  const lbl = { fontSize: token.fontSizeSM, color: token.colorTextTertiary };
  const Line = (p: { label: string; value: string }): React.ReactElement => (
    <View style={{ flexDirection: 'row', marginTop: token.marginXXS }}>
      <Text style={{ ...lbl, width: 96 }}>{p.label}</Text>
      <Text style={mono}>{p.value}</Text>
    </View>
  );
  return (
    <View>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: token.marginXS }}>
        <Tag color={kv.available ? 'success' : 'warning'}>{kv.available ? '原生 KV 可用' : '降级：纯内存（原生层未载入）'}</Tag>
        <Button size="small" onClick={() => force((n) => n + 1)}>刷新</Button>
      </View>
      <View style={{ marginTop: token.marginSM }}>
        <Line label="系统层库" value="flux_app.kv（整份 App 命名空间存为一条 json 记录）" />
        <Line label="用户层库" value="flux_user.kv（逐键：键名 + 类型前缀 + 值）" />
        <Line label="磁盘用户键" value={persisted.length ? persisted.join(', ') : '（空）'} />
        <Line label="内存已声明" value={declared.length ? declared.join(', ') : '（空）'} />
      </View>
      <Prose
        lines={[
          `· 内存快照 ${Object.keys(snap).length} 个键，与磁盘「${persisted.length}」个键一一对应；关进程再开，init 会以库里的旧值回灌（除非库里没有）。`,
          '· 两份文件物理独立：改主题只动系统层库，用户 set 只动用户层库，互不污染。',
          '· 开发环境落在工程源码目录、打包后落在应用数据目录；值以带类型前缀的二进制存储，非明文。',
        ]}
      />
    </View>
  );
}

const DEMOS: DemoItem[] = [
  {
    name: '自研 KV 引擎：一条追加日志 + 内存索引',
    desc: '不引第三方，仿 bitcask：所有写只追加到文件尾，开进程时回放重建内存索引。',
    node: (
      <View>
        <StepFlow steps={KV_FLOW} />
        <Prose
          lines={[
            '· 记录帧：key_len | val_len | op | crc32 | key | value；文件头带 magic + version + flags。',
            '· op：0=Delete（写墓碑）、1=Put。删除不原地改写，只追加墓碑，回放时最后一条生效。',
            '· 断电/半包容错：回放逐帧校验 CRC，遇到尾部对不上的残帧即停止丢弃——天然崩溃安全。',
            '· 校验和为手写 CRC-32（反射多项式），无依赖。',
          ]}
        />
      </View>
    ),
    code: [
      '// 仿 bitcask：写只追加到文件尾，开进程时回放重建内存索引',
      '// 记录帧：key_len | val_len | op | crc32 | key | value（op 0=Delete 墓碑 / 1=Put）',
      '// 回放逐帧校 CRC，尾部残帧即停——天然崩溃安全；CRC-32 手写无依赖',
    ].join('\n'),
  },
  {
    name: '双层存储：系统层 vs 用户层（两个单独文件）',
    desc: '你要的四条约束在这里落地：类型化、系统/用户两份独立、系统有内建默认、用户需 init 声明。',
    node: (
      <Prose
        lines={[
          '① 存入的数据需指定类型：值首字节是类型标记（bool/num/str/json），文件自描述且非明文。',
          '② 系统层单独一份：Application.config → flux_app.kv，管系统保留命名空间 App（主题等）。',
          "② 用户层单独一份：Application.user → flux_user.kv，与系统层物理分离，互不污染。",
          '③ 系统层有内建默认：DEFAULT_THEME 硬编码，库缺字段回落到它，无需 init 即可用。',
          '④ 用户层需 init：Application.user.init(key, type, default?) 先声明「键名 + 值类型 (+ 默认)」，之后 set 才放行。',
        ]}
      />
    ),
    code: [
      '// 系统层：Application.config → flux_app.kv（保留命名空间 App，内置默认无需 init）',
      'Application.config.get(); Application.config.set({ App: { theme } });',
      '',
      '// 用户层：Application.user → flux_user.kv（需先 init 声明键+类型）',
      "Application.user.init('theme_mode', 'str', 'dark');",
      "Application.user.set('theme_mode', 'light');",
    ].join('\n'),
  },
  {
    name: '实时：声明 → 写入 → 落盘（重开进程回灌）',
    desc: '下面全部真跑：init/set 会写进用户层库；关掉进程再开，Application.user.init 读到的是磁盘旧值。',
    node: <KvsDemo />,
    code: [
      '// 声明（首次落默认值，已存则保留磁盘旧值）',
      "Application.user.init('count', 'num', 0);",
      '// 写入并落盘（重启后回灌）',
      "Application.user.set('count', 42);",
      '// 读取',
      "const v = Application.user.get('count');",
    ].join('\n'),
  },
  {
    name: '类型与保留键校验',
    desc: 'store 层在写盘之前拦截三类非法操作：未声明就写、类型不符、占用系统保留键 App。',
    node: <GuardDemo />,
    code: [
      '// 三类非法操作会在写盘前抛错：',
      "Application.user.set('never_inited', 1);   // ✗ 未 init 就写",
      "Application.user.init('n', 'num', 0);",
      "Application.user.set('n', '字符串' as any);  // ✗ 类型不符",
      "Application.user.init('App', 'json', {});    // ✗ 占用系统保留键 App",
    ].join('\n'),
  },
  {
    name: '存储实况',
    desc: '可用性、两份实体库、内存与磁盘键的对应关系（开发/打包目录不同，均以二进制非明文落盘）。',
    node: <StorageInfo />,
    code: [
      '// 运行态检查：库是否可用 + 内存声明 vs 磁盘已落盘键',
      "const persisted = kv.available ? kv.keys('user') : [];",
      'const declared = Application.user.keys();',
      '// 开发/打包目录不同，均以二进制非明文落盘',
    ].join('\n'),
  },
];

export function SysKvDemo(): React.ReactElement {
  return <DemoPage demos={DEMOS} />;
}
