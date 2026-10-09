// TODO：待办清单。统一走 DemoPage 多段式，重点演示「支持自定义节点」：
// item.node（替换内容区）/ renderItem（接管整行）两条逃生口，外加受控删除 + 计数、尺寸。
import React from 'react';
import { Todo, type TodoItem, View, Text, Tag, Avatar, Pressable, useToken } from 'react-native-flux-desktop';
import { DemoPage, type DemoItem, type ApiRow, type TokenRow } from '../DemoPage';

const BASE: TodoItem[] = [
  { id: 1, title: '完成 Todo 组件设计', description: '对齐 antd 命名，确定受控 / 非受控双模式', done: true },
  { id: 2, title: '编写抓帧用例', description: '覆盖基础 / 自定义节点 / 删除 / 尺寸' },
  { id: 3, title: '接入 Gallery 导航', description: '数据展示分组下新增条目' },
  { id: 4, title: '同步 release 便携包', disabled: true, description: '需先通过 tsc 校验' },
];

/** 基础：数据驱动 + 勾选完成（非受控） */
function BasicDemo(): React.ReactElement {
  return <Todo items={BASE} header="今日待办" style={{ maxWidth: 560 }} />;
}

/** item.node + extra：node 定制内容区（标题 + 进度条），extra 放右侧 Tag */
function NodeDemo(): React.ReactElement {
  const { token } = useToken();
  const items: TodoItem[] = [
    {
      id: 'a',
      extra: <Tag color="processing">进行中</Tag>,
      node: (
        <View style={{ gap: 6 }}>
          <Text style={{ fontSize: token.fontSize, fontWeight: '500', color: token.colorText }}>渲染管线优化</Text>
          <View style={{ height: 4, width: 220, borderRadius: 2, backgroundColor: token.colorFillSecondary }}>
            <View style={{ height: 4, width: 136, borderRadius: 2, backgroundColor: token.colorPrimary }} />
          </View>
        </View>
      ),
    },
    {
      id: 'b',
      done: true,
      title: '补齐文本缓存',
      description: '行高 / 宽度测量两项已落地',
      extra: <Tag color="success">已完成</Tag>,
    },
  ];
  return <Todo items={items} header="item.node 定制内容区 + extra 放 Tag" style={{ maxWidth: 560 }} />;
}

/** renderItem：接管整行（优先级色条 + 负责人头像） */
function RenderItemDemo(): React.ReactElement {
  const { token } = useToken();
  const rows: (TodoItem & { priority: 'high' | 'mid' | 'low'; owner: string; color: string })[] = [
    { id: 1, title: '修复光标移动蠕动', priority: 'high', owner: 'K', color: '#1677ff' },
    { id: 2, title: '补充 Sankey 文档', priority: 'mid', owner: 'L', color: '#52c41a', done: true },
    { id: 3, title: '重构 token 派生', priority: 'low', owner: 'Z', color: '#fa8c16' },
  ];
  const pc: Record<string, string> = { high: token.colorError, mid: token.colorWarning, low: token.colorSuccess };
  const pl: Record<string, string> = { high: '高', mid: '中', low: '低' };
  return (
    <Todo
      items={rows}
      header="renderItem 接管整行"
      style={{ maxWidth: 560 }}
      renderItem={(raw, _i, ctx) => {
        const item = raw as TodoItem & { priority: 'high' | 'mid' | 'low'; owner: string; color: string };
        return (
          <Pressable
            onPress={ctx.toggle}
            style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: token.paddingSM, paddingVertical: token.paddingSM, cursor: 'pointer', opacity: ctx.done ? 0.6 : 1 }}
          >
            <View style={{ width: 3, alignSelf: 'stretch', borderRadius: 2, backgroundColor: pc[item.priority] }} />
            <View style={{ flex: 1, marginLeft: token.marginSM }}>
              <Text style={{ fontSize: token.fontSize, color: ctx.done ? token.colorTextTertiary : token.colorText, textDecorationLine: ctx.done ? 'line-through' : 'none' }}>
                {item.title as string}
              </Text>
            </View>
            <Tag color={item.priority === 'high' ? 'error' : item.priority === 'mid' ? 'warning' : 'success'}>{pl[item.priority]}</Tag>
            <Avatar size="small" style={{ backgroundColor: item.color, marginLeft: token.marginXS }}>{item.owner}</Avatar>
          </Pressable>
        );
      }}
    />
  );
}

/** 受控删除 + 计数 */
function DeleteDemo(): React.ReactElement {
  const { token } = useToken();
  const [items, setItems] = React.useState<TodoItem[]>([
    { id: 1, title: '评审 PR #128' },
    { id: 2, title: '更新 CHANGELOG', done: true },
    { id: 3, title: '打包发布 v0.4.0' },
  ]);
  const [checked, setChecked] = React.useState<(string | number)[]>([2]);
  return (
    <Todo
      items={items}
      checked={checked}
      onChange={setChecked}
      onDelete={(it) => setItems((prev) => prev.filter((x) => x.id !== it.id))}
      allowDelete
      showCount
      header="受控 + 删除 + 计数"
      style={{ maxWidth: 560 }}
      footer={
        <Text style={{ fontSize: token.fontSizeSM, color: token.colorTextTertiary }}>点击行尾垃圾桶删除；勾选联动底部计数</Text>
      }
    />
  );
}

