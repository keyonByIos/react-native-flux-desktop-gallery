// SPLITTER：可分割面板。统一走 DemoPage 三段式。
// 面板占比 useTween 缓动；分割条内嵌折叠箭头（collapsible 支持 { start, end } 两端配置）。
// 拖拽调宽待 pointer capture 管线，本版交互以点箭头折叠为主。
import React from 'react';
import { Splitter, Text, View, useToken } from 'react-native-flux-desktop';
import { DemoPage, type DemoItem, type ApiRow, type TokenRow } from '../DemoPage';

const { Panel } = Splitter;

/** 面板内容槽：撑满、居中、按 token 名着色，便于看清几何 */
function Cell(props: { label: string; color: string }): React.ReactElement {
  const { token } = useToken();
  const bg = (token as any)[props.color] ?? token.colorFillSecondary;
  return (
    <View
      style={{
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: bg,
        minHeight: 48,
      }}
    >
      <Text style={{ fontSize: token.fontSize, color: token.colorText }}>{props.label}</Text>
    </View>
  );
}

/** 基础：横向分割，声明初始占比，全部可折叠 */
function BasicDemo(): React.ReactElement {
  return (
    <View style={{ height: 160 }}>
      <Splitter layout="horizontal">
        <Panel defaultSize={30} collapsible>
          <Cell label="左 30%" color="colorPrimaryBg" />
        </Panel>
        <Panel collapsible>
          <Cell label="中" color="colorSuccessBg" />
        </Panel>
        <Panel defaultSize={25} collapsible>
          <Cell label="右 25%" color="colorWarningBg" />
        </Panel>
      </Splitter>
    </View>
  );
}

/** 垂直分割 */
function VerticalDemo(): React.ReactElement {
  return (
    <View style={{ height: 220 }}>
      <Splitter layout="vertical">
        <Panel defaultSize={40} collapsible>
          <Cell label="上 40%" color="colorFillSecondary" />
        </Panel>
        <Panel collapsible>
          <Cell label="下 60%" color="colorPrimaryBg" />
        </Panel>
      </Splitter>
    </View>
  );
}

/** 两端折叠配置：中栏不可折叠，左右各自单端箭头 */
function ConfigDemo(): React.ReactElement {
  return (
    <View style={{ height: 160 }}>
      <Splitter>
        <Panel defaultSize={28} collapsible={{ end: true }}>
          <Cell label="可折叠(end)" color="colorPrimaryBg" />
        </Panel>
        <Panel defaultSize={44}>
          <Cell label="固定中栏" color="colorFillSecondary" />
        </Panel>
        <Panel collapsible={{ start: true }}>
          <Cell label="可折叠(start)" color="colorSuccessBg" />
        </Panel>
      </Splitter>
    </View>
  );
}

/** 嵌套：外层上下，下栏内再左右 */
function NestedDemo(): React.ReactElement {
  return (
    <View style={{ height: 240 }}>
      <Splitter layout="vertical">
        <Panel defaultSize={35} collapsible>
          <Cell label="顶部面板" color="colorWarningBg" />
        </Panel>
        <Panel>
          <Splitter>
            <Panel defaultSize={40} collapsible>
              <Cell label="左下" color="colorPrimaryBg" />
            </Panel>
            <Panel collapsible>
              <Cell label="右下" color="colorSuccessBg" />
            </Panel>
          </Splitter>
        </Panel>
      </Splitter>
    </View>
  );
}

const DEMOS: DemoItem[] = [
  {
    name: '基础分割',
    desc: '横向面板，声明 defaultSize 初始占比；分割条两端箭头折叠邻侧面板',
    node: <BasicDemo />,
    code: [
      'import { Splitter } from "react-native-flux-desktop";',
      'const { Panel } = Splitter;',
      '',
      '// layout=horizontal（默认）；Panel.defaultSize 声明初始占比，collapsible 可折叠',
      '<Splitter layout="horizontal">',
      '  <Panel defaultSize={30} collapsible>左 30%</Panel>',
      '  <Panel collapsible>中</Panel>',
      '  <Panel defaultSize={25} collapsible>右 25%</Panel>',
      '</Splitter>',
    ].join('\n'),
  },
  {
    name: '垂直分割',
    desc: 'layout="vertical" 时改为上下堆叠、箭头纵向',
    node: <VerticalDemo />,
    code: [
      '// layout=vertical：上下堆叠、箭头纵向',
      '<Splitter layout="vertical">',
      '  <Panel defaultSize={40} collapsible>上 40%</Panel>',
      '  <Panel collapsible>下 60%</Panel>',
      '</Splitter>',
    ].join('\n'),
  },
  {
    name: '两端折叠配置',
    desc: 'collapsible 传 { start } / { end } 精确控制哪一端可收，中栏不可折叠',
    node: <ConfigDemo />,
    code: [
      '// collapsible 传 { start } / { end } 精确控制哪一端可收',
      '<Splitter>',
      '  <Panel defaultSize={28} collapsible={{ end: true }}>可折叠(end)</Panel>',
      '  <Panel defaultSize={44}>固定中栏（不可折叠）</Panel>',
      '  <Panel collapsible={{ start: true }}>可折叠(start)</Panel>',
      '</Splitter>',
    ].join('\n'),
  },
  {
    name: '嵌套分割',
    desc: 'Panel 内再放 Splitter，实现不规则分栏',
    node: <NestedDemo />,
    code: [
      '// Panel 内再放 Splitter，实现不规则分栏',
      '<Splitter layout="vertical">',
      '  <Panel defaultSize={35} collapsible>顶部面板</Panel>',
      '  <Panel>',
      '    <Splitter>',
      '      <Panel defaultSize={40} collapsible>左下</Panel>',
      '      <Panel collapsible>右下</Panel>',
      '    </Splitter>',
      '  </Panel>',
      '</Splitter>',
    ].join('\n'),
  },
];

const API: ApiRow[] = [
  { name: 'layout', desc: '分割方向', type: "'horizontal' | 'vertical'", default: "'horizontal'" },
  { name: 'onCollapse', desc: '面板折叠/展开回调', type: '(index, collapsed) => void', default: '–' },
  { name: 'Panel.defaultSize', desc: '初始占比（数值或 "30%"）', type: 'number | string', default: '均分' },
  { name: 'Panel.collapsible', desc: '折叠能力，可分设两端', type: 'boolean | { start, end }', default: 'false' },
  { name: 'Panel.size', desc: '兼容旧字段，等价 defaultSize', type: 'number | string', default: '–' },
];

const TOKENS: TokenRow[] = [
  { name: 'colorSplit', desc: '分割条底色', default: '–' },
  { name: 'paddingSM', desc: '分割条粗细（宽 / 高）', default: '12' },
  { name: 'colorTextTertiary', desc: '折叠箭头颜色', default: '–' },
  { name: 'fontSizeSM', desc: '折叠箭头尺寸', default: '12' },
];

export function SplitterDemo(): React.ReactElement {
  return <DemoPage demos={DEMOS} api={API} tokens={TOKENS} />;
}
