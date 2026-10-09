// 系统 / 原生库调用 FFI：用声明式签名直接调用系统 DLL/dylib/so 的 C 导出，无需写一行 C/Rust。
//
// 架构：react-native-flux-desktop-ffi 是「独立分支包」（napi-rs + libloading + libffi 静态链入 .node），
//   与主包同款 file: 本地依赖引入；JS 侧 ffi.sym(handle, name, argTypes, retType) 声明一个导出为可调用闭包，
//   调用即透传到 native。它自带 .node，不依赖主库；可选 { async:true } 把调用丢 libuv 线程池返回 Promise。
//
// 四类能力（对齐包内 M1–M3 冒烟）：
//   ① 标量调用   —— kernel32.GetTickCount / GetCurrentProcessId（无参、u32 返回）
//   ② 输入输出缓冲 —— GetModuleFileNameW(NULL, buf, size) 用 alloc/readBytes 把 native 写回的 UTF-16 路径读回来
//   ③ 内存原语   —— alloc / writeBytes / readBytes / free 的字节往返
//   ④ native 回调 —— user32.EnumWindows 把一个 JS 闭包当函数指针传下去，收集顶层窗口
//
// ⚠️ 仅面向 C ABI（extern "C"）；签名写错或空指针解引用会直接段错误带走进程。本 demo 只在 Windows 跑真实调用，
//   非 Windows 平台各按钮给出「本平台未演示」提示，不触发 native。
import React from 'react';
import { View, Text, Button, Alert, Tag, useToken } from 'react-native-flux-desktop';
import { DemoPage, type DemoItem, type ApiRow } from '../DemoPage';
import * as ffi from 'react-native-flux-desktop-ffi';

const PKG = 'react-native-flux-desktop-ffi';
const IS_WIN = typeof process !== 'undefined' && process.platform === 'win32';

const ts = (): string => new Date().toLocaleTimeString('en-GB');

/** kernel32 / user32 句柄懒开（复用，避免每次按钮都 open/close；进程退出前不显式 close 也无妨）。 */
let k32: number | null = null;
let u32: number | null = null;
function kernel32(): number {
  if (k32 === null) k32 = ffi.open('kernel32.dll');
  return k32;
}
function user32(): number {
  if (u32 === null) u32 = ffi.open('user32.dll');
  return u32;
}

/** 事件日志盒：最多留 8 行。 */
function useLog(): { lines: string[]; push: (s: string) => void; clear: () => void } {
  const [lines, setLines] = React.useState<string[]>([]);
  const push = (s: string): void => setLines((p) => [...p, s].slice(-8));
  const clear = (): void => setLines([]);
  return { lines, push, clear };
}

function LogBox({ lines, token }: { lines: string[]; token: any }): React.ReactElement {
  return (
    <View style={{ width: '100%', minHeight: 72, padding: token.paddingXS, backgroundColor: token.colorFillSecondary, borderRadius: token.borderRadiusSM, gap: 2 }}>
      {lines.length === 0 ? (
        <Text style={{ fontSize: token.fontSizeSM, color: token.colorTextTertiary }}>（点上方按钮触发真实调用，结果显示在这里）</Text>
      ) : (
        lines.map((l, i) => (
          <Text key={i} style={{ fontSize: token.fontSizeSM, color: token.colorText, fontVariant: ['tabular-nums'] }}>
            {l}
          </Text>
        ))
      )}
    </View>
  );
}

function NotWinNote({ token }: { token: any }): React.ReactElement | null {
  if (IS_WIN) return null;
  return (
    <Alert
      type="warning"
      showIcon
      message="本段为 Windows 真实调用示例"
      description={'当前平台非 win32，按钮不会触发 native。示例逻辑（' + PKG + ' 声明式签名）在 Windows 上直接可跑。'}
    />
  );
}

