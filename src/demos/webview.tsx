// WebView / 网页视图：用 Chromium 内核（Windows=WebView2）把网页贴进「当前窗」的一块区域，并演示 JS 双向桥 + 生命周期。
//
// 用法【统一走声明式 <WebView>】：一个组件报「框 + 内容 + 事件 + 主动命令」，底层「取宿主 HWND、量绝对
// 布局、贴/摘 Chromium 子面、双向桥、生命周期」全被 component.js 封装；命令式原生 API 只是它的内核，一般无需直接调。
//
// 架构：react-native-flux-desktop-webview 是「独立分支包」，但【只】提供「一块 view 的渲染能力」——
//   把 WebView2(Chromium) 作为 child HWND 贴到主库某窗的 HWND 上。不自建窗口/事件循环/pump：主库唯一
//   EventLoop 的 pump 会顺带派发子面消息 → Chromium 自绘。Chromium 内核来自系统 Evergreen 运行时，不打进包。
//
// 本地内容走【自定义协议 flux】（→ http://flux.localhost/…），不用 file://：file:// 页源会让 wry 的 ipc
//   回调把页面 Source 解析成 http::Uri 失败而 panic 拖垮进程；协议页源合法，且同目录相对 css/js/图天然可解。
//
// JS 桥（本包用 initialization script 自动注入，页面无需引任何 SDK）：
//   网页 → RN（单向）：window.fluxBridge.post(obj)                 → onMessage(data)
//   网页 → RN（应答）：window.fluxBridge.request(obj): Promise     → onMessage(data, requestId)，onMessage 返回值自动应答
//   RN → 网页（投递）：ref.postMessage(obj)                        → 页面 window.onFluxMessage(data)
//   RN → 网页（取值）：ref.evaluate(script): Promise               → 读回页面求值结果
//   生命周期：domready / loaded / navigate / closed / newwindow / ipc（见组件回调与下方日志）。
//
// ⚠️ airspace：Chromium 子面盖在 Skia 画布【之上】，不可被覆盖/裁剪/圆角；滚动重排靠内部 setBounds 跟随，仍浮于最上层。
import React from 'react';
import { View, Text, Button, Input, Alert, useToken } from 'react-native-flux-desktop';
import { DemoPage, type DemoItem, type ApiRow } from '../DemoPage';
// 声明式组件（子路径导出）：内部把命令式原生 API 包成 <WebView>；react/主库作 peerDep 运行时解析。
import { WebView } from 'react-native-flux-desktop-webview/component';
import type { WebViewHandle } from 'react-native-flux-desktop-webview/component';

const PKG = 'react-native-flux-desktop-webview';

/** 内联 HTML（html 模式）：自带 CSS/JS，含「发给 RN」「向 RN 请求(应答)」按钮，演示单向 + 请求/应答两条链路。 */
const DEMO_HTML = [
  '<!doctype html><html><head><meta charset="utf-8"><style>',
  'body{font-family:system-ui,Segoe UI,sans-serif;margin:16px;background:#0f1115;color:#e6e6e6}',
  'h3{margin:0 0 10px}.card{background:#1b1f27;border:1px solid #2a2f3a;border-radius:8px;padding:12px;margin:8px 0}',
  'button{background:#3b82f6;color:#fff;border:0;border-radius:6px;padding:8px 12px;margin-right:8px;cursor:pointer}',
  'pre{white-space:pre-wrap;word-break:break-all;background:#000;padding:8px;border-radius:6px;margin:6px 0 0}',
  '.lc{color:#8b5cf6;font-weight:600}',
  '</style></head><body>',
  '<h3>内联 HTML · Chromium 子面（含双向桥）</h3>',
  '<div class="card">',
  '<button id="send">发给 RN（post）</button>',
  '<button id="req">向 RN 请求数据（request 应答）</button>',
  '<button id="pop">试开新窗(会被抑制并原地导航)</button>',
  '</div>',
  '<div class="card">生命周期：<span id="lc" class="lc">…</span></div>',
  '<div class="card">收到 RN 的消息：<pre id="rx">（暂无）</pre></div>',
  '<div class="card">RN 对 request 的应答：<pre id="rp">（暂无）</pre></div>',
  '<script>',
  'function $(i){return document.getElementById(i)}',
  'window.onFluxMessage=function(d){$("rx").textContent=(typeof d==="string")?d:JSON.stringify(d)};',
  '$("send").onclick=function(){var m={cmd:"ping",from:"web",t:Date.now()};window.fluxBridge.post(m);};',
  '$("req").onclick=function(){$("rp").textContent="请求中…";window.fluxBridge.request({cmd:"getData"}).then(function(r){$("rp").textContent=JSON.stringify(r);}).catch(function(e){$("rp").textContent="失败:"+e;});};',
  '$("pop").onclick=function(){window.open("https://example.com","_blank");};',
  'window.addEventListener("flux:lifecycle",function(e){$("lc").textContent=e.detail;});',
  '</script></body></html>',
].join('\n');

