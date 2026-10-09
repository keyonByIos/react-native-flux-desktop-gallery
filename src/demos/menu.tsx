// MENU：导航菜单。统一走 DemoPage 多段式，覆盖 antd v5 items / 分组 / 多级就地展开（含高度动画 + 箭头旋转）/ 危险 / 禁用 / 受控选中 / 深色面板。
import React from 'react';
import { Menu, View, Text, useToken, type MenuItem } from 'react-native-flux-desktop';
import { DemoPage, type DemoItem, type ApiRow, type TokenRow } from '../DemoPage';

/** 基础：叶子项 + 子菜单（就地展开）+ 危险项 + 禁用项 */
const BASIC: MenuItem[] = [
  { key: 'phone', icon: 'sound', label: '电话' },
  { key: 'sms', icon: 'send', label: '短信' },
  {
    key: 'inbox',
    icon: 'appstore',
    label: '站内信',
    children: [
      { key: 'received', icon: 'download', label: '收件箱' },
      { key: 'sentbox', icon: 'upload', label: '已发送' },
      { key: 'draft', icon: 'save', label: '草稿箱' },
      { key: 'trash', icon: 'delete', label: '回收站', danger: true },
    ],
  },
  { key: 'offline', icon: 'cloud', label: '离线（禁用）', disabled: true },
];

/** 多级：一级含二级、二级再含三级，演示逐级就地展开的高度动画 */
const NESTED: MenuItem[] = [
  {
    key: 'n1',
    icon: 'appstore',
    label: '一级菜单',
    children: [
      { key: 'n1-1', label: '二级项 A' },
      {
        key: 'n1-2',
        icon: 'folder',
        label: '二级子菜单',
        children: [
          { key: 'n1-2-1', label: '三级项 1' },
          { key: 'n1-2-2', label: '三级项 2' },
        ],
      },
    ],
  },
  {
    key: 'n2',
    icon: 'setting',
    label: '另一个一级',
    children: [
      { key: 'n2-1', label: '内容一' },
      { key: 'n2-2', label: '内容二' },
    ],
  },
];

/** 分组：group 标题不可点，仅分隔 */
const GROUPED: MenuItem[] = [
  {
    key: 'g-msg',
    type: 'group',
    label: '消息渠道',
    children: [
      { key: 'phone2', icon: 'sound', label: '电话' },
      { key: 'sms2', icon: 'send', label: '短信' },
    ],
  },
  {
    key: 'g-sys',
    type: 'group',
    label: '系统',
    children: [
      { key: 'profile', icon: 'user', label: '个人资料' },
      { key: 'team', icon: 'sync', label: '团队管理' },
      { key: 'setting2', icon: 'setting', label: '偏好设置' },
    ],
  },
];

/** 受控选中：点击写回 selectedKeys，选中行淡入主色实底 */
function ControlledDemo(): React.ReactElement {
  const [sel, setSel] = React.useState<string[]>(['profile']);
  return <Menu items={GROUPED} selectedKeys={sel} onClick={(i) => setSel([i.key])} />;
}

/** 深色面板：theme=dark，antd 经典深色导航底 */
function DarkDemo(): React.ReactElement {
  const { token } = useToken();
  return (
    <View style={{ borderRadius: token.borderRadiusLG, overflow: 'hidden' }}>
      <Menu items={GROUPED} theme="dark" defaultSelectedKeys={['team']} style={{ paddingVertical: token.paddingSM }} />
    </View>
  );
}