/** ① 标量调用：GetTickCount / GetCurrentProcessId。 */
function ScalarPlayground(): React.ReactElement {
  const { token } = useToken();
  const log = useLog();
  const run = (label: string, fn: () => unknown): void => {
    if (!IS_WIN) return log.push(`[${ts()}] ${label}：跳过（非 Windows）`);
    try {
      log.push(`[${ts()}] ${label} → ${String(fn())}`);
    } catch (e) {
      log.push(`[${ts()}] ${label} 抛错：${e instanceof Error ? e.message : String(e)}`);
    }
  };
  return (
    <View style={{ width: '100%', gap: token.marginXS }}>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: token.marginXS }}>
        <Button onClick={() => run('GetTickCount()', () => ffi.sym(kernel32(), 'GetTickCount', [], 'u32')())}>GetTickCount（系统启动毫秒）</Button>
        <Button onClick={() => run('GetCurrentProcessId()', () => ffi.sym(kernel32(), 'GetCurrentProcessId', [], 'u32')())}>GetCurrentProcessId（本进程 PID）</Button>
        <Button onClick={() => run('GetCurrentProcess()（HANDLE→ptr）', () => ffi.sym(kernel32(), 'GetCurrentProcess', [], 'ptr')())}>GetCurrentProcess（伪句柄 ptr）</Button>
      </View>
      <NotWinNote token={token} />
      <LogBox lines={log.lines} token={token} />
    </View>
  );
}

/** ② 内存往返：alloc → writeBytes → readBytes → free。 */
function MemPlayground(): React.ReactElement {
  const { token } = useToken();
  const log = useLog();
  const roundtrip = (): void => {
    if (!IS_WIN) return log.push(`[${ts()}] 跳过（非 Windows）`);
    try {
      const addr = ffi.alloc(16);
      log.push(`[${ts()}] alloc(16) → 地址 ${addr}`);
      const payload = Uint8Array.from([1, 2, 3, 4, 200, 255, 0, 7, 128, 64]);
      ffi.writeBytes(addr, payload);
      const back = ffi.readBytes(addr, payload.length);
      const same = back.length === payload.length && back.every((v, i) => v === payload[i]);
      log.push(`[${ts()}] write→read ${payload.length} 字节：${same ? '一致 ✓' : '不一致 ✗'} [${Array.from(back).join(',')}]`);
      const tail = ffi.readBytes(addr + payload.length, 1);
      log.push(`[${ts()}] 之后 1 字节（alloc 零初始化）= ${tail[0]}`);
      log.push(`[${ts()}] free → ${ffi.free(addr)}；重复 free → ${ffi.free(addr)}`);
    } catch (e) {
      log.push(`[${ts()}] 抛错：${e instanceof Error ? e.message : String(e)}`);
    }
  };
  return (
    <View style={{ width: '100%', gap: token.marginXS }}>
      <Button type="primary" onClick={roundtrip}>alloc / write / read / free 往返</Button>
      <NotWinNote token={token} />
      <LogBox lines={log.lines} token={token} />
    </View>
  );
}

/** ③ 输出缓冲区：GetModuleFileNameW(NULL, buf, size) 读回本进程 exe 路径（UTF-16）。 */
function BufferPlayground(): React.ReactElement {
  const { token } = useToken();
  const log = useLog();
  const run = (): void => {
    if (!IS_WIN) return log.push(`[${ts()}] 跳过（非 Windows）`);
    let buf = 0;
    try {
      const GetModuleFileNameW = ffi.sym(kernel32(), 'GetModuleFileNameW', ['ptr', 'ptr', 'u32'], 'u32');
      buf = ffi.alloc(2048); // 1024 wchar
      const n = GetModuleFileNameW(0, buf, 1024) as number;
      log.push(`[${ts()}] GetModuleFileNameW 写入 ${n} 个 wchar`);
      const raw = ffi.readBytes(buf, n * 2);
      const path = Buffer.from(raw).toString('utf16le');
      log.push(`[${ts()}] 本进程可执行文件路径 = ${path}`);
    } catch (e) {
      log.push(`[${ts()}] 抛错：${e instanceof Error ? e.message : String(e)}`);
    } finally {
      if (buf) ffi.free(buf);
    }
  };
  return (
    <View style={{ width: '100%', gap: token.marginXS }}>
      <Button type="primary" onClick={run}>取本进程 EXE 路径（输出缓冲区）</Button>
      <NotWinNote token={token} />
      <LogBox lines={log.lines} token={token} />
    </View>
  );
}

