// PRO-TABLE：高阶表格（筛选栏 + 工具栏 + 表格 + 分页一体）。DemoPage 多段式：本地过滤 / 异步 request。
import React from 'react';
import { Button, Text, View, useToken, type ProColumn, type ProFilterField, type ProTableRequestParams } from 'react-native-flux-desktop';
import { ProTable } from 'react-native-flux-desktop-pro';
import { DemoPage, type DemoItem, type ApiRow, type TokenRow } from '../DemoPage';

interface Emp {
  id: number;
  name: string;
  dept: string;
  city: string;
  salary: number;
  age: number;
}

const DEPTS = ['研发', '市场', '财务', '设计'];
const CITIES = ['杭州', '北京', '深圳', '成都'];
const SURNAMES = ['张', '李', '王', '刘', '陈', '赵', '孙', '周'];

function makeRows(n: number, seed: number): Emp[] {
  return Array.from({ length: n }, (_, i) => ({
    id: seed + i,
    name: `${SURNAMES[(seed + i) % SURNAMES.length]}工 ${seed + i}`,
    dept: DEPTS[(seed + i) % DEPTS.length],
    city: CITIES[(seed + i * 3) % CITIES.length],
    salary: 9000 + ((seed + i) * 137) % 16000,
    age: 23 + ((seed * 7 + i * 13) % 22),
  }));
}

const ALL = makeRows(46, 1);

const columns: ProColumn<Emp>[] = [
  { title: '姓名', dataIndex: 'name', key: 'name', search: true, width: 160 },
  { title: '年龄', dataIndex: 'age', key: 'age', width: 90, sorter: (a, b) => a.age - b.age },
  { title: '部门', dataIndex: 'dept', key: 'dept', search: true, width: 110 },
  { title: '城市', dataIndex: 'city', key: 'city', width: 110 },
  {
    title: '月薪',
    dataIndex: 'salary',
    key: 'salary',
    width: 130,
    sorter: (a, b) => a.salary - b.salary,
    render: (v: number) => <Text style={{ fontWeight: '500' }}>¥ {v.toLocaleString()}</Text>,
  },
];

const filterFields: ProFilterField[] = [
  { name: 'city', label: '城市', type: 'select', options: CITIES.map((c) => ({ label: c, value: c })), width: 120 },
];

/** 本地模式：dataSource 全量给到，过滤 + 分页都在组件内 */
function LocalDemo(): React.ReactElement {
  const { token } = useToken();
  return (
    <View style={{ gap: token.marginXS }}>
      <ProTable<Emp>
        columns={columns}
        dataSource={ALL}
        rowKey={(r) => r.id}
        headerTitle="员工列表（本地过滤）"
        toolBarRender={<Button type="primary" size="small">+ 新增</Button>}
        filterFields={filterFields}
        pageSize={8}
        striped
      />
    </View>
  );
}

/** 异步模式：request 回调模拟服务端（300ms 延迟 + 服务端过滤分页） */
function AsyncDemo(): React.ReactElement {
  const { token } = useToken();
  const [rows, setRows] = React.useState<Emp[]>([]);
  const [total, setTotal] = React.useState(0);
  const [loading, setLoading] = React.useState(false);

  const request = (params: ProTableRequestParams): void => {
    setLoading(true);
    setTimeout(() => {
      let data = ALL;
      const kw = params.filters.name;
      const dept = params.filters.dept;
      const city = params.filters.city;
      if (kw) data = data.filter((r) => r.name.includes(kw));
      if (dept) data = data.filter((r) => r.dept === dept);
      if (city) data = data.filter((r) => r.city === city);
      const start = (params.page - 1) * params.pageSize;
      setRows(data.slice(start, start + params.pageSize));
      setTotal(data.length);
      setLoading(false);
    }, 300);
  };

  return (
    <View style={{ gap: token.marginXS }}>
      <Text style={{ fontSize: token.fontSizeSM, color: token.colorTextTertiary }}>
        每次查询/翻页触发 request（模拟 300ms 网络），数据与 total 由业务侧回填 —— 表格本身只当展示层
      </Text>
      <ProTable<Emp>
        columns={columns}
        dataSource={rows}
        rowKey={(r) => r.id}
        request={request}
        total={total}
        loading={loading}
        headerTitle="员工列表（异步 request）"
        filterFields={filterFields}
        pageSize={8}
      />
    </View>
  );
}

