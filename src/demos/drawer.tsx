// DRAWER demo：DemoPage 多段式。抽屉无 portal，绝对定位铺满最近 relative 祖先，故每段用固定高容器承载并 open 常驻展开。
import React from 'react';
import { View, Text, Drawer, Button, Space, useToken } from 'react-native-flux-desktop';
import { DemoPage, type DemoItem, type ApiRow, type TokenRow } from '../DemoPage';

/** 承载抽屉的相对定位舞台 */
function Stage(props: { children: React.ReactNode; hint: string }): React.ReactElement {
  const { token } = useToken();
  return (
    <View
      style={{
        position: 'relative',
        height: token.controlHeightLG * 8,
        borderRadius: token.borderRadiusLG,
        overflow: 'hidden',
        backgroundColor: token.colorFillQuaternary,
      }}
    >
      <View style={{ alignItems: 'center', justifyContent: 'center', height: '100%' }}>
        <Text style={{ fontSize: token.fontSizeSM, color: token.colorTextTertiary }}>{props.hint}</Text>
      </View>
      {props.children}
    </View>
  );
}

const body = (
  <Text style={{ fontSize: 14, color: '#666', lineHeight: 22 }}>
    抽屉常用于承载详情、表单等次级内容。点击遮罩或关闭按钮可收起。
  </Text>
);

const DEMOS: DemoItem[] = [
  {
    name: '右侧',
    desc: "placement='right'（默认）",
    node: (
      <Stage hint="抽屉从右侧滑入">
        <Drawer open title="详情抽屉" placement="right" onClose={() => undefined}>
          {body}
        </Drawer>
      </Stage>
    ),
    code: [
      'import { Drawer } from "react-native-flux-desktop";',
      '',
      '// placement 默认 right；无 portal，绝对定位铺满最近 relative 祖先',
      '<Drawer open title="详情抽屉" placement="right" onClose={() => {}}>',
      '  <Text>抽屉正文内容</Text>',
      '</Drawer>',
    ].join('\n'),
  },
  {
    name: '左侧',
    desc: "placement='left'",
    node: (
      <Stage hint="抽屉从左侧滑入">
        <Drawer open title="导航抽屉" placement="left" onClose={() => undefined}>
          {body}
        </Drawer>
      </Stage>
    ),
    code: ['// placement=left：从左侧滑入', '<Drawer open title="导航抽屉" placement="left" onClose={() => {}}>'].join('\n'),
  },
  {
    name: '顶部 / 底部',
    desc: "placement='top' / 'bottom'",
    node: (
      <Space direction="vertical" size={12} style={{ width: '100%' }}>
        <Stage hint="从上边缘滑入">
          <Drawer open title="顶部抽屉" placement="top" size={160} onClose={() => undefined}>{body}</Drawer>
        </Stage>
        <Stage hint="从下边缘滑入">
          <Drawer open title="底部抽屉" placement="bottom" size={160} onClose={() => undefined}>{body}</Drawer>
        </Stage>
      </Space>
    ),
    code: [
      '// placement=top / bottom；size 控制高度',
      '<Drawer open title="顶部抽屉" placement="top" size={160} onClose={() => {}}>',
      '  <Text>正文</Text>',
      '</Drawer>',
    ].join('\n'),
  },
  {
    name: '底部操作与额外内容',
    desc: 'footer 底部操作区；extra 头部右侧',
    node: (
      <Stage hint="带 footer / extra">
        <Drawer
          open
          title="编辑资料"
          placement="right"
          extra={<Text style={{ fontSize: 13, color: '#1677ff' }}>更多</Text>}
          footer={
            <Space>
              <Button type="primary">保存</Button>
              <Button type="default">取消</Button>
            </Space>
          }
          onClose={() => undefined}
        >
          {body}
        </Drawer>
      </Stage>
    ),
    code: [
      '// footer 底部操作区；extra 头部右侧',
      '<Drawer',
      '  open',
      '  title="编辑资料"',
      '  extra={<Text>更多</Text>}',
      '  footer={',
      '    <Space>',
      '      <Button type="primary">保存</Button>',
      '      <Button type="default">取消</Button>',
      '    </Space>',
      '  }',
      '  onClose={() => {}}',
      '>',
      '  <Text>正文</Text>',
      '</Drawer>',
    ].join('\n'),
  },
  {
    name: '自定义宽度',
    desc: 'width / height 覆盖默认尺寸',
    node: (
      <Stage hint="宽度 200">
        <Drawer open title="窄抽屉" placement="right" width={200} onClose={() => undefined}>
          {body}
        </Drawer>
      </Stage>
    ),
    code: ['// width / height 覆盖默认尺寸', '<Drawer open title="窄抽屉" placement="right" width={200} onClose={() => {}}>'].join('\n'),
  },
  {
    name: '无遮罩 / 不可关闭图标',
    desc: 'mask=false 去遮罩；closable=false 去 ×',
    node: (
      <Stage hint="无遮罩、无关闭图标">
        <Drawer open title="无遮罩" placement="right" mask={false} closable={false} onClose={() => undefined}>
          {body}
        </Drawer>
      </Stage>
    ),
    code: [
      '// mask=false 去遮罩；closable=false 去右上角 ×',
      '<Drawer open title="无遮罩" placement="right" mask={false} closable={false} onClose={() => {}}>',
      '  <Text>正文</Text>',
      '</Drawer>',
    ].join('\n'),
  },
];

const API: ApiRow[] = [
  { name: 'open', desc: '是否打开', type: 'boolean', default: 'false' },
  { name: 'title', desc: '标题', type: 'ReactNode', default: '–' },
  { name: 'placement', desc: '滑出方向', type: "'left'|'right'|'top'|'bottom'", default: "'right'" },
  { name: 'size / width / height', desc: '尺寸', type: 'number', default: 'controlHeightLG×8' },
  { name: 'footer', desc: '底部操作区', type: 'ReactNode', default: '–' },
  { name: 'extra', desc: '头部右侧内容', type: 'ReactNode', default: '–' },
  { name: 'mask', desc: '显示遮罩', type: 'boolean', default: 'true' },
  { name: 'maskClosable', desc: '点遮罩关闭', type: 'boolean', default: 'true' },
  { name: 'closable', desc: '显示关闭图标', type: 'boolean', default: 'true' },
  { name: 'onClose', desc: '关闭回调', type: '() => void', default: '–' },
];

const TOKENS: TokenRow[] = [
  { name: 'colorBgElevated', desc: '面板底色', default: '浮层底色' },
  { name: 'colorBgMask', desc: '遮罩色', default: '半透明黑' },
  { name: 'paddingLG', desc: '头部 / 内容内边距', default: '24' },
];

export function DrawerDemo(): React.ReactElement {
  return <DemoPage demos={DEMOS} api={API} tokens={TOKENS} />;
}