/** ④ 异步调用：{ async:true } 返回 Promise，丢 libuv 线程池不卡事件循环。 */
function AsyncPlayground(): React.ReactElement {
  const { token } = useToken();
  const log = useLog();
  const [busy, setBusy] = React.useState(false);
  const run = async (): Promise<void> => {
    if (!IS_WIN) return log.push(`[${ts()}] 跳过（非 Windows）`);
    setBusy(true);
    log.push(`[${ts()}] 发起异步 GetTickCount（返回 Promise）…`);
    try {
      const tickAsync = ffi.sym(kernel32(), 'GetTickCount', [], 'u32', { async: true });
      const t = await tickAsync();
      log.push(`[${ts()}] await 结果 = ${t}（计算在 libuv 线程，resolve 回主线程）`);
    } catch (e) {
      log.push(`[${ts()}] 抛错：${e instanceof Error ? e.message : String(e)}`);
    } finally {
      setBusy(false);
    }
  };
  return (
    <View style={{ width: '100%', gap: token.marginXS }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: token.marginXS }}>
        <Button type="primary" loading={busy} onClick={() => void run()}>异步调用 await</Button>
        <Tag color={busy ? 'processing' : 'default'}>{busy ? 'Promise pending' : 'idle'}</Tag>
      </View>
      <NotWinNote token={token} />
      <LogBox lines={log.lines} token={token} />
    </View>
  );
}

/** ⑤ native 回调：JS 闭包 → C 函数指针，交给 user32.EnumWindows 枚举顶层窗口。 */
function CallbackPlayground(): React.ReactElement {
  const { token } = useToken();
  const log = useLog();
  const run = (): void => {
    if (!IS_WIN) return log.push(`[${ts()}] 跳过（非 Windows）`);
    try {
      let count = 0;
      let firstHwnd: number | null = null;
      // WNDENUMPROC(HWND, LPARAM) -> BOOL。蹦床按 ['ptr','size'] 封并实参投递主线程；返回值恒 0(FALSE) → 首个回调后即停。
      const cb = ffi.callback((hwnd: number, _lparam: number) => {
        count++;
        if (firstHwnd === null) firstHwnd = hwnd;
      }, ['ptr', 'size'], 'i32');
      log.push(`[${ts()}] makeCallback → 函数指针地址 ${cb.address}`);
      const EnumWindows = ffi.sym(user32(), 'EnumWindows', ['ptr', 'size'], 'i32');
      const ret = EnumWindows(cb.address, 0);
      log.push(`[${ts()}] EnumWindows 同步返回 ${ret}`);
      // 回调经 ThreadsafeFunction 投递主线程，等下一个 tick 队列处理完再统计。
      setTimeout(() => {
        log.push(`[${ts()}] 回调触发 ${count} 次；首个 HWND = ${firstHwnd}`);
        log.push(`[${ts()}] releaseCallback → ${cb.release()}；重复 release → ${cb.release()}`);
      }, 50);
    } catch (e) {
      log.push(`[${ts()}] 抛错：${e instanceof Error ? e.message : String(e)}`);
    }
  };
  return (
    <View style={{ width: '100%', gap: token.marginXS }}>
      <Button type="primary" onClick={run}>EnumWindows 驱动 JS 回调</Button>
      <NotWinNote token={token} />
      <LogBox lines={log.lines} token={token} />
    </View>
  );
}

/** 把 readBytes 返回的字节序列包成 Buffer（readBytes 运行时返回普通数组，Buffer.from 兼容数组/Uint8Array）。 */
const asBuffer = (raw: Uint8Array | number[]): Buffer => Buffer.from(raw as ArrayLike<number>);

