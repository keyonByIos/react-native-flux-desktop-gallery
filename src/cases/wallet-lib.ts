const G = globalThis as any;

export interface Chain {
  key: number;
  chainId: number;
  name: string;
  symbol: string;
  rpc: string;
  color: string;
}
export interface Token {
  address: string;
  symbol: string;
  decimals: number;
  name: string;
}

/** 本地测试节点主机（与 wallet-service.ts 的 LOCAL_RPC_HOST 一致） */
export const RPC_HOST = '47.242.206.79';

/** 测试环境三链：统一 chainId 1337，靠 key + 端口区分（照搬 DEV_CHAINS） */
export const CHAINS: Chain[] = [
  { key: 1337, chainId: 1337, name: 'Ethereum', symbol: 'ETH', rpc: `http://${RPC_HOST}:8545`, color: '#627EEA' },
  { key: 1338, chainId: 1337, name: 'BNB Chain', symbol: 'BNB', rpc: `http://${RPC_HOST}:8546`, color: '#F0B90B' },
  { key: 1339, chainId: 1337, name: 'Polygon', symbol: 'MATIC', rpc: `http://${RPC_HOST}:8547`, color: '#8247E5' },
];
export const CHAIN_MAP: Record<number, Chain> = Object.fromEntries(CHAINS.map((c) => [c.key, c]));

/** 各链已部署的测试代币（照搬 DEV_TOKENS_BY_CHAIN） */
export const TOKENS_BY_CHAIN: Record<number, Token[]> = {
  1337: [
    { address: '0x5FbDB2315678afecb367f032d93F642f64180aa3', symbol: 'USDT', decimals: 6, name: 'Tether' },
    { address: '0xa513E6E4b8f2a923D98304ec87F64353C4D5C853', symbol: 'USDC', decimals: 6, name: 'USD Coin' },
  ],
  1338: [
    { address: '0x5FbDB2315678afecb367f032d93F642f64180aa3', symbol: 'USDT', decimals: 18, name: 'Tether' },
    { address: '0xa513E6E4b8f2a923D98304ec87F64353C4D5C853', symbol: 'USDC', decimals: 18, name: 'USD Coin' },
  ],
  1339: [
    { address: '0x5FbDB2315678afecb367f032d93F642f64180aa3', symbol: 'USDT', decimals: 6, name: 'Tether' },
    { address: '0xa513E6E4b8f2a923D98304ec87F64353C4D5C853', symbol: 'USDC', decimals: 6, name: 'USD Coin' },
  ],
};

