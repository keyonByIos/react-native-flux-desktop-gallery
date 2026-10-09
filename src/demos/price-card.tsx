// PRICE-CARD：定价方案卡 / 方案表。DemoPage 多段式：单卡 / 三档并排（含推荐高亮）/ 权益三态。
import React from 'react';
import { Text, View, useToken, type PriceCardProps } from 'react-native-flux-desktop';
import { PriceTable } from 'react-native-flux-desktop-pro';
import { DemoPage, type DemoItem, type ApiRow, type TokenRow } from '../DemoPage';

const PLANS: PriceCardProps[] = [
  {
    name: '免费版',
    description: '个人尝鲜，核心功能全都有',
    price: 0,
    currency: '¥',
    period: '/月',
    note: '无需绑卡',
    features: [
      { label: '3 个项目', included: true },
      { label: '社区支持', included: true },
      { label: '团队协作', included: false },
      { label: '高级分析', included: false },
    ],
    actionText: '免费开始',
  },
  {
    name: '专业版',
    description: '面向成长型团队的最佳选择',
    price: 99,
    currency: '¥',
    period: '/人/月',
    note: '按年计费，立省 20%',
    recommended: true,
    badge: '最受欢迎',
    features: [
      { label: '无限项目', included: true },
      { label: '团队协作', included: true },
      { label: '高级分析与报表', included: true },
      { label: '优先技术支持', included: true },
    ],
    actionText: '立即升级',
  },
  {
    name: '企业版',
    description: '为大规模部署而生',
    price: '定制',
    note: '联系销售获取方案',
    features: [
      { label: '包含专业版全部', included: true },
      { label: '私有化部署', included: true },
      { label: 'SSO / 审计日志', included: 'plus' },
      { label: '专属客户成功经理', included: 'plus' },
    ],
    actionText: '联系销售',
  },
];

function BuyFeedback(): React.ReactElement {
  const { token } = useToken();
  const [bought, setBought] = React.useState<string | null>(null);
  return (
    <View style={{ gap: token.marginSM }}>
      <PriceTable
        items={PLANS.map((p) => ({ ...p, onAction: () => setBought(String(p.name)) }))}
      />
      <Text style={{ fontSize: token.fontSizeSM, color: token.colorTextTertiary }}>
        {bought ? `已选择「${bought}」—— onAction 回调触发` : '点任意方案的按钮试试 onAction'}
      </Text>
    </View>
  );
}

const FEATURE_STATE: PriceCardProps = {
  name: '权益三态',
  description: '演示三种权益标记',
  price: 49,
  currency: '¥',
  period: '/月',
  features: [
    { label: '已包含的基础能力', included: true },
    { label: '可选增值：短信通道', included: 'plus' },
    { label: '不包含：私有部署', included: false },
  ],
  actionText: '选择',
};

/** 5 档方案：perRow=3 自动分行（上行 3 + 下行 2 补空位），验证超量不丢画 */
const MORE_PLANS: PriceCardProps[] = [
  ...PLANS,
  { name: '团队版', description: '中小团队协作', price: 59, currency: '¥', period: '/人/月', features: [{ label: '10 个项目', included: true }, { label: '团队协作', included: true }, { label: '高级分析', included: false }], actionText: '选择' },
  { name: '旗舰版', description: '大厂定制部署', price: 299, currency: '¥', period: '/人/月', features: [{ label: '全部功能', included: true }, { label: '专属支持', included: 'plus' }], actionText: '选择' },
];

