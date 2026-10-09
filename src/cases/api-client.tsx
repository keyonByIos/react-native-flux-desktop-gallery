// cases/api-client.tsx —— 「API 调试台 API Client」案例（对标 Postman 精简版）。
// 左：请求集合（Saved Requests，点击载入）；右：URL 行（方法 Select + 地址 Input + 发送 Button）
//   → 参数/请求头预览 → 响应面板（状态码 Tag + 耗时 + 体积，Segmented 切 Body/Headers/Cookies，Body 用 JsonViewer 折叠树）。
// 秀能力：Select/Input/Button/Tag/Segmented 表单族 + JsonViewer 响应树 + 受控请求状态机（idle→sending→done）。
// 响应为本地确定性 mock（按方法+路径命中，无网络依赖、抓帧稳定），明暗 token 自适应。
import React from 'react';
import {
  View,
  Text,
  Select,
  Input,
  Button,
  Tag,
  Icon,
  Segmented,
  ScrollView,
  Pressable,
  JsonViewer,
  useToken,
  type SelectOption,
} from 'react-native-flux-desktop';

type FluxToken = ReturnType<typeof useToken>['token'];

const METHODS: SelectOption[] = [
  { label: 'GET', value: 'GET' },
  { label: 'POST', value: 'POST' },
  { label: 'PUT', value: 'PUT' },
  { label: 'PATCH', value: 'PATCH' },
  { label: 'DELETE', value: 'DELETE' },
];

interface Saved {
  key: string;
  method: string;
  name: string;
  url: string;
}

const COLLECTION: Saved[] = [
  { key: 's1', method: 'GET', name: '列出用户', url: 'https://api.flux.dev/v1/users' },
  { key: 's2', method: 'GET', name: '用户详情', url: 'https://api.flux.dev/v1/users/42' },
  { key: 's3', method: 'POST', name: '创建订单', url: 'https://api.flux.dev/v1/orders' },
  { key: 's4', method: 'GET', name: '行情快照', url: 'https://api.flux.dev/v1/market/ticker' },
  { key: 's5', method: 'DELETE', name: '删除会话', url: 'https://api.flux.dev/v1/sessions/9' },
  { key: 's6', method: 'GET', name: '服务健康检查', url: 'https://api.flux.dev/health' },
];

const METHOD_TINT: Record<string, string> = {
  GET: 'colorSuccess',
  POST: 'colorPrimary',
  PUT: 'colorWarning',
  PATCH: 'colorPurple',
  DELETE: 'colorError',
};

interface Resp {
  status: number;
  statusText: string;
  ok: boolean;
  ms: number;
  size: string;
  body: unknown;
  headers: [string, string][];
  cookies: [string, string][];
}

function hash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}

// 本地确定性 mock：按方法 + 末段路径命中，返回稳定的响应，无网络依赖
function mockResponse(method: string, url: string): Resp {
  const h = hash(method + url);
  const seg = url.replace(/\/+$/, '').split('/').filter(Boolean);
  const last = seg[seg.length - 1] ?? '';
  const hasId = /^\d+$/.test(last);
  const base: [string, string][] = [
    ['content-type', 'application/json; charset=utf-8'],
    ['x-request-id', `req_${(h % 100000).toString(16).padStart(5, '0')}`],
    ['server', 'flux-edge/2.4.1'],
    ['cache-control', 'no-store'],
  ];
  const cookies: [string, string][] = [
    ['session', `${h.toString(36)}.sig`],
    ['lang', 'zh-CN'],
  ];
  const ms = 40 + (h % 180);

  if (url.endsWith('/health')) {
    return {
      status: 200, statusText: 'OK', ok: true, ms, size: '96 B',
      body: { status: 'up', uptime_s: 864213, version: '2.4.1', checks: { db: 'ok', cache: 'ok', queue: 'ok' } },
      headers: base, cookies,
    };
  }
  if (url.includes('/users')) {
    if (hasId) {
      const id = Number(last);
      return {
        status: 200, statusText: 'OK', ok: true, ms, size: '231 B',
        body: { id, name: `user_${id}`, email: `user${id}@flux.dev`, role: id % 2 ? 'editor' : 'viewer', status: 'active', created_at: '2026-03-1' + (id % 9) + 'T08:12:00Z', profile: { login_count: 40 + (id % 60), storage_mb: 128 + (id % 512), two_factor: id % 3 === 0 } },
        headers: base, cookies,
      };
    }
    return {
      status: 200, statusText: 'OK', ok: true, ms, size: '1.4 KB',
      body: { total: 200, page: 1, page_size: 5, items: Array.from({ length: 5 }, (_, i) => ({ id: i + 1, name: `user_${i + 1}`, role: i % 2 ? 'editor' : 'viewer', status: i === 4 ? 'pending' : 'active' })) },
      headers: base, cookies,
    };
  }
  if (url.includes('/orders')) {
    return {
      status: 201, statusText: 'Created', ok: true, ms, size: '318 B',
      body: { order_id: `ord_${h.toString(36).slice(0, 8)}`, status: 'paid', currency: 'CNY', amount: 19900 + (h % 50000), items: [{ sku: 'FLUX-PRO-1Y', qty: 1, price: 19900 }], created_at: '2026-09-29T10:24:31Z' },
      headers: [...base, ['location', `/v1/orders/${h % 9000}`]], cookies,
    };
  }
  if (url.includes('/market')) {
    return {
      status: 200, statusText: 'OK', ok: true, ms, size: '512 B',
      body: { symbol: 'FLUX/USDT', last: 2.8473, change_24h: ((h % 2000) - 1000) / 1000, high: 3.02, low: 2.71, volume: 1284500.55, quotes: { bid: 2.8471, ask: 2.8475, spread: 0.0004 } },
      headers: base, cookies,
    };
  }
  if (url.includes('/sessions') && method === 'DELETE') {
    return {
      status: 204, statusText: 'No Content', ok: true, ms, size: '0 B',
      body: { message: '资源已删除（204 No Content）', deleted: last || '9' },
      headers: base, cookies: [],
    };
  }
  if (method === 'POST' || method === 'PUT' || method === 'PATCH') {
    return {
      status: 200, statusText: 'OK', ok: true, ms, size: '142 B',
      body: { ok: true, echo: { method, path: seg.slice(2).join('/') }, updated_at: '2026-09-29T10:30:00Z' },
      headers: base, cookies,
    };
  }
  return {
    status: 404, statusText: 'Not Found', ok: false, ms, size: '78 B',
    body: { error: 'not_found', message: `未匹配到路由 ${method} ${url}`, docs: 'https://api.flux.dev/errors#404' },
    headers: base, cookies,
  };
}

