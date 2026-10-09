// TABLE demo：DemoPage 多段式（基础 / 边框斑马纹 / 排序 / 多选 / 单选 / 尺寸 / 加载 / 空数据）。
import React from 'react';
import { Table, Tag, Space, Text, useToken, type TableColumn, type TableRowSelection } from 'react-native-flux-desktop';
import { DemoPage, type DemoItem, type ApiRow, type TokenRow } from '../DemoPage';

interface Row {
  name: string;
  age: number;
  address: string;
  state: 'active' | 'idle' | 'blocked';
}

const DATA: Row[] = [
  { name: '张初', age: 32, address: '上海市浦东新区', state: 'active' },
  { name: '李远', age: 28, address: '杭州市西湖区', state: 'idle' },
  { name: '王明', age: 41, address: '北京市朝阳区', state: 'blocked' },
  { name: '赵雨', age: 25, address: '深圳市南山区', state: 'active' },
];

const stateMap: Record<Row['state'], { preset: string; text: string }> = {
  active: { preset: 'success', text: '进行中' },
  idle: { preset: 'processing', text: '待处理' },
  blocked: { preset: 'error', text: '已阻断' },
};

function useColumns(withSort: boolean): TableColumn<Row>[] {
  const { token } = useToken();
  return [
    {
      title: '姓名',
      dataIndex: 'name',
      width: 120,
      sorter: withSort ? (a, b) => a.name.localeCompare(b.name, 'zh') : undefined,
      render: (v) => <Text style={{ color: token.colorText, fontSize: token.fontSize, fontWeight: '500' }}>{v}</Text>,
    },
    { title: '年龄', dataIndex: 'age', width: 100, align: 'right', sorter: withSort ? (a, b) => a.age - b.age : undefined },
    { title: '地址', dataIndex: 'address' },
    {
      title: '状态',
      dataIndex: 'state',
      width: 110,
      render: (v: Row['state']) => <Tag color={stateMap[v].preset}>{stateMap[v].text}</Tag>,
    },
  ];
}

function BasicTable({ size, bordered, striped, empty }: { size?: 'large' | 'middle' | 'small'; bordered?: boolean; striped?: boolean; empty?: boolean }): React.ReactElement {
  const columns = useColumns(false);
  return <Table columns={columns} dataSource={empty ? [] : DATA} rowKey={(r) => r.name} size={size} bordered={bordered} striped={striped} />;
}

function SortTable(): React.ReactElement {
  const columns = useColumns(true);
  return <Table columns={columns} dataSource={DATA} rowKey={(r) => r.name} bordered />;
}

function SelectionTable({ type }: { type: 'checkbox' | 'radio' }): React.ReactElement {
  const columns = useColumns(false);
  const [keys, setKeys] = React.useState<React.Key[]>([]);
  const rowSelection: TableRowSelection<Row> = { type, selectedRowKeys: keys, onChange: (k) => setKeys(k) };
  return (
    <Space direction="vertical" size={8} style={{ width: '100%' }}>
      <Table columns={columns} dataSource={DATA} rowKey={(r) => r.name} rowSelection={rowSelection} bordered />
      <Text style={{ fontSize: 13, color: '#999' }}>已选：{keys.length ? keys.join('、') : '（无）'}</Text>
    </Space>
  );
}

function LoadingTable(): React.ReactElement {
  const columns = useColumns(false);
  return <Table columns={columns} dataSource={DATA} rowKey={(r) => r.name} loading bordered />;
}

