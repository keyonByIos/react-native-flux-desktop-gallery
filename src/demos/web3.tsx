// web3 demo：区块链展示型组件的多段式演示（Address / TokenPrice / PriceRange / NFTCard / Web3Avatar）。
// 每个组件一个 DemoPage，遵循三段式（demo → API → Token）。NFT 封面走 picsum 远程图（抓帧需留加载时间）。
import React from 'react';
import { View, Space, useToken } from 'react-native-flux-desktop';
import { Address, TokenPrice, PriceRange, NFTCard, Web3Avatar } from 'react-native-flux-desktop-web3';
import { DemoPage, type DemoItem, type ApiRow } from '../DemoPage';

// 若干稳定示例地址（0x…），展示同址恒得同图。
const ADDR_A = '0x71C767221d4C154D0b3A065841FBA9AB42Df9525';
const ADDR_B = '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045';
const ADDR_C = '0xBE0eB53F4619530d56d8439e20781f0F41b64a9d';

// ---- Address ----
export function AddressDemo(): React.ReactElement {
  const demos: DemoItem[] = [
    {
      name: '基础',
      desc: '默认头像前缀 + 截断地址 + 复制 + 二维码图标',
      node: <Address address={ADDR_A} />,
      code: [
        'import { Address } from "react-native-flux-desktop";',
        '',
        '// 默认：头像前缀 + 截断地址 + 复制 + 二维码图标',
        '<Address address="0x71C767221d4C154D0b3A065841FBA9AB42Df9525" />',
      ].join('\n'),
    },
    {
      name: 'ENS 展示名',
      desc: 'name 替代截断地址；仍复制/二维码完整地址',
      node: <Address address={ADDR_B} name="vitalik.eth" />,
      code: [
        '// name 替代截断地址展示；仍复制/二维码完整地址',
        '<Address address="0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045" name="vitalik.eth" />',
      ].join('\n'),
    },
    {
      name: '链标签',
      desc: 'chain 上一枚 Tag；chainColor 用语义或自定义色',
      node: (
        <Space direction="vertical" size={10}>
          <Address address={ADDR_A} chain="Ethereum" prefix={false} />
          <Address address={ADDR_C} chain="BSC" chainColor="warning" prefix={false} />
        </Space>
      ),
      code: [
        '// chain 上链名 Tag；chainColor 语义/自定义色；prefix=false 关头像',
        '<Address address={ADDR_A} chain="Ethereum" prefix={false} />',
        '<Address address={ADDR_C} chain="BSC" chainColor="warning" prefix={false} />',
      ].join('\n'),
    },
    {
      name: '截断与尺寸',
      desc: 'truncated 自定义头尾位数 / false 全显；size 三档',
      node: (
        <Space direction="vertical" size={10} align="start">
          <Address address={ADDR_A} truncated={{ lead: 10, trail: 6 }} prefix={false} />
          <Address address={ADDR_A} truncated={false} prefix={false} size="small" />
          <Address address={ADDR_A} prefix={false} size="large" />
        </Space>
      ),
      code: [
        '// truncated：true 头6尾4 / {lead,trail} 自定义 / false 全显；size 三档',
        '<Address address={ADDR_A} truncated={{ lead: 10, trail: 6 }} prefix={false} />',
        '<Address address={ADDR_A} truncated={false} size="small" prefix={false} />',
        '<Address address={ADDR_A} size="large" prefix={false} />',
      ].join('\n'),
    },
  ];
  const api: ApiRow[] = [
    { name: 'address', desc: '完整地址（截断与二维码取此值）', type: 'string' },
    { name: 'name', desc: '展示名（如 ENS），给了则替代截断地址', type: 'string' },
    { name: 'chain / chainColor', desc: '链名标签文案 / 颜色', type: 'string' },
    { name: 'truncated', desc: '截断：true 头6尾4 / {lead,trail} / false 全显', type: 'boolean | object', default: 'true' },
    { name: 'prefix', desc: '前缀头像，传 false 关闭', type: 'ReactNode | false' },
    { name: 'copyable / scanCode', desc: '复制 / 二维码切换图标', type: 'boolean', default: 'true' },
    { name: 'size', desc: '尺寸', type: "'small' | 'middle' | 'large'", default: "'middle'" },
  ];
  return <DemoPage demos={demos} api={api} />;
}

