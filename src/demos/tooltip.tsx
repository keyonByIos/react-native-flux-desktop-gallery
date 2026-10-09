// TOOLTIP demo：DemoPage 多段式。气泡为绝对定位浮层不占布局，正常 hover/click 触发。
import React from 'react';
import { View, Button, Tooltip, type ViewStyle } from 'react-native-flux-desktop';
import { DemoPage, type DemoItem, type ApiRow, type TokenRow } from '../DemoPage';

const pad = (n: number): ViewStyle => ({ padding: n });

const DEMOS: DemoItem[] = [
  {
    name: '基础',
    desc: 'hover 触发，鼠标移入显示提示',
    node: (
      <View style={pad(40)}>
        <Tooltip title="顶部提示：鼠标悬停显示" placement="top">
          <Button type="default">悬停看提示</Button>
        </Tooltip>
      </View>
    ),
    code: [
      'import { Tooltip, Button } from "react-native-flux-desktop";',
      '',
      '// 默认 hover 触发，placement=top',
      '<Tooltip title="顶部提示：鼠标悬停显示" placement="top">',
      '  <Button type="default">悬停看提示</Button>',
      '</Tooltip>',
    ].join('\n'),
  },
  {
    name: '四个方向',
    desc: 'placement：top / bottom / left / right',
    node: (
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 48, padding: 48 }}>
        <View style={pad(30)}>
          <Tooltip title="上方 Top" placement="top">
            <Button type="default">Top</Button>
          </Tooltip>
        </View>
        <View style={pad(30)}>
          <Tooltip title="下方 Bottom" placement="bottom">
            <Button type="default">Bottom</Button>
          </Tooltip>
        </View>
        <View style={pad(30)}>
          <Tooltip title="左侧 Left" placement="left">
            <Button type="default">Left</Button>
          </Tooltip>
        </View>
        <View style={pad(30)}>
          <Tooltip title="右侧 Right" placement="right">
            <Button type="default">Right</Button>
          </Tooltip>
        </View>
      </View>
    ),
    code: [
      '// placement：top / bottom / left / right',
      '<Tooltip title="上方 Top" placement="top"><Button>Top</Button></Tooltip>',
      '<Tooltip title="下方 Bottom" placement="bottom"><Button>Bottom</Button></Tooltip>',
      '<Tooltip title="左侧 Left" placement="left"><Button>Left</Button></Tooltip>',
      '<Tooltip title="右侧 Right" placement="right"><Button>Right</Button></Tooltip>',
    ].join('\n'),
  },
  {
    name: '自定义颜色',
    desc: 'color 覆盖气泡底色，前景自动取反',
    node: (
      <View style={{ flexDirection: 'row', gap: 40, padding: 40 }}>
        <View style={pad(24)}>
          <Tooltip title="绿色气泡" color="#52c41a" placement="top">
            <Button type="default">Green</Button>
          </Tooltip>
        </View>
        <View style={pad(24)}>
          <Tooltip title="蓝色气泡" color="#1677ff" placement="top">
            <Button type="default">Blue</Button>
          </Tooltip>
        </View>
      </View>
    ),
    code: [
      '// color 覆盖气泡底色，前景自动取反',
      '<Tooltip title="绿色气泡" color="#52c41a" placement="top">',
      '  <Button type="default">Green</Button>',
      '</Tooltip>',
    ].join('\n'),
  },
  {
    name: '无箭头',
    desc: 'arrow=false 去掉小三角',
    node: (
      <View style={pad(40)}>
        <Tooltip title="没有箭头的气泡" placement="top" arrow={false}>
          <Button type="dashed">无箭头</Button>
        </Tooltip>
      </View>
    ),
    code: ['// arrow=false 去掉小三角', '<Tooltip title="没有箭头的气泡" placement="top" arrow={false}>'].join('\n'),
  },
  {
    name: '点击触发',
    desc: "trigger='click' 点击切换显隐",
    node: (
      <View style={pad(40)}>
        <Tooltip title="点击按钮切换显示" placement="bottom" trigger="click">
          <Button type="primary">点击我</Button>
        </Tooltip>
      </View>
    ),
    code: [
      "// trigger='click' 点击切换显隐",
      '<Tooltip title="点击按钮切换显示" placement="bottom" trigger="click">',
      '  <Button type="primary">点击我</Button>',
      '</Tooltip>',
    ].join('\n'),
  },
];

const API: ApiRow[] = [
  { name: 'title', desc: '提示内容', type: 'ReactNode', default: '–' },
  { name: 'placement', desc: '弹出方向', type: "'top'|'bottom'|'left'|'right'", default: "'top'" },
  { name: 'trigger', desc: '触发方式', type: "'hover' | 'click'", default: "'hover'" },
  { name: 'arrow', desc: '是否显示箭头', type: 'boolean', default: 'true' },
  { name: 'color', desc: '自定义气泡底色', type: 'string', default: 'colorBgSpotlight' },
  { name: 'open', desc: '受控显隐', type: 'boolean', default: '–' },
];

const TOKENS: TokenRow[] = [
  { name: 'colorBgSpotlight', desc: '默认气泡底色', default: '深色 spotlight' },
  { name: 'fontSizeSM', desc: '气泡文字号', default: '12' },
  { name: 'paddingXS / paddingXXS', desc: '气泡内边距', default: '8 / 4' },
];

export function TooltipDemo(): React.ReactElement {
  return <DemoPage demos={DEMOS} api={API} tokens={TOKENS} />;
}
