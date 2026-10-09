// DROPDOWN：下拉菜单。统一走 DemoPage 多段式，覆盖 antd v5 触发方式 / 选中 / 子菜单 / placement / arrow / Button。
import React from 'react';
import { Dropdown, Button, Space, Icon, Text, View, useToken, type DropdownItem } from 'react-native-flux-desktop';
import { DemoPage, type DemoItem, type ApiRow, type TokenRow } from '../DemoPage';

/** 基础菜单：图标 + 分隔线 + 禁用 + 危险项 */
const ITEMS: DropdownItem[] = [
  { key: '1', label: '第一个菜单项', icon: 'edit' },
  { key: '2', label: '第二个菜单项', icon: 'star' },
  { key: 'd1', type: 'divider' },
  { key: '3', label: '禁用项', icon: 'lock', disabled: true },
  { key: '4', label: '删除', icon: 'delete', danger: true },
];

/** 带子菜单的菜单：父项行内展开一层 */
const SUB_ITEMS: DropdownItem[] = [
  { key: '1', label: '普通项', icon: 'edit' },
  {
    key: 'g1',
    label: '更多操作',
    children: [
      { key: 'g1-1', label: '复制' },
      { key: 'g1-2', label: '移动' },
      { key: 'g1-3', label: '归档', disabled: true },
    ],
  },
  { key: '4', label: '删除', icon: 'delete', danger: true },
];

/** 选中态可持久：点击项写回 selectedKeys */
function SelectableDemo(): React.ReactElement {
  const { token } = useToken();
  const [selected, setSelected] = React.useState<string[]>(['2']);
  return (
    <Space align="center">
      <Dropdown
        menu={{ items: ITEMS, selectable: true, selectedKeys: selected, onClick: (key) => setSelected([key]) }}
      >
        <Button>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text style={{ fontSize: token.fontSize, color: token.colorText }}>选中态</Text>
            <Icon name="down" size={12} color={token.colorText} style={{ marginLeft: token.marginXXS }} />
          </View>
        </Button>
      </Dropdown>
      <Text style={{ fontSize: token.fontSize, color: token.colorTextSecondary }}>
        当前选中：{selected[0] ?? '无'}
      </Text>
    </Space>
  );
}

/** keyPath 演示：子菜单项点击后把路径显示在按钮旁 */
function KeyPathDemo(): React.ReactElement {
  const { token } = useToken();
  const [last, setLast] = React.useState('');
  return (
    <Space align="center">
      <Dropdown
        menu={{
          items: SUB_ITEMS,
          onClick: (key, info) => setLast(info.keyPath.join(' > ')),
        }}
      >
        <Button type="dashed">
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text style={{ fontSize: token.fontSize, color: token.colorText }}>子菜单</Text>
            <Icon name="down" size={12} color={token.colorText} style={{ marginLeft: token.marginXXS }} />
          </View>
        </Button>
      </Dropdown>
      <Text style={{ fontSize: token.fontSize, color: token.colorTextSecondary }}>
        {last ? `keyPath = [${last}]` : '展开「更多操作」点子项试试'}
      </Text>
    </Space>
  );
}

const DEMOS: DemoItem[] = [
  {
    name: '点击触发',
    desc: '默认 click：点触发器开合，点菜单项或空白收起；含图标 / 分隔线 / 禁用 / 危险项',
    node: (
      <Space align="start">
        <Dropdown menu={{ items: ITEMS, onClick: () => undefined }}>
          <Button type="primary">
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={{ fontSize: 14, color: '#fff' }}>菜单</Text>
              <Icon name="down" size={12} color="#fff" style={{ marginLeft: 4 }} />
            </View>
          </Button>
        </Dropdown>
      </Space>
    ),
    code: [
      'import { Dropdown, Button } from "react-native-flux-desktop";',
      '',
      '// 默认 click：点触发器开合；menu.items 含图标/分隔线/禁用/危险项',
      "const items = [",
      "  { key: '1', label: '第一个菜单项', icon: 'edit' },",
      "  { key: '2', label: '第二个菜单项', icon: 'star' },",
      "  { key: 'd1', type: 'divider' },",
      "  { key: '3', label: '禁用项', icon: 'lock', disabled: true },",
      "  { key: '4', label: '删除', icon: 'delete', danger: true },",
      '];',
      '<Dropdown menu={{ items, onClick: (key) => {} }}>',
      '  <Button type="primary">菜单 <Icon name="down" size={12} /></Button>',
      '</Dropdown>',
    ].join('\n'),
  },
  {
    name: '悬停触发',
    desc: 'trigger="hover"：鼠标移入展开、移出收起',
    node: <HoverTrigger />,
    code: ['// trigger="hover"：鼠标移入展开、移出收起', '<Dropdown trigger="hover" menu={{ items: ITEMS }}>', '  <Button>悬停我</Button>', '</Dropdown>'].join('\n'),
  },
  {
    name: '选中态',
    desc: 'selectable + selectedKeys：主色文字 + 对勾，点击写回',
    node: <SelectableDemo />,
    code: [
      '// selectable + selectedKeys：主色文字 + 对勾，点击写回',
      "const [selected, setSelected] = React.useState(['2']);",
      '<Dropdown',
      '  menu={{ items: ITEMS, selectable: true, selectedKeys: selected, onClick: (key) => setSelected([key]) }}',
      '>',
      '  <Button>选中态</Button>',
      '</Dropdown>',
    ].join('\n'),
  },
  {
    name: '子菜单',
    desc: 'items[].children 行内展开一层；点击父项不关闭面板，info.keyPath 给父链',
    node: <KeyPathDemo />,
    code: [
      '// items[].children 行内展开一层；info.keyPath 给父链',
      "const items = [",
      "  { key: '1', label: '普通项' },",
      "  { key: 'g1', label: '更多操作', children: [",
      "    { key: 'g1-1', label: '复制' },",
      "    { key: 'g1-2', label: '移动' },",
      '  ] },',
      '];',
      '<Dropdown menu={{ items, onClick: (key, info) => info.keyPath.join(" > ") }}>',
      '  <Button type="dashed">子菜单</Button>',
      '</Dropdown>',
    ].join('\n'),
  },
  {
    name: '弹出位置',
    desc: 'placement：bottomLeft（默认）/ bottomRight / topRight',
    node: <Placements />,
    code: [
      '// placement：bottomLeft（默认）/ bottomRight / topLeft / topRight',
      '<Dropdown placement="bottomRight" menu={{ items: ITEMS }}><Button>bottomRight</Button></Dropdown>',
      '<Dropdown placement="topRight" menu={{ items: ITEMS }}><Button>topRight（向上弹）</Button></Dropdown>',
    ].join('\n'),
  },
  {
    name: '箭头',
    desc: 'arrow：面板边缘小方块指向触发器',
    node: <Arrows />,
    code: ['// arrow：面板边缘小方块指向触发器', '<Dropdown arrow placement="bottomRight" menu={{ items: ITEMS }}>', '  <Button type="dashed">bottomRight + arrow</Button>', '</Dropdown>'].join('\n'),
  },
  {
    name: '复合按钮 Dropdown.Button',
    desc: '左主按钮执行动作 + 右下拉区展开菜单，type="primary" 变体',
    node: <Buttons />,
    code: [
      '// Dropdown.Button：左主按钮执行动作 + 右下拉区展开菜单',
      '<Dropdown.Button buttons="保存" menu={{ items: ITEMS }} />',
      '<Dropdown.Button type="primary" buttons="主色" menu={{ items: ITEMS }} />',
    ].join('\n'),
  },
  {
    name: '整表禁用',
    desc: 'menu.disabled：触发器可点但面板不弹出',
    node: <MenuDisabled />,
    code: ['// menu.disabled：触发器可点但面板不弹出', '<Dropdown menu={{ items: ITEMS, disabled: true }}>', '  <Button disabled>菜单禁用</Button>', '</Dropdown>'].join('\n'),
  },
];

