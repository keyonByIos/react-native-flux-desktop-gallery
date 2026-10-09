// POPOVER：气泡卡片。统一走 DemoPage 多段式，覆盖 基础 / 悬停触发 / 四个方向 / 自定义底色 / 受控。
import React from 'react';
import { View, Text, Button, Popover, useToken } from 'react-native-flux-desktop';
import { DemoPage, type DemoItem, type ApiRow, type TokenRow } from '../DemoPage';

const CONTENT = '气泡卡片内容，可放任意节点。点触发器开、点空白处关。';

/** 基础 */
function BasicDemo(): React.ReactElement {
  const { token } = useToken();
  return (
    <View style={{ height: 180 }}>
      <Popover title="气泡标题" content={CONTENT} placement="bottom">
        <Button type="primary">点我弹出</Button>
      </Popover>
      <Text style={{ marginTop: token.margin, fontSize: token.fontSizeSM, color: token.colorTextTertiary }}>
        click 触发 · 面板绝对定位于触发器下方
      </Text>
    </View>
  );
}

/** 悬停触发 */
function HoverDemo(): React.ReactElement {
  return (
    <View style={{ height: 180 }}>
      <Popover title="悬停我" content={CONTENT} trigger="hover" placement="bottom">
        <Button>hover 触发</Button>
      </Popover>
    </View>
  );
}

/** 四个方向 */
function PlacementDemo(): React.ReactElement {
  const { token } = useToken();
  return (
    <View style={{ gap: 150, paddingVertical: 40 }}>
      <View style={{ flexDirection: 'row', gap: 120 }}>
        <View style={{ position: 'relative' }}>
          <Popover title="上方 top" content={CONTENT} placement="top">
            <Button>top</Button>
          </Popover>
        </View>
        <View style={{ position: 'relative' }}>
          <Popover title="下方 bottom" content={CONTENT} placement="bottom">
            <Button>bottom</Button>
          </Popover>
        </View>
      </View>
      <View style={{ flexDirection: 'row', gap: 200 }}>
        <View style={{ position: 'relative' }}>
          <Popover title="左侧 left" content={CONTENT} placement="left">
            <Button>left</Button>
          </Popover>
        </View>
        <View style={{ position: 'relative' }}>
          <Popover title="右侧 right" content={CONTENT} placement="right">
            <Button>right</Button>
          </Popover>
        </View>
      </View>
      <Text style={{ fontSize: token.fontSizeSM, color: token.colorTextTertiary }}>点击按钮展开，观察 placement 四向居中定位与箭头</Text>
    </View>
  );
}

/** 自定义底色 */
function ColorDemo(): React.ReactElement {
  return (
    <View style={{ height: 180 }}>
      <Popover title="深色气泡" content={<Text style={{ color: '#fff' }}>面板底色由 color 指定</Text>} color="#001529" placement="bottom">
        <Button>自定义底色</Button>
      </Popover>
    </View>
  );
}

/** 受控 */
function ControlledDemo(): React.ReactElement {
  const [open, setOpen] = React.useState(false);
  return (
    <View style={{ height: 180, flexDirection: 'row', gap: 12, alignItems: 'flex-start' }}>
      <Popover title="受控气泡" content={CONTENT} open={open} onOpenChange={setOpen} placement="bottom">
        <Button type="primary">{open ? '收起' : '弹出'}</Button>
      </Popover>
      <Button size="small" onPress={() => setOpen(true)}>
        外部打开
      </Button>
    </View>
  );
}

const DEMOS: DemoItem[] = [
  {
    name: '基础',
    desc: 'click 触发，面板置于触发器下方',
    node: <BasicDemo />,
    code: [
      'import { Popover, Button } from "react-native-flux-desktop";',
      '',
      '// 默认 click 触发，面板置于触发器下方',
      '<Popover title="气泡标题" content="气泡卡片内容，可放任意节点。" placement="bottom">',
      '  <Button type="primary">点我弹出</Button>',
      '</Popover>',
    ].join('\n'),
  },
  {
    name: '悬停触发',
    desc: 'trigger=hover 鼠标移入展开',
    node: <HoverDemo />,
    code: ['// trigger=hover 鼠标移入展开', '<Popover title="悬停我" content={CONTENT} trigger="hover" placement="bottom">'].join('\n'),
  },
  {
    name: '四个方向',
    desc: 'placement：top / bottom / left / right',
    node: <PlacementDemo />,
    code: [
      '// placement：top / bottom / left / right（四向居中定位 + 箭头）',
      '<Popover title="上方 top" content={CONTENT} placement="top"><Button>top</Button></Popover>',
      '<Popover title="下方 bottom" content={CONTENT} placement="bottom"><Button>bottom</Button></Popover>',
      '<Popover title="左侧 left" content={CONTENT} placement="left"><Button>left</Button></Popover>',
      '<Popover title="右侧 right" content={CONTENT} placement="right"><Button>right</Button></Popover>',
    ].join('\n'),
  },
  {
    name: '自定义底色',
    desc: 'color 指定面板背景色',
    node: <ColorDemo />,
    code: [
      '// color 指定面板背景色',
      '<Popover title="深色气泡" content={<Text>面板底色由 color 指定</Text>} color="#001529" placement="bottom">',
      '  <Button>自定义底色</Button>',
      '</Popover>',
    ].join('\n'),
  },
  {
    name: '受控',
    desc: 'open + onOpenChange，可外部驱动',
    node: <ControlledDemo />,
    code: [
      '// open + onOpenChange 受控，可外部驱动',
      "const [open, setOpen] = React.useState(false);",
      '<Popover title="受控气泡" content={CONTENT} open={open} onOpenChange={setOpen} placement="bottom">',
      '  <Button type="primary">{open ? \'收起\' : \'弹出\'}</Button>',
      '</Popover>',
      '<Button onPress={() => setOpen(true)}>外部打开</Button>',
    ].join('\n'),
  },
];

const API: ApiRow[] = [
  { name: 'title / content', desc: '标题 / 内容', type: 'ReactNode', default: '–' },
  { name: 'children', desc: '触发器', type: 'ReactNode', default: '–' },
  { name: 'placement', desc: '弹出方向', type: "'top'|'bottom'|'left'|'right'", default: "'bottom'" },
  { name: 'trigger', desc: '触发方式', type: "'click' | 'hover' | 'none'", default: "'click'" },
  { name: 'color', desc: '面板底色', type: 'string', default: 'colorBgElevated' },
  { name: 'open / onOpenChange', desc: '受控开合', type: 'boolean / (v)', default: '–' },
];

const TOKENS: TokenRow[] = [
  { name: 'colorBgElevated', desc: '面板默认底色', default: '浮层背景' },
  { name: 'padding', desc: '面板内边距', default: '16' },
  { name: 'borderRadiusLG', desc: '面板圆角', default: '8' },
];

export function PopoverDemo(): React.ReactElement {
  return <DemoPage demos={DEMOS} api={API} tokens={TOKENS} />;
}
