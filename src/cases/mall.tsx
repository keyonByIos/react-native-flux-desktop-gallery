// 案例 / 商城首页 Mall Shop：参照淘宝 PC 首页的整页组合——纯用既有组件拼高密度可交互电商首页。
// 结构（自上而下）：顶部信息条 → Logo+搜索主导航 → 三栏 hero（左类目栏 | 轮播 | 用户卡）→ 补贴横幅 →
//                  限时秒杀（紧凑）→ 猜你喜欢（每排 5 卡密集网格）→ 页脚。购物车仍为内联展开面板。
// 整洁约束：间距/字号全走 token；同排卡片等高（行直接子项 + alignItems:stretch）；wrap 行内不用 flex:1。
import React from 'react';
import {
  View, Text, ImageBox, Pressable, Card, Tag, Button, Badge, Search, Carousel,
  Segmented, CountDown, Rate, Progress, InputNumber, Message, Empty, Icon, Avatar,
  useToken, fade, type MessageType,
} from 'react-native-flux-desktop';

/* ────────────────────────── 静态数据 ────────────────────────── */

interface Cat { icon: string; label: string; color: string; group: Group }
type Group = '数码' | '服饰' | '家居' | '美妆';
const CATS: Cat[] = [
  { icon: 'smartphone', label: '手机数码', color: '#2f54eb', group: '数码' },
  { icon: 'laptop', label: '电脑办公', color: '#13c2c2', group: '数码' },
  { icon: 'film', label: '影音娱乐', color: '#08979c', group: '数码' },
  { icon: 'shoppingBag', label: '服饰鞋包', color: '#eb2f96', group: '服饰' },
  { icon: 'activity', label: '运动户外', color: '#52c41a', group: '服饰' },
  { icon: 'tv', label: '家用电器', color: '#722ed1', group: '家居' },
  { icon: 'home', label: '家居家装', color: '#faad14', group: '家居' },
  { icon: 'gift', label: '食品生鲜', color: '#fa8c16', group: '家居' },
  { icon: 'droplet', label: '美妆护肤', color: '#f5222d', group: '美妆' },
  { icon: 'smile', label: '母婴玩具', color: '#ff7875', group: '美妆' },
];

interface Goods { id: number; name: string; sub: string; group: Group; price: number; old: number; rate: number; sold: string; tag?: string; shop: string; ship?: string }
const GOODS: Goods[] = [
  { id: 1, name: '降噪耳机 Pro', sub: '42dB 主动降噪 · 30h 续航', group: '数码', price: 499, old: 699, rate: 4.8, sold: '1.2万', tag: '自营', shop: 'Flux 官方旗舰店', ship: '包邮' },
  { id: 2, name: '机械键盘 87 键', sub: 'Gasket 结构 · 三模连接', group: '数码', price: 329, old: 429, rate: 4.7, sold: '8600', tag: '新品', shop: '外设优选店', ship: '包邮' },
  { id: 3, name: '智能手表 S2', sub: '血氧心率 · 双频 GPS', group: '数码', price: 899, old: 1099, rate: 4.6, sold: '5400', tag: '自营', shop: 'Flux 官方旗舰店' },
  { id: 4, name: '便携充电宝 20K', sub: '22.5W 快充 · 可上飞机', group: '数码', price: 129, old: 169, rate: 4.9, sold: '3.1万', shop: '充电配件城', ship: '包邮' },
  { id: 5, name: '纯棉圆领 T 恤', sub: '220g 重磅 · 三色可选', group: '服饰', price: 79, old: 129, rate: 4.5, sold: '2.3万', tag: '爆款', shop: '基础服饰工厂店', ship: '运费险' },
  { id: 6, name: '轻量冲锋衣', sub: '三防面料 · 可收纳', group: '服饰', price: 359, old: 599, rate: 4.7, sold: '6200', shop: '户外装备库', ship: '包邮' },
  { id: 7, name: '亚麻通勤衬衫', sub: '免烫抗皱 · 合身版型', group: '服饰', price: 199, old: 259, rate: 4.4, sold: '3800', shop: '衣橱精选店', ship: '运费险' },
  { id: 8, name: '香薰加湿器', sub: '静音大雾量 · 精油可用', group: '家居', price: 149, old: 199, rate: 4.6, sold: '1.8万', tag: '自营', shop: '生活美学馆', ship: '包邮' },
  { id: 9, name: '全棉四件套', sub: 'A 类母婴级 · 1.8m 床', group: '家居', price: 429, old: 599, rate: 4.8, sold: '4200', shop: '家纺严选店' },
  { id: 10, name: '陶瓷马克杯', sub: '简约哑光 · 420ml', group: '家居', price: 39, old: 59, rate: 4.5, sold: '5.6万', shop: '器物志小铺', ship: '包邮' },
  { id: 11, name: '精华水乳套装', sub: '烟酰胺提亮 · 混油适用', group: '美妆', price: 289, old: 399, rate: 4.7, sold: '9800', tag: '爆款', shop: '美妆直营店', ship: '赠品' },
  { id: 12, name: '哑光口红 03', sub: '丝绒雾面 · 持久不沾杯', group: '美妆', price: 159, old: 210, rate: 4.6, sold: '1.4万', shop: '美妆直营店', ship: '包邮' },
  { id: 13, name: '无线鼠标静音版', sub: '人体工学 · 双模 1200DPI', group: '数码', price: 89, old: 139, rate: 4.5, sold: '2.7万', shop: '外设优选店', ship: '包邮' },
  { id: 14, name: '速干运动短袖', sub: '冰丝凉感 · 跑步健身', group: '服饰', price: 59, old: 99, rate: 4.6, sold: '3.4万', tag: '爆款', shop: '户外装备库', ship: '运费险' },
  { id: 15, name: '懒人收纳推车', sub: '三层可移动 · 免安装', group: '家居', price: 119, old: 179, rate: 4.7, sold: '1.1万', shop: '生活美学馆', ship: '包邮' },
];