// ---- TokenPrice ----
export function TokenPriceDemo(): React.ReactElement {
  const demos: DemoItem[] = [
    {
      name: '基础',
      desc: '代币徽标 + 数量 + 符号',
      node: <TokenPrice token="ETH" amount={1.2345} />,
      code: [
        'import { TokenPrice } from "react-native-flux-desktop";',
        '',
        '// 代币徽标 + 数量 + 符号（token 可传字符串或 {symbol,name,icon}）',
        '<TokenPrice token="ETH" amount={1.2345} />',
      ].join('\n'),
    },
    {
      name: '法币估值 + 涨跌幅',
      desc: 'fiatPrice 单价（估值=数量×单价）；change 涨跌药丸（涨绿跌红）',
      node: (
        <Space direction="vertical" size={12}>
          <TokenPrice token={{ symbol: 'ETH', name: 'Ethereum' }} amount={3.5} fiatPrice={3210.5} change={4.21} />
          <TokenPrice token={{ symbol: 'BTC', name: 'Bitcoin' }} amount={0.0821} fiatPrice={67000} change={-2.35} />
        </Space>
      ),
      code: [
        '// fiatPrice 单价（估值=数量×单价）；change 涨跌药丸（涨绿跌红）',
        '<TokenPrice token={{ symbol: \'ETH\', name: \'Ethereum\' }} amount={3.5} fiatPrice={3210.5} change={4.21} />',
      ].join('\n'),
    },
    {
      name: 'A 股涨跌配色',
      desc: 'invert=true 涨红跌绿',
      node: (
        <Space direction="vertical" size={12}>
          <TokenPrice token="SOL" amount={120} change={6.6} invert />
          <TokenPrice token="SOL" amount={120} change={-6.6} invert />
        </Space>
      ),
      code: [
        '// invert=true 涨红跌绿（A 股习惯）',
        '<TokenPrice token="SOL" amount={120} change={6.6} invert />',
        '<TokenPrice token="SOL" amount={120} change={-6.6} invert />',
      ].join('\n'),
    },
    {
      name: '尺寸与精度',
      desc: 'size 三档；precision 小数位',
      node: (
        <Space direction="vertical" size={12} align="start">
          <TokenPrice token="USDT" amount={1234.5678} precision={2} size="small" />
          <TokenPrice token="USDT" amount={1234.5678} precision={4} />
          <TokenPrice token="USDT" amount={1234.5678} precision={6} size="large" />
        </Space>
      ),
      code: [
        '// size 三档；precision 小数位（默认 4）',
        '<TokenPrice token="USDT" amount={1234.5678} precision={2} size="small" />',
        '<TokenPrice token="USDT" amount={1234.5678} precision={6} size="large" />',
      ].join('\n'),
    },
  ];
  const api: ApiRow[] = [
    { name: 'token', desc: '代币：symbol 字符串或 {symbol,name,icon}', type: 'TokenMeta | string' },
    { name: 'amount', desc: '代币数量', type: 'number' },
    { name: 'fiatPrice', desc: '法币单价，给了展示估值', type: 'number' },
    { name: 'change', desc: '涨跌幅（百分数）', type: 'number' },
    { name: 'precision', desc: '数量小数位', type: 'number', default: '4' },
    { name: 'invert', desc: '涨红跌绿（A 股习惯）', type: 'boolean', default: 'false' },
    { name: 'size', desc: '尺寸', type: "'small' | 'middle' | 'large'", default: "'middle'" },
  ];
  return <DemoPage demos={demos} api={api} />;
}