/** 自定义节点：icon / label 均可传任意 ReactNode（角标、双行标题、右侧快捷键提示等） */
function CustomNodeDemo(): React.ReactElement {
  const { token } = useToken();
  const items: MenuItem[] = [
    {
      key: 'c1',
      icon: (
        <View style={{ width: 18, height: 18, borderRadius: 5, backgroundColor: token.colorPrimary, alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ fontSize: 11, color: '#fff', fontWeight: '600' }}>A</Text>
        </View>
      ),
      label: (
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Text style={{ fontSize: token.fontSize, color: token.colorText }}>带角标的邮件</Text>
          <View style={{ marginLeft: token.marginXS, paddingHorizontal: 6, borderRadius: 8, backgroundColor: token.colorError }}>
            <Text style={{ fontSize: 11, color: '#fff' }}>99+</Text>
          </View>
        </View>
      ),
    },
    {
      key: 'c2',
      icon: (
        <View style={{ width: 18, height: 18, borderRadius: 9, backgroundColor: token.colorSuccess, alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ fontSize: 11, color: '#fff', fontWeight: '600' }}>B</Text>
        </View>
      ),
      label: (
        <View>
          <Text style={{ fontSize: token.fontSize, color: token.colorText }}>双行标题</Text>
          <Text style={{ fontSize: token.fontSizeSM, color: token.colorTextTertiary }}>辅助说明文字</Text>
        </View>
      ),
    },
    {
      key: 'c3',
      icon: <View style={{ width: 16, height: 16, borderRadius: 8, borderWidth: 2, borderColor: token.colorWarning }} />,
      label: (
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <Text style={{ fontSize: token.fontSize, color: token.colorText }}>右侧自定义</Text>
          <Text style={{ fontSize: token.fontSizeSM, color: token.colorTextTertiary }}>Ctrl+K</Text>
        </View>
      ),
    },
  ];
  return <Menu items={items} defaultSelectedKeys={['c1']} />;
}

const DEMOS: DemoItem[] = [
  {
    name: '基础用法',
    desc: 'inline 就地展开，含图标 / 危险项 / 禁用项',
    node: <Menu items={BASIC} defaultOpenKeys={['inbox']} defaultSelectedKeys={['phone']} />,
    code: [
      'import { Menu } from "react-native-flux-desktop";',
      '',
      '// items：叶子项 + children 子菜单（就地展开）；icon/danger/disabled',
      "const items = [",
      "  { key: 'phone', icon: 'sound', label: '电话' },",
      "  { key: 'inbox', icon: 'appstore', label: '站内信', children: [",
      "    { key: 'received', label: '收件箱' },",
      "    { key: 'trash', label: '回收站', danger: true },",
      '  ] },',
      "  { key: 'offline', label: '离线（禁用）', disabled: true },",
      '];',
      '<Menu items={items} defaultOpenKeys={[\'inbox\']} defaultSelectedKeys={[\'phone\']} />',
    ].join('\n'),
  },
  {
    name: '多级子菜单',
    desc: '点击父项逐级展开，行高补间下滑揭示 + 箭头旋转',
    node: <Menu items={NESTED} defaultOpenKeys={['n1']} />,
    code: [
      '// children 逐级嵌套：一级→二级→三级，就地展开',
      "const nested = [",
      "  { key: 'n1', label: '一级菜单', children: [",
      "    { key: 'n1-1', label: '二级项 A' },",
      "    { key: 'n1-2', label: '二级子菜单', children: [",
      "      { key: 'n1-2-1', label: '三级项 1' },",
      '    ] },',
      '  ] },',
      '];',
      '<Menu items={nested} defaultOpenKeys={[\'n1\']} />',
    ].join('\n'),
  },
  {
    name: '手风琴模式',
    desc: 'accordion：展开一个一级菜单自动收起其余（仅限根级）；深层二级子菜单（如“二级子菜单”）仍可各自独立开合',
    node: <Menu items={NESTED} accordion defaultOpenKeys={['n1']} />,
    code: ['// accordion：展开一个根级子菜单自动收起其余（仅根级互斥）', '<Menu items={nested} accordion defaultOpenKeys={[\'n1\']} />'].join('\n'),
  },
  {
    name: '分组标题',
    desc: 'type=group 仅作视觉分隔，标题不可点',
    node: <Menu items={GROUPED} defaultSelectedKeys={['profile']} />,
    code: [
      '// type=group：仅作视觉分隔，标题不可点',
      "const grouped = [",
      "  { key: 'g-msg', type: 'group', label: '消息渠道', children: [",
      "    { key: 'phone', icon: 'sound', label: '电话' },",
      '  ] },',
      "  { key: 'g-sys', type: 'group', label: '系统', children: [",
      "    { key: 'profile', icon: 'user', label: '个人资料' },",
      '  ] },',
      '];',
      '<Menu items={grouped} defaultSelectedKeys={[\'profile\']} />',
    ].join('\n'),
  },
  {
    name: '自定义节点',
    desc: 'icon / label 传任意 ReactNode：角标 / 双行标题 / 右侧提示',
    node: <CustomNodeDemo />,
    code: [
      '// icon / label 传任意 ReactNode：角标 / 双行标题 / 右侧提示',
      '{',
      "  key: 'c1',",
      '  icon: <View style={{ width: 18, height: 18, backgroundColor: token.colorPrimary }} />,',
      '  label: (',
      '    <View style={{ flexDirection: "row" }}>',
      '      <Text>带角标的邮件</Text>',
      '      <Text style={{ color: token.colorError }}>99+</Text>',
      '    </View>',
      '  ),',
      '}',
    ].join('\n'),
  },
  {
    name: '受控选中',
    desc: 'selectedKeys + onClick 写回，选中背景淡变',
    node: <ControlledDemo />,
    code: [
      '// selectedKeys + onClick 受控写回',
      "const [sel, setSel] = React.useState(['profile']);",
      '<Menu items={grouped} selectedKeys={sel} onClick={(i) => setSel([i.key])} />',
    ].join('\n'),
  },
  {
    name: '深色面板',
    desc: 'theme=dark 走 antd 深色配色',
    node: <DarkDemo />,
    code: ['// theme=dark 走 antd 深色配色', '<Menu items={grouped} theme="dark" defaultSelectedKeys={[\'team\']} />'].join('\n'),
  },
];