/** ⑥ 结构体读取：GetLocalTime(SYSTEMTIME*) 把 8 个 WORD 写进缓冲区，按固定偏移解回。 */
function StructPlayground(): React.ReactElement {
  const { token } = useToken();
  const log = useLog();
  const run = (): void => {
    if (!IS_WIN) return log.push(`[${ts()}] 跳过（非 Windows）`);
    let buf = 0;
    try {
      const GetLocalTime = ffi.sym(kernel32(), 'GetLocalTime', ['ptr'], 'void');
      buf = ffi.alloc(16); // SYSTEMTIME = 8 个 WORD（16 字节）
      GetLocalTime(buf);   // native 填结构体
      const b = asBuffer(ffi.readBytes(buf, 16));
      const u16 = (off: number): number => b.readUInt16LE(off);
      const pad = (n: number): string => String(n).padStart(2, '0');
      const DOW = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
      log.push(`[${ts()}] alloc(16) 传指针，GetLocalTime 回填 SYSTEMTIME`);
      log.push(`[${ts()}] 年=${u16(0)} 月=${u16(2)} 日=${u16(6)} 星期=${DOW[u16(4) % 7]}`);
      log.push(`[${ts()}] 时间=${pad(u16(8))}:${pad(u16(10))}:${pad(u16(12))}.${pad(u16(14))}`);
    } catch (e) {
      log.push(`[${ts()}] 抛错：${e instanceof Error ? e.message : String(e)}`);
    } finally {
      if (buf) ffi.free(buf);
    }
  };
  return (
    <View style={{ width: '100%', gap: token.marginXS }}>
      <Button type="primary" onClick={run}>读系统本地时间（结构体）</Button>
      <NotWinNote token={token} />
      <LogBox lines={log.lines} token={token} />
    </View>
  );
}

/** 随包原生库相对路径：dev 时相对 process.cwd()（gallery 根），打包成 exe 后经 pack.nativeLibs 落地到解压目录，同相对路径命中。 */
const LOCAL_DLL = 'assets/native/flux-demo.dll';
let localDllHandle: number | null = null;
function localDll(): number {
  if (localDllHandle === null) localDllHandle = ffi.open(LOCAL_DLL);
  return localDllHandle;
}

/** ⑦ 随包原生库 + 打包链路：加载应用自带的 flux-demo.dll，调其 extern "C" 导出。 */
function LocalDllPlayground(): React.ReactElement {
  const { token } = useToken();
  const log = useLog();
  const runScalar = (): void => {
    if (!IS_WIN) return log.push(`[${ts()}] 跳过（非 Windows）`);
    try {
      log.push(`[${ts()}] open('${LOCAL_DLL}') → 句柄 ${localDll()}`);
      const add = ffi.sym(localDll(), 'flux_add', ['i32', 'i32'], 'i32');
      const fib = ffi.sym(localDll(), 'flux_fib', ['i32'], 'i32');
      log.push(`[${ts()}] flux_add(2,3) = ${add(2, 3)}`);
      log.push(`[${ts()}] flux_fib(10) = ${fib(10)}；flux_fib(30) = ${fib(30)}`);
    } catch (e) {
      log.push(`[${ts()}] 抛错：${e instanceof Error ? e.message : String(e)}`);
    }
  };
  const runBuffer = (): void => {
    if (!IS_WIN) return log.push(`[${ts()}] 跳过（非 Windows）`);
    let buf = 0;
    try {
      const squares = ffi.sym(localDll(), 'flux_squares', ['ptr', 'i32'], 'void');
      const n = 6;
      buf = ffi.alloc(n * 4); // 6 个 int32
      squares(buf, n);         // native 往 out 写 (i+1)^2
      const b = asBuffer(ffi.readBytes(buf, n * 4));
      const ints: number[] = [];
      for (let i = 0; i < n; i++) ints.push(b.readInt32LE(i * 4));
      log.push(`[${ts()}] flux_squares(out,${n}) → [${ints.join(', ')}]`);
      const up = ffi.sym(localDll(), 'flux_upper_to', ['u16str', 'ptr', 'i32'], 'i32');
      const ob = ffi.alloc(64);
      const cnt = up('hello flux', ob, 32) as number;
      log.push(`[${ts()}] flux_upper_to('hello flux') → "${asBuffer(ffi.readBytes(ob, cnt * 2)).toString('utf16le')}"（u16str 入参封送）`);
      ffi.free(ob);
    } catch (e) {
      log.push(`[${ts()}] 抛错：${e instanceof Error ? e.message : String(e)}`);
    } finally {
      if (buf) ffi.free(buf);
    }
  };
  return (
    <View style={{ width: '100%', gap: token.marginXS }}>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: token.marginXS }}>
        <Button type="primary" onClick={runScalar}>加载随包 DLL · 标量调用</Button>
        <Button onClick={runBuffer}>输出缓冲区 + 宽字符串</Button>
      </View>
      <View style={{ gap: 2 }}>
        <Text style={{ fontSize: token.fontSizeSM, color: token.colorTextTertiary }}>
          随包库相对路径（相对 process.cwd()）：{LOCAL_DLL}；已在 app.json 的 pack.nativeLibs 声明，flux-pack 打 exe 时一并内嵌。
        </Text>
        <Text style={{ fontSize: token.fontSizeSM, color: token.colorTextTertiary }}>
          源码见 gallery/native-demo/flux-demo.c（extern "C"：flux_add / flux_fib / flux_squares / flux_upper_to）。
        </Text>
      </View>
      <NotWinNote token={token} />
      <LogBox lines={log.lines} token={token} />
    </View>
  );
}