function methodColor(token: FluxToken, m: string): string {
  const key = METHOD_TINT[m] ?? 'colorPrimary';
  return (token[key as keyof FluxToken] as string) ?? token.colorPrimary;
}

function KvRow(props: { k: string; v: string; token: FluxToken }): React.ReactElement {
  const { token } = props;
  return (
    <View style={{ flexDirection: 'row', paddingVertical: token.paddingXXS, gap: token.marginSM, borderBottomWidth: 1, borderColor: token.colorBorderSecondary }}>
      <Text style={{ width: 180, fontSize: token.fontSizeSM, color: token.colorTextSecondary, fontFamily: 'monospace' }}>{props.k}</Text>
      <Text style={{ flex: 1, minWidth: 0, fontSize: token.fontSizeSM, color: token.colorText, fontFamily: 'monospace' }}>{props.v}</Text>
    </View>
  );
}

function SavedItem(props: { s: Saved; active: boolean; token: FluxToken; onPress: () => void }): React.ReactElement {
  const { token, s } = props;
  return (
    <Pressable
      onPress={props.onPress}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: token.marginXS,
        paddingHorizontal: token.paddingSM,
        paddingVertical: token.paddingXS,
        borderRadius: token.borderRadius,
        backgroundColor: props.active ? token.colorPrimaryBg : 'transparent',
      }}
    >
      <Text style={{ width: 52, fontSize: 11, fontWeight: '700', color: methodColor(token, s.method) }}>{s.method}</Text>
      <Text style={{ flex: 1, minWidth: 0, fontSize: token.fontSizeSM, color: props.active ? token.colorPrimary : token.colorText }} numberOfLines={1}>{s.name}</Text>
    </Pressable>
  );
}

