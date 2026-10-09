import React from 'react';
import { View, Text, Pressable, Icon, Tag, Button, Input, Modal, QRCode, Alert, Segmented, message, useToken } from 'react-native-flux-desktop';
import { CoinIcon } from 'react-native-flux-desktop-web3';
import {
  CHAINS,
  CHAIN_MAP,
  PRICES,
  RPC_HOST,
  USD_CNY_RATE,
  fetchBalances,
  fetchPrices,
  mockBalances,
  totalUsd,
  isAddress,
  genSecurityCode,
  formatMoney,
  shortAddress,
  fmt,
  type DemoWallet,
  type BalResult,
} from './wallet-lib';
// 加密解密 / HD 派生 / 真实签名广播 / KV 持久化（参照 Electron wallet-service）
import {
  ensureSeed,
  saveWallets,
  createWallet,
  importFromPrivateKey,
  importFromMnemonic,
  decryptPrivateKey,
  sendTransaction,
  type StoredWallet,
} from './wallet-crypto';
// 系统剪贴板（本自绘栈无 navigator.clipboard，走 napi addon 的 arboard 门面）
import { readClipboard, writeClipboard } from 'react-native-flux-desktop/dist/src/window/clipboard';

type Currency = 'USDT' | 'CNY';
type CreateTab = 'create' | 'pk' | 'mnemonic';
type SendStep = 'form' | 'confirm' | 'success';

const LOGO_COLORS: Record<string, string> = {
  BTC: '#F7931A', ETH: '#627EEA', BNB: '#F0B90B', MATIC: '#8247E5',
  USDT: '#26A17B', USDC: '#2775CA', ARB: '#28A0F0',
};