/** 前置说明块。 */
function IntroBlock(): React.ReactElement {
  const { token } = useToken();
  return (
    <View style={{ width: '100%', gap: token.marginXS }}>
      <Alert
        type="info"
        showIcon
        message={'独立可选包 · 声明式调用原生导出（' + PKG + '）'}
        description="napi-rs + libloading + libffi 静态链入 .node；JS 侧以 ffi.sym(句柄, 符号名, 参数类型[], 返回类型) 把一个 C 导出声明成可直接调用的闭包，无需写 C/Rust。自带 .node 不依赖主库，作可选 peer。"
      />
      <View style={{ gap: 2 }}>
        <Text style={{ fontSize: token.fontSize, color: token.colorTextSecondary }}>签名类型名（与 Rust FfiType 对齐）：</Text>
        <Text style={{ fontSize: token.fontSizeSM, color: token.colorTextTertiary }}>
          void · i8/i16/i32/i64 · u8/u16/u32/u64 · f32/f64 · bool · ptr · size · u8str(char*UTF-8) · u16str(wchar_t*UTF-16)
        </Text>
      </View>
      <Alert
        type="warning"
        showIcon
        message="仅 C ABI + 直崩风险"
        description={'只面向 extern "C" 导出；签名写错或空指针解引用会直接段错误带走整个进程。下面每个按钮都是对系统 DLL 的真实调用。'}
      />
    </View>
  );
}