const ts = (): string => new Date().toLocaleTimeString('en-GB');

/** 前置说明块。 */
function IntroBlock(): React.ReactElement {
  const { token } = useToken();
  return (
    <View style={{ width: '100%', gap: token.marginXS }}>
      <Alert
        type="info"
        showIcon
        message={'统一用法：声明式 <WebView>（' + PKG + '/component）'}
        description="一个组件报「框 + 内容 + 事件 + 主动命令」；底层取 HWND、量绝对布局、贴/摘 Chromium 子面、双向桥、生命周期全被封装。命令式原生 API 是其内核，一般无需直接调用。"
      />
      <View style={{ gap: 2 }}>
        <Text style={{ fontSize: token.fontSize, color: token.colorTextSecondary }}>网页侧桥接 API（自动注入，无需引 SDK）：</Text>
        <Text style={{ fontSize: token.fontSizeSM, color: token.colorTextTertiary }}>
          window.fluxBridge.post(obj) → onMessage(data)；window.fluxBridge.request(obj) 返回 Promise → onMessage(data, requestId) 的返回值自动应答
        </Text>
        <Text style={{ fontSize: token.fontSizeSM, color: token.colorTextTertiary }}>
          window.onFluxMessage = fn 收 RN 消息；addEventListener('flux:lifecycle', e =&gt; e.detail) 收 domready / loaded
        </Text>
      </View>
      <Alert
        type="warning"
        showIcon
        message="airspace 限制"
        description="原生子面盖在 Skia 画布之上，无法被覆盖/裁剪/圆角；滚动重排靠内部 setBounds 跟随，但始终浮于最上层。"
      />
    </View>
  );
}

type Mode = 'file' | 'html' | 'src';

/** 声明式 Playground：内容三选一（随包本地文件 / 内联 HTML / 远程 URL），ref 主动 postMessage/navigate/evaluate/getUrl，onMessage 支持请求/应答。 */
function WebViewPlayground(): React.ReactElement {
  const { token } = useToken();
  const ref = React.useRef<WebViewHandle>(null);
  const [mode, setMode] = React.useState<Mode>('file');
  const [url, setUrl] = React.useState('https://example.com');
  const [ready, setReady] = React.useState(false);
  const [log, setLog] = React.useState<string[]>([]);
  const push = (line: string): void => setLog((p) => [...p, line].slice(-9));

  // onMessage 同时服务单向(post)与请求(request)：requestId 非空时返回的值会被组件自动应答回页面。
  const handle: Record<string, unknown> = {
    style: {
      width: '100%',
      height: 360,
      borderWidth: 1,
      borderStyle: 'dashed',
      borderColor: token.colorBorder,
      backgroundColor: token.colorFillQuaternary,
      alignItems: 'center',
      justifyContent: 'center',
    },
    ref,
    onDomReady: () => push(`[${ts()}] onDomReady`),
    onLoad: () => {
      push(`[${ts()}] onLoad（页面就绪）`);
      setReady(true);
    },
    onClose: () => {
      push(`[${ts()}] onClose`);
      setReady(false);
    },
    onError: (m: string) => push(`[${ts()}] onError: ${m}`),
    onNavigate: (u: string) => push(`[${ts()}] onNavigate: ${u}`),
    onNewWindow: (u: string) => {
      push(`[${ts()}] 新窗抑制 → 原地导航 ${u}`);
      ref.current?.navigate(u);
    },
    onMessage: (d: any, rid?: string) => {
      push(`[${ts()}] 网页→RN${rid ? `(request ${rid})` : ''}: ${typeof d === 'string' ? d : JSON.stringify(d)}`);
      if (d && d.cmd === 'getData') {
        // 返回值 → 组件自动 postReply 到该 requestId，页面 request 的 Promise resolve。
        return { answer: 42, list: ['alpha', 'beta', 'gamma'], at: Date.now() };
      }
    },
  };

  return (
    <View style={{ width: '100%', gap: token.marginXS }}>
      {/* 内容来源切换（key 强制重建，切模式=重新建面，语义最清晰）。 */}
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: token.marginXS, alignItems: 'center' }}>
        <Button type={mode === 'file' ? 'primary' : 'default'} onClick={() => setMode('file')}>
          随包本地文件
        </Button>
        <Button type={mode === 'html' ? 'primary' : 'default'} onClick={() => setMode('html')}>
          内联 HTML
        </Button>
        <Button type={mode === 'src' ? 'primary' : 'default'} onClick={() => setMode('src')}>
          远程 URL
        </Button>
        {mode === 'src' ? <Input value={url} onChange={setUrl} style={{ width: 240 }} placeholder="https://" /> : null}
      </View>

      {/* ref 主动命令（RN → 网页）：投递 / 导航 / 读回求值 / 取当前 URL。 */}
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: token.marginXS, alignItems: 'center' }}>
        <Button
          onClick={() => {
            const msg = { from: 'rn', hello: '你好，网页', t: Date.now() };
            push(`[${ts()}] RN→网页 postMessage: ${JSON.stringify(msg)}`);
            ref.current?.postMessage(msg);
          }}
          disabled={!ready}
        >
          RN → 网页 发消息
        </Button>
        <Button onClick={() => ref.current?.navigate('https://example.com')} disabled={!ready}>
          导航 example.com
        </Button>
        <Button
          onClick={() =>
            ref
              .current?.evaluate('document.title')
              .then((t) => push(`[${ts()}] evaluate(document.title) → ${JSON.stringify(t)}`))
              .catch((e) => push(`[${ts()}] evaluate 失败: ${e}`))
          }
          disabled={!ready}
        >
          evaluate 取标题
        </Button>
        <Button onClick={() => push(`[${ts()}] getUrl: ${ref.current?.getUrl() ?? '—'}`)} disabled={!ready}>
          取当前 URL
        </Button>
      </View>

      {/* 声明式 <WebView>：内容三选一，其余 props/ref 全共享。 */}
      {mode === 'file' ? <WebView key="file" {...handle} file="assets/webview/bridge-demo.html">{<Loading token={token} />}</WebView> : null}
      {mode === 'html' ? <WebView key="html" {...handle} html={DEMO_HTML}>{<Loading token={token} />}</WebView> : null}
      {mode === 'src' ? <WebView key={'src-' + url} {...handle} src={url}>{<Loading token={token} />}</WebView> : null}

      {/* 事件日志：生命周期 / 桥接收发 / ref 命令回显。 */}
      <View style={{ width: '100%', minHeight: 96, padding: token.paddingXS, backgroundColor: token.colorFillSecondary, borderRadius: token.borderRadiusSM, gap: 2 }}>
        <Text style={{ fontSize: token.fontSizeSM, color: token.colorTextSecondary }}>事件日志（生命周期 / 桥接收发 / 命令）：</Text>
        {log.length === 0 ? (
          <Text style={{ fontSize: token.fontSizeSM, color: token.colorTextTertiary }}>（暂无事件）</Text>
        ) : (
          log.map((l, i) => (
            <Text key={i} style={{ fontSize: token.fontSizeSM, color: token.colorText }}>
              {l}
            </Text>
          ))
        )}
      </View>
    </View>
  );
}

