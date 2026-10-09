// POPCONFIRM：气泡确认框。DemoPage 多段式，覆盖 基础 / 描述 / 四方向 / 危险操作 / 隐藏取消 / 自定义图标 / 受控。
import React from 'react';
import { Popconfirm, Button, Text, View, Icon, useToken } from 'react-native-flux-desktop';
import { DemoPage, type DemoItem, type ApiRow, type TokenRow } from '../DemoPage';

/** 内联反馈演示：确认/取消后把结果写进右侧文字 */
function FeedbackDemo(props: { danger?: boolean }): React.ReactElement {
  const { token } = useToken();
  const [log, setLog] = React.useState('尚未操作');
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
      <Popconfirm
        title={props.danger ? '永久删除？此操作不可恢复。' : '删除这条记录？'}
        okText={props.danger ? '删除' : '确定'}
        danger={props.danger}
        onConfirm={() => setLog(props.danger ? '已永久删除' : '已删除')}
        onCancel={() => setLog('已取消')}
      >
        <Button danger={props.danger}>{props.danger ? '危险删除' : '删除'}</Button>
      </Popconfirm>
      <Text style={{ marginLeft: token.marginLG, fontSize: token.fontSize, color: token.colorTextSecondary }}>{log}</Text>
    </View>
  );
}

/** 受控演示：确认后面板保持打开，需手动关 */
function ControlledDemo(): React.ReactElement {
  const { token } = useToken();
  const [open, setOpen] = React.useState(false);
  const [count, setCount] = React.useState(0);
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
      <Popconfirm
        open={open}
        onOpenChange={setOpen}
        title="受控确认框"
        description="点确定只会 +1，面板不自动关"
        onConfirm={() => setCount((c) => c + 1)}
      >
        <Button onPress={() => setOpen((o) => !o)}>切换（open={String(open)}）</Button>
      </Popconfirm>
      <Text style={{ marginLeft: token.marginLG, fontSize: token.fontSize, color: token.colorTextSecondary }}>
        已确认 {count} 次
      </Text>
    </View>
  );
}