const DEMOS: DemoItem[] = [
  {
    name: '独立可选包 · 声明式 FFI',
    desc: '与主包同款 file: 本地依赖；一个 .node 承载 libffi，JS 侧声明签名即可调用原生导出',
    node: <IntroBlock />,
    code: [
      '// 与主包同款 file: 本地依赖（引入方式）',
      '"react-native-flux-desktop-ffi": "file:../react-native-flux-desktop-ffi"',
      '',
      "import * as ffi from 'react-native-flux-desktop-ffi';",
      '',
      "const k32 = ffi.open('kernel32.dll');           // 库名或绝对/相对路径 → 句柄",
      "const GetTickCount = ffi.sym(k32, 'GetTickCount', [], 'u32'); // 声明导出为可调用闭包",
      'const ms = GetTickCount();                      // 直接调用，返回 number',
    ].join('\n'),
  },
  {
    name: '标量调用',
    desc: '无参 / 标量入参：GetTickCount、GetCurrentProcessId（u32）、GetCurrentProcess（ptr→number 地址）',
    node: <ScalarPlayground />,
    code: [
      "const k32 = ffi.open('kernel32.dll');",
      "const GetTickCount = ffi.sym(k32, 'GetTickCount', [], 'u32');",
      'const ms = GetTickCount();            // 系统启动至今毫秒数',
      '',
      "const pid = ffi.sym(k32, 'GetCurrentProcessId', [], 'u32')();",
      '',
      "// ptr 返回按 number（地址）解读：x64 用户态堆指针 < 2^53 精确",
      "const hproc = ffi.sym(k32, 'GetCurrentProcess', [], 'ptr')();",
    ].join('\n'),
  },
  {
    name: '内存原语往返',
    desc: 'alloc 零初始化 → writeBytes → readBytes 校验 → free（重复 free / 非本模块地址返回 false）',
    node: <MemPlayground />,
    code: [
      'const addr = ffi.alloc(16);                       // 分配 16 字节，返回地址(number)',
      'const payload = Uint8Array.from([1,2,3,4,200,255]);',
      'ffi.writeBytes(addr, payload);                    // 写入',
      'const back = ffi.readBytes(addr, payload.length); // 读回 Uint8Array',
      'ffi.free(addr);                                   // 归还；true / 重复 free false',
    ].join('\n'),
  },
  {
    name: '输出缓冲区（native 回写）',
    desc: 'GetModuleFileNameW(NULL, buf, size) 把 UTF-16 路径写进 alloc 的缓冲区，再 readBytes 读回',
    node: <BufferPlayground />,
    code: [
      "const GetModuleFileNameW = ffi.sym(kernel32(), 'GetModuleFileNameW', ['ptr','ptr','u32'], 'u32');",
      'const buf = ffi.alloc(2048);                 // 1024 wchar',
      'const n = GetModuleFileNameW(0, buf, 1024);  // native 写入本进程路径',
      'const raw = ffi.readBytes(buf, n * 2);       // 读回 UTF-16 字节',
      "const path = Buffer.from(raw).toString('utf16le');",
      'ffi.free(buf);',
    ].join('\n'),
  },
  {
    name: '异步调用（libuv 线程池）',
    desc: 'sym(...,{async:true}) 后调用返回 Promise，计算在 libuv 线程、resolve 回主线程，长阻塞不卡事件循环',
    node: <AsyncPlayground />,
    code: [
      "// 声明期标 { async:true }，调用即返回 Promise",
      "const tickAsync = ffi.sym(kernel32(), 'GetTickCount', [], 'u32', { async: true });",
      'const t = await tickAsync();',
    ].join('\n'),
  },
  {
    name: 'native 回调（JS 闭包→函数指针）',
    desc: 'ffi.callback() 把 JS 函数登记为 C 函数指针传给 EnumWindows；经 ThreadsafeFunction 投递主线程。fire-and-forget，返回值恒 0/NULL',
    node: <CallbackPlayground />,
    code: [
      "let count = 0, firstHwnd = null;",
      '// argTypes = native 传进来的实参类型；retType = 回调返回类型',
      "const cb = ffi.callback((hwnd, lparam) => {",
      '  count++; if (firstHwnd === null) firstHwnd = hwnd;',
      "}, ['ptr', 'size'], 'i32');",
      '',
      "const EnumWindows = ffi.sym(user32(), 'EnumWindows', ['ptr','size'], 'i32');",
      'EnumWindows(cb.address, 0);   // 把回调地址当函数指针传下去',
      '// 回调异步入队，下一 tick 才在 JS 侧收到；cb.release() 注销',
    ].join('\n'),
  },
  {
    name: '结构体读取（定长缓冲区）',
    desc: '无内置 struct 封送：用 alloc 开一块缓冲区传指针，native 回填后按固定偏移解回（以 SYSTEMTIME 的 8 个 WORD 为例）',
    node: <StructPlayground />,
    code: [
      "const GetLocalTime = ffi.sym(kernel32(), 'GetLocalTime', ['ptr'], 'void');",
      'const buf = ffi.alloc(16);            // SYSTEMTIME = 8 个 WORD = 16 字节',
      'GetLocalTime(buf);                    // native 往结构体填值',
      'const b = Buffer.from(ffi.readBytes(buf, 16));',
      'const year = b.readUInt16LE(0), month = b.readUInt16LE(2), day = b.readUInt16LE(6);',
      'const hh = b.readUInt16LE(8), mm = b.readUInt16LE(10), ss = b.readUInt16LE(12);',
      'ffi.free(buf);',
    ].join('\n'),
  },
  {
    name: '随包原生库（本地 DLL + nativeLibs 打包）',
    desc: '应用自带第三方 DLL：ffi.open 用相对 process.cwd() 的路径加载，调其 extern "C" 导出；app.json 的 pack.nativeLibs 声明后 flux-pack 打 exe 会一并内嵌',
    node: <LocalDllPlayground />,
    code: [
      "// 随包库（相对 process.cwd()）；源码 gallery/native-demo/flux-demo.c",
      "const h = ffi.open('assets/native/flux-demo.dll');",
      '',
      "const add = ffi.sym(h, 'flux_add', ['i32','i32'], 'i32');",
      'add(2, 3);   // = 5（标量入参/返回）',
      "const fib = ffi.sym(h, 'flux_fib', ['i32'], 'i32');",
      'fib(10);     // = 55（原生计算）',
      '',
      "// 输出缓冲区：native 往 out 写 6 个平方数",
      "const squares = ffi.sym(h, 'flux_squares', ['ptr','i32'], 'void');",
      'const buf = ffi.alloc(6 * 4);',
      'squares(buf, 6);',
      'const b = Buffer.from(ffi.readBytes(buf, 24));   // [1,4,9,16,25,36]',
      'ffi.free(buf);',
      '',
      "// 宽字符串入参（u16str 封送成 wchar_t*）",
      "const up = ffi.sym(h, 'flux_upper_to', ['u16str','ptr','i32'], 'i32');",
      'const ob = ffi.alloc(64);',
      "const n = up('hello flux', ob, 32);              // = 10，out 内为 HELLO FLUX",
      'ffi.free(ob);',
      '',
      '// app.json："pack": { "mode":"sea", "nativeLibs": ["assets/native/flux-demo.dll"] }',
    ].join('\n'),
  },
];