/** 尺寸三档 */
function SizeDemo(): React.ReactElement {
  const one: TodoItem[] = [{ id: 1, title: '紧凑尺寸', description: 'small' }, { id: 2, title: '默认尺寸', description: 'default', done: true }];
  return (
    <View style={{ gap: 16, maxWidth: 560 }}>
      <Todo items={one} size="small" header="small" />
      <Todo items={one} size="default" header="default" />
      <Todo items={one} size="large" header="large" />
    </View>
  );
}

const DEMOS: DemoItem[] = [
  {
    name: '基础',
    desc: 'items 数据驱动，点击整行切换完成（标题划线），disabled 项置灰',
    node: <BasicDemo />,
    code: [
      'import { Todo } from "react-native-flux-desktop";',
      '',
      'const items = [',
      '  { id: 1, title: \'完成设计\', description: \'……\', done: true },',
      '  { id: 4, title: \'同步发布包\', disabled: true },',
      '];',
      '',
      '// 非受控：点击整行切换完成',
      '<Todo items={items} header="今日待办" style={{ maxWidth: 560 }} />',
    ].join('\n'),
  },
  {
    name: '自定义内容节点',
    desc: 'item.node 替换「标题 + 描述」区，勾选框与右侧外壳保留（嵌 Tag / 进度条）',
    node: <NodeDemo />,
    code: [
      'import { Todo, Tag, View, Text } from "react-native-flux-desktop";',
      '',
      '// item.node 定制内容区，extra 放右侧 Tag',
      '<Todo',
      '  items={[',
      '    {',
      '      id: \'a\',',
      '      extra: <Tag color="processing">进行中</Tag>,',
      '      node: <Text>渲染管线优化</Text>,',
      '    },',
      '  ]}',
      '/>',
    ].join('\n'),
  },
  {
    name: '整行自定义',
    desc: 'renderItem 接管整行，ctx 提供 done / toggle，自由编排优先级条与头像',
    node: <RenderItemDemo />,
    code: [
      'import { Todo, Tag, Avatar, Pressable } from "react-native-flux-desktop";',
      '',
      '// renderItem 接管整行，ctx 提供 done / toggle',
      '<Todo',
      '  items={rows}',
      '  renderItem={(item, _i, ctx) => (',
      '    <Pressable onPress={ctx.toggle} style={{ flexDirection: \'row\', alignItems: \'center\' }}>',
      '      <Tag color={item.priority === \'high\' ? \'error\' : \'success\'}>{item.priority}</Tag>',
      '      <Avatar size="small">{item.owner}</Avatar>',
      '    </Pressable>',
      '  )}',
      '/>',
    ].join('\n'),
  },
  {
    name: '受控删除',
    desc: 'checked + onChange 受控，allowDelete 删除，showCount 底部汇总',
    node: <DeleteDemo />,
    code: [
      'import { Todo, useState } from "react-native-flux-desktop";',
      '',
      '// checked + onChange 受控，allowDelete 删除，showCount 计数',
      '<Todo',
      '  items={items}',
      '  checked={checked}',
      '  onChange={setChecked}',
      '  onDelete={(it) => setItems((prev) => prev.filter((x) => x.id !== it.id))}',
      '  allowDelete',
      '  showCount',
      '/>',
    ].join('\n'),
  },
  {
    name: '尺寸',
    desc: "size='small' / 'default' / 'large' 调整行高与勾选框",
    node: <SizeDemo />,
    code: [
      'import { Todo, View } from "react-native-flux-desktop";',
      '',
      '// size 调整行高与勾选框',
      '<View style={{ gap: 16 }}>',
      '  <Todo items={one} size="small" header="small" />',
      '  <Todo items={one} size="default" header="default" />',
      '  <Todo items={one} size="large" header="large" />',
      '</View>',
    ].join('\n'),
  },
];

const API: ApiRow[] = [
  { name: 'items', desc: '数据源（id/title/description/done/disabled/extra/node）', type: 'TodoItem[]', default: '[]' },
  { name: 'checked / onChange', desc: '受控完成 id 集合 / 变化回调', type: 'TodoId[] / (ids)', default: '–' },
  { name: 'defaultChecked', desc: '非受控初始完成 id', type: 'TodoId[]', default: '–' },
  { name: 'renderItem', desc: '整行自定义渲染（ctx: done/toggle/remove）', type: '(item,i,ctx)', default: '–' },
  { name: 'item.node', desc: '自定义内容节点，替换标题+描述区', type: 'ReactNode', default: '–' },
  { name: 'item.extra', desc: '行右侧额外内容', type: 'ReactNode', default: '–' },
  { name: 'onDelete', desc: '删除某项回调', type: '(item)', default: '–' },
  { name: 'header / footer', desc: '顶 / 底自定义区', type: 'ReactNode', default: '–' },
  { name: 'showCount', desc: '底部完成计数条', type: 'boolean', default: 'false' },
  { name: 'allowDelete', desc: '行尾删除按钮', type: 'boolean', default: 'false' },
  { name: 'size', desc: '尺寸', type: "'large' | 'default' | 'small'", default: "'default'" },
  { name: 'disabled', desc: '整表禁用', type: 'boolean', default: 'false' },
];

const TOKENS: TokenRow[] = [
  { name: 'colorBgContainer', desc: '清单底色', default: '容器背景' },
  { name: 'colorPrimary', desc: '完成勾选框填充', default: '主色' },
  { name: 'colorSplit', desc: '行间分隔线', default: '分隔色' },
  { name: 'borderRadiusLG', desc: '外框圆角', default: '8' },
];

export function TodoDemo(): React.ReactElement {
  return <DemoPage demos={DEMOS} api={API} tokens={TOKENS} />;
}