/** 子面就绪前的占位（airspace：就绪后由 Chromium 子面覆盖）。 */
function Loading({ token }: { token: any }): React.ReactElement {
  return <Text style={{ fontSize: token.fontSize, color: token.colorTextTertiary }}>加载中…</Text>;
}

const DEMOS: DemoItem[] = [
  {
    name: '独立可选包 · view-only + JS 桥',
    desc: 'Chromium 渲染能力来自独立分支包，只把子面贴到主库窗口 HWND；内置注入式双向桥、请求/应答 RPC 与生命周期事件',
    node: <IntroBlock />,
    code: [
      '// 与主包同款 file: 本地依赖（引入方式）',
      '"react-native-flux-desktop-webview": "file:../react-native-flux-desktop-webview"',
      '',
      '# 主仓一条命令编排：编译 webview crate + 刷新 gallery 副本',
      'cd react-native-flux-desktop && npm run build:webview',
    ].join('\n'),
  },
  {
    name: '声明式 <WebView>（统一用法）',
    desc: '一个组件覆盖内容(html/file/src)、事件(onXxx)、主动命令(ref.postMessage/navigate/evaluate/getUrl)；请求/应答与双向桥全内建',
    node: <WebViewPlayground />,
    code: [
      "import { WebView, type WebViewHandle } from 'react-native-flux-desktop-webview/component';",
      '',
      'const ref = useRef<WebViewHandle>(null);',
      '<WebView',
      '  ref={ref}',
      '  file="assets/webview/bridge-demo.html"   // 随包本地文件；也可 html / src',
      '  style={{ width: "100%", height: 360 }}',
      '  onDomReady={() => ...}',
      '  onLoad={() => ...}                       // 就绪后 ref 命令可用',
      '  onNavigate={(u) => ...}                  // 主框导航',
      '  onNewWindow={(u) => ref.current?.navigate(u)} // 缺省已自动原地导航',
      '  onMessage={(d, rid) => {                 // 网页 fluxBridge.post/request 发来',
      '    if (rid && d.cmd === "getData") return { answer: 42 }; // 返回值自动应答 request',
      '  }}',
      '>',
      '  <Text>加载中…</Text>                      // 未就绪占位',
      '/>',
      '',
      "// ref.current: postMessage / navigate / loadHtml / openFile / evalJs / evaluate(→Promise) / getUrl / isReady / getId",
      "ref.current?.evaluate('document.title').then((t) => ...); // RN→网页读回求值结果",
      '',
      '// 网页侧（自动注入，无需 SDK）：',
      "//   window.fluxBridge.post(obj);            // 单向 → onMessage(data)",
      "//   window.fluxBridge.request(obj)          // 应答 → onMessage(data, requestId) 的返回值",
      "//     .then(result => ...);",
      '//   window.onFluxMessage = (d) => { ... };  // 收 RN postMessage',
    ].join('\n'),
  },
];