const API: ApiRow[] = [
  { name: 'open(path)', desc: '加载原生库；path 可为库名（kernel32.dll）或绝对/相对（相对 process.cwd()）路径。返回句柄 number', type: '(path:string) => number', default: '–' },
  { name: 'close(handle)', desc: '卸载库；重复 close 返回 false', type: '(handle) => boolean', default: '–' },
  { name: 'sym(handle, name, argTypes, retType, opts?)', desc: '【核心】声明一个 C 导出为可调用闭包；非法类型名/缺失符号在声明期即抛错（前移校验）', type: '(handle,name,FfiTypeName[],FfiTypeName,{async?}) => FfiFunction', default: '–' },
  { name: 'FfiFunction', desc: 'sym() 返回的闭包：(...args) 直接调用；.id 内部登记键；.release() 注销该声明', type: '(...args)=>any & {id,release}', default: '–' },
  { name: '{ async:true }', desc: '调用返回 Promise，把 native 调用丢 libuv 线程池，长阻塞不卡事件循环', type: 'SymOptions', default: '同步' },
  { name: '类型名 FfiTypeName', desc: 'void i8/i16/i32/i64 u8/u16/u32/u64 f32/f64 bool ptr size u8str(char*UTF-8) u16str(wchar_t*UTF-16)', type: 'union', default: '–' },
  { name: 'alloc(size)', desc: '分配 size 字节零初始化内存，返回地址(number)；须 free 归还', type: '(size) => number', default: '–' },
  { name: 'free(address)', desc: '释放 alloc() 地址；非本模块分配或重复释放返回 false', type: '(address) => boolean', default: '–' },
  { name: 'readBytes(address, len)', desc: '从地址读 len 字节；声明为 Uint8Array，运行时为字节数组，建议 Buffer.from(readBytes(...)) 再 readInt32LE / readUInt16LE / toString 解码', type: '(address,len) => Uint8Array', default: '–' },
  { name: 'writeBytes(address, data)', desc: '把 data 写入地址（调用方保证容量足够）', type: '(address,Uint8Array) => void', default: '–' },
  { name: '结构体读写', desc: '无内置 struct 封送：把结构体当定长字节缓冲区，alloc(size) 传 ' + "'ptr' 地址，native 回填后按字段偏移用 Buffer 解回（如 SYSTEMTIME 8×WORD）", type: '约定', default: '–' },
  { name: '随包原生库', desc: "open() 可传相对 process.cwd() 的路径加载应用自带 DLL；在 app.json 配 pack.nativeLibs: ['相对路径'] 后 flux-pack 打 exe 会一并内嵌，运行时同相对路径命中", type: '打包约定', default: '–' },
  { name: 'callback(jsFn, argTypes, retType)', desc: '把 JS 函数登记为 native 可回调的 C 函数指针；返回 {address, release()}。fire-and-forget，返回值恒 0/NULL，JS 下一 tick 收到', type: '(fn,FfiTypeName[],FfiTypeName) => {address,release}', default: '–' },
  { name: 'errno()', desc: '最近一次错误的系统 errno（Windows 取 GetLastError）', type: '() => number', default: '–' },
  { name: 'version()', desc: '原生绑定版本', type: '() => string', default: '–' },
];

export function FfiDemo(): React.ReactElement {
  return <DemoPage demos={DEMOS} api={API} />;
}