// ---------- 颜色工具（供渐变 Panel 从主题主色派生色阶） ----------
/** #rgb / #rrggbb → {r,g,b}；解析失败返回黑 */
function parseHex(hex: string): { r: number; g: number; b: number } {
  let s = (hex || '').trim().replace(/^#/, '');
  if (s.length === 3) s = s.split('').map((c) => c + c).join('');
  const n = parseInt(s.slice(0, 6), 16);
  if (Number.isNaN(n)) return { r: 0, g: 0, b: 0 };
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}
function toHex(r: number, g: number, b: number): string {
  const h = (v: number): string => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0');
  return `#${h(r)}${h(g)}${h(b)}`;
}
/** 两色线性插值（t∈[0,1]） */
function mixHex(a: string, b: string, t: number): string {
  const A = parseHex(a); const B = parseHex(b);
  return toHex(A.r + (B.r - A.r) * t, A.g + (B.g - A.g) * t, A.b + (B.b - A.b) * t);
}
/** 变暗(amt<0 向黑)/变亮(amt>0 向白) */
function shadeHex(hex: string, amt: number): string {
  return amt < 0 ? mixHex(hex, '#000000', -amt) : mixHex(hex, '#ffffff', amt);
}
/** 在等距色阶上取 t∈[0,1] 处的插值色（rgba 字符串） */
function sampleStops(colors: string[], t: number): string {
  if (colors.length === 0) return 'rgba(0,0,0,0)';
  if (colors.length === 1) return colors[0];
  const c = Math.min(Math.max(t, 0), 1) * (colors.length - 1);
  const i = Math.min(Math.floor(c), colors.length - 2);
  const f = c - i;
  return mixHex(colors[i], colors[i + 1], f);
}

// ------------------------------------------------------------
// 可复用小组件
// ------------------------------------------------------------

/** 卡片外壳：gradient=true 时用「主题主色派生的斜向渐变 + 装饰圆」作背景（参照 demos/gradient 的 Hero 卡），
 *  本自研栈 View 无原生 CSS 渐变，沿用「平行铺条 + 容器旋转 + overflow 裁切」伪造；尺寸用 onLayout 实测以适配响应式宽度。 */
function Panel(props: {
  gradient?: boolean;
  children: React.ReactNode;
  style?: Record<string, any>;
}): React.ReactElement {
  const { token } = useToken();
  const { gradient, children, style } = props;
  const [size, setSize] = React.useState({ w: 0, h: 0 });

  if (!gradient) {
    return (
      <View
        style={{
          borderRadius: token.borderRadiusLG,
          borderWidth: token.lineWidth,
          borderColor: token.colorBorderSecondary,
          backgroundColor: token.colorBgContainer,
          padding: token.paddingMD,
          ...style,
        }}
      >
        {children}
      </View>
    );
  }

  // 主题主色 → 三色阶（深→主→亮），随主题变化
  const base = token.colorPrimary;
  const stops = [shadeHex(base, -0.46), shadeHex(base, -0.1), mixHex(base, '#ffffff', 0.18)];
  const angle = 30;
  const steps = 48;
  const D = Math.ceil(Math.sqrt(size.w * size.w + size.h * size.h));
  const barW = D / steps;
  const bars: React.ReactNode[] = [];
  if (size.w > 0 && size.h > 0) {
    for (let i = 0; i < steps; i++) {
      bars.push(
        <View
          key={i}
          style={{ position: 'absolute', left: Math.floor(i * barW), top: 0, width: barW + 1, height: D, backgroundColor: sampleStops(stops, (i + 0.5) / steps) }}
        />,
      );
    }
  }

  return (
    <View
      onLayout={(e: any) => {
        const { width, height } = e.nativeEvent.layout;
        if (width && height) setSize((s) => (s.w !== width || s.h !== height ? { w: width, h: height } : s));
      }}
      style={{
        borderRadius: token.borderRadiusLG,
        overflow: 'hidden',
        position: 'relative',
        backgroundColor: stops[1],
        padding: token.paddingMD,
      }}
    >
      {/* 渐变铺条层（旋转内层，居中绕自身中心倾斜） */}
      <View
        style={{
          position: 'absolute',
          width: D,
          height: D,
          left: (size.w - D) / 2,
          top: (size.h - D) / 2,
          transform: [{ rotate: `${-angle}deg` }],
          transformOrigin: '50% 50%',
        }}
      >
        {bars}
      </View>
      {/* 装饰光晕圆 */}
      <View style={{ position: 'absolute', right: -30, top: -30, width: 130, height: 130, borderRadius: 65, backgroundColor: 'rgba(255,255,255,0.12)' }} />
      <View style={{ position: 'absolute', right: 24, bottom: -48, width: 96, height: 96, borderRadius: 48, backgroundColor: 'rgba(255,255,255,0.08)' }} />
      {/* 内容层（正常流，决定卡片高度；后绘制故浮于渐变之上） */}
      <View style={{ position: 'relative', ...style }}>{children}</View>
    </View>
  );
}

/** 图标小圆钮（刷新 / 隐藏余额 / 复制）。 */
function IconBtn(props: {
  name: string;
  size?: number;
  onPress: () => void;
  active?: boolean;
  spin?: boolean;
}): React.ReactElement {
  const { token } = useToken();
  const { name, size = 14, onPress, active, spin } = props;
  return (
    <Pressable
      onPress={onPress}
      style={{
        width: 28,
        height: 28,
        borderRadius: token.borderRadius,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: active ? token.colorPrimaryBg : token.colorFillTertiary,
        cursor: 'pointer',
        transform: [{ rotate: spin ? '40deg' : '0deg' }],
      }}
    >
      <Icon name={name} size={size} color={active ? token.colorPrimary : token.colorTextSecondary} strokeWidth={2} />
    </Pressable>
  );
}

/** 链 / 资产 选择胶囊（对应 Electron 的 .ws-chain / .ws-asset 按钮）。 */
function Chip(props: {
  label: string;
  active: boolean;
  color?: string;
  onPress: () => void;
}): React.ReactElement {
  const { token } = useToken();
  const { label, active, color, onPress } = props;
  const c = color || token.colorPrimary;
  return (
    <Pressable
      onPress={onPress}
      style={{
        paddingHorizontal: token.paddingSM,
        paddingVertical: 6,
        borderRadius: token.borderRadius,
        borderWidth: token.lineWidth,
        borderColor: active ? c : token.colorBorder,
        backgroundColor: active ? `${c}26` : 'transparent',
        cursor: 'pointer',
      }}
    >
      <Text style={{ fontSize: token.fontSizeSM, fontWeight: '600', color: active ? c : token.colorText }}>{label}</Text>
    </Pressable>
  );
}

/** 收款二维码展示：白底安静区 + 深色模块 + 中心钱包徽标 + 圆角卡片，避免与暗色卡片背景冲突。 */
function QrCard(props: { value: string; size?: number }): React.ReactElement {
  const { token } = useToken();
  const { value, size = 150 } = props;
  const badge = Math.round(size / 4.5);
  return (
    <View
      style={{
        padding: token.padding,
        backgroundColor: '#FFFFFF',
        borderRadius: token.borderRadiusLG + 4,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <QRCode
        value={value}
        size={size}
        bordered={false}
        color="#101828"
        bgColor="#FFFFFF"
        iconSize={badge}
        icon={
          <View style={{ width: badge, height: badge, borderRadius: badge / 2, alignItems: 'center', justifyContent: 'center', backgroundColor: '#26365C' }}>
            <Icon name="wallet" size={Math.round(badge * 0.56)} color="#FFFFFF" />
          </View>
        }
      />
    </View>
  );
}

// ------------------------------------------------------------
// 主组件
// ------------------------------------------------------------

export function WalletDemo(): React.ReactElement {
  const { token } = useToken();
  const [msgApi, msgHolder] = message.useMessage();

  // ---- 数据（对应 WalletProvider：钱包列表 + 各钱包余额 + 全局估值）----
  const [wallets, setWallets] = React.useState<StoredWallet[]>(() => ensureSeed());
  const [balances, setBalances] = React.useState<Record<string, BalResult>>(() => {
    const map: Record<string, BalResult> = {};
    for (const w of wallets) map[w.id] = mockBalances(w.address);
    return map;
  });
  const [live, setLive] = React.useState(false);
  const [refreshing, setRefreshing] = React.useState(false);

  // ---- 实时价格（参照 crypto-live：币安公共 REST；失败降级静态 PRICES）----
  const [prices, setPrices] = React.useState<Record<string, number>>(PRICES);
  const [priceLive, setPriceLive] = React.useState(false);

  const [selectedId, setSelectedId] = React.useState<string>(() => wallets[0]?.id ?? '');
  const [selectedChain, setSelectedChain] = React.useState<number>(CHAINS[0].key);
  const [currency, setCurrency] = React.useState<Currency>('USDT');
  const [hideBal, setHideBal] = React.useState(false);

  // ---- 弹窗 ----
  const [createOpen, setCreateOpen] = React.useState(false);
  const [recvOpen, setRecvOpen] = React.useState(false);
  const [sendOpen, setSendOpen] = React.useState(false);

  // ---- 创建/导入表单 ----
  const [cTab, setCTab] = React.useState<CreateTab>('create');
  const [cName, setCName] = React.useState('');
  const [pkInput, setPkInput] = React.useState('');
  const [mnPhrase, setMnPhrase] = React.useState('');
  const [newMnemonic, setNewMnemonic] = React.useState('');
  const [pendingCreate, setPendingCreate] = React.useState<StoredWallet | null>(null);
  const [cError, setCError] = React.useState('');

  // ---- 发送表单 ----
  const [sendChain, setSendChain] = React.useState<number>(CHAINS[0].key);
  const [sendToken, setSendToken] = React.useState<string | null>(null); // null = 原生币
  const [toAddr, setToAddr] = React.useState('');
  const [amount, setAmount] = React.useState('');
  const [sError, setSError] = React.useState('');
  const [step, setStep] = React.useState<SendStep>('form');
  const [secCode, setSecCode] = React.useState('');
  const [codeInput, setCodeInput] = React.useState('');
  const [txHash, setTxHash] = React.useState('');
  const [copied, setCopied] = React.useState(false);
  const [sending, setSending] = React.useState(false);

  const selected = wallets.find((w) => w.id === selectedId) || wallets[0] || null;
  const selBal = selected ? balances[selected.id] : null;
  const chainDef = CHAIN_MAP[selectedChain];

  const usdOf = (id: string): number => (balances[id] ? totalUsd(balances[id], prices) : 0);
  const totalUsdAll = wallets.reduce((s, w) => s + usdOf(w.id), 0);

  // 金额展示（USD/CNY 切换 + 隐藏余额）
  const money = (usd: number): { main: string; sub: string; prefix: string } => {
    const cny = usd * USD_CNY_RATE;
    const hidden = hideBal;
    if (currency === 'USDT') {
      return { prefix: '$', main: hidden ? '****' : formatMoney(usd), sub: `¥${hidden ? '****' : formatMoney(cny)}` };
    }
    return { prefix: '¥', main: hidden ? '****' : formatMoney(cny), sub: `$${hidden ? '****' : formatMoney(usd)}` };
  };

  // 当前链资产明细（原生币 + 代币，仅余额 > 0）
  const chainAssets = (): { symbol: string; balance: number; valueUsd: number }[] => {
    if (!selBal) return [];
    const items: { symbol: string; balance: number; valueUsd: number }[] = [];
    const nativeNum = parseFloat(selBal.native[selectedChain] || '0');
    if (nativeNum > 0) items.push({ symbol: chainDef.symbol, balance: nativeNum, valueUsd: nativeNum * (prices[chainDef.symbol] || 0) });
    for (const t of selBal.tokens[selectedChain] || []) {
      const amt = parseFloat(t.balance);
      if (amt > 0) items.push({ symbol: t.symbol, balance: amt, valueUsd: amt * (prices[t.symbol] || 0) });
    }
    return items;
  };

  // ---- 加载 / 刷新余额（对所有钱包）----
  const loadAll = React.useCallback(async (list: DemoWallet[]): Promise<void> => {
    setRefreshing(true);
    try {
      const results: Record<string, BalResult> = {};
      let anyLive = false;
      const [priceRes] = await Promise.all([
        fetchPrices(),
        Promise.all(
          list.map(async (w) => {
            const r = await fetchBalances(w.address);
            if (r.live) anyLive = true;
            results[w.id] = r.live ? r : mockBalances(w.address);
          })
        ),
      ]);
      setPrices(priceRes.prices);
      setPriceLive(priceRes.live);
      setBalances(results);
      setLive(anyLive);
      if (!anyLive) msgApi.warning('测试节点不可达，已降级为本地模拟余额');
    } catch {
      const map: Record<string, BalResult> = {};
      for (const w of list) map[w.id] = mockBalances(w.address);
      setBalances(map);
      setLive(false);
    } finally {
      setRefreshing(false);
    }
  }, [msgApi]);

  React.useEffect(() => {
    void loadAll(wallets);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---- 币价轮询：每 30s 刷一次实时价（不重复拉余额）----
  React.useEffect(() => {
    const id = setInterval(() => {
      void fetchPrices().then((r) => {
        setPrices(r.prices);
        setPriceLive(r.live);
      });
    }, 30_000);
    return (): void => clearInterval(id);
  }, []);

  const copyAddr = (addr: string): void => {
    if (!addr) return;
    if (writeClipboard(addr)) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      msgApi.success('已复制地址');
    } else {
      msgApi.error('复制失败：剪贴板不可用');
    }
  };

  // 粘贴：读系统剪贴板填入收款地址
  const pasteAddr = (): void => {
    const text = readClipboard().trim();
    if (!text) {
      msgApi.info('剪贴板为空');
      return;
    }
    setToAddr(text);
    setSError('');
  };

  // ---- 创建 / 导入 ----
  const openCreate = (): void => {
    setCTab('create');
    setCName('');
    setPkInput('');
    setMnPhrase('');
    setNewMnemonic('');
    setPendingCreate(null);
    setCError('');
    setCreateOpen(true);
  };

  // 写入钱包列表 + 持久化（KV）+ 拉余额 + 关闭弹窗
  const commitWallet = (w: StoredWallet): void => {
    const next = [...wallets, w];
    setWallets(next);
    saveWallets(next);
    setSelectedId(w.id);
    setBalances((p) => ({ ...p, [w.id]: mockBalances(w.address) }));
    void fetchBalances(w.address).then((r) => {
      if (r.live) setBalances((p) => ({ ...p, [w.id]: r }));
    });
    setCreateOpen(false);
    setNewMnemonic('');
    setPendingCreate(null);
  };

  // 「创建」Tab：真实生成随机助记词钱包（BIP39 + m/44'/60'/0'/0/0），暂存待备份确认
  const onGenerate = (): void => {
    if (!cName.trim()) {
      setCError('请输入钱包名称');
      return;
    }
    try {
      const { wallet, mnemonic } = createWallet(cName);
      setPendingCreate(wallet);
      setNewMnemonic(mnemonic);
      setCError('');
    } catch (e: any) {
      setCError('生成失败：' + (e?.message || String(e)));
    }
  };

  // 备份确认后落盘
  const onFinishCreate = (): void => {
    if (pendingCreate) commitWallet(pendingCreate);
  };

  // 「私钥导入 / 助记词导入」Tab：真实派生地址并加密存储
  const doCreate = (): void => {
    if (!cName.trim()) {
      setCError('请输入钱包名称');
      return;
    }
    try {
      if (cTab === 'pk') {
        const hex = pkInput.trim().replace(/^0x/, '');
        if (!/^[0-9a-fA-F]{64}$/.test(hex)) {
          setCError('私钥格式不正确（64 位十六进制）');
          return;
        }
        const w = importFromPrivateKey(pkInput, cName);
        commitWallet(w);
        msgApi.success(`已导入 ${shortAddress(w.address, 6, 4)}（私钥已加密存储）`);
        return;
      }
      const words = mnPhrase.trim().split(/\s+/).filter(Boolean);
      if (words.length !== 12 && words.length !== 24) {
        setCError('助记词应为 12 或 24 个单词');
        return;
      }
      const { wallet: w } = importFromMnemonic(mnPhrase, cName);
      commitWallet(w);
      msgApi.success(`已从助记词派生 ${shortAddress(w.address, 6, 4)}`);
    } catch (e: any) {
      setCError('操作失败：' + (e?.message || String(e)));
    }
  };

  // ---- 发送 ----
  const selAssetBalance = (): number => {
    if (!selBal || !selected) return 0;
    if (sendToken === null) return parseFloat(selBal.native[sendChain] || '0');
    const t = (selBal.tokens[sendChain] || []).find((x) => x.symbol === sendToken);
    return t ? parseFloat(t.balance) : 0;
  };
  const sendSymbol = (): string => sendToken || CHAIN_MAP[sendChain].symbol;

  const openSend = (): void => {
    if (!selected) return;
    setSendChain(selectedChain);
    setSendToken(null);
    setToAddr('');
    setAmount('');
    setSError('');
    setStep('form');
    setCodeInput('');
    setSendOpen(true);
  };

  const onSendClick = (): void => {
    if (!toAddr.trim()) {
      setSError('请输入收款地址');
      return;
    }
    if (!isAddress(toAddr)) {
      setSError('收款地址格式不正确（0x + 40 位 hex）');
      return;
    }
    const num = parseFloat(amount);
    if (!num || num <= 0) {
      setSError('金额必须大于 0');
      return;
    }
    if (num > selAssetBalance()) {
      setSError('余额不足');
      return;
    }
    setSecCode(genSecurityCode());
    setCodeInput('');
    setStep('confirm');
  };

  const onConfirmSend = async (): Promise<void> => {
    if (codeInput !== secCode || !selected) return;
    setSending(true);
    setSError('');
    try {
      const pk = decryptPrivateKey(selected);
      const hash = await sendTransaction({
        privateKey: pk,
        chainKey: sendChain,
        toAddress: toAddr.trim(),
        amount,
        tokenSymbol: sendToken ?? undefined,
      });
      setTxHash(hash);
      setStep('success');
      void loadAll(wallets);
    } catch (e: any) {
      setSError('广播失败：' + (e?.message || String(e)));
      setStep('form');
    } finally {
      setSending(false);
    }
  };

  const closeSend = (): void => {
    setSendOpen(false);
    setStep('form');
  };

  // ============================================================
  // 渲染
  // ============================================================

  const ov = money(totalUsdAll);
  const selUsd = selected ? usdOf(selected.id) : 0;
  const selMoney = money(selUsd);

  const assetList = chainAssets();

  // ---------- 左：总览 + 列表 ----------
  const overviewCard = (
    <Panel gradient style={{ gap: token.marginXS }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: token.marginXS }}>
          <View style={{ width: 24, height: 24, borderRadius: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.14)' }}>
            <Icon name="wallet" size={14} color="#DCE6FF" />
          </View>
          <Text style={{ fontSize: token.fontSize, fontWeight: '600', color: '#EAF0FF' }}>我的钱包</Text>
        </View>
        <View style={{ flexDirection: 'row', gap: token.marginXS }}>
          <IconBtn name="sync" onPress={() => void loadAll(wallets)} spin={refreshing} />
          <IconBtn name={hideBal ? 'eyeInvisible' : 'eye'} onPress={() => setHideBal((v) => !v)} active={hideBal} />
        </View>
      </View>

      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: token.marginSM }}>
        <Text style={{ fontSize: token.fontSizeSM, color: '#9FB0D6' }}>总资产估值</Text>
        <Pressable onPress={() => setCurrency(currency === 'USDT' ? 'CNY' : 'USDT')} style={{ flexDirection: 'row', alignItems: 'center', gap: 4, cursor: 'pointer' }}>
          <Text style={{ fontSize: token.fontSizeSM, color: '#C7D3EF' }}>{currency}</Text>
          <Icon name="send" size={11} color="#C7D3EF" />
        </Pressable>
      </View>

      <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 6 }}>
        <Text style={{ fontSize: token.fontSizeLG, color: '#EAF0FF', marginBottom: 6 }}>{ov.prefix}</Text>
        <Text style={{ fontSize: 34, fontWeight: '700', color: '#FFFFFF', lineHeight: 40 }}>{ov.main}</Text>
      </View>
      <Text style={{ fontSize: token.fontSizeSM, color: '#9FB0D6' }}>{ov.sub}</Text>
      <Text style={{ fontSize: token.fontSizeSM, color: live ? '#7FD6A6' : '#E6C07B', marginTop: 2 }}>
        {live ? `测试节点实时 · ${RPC_HOST}` : '节点不可达 · 本地模拟'}
      </Text>  
    </Panel>
  );

  const walletList = (
    <View style={{ gap: token.marginSM }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: token.marginXS }}>
          <View style={{ width: 3, height: 14, borderRadius: 2, backgroundColor: token.colorPrimary }} />
          <Text style={{ fontSize: token.fontSize, fontWeight: '600', color: token.colorText }}>钱包列表</Text>
        </View>
        <Text style={{ fontSize: token.fontSizeSM, color: token.colorTextTertiary }}>{wallets.length} 个</Text>
      </View>

      {wallets.map((w) => {
        const active = w.id === selectedId;
        const usd = usdOf(w.id);
        return (
          <Pressable
            key={w.id}
            onPress={() => setSelectedId(w.id)}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: token.marginSM,
              padding: token.paddingSM,
              borderRadius: token.borderRadiusLG,
              borderWidth: token.lineWidth,
              borderColor: active ? token.colorPrimary : token.colorBorderSecondary,
              backgroundColor: active ? token.colorPrimaryBg : token.colorBgContainer,
              cursor: 'pointer',
            }}
          >
            <View style={{ width: 34, height: 34, borderRadius: token.borderRadius, alignItems: 'center', justifyContent: 'center', backgroundColor: active ? token.colorPrimary : token.colorFillTertiary }}>
              <Icon name="wallet" size={17} color={active ? token.colorTextLightSolid : token.colorTextSecondary} />
            </View>
            <View style={{ flex: 1, gap: 2 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: token.marginXS }}>
                <Text style={{ fontSize: token.fontSize, fontWeight: '600', color: token.colorText }}>{w.name}</Text>
                <Tag color={w.source === 'imported' ? 'default' : w.source === 'created' ? 'blue' : 'default'}>
                  {w.source === 'imported' ? '导入' : '未备份'}
                </Tag>
                <View style={{ flex: 1 }} />
                <Text style={{ fontSize: token.fontSizeSM, color: token.colorText }}>{hideBal ? '****' : `$${formatMoney(usd)}`}</Text>
              </View>
              <Text style={{ fontSize: token.fontSizeSM, color: token.colorTextTertiary, fontFamily: 'monospace' }}>{shortAddress(w.address)}</Text>
            </View>
          </Pressable>
        );
      })}

      <Button type="primary" block icon={<Icon name="plus" size={token.fontSize} />} onPress={openCreate}>
        创建 / 导入
      </Button>
    </View>
  );

  // ---------- 右：选中钱包详情 ----------
  const rightPanel = selected ? (
    <View style={{ flex: 3, gap: token.marginMD, minWidth: 380 }}>
      <Panel style={{ gap: token.marginXXS }}>
        <Text style={{ fontSize: token.fontSize, fontWeight: '600', color: token.colorText }}>{selected.name}</Text>
        <Text style={{ fontSize: token.fontSizeSM, color: token.colorTextTertiary, marginTop: 4 }}>资产估值</Text>
        <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 6 }}>
          <Text style={{ fontSize: token.fontSizeLG, color: token.colorText, marginBottom: 6 }}>{selMoney.prefix}</Text>
          <Text style={{ fontSize: 30, fontWeight: '700', color: token.colorText, lineHeight: 36 }}>{selMoney.main}</Text>
        </View>
        <Text style={{ fontSize: token.fontSizeSM, color: token.colorTextTertiary }}>{selMoney.sub}</Text>
      </Panel>

      <View style={{ height: token.lineWidth, backgroundColor: token.colorBorderSecondary }} />

      <Segmented
        value={String(selectedChain)}
        onChange={(v) => setSelectedChain(Number(v))}
        options={CHAINS.map((c) => ({ label: c.symbol, value: String(c.key) }))}
      />

      <View style={{ gap: token.marginXXS }}>
        {assetList.map((a) => {
          const val = currency === 'USDT' ? a.valueUsd : a.valueUsd * USD_CNY_RATE;
          const prefix = currency === 'USDT' ? '$' : '¥';
          const unit = prices[a.symbol] || 0;
          const unitVal = currency === 'USDT' ? unit : unit * USD_CNY_RATE;
          const unitStr = unitVal >= 1 ? formatMoney(unitVal) : unitVal.toFixed(4);
          return (
            <View key={a.symbol} style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: token.paddingSM }}>
              <CoinIcon symbol={a.symbol} size={26} shape="circle" bg={LOGO_COLORS[a.symbol] || token.colorFillSecondary} />
              <View style={{ flex: 1, marginLeft: token.marginSM }}>
                <Text style={{ fontSize: token.fontSize, fontWeight: '600', color: token.colorText }}>{a.symbol}</Text>
                <Text style={{ fontSize: token.fontSizeSM, color: token.colorTextTertiary }}>{hideBal ? '****' : fmt(a.balance, a.balance < 1 ? 6 : 2)}</Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={{ fontSize: token.fontSizeSM, color: token.colorTextSecondary }}>{hideBal ? '****' : `${prefix}${formatMoney(val)}`}</Text>
                <Text style={{ fontSize: token.fontSizeSM, color: token.colorTextTertiary, marginTop: 2 }}>{hideBal ? '****' : `单价 ${prefix}${unitStr}`}</Text>
              </View>
            </View>
          );
        })}
        {assetList.length === 0 && (
          <Text style={{ paddingVertical: token.paddingMD, textAlign: 'center', color: token.colorTextTertiary }}>该链暂无资产</Text>
        )}
      </View>

      <View style={{ height: token.lineWidth, backgroundColor: token.colorBorderSecondary }} />

      {/* 收款二维码 + 地址 */}
      <View style={{ flexDirection: 'row', gap: token.marginLG, alignItems: 'center', flexWrap: 'wrap' }}>
        <QrCard value={selected.address} size={128} />
        <View style={{ flex: 1, minWidth: 220, gap: token.marginXS }}>
          <Text style={{ fontSize: token.fontSize, fontWeight: '600', color: token.colorText }}>收款地址</Text>
          <Text style={{ fontSize: token.fontSizeSM, color: token.colorTextTertiary }}>支持 EVM 链资产（ETH / BNB / MATIC）</Text>
          <Pressable onPress={() => copyAddr(selected.address)} style={{ cursor: 'pointer' }}>
            <Text selectable style={{ fontSize: token.fontSizeSM, fontFamily: 'monospace', color: token.colorText, lineHeight: 20 }}>{selected.address}</Text>
          </Pressable>
          <Pressable onPress={() => copyAddr(selected.address)} style={{ flexDirection: 'row', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
            <Icon name={copied ? 'check' : 'copy'} size={13} color={copied ? token.colorSuccess : token.colorPrimary} />
            <Text style={{ fontSize: token.fontSizeSM, color: copied ? token.colorSuccess : token.colorPrimary }}>{copied ? '已复制' : '复制地址'}</Text>
          </Pressable>
        </View>
      </View>

      <View style={{ flexDirection: 'row', gap: token.marginSM }}>
        <Button type="primary" icon={<Icon name="send" size={token.fontSize} />} onPress={openSend}>发送</Button>
        <Button icon={<Icon name="camera" size={token.fontSize} />} onPress={() => setRecvOpen(true)}>收款二维码</Button>
      </View>
    </View>
  ) : (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Icon name="wallet" size={28} color={token.colorTextQuaternary} />
      <Text style={{ marginTop: token.marginSM, color: token.colorTextTertiary }}>暂无钱包，点击左侧「创建 / 导入」</Text>
    </View>
  );

  // ============================================================
  // 弹窗
  // ============================================================

  const createModal = (
    <Modal open={createOpen} title="钱包管理" onCancel={() => setCreateOpen(false)} footer={null} width={520}>
      <View style={{ gap: token.marginMD }}>
        <Segmented
          block
          value={cTab}
          onChange={(v) => {
            setCTab(v as CreateTab);
            setCError('');
          }}
          options={[
            { label: '创建', value: 'create' },
            { label: '私钥导入', value: 'pk' },
            { label: '助记词导入', value: 'mnemonic' },
          ]}
        />

        <View style={{ gap: token.marginXS }}>
          <Text style={{ fontSize: token.fontSizeSM, color: token.colorTextTertiary }}>钱包名称</Text>
          <Input value={cName} onChange={(v) => { setCName(v); setCError(''); }} placeholder="例如：我的主钱包" />
        </View>

        {cTab === 'create' && (
          <View style={{ gap: token.marginSM }}>
            {newMnemonic ? (
              <View style={{ gap: token.marginSM }}>
                <Alert type="warning" showIcon message="请立即抄写以下助记词（真实 BIP39 生成）。私钥与助记词均已经 AES-256-GCM 加密后本地保存，关闭此弹窗将不再显示助记词。" />
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: token.marginXS }}>
                  {newMnemonic.split(' ').map((w, i) => (
                    <View key={i} style={{ width: '31%', flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: token.paddingXS, paddingVertical: 6, borderRadius: token.borderRadius, backgroundColor: token.colorFillQuaternary }}>
                      <Text style={{ fontSize: token.fontSizeSM, color: token.colorTextTertiary, width: 16 }}>{i + 1}</Text>
                      <Text style={{ flex: 1, fontSize: token.fontSizeSM, color: token.colorText }}>{w}</Text>
                    </View>
                  ))}
                </View>
                <Button type="primary" block onPress={onFinishCreate}>我已抄写，完成创建</Button>
              </View>
            ) : (
              <View style={{ gap: token.marginSM }}>
                <Alert type="info" showIcon message="将真实生成一个全新的 12 词助记词钱包（BIP39 + 派生路径 m/44'/60'/0'/0/0），支持 Ethereum / BNB Chain / Polygon 三条测试链。" />
                <Button type="primary" block onPress={onGenerate}>创建钱包</Button>
              </View>
            )}
          </View>
        )}

        {cTab === 'pk' && (
          <View style={{ gap: token.marginSM }}>
            <View style={{ gap: token.marginXS }}>
              <Text style={{ fontSize: token.fontSizeSM, color: token.colorTextTertiary }}>私钥（支持 0x 前缀）</Text>
              <Input value={pkInput} onChange={(v) => { setPkInput(v); setCError(''); }} placeholder="64 位十六进制私钥" />
            </View>
            <Alert type="info" showIcon message="私钥将以「代码内明文 secret → scrypt → AES-256-GCM」加密后存入本地 KV（替代 Electron safeStorage）；导入后可直接签名转账。" />
            <Button type="primary" block onPress={doCreate}>导入钱包</Button>
          </View>
        )}

        {cTab === 'mnemonic' && (
          <View style={{ gap: token.marginSM }}>
            <View style={{ gap: token.marginXS }}>
              <Text style={{ fontSize: token.fontSizeSM, color: token.colorTextTertiary }}>助记词（空格分隔，12 或 24 词）</Text>
              <Input value={mnPhrase} onChange={(v) => { setMnPhrase(v); setCError(''); }} placeholder="例如：test test ... junk" />
            </View>
            <Alert type="info" showIcon message="将用该助记词按 BIP44 派生真实地址（m/44'/60'/0'/0/0），助记词与私钥加密后本地存储。" />
            <Button type="primary" block onPress={doCreate}>导入钱包</Button>
          </View>
        )}

        {cError ? <Alert type="error" showIcon message={cError} /> : null}
      </View>
    </Modal>
  );

  const tokensOfSendChain = selBal?.tokens[sendChain] || [];
  const sendBalNum = selAssetBalance();
  const sendSym = sendSymbol();

  const sendModal = selected ? (
    <Modal open={sendOpen} title="发送资产" onCancel={closeSend} footer={null} width={480}>
      {step === 'success' ? (
        <View style={{ alignItems: 'center', gap: token.marginSM, paddingVertical: token.paddingMD }}>
          <View style={{ width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center', backgroundColor: token.colorSuccessBg }}>
            <Icon name="check" size={28} color={token.colorSuccess} strokeWidth={2.6} />
          </View>
          <Text style={{ fontSize: token.fontSizeLG, fontWeight: '700', color: token.colorText }}>交易已发送</Text>
          <Text style={{ fontSize: token.fontSizeSM, color: token.colorTextSecondary }}>{amount} {sendSym} 发送至 {shortAddress(toAddr, 6, 4)}</Text>
          <View style={{ flexDirection: 'row', gap: 6, alignItems: 'center', marginTop: token.marginXS }}>
            <Text style={{ fontSize: token.fontSizeSM, color: token.colorTextTertiary }}>交易哈希</Text>
            <Text style={{ fontSize: token.fontSizeSM, fontFamily: 'monospace', color: token.colorText }}>{txHash.slice(0, 20)}…</Text>
          </View>
          <Button type="primary" block onPress={closeSend} style={{ marginTop: token.marginSM }}>返回钱包</Button>
        </View>
      ) : step === 'confirm' ? (
        <View style={{ gap: token.marginSM }}>
          <Alert type="warning" showIcon message="测试网 · 确认后将用本地解密出的私钥对交易签名，并经测试节点 eth_sendRawTransaction 真实上链。" />
          <Text style={{ fontSize: token.fontSize, color: token.colorText }}>向 {shortAddress(toAddr, 8, 6)} 发送 {amount} {sendSym}</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: token.paddingSM, borderRadius: token.borderRadius, backgroundColor: token.colorFillQuaternary }}>
            <Text style={{ fontSize: token.fontSizeSM, color: token.colorTextTertiary }}>安全验证</Text>
            <Text style={{ fontSize: token.fontSizeLG, fontWeight: '700', fontFamily: 'monospace', letterSpacing: 3, color: token.colorText }}>{secCode}</Text>
          </View>
          <Input value={codeInput} onChange={(v) => setCodeInput(v)} placeholder="输入上方验证码" />
          {sError ? <Text style={{ color: token.colorError, fontSize: token.fontSizeSM }}>{sError}</Text> : null}
          <View style={{ flexDirection: 'row', gap: token.marginSM, justifyContent: 'flex-end' }}>
            <Button onPress={() => setStep('form')}>返回修改</Button>
            <Button type="primary" disabled={codeInput !== secCode || sending} onPress={() => void onConfirmSend()}>{sending ? '签名广播中…' : '确认发送'}</Button>
          </View>
        </View>
      ) : (
        <View style={{ gap: token.marginSM }}>
          {/* 发送方 */}
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: token.paddingSM, borderRadius: token.borderRadius, backgroundColor: token.colorFillQuaternary }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: token.marginSM }}>
              <View style={{ width: 30, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center', backgroundColor: `${CHAIN_MAP[sendChain].color}26` }}>
                <Text style={{ color: CHAIN_MAP[sendChain].color, fontWeight: '700' }}>{CHAIN_MAP[sendChain].symbol.charAt(0)}</Text>
              </View>
              <View style={{ gap: 1 }}>
                <Text style={{ fontSize: token.fontSize, color: token.colorText }}>{selected.name}</Text>
                <Text style={{ fontSize: token.fontSizeSM, fontFamily: 'monospace', color: token.colorTextTertiary }}>{shortAddress(selected.address, 6, 4)}</Text>
              </View>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={{ fontSize: token.fontSize, color: token.colorText }}>{fmt(sendBalNum, 6)} {sendSym}</Text>
              <Text style={{ fontSize: token.fontSizeSM, color: token.colorTextTertiary }}>可用余额</Text>
            </View>
          </View>

          {/* 网络 */}
          <View style={{ gap: token.marginXS }}>
            <Text style={{ fontSize: token.fontSizeSM, color: token.colorTextTertiary }}>网络</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: token.marginXS }}>
              {CHAINS.map((c) => (
                <Chip key={c.key} label={c.symbol} color={c.color} active={sendChain === c.key} onPress={() => { setSendChain(c.key); setSendToken(null); setAmount(''); setSError(''); }} />
              ))}
            </View>
          </View>

          {/* 资产 */}
          <View style={{ gap: token.marginXS }}>
            <Text style={{ fontSize: token.fontSizeSM, color: token.colorTextTertiary }}>发送资产</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: token.marginXS }}>
              <Chip label={CHAIN_MAP[sendChain].symbol} color={CHAIN_MAP[sendChain].color} active={sendToken === null} onPress={() => { setSendToken(null); setAmount(''); setSError(''); }} />
              {tokensOfSendChain.map((t) => (
                <Chip key={t.symbol} label={t.symbol} active={sendToken === t.symbol} onPress={() => { setSendToken(t.symbol); setAmount(''); setSError(''); }} />
              ))}
            </View>
          </View>

          {/* 地址 */}
          <View style={{ gap: token.marginXS }}>
            <Text style={{ fontSize: token.fontSizeSM, color: token.colorTextTertiary }}>收款地址</Text>
            <View style={{ flexDirection: 'row', gap: token.marginXS, alignItems: 'center' }}>
              <View style={{ flex: 1 }}>
                <Input value={toAddr} onChange={(v) => { setToAddr(v); setSError(''); }} placeholder="0x..." />
              </View>
              <Button size="small" icon={<Icon name="copy" size={token.fontSizeSM} />} onPress={pasteAddr}>粘贴</Button>
            </View>
          </View>

          {/* 金额 */}
          <View style={{ gap: token.marginXS }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <Text style={{ fontSize: token.fontSizeSM, color: token.colorTextTertiary }}>金额</Text>
              <Pressable onPress={() => setAmount(String(sendBalNum))} style={{ cursor: 'pointer' }}>
                <Text style={{ fontSize: token.fontSizeSM, fontWeight: '600', color: token.colorPrimary }}>MAX</Text>
              </Pressable>
            </View>
            <Input value={amount} onChange={(v) => { setAmount(v.replace(/[^0-9.]/g, '')); setSError(''); }} placeholder="0.0" />
          </View>

          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text style={{ fontSize: token.fontSizeSM, color: token.colorTextTertiary }}>预估 Gas</Text>
            <Text style={{ fontSize: token.fontSizeSM, fontFamily: 'monospace', color: token.colorTextSecondary }}>0.00210000 {CHAIN_MAP[sendChain].symbol}</Text>
          </View>

          {sError ? <Alert type="error" showIcon message={sError} /> : null}

          <Button type="primary" block icon={<Icon name="send" size={token.fontSize} />} onPress={onSendClick}>
            发送 {sendSym}
          </Button>
        </View>
      )}
    </Modal>
  ) : null;

  const recvChain = chainDef;
  const recvModal = selected ? (
    <Modal open={recvOpen} title="收款" onCancel={() => setRecvOpen(false)} footer={null} width={420}>
      <View style={{ gap: token.marginMD, alignItems: 'center' }}>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: token.marginXS, justifyContent: 'center' }}>
          {CHAINS.map((c) => (
            <Chip key={c.key} label={c.symbol} color={c.color} active={selectedChain === c.key} onPress={() => setSelectedChain(c.key)} />
          ))}
        </View>
        <Panel style={{ alignItems: 'center', gap: token.marginSM, alignSelf: 'stretch' }}>
          <Text style={{ fontSize: token.fontSize, fontWeight: '600', color: token.colorText }}>{recvChain.name} 收款地址</Text>
          <Text style={{ fontSize: token.fontSizeSM, color: token.colorTextTertiary }}>仅支持 {recvChain.symbol} 及同链代币</Text>
          <QrCard value={selected.address} size={188} />
          <Text selectable style={{ fontSize: token.fontSizeSM, fontFamily: 'monospace', color: token.colorText, textAlign: 'center', lineHeight: 20 }}>{selected.address}</Text>
          <Button icon={<Icon name={copied ? 'check' : 'copy'} size={token.fontSize} />} onPress={() => copyAddr(selected.address)}>
            {copied ? '已复制' : '复制地址'}
          </Button>
        </Panel>
      </View>
    </Modal>
  ) : null;

  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: token.marginLG, alignItems: 'flex-start' }}>
      <View style={{ flex: 1, minWidth: 300, maxWidth: 360, gap: token.marginMD }}>
        {overviewCard}
        {walletList}
      </View>
      {rightPanel}

      {createModal}
      {sendModal}
      {recvModal}
      {msgHolder}
    </View>
  );
}

export default WalletDemo;
