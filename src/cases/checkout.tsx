// cases/checkout.tsx —— 「购物车结算 Checkout」整合案例（两栏）。
// 左=购物车条目（封面色块/名称/规格/单价/数量 InputNumber/小计/删除），右=订单摘要（优惠券、商品小计/优惠/运费、免邮进度、合计、去结算）。
// 交互：改数量、删条目、输入优惠券 FLUX10 打 9 折、满 ¥99 免运费实时联动，均为真实本地状态。全走 token 明暗自适应。
// 两栏用 plain flex 行；条目列表纵向 ScrollView。数据为示例商品（本类 App 无真实交易源）。
import React from 'react';
import {
  View,
  Text,
  Pressable,
  Icon,
  Input,
  Button,
  InputNumber,
  ScrollView,
  Progress,
  Divider,
  useToken,
  type AliasToken,
} from 'react-native-flux-desktop';

const SUMMARY_W = 360;
const FREE_SHIP = 99;
const COUPON = 'FLUX10';

interface Item {
  id: string;
  title: string;
  spec: string;
  price: number;
  qty: number;
  color: string;
}

const SEED: Item[] = [
  { id: 'p1', title: 'Flux 机械键盘 · 68 键', spec: '红轴 / RGB / 三模', price: 499, qty: 1, color: '#1677ff' },
  { id: 'p2', title: '4K 高刷显示器支架', spec: '气弹簧 / 27–32″', price: 329, qty: 2, color: '#13c2c2' },
  { id: 'p3', title: '桌面降噪麦克风', spec: '心形指向 / USB-C', price: 89, qty: 1, color: '#fa8c16' },
  { id: 'p4', title: '编织延长线 2m', spec: 'USB-C 100W', price: 39, qty: 3, color: '#52c41a' },
];

function money(n: number): string {
  return `¥${n.toFixed(2)}`;
}

