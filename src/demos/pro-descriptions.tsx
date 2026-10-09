// PRO-DESCRIPTIONS：schema 驱动详情。DemoPage 多段式：内置 valueType（copy/badge/link）/ request 异步骨架。
import React from 'react';
import { Button, View, useToken, type ProDescriptionColumn } from 'react-native-flux-desktop';
import { ProDescriptions } from 'react-native-flux-desktop-pro';
import { DemoPage, type DemoItem, type ApiRow, type TokenRow } from '../DemoPage';

interface Order {
  orderNo: string;
  buyer: string;
  status: string;
  channel: string;
  amount: string;
  phone: string;
  createdAt: string;
  remark: string;
}

const ORDER: Order = {
  orderNo: 'SO-20260925-0041',
  buyer: '李小明',
  status: '已发货',
  channel: '小程序',
  amount: '¥1,299.00',
  phone: '138****6688',
  createdAt: '2026-09-25 14:32',
  remark: '工作日送达',
};

const STATUS_DOT: Record<string, string> = { 已发货: 'processing', 已完成: 'success', 待付款: 'warning', 已取消: 'error' };

const columns: ProDescriptionColumn<Order>[] = [
  { label: '订单号', dataIndex: 'orderNo', valueType: 'copy' },
  { label: '买家', dataIndex: 'buyer' },
  { label: '状态', dataIndex: 'status', valueType: 'badge', badgeColor: STATUS_DOT },
  { label: '渠道', dataIndex: 'channel' },
  { label: '手机号', dataIndex: 'phone', valueType: 'copy' },
  { label: '下单时间', dataIndex: 'createdAt', valueType: 'date' },
  { label: '金额', dataIndex: 'amount' },
  { label: '备注', dataIndex: 'remark', valueType: 'link' },
];

const DEMOS: DemoItem[] = [
  {
    name: 'schema + 内置 valueType',
    desc: 'columns 声明即渲染：copy 点击写剪贴板（试试点「复制」）、badge 语义点、link 主色可点',
    node: <ProDescriptions title="订单详情" columns={columns} data={ORDER} column={1} bordered />,
    code: [
      'import { ProDescriptions } from "react-native-flux-desktop";',
      '',
      '// columns 声明即渲染；valueType 控制单格行为',
      'const columns = [',
      '  { label: \'订单号\', dataIndex: \'orderNo\', valueType: \'copy\' },',
      '  { label: \'状态\', dataIndex: \'status\', valueType: \'badge\', badgeColor: { \'已发货\': \'processing\' } },',
      '  { label: \'备注\', dataIndex: \'remark\', valueType: \'link\' },',
      '];',
      '<ProDescriptions title="订单详情" columns={columns} data={ORDER} column={1} bordered />',
    ].join('\n'),
  },
  {
    name: 'request 异步加载',
    desc: '不传 data 改传 request()：挂载即拉、期间逐格骨架；「重新加载」换 reloadKey 重走一遍',
    node: <AsyncDescDemo />,
    code: [
      'import { ProDescriptions } from "react-native-flux-desktop";',
      '',
      '// 不传 data 改传 request()：挂载即拉、期间骨架；reloadKey 变更重拉',
      'const request = () => fetchOrder().then((r) => r.data);',
      '<ProDescriptions title="订单详情（异步）" columns={columns} request={request} reloadKey={key} column={1} />',
    ].join('\n'),
  },
];

function AsyncDescDemo(): React.ReactElement {
  const { token } = useToken();
  const [key, setKey] = React.useState(0);
  const request = React.useCallback(
    () =>
      new Promise<Order>((resolve) => {
        setTimeout(() => resolve({ ...ORDER, orderNo: `SO-RELOAD-${key}`, status: key > 0 ? '已完成' : '已发货' }), 900);
      }),
    [key],
  );
  return (
    <View style={{ gap: token.marginSM }}>
      <Button size="small" onPress={() => setKey((k) => k + 1)}>
        重新加载（reloadKey+1）
      </Button>
      <ProDescriptions title="订单详情（异步）" columns={columns} request={request} reloadKey={key} column={1} />
    </View>
  );
}

const API: ApiRow[] = [
  { name: 'columns', desc: 'schema：{label, dataIndex, span, valueType, badgeColor, render}', type: 'ProDescriptionColumn[]', default: '–' },
  { name: 'valueType', desc: "text | copy（写剪贴板+回执）| link | badge（语义点）| date", type: 'string', default: "'text'" },
  { name: 'badgeColor', desc: 'badge 点色：语义名映射表 / 函数 / 直接色值', type: 'Record | fn | string', default: '–' },
  { name: 'data', desc: '受控数据；传了就不再走 request', type: 'T', default: '–' },
  { name: 'request / reloadKey', desc: '异步加载 Promise 与重拉触发键', type: '()=>Promise<T> / Key', default: '–' },
  { name: 'column / bordered / layout / title / extra', desc: '透传 Descriptions 的布局配置', type: '–', default: '2 / false / horizontal' },
];

const TOKENS: TokenRow[] = [
  { name: 'colorSuccess / colorError / colorWarning / colorPrimary', desc: 'badge 语义点四色' },
  { name: 'colorTextTertiary', desc: '「复制」提示字色' },
  { name: 'marginXXS', desc: '点与文字间隙' },
];

export function ProDescriptionsDemo(): React.ReactElement {
  return <DemoPage demos={DEMOS} api={API} tokens={TOKENS} />;
}

export default ProDescriptionsDemo;