/** 演示钱包：仅地址（Hardhat/Anvil 标准账户），无私钥/加密 */
export interface DemoWallet {
  id: string;
  name: string;
  address: string;
  source: 'created' | 'imported';
}
export const DEMO_WALLETS: DemoWallet[] = [
  { id: 'w1', name: '主测试钱包', address: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266', source: 'created' },
  { id: 'w2', name: '收款方钱包', address: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8', source: 'imported' },
  { id: 'w3', name: '备用钱包 1', address: '0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC', source: 'created' },
  { id: 'w4', name: '备用钱包 2', address: '0x90F79bf6EB2c4f870365E785982E1f101E93b906', source: 'created' },
  { id: 'w5', name: '备用钱包 3', address: '0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65', source: 'imported' },
  { id: 'w6', name: '备用钱包 4', address: '0x9965507D1a55bcC2695C58ba16FB37d819B0A4dc', source: 'created' },
];

/** 静态参考价（离线降级兜底；stable=1） */
export const PRICES: Record<string, number> = { ETH: 3300, BNB: 540, MATIC: 0.9, USDT: 1, USDC: 1 };

/** USD/CNY 汇率（演示固定值；参照 WalletProvider 的 usdCnyRate） */
export const USD_CNY_RATE = 7.24;

/**
 * 实时价格：参照 crypto-live 案例，直连币安官方公共行情 REST（data-api.binance.vision，无需 Key）。
 * 原生币 → 交易对映射（稳定币 USDT/USDC 恒为 1，无需查询）。
 */
const BINANCE_REST = 'https://data-api.binance.vision';
const PRICE_PAIRS: Record<string, string> = { ETH: 'ETHUSDT', BNB: 'BNBUSDT', MATIC: 'MATICUSDT' };

/**
 * 拉取 ETH/BNB/MATIC 最新价（24hr 快照），稳定币固定为 1。
 * 成功返回 { prices, live:true }；网络不可达/超时降级为静态 PRICES + live:false。
 */
export async function fetchPrices(timeoutMs = 6000): Promise<{ prices: Record<string, number>; live: boolean }> {
  const ctrl = new G.AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const symbols = encodeURIComponent(JSON.stringify(Object.values(PRICE_PAIRS)));
    const res = await G.fetch(`${BINANCE_REST}/api/v3/ticker/24hr?symbols=${symbols}`, { signal: ctrl.signal });
    const arr: any[] = await res.json();
    const prices: Record<string, number> = { ...PRICES, USDT: 1, USDC: 1 };
    for (const it of arr) {
      const sym = Object.keys(PRICE_PAIRS).find((k) => PRICE_PAIRS[k] === it.symbol);
      if (sym) {
        const p = Number(it.lastPrice);
        if (isFinite(p) && p > 0) prices[sym] = p;
      }
    }
    return { prices, live: true };
  } catch {
    return { prices: { ...PRICES }, live: false };
  } finally {
    clearTimeout(timer);
  }
}

// ------------------------------------------------------------
// JSON-RPC
// ------------------------------------------------------------

const RPC_TIMEOUT_MS = 8000;

/** 单次 JSON-RPC 调用，带超时（AbortController） */
export async function rpcCall(url: string, method: string, params: unknown[], timeoutMs = RPC_TIMEOUT_MS): Promise<any> {
  const ctrl = new G.AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await G.fetch(url, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ jsonrpc: '2.0', id: Date.now(), method, params }),
      signal: ctrl.signal,
    });
    const j = await res.json();
    if (j.error) throw new Error(j.error.message || 'RPC error');
    return j.result;
  } finally {
    clearTimeout(timer);
  }
}

/** hex(0x…) → BigInt */
function hexToBig(h: string): bigint {
  if (!h || h === '0x' || h === '0x0') return 0n;
  try {
    return BigInt(h);
  } catch {
    return 0n;
  }
}

/** wei 最小单位 → 可读十进制字符串（按 decimals 缩点、去尾零） */
export function fromUnits(hex: string, decimals: number): string {
  const v = hexToBig(hex);
  const neg = v < 0n;
  const a = neg ? -v : v;
  const base = 10n ** BigInt(decimals);
  const whole = a / base;
  const frac = a % base;
  const s = frac === 0n ? whole.toString() : `${whole}.${frac.toString().padStart(decimals, '0').replace(/0+$/, '')}`;
  return (neg ? '-' : '') + s;
}

export interface TokenBal extends Token {
  balance: string;
}
export interface BalResult {
  native: Record<number, string>;
  tokens: Record<number, TokenBal[]>;
  /** true = 来自测试节点真实数据；false = 节点不可达，已降级模拟 */
  live: boolean;
}

/** 查询所有链原生币 + ERC-20 代币余额（镜像 wallet-service.getBalances） */
export async function fetchBalances(address: string): Promise<BalResult> {
  const native: Record<number, string> = {};
  const tokens: Record<number, TokenBal[]> = {};
  let live = true;
  const data = '0x70a08231' + address.slice(2).toLowerCase().padStart(64, '0');
  await Promise.all(
    CHAINS.map(async (chain) => {
      try {
        const bal = await rpcCall(chain.rpc, 'eth_getBalance', [address, 'latest']);
        native[chain.key] = fromUnits(bal, 18);
      } catch {
        live = false;
        native[chain.key] = '0';
      }
      const list = TOKENS_BY_CHAIN[chain.key] || [];
      tokens[chain.key] = await Promise.all(
        list.map(async (tk) => {
          try {
            const r = await rpcCall(chain.rpc, 'eth_call', [{ to: tk.address, data }, 'latest']);
            return { ...tk, balance: fromUnits(r, tk.decimals) };
          } catch {
            return { ...tk, balance: '0' };
          }
        })
      );
    })
  );
  return { native, tokens, live };
}