const DEMOS: DemoItem[] = [
  {
    name: '方案对比 PriceTable',
    desc: '三档并排等分、等高对齐；专业版主色描边 + 顶部「最受欢迎」角标 + 主色胶囊按钮聚焦；免费版不含项打叉置灰、企业版增值项用加号',
    node: <PriceTable items={PLANS} />,
    code: [
      'import { PriceTable } from "react-native-flux-desktop";',
      '',
      '// 一排方案卡等分并排、等高对齐；recommended 主色高亮',
      'const items = [',
      '  { name: \'免费版\', price: 0, currency: \'¥\', period: \'/月\', actionText: \'免费开始\',',
      '    features: [{ label: \'3 个项目\', included: true }, { label: \'团队协作\', included: false }] },',
      '  { name: \'专业版\', price: 99, recommended: true, badge: \'最受欢迎\', actionText: \'立即升级\' },',
      '];',
      '<PriceTable items={items} />',
    ].join('\n'),
  },
  {
    name: 'onAction 选择回显',
    desc: '每张卡传 onAction：点按钮即回调（下方文本回显所选方案）；单张 PriceCard 亦可自由组合',
    node: <BuyFeedback />,
    code: [
      'import { PriceTable } from "react-native-flux-desktop";',
      '',
      '// 每张卡传 onAction：点 CTA 即回调',
      'const items = PLANS.map((p) => ({ ...p, onAction: () => choose(p.name) }));',
      '<PriceTable items={items} />',
    ].join('\n'),
  },
  {
    name: '权益三态',
    desc: 'included=true 绿色打勾 / false 灰色打叉且文案置灰 / "plus" 橙色加号（可选增值）',
    node: <PriceTable items={[FEATURE_STATE]} itemWidth={320} />,
    code: [
      'import { PriceTable } from "react-native-flux-desktop";',
      '',
      '// features.included: true 打勾 / false 打叉 / \'plus\' 加号',
      '<PriceTable',
      '  items={[{',
      '    name: \'权益三态\', price: 49, currency: \'¥\', period: \'/月\',',
      '    features: [',
      '      { label: \'已包含\', included: true },',
      '      { label: \'可选增值\', included: \'plus\' },',
      '      { label: \'不包含\', included: false },',
      '    ],',
      '  }]}',
      '  itemWidth={320}',
      '/>',
    ].join('\n'),
  },
  {
    name: '多行分行 perRow',
    desc: '5 档方案每行最多 3 张自动分组（上行 3 + 下行 2 补空位对齐卡宽）；本 Yoga 下 flexWrap+flex:1 会丢画，故用按行分组替代',
    node: <PriceTable items={MORE_PLANS} perRow={3} />,
    code: [
      'import { PriceTable } from "react-native-flux-desktop";',
      '',
      '// perRow 控制每行最多卡数，超量自动分行；末行补空位对齐',
      '<PriceTable items={FIVE_PLANS} perRow={3} />',
    ].join('\n'),
  },
];

const API: ApiRow[] = [
  { name: 'name / description', desc: '方案名与一句话卖点', type: 'ReactNode', default: '–' },
  { name: 'price / currency / period', desc: '价格主体（number 千分位）+ 前缀币种 + 后缀周期', type: 'ReactNode', default: '–' },
  { name: 'note', desc: '价格下方补充说明', type: 'ReactNode', default: '–' },
  { name: 'features', desc: '权益清单，每项 {label, included: true|false|"plus"}', type: 'PriceFeature[]', default: '[]' },
  { name: 'recommended / badge', desc: '推荐态：主色边框 + 角标 + 主色按钮；badge 文案默认「推荐」', type: 'boolean / ReactNode', default: 'false / 推荐' },
  { name: 'actionText / onAction', desc: 'CTA 文案与点击回调', type: 'ReactNode / ()=>void', default: '立即购买 / –' },
  { name: 'PriceTable.items', desc: '一排方案卡等分并排、alignItems:stretch  等高', type: 'PriceCardProps[]', default: '–' },
  { name: 'PriceTable.perRow', desc: '每行最多卡数，超量自动分行；末行补空位对齐卡宽', type: 'number', default: '4' },
];

const TOKENS: TokenRow[] = [
  { name: 'colorPrimary', desc: '推荐卡边框 / 价格 / 按钮 / 角标底色' },
  { name: 'colorSuccess / colorWarning / colorTextQuaternary', desc: '权益打勾绿 / 加号橙 / 不含灰' },
  { name: 'colorBgContainer / colorBorderSecondary', desc: '卡背景 / 普通卡描边与分隔线' },
  { name: 'paddingLG / marginMD', desc: '卡内边距 / 方案表间隙' },
];

export function PriceCardDemo(): React.ReactElement {
  return <DemoPage demos={DEMOS} api={API} tokens={TOKENS} />;
}

export default PriceCardDemo;