const DEMOS: DemoItem[] = [
  {
    name: '基础',
    desc: '点击触发器弹出确认，确定/取消后自动收起',
    node: <FeedbackDemo />,
    code: [
      'import { Popconfirm, Button } from "react-native-flux-desktop";',
      '',
      '// 默认包一个触发器，确认/取消后自动收起',
      '<Popconfirm',
      '  title="删除这条记录？"',
      '  onConfirm={() => console.log(\'已删除\')}',
      '  onCancel={() => console.log(\'已取消\')}',
      '>',
      '  <Button>删除</Button>',
      '</Popconfirm>',
    ].join('\n'),
  },
  {
    name: '带描述',
    desc: 'description 补充次级说明文字',
    node: (
      <View style={{ flexDirection: 'row' }}>
        <Popconfirm title="确认提交表单？" description="提交后将不可修改，请核对信息无误。">
          <Button type="primary">提交</Button>
        </Popconfirm>
      </View>
    ),
    code: [
      '// description 补充次级说明',
      '<Popconfirm',
      '  title="确认提交表单？"',
      '  description="提交后将不可修改，请核对信息无误。"',
      '>',
      '  <Button type="primary">提交</Button>',
      '</Popconfirm>',
    ].join('\n'),
  },
  {
    name: '四方向',
    desc: 'placement 控制气泡相对触发器的方位',
    node: (
      <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
        {(['top', 'bottom', 'left', 'right'] as const).map((p, i) => (
          <View key={p} style={{ marginRight: i < 3 ? 12 : 0 }}>
            <Popconfirm title={`placement=${p}`} placement={p}>
              <Button>{p}</Button>
            </Popconfirm>
          </View>
        ))}
      </View>
    ),
    code: [
      '// placement：top / bottom / left / right（默认 top）',
      '<Popconfirm title="placement=bottom" placement="bottom">',
      '  <Button>bottom</Button>',
      '</Popconfirm>',
    ].join('\n'),
  },
  {
    name: '危险操作',
    desc: 'danger 让确定按钮转红，用于破坏性确认',
    node: <FeedbackDemo danger />,
    code: [
      '// danger：确定按钮转红，用于破坏性确认',
      '<Popconfirm',
      '  title="永久删除？此操作不可恢复。"',
      '  okText="删除"',
      '  danger',
      '  onConfirm={() => console.log(\'已删除\')}',
      '>',
      '  <Button danger>危险删除</Button>',
      '</Popconfirm>',
    ].join('\n'),
  },
  {
    name: '隐藏取消 / 自定义文案',
    desc: 'hideCancel 只留确定；okText/cancelText 自定义',
    node: (
      <View style={{ flexDirection: 'row' }}>
        <Popconfirm title="开启通知？" hideCancel okText="知道了">
          <Button>仅确定</Button>
        </Popconfirm>
        <View style={{ marginLeft: 12 }}>
          <Popconfirm title="退出登录？" okText="退出" cancelText="再想想">
            <Button>自定义文案</Button>
          </Popconfirm>
        </View>
      </View>
    ),
    code: [
      '// hideCancel 只留确定；okText / cancelText 自定义按钮文案',
      '<Popconfirm title="开启通知？" hideCancel okText="知道了">',
      '  <Button>仅确定</Button>',
      '</Popconfirm>',
      '',
      '<Popconfirm title="退出登录？" okText="退出" cancelText="再想想">',
      '  <Button>自定义文案</Button>',
      '</Popconfirm>',
    ].join('\n'),
  },
  {
    name: '自定义图标',
    desc: 'icon 替换默认警告圈；传 null 隐藏',
    node: (
      <View style={{ flexDirection: 'row' }}>
        <Popconfirm title="发送成功" icon={<Icon name="checkCircle" size={16} color="#52c41a" />}>
          <Button>成功图标</Button>
        </Popconfirm>
        <View style={{ marginLeft: 12 }}>
          <Popconfirm title="无图标的纯文字确认" icon={null}>
            <Button>无图标</Button>
          </Popconfirm>
        </View>
      </View>
    ),
    code: [
      'import { Popconfirm, Button, Icon } from "react-native-flux-desktop";',
      '',
      '// icon 替换默认警告圈；传 null 隐藏图标',
      '<Popconfirm title="发送成功" icon={<Icon name="checkCircle" size={16} color="#52c41a" />}>',
      '  <Button>成功图标</Button>',
      '</Popconfirm>',
      '<Popconfirm title="无图标的纯文字确认" icon={null}>',
      '  <Button>无图标</Button>',
      '</Popconfirm>',
    ].join('\n'),
  },
  {
    name: '受控',
    desc: 'open + onOpenChange 外部控制展开',
    node: <ControlledDemo />,
    code: [
      '// 受控：open + onOpenChange 外部接管展开（确认后不自动关）',
      'const [open, setOpen] = React.useState(false);',
      '<Popconfirm',
      '  open={open}',
      '  onOpenChange={setOpen}',
      '  title="受控确认框"',
      '  onConfirm={() => setCount((c) => c + 1)}',
      '>',
      '  <Button onPress={() => setOpen((o) => !o)}>切换</Button>',
      '</Popconfirm>',
    ].join('\n'),
  },
];

const API: ApiRow[] = [
  { name: 'title', desc: '主标题', type: 'ReactNode', default: '–' },
  { name: 'description', desc: '补充描述', type: 'ReactNode', default: '–' },
  { name: 'placement', desc: '气泡方位', type: "'top'|'bottom'|'left'|'right'", default: "'top'" },
  { name: 'okText / cancelText', desc: '按钮文案', type: 'ReactNode', default: '确定 / 取消' },
  { name: 'hideCancel', desc: '隐藏取消按钮', type: 'boolean', default: 'false' },
  { name: 'danger', desc: '确定按钮危险态', type: 'boolean', default: 'false' },
  { name: 'icon', desc: '前置图标（null 隐藏）', type: 'ReactNode', default: '警告圈' },
  { name: 'onConfirm / onCancel', desc: '确认 / 取消回调', type: '() => void', default: '–' },
  { name: 'open / onOpenChange', desc: '受控展开', type: 'boolean / (open)', default: '–' },
];

const TOKENS: TokenRow[] = [
  { name: 'colorWarning', desc: '默认图标色', default: '警告橙' },
  { name: 'colorBgElevated', desc: '气泡面板底', default: '浮层背景' },
  { name: 'colorTextSecondary', desc: '描述文字', default: '次级文本' },
];

export function PopconfirmDemo(): React.ReactElement {
  return <DemoPage demos={DEMOS} api={API} tokens={TOKENS} />;
}