/** 离线降级：按地址派生一组稳定、可信的模拟余额（同地址结果一致，不闪烁） */
export function mockBalances(address: string): BalResult {
  const seed = address.toLowerCase().split('').reduce((s, c) => s + c.charCodeAt(0), 0);
  const native: Record<number, string> = {};
  const tokens: Record<number, TokenBal[]> = {};
  CHAINS.forEach((c, i) => {
    native[c.key] = (0).toFixed(4);
    tokens[c.key] = (TOKENS_BY_CHAIN[c.key] || []).map((tk, j) => ({
      ...tk,
      balance: (0).toFixed(2),
    }));
  });
  return { native, tokens, live: false };
}

/** 跨链折算美元总资产（prices 缺省用静态 PRICES，实时价由调用方传入） */
export function totalUsd(bal: BalResult, prices: Record<string, number> = PRICES): number {
  let s = 0;
  for (const c of CHAINS) {
    s += Number(bal.native[c.key] || 0) * (prices[c.symbol] || 0);
    for (const t of bal.tokens[c.key] || []) s += Number(t.balance) * (prices[t.symbol] || 0);
  }
  return s;
}

/** 地址格式校验（无 ethers，用正则：0x + 40 位 hex） */
export const isAddress = (a: string): boolean => /^0x[0-9a-fA-F]{40}$/.test((a || '').trim());

/** 生成假交易哈希（演示广播） */
export function fakeTxHash(): string {
  let h = '0x';
  for (let i = 0; i < 64; i++) h += '0123456789abcdef'[Math.floor(Math.random() * 16)];
  return h;
}

/** 生成随机地址（新建钱包演示用） */
export function randomAddress(): string {
  let h = '0x';
  for (let i = 0; i < 40; i++) h += '0123456789abcdef'[Math.floor(Math.random() * 16)];
  return h;
}

const WORDS = ('abandon ability able about above absorb abstract absurd abuse access accident account ' +
  'acid acoustic acquire across act action actor actress actual adapt add addict address adjust admit ' +
  'adult advance advice aerobic affair afford afraid again age agent agree ahead aim air airport aisle ' +
  'alarm album bicycle blade blank blast brave bread breeze bridge bright bronze bubble budget buffalo').split(/\s+/);

/** 生成 12 词「演示助记词」（纯视觉，非真实 BIP39/HD 派生） */
export function mockMnemonic(): string {
  const out: string[] = [];
  for (let i = 0; i < 12; i++) out.push(WORDS[Math.floor(Math.random() * WORDS.length)]);
  return out.join(' ');
}

/** 数字千分位 + 小数位裁剪 */
export function fmt(v: string | number, dp = 4): string {
  const n = Number(v);
  if (!isFinite(n)) return '0';
  return n.toLocaleString('en-US', { maximumFractionDigits: dp });
}

/** 千分位金额：固定小数位（参照 utils/format.formatMoney） */
export function formatMoney(v: number, digits = 2): string {
  const n = Number(v);
  return (isFinite(n) ? n : 0).toLocaleString('en-US', { minimumFractionDigits: digits, maximumFractionDigits: digits });
}

/** 地址截断（参照 utils/format.shortAddress） */
export function shortAddress(addr: string, head = 10, tail = 8, sep = '…'): string {
  if (!addr) return '-';
  if (addr.length <= head + tail) return addr;
  return `${addr.slice(0, head)}${sep}${addr.slice(-tail)}`;
}

/** 生成 6 位安全验证码（参照 WalletSendModal.genSecurityCode，去易混淆字符） */
export function genSecurityCode(): string {
  const UPPER = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  const LOWER = 'abcdefghjkmnpqrstuvwxyz';
  const DIGIT = '23456789';
  const ALL = UPPER + LOWER + DIGIT;
  const pick = (s: string): string => s[Math.floor(Math.random() * s.length)];
  const chars = [pick(UPPER), pick(LOWER), pick(DIGIT), pick(ALL), pick(ALL), pick(ALL)];
  for (let i = chars.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [chars[i], chars[j]] = [chars[j], chars[i]];
  }
  return chars.join('');
}
