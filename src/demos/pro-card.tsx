// PRO-CARD：页面区块容器。DemoPage 多段式：基础页头 / 分栏 split / 幽灵 ghost / 可折叠 collapsible / 加载态。
import React from 'react';
import { Text, View, useToken, Button, Tag } from 'react-native-flux-desktop';
import { ProCard } from 'react-native-flux-desktop-pro';
import { DemoPage, type DemoItem, type ApiRow, type TokenRow } from '../DemoPage';

function SplitDemo(): React.ReactElement {
  return (
    <ProCard split="vertical" bordered style={{ maxWidth: 640 }}>
      <ProCard.Panel title="左侧概览" flex={1}>
        <Text style={{ color: '#888' }}>等分栅格由 split 自动插分隔线，无需再套 Row/Col。</Text>
      </ProCard.Panel>
      <ProCard.Panel title="右侧明细" subtitle="flex=1.4" flex={1.4}>
        <Text style={{ color: '#888' }}>竖分隔线随容器高度拉伸。</Text>
      </ProCard.Panel>
    </ProCard>
  );
}

function CollapseDemo(): React.ReactElement {
  const { token } = useToken();
  const [open, setOpen] = React.useState(true);
  return (
    <View style={{ maxWidth: 520, gap: token.marginXS }}>
      <ProCard title="高级筛选" subtitle="点击页头折叠" collapsible open={open} onOpenChange={setOpen} extra={<Tag color="processing">{open ? '展开' : '收起'}</Tag>}>
        <Text style={{ color: '#888' }}>受控 open + onOpenChange；非受控用 defaultOpen。</Text>
      </ProCard>
    </View>
  );
}

const DEMOS: DemoItem[] = [
  {
    name: '基础页头',
    desc: 'title + subtitle（次级灰字）+ tooltip 帮助圈，extra 右侧操作区',
    node: (
      <ProCard title="用户管理" subtitle="共 1,284 人" tooltip="仅管理员可编辑" extra={<Button size="small" type="primary">新建</Button>} style={{ maxWidth: 560 }}>
        <Text style={{ color: '#888' }}>页头三件套 + 右侧操作，内容区自带 padding。</Text>
      </ProCard>
    ),
    code: [
      'import { ProCard, Button } from "react-native-flux-desktop";',
      '',
      '// title + subtitle + tooltip，extra 放右侧操作区',
      '<ProCard',
      '  title="用户管理"',
      '  subtitle="共 1,284 人"',
      '  tooltip="仅管理员可编辑"',
      '  extra={<Button size="small" type="primary">新建</Button>}',
      '>',
      '  内容区自带 padding',
      '</ProCard>',
    ].join('\n'),
  },
  {
    name: '分栏 split',
    desc: "split='vertical' 子 Panel 横向并排（竖分隔线），flex 控制占比",
    node: <SplitDemo />,
    code: [
      'import { ProCard } from "react-native-flux-desktop";',
      '',
      '// split=vertical 子 Panel 横向并排（竖分隔线），flex 控制占比',
      '<ProCard split="vertical" bordered>',
      '  <ProCard.Panel title="左侧概览" flex={1}>…</ProCard.Panel>',
      '  <ProCard.Panel title="右侧明细" flex={1.4}>…</ProCard.Panel>',
      '</ProCard>',
    ].join('\n'),
  },
  {
    name: '幽灵 ghost',
    desc: '去底去边，多个 ProCard 拼进灰底页不显套娃；此段外层给浅底示意',
    node: (
      <View style={{ backgroundColor: 'rgba(128,128,128,0.12)', padding: 12, maxWidth: 560 }}>
        <ProCard ghost title="区块 A" tooltip="说明">
          <Text style={{ color: '#888' }}>ghost 下页头无分隔线、内容无外边距外壳。</Text>
        </ProCard>
        <ProCard ghost title="区块 B">
          <Text style={{ color: '#888' }}>两块之间仅靠 gap 留白。</Text>
        </ProCard>
      </View>
    ),
    code: [
      'import { ProCard } from "react-native-flux-desktop";',
      '',
      '// ghost 去底去边，适合拼进灰底页不显套娃',
      '<ProCard ghost title="区块 A">…</ProCard>',
      '<ProCard ghost title="区块 B">…</ProCard>',
    ].join('\n'),
  },
  {
    name: '可折叠',
    desc: 'collapsible 页头点击收放 body',
    node: <CollapseDemo />,
    code: [
      'import { ProCard, Tag } from "react-native-flux-desktop";',
      '',
      '// collapsible 页头可折叠；受控 open + onOpenChange（或非受控 defaultOpen）',
      "const [open, setOpen] = React.useState(true);",
      '<ProCard',
      '  title="高级筛选"',
      '  collapsible',
      '  open={open}',
      '  onOpenChange={setOpen}',
      '  extra={<Tag color="processing">{open ? \'展开\' : \'收起\'}</Tag>}',
      '>',
      '  …',
      '</ProCard>',
    ].join('\n'),
  },
  {
    name: '加载态 loading',
    desc: 'loading 时 body 换成骨架占位',
    node: (
      <ProCard title="报表" loading bordered style={{ maxWidth: 520 }}>
        <Text>这段内容在 loading=true 时被骨架替换</Text>
      </ProCard>
    ),
    code: [
      'import { ProCard } from "react-native-flux-desktop";',
      '',
      '// loading=true 时 body 换成骨架占位',
      '<ProCard title="报表" loading bordered>',
      '  这段内容在 loading=true 时被骨架替换',
      '</ProCard>',
    ].join('\n'),
  },
];

const API: ApiRow[] = [
  { name: 'title / subtitle / tooltip', desc: '主标题 / 次级副标题 / 帮助圈（字符串附浅字）', type: 'ReactNode', default: '–' },
  { name: 'extra', desc: '页头右侧操作区', type: 'ReactNode', default: '–' },
  { name: 'split', desc: "'vertical' 横排竖线 / 'horizontal' 纵排横线，配 ProCard.Panel", type: 'string', default: '–' },
  { name: 'ghost', desc: '透明底无描边，用于嵌入灰底页', type: 'boolean', default: 'false' },
  { name: 'bordered / loading', desc: '描边 / 骨架加载态', type: 'boolean', default: 'true / false' },
  { name: 'collapsible / open / onOpenChange', desc: '页头折叠；受控或非受控(defaultOpen)', type: 'boolean / ()=>void', default: '–' },
  { name: 'Panel.flex', desc: '分栏占比，默认等分 1', type: 'number', default: '1' },
];

const TOKENS: TokenRow[] = [
  { name: 'colorBorderSecondary', desc: '卡片描边与页头分隔线' },
  { name: 'colorSplit', desc: 'split 分栏分隔线色' },
  { name: 'paddingLG / padding', desc: 'body 内边距 / 页头纵向留白' },
  { name: 'colorBgContainer', desc: '卡片底色（ghost 时透明）' },
];

export function ProCardDemo(): React.ReactElement {
  return <DemoPage demos={DEMOS} api={API} tokens={TOKENS} />;
}

export default ProCardDemo;
