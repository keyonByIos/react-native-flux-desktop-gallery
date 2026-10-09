// CELL：列表项。统一走 DemoPage 多段式，覆盖 基础 / 图标 / 右侧控件 / 禁用 / 无分隔线。
import React from 'react';
import { Cell, Switch, View, useToken } from 'react-native-flux-desktop';
import { DemoPage, type DemoItem, type ApiRow, type TokenRow } from '../DemoPage';

/** 分组容器：圆角裁切 + 容器底色 */
function Group({ children }: { children: React.ReactNode }): React.ReactElement {
  const { token } = useToken();
  return (
    <View
      style={{
        maxWidth: 520,
        borderRadius: token.borderRadiusLG,
        overflow: 'hidden',
        borderWidth: token.lineWidth,
        borderColor: token.colorBorderSecondary,
        backgroundColor: token.colorBgContainer,
      }}
    >
      {children}
    </View>
  );
}

/** 基础 */
function BasicDemo(): React.ReactElement {
  return (
    <Group>
      <Cell title="标题文字" description="副标题 / 描述信息" extra="附加内容" arrow onPress={() => undefined} />
      <Cell title="只有标题" arrow onPress={() => undefined} />
      <Cell title="设置项" extra="已开启" arrow onPress={() => undefined} bordered={false} />
    </Group>
  );
}

/** 图标 */
function IconDemo(): React.ReactElement {
  return (
    <Group>
      <Cell icon="user" title="账号信息" arrow onPress={() => undefined} />
      <Cell icon="bell" title="消息通知" description="推送与提醒" extra="3 条未读" arrow onPress={() => undefined} />
      <Cell icon="setting" title="通用设置" arrow bordered={false} onPress={() => undefined} />
    </Group>
  );
}

/** 右侧控件 */
function ControlDemo(): React.ReactElement {
  const [on, setOn] = React.useState(true);
  return (
    <Group>
      <Cell title="Wi-Fi" description="连接无线网络" extra={<Switch checked={on} onChange={setOn} />} />
      <Cell title="蓝牙" extra={<Switch checked={false} />} />
      <Cell title="深色模式" extra={<Switch checked onChange={() => undefined} />} bordered={false} />
    </Group>
  );
}

/** 禁用 */
function DisabledDemo(): React.ReactElement {
  return (
    <Group>
      <Cell icon="lock" title="可点击项" arrow onPress={() => undefined} />
      <Cell icon="wifiOff" title="禁用项（不可点击）" description="置灰显示" arrow disabled bordered={false} />
    </Group>
  );
}

/** 无分隔线 */
function NoBorderDemo(): React.ReactElement {
  return (
    <Group>
      <Cell title="第一项" bordered={false} extra="A" />
      <Cell title="第二项" bordered={false} extra="B" />
      <Cell title="第三项" bordered={false} extra="C" />
    </Group>
  );
}

const DEMOS: DemoItem[] = [
  {
    name: '基础',
    desc: '标题 + 描述 + 附加内容 + 箭头，可点击',
    node: <BasicDemo />,
    code: [
      'import { Cell } from "react-native-flux-desktop";',
      '',
      '// title + description + extra + arrow，onPress 可点',
      '<Cell title="标题文字" description="副标题 / 描述信息" extra="附加内容" arrow onPress={() => {}} />',
      '<Cell title="只有标题" arrow onPress={() => {}} />',
      '<Cell title="设置项" extra="已开启" arrow bordered={false} onPress={() => {}} />',
    ].join('\n'),
  },
  {
    name: '图标',
    desc: 'icon 传入图标名，渲染于标题左侧',
    node: <IconDemo />,
    code: [
      '// icon 传入图标名，渲染于标题左侧',
      '<Cell icon="user" title="账号信息" arrow onPress={() => {}} />',
      '<Cell icon="bell" title="消息通知" description="推送与提醒" extra="3 条未读" arrow onPress={() => {}} />',
    ].join('\n'),
  },
  {
    name: '右侧控件',
    desc: 'extra 传入 Switch 等任意节点',
    node: <ControlDemo />,
    code: [
      '// extra 传入 Switch 等任意节点',
      'const [on, setOn] = React.useState(true);',
      '<Cell title="Wi-Fi" description="连接无线网络" extra={<Switch checked={on} onChange={setOn} />} />',
    ].join('\n'),
  },
  {
    name: '禁用',
    desc: 'disabled 置灰且不响应点击',
    node: <DisabledDemo />,
    code: ['// disabled 置灰且不响应点击', '<Cell icon="wifiOff" title="禁用项" description="置灰显示" arrow disabled bordered={false} />'].join('\n'),
  },
  {
    name: '无分隔线',
    desc: 'bordered=false 去掉底部横线',
    node: <NoBorderDemo />,
    code: ['// bordered=false 去掉底部横线', '<Cell title="第一项" bordered={false} extra="A" />', '<Cell title="第二项" bordered={false} extra="B" />'].join('\n'),
  },
];

const API: ApiRow[] = [
  { name: 'title / description', desc: '标题 / 描述', type: 'ReactNode', default: '–' },
  { name: 'icon', desc: '左侧图标', type: 'ReactNode | string', default: '–' },
  { name: 'extra', desc: '右侧内容', type: 'ReactNode', default: '–' },
  { name: 'arrow', desc: '右侧箭头', type: 'boolean', default: 'false' },
  { name: 'disabled', desc: '禁用', type: 'boolean', default: 'false' },
  { name: 'bordered', desc: '底部分隔线', type: 'boolean', default: 'true' },
  { name: 'onPress', desc: '点击回调', type: '() => void', default: '–' },
];

const TOKENS: TokenRow[] = [
  { name: 'paddingBlock / paddingInline', desc: '单元格内边距', default: 'Cell token' },
  { name: 'activeBg', desc: '按压态底色', default: 'Cell token' },
  { name: 'descriptionColor', desc: '描述文字色', default: 'Cell token' },
];

export function CellDemo(): React.ReactElement {
  return <DemoPage demos={DEMOS} api={API} tokens={TOKENS} />;
}