function HoverTrigger(): React.ReactElement {
  return (
    <Space align="start">
      <Dropdown trigger="hover" menu={{ items: ITEMS }}>
        <Button>悬停我</Button>
      </Dropdown>
    </Space>
  );
}

function Placements(): React.ReactElement {
  return (
    <Space size="large" wrap>
      <Dropdown menu={{ items: ITEMS }}>
        <Button>bottomLeft</Button>
      </Dropdown>
      <Dropdown placement="bottomRight" menu={{ items: ITEMS }}>
        <Button>bottomRight</Button>
      </Dropdown>
      <Dropdown placement="topRight" menu={{ items: ITEMS }}>
        <Button>topRight（向上弹）</Button>
      </Dropdown>
    </Space>
  );
}

function Arrows(): React.ReactElement {
  return (
    <Space size="large" wrap>
      <Dropdown arrow menu={{ items: ITEMS }}>
        <Button type="dashed">bottomLeft + arrow</Button>
      </Dropdown>
      <Dropdown arrow placement="bottomRight" menu={{ items: ITEMS }}>
        <Button type="dashed">bottomRight + arrow</Button>
      </Dropdown>
    </Space>
  );
}

function Buttons(): React.ReactElement {
  return (
    <Space size="large" wrap>
      <Dropdown.Button buttons="保存" menu={{ items: ITEMS }} />
      <Dropdown.Button type="primary" buttons="主色" menu={{ items: ITEMS }} />
    </Space>
  );
}

function MenuDisabled(): React.ReactElement {
  return (
    <Space align="start">
      <Dropdown menu={{ items: ITEMS, disabled: true }}>
        <Button disabled>菜单禁用</Button>
      </Dropdown>
    </Space>
  );
}

const API: ApiRow[] = [
  { name: 'menu.items', desc: '菜单项：label/icon/danger/disabled/type/children', type: 'DropdownItem[]', default: '[]' },
  { name: 'menu.onClick', desc: '点击菜单项（info 带 key、keyPath 父链）', type: '(key, info) => void', default: '–' },
  { name: 'menu.selectable / selectedKeys', desc: '选中模式与受控选中项', type: 'boolean / string[]', default: '–' },
  { name: 'menu.disabled', desc: '整个菜单禁用（不弹出）', type: 'boolean', default: 'false' },
  { name: 'trigger', desc: '展开方式', type: "'click' | 'hover'", default: "'click'" },
  { name: 'placement', desc: '弹出位置', type: "'bottomLeft' | 'bottomRight' | 'topLeft' | 'topRight'", default: "'bottomLeft'" },
  { name: 'arrow', desc: '面板边缘箭头', type: 'boolean', default: 'false' },
  { name: 'disabled / onOpenChange', desc: '触发器禁用 / 开合回调', type: 'boolean / (open) => void', default: '–' },
  { name: 'Dropdown.Button', desc: '复合按钮：buttons 左钮文字 / onClick 左钮动作', type: 'FC', default: '–' },
];

const TOKENS: TokenRow[] = [
  { name: 'colorBgElevated', desc: '面板底色', default: '–' },
  { name: 'colorPrimary', desc: '选中项文字与对勾', default: '#1677ff' },
  { name: 'colorError', desc: '危险项文字', default: '#ff4d4f' },
  { name: 'colorSplit', desc: '分隔线', default: '–' },
];

export function DropdownDemo(): React.ReactElement {
  return <DemoPage demos={DEMOS} api={API} tokens={TOKENS} />;
}