const API: ApiRow[] = [
  { name: 'items', desc: '菜单项：key/label/icon/disabled/danger/children/type', type: 'MenuItem[]', default: '[]' },
  { name: 'mode', desc: '形态（目前仅 inline 落地：就地展开、逐级缩进）', type: "'inline' | 'vertical'", default: "'inline'" },
  { name: 'theme', desc: '配色主题', type: "'light' | 'dark'", default: "'light'" },
  { name: 'selectedKeys / defaultSelectedKeys', desc: '受控 / 非受控选中项', type: 'string[]', default: '[]' },
  { name: 'openKeys / defaultOpenKeys', desc: '受控 / 非受控展开的子菜单', type: 'string[]', default: '[]' },
  { name: 'accordion', desc: '手风琴：仅根级子菜单互斥（展开一个自动收起其余及其后代），深层子菜单不受限', type: 'boolean', default: 'false' },
  { name: 'onOpenChange', desc: '子菜单开合回调', type: '(openKeys) => void', default: '–' },
  { name: 'onClick / onSelect', desc: '点击 / 选中回调（info 带 key、keyPath 父链）', type: '(info) => void', default: '–' },
  { name: 'inlineIndent', desc: '每多一层的左缩进', type: 'number', default: 'padding + paddingXS' },
];

const TOKENS: TokenRow[] = [
  { name: 'itemHeight', desc: '菜单项行高', default: 'controlHeightLG' },
  { name: 'inlineIndent', desc: '子菜单逐级缩进', default: 'padding + paddingXS' },
  { name: 'itemBorderRadius', desc: '高亮块圆角', default: 'borderRadius' },
  { name: 'colorPrimary', desc: '选中项实底（light）', default: '#1677ff' },
  { name: 'controlItemBgHover', desc: '悬停背景', default: '–' },
  { name: 'colorError', desc: '危险项文字', default: '#ff4d4f' },
  { name: 'darkBg', desc: '深色面板底', default: '#001529' },
];

export function MenuDemo(): React.ReactElement {
  return <DemoPage demos={DEMOS} api={API} tokens={TOKENS} />;
}