export function CheckoutDemo(): React.ReactElement {
  const { token } = useToken();
  const [items, setItems] = React.useState<Item[]>(SEED);
  const [couponInput, setCouponInput] = React.useState('');
  const [applied, setApplied] = React.useState<string | null>(null);

  const setQty = (id: string, qty: number | null): void => {
    const q = Math.max(1, qty ?? 1);
    setItems((prev) => prev.map((it) => (it.id === id ? { ...it, qty: q } : it)));
  };
  const remove = (id: string): void => setItems((prev) => prev.filter((it) => it.id !== id));

  const subtotal = items.reduce((s, it) => s + it.price * it.qty, 0);
  const count = items.reduce((s, it) => s + it.qty, 0);
  const discount = applied ? Math.round(subtotal * 0.1 * 100) / 100 : 0;
  const afterDiscount = subtotal - discount;
  const shipping = afterDiscount >= FREE_SHIP || afterDiscount === 0 ? 0 : 8;
  const total = afterDiscount + shipping;
  const shipPct = Math.min(100, Math.round((afterDiscount / FREE_SHIP) * 100));

  const applyCoupon = (): void => {
    if (couponInput.trim().toUpperCase() === COUPON) setApplied(COUPON);
    else setApplied(null);
  };

  return (
    <View style={{ flex: 1, flexDirection: 'row', backgroundColor: token.colorBgContainer }}>
      {/* 左：购物车 */}
      <View style={{ flex: 1, minWidth: 0 }}>
        <View style={{ height: 60, flexDirection: 'row', alignItems: 'center', paddingHorizontal: token.paddingLG, gap: token.marginSM, borderBottomWidth: token.lineWidth, borderBottomColor: token.colorBorderSecondary }}>
          <Icon name="shoppingCart" size={18} color={token.colorPrimary} />
          <Text style={{ fontSize: token.fontSizeLG, fontWeight: '600', color: token.colorText }}>购物车</Text>
          <Text style={{ fontSize: 12, color: token.colorTextTertiary }}>共 {count} 件</Text>
        </View>
        <ScrollView style={{ flex: 1 }}>
          {items.map((it) => (
            <View key={it.id} style={{ flexDirection: 'row', alignItems: 'center', gap: token.margin, padding: token.paddingLG, paddingVertical: token.padding, borderBottomWidth: token.lineWidth, borderBottomColor: token.colorBorderSecondary }}>
              <View style={{ width: 64, height: 64, borderRadius: token.borderRadius, alignItems: 'center', justifyContent: 'center', backgroundColor: it.color }}>
                <Icon name="shoppingCart" size={24} color="#fff" />
              </View>
              <View style={{ flex: 1, minWidth: 0 }}>
                <Text style={{ fontSize: 14, fontWeight: '600', color: token.colorText }} numberOfLines={1}>{it.title}</Text>
                <Text style={{ fontSize: 12, color: token.colorTextTertiary, marginTop: 2 }}>{it.spec}</Text>
                <Text style={{ fontSize: 13, color: token.colorPrimary, marginTop: 4, fontWeight: '600' }}>{money(it.price)}</Text>
              </View>
              <View style={{ alignItems: 'flex-end', gap: token.marginXS }}>
                <Text style={{ fontSize: 14, fontWeight: '600', color: token.colorText }}>{money(it.price * it.qty)}</Text>
                <InputNumber value={it.qty} min={1} max={99} size="small" onChange={(v) => setQty(it.id, v)} style={{ width: 96 }} />
                <Pressable onPress={() => remove(it.id)} style={{ flexDirection: 'row', alignItems: 'center', gap: 3, cursor: 'pointer' }}>
                  <Icon name="delete" size={12} color={token.colorTextQuaternary} />
                  <Text style={{ fontSize: 11, color: token.colorTextQuaternary }}>删除</Text>
                </Pressable>
              </View>
            </View>
          ))}
          {!items.length ? (
            <View style={{ padding: token.paddingXL * 2, alignItems: 'center', gap: token.marginSM }}>
              <Icon name="shoppingCart" size={40} color={token.colorTextQuaternary} />
              <Text style={{ fontSize: 13, color: token.colorTextTertiary }}>购物车是空的</Text>
            </View>
          ) : null}
        </ScrollView>
      </View>

      {/* 右：订单摘要 */}
      <View style={{ width: SUMMARY_W, borderLeftWidth: token.lineWidth, borderLeftColor: token.colorBorderSecondary, padding: token.paddingLG, gap: token.margin }}>
        <Text style={{ fontSize: token.fontSizeLG, fontWeight: '600', color: token.colorText }}>订单摘要</Text>

        <View style={{ gap: token.marginXS }}>
          <Text style={{ fontSize: 12, color: token.colorTextSecondary }}>优惠券</Text>
          <View style={{ flexDirection: 'row', gap: token.marginXS }}>
            <View style={{ flex: 1 }}>
              <Input value={couponInput} onChange={setCouponInput} placeholder={`输入码 ${COUPON} 9折`} size="small" allowClear prefix={<Icon name="zap" size={14} color={token.colorTextTertiary} />} />
            </View>
            <Button size="small" type="primary" onPress={applyCoupon}>应用</Button>
          </View>
          {applied ? (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <Icon name="check" size={12} color={token.colorSuccess} />
              <Text style={{ fontSize: 12, color: token.colorSuccess }}>已使用 {applied}，立减 10%</Text>
            </View>
          ) : null}
        </View>

        <Divider style={{ marginVertical: token.marginXS }} />

        <SumRow token={token} label="商品小计" value={money(subtotal)} />
        {discount > 0 ? <SumRow token={token} label="优惠" value={`-${money(discount)}`} accent={token.colorSuccess} /> : null}
        <SumRow token={token} label="运费" value={shipping === 0 ? '免运费' : money(shipping)} accent={shipping === 0 ? token.colorSuccess : undefined} />

        {afterDiscount < FREE_SHIP ? (
          <View style={{ gap: 4 }}>
            <Text style={{ fontSize: 12, color: token.colorTextSecondary }}>再买 {money(FREE_SHIP - afterDiscount)} 免运费</Text>
            <Progress percent={shipPct} size="small" showInfo={false} />
          </View>
        ) : (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <Icon name="check" size={13} color={token.colorSuccess} />
            <Text style={{ fontSize: 12, color: token.colorSuccess }}>已满包邮门槛</Text>
          </View>
        )}

        <Divider style={{ marginVertical: token.marginXS }} />

        <View style={{ flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between' }}>
          <Text style={{ fontSize: 14, color: token.colorText }}>合计</Text>
          <Text style={{ fontSize: token.fontSizeXL, fontWeight: '700', color: token.colorPrimary }}>{money(total)}</Text>
        </View>

        <Button type="primary" block size="large" onPress={() => {}}>
          <Text style={{ color: '#fff', fontSize: 15, fontWeight: '600' }}>去结算（{count}）</Text>
        </Button>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
          <Icon name="shield" size={12} color={token.colorTextTertiary} />
          <Text style={{ fontSize: 11, color: token.colorTextTertiary }}>支付加密保护 · 支持 7 天无理由</Text>
        </View>
      </View>
    </View>
  );
}

function SumRow(props: { token: AliasToken; label: string; value: string; accent?: string }): React.ReactElement {
  const { token } = props;
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
      <Text style={{ fontSize: 13, color: token.colorTextSecondary }}>{props.label}</Text>
      <Text style={{ fontSize: 13, color: props.accent ?? token.colorText, fontWeight: props.accent ? '600' : '400' }}>{props.value}</Text>
    </View>
  );
}

export default CheckoutDemo;