export function ApiClientDemo(): React.ReactElement {
  const { token } = useToken();
  const [savedKey, setSavedKey] = React.useState('s1');
  const [method, setMethod] = React.useState('GET');
  const [url, setUrl] = React.useState('https://api.flux.dev/v1/users');
  const [tab, setTab] = React.useState('Body');
  const [state, setState] = React.useState<'idle' | 'sending' | 'done'>('done');
  const [resp, setResp] = React.useState<Resp>(() => mockResponse('GET', 'https://api.flux.dev/v1/users'));

  const send = () => {
    setState('sending');
    setTimeout(() => {
      setResp(mockResponse(method, url));
      setState('done');
    }, 450);
  };

  const loadSaved = (s: Saved) => {
    setSavedKey(s.key);
    setMethod(s.method);
    setUrl(s.url);
    setState('sending');
    setTimeout(() => {
      setResp(mockResponse(s.method, s.url));
      setState('done');
    }, 450);
  };

  const params: [string, string][] = url.includes('users') && !/\/\d+$/.test(url) ? [['page', '1'], ['page_size', '5'], ['sort', '-created_at']] : [['format', 'json']];
  const reqHeaders: [string, string][] = [['Authorization', 'Bearer flx_live_••••••••3f9a'], ['Accept', 'application/json'], ['Content-Type', 'application/json']];

  return (
    <View style={{ flex: 1, flexDirection: 'row', backgroundColor: token.colorBgLayout }}>
      {/* 左：请求集合 */}
      <View style={{ width: 220, flexShrink: 0, borderRightWidth: token.lineWidth, borderColor: token.colorBorderSecondary, backgroundColor: token.colorBgContainer, paddingTop: token.paddingMD }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: token.marginXS, paddingHorizontal: token.paddingMD, paddingBottom: token.marginXS }}>
          <Icon name="folder" size={14} color={token.colorTextSecondary} />
          <Text style={{ fontSize: token.fontSizeSM, fontWeight: '600', color: token.colorTextSecondary }}>请求集合</Text>
        </View>
        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingHorizontal: token.paddingXS, gap: 2 }}>
          {COLLECTION.map((s) => (
            <SavedItem key={s.key} s={s} active={s.key === savedKey} token={token} onPress={() => loadSaved(s)} />
          ))}
        </ScrollView>
      </View>

      {/* 右：主区 */}
      <View style={{ flex: 1, minWidth: 0, padding: token.paddingLG, gap: token.margin }}>
        {/* URL 行 */}
        <View style={{ flexDirection: 'row', gap: token.marginSM }}>
          <Select
            options={METHODS}
            value={method}
            onChange={(v) => setMethod(v as string)}
            style={{ width: 110 }}
          />
          <Input value={url} onChange={setUrl} placeholder="输入请求 URL" style={{ flex: 1, minWidth: 0 }} prefix={<Icon name="globe" size={14} color={token.colorTextTertiary} />} />
          <Button type="primary" onPress={send} loading={state === 'sending'}>
            {state === 'sending' ? '发送中' : '发送'}
          </Button>
        </View>

        {/* 请求预览：Params / Headers */}
        <View style={{ flexDirection: 'row', gap: token.margin }}>
          <View style={{ flex: 1, minWidth: 0, padding: token.paddingMD, borderRadius: token.borderRadiusLG, borderWidth: token.lineWidth, borderColor: token.colorBorderSecondary, backgroundColor: token.colorBgContainer }}>
            <Text style={{ fontSize: token.fontSize, fontWeight: '600', color: token.colorText, marginBottom: token.marginXS }}>Params</Text>
            {params.map(([k, v]) => <KvRow key={k} k={k} v={v} token={token} />)}
          </View>
          <View style={{ flex: 1, minWidth: 0, padding: token.paddingMD, borderRadius: token.borderRadiusLG, borderWidth: token.lineWidth, borderColor: token.colorBorderSecondary, backgroundColor: token.colorBgContainer }}>
            <Text style={{ fontSize: token.fontSize, fontWeight: '600', color: token.colorText, marginBottom: token.marginXS }}>Headers</Text>
            {reqHeaders.slice(0, 3).map(([k, v]) => <KvRow key={k} k={k} v={v} token={token} />)}
          </View>
        </View>

        {/* 响应面板 */}
        <View style={{ flex: 1, minHeight: 0, borderRadius: token.borderRadiusLG, borderWidth: token.lineWidth, borderColor: token.colorBorderSecondary, backgroundColor: token.colorBgContainer }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: token.marginSM, paddingHorizontal: token.paddingMD, paddingVertical: token.paddingSM, borderBottomWidth: token.lineWidth, borderColor: token.colorBorderSecondary }}>
            <Text style={{ fontSize: token.fontSize, fontWeight: '600', color: token.colorText }}>响应</Text>
            {state === 'sending' ? (
              <Tag color="processing">Sending…</Tag>
            ) : (
              <Tag color={resp.ok ? 'success' : 'error'}>{resp.status} {resp.statusText}</Tag>
            )}
            <Text style={{ fontSize: token.fontSizeSM, color: token.colorTextSecondary }}>耗时 {resp.ms} ms</Text>
            <Text style={{ fontSize: token.fontSizeSM, color: token.colorTextSecondary }}>大小 {resp.size}</Text>
            <View style={{ flex: 1 }} />
            <Segmented value={tab} onChange={(v) => setTab(v as string)} options={['Body', 'Headers', 'Cookies']} size="small" />
          </View>
          <View style={{ flex: 1, minHeight: 0, padding: token.paddingMD }}>
            {tab === 'Body' ? (
              <JsonViewer data={resp.body} defaultExpandedDepth={3} fontSize={12} />
            ) : tab === 'Headers' ? (
              <ScrollView style={{ flex: 1 }}>
                {resp.headers.map(([k, v]) => <KvRow key={k} k={k} v={v} token={token} />)}
              </ScrollView>
            ) : (
              <ScrollView style={{ flex: 1 }}>
                {resp.cookies.length === 0 ? (
                  <Text style={{ fontSize: token.fontSizeSM, color: token.colorTextTertiary }}>该响应未设置 Cookie</Text>
                ) : (
                  resp.cookies.map(([k, v]) => <KvRow key={k} k={k} v={v} token={token} />)
                )}
              </ScrollView>
            )}
          </View>
        </View>
      </View>
    </View>
  );
}