// ---- PriceRange ----
export function PriceRangeDemo(): React.ReactElement {
  const demos: DemoItem[] = [
    {
      name: '基础',
      desc: 'min – max 代币区间 + 迷你区间轨',
      node: <PriceRange token="ETH" min={0.8} max={1.5} />,
      code: [
        'import { PriceRange } from "react-native-flux-desktop";',
        '',
        '// min – max 代币区间 + 迷你区间轨',
        '<PriceRange token="ETH" min={0.8} max={1.5} />',
      ].join('\n'),
    },
    {
      name: '带标题',
      desc: 'label 顶部说明文案',
      node: <PriceRange token={{ symbol: 'BNB', name: 'Smart Chain' }} min={12.5} max={48} label="地板价区间" />,
      code: [
        '// label 顶部说明文案',
        '<PriceRange token={{ symbol: \'BNB\', name: \'Smart Chain\' }} min={12.5} max={48} label="地板价区间" />',
      ].join('\n'),
    },
    {
      name: '无轨条 + 精度',
      desc: 'showBar=false；precision 小数位',
      node: <PriceRange token="USDC" min={1000} max={9999.5} precision={2} showBar={false} label="铸造价格区间" />,
      code: [
        '// showBar=false 去轨条；precision 小数位',
        '<PriceRange token="USDC" min={1000} max={9999.5} precision={2} showBar={false} label="铸造价格区间" />',
      ].join('\n'),
    },
  ];
  const api: ApiRow[] = [
    { name: 'token', desc: '代币', type: 'TokenMeta | string' },
    { name: 'min / max', desc: '区间下 / 上界', type: 'number' },
    { name: 'precision', desc: '小数位', type: 'number', default: '4' },
    { name: 'label', desc: '顶部标题', type: 'string' },
    { name: 'showBar', desc: '迷你区间轨', type: 'boolean', default: 'true' },
    { name: 'barWidth', desc: '轨条宽度', type: 'number', default: '200' },
  ];
  return <DemoPage demos={demos} api={api} />;
}

// ---- NFTCard ----
export function NFTCardDemo(): React.ReactElement {
  const demos: DemoItem[] = [
    {
      name: '完整信息',
      desc: '封面 + 名称/标准 + 系列编号 + 合约地址 + 价格',
      node: (
        <Space size="large" align="start" wrap>
          <NFTCard
            name="Flux Avatars"
            collection="Flux Genesis"
            tokenId={1024}
            standard="ERC-721"
            contract={ADDR_A}
            chain="Ethereum"
            image="https://picsum.photos/seed/fluxnft1/400/300"
            price={{ token: 'ETH', amount: 1.25, fiatPrice: 3210 }}
          />
          <NFTCard
            name="Pixel Realms #7"
            collection="Pixel Realms"
            standard="ERC-1155"
            contract={ADDR_C}
            chain="BSC"
            image="https://picsum.photos/seed/fluxnft2/400/300"
            price={{ token: { symbol: 'BNB', name: 'BNB' }, amount: 3.6 }}
          />
        </Space>
      ),
      code: [
        'import { NFTCard } from "react-native-flux-desktop";',
        '',
        '// 封面 + 名称/标准 + 系列编号 + 合约地址 + 价格',
        '<NFTCard',
        '  name="Flux Avatars" collection="Flux Genesis" tokenId={1024}',
        '  standard="ERC-721" contract={ADDR_A} chain="Ethereum"',
        '  image="https://picsum.photos/seed/fluxnft1/400/300"',
        '  price={{ token: \'ETH\', amount: 1.25, fiatPrice: 3210 }}',
        '/>',
      ].join('\n'),
    },
    {
      name: '仅封面与名称',
      desc: '省略合约/价格，只保留封面 + 标准',
      node: (
        <NFTCard
          name="Minimal Piece"
          standard="ERC-721"
          image="https://picsum.photos/seed/fluxnft3/400/300"
          coverHeight={160}
        />
      ),
      code: [
        '// 省略合约/价格，只保留封面 + 标准；coverHeight 自定义封面高',
        '<NFTCard',
        '  name="Minimal Piece" standard="ERC-721"',
        '  image="https://picsum.photos/seed/fluxnft3/400/300" coverHeight={160}',
        '/>',
      ].join('\n'),
    },
  ];
  const api: ApiRow[] = [
    { name: 'name', desc: '藏品名', type: 'string' },
    { name: 'collection / tokenId', desc: '系列名 / 编号', type: 'string / number' },
    { name: 'standard', desc: '代币标准（右上 Tag）', type: 'string' },
    { name: 'contract / chain', desc: '合约地址（Address）/ 链标签', type: 'string' },
    { name: 'image / coverHeight', desc: '封面 URL 或节点 / 高度', type: 'string | ReactNode / number' },
    { name: 'price', desc: '价格 {token,amount,fiatPrice}', type: 'object' },
  ];
  return <DemoPage demos={demos} api={api} />;
}