const DEMOS: DemoItem[] = [
  {
    name: '本地过滤',
    desc: '列上 search:true 自动生成搜索项；查询提交草稿过滤，重置清空回第一页',
    node: <LocalDemo />,
    code: [
      'import { ProTable } from "react-native-flux-desktop";',
      '',
      '// 本地模式：dataSource 全量给到，过滤 + 分页都在组件内',
      '// columns 中标 search:true 的列自动生成搜索项',
      'const columns = [',
      '  { title: \'姓名\', dataIndex: \'name\', key: \'name\', search: true, width: 160 },',
      '  { title: \'年龄\', dataIndex: \'age\', key: \'age\', width: 90, sorter: (a, b) => a.age - b.age },',
      '];',
      '<ProTable',
      '  columns={columns}',
      '  dataSource={ALL}',
      '  rowKey={(r) => r.id}',
      '  headerTitle="员工列表（本地过滤）"',
      '  pageSize={8}',
      '  striped',
      '/>',
    ].join('\n'),
  },
  {
    name: '异步 request',
    desc: 'request(params) 把页码/每页/已应用过滤器交给业务侧，配 loading 遮罩',
    node: <AsyncDemo />,
    code: [
      'import { ProTable } from "react-native-flux-desktop";',
      '',
      '// 异步模式：request 把 {page,pageSize,filters} 交业务侧，数据/total 回填',
      'const request = (params) => {',
      '  setLoading(true);',
      '  fetchRows(params).then((res) => { setRows(res.data); setTotal(res.total); setLoading(false); });',
      '};',
      '<ProTable columns={columns} dataSource={rows} request={request} total={total} loading={loading} pageSize={8} />',
    ].join('\n'),
  },
];

const API: ApiRow[] = [
  { name: 'columns', desc: 'TableColumn 超集；search: true 模糊匹配 / (v,val)=>boolean 自定义谓词', type: 'ProColumn[]', default: '–' },
  { name: 'dataSource / rowKey', desc: '行数据与主键（透传 Table）', type: 'T[] / (row,i)=>Key', default: '–' },
  { name: 'headerTitle / toolBarRender', desc: '工具栏左标题 / 右侧操作区', type: 'ReactNode', default: '–' },
  { name: 'filterFields', desc: '列之外的额外筛选（input / select）', type: 'ProFilterField[]', default: '–' },
  { name: 'search', desc: '传 false 整体关掉筛选区', type: 'false', default: '开启' },
  { name: 'request', desc: '异步模式：{page,pageSize,filters} 变化即回调（含首挂）', type: '(p)=>void', default: '–' },
  { name: 'total / loading', desc: '异步模式的总数与加载态（本地模式自动算）', type: 'number / boolean', default: '–' },
  { name: 'pageSize / pagination', desc: '每页条数 / 关闭分页', type: 'number / boolean', default: '10 / true' },
  { name: 'size / bordered / striped / onRowPress', desc: '透传给 Table 的展示配置', type: '–', default: '–' },
];

const TOKENS: TokenRow[] = [
  { name: 'marginXS / marginSM', desc: '筛选栏与区块间距' },
  { name: 'colorTextSecondary', desc: '筛选字段标签色' },
  { name: 'fontSizeLG + 600', desc: '工具栏标题字阶' },
];

export function ProTableDemo(): React.ReactElement {
  return <DemoPage demos={DEMOS} api={API} tokens={TOKENS} />;
}

export default ProTableDemo;
