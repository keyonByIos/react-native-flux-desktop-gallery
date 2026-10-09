// 高阶 / 关键词高亮：搜索结果回显。多关键词、大小写、只高亮首个、自定义色。
import React from 'react';
import { Input, View, Text } from 'react-native-flux-desktop';
import { Highlight } from 'react-native-flux-desktop-pro';
import { DemoPage, type DemoItem, type ApiRow, type TokenRow } from '../DemoPage';

const DOC =
  'Flux Desktop 是一套自绘的 React 桌面渲染栈：react-reconciler 驱动 Yoga 布局，@napi-rs/canvas 负责绘制，' +
  '最终经 softbuffer 上屏。组件库覆盖原子组件、高阶业务组件与图表三大类，全部代码在同一份 src 下，' +
  '主题 token 一处修改全局生效。flux 也是 react-native-flux 的桌面端兄弟实现。';

/** 实时搜索回显：输入关键词即时高亮正文。 */
function LiveDemo(): React.ReactElement {
  const [kw, setKw] = React.useState('flux');
  return (
    <View style={{ width: '100%', gap: 10 }}>
      <View style={{ width: 320 }}>
        <Input value={kw} placeholder="输入关键词试试" allowClear size="small" onChange={setKw} />
      </View>
      <Highlight text={DOC} keyword={kw} />
    </View>
  );
}

const API: ApiRow[] = [
  { name: 'text', desc: '被搜索的完整文本', type: 'string', default: '–' },
  { name: 'keyword', desc: '关键词，单个或多个（重叠命中自动归并）', type: 'string | string[]', default: '–' },
  { name: 'highlightAll', desc: 'false = 只高亮第一个命中', type: 'boolean', default: 'true' },
  { name: 'caseSensitive', desc: '大小写敏感', type: 'boolean', default: 'false' },
  { name: 'color', desc: '命中词颜色（底色自动取其 15% 透明）', type: 'string', default: 'colorPrimary' },
];

const TOKENS: TokenRow[] = [
  { name: 'hit', desc: '命中片段：colorPrimary 字 + 同色 26 alpha 底 + 600 字重', default: '–' },
  { name: 'rest', desc: '未命中片段 colorText，字号/行高与正文一致', default: '–' },
];

const DEMOS: DemoItem[] = [
  {
    name: '多关键词',
    desc: 'keyword 传数组：yoga / canvas / reconciler 同时命中，按出现位置归并',
    node: <View style={{ width: '100%' }}><Highlight text={DOC} keyword={['yoga', 'canvas', 'reconciler']} /></View>,
    code: [
      'import { Highlight } from "react-native-flux-desktop";',
      '',
      '// keyword 传数组：多词同时命中，按位置归并',
      '<Highlight text={DOC} keyword={[\'yoga\', \'canvas\', \'reconciler\']} />',
    ].join('\n'),
  },
  {
    name: '只高亮首个',
    desc: 'highlightAll=false：定位第一处「组件」，用于逐条跳转场景',
    node: <View style={{ width: '100%' }}><Highlight text={DOC} keyword="组件" highlightAll={false} /></View>,
    code: [
      'import { Highlight } from "react-native-flux-desktop";',
      '',
      '// highlightAll=false 只高亮第一处命中',
      '<Highlight text={DOC} keyword="组件" highlightAll={false} />',
    ].join('\n'),
  },
  {
    name: '大小写敏感',
    desc: 'flux 小写只命中小写；caseSensitive 开合对比（下文 flux/Flux 混排）',
    node: (
      <View style={{ width: '100%', gap: 6 }}>
        <View style={{ flexDirection: 'row', gap: 6, alignItems: 'flex-start' }}>
          <Text style={{ fontSize: 12, color: '#999', width: 60 }}>不敏感</Text>
          <Highlight text={DOC} keyword="flux" />
        </View>
        <View style={{ flexDirection: 'row', gap: 6, alignItems: 'flex-start' }}>
          <Text style={{ fontSize: 12, color: '#999', width: 60 }}>敏感</Text>
          <Highlight text={DOC} keyword="flux" caseSensitive />
        </View>
      </View>
    ),
    code: [
      'import { Highlight } from "react-native-flux-desktop";',
      '',
      '// caseSensitive 控制大小写敏感（默认不敏感）',
      '<Highlight text={DOC} keyword="flux" />',
      '<Highlight text={DOC} keyword="flux" caseSensitive />',
    ].join('\n'),
  },
  {
    name: '自定义色',
    desc: 'color 传警示红：命中词与底色同步换（底色自动取 15% alpha）',
    node: <View style={{ width: '100%' }}><Highlight text={DOC} keyword="主题" color="#f5222d" /></View>,
    code: [
      'import { Highlight } from "react-native-flux-desktop";',
      '',
      '// color 自定义命中色（底色自动取 15% alpha）',
      '<Highlight text={DOC} keyword="主题" color="#f5222d" />',
    ].join('\n'),
  },
  {
    name: '实时搜索',
    desc: '配合 Input：输入即高亮，清空即还原',
    node: <LiveDemo />,
    code: [
      'import { Highlight, Input } from "react-native-flux-desktop";',
      '',
      '// 配合 Input：输入即高亮，清空即还原',
      "const [kw, setKw] = React.useState('flux');",
      '<Input value={kw} onChange={setKw} allowClear />',
      '<Highlight text={DOC} keyword={kw} />',
    ].join('\n'),
  },
];

export function HighlightDemo(): React.ReactElement {
  return <DemoPage demos={DEMOS} api={API} tokens={TOKENS} />;
}
