import * as nodeCrypto from 'crypto';
import { HDNode } from '@ethersproject/hdnode';
import { Wallet as EthersWallet } from '@ethersproject/wallet';
import { parseEther, parseUnits } from '@ethersproject/units';
import { kv } from 'react-native-flux-desktop';
import { CHAIN_MAP, TOKENS_BY_CHAIN, rpcCall, type DemoWallet } from './wallet-lib';

/** 加密主密钥来源：按用户要求，明文常量写在代码中（demo，非生产安全） */
const SECRET = 'flux-wallet-demo-secret-v1';
const HD_PATH = "m/44'/60'/0'/0/0";
const KV_KEY = 'evm_wallets_v1';

/** 标准 Hardhat/Anvil 测试助记词（用于种子 6 个可签名的演示钱包，地址与部署日志一致） */
const HARDHAT_MNEMONIC = 'test test test test test test test test test test test junk';

/** 加密后的钱包记录（落盘形态：私钥/助记词均为 AES-GCM 密文） */
export interface StoredWallet {
  id: string;
  name: string;
  address: string;
  source: 'created' | 'imported';
  hasMnemonic: boolean;
  mnemonicBackedUp: boolean;
  encPk: string;
  encMn: string | null;
  createdAt: number;
}

// ------------------------------------------------------------
// keystore：AES-256-GCM（明文 secret → scrypt → 密钥）
// ------------------------------------------------------------

function encrypt(plain: string): string {
  const salt = nodeCrypto.randomBytes(16);
  const iv = nodeCrypto.randomBytes(12);
  const key = nodeCrypto.scryptSync(SECRET, salt, 32);
  const c = nodeCrypto.createCipheriv('aes-256-gcm', key, iv);
  const enc = Buffer.concat([c.update(plain, 'utf8'), c.final()]);
  // [salt(16)][iv(12)][tag(16)][ciphertext]
  return Buffer.concat([salt, iv, c.getAuthTag(), enc]).toString('base64');
}

function decrypt(blob: string): string {
  const buf = Buffer.from(blob, 'base64');
  const salt = buf.subarray(0, 16);
  const iv = buf.subarray(16, 28);
  const tag = buf.subarray(28, 44);
  const data = buf.subarray(44);
  const key = nodeCrypto.scryptSync(SECRET, salt, 32);
  const d = nodeCrypto.createDecipheriv('aes-256-gcm', key, iv);
  d.setAuthTag(tag);
  return Buffer.concat([d.update(data), d.final()]).toString('utf8');
}