interface Flash { id: number; name: string; price: number; old: number; pct: number }
const FLASH: Flash[] = [
  { id: 101, name: '蓝牙耳机 Air', price: 99, old: 199, pct: 86 },
  { id: 102, name: '电动牙刷 X3', price: 129, old: 249, pct: 62 },
  { id: 103, name: '落地风扇 Pro', price: 199, old: 349, pct: 45 },
  { id: 104, name: '便携榨汁杯', price: 69, old: 139, pct: 78 },
  { id: 105, name: '筋膜按摩枪', price: 259, old: 499, pct: 71 },
];

const BANNERS = [
  { seed: 'mall-b1', caption: '秋季焕新 · 全场每满 300 减 50', sub: '跨店满减 叠券更低' },
  { seed: 'mall-b2', caption: '数码狂欢周 · 爆款 12 期免息', sub: '大牌新品首发直降' },
  { seed: 'mall-b3', caption: '会员日 · 大额券限量开抢', sub: '88VIP 再享 95 折' },
];
const bannerUri = (s: string): string => `https://picsum.photos/seed/${s}/1200/500`;
const goodsUri = (id: number): string => `https://picsum.photos/seed/mall-g${id}/400/300`;
const HOT_WORDS = ['耳机', '冲锋衣', '四件套', '口红', '充电宝'];

const money = (v: number): string => (Number.isInteger(v) ? `¥${v}` : `¥${v.toFixed(2)}`);

/* ────────────────────────── 小组件 ────────────────────────── */

/** 区块头：左标题右附注，全页统一节奏（紧凑版：字号降一档） */
function SectionHead(props: { title: string; flame?: boolean; extra?: React.ReactNode }): React.ReactElement {
  const { token } = useToken();
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: token.marginXS }}>
        <View style={{ width: 3, height: token.fontSizeLG, borderRadius: 1.5, backgroundColor: token.colorPrimary }} />
        <Text style={{ fontSize: token.fontSizeLG, fontWeight: '600', color: token.colorText }}>{props.title}</Text>
        {props.flame ? <Icon name="zap" size={14} color={token.colorError} /> : null}
      </View>
      {props.extra ?? null}
    </View>
  );
}

/** 顶部信息条上的文字链 */
function TopLink(props: { icon: string; label: string; onPress: () => void }): React.ReactElement {
  const { token } = useToken();
  return (
    <Pressable onPress={props.onPress} style={{ flexDirection: 'row', alignItems: 'center', gap: token.marginXXS, cursor: 'pointer' }}>
      <Icon name={props.icon} size={12} color={token.colorTextSecondary} />
      <Text style={{ fontSize: token.fontSizeSM, color: token.colorTextSecondary }}>{props.label}</Text>
    </Pressable>
  );
}