const API: ApiRow[] = [
  { name: '<WebView>（component 子路径）', desc: '【统一用法】声明式 React 外壳：props 驱动内容/事件，ref 主动命令；内部包命令式原生 API。子路径 react-native-flux-desktop-webview/component', type: 'ForwardRef<WebViewProps, WebViewHandle>', default: '–' },
  { name: '<WebView> props·内容', desc: 'html / file / src（优先级 html>file>src；本地内容走自定义协议，相对资源可加载）', type: '声明式', default: '–' },
  { name: '<WebView> props·事件', desc: 'onMessage(data, requestId?) / onDomReady / onLoad / onNavigate(url) / onClose / onError / onNewWindow(url) + style + children(占位)', type: '声明式', default: '–' },
  { name: '<WebView> ref 句柄', desc: 'postMessage / navigate / loadHtml / openFile / evalJs / evaluate(→Promise<any>) / getUrl / isReady / getId（RN→网页 主动命令口）', type: 'WebViewHandle', default: '–' },
  { name: '请求/应答 RPC', desc: '页面 fluxBridge.request(obj) 得 Promise；onMessage 带 requestId，其返回值（可为 Promise）由组件自动应答使页面 resolve', type: '双向', default: '–' },
  { name: '— 以下为内核原生 API（napi，命令式；一般经组件使用）—', desc: 'createView/createViewHtml/navigate/loadHtml/openFile/setBounds/postMessage/postReply/evalJs/evalJsResult/getViewUrl/closeView', type: '', default: '–' },
  { name: 'createView(hwnd, x, y, w, h, url, onEvent)', desc: '贴子面并加载 URL（http(s)/本地路径经协议）；(x,y,w,h) 相对客户区物理像素；返回 id', type: '(hwnd,x,y,w,h,url,cb) => number', default: '–' },
  { name: 'createViewHtml(hwnd, x, y, w, h, html, onEvent)', desc: '同 createView，内容为内联 HTML 字符串（经协议提供，相对资源按协议根解析）', type: '(hwnd,x,y,w,h,html,cb) => number', default: '–' },
  { name: 'postMessage(id, json)', desc: 'RN → 网页：投递到页面 window.onFluxMessage / fluxBridge.onMessage', type: '(id,json) => void', default: '–' },
  { name: 'postReply(id, requestId, result)', desc: 'RN 应答页面 fluxBridge.request：落地 window.__fluxReply，Promise resolve', type: '(id,rid,json) => void', default: '–' },
  { name: 'evalJsResult(id, script, cb)', desc: 'RN→网页执行 JS 并读回求值结果（异步 cb(err, jsonValue)）', type: '(id,script,cb) => void', default: '–' },
  { name: 'getViewUrl(id)', desc: '取子面当前 URL', type: '(id) => string', default: '–' },
  { name: 'evalJs(id, script)', desc: '逃生口：在该 view 内直接执行任意 JS（无返回值）', type: '(id,script) => void', default: '–' },
  { name: 'setBounds(id, x, y, w, h)', desc: '改子面区域（resize/重排时同步；物理像素）', type: '(id,x,y,w,h) => void', default: '–' },
  { name: 'closeView(id)', desc: '摘除子面并回抛 {type:closed}', type: '(id) => boolean', default: '–' },
  { name: 'onEvent 事件 type', desc: "生命周期与桥接：'domready' | 'loaded' | 'navigate' | 'closed' | 'newwindow' | 'ipc'（ipc 带 data，request 另带 requestId）", type: 'cb(err, json)', default: '–' },
  { name: '网页侧 window.fluxBridge', desc: 'post(obj) 单向发向 RN；request(obj)→Promise 请求应答；onMessage(fn) 收 RN；addEventListener("flux:lifecycle") 收生命周期', type: 'injected', default: '–' },
];

export function WebViewDemo(): React.ReactElement {
  return <DemoPage demos={DEMOS} api={API} />;
}