// ---- Web3Avatar ----
export function Web3AvatarDemo(): React.ReactElement {
  const demos: DemoItem[] = [
    {
      name: '确定性身份图案',
      desc: '同一地址恒得同图；不同地址配色/纹样各异（Blockies 风格）',
      node: (
        <Space size="large" align="center" wrap>
          <Web3Avatar address={ADDR_A} size={56} />
          <Web3Avatar address={ADDR_B} size={56} />
          <Web3Avatar address={ADDR_C} size={56} />
          <Web3Avatar address="0x0000000000000000000000000000000000000000" size={56} />
        </Space>
      ),
      code: [
        'import { Web3Avatar } from "react-native-flux-desktop";',
        '',
        '// 地址作种子：同一地址恒得同图，不同地址配色/纹样各异（Blockies 风格）',
        '<Web3Avatar address="0x71C767221d4C154D0b3A065841FBA9AB42Df9525" size={56} />',
      ].join('\n'),
    },
    {
      name: '形状与尺寸',
      desc: 'shape circle / square；size 边长',
      node: (
        <Space size="large" align="center" wrap>
          <Web3Avatar address={ADDR_A} size={32} shape="circle" />
          <Web3Avatar address={ADDR_A} size={48} shape="circle" />
          <Web3Avatar address={ADDR_A} size={64} />
          <Web3Avatar address={ADDR_A} size={80} />
        </Space>
      ),
      code: [
        '// shape circle / square（默认 square）；size 边长',
        '<Web3Avatar address={ADDR_A} size={48} shape="circle" />',
        '<Web3Avatar address={ADDR_A} size={80} shape="square" />',
      ].join('\n'),
    },
    {
      name: '网格密度',
      desc: 'grid 控制格数（更细的纹样）',
      node: (
        <Space size="large" align="center" wrap>
          <Web3Avatar address={ADDR_B} size={64} grid={6} />
          <Web3Avatar address={ADDR_B} size={64} grid={8} />
          <Web3Avatar address={ADDR_B} size={64} grid={12} />
        </Space>
      ),
      code: [
        '// grid 控制网格边长（格数，默认 8，越大纹样越细）',
        '<Web3Avatar address={ADDR_B} size={64} grid={6} />',
        '<Web3Avatar address={ADDR_B} size={64} grid={12} />',
      ].join('\n'),
    },
  ];
  const api: ApiRow[] = [
    { name: 'address', desc: '种子（同值恒得同图）', type: 'string' },
    { name: 'size', desc: '边长（px）', type: 'number', default: 'controlHeightLG' },
    { name: 'shape', desc: '形状', type: "'circle' | 'square'", default: "'square'" },
    { name: 'grid', desc: '网格边长（格数）', type: 'number', default: '8' },
  ];
  return <DemoPage demos={demos} api={api} />;
}

// 供 Gallery 单页聚合：五类各成一 DemoPage，纵向堆叠。
export function Web3AllDemo(): React.ReactElement {
  const { token } = useToken();
  return (
    <View style={{ gap: token.marginXL }}>
      <AddressDemo />
      <TokenPriceDemo />
      <PriceRangeDemo />
      <NFTCardDemo />
      <Web3AvatarDemo />
    </View>
  );
}