/* ────────────────────────── 主组件 ────────────────────────── */

interface CartLine { goods: Goods; qty: number }

export function MallDemo(): React.ReactElement {
  const { token } = useToken();
  const [query, setQuery] = React.useState('');
  const [group, setGroup] = React.useState<'全部' | Group>('全部');
  const [activeCat, setActiveCat] = React.useState<string | null>(null);
  const [hotIdx, setHotIdx] = React.useState(0);
  const [cart, setCart] = React.useState<Record<number, CartLine>>({});
  const [cartOpen, setCartOpen] = React.useState(false);
  const [msg, setMsg] = React.useState<{ type: MessageType; content: string } | null>(null);

  // 搜索框热词轮播（淘宝式 placeholder 轮换）
  React.useEffect(() => {
    const t = setInterval(() => setHotIdx((i) => (i + 1) % HOT_WORDS.length), 3000);
    return () => clearInterval(t);
  }, []);

  const toast = (type: MessageType, content: string): void => setMsg({ type, content });
  const addCart = (g: Goods): void => {
    setCart((c) => ({ ...c, [g.id]: { goods: g, qty: (c[g.id]?.qty ?? 0) + 1 } }));
    toast('success', `已加入购物车：${g.name}`);
  };
  const setQty = (id: number, qty: number | null): void => {
    setCart((c) => {
      const line = c[id];
      if (!line) return c;
      if (!qty || qty <= 0) {
        const { [id]: _drop, ...rest } = c;
        return rest;
      }
      return { ...c, [id]: { ...line, qty } };
    });
  };

  const lines = Object.values(cart).sort((a, b) => a.goods.id - b.goods.id);
  const cartCount = lines.reduce((s, l) => s + l.qty, 0);
  const cartTotal = lines.reduce((s, l) => s + l.goods.price * l.qty, 0);

  const shown = GOODS.filter(
    (g) => (group === '全部' || g.group === group) && (!query || g.name.includes(query) || g.sub.includes(query)),
  );
  const rows: Goods[][] = [];
  for (let i = 0; i < shown.length; i += 5) rows.push(shown.slice(i, i + 5));

  const tint = (c: string, a = 0.06): string => fade(c, a);

  return (
    <View style={{ gap: token.margin, position: 'relative' }}>
      {/* ── 顶部信息条 ── */}
      <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: token.paddingSM, paddingVertical: token.paddingXXS, borderRadius: token.borderRadius, backgroundColor: token.colorFillQuaternary }}>
        <Text style={{ fontSize: token.fontSizeSM, color: token.colorTextSecondary }}>嗨，欢迎来到 Flux 商城</Text>
        <View style={{ flex: 1 }} />
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: token.marginMD }}>
          <TopLink icon="bell" label="消息" onPress={() => toast('info', '暂无新消息')} />
          <TopLink icon="file" label="我的订单" onPress={() => toast('info', '订单列表为演示占位')} />
          <TopLink icon="heart" label="收藏夹" onPress={() => toast('info', '收藏夹为演示占位')} />
          <TopLink icon="creditCard" label="充值" onPress={() => toast('info', '充值通道演示占位')} />
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: token.marginXS }}>
            <Avatar size={20} icon="user" style={{ backgroundColor: token.colorPrimary }} />
            <Text style={{ fontSize: token.fontSizeSM, color: token.colorText }}>keyon_88vip</Text>
          </View>
        </View>
      </View>

      {/* ── Logo + 搜索主导航 ── */}
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: token.marginSM }}>
        <Pressable onPress={() => { setQuery(''); setGroup('全部'); }} style={{ flexDirection: 'row', alignItems: 'center', gap: token.marginXS, flexShrink: 0, cursor: 'pointer' }}>
          <View style={{ width: 34, height: 34, borderRadius: token.borderRadius, alignItems: 'center', justifyContent: 'center', backgroundColor: '#ff5000' }}>
            <Icon name="shoppingBag" size={18} color="#ffffff" />
          </View>
          <Text style={{ fontSize: token.fontSizeXL, fontWeight: '700', color: '#ff5000' }}>Flux 淘选</Text>
        </Pressable>
        <View style={{ flex: 1, minWidth: 0 }}>
          <Search
            placeholder={`大家都在搜：${HOT_WORDS[hotIdx]}`}
            enterButton="搜索"
            onSearch={(v) => { setQuery(v.trim()); setGroup('全部'); }}
          />
        </View>
        {query ? <Tag closable onClose={() => setQuery('')} icon="search" style={{ flexShrink: 0 }}>{query}</Tag> : null}
        <Pressable onPress={() => setCartOpen((v) => !v)} style={{ flexShrink: 0 }}>
          <Button type={cartOpen ? 'primary' : 'default'} icon={<Icon name="shoppingCart" size={token.fontSize} />}>
            <Badge count={cartCount} offset={[6, -2]}>购物车</Badge>
          </Button>
        </Pressable>
      </View>

      {/* ── 购物车面板（内联展开；本栈无 portal，Drawer 锚定不可靠，沿用面板方案）── */}
      {cartOpen ? (
        <Card
          size="small"
          title={`购物车（${cartCount} 件）`}
          extra={(<Button type="link" size="small" onPress={() => setCartOpen(false)}>收起</Button>)}
          bodyStyle={{ padding: token.paddingSM, gap: token.marginXS }}
        >
          {lines.length === 0 ? (
            <Empty description="购物车空空如也" imageSize={72} />
          ) : (
            lines.map((l) => (
              <View key={l.goods.id} style={{ flexDirection: 'row', alignItems: 'center', gap: token.marginSM, padding: token.paddingXS, borderRadius: token.borderRadiusLG, backgroundColor: token.colorFillQuaternary }}>
                <ImageBox src={goodsUri(l.goods.id)} width={44} height={44} />
                <View style={{ flex: 1, minWidth: 0, gap: token.marginXXS }}>
                  <Text style={{ fontSize: token.fontSizeSM, color: token.colorText }}>{l.goods.name}</Text>
                  <Text style={{ fontSize: token.fontSizeSM, color: token.colorTextTertiary }}>{money(l.goods.price)} × {l.qty}</Text>
                </View>
                <InputNumber size="small" min={1} max={99} value={l.qty} onChange={(v) => setQty(l.goods.id, v)} style={{ width: 68 }} />
                <Pressable onPress={() => setQty(l.goods.id, 0)} style={{ padding: token.paddingXXS }}>
                  <Icon name="delete" size={token.fontSizeSM} color={token.colorTextTertiary} />
                </Pressable>
              </View>
            ))
          )}
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: token.marginSM }}>
            <Button size="small" onPress={() => { setCart({}); toast('info', '已清空购物车'); }}>清空</Button>
            <View style={{ flex: 1 }} />
            <Text style={{ fontSize: token.fontSizeSM, color: token.colorTextTertiary }}>合计</Text>
            <Text style={{ fontSize: token.fontSizeLG, fontWeight: '600', color: token.colorError }}>{money(cartTotal)}</Text>
            <Button
              type="primary"
              onPress={() => {
                if (!lines.length) { toast('warning', '购物车还是空的'); return; }
                setCart({}); setCartOpen(false); toast('success', `下单成功，共 ${cartCount} 件 · ${money(cartTotal)}`);
              }}
            >
              去结算
            </Button>
          </View>
        </Card>
      ) : null}

      {/* ── 三栏 hero：左类目栏 | 轮播 | 用户卡 ── */}
      <View style={{ flexDirection: 'row', alignItems: 'stretch', gap: token.marginSM }}>
        {/* 左：全部分类竖排（点击联动右侧商品过滤） */}
        <View style={{ width: 152, flexShrink: 0, borderRadius: token.borderRadiusLG, backgroundColor: token.colorBgContainer, borderWidth: token.lineWidth, borderColor: token.colorBorderSecondary, paddingVertical: token.marginXXS, overflow: 'hidden' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: token.marginXS, paddingHorizontal: token.paddingSM, paddingVertical: token.paddingXS }}>
            <Icon name="bars" size={13} color={token.colorTextSecondary} />
            <Text style={{ fontSize: token.fontSize, fontWeight: '600', color: token.colorText }}>全部商品分类</Text>
          </View>
          {CATS.map((c) => {
            const active = activeCat === c.label;
            return (
              <Pressable
                key={c.label}
                onPress={() => { setActiveCat(c.label); setGroup(c.group); toast('info', `已按「${c.label}」筛选到 ${c.group} 大类`); }}
                style={{ flexDirection: 'row', alignItems: 'center', gap: token.marginXS, paddingHorizontal: token.paddingSM, paddingVertical: token.paddingXXS, cursor: 'pointer', backgroundColor: active ? tint(token.colorPrimary, 0.1) : 'transparent' }}
              >
                <Icon name={c.icon} size={13} color={active ? token.colorPrimary : token.colorTextSecondary} />
                <Text style={{ flex: 1, fontSize: token.fontSizeSM, color: active ? token.colorPrimary : token.colorText }}>{c.label}</Text>
                <Icon name="right" size={10} color={token.colorTextQuaternary} />
              </Pressable>
            );
          })}
        </View>

        {/* 中：促销轮播 */}
        <View style={{ flex: 1, minWidth: 0 }}>
          <Carousel
            height={330}
            autoPlay={4000}
            arrows
            dots
            preload={BANNERS.map((b) => bannerUri(b.seed))}
            slides={BANNERS.map((b) => (
              <View key={b.seed} style={{ position: 'relative', width: '100%', height: 330, borderRadius: token.borderRadiusLG, overflow: 'hidden' }}>
                <ImageBox src={bannerUri(b.seed)} width="100%" height={330} radius={0} />
                <View style={{ position: 'absolute', left: 0, right: 0, bottom: 0, paddingHorizontal: token.padding, paddingVertical: token.paddingSM, backgroundColor: fade('#000000', 0.55) }}>
                  <Text style={{ fontSize: token.fontSizeLG, fontWeight: '600', color: '#ffffff' }}>{b.caption}</Text>
                  <Text style={{ fontSize: token.fontSizeSM, color: fade('#ffffff', 0.85), marginTop: 2 }}>{b.sub}</Text>
                </View>
              </View>
            ))}
          />
        </View>

        {/* 右：用户/会员信息卡 */}
        <View style={{ width: 190, flexShrink: 0, borderRadius: token.borderRadiusLG, backgroundColor: token.colorBgContainer, borderWidth: token.lineWidth, borderColor: token.colorBorderSecondary, padding: token.paddingSM, gap: token.marginXS }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: token.marginXS }}>
            <Avatar size={36} icon="user" style={{ backgroundColor: '#ff5000' }} />
            <View style={{ gap: 2 }}>
              <Text style={{ fontSize: token.fontSize, fontWeight: '600', color: token.colorText }}>keyon_88vip</Text>
              <Tag bordered={false} color="orange" style={{ marginRight: 0 }}>黄金会员</Tag>
            </View>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: token.marginXS, paddingVertical: token.paddingXXS }}>
            <Text style={{ fontSize: token.fontSizeXL, fontWeight: '700', color: '#ff5000' }}>1280</Text>
            <Text style={{ fontSize: token.fontSizeSM, color: token.colorTextTertiary }}>淘金币 · 5 张券可用</Text>
          </View>
          <View style={{ height: token.lineWidth, backgroundColor: token.colorBorderSecondary }} />
          {/* 快捷入口 2×2 */}
          <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
            {[
              { icon: 'file', label: '待付款' }, { icon: 'package', label: '待发货' },
              { icon: 'truck', label: '待收货' }, { icon: 'messageSquare', label: '待评价' },
            ].map((q) => (
              <Pressable key={q.label} onPress={() => toast('info', `「${q.label}」为演示占位`)} style={{ width: '50%', alignItems: 'center', paddingVertical: token.paddingXS, gap: 2, cursor: 'pointer' }}>
                <Icon name={q.icon} size={16} color={token.colorTextSecondary} />
                <Text style={{ fontSize: token.fontSizeSM, color: token.colorTextSecondary }}>{q.label}</Text>
              </Pressable>
            ))}
          </View>
          <View style={{ height: token.lineWidth, backgroundColor: token.colorBorderSecondary }} />
          {/* 公告 */}
          <View style={{ gap: 3 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: token.marginXXS }}>
              <Icon name="sound" size={12} color={token.colorError} />
              <Text style={{ fontSize: token.fontSizeSM, fontWeight: '600', color: token.colorText }}>公告</Text>
            </View>
            {['秋季焕新季 满 300 减 50', '会员日大额券 10 点开抢'].map((n) => (
              <Text key={n} numberOfLines={1} style={{ fontSize: token.fontSizeSM, color: token.colorTextTertiary }}>· {n}</Text>
            ))}
          </View>
          <View style={{ flex: 1 }} />
          <Button size="small" block icon={<Icon name="star" size={12} />} onPress={() => toast('success', '签到成功 +20 淘金币（演示）')}>
            签到领淘金币
          </Button>
        </View>
      </View>

      {/* ── 补贴/频道横幅条：三块彩色入口 ── */}
      <View style={{ flexDirection: 'row', alignItems: 'stretch', gap: token.marginSM }}>
        {[
          { icon: 'percent', title: '百亿补贴', sub: '品牌正品 · 买贵必赔', color: '#ff5000' },
          { icon: 'play', title: '直播好物', sub: '主播同款 · 限时直降', color: '#ff5000' },
          { icon: 'zap', title: '秒杀频道', sub: '整点抢购 · 手慢无', color: '#ff5000' },
        ].map((b) => (
          <Pressable key={b.title} onPress={() => toast('info', `「${b.title}」频道为演示占位`)} style={{ flex: 1, minWidth: 0, flexDirection: 'row', alignItems: 'center', gap: token.marginSM, borderRadius: token.borderRadiusLG, borderWidth: token.lineWidth, borderColor: fade(b.color, 0.25), backgroundColor: fade(b.color, 0.06), paddingHorizontal: token.padding, paddingVertical: token.paddingSM, cursor: 'pointer' }}>
            <View style={{ width: 30, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center', backgroundColor: fade(b.color, 0.15) }}>
              <Icon name={b.icon} size={16} color={b.color} />
            </View>
            <View style={{ flex: 1, minWidth: 0, gap: 2 }}>
              <Text style={{ fontSize: token.fontSize, fontWeight: '600', color: b.color }}>{b.title}</Text>
              <Text style={{ fontSize: token.fontSizeSM, color: token.colorTextTertiary }}>{b.sub}</Text>
            </View>
            <Icon name="right" size={12} color={fade(b.color, 0.6)} />
          </Pressable>
        ))}
      </View>

      {/* ── 限时秒杀（紧凑：每排 5、矮图、价+进度） ── */}
      <View style={{ gap: token.marginXS }}>
        <SectionHead
          title="限时秒杀"
          flame
          extra={(
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: token.marginXS }}>
              <Text style={{ fontSize: token.fontSizeSM, color: token.colorTextTertiary }}>距结束</Text>
              <CountDown leftTime={2 * 3600_000 + 18 * 60_000} format="HH:mm:ss" valueStyle={{ color: token.colorError, fontSize: token.fontSizeSM }} />
            </View>
          )}
        />
        <View style={{ flexDirection: 'row', alignItems: 'stretch', gap: token.marginSM }}>
          {FLASH.map((f) => (
            <Card key={f.id} size="small" style={{ flex: 1, minWidth: 0 }} bodyStyle={{ padding: token.paddingSM }}>
              <View style={{ gap: token.marginXS }}>
                <ImageBox src={`https://picsum.photos/seed/mall-f${f.id}/400/240`} width="100%" height={96} radius={token.borderRadius} />
                <Text numberOfLines={1} style={{ fontSize: token.fontSizeSM, color: token.colorText }}>{f.name}</Text>
                <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: token.marginXS }}>
                  <Text style={{ fontSize: token.fontSizeLG, fontWeight: '700', color: token.colorError }}>{money(f.price)}</Text>
                  <Text style={{ fontSize: 11, color: token.colorTextQuaternary, textDecorationLine: 'line-through' }}>{money(f.old)}</Text>
                </View>
                <Progress percent={f.pct} size="small" showInfo={false} strokeColor={token.colorError} format={() => ''} />
                <Text style={{ fontSize: 11, color: token.colorTextTertiary }}>已抢 {f.pct}% · 点击抢购</Text>
              </View>
            </Card>
          ))}
        </View>
      </View>

      {/* ── 猜你喜欢：分类过滤 + 每排 5 卡密集网格 ── */}
      <View style={{ gap: token.marginXS }}>
        <SectionHead
          title="猜你喜欢"
          extra={(
            <Segmented
              size="small"
              options={['全部', '数码', '服饰', '家居', '美妆']}
              value={group}
              onChange={(v) => setGroup(v as '全部' | Group)}
            />
          )}
        />
        {shown.length === 0 ? (
          <Card bodyStyle={{ padding: token.paddingLG }}>
            <Empty description={`没有匹配「${query || group}」的商品`} />
          </Card>
        ) : (
          rows.map((row, ri) => (
            <View key={ri} style={{ flexDirection: 'row', alignItems: 'stretch', gap: token.marginSM }}>
              {row.map((g) => (
                <Card key={g.id} hoverable size="small" style={{ flex: 1, minWidth: 0 }} bodyStyle={{ padding: token.paddingSM }}>
                  <View style={{ gap: token.marginXS }}>
                    <ImageBox src={goodsUri(g.id)} width="100%" height={128} radius={token.borderRadius} />
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: token.marginXS }}>
                      {g.tag ? <Tag color="red" bordered={false} style={{ marginRight: 0, fontSize: 11 }}>{g.tag}</Tag> : null}
                      <Text numberOfLines={1} style={{ flex: 1, minWidth: 0, fontSize: token.fontSizeSM, color: token.colorText, fontWeight: '500' }}>{g.name}</Text>
                    </View>
                    <Text numberOfLines={1} style={{ fontSize: 11, color: token.colorTextTertiary }}>{g.sub}</Text>
                    <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: token.marginXS }}>
                      <Text style={{ fontSize: token.fontSizeLG, fontWeight: '700', color: '#ff5000' }}>{money(g.price)}</Text>
                      <Text style={{ fontSize: 11, color: token.colorTextQuaternary, textDecorationLine: 'line-through' }}>{money(g.old)}</Text>
                      <View style={{ flex: 1 }} />
                      <Text style={{ fontSize: 11, color: token.colorTextTertiary }}>{g.sold}人付款</Text>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: token.marginXS }}>
                      <Rate readOnly allowHalf value={g.rate} size={10} gap={1} />
                      {g.ship ? <Tag bordered={false} color="green" style={{ marginRight: 0, fontSize: 11 }}>{g.ship}</Tag> : null}
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: token.marginXS }}>
                      <Text numberOfLines={1} style={{ flex: 1, minWidth: 0, fontSize: 11, color: token.colorTextTertiary }}>{g.shop}</Text>
                      <Button type="primary" size="small" icon={<Icon name="shoppingCart" size={11} />} onPress={() => addCart(g)}>加购</Button>
                    </View>
                  </View>
                </Card>
              ))}
              {/* 末行补空位保持卡宽一致 */}
              {row.length < 5 ? Array.from({ length: 5 - row.length }, (_, k) => <View key={`ph${k}`} style={{ flex: 1 }} />) : null}
            </View>
          ))
        )}
      </View>

      {/* ── 页脚 ── */}
      <View style={{ alignItems: 'center', gap: token.marginXS, paddingVertical: token.marginSM, borderTopWidth: token.lineWidth, borderTopColor: token.colorBorderSecondary }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: token.marginMD }}>
          {['关于 Flux', '商家入驻', '联系客服', '意见反馈', '开放平台'].map((l) => (
            <Pressable key={l} onPress={() => toast('info', `「${l}」为演示占位`)} style={{ cursor: 'pointer' }}>
              <Text style={{ fontSize: token.fontSizeSM, color: token.colorTextSecondary }}>{l}</Text>
            </Pressable>
          ))}
        </View>
        <Text style={{ fontSize: 11, color: token.colorTextQuaternary }}>Flux 淘选 · 本页面为 react-native-flux-desktop 组件演示，商品与店铺均为虚构</Text>
      </View>

      {/* ── 全局轻提示（锚页首，本栈无 portal）── */}
      {msg ? (
        <Message open type={msg.type} content={msg.content} duration={2200} onClose={() => setMsg(null)} />
      ) : null}
    </View>
  );
}

export default MallDemo;
