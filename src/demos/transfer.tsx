// TRANSFER：穿梭框。统一走 DemoPage 多段式，覆盖 基础 / 标题与禁用项 / 自定义操作文案 / 隐藏全选 / 单向样式 / 受控。
import React from 'react';
import { Transfer, type TransferItem, View, Text, useToken } from 'react-native-flux-desktop';
import { DemoPage, type DemoItem, type ApiRow, type TokenRow } from '../DemoPage';

const DATA: TransferItem[] = [
  { key: 'a1', title: '张三', description: 'zhangsan@example.com' },
  { key: 'a2', title: '李四', description: 'lisi@example.com' },
  { key: 'a3', title: '王五', description: 'wangwu@example.com' },
  { key: 'a4', title: '赵六', description: 'zhaoliu@example.com', disabled: true },
  { key: 'a5', title: '钱七', description: 'qianqi@example.com' },
  { key: 'a6', title: '孙八', description: 'sunba@example.com' },
  { key: 'a7', title: '周九', description: 'zhoujiu@example.com' },
  { key: 'a8', title: '吴十', description: 'wushi@example.com' },
];

/** 受控：targetKeys 外部管理，回显已选数量 */
function ControlledDemo(): React.ReactElement {
  const { token } = useToken();
  const [keys, setKeys] = React.useState<string[]>(['a3', 'a5']);
  return (
    <View style={{ gap: token.marginSM }}>
      <Text style={{ fontSize: token.fontSize, color: token.colorTextSecondary }}>已选 {keys.length} 项：{keys.join('、') || '（空）'}</Text>
      <Transfer dataSource={DATA} targetKeys={keys} onChange={setKeys} titles={['待选成员', '已选成员']} />
    </View>
  );
}

const DEMOS: DemoItem[] = [
  {
    name: '基础',
    desc: '左右两栏，勾选后点中间箭头整体搬运；表头全选，含禁用项',
    node: <Transfer dataSource={DATA} defaultTargetKeys={['a3', 'a5']} titles={['待选成员', '已选成员']} />,
    code: [
      'import { Transfer } from "react-native-flux-desktop";',
      '',
      '// 左右两栏，勾选后点中间箭头整体搬运',
      'const DATA = [',
      '  { key: \'a1\', title: \'张三\', description: \'zhangsan@example.com\' },',
      '  { key: \'a4\', title: \'赵六\', disabled: true },',
      '];',
      '<Transfer dataSource={DATA} defaultTargetKeys={[\'a3\', \'a5\']} titles={[\'待选成员\', \'已选成员\']} />',
    ].join('\n'),
  },
  {
    name: '标题与禁用项',
    desc: 'titles 自定义两栏标题；item.disabled 的项灰显不可选',
    node: <Transfer dataSource={DATA} defaultTargetKeys={['a1']} titles={['源列表（含禁用）', '目标列表']} />,
    code: [
      'import { Transfer } from "react-native-flux-desktop";',
      '',
      '// titles 自定义两栏标题；item.disabled 灰显不可选',
      '<Transfer',
      '  dataSource={DATA}',
      '  defaultTargetKeys={[\'a1\']}',
      '  titles={[\'源列表（含禁用）\', \'目标列表\']}',
      '/>',
    ].join('\n'),
  },
  {
    name: '自定义操作文案',
    desc: 'operations 用文字替换中间箭头按钮',
    node: <Transfer dataSource={DATA} defaultTargetKeys={['a6']} operations={['加入', '移除']} />,
    code: [
      'import { Transfer } from "react-native-flux-desktop";',
      '',
      '// operations 用文字替换中间箭头按钮',
      '<Transfer dataSource={DATA} defaultTargetKeys={[\'a6\']} operations={[\'加入\', \'移除\']} />',
    ].join('\n'),
  },
  {
    name: '隐藏全选',
    desc: 'showSelectAll = false 去掉表头全选框',
    node: <Transfer dataSource={DATA} defaultTargetKeys={['a2']} showSelectAll={false} />,
    code: [
      'import { Transfer } from "react-native-flux-desktop";',
      '',
      '// showSelectAll=false 去掉表头全选框',
      '<Transfer dataSource={DATA} defaultTargetKeys={[\'a2\']} showSelectAll={false} />',
    ].join('\n'),
  },
  {
    name: '单向样式',
    desc: 'oneWay 无中间按钮：点左项直接移入右，右项带移除箭头',
    node: <Transfer dataSource={DATA} defaultTargetKeys={['a5', 'a7']} oneWay titles={['可选', '已选']} />,
    code: [
      'import { Transfer } from "react-native-flux-desktop";',
      '',
      '// oneWay 无中间按钮：点左项直接移入右，右项带移除箭头',
      '<Transfer dataSource={DATA} defaultTargetKeys={[\'a5\', \'a7\']} oneWay titles={[\'可选\', \'已选\']} />',
    ].join('\n'),
  },
  {
    name: '受控',
    desc: 'targetKeys + onChange，已选数量回显外部',
    node: <ControlledDemo />,
    code: [
      'import { Transfer } from "react-native-flux-desktop";',
      '',
      '// 受控：targetKeys + onChange',
      "const [keys, setKeys] = React.useState(['a3', 'a5']);",
      '<Transfer dataSource={DATA} targetKeys={keys} onChange={setKeys} titles={[\'待选成员\', \'已选成员\']} />',
    ].join('\n'),
  },
];

const API: ApiRow[] = [
  { name: 'dataSource', desc: '全量数据源', type: 'TransferItem[]', default: '–' },
  { name: 'targetKeys / defaultTargetKeys', desc: '右栏 key 集合（受控 / 非受控）', type: 'string[]', default: '–' },
  { name: 'titles', desc: '两栏标题', type: '[node, node]', default: '–' },
  { name: 'operations', desc: '操作按钮文案（默认箭头）', type: '[node, node]', default: '–' },
  { name: 'showSelectAll', desc: '显示表头全选框', type: 'boolean', default: 'true' },
  { name: 'oneWay', desc: '单向样式', type: 'boolean', default: 'false' },
  { name: 'disabled', desc: '整体禁用', type: 'boolean', default: 'false' },
  { name: 'listStyle', desc: '单栏样式', type: 'ViewStyle', default: '–' },
  { name: 'onChange', desc: '穿梭时回传新的 targetKeys', type: '(targetKeys) => void', default: '–' },
];

const TOKENS: TokenRow[] = [
  { name: 'colorFillQuaternary', desc: '表头底色', default: '极浅填充' },
  { name: 'colorPrimary', desc: '有选中时的操作按钮底色', default: '主色' },
  { name: 'colorBorderSecondary', desc: '列表描边', default: '浅分隔色' },
];

export function TransferDemo(): React.ReactElement {
  return <DemoPage demos={DEMOS} api={API} tokens={TOKENS} />;
}