const DEMOS: DemoItem[] = [
  {
    name: '基础',
    desc: 'columns + dataSource，行悬停高亮',
    node: <BasicTable />,
    code: [
      'import { Table, Tag, type TableColumn } from "react-native-flux-desktop";',
      '',
      'const columns: TableColumn[] = [',
      '  { title: \'姓名\', dataIndex: \'name\', width: 120 },',
      '  { title: \'年龄\', dataIndex: \'age\', width: 100, align: \'right\' },',
      '  { title: \'地址\', dataIndex: \'address\' },',
      '  { title: \'状态\', dataIndex: \'state\', width: 110, render: (v) => <Tag>{v}</Tag> },',
      '];',
      '',
      '<Table columns={columns} dataSource={data} rowKey={(r) => r.name} />',
    ].join('\n'),
  },
  {
    name: '边框与斑马纹',
    desc: 'bordered 外框单元格线；striped 隔行底色',
    node: <BasicTable bordered striped />,
    code: [
      'import { Table } from "react-native-flux-desktop";',
      '',
      '// bordered 外框单元格线；striped 隔行底色',
      '<Table columns={columns} dataSource={data} rowKey={(r) => r.name} bordered striped />',
    ].join('\n'),
  },
  {
    name: '列排序',
    desc: 'sorter 列头可点击，升 → 降 → 无循环，箭头指示',
    node: <SortTable />,
    code: [
      'import { Table } from "react-native-flux-desktop";',
      '',
      '// column.sorter 列头可点击，升 → 降 → 无循环',
      'const columns = [',
      '  { title: \'年龄\', dataIndex: \'age\', sorter: (a, b) => a.age - b.age },',
      '];',
      '<Table columns={columns} dataSource={data} rowKey={(r) => r.name} bordered />',
    ].join('\n'),
  },
  {
    name: '多选',
    desc: 'rowSelection checkbox，含表头全选 / 半选',
    node: <SelectionTable type="checkbox" />,
    code: [
      'import { Table } from "react-native-flux-desktop";',
      '',
      '// rowSelection type=checkbox 多选，含表头全选 / 半选',
      'const rowSelection = { type: \'checkbox\', selectedRowKeys: keys, onChange: (k) => setKeys(k) };',
      '<Table columns={columns} dataSource={data} rowKey={(r) => r.name} rowSelection={rowSelection} />',
    ].join('\n'),
  },
  {
    name: '单选',
    desc: 'rowSelection type=radio 单选一行',
    node: <SelectionTable type="radio" />,
    code: [
      'import { Table } from "react-native-flux-desktop";',
      '',
      '// rowSelection type=radio 单选一行',
      'const rowSelection = { type: \'radio\', selectedRowKeys: keys, onChange: setKeys };',
      '<Table columns={columns} dataSource={data} rowKey={(r) => r.name} rowSelection={rowSelection} />',
    ].join('\n'),
  },
  {
    name: '尺寸',
    desc: 'size：large / middle / small 三档密度',
    node: (
      <Space direction="vertical" size={12} style={{ width: '100%' }}>
        <BasicTable size="middle" bordered />
        <BasicTable size="small" bordered />
      </Space>
    ),
    code: [
      'import { Table } from "react-native-flux-desktop";',
      '',
      '// size：large / middle / small 三档密度',
      '<Table size="middle" bordered columns={columns} dataSource={data} />',
      '<Table size="small" bordered columns={columns} dataSource={data} />',
    ].join('\n'),
  },
  {
    name: '加载中',
    desc: 'loading 半透明遮罩 + Spin',
    node: <LoadingTable />,
    code: [
      'import { Table } from "react-native-flux-desktop";',
      '',
      '// loading 半透明遮罩 + Spin',
      '<Table loading columns={columns} dataSource={data} rowKey={(r) => r.name} bordered />',
    ].join('\n'),
  },
  {
    name: '空数据',
    desc: 'dataSource 为空显示占位',
    node: <BasicTable bordered empty />,
    code: [
      'import { Table } from "react-native-flux-desktop";',
      '',
      '// dataSource 为空显示占位',
      '<Table columns={columns} dataSource={[]} rowKey={(r) => r.name} bordered />',
    ].join('\n'),
  },
];

const API: ApiRow[] = [
  { name: 'columns', desc: '列配置', type: 'TableColumn[]', default: '–' },
  { name: 'dataSource', desc: '行数据', type: 'T[]', default: '–' },
  { name: 'rowKey', desc: '行主键取值', type: '(row, i) => Key', default: 'index' },
  { name: 'size', desc: '密度', type: "'large' | 'middle' | 'small'", default: "'large'" },
  { name: 'bordered', desc: '边框', type: 'boolean', default: 'false' },
  { name: 'striped', desc: '斑马纹', type: 'boolean', default: 'false' },
  { name: 'loading', desc: '加载遮罩', type: 'boolean', default: 'false' },
  { name: 'rowSelection', desc: '行选择（checkbox/radio）', type: 'TableRowSelection', default: '–' },
  { name: 'columns.sorter', desc: '列比较函数（可排序）', type: '(a, b) => number', default: '–' },
];

const TOKENS: TokenRow[] = [
  { name: 'colorFillQuaternary', desc: '表头底色 / 悬停', default: '浅填充' },
  { name: 'colorFillTertiary', desc: '斑马纹行底色', default: '次浅填充' },
  { name: 'padding / paddingSM / paddingXS', desc: '三档纵向内边距', default: '16 / 12 / 8' },
];

export function TableDemo(): React.ReactElement {
  return <DemoPage demos={DEMOS} api={API} tokens={TOKENS} />;
}