function newId(): string {
  return 'w' + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

// ------------------------------------------------------------
// HD 派生
// ------------------------------------------------------------

/** 助记词 → 派生地址 + 私钥（m/44'/60'/0'/0/0） */
export function deriveFromMnemonic(phrase: string): { address: string; privateKey: string } {
  const hd = HDNode.fromMnemonic(phrase.trim()).derivePath(HD_PATH);
  return { address: hd.address.toLowerCase(), privateKey: hd.privateKey };
}

/** 新建随机钱包：生成 12 词助记词 + 派生，返回密文记录与明文助记词（供备份展示） */
export function createWallet(name: string): { wallet: StoredWallet; mnemonic: string } {
  const tmp = EthersWallet.createRandom();
  const mnemonic = (tmp.mnemonic as { phrase: string }).phrase;
  const { address, privateKey } = deriveFromMnemonic(mnemonic);
  const wallet: StoredWallet = {
    id: newId(),
    name: name.trim() || '新钱包',
    address,
    source: 'created',
    hasMnemonic: true,
    mnemonicBackedUp: false,
    encPk: encrypt(privateKey),
    encMn: encrypt(mnemonic),
    createdAt: Date.now(),
  };
  return { wallet, mnemonic };
}

/** 私钥导入 */
export function importFromPrivateKey(privateKey: string, name: string): StoredWallet {
  let key = privateKey.trim();
  if (!/^0x/i.test(key)) key = '0x' + key;
  const w = new EthersWallet(key);
  return {
    id: newId(),
    name: name.trim() || '导入钱包',
    address: w.address.toLowerCase(),
    source: 'imported',
    hasMnemonic: false,
    mnemonicBackedUp: false,
    encPk: encrypt(w.privateKey),
    encMn: null,
    createdAt: Date.now(),
  };
}

/** 助记词导入（用户粘贴已有助记词） */
export function importFromMnemonic(phrase: string, name: string): { wallet: StoredWallet; mnemonic: string } {
  const p = phrase.trim().replace(/\s+/g, ' ');
  const { address, privateKey } = deriveFromMnemonic(p);
  const wallet: StoredWallet = {
    id: newId(),
    name: name.trim() || '导入钱包',
    address,
    source: 'imported',
    hasMnemonic: true,
    mnemonicBackedUp: true,
    encPk: encrypt(privateKey),
    encMn: encrypt(p),
    createdAt: Date.now(),
  };
  return { wallet, mnemonic: p };
}

/** 解密还原私钥（签名时用） */
export function decryptPrivateKey(w: StoredWallet): string {
  return decrypt(w.encPk);
}

/** 解密还原助记词（备份查看时用） */
export function decryptMnemonic(w: StoredWallet): string | null {
  return w.encMn ? decrypt(w.encMn) : null;
}

/** 转成 UI 展示用的 DemoWallet（不含任何明文密钥） */
export function toDemoWallet(w: StoredWallet): DemoWallet {
  return { id: w.id, name: w.name, address: w.address, source: w.source };
}

// ------------------------------------------------------------
// KV 持久化（addon 不可用时静默降级为纯内存）
// ------------------------------------------------------------

export function loadWallets(): StoredWallet[] {
  try {
    const got = kv.get('user', KV_KEY);
    if (got && Array.isArray(got.value)) return got.value as StoredWallet[];
  } catch {
    /* ignore */
  }
  return [];
}

export function saveWallets(list: StoredWallet[]): void {
  try {
    kv.set('user', KV_KEY, 'json', list);
  } catch {
    /* ignore：addon 不可用时仅内存态 */
  }
}

/** 种子：用标准 Hardhat 助记词派生前 6 个账户（地址与部署日志一致，且都可真实签名） */
export function seedHardhatWallets(): StoredWallet[] {
  const meta: { name: string; source: 'created' | 'imported' }[] = [
    { name: '主测试钱包', source: 'created' },
    { name: '收款方钱包', source: 'imported' },
    { name: '备用钱包 1', source: 'created' },
    { name: '备用钱包 2', source: 'created' },
    { name: '备用钱包 3', source: 'imported' },
    { name: '备用钱包 4', source: 'created' },
  ];
  const node = HDNode.fromMnemonic(HARDHAT_MNEMONIC);
  const now = Date.now();
  return meta.map((m, i) => {
    const hd = node.derivePath(`m/44'/60'/0'/0/${i}`);
    return {
      id: `seed${i}`,
      name: m.name,
      address: hd.address.toLowerCase(),
      source: m.source,
      hasMnemonic: true,
      mnemonicBackedUp: true,
      encPk: encrypt(hd.privateKey),
      encMn: encrypt(HARDHAT_MNEMONIC),
      createdAt: now + i,
    };
  });
}

/** 首次载入：KV 有则读，无则种子 6 个 Hardhat 钱包并落盘 */
export function ensureSeed(): StoredWallet[] {
  const existing = loadWallets();
  if (existing.length) return existing;
  const seeded = seedHardhatWallets();
  saveWallets(seeded);
  return seeded;
}

// ------------------------------------------------------------
// 真实签名 + 广播（参照 wallet-service.sendTransaction）
// ------------------------------------------------------------

export interface SendInput {
  privateKey: string;
  chainKey: number;
  toAddress: string;
  amount: string;
  /** 传入则发 ERC-20 代币；缺省发原生币 */
  tokenSymbol?: string;
}

/** 组装并签名一笔交易，经测试节点 eth_sendRawTransaction 广播，返回真实交易哈希 */
export async function sendTransaction(input: SendInput): Promise<string> {
  const chain = CHAIN_MAP[input.chainKey];
  if (!chain) throw new Error('不支持的链');
  const wallet = new EthersWallet(input.privateKey);

  const chainIdHex = await rpcCall(chain.rpc, 'eth_chainId', []);
  const gasPrice = await rpcCall(chain.rpc, 'eth_gasPrice', []);
  const nonceHex = await rpcCall(chain.rpc, 'eth_getTransactionCount', [wallet.address, 'latest']);
  const chainId = Number(BigInt(chainIdHex as string));
  const nonce = parseInt(String(nonceHex), 16);

  const token = input.tokenSymbol
    ? (TOKENS_BY_CHAIN[input.chainKey] || []).find((t) => t.symbol === input.tokenSymbol)
    : undefined;

  let tx;
  if (token) {
    const value = parseUnits(input.amount, token.decimals);
    const data =
      '0xa9059cbb' +
      input.toAddress.toLowerCase().slice(2).padStart(64, '0') +
      value.toHexString().slice(2).padStart(64, '0');
    tx = { to: token.address, data, nonce, gasPrice, gasLimit: 100000, chainId };
  } else {
    tx = { to: input.toAddress, value: parseEther(input.amount), nonce, gasPrice, gasLimit: 21000, chainId };
  }

  const raw = await wallet.signTransaction(tx);
  const hash = await rpcCall(chain.rpc, 'eth_sendRawTransaction', [raw]);
  return String(hash);
}
