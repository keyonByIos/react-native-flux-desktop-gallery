// CHECK-CARD：可勾选卡片。DemoPage 多段式：单选组 / 多选组 / 数据驱动 options / 手写子卡 / 禁用。
import React from 'react';
import { Text, View, useToken, type CheckCardOption } from 'react-native-flux-desktop';
import { CheckCard } from 'react-native-flux-desktop-pro';
import { DemoPage, type DemoItem, type ApiRow, type TokenRow } from '../DemoPage';

const PLANS: CheckCardOption[] = [
  { value: 'free', title: '免费版', description: '3 个项目 · 社区支持', avatar: 'F' },
  { value: 'pro', title: '专业版', description: '无限项目 · 优先支持', avatar: 'P' },
  { value: 'team', title: '团队版', description: '成员协作 · SSO', avatar: 'T' },
  { value: 'ent', title: '企业版', description: '私有部署 · 专属客户经理', avatar: 'E', disabled: true },
];

function SingleDemo(): React.ReactElement {
  const { token } = useToken();
  const [v, setV] = React.useState<string | number>('pro');
  return (
    <View style={{ gap: token.marginXS }}>
      <CheckCard.Group value={v} onChange={(x) => setV(x as string | number)} options={PLANS} itemWidth={200} />
      <Text style={{ fontSize: token.fontSizeSM, color: token.colorTextTertiary }}>当前：{String(v)}</Text>
    </View>
  );
}

function MultiDemo(): React.ReactElement {
  const { token } = useToken();
  const [v, setV] = React.useState<(string | number)[]>(['pro']);
  return (
    <View style={{ gap: token.marginXS }}>
      <CheckCard.Group multiple value={v} onChange={(x) => setV(x as (string | number)[])} options={PLANS.slice(0, 3)} itemWidth={200} />
      <Text style={{ fontSize: token.fontSizeSM, color: token.colorTextTertiary }}>已选：{(v as string[]).join(', ') || '（空）'}</Text>
    </View>
  );
}

function ChildrenDemo(): React.ReactElement {
  return (
    <CheckCard.Group defaultValue={['a']}>
      <CheckCard value="a" title="手写子卡 A" description="用 children 而非 options" avatar="A" />
      <CheckCard value="b" title="手写子卡 B" description="cloneElement 注入选中态" avatar="B" />
    </CheckCard.Group>
  );
}

const DEMOS: DemoItem[] = [
  {
    name: '单选（数据驱动）',
    desc: 'Group options + value/onChange；选中的卡主色描边 + 右上角对勾角标；末项 disabled 降透明',
    node: <SingleDemo />,
    code: [
      'import { CheckCard } from "react-native-flux-desktop";',
      '',
      '// Group.options 数据驱动，单选',
      'const PLANS = [',
      '  { value: \'free\', title: \'免费版\', description: \'3 个项目\', avatar: \'F\' },',
      '  { value: \'pro\', title: \'专业版\', description: \'无限项目\', avatar: \'P\' },',
      '];',
      "const [v, setV] = React.useState('pro');",
      '<CheckCard.Group value={v} onChange={setV} options={PLANS} itemWidth={200} />',
    ].join('\n'),
  },
  {
    name: '多选',
    desc: 'multiple 时 value 为数组，点卡增删',
    node: <MultiDemo />,
    code: [
      'import { CheckCard } from "react-native-flux-desktop";',
      '',
      '// multiple：value 为数组，点卡增删',
      "const [v, setV] = React.useState(['pro']);",
      '<CheckCard.Group multiple value={v} onChange={setV} options={PLANS} itemWidth={200} />',
    ].join('\n'),
  },
  {
    name: '手写子卡',
    desc: 'children 形态：Group 用 cloneElement 把 checked/onPress 注入每个 CheckCard',
    node: <ChildrenDemo />,
    code: [
      'import { CheckCard } from "react-native-flux-desktop";',
      '',
      '// 不用 options，Group 内手写 CheckCard 子卡',
      '<CheckCard.Group defaultValue={[\'a\']}>',
      '  <CheckCard value="a" title="手写子卡 A" description="用 children 而非 options" avatar="A" />',
      '  <CheckCard value="b" title="手写子卡 B" description="cloneElement 注入选中态" avatar="B" />',
      '</CheckCard.Group>',
    ].join('\n'),
  },
];

const API: ApiRow[] = [
  { name: 'title / description / avatar', desc: '卡片标题 / 描述 / 左侧头像位（字符显首字）', type: 'ReactNode', default: '–' },
  { name: 'cover', desc: '顶部满宽封面', type: 'ReactNode', default: '–' },
  { name: 'checked / onChange / disabled', desc: '单卡受控选中 / 点击回调 / 禁用', type: 'boolean / (b)=>void', default: '–' },
  { name: 'Group.options', desc: '数据驱动卡片列表（value/title/description/avatar/disabled）', type: 'CheckCardOption[]', default: '–' },
  { name: 'Group.multiple', desc: '多选：value 为数组，点卡增删；否则单选', type: 'boolean', default: 'false' },
  { name: 'Group.value / defaultValue / onChange', desc: '受控/非受控选中值', type: 'string | string[]', default: '–' },
  { name: 'Group.itemWidth', desc: '每卡宽度', type: 'number', default: '220' },
];

const TOKENS: TokenRow[] = [
  { name: 'colorPrimary', desc: '选中描边与右上角标' },
  { name: 'colorBorderSecondary', desc: '未选中描边' },
  { name: 'colorBgContainer', desc: '卡片底色' },
  { name: 'borderRadiusLG / padding', desc: '圆角 / 内边距' },
];

export function CheckCardDemo(): React.ReactElement {
  return <DemoPage demos={DEMOS} api={API} tokens={TOKENS} />;
}

export default CheckCardDemo;
