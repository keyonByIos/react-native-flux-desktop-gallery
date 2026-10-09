// cases/admin-crud.tsx —— 「管理后台 · 用户管理 Admin CRUD」案例。
// 版式：顶部面包屑 + KPI 概览条 → 工具栏（搜索 / 状态筛选 / 部门筛选 / 新增 / 批量操作）→ 主体左虚拟化表格 + 右详情主从面板。
// 秀能力：Table virtual（万行不卡）+ rowSelection 批量 + 列排序 + 受控筛选联动 + Tag 语义状态 + Descriptions 详情 + Pagination。
// 全本地确定性数据（无随机、重渲染稳定），明暗 token 自适应。
import React from 'react';
import {
  View,
  Text,
  Input,
  Select,
  Button,
  Tag,
  Table,
  Descriptions,
  Icon,
  useToken,
  type TableColumn,
  type TableRowSelection,
  type SelectOption,
} from 'react-native-flux-desktop';

type FluxToken = ReturnType<typeof useToken>['token'];

// —— 确定性数据源（200 行）——
const DEPTS = ['研发部', '市场部', '销售部', '人事部', '财务部', '运营部', '设计部'];
const ROLES = ['超级管理员', '编辑', '访客', '审计', '运维'];
const SURNAME = ['张', '李', '王', '赵', '刘', '陈', '杨', '黄', '周', '吴', '徐', '孙'];
const GIVEN = ['伟', '芳', '娜', '敏', '静', '磊', '洋', '勇', '艳', '杰', '涛', '明', '超', '秀英'];
type StatusKey = 'active' | 'leave' | 'disabled' | 'pending';
const STATUS: Record<StatusKey, { text: string; preset: string }> = {
  active: { text: '在职', preset: 'success' },
  leave: { text: '休假', preset: 'warning' },
  disabled: { text: '禁用', preset: 'error' },
  pending: { text: '待入职', preset: 'processing' },
};
const STATUS_KEYS: StatusKey[] = ['active', 'leave', 'disabled', 'pending'];

interface User {
  id: number;
  name: string;
  account: string;
  role: string;
  dept: string;
  status: StatusKey;
  login: string;
  storage: number;
}

const USERS: User[] = Array.from({ length: 200 }, (_, i) => {
  const n = i + 1;
  const name = SURNAME[i % SURNAME.length] + GIVEN[(i * 3) % GIVEN.length];
  const st = STATUS_KEYS[(i * 7 + (i % 3)) % STATUS_KEYS.length];
  return {
    id: n,
    name,
    account: `user_${String(n).padStart(4, '0')}`,
    role: ROLES[(i * 2) % ROLES.length],
    dept: DEPTS[i % DEPTS.length],
    status: st,
    login: `2026-09-${String((i % 28) + 1).padStart(2, '0')} ${String((i * 5) % 24).padStart(2, '0')}:${String((i * 11) % 60).padStart(2, '0')}`,
    storage: ((i * 137) % 900) + 24,
  };
});

const STATUS_OPTIONS: SelectOption[] = [
  { label: '在职', value: 'active' },
  { label: '休假', value: 'leave' },
  { label: '禁用', value: 'disabled' },
  { label: '待入职', value: 'pending' },
];
const DEPT_OPTIONS: SelectOption[] = DEPTS.map((d) => ({ label: d, value: d }));

function StatTile(props: { label: string; value: number; color: string; token: FluxToken }): React.ReactElement {
  const { token } = props;
  return (
    <View
      style={{
        flex: 1,
        minWidth: 0,
        flexDirection: 'row',
        alignItems: 'center',
        gap: token.marginSM,
        paddingHorizontal: token.paddingMD,
        paddingVertical: token.paddingSM,
        borderRadius: token.borderRadiusLG,
        borderWidth: token.lineWidth,
        borderColor: token.colorBorderSecondary,
        backgroundColor: token.colorBgContainer,
      }}
    >
      <View style={{ width: 34, height: 34, borderRadius: token.borderRadius, alignItems: 'center', justifyContent: 'center', backgroundColor: props.color + '22' }}>
        <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: props.color }} />
      </View>
      <View style={{ flex: 1, minWidth: 0 }}>
        <Text style={{ fontSize: 20, fontWeight: '700', color: token.colorText }}>{props.value.toLocaleString()}</Text>
        <Text style={{ fontSize: 12, color: token.colorTextSecondary }}>{props.label}</Text>
      </View>
    </View>
  );
}

function DetailPanel(props: { u: User | null; token: FluxToken }): React.ReactElement {
  const { token } = props;
  const { colorText, colorTextSecondary, colorBgContainer, colorBorderSecondary } = token;
  return (
    <View
      style={{
        width: 320,
        flexShrink: 0,
        borderRadius: token.borderRadiusLG,
        borderWidth: token.lineWidth,
        borderColor: colorBorderSecondary,
        backgroundColor: colorBgContainer,
        padding: token.paddingMD,
        gap: token.marginSM,
      }}
    >
      <Text style={{ fontSize: token.fontSizeLG, fontWeight: '600', color: colorText }}>用户详情</Text>
      {!props.u ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: token.marginXS }}>
          <Icon name="user" size={40} color={token.colorTextQuaternary} />
          <Text style={{ fontSize: token.fontSizeSM, color: colorTextSecondary }}>勾选左侧任一用户查看详情</Text>
        </View>
      ) : (
        <View style={{ gap: token.marginSM }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: token.marginSM }}>
            <View style={{ width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center', backgroundColor: token.colorPrimaryBg }}>
              <Text style={{ fontSize: 20, fontWeight: '600', color: token.colorPrimary }}>{props.u.name.slice(0, 1)}</Text>
            </View>
            <View style={{ gap: 2 }}>
              <Text style={{ fontSize: token.fontSizeLG, fontWeight: '600', color: colorText }}>{props.u.name}</Text>
              <Text style={{ fontSize: token.fontSizeSM, color: colorTextSecondary }}>@{props.u.account}</Text>
            </View>
          </View>
          <Descriptions
            column={1}
            size="small"
            items={[
              { key: 'role', label: '角色', children: props.u.role },
              { key: 'dept', label: '部门', children: props.u.dept },
              { key: 'status', label: '状态', children: <Tag color={STATUS[props.u.status].preset}>{STATUS[props.u.status].text}</Tag> },
              { key: 'login', label: '最近登录', children: props.u.login },
              { key: 'storage', label: '占用空间', children: `${props.u.storage} MB` },
            ]}
          />
          <View style={{ flexDirection: 'row', gap: token.marginXS, marginTop: token.marginXS }}>
            <Button type="primary" size="small" style={{ flex: 1 }}>编辑</Button>
            <Button size="small" style={{ flex: 1 }}>重置密码</Button>
          </View>
        </View>
      )}
    </View>
  );
}

export function AdminCrudDemo(): React.ReactElement {
  const { token } = useToken();
  const [kw, setKw] = React.useState('');
  const [status, setStatus] = React.useState<string | undefined>(undefined);
  const [dept, setDept] = React.useState<string | undefined>(undefined);
  const [keys, setKeys] = React.useState<React.Key[]>([]);
  const [tableH, setTableH] = React.useState(0);

  const filtered = React.useMemo(() => {
    const k = kw.trim();
    return USERS.filter((u) => {
      if (status && u.status !== status) return false;
      if (dept && u.dept !== dept) return false;
      if (k && !(u.name.includes(k) || u.account.includes(k))) return false;
      return true;
    });
  }, [kw, status, dept]);

  const focused = filtered.find((u) => u.id === keys[0]) ?? (keys.length ? null : filtered[0] ?? null);

  const columns: TableColumn<User>[] = [
    { title: 'ID', dataIndex: 'id', width: 64, render: (v: number) => <Text style={{ color: token.colorTextTertiary, fontSize: token.fontSize }}>#{v}</Text> },
    {
      title: '姓名',
      dataIndex: 'name',
      width: 110,
      sorter: (a, b) => a.name.localeCompare(b.name, 'zh'),
      render: (v: string) => <Text style={{ color: token.colorText, fontWeight: '500' }}>{v}</Text>,
    },
    { title: '账号', dataIndex: 'account', width: 140, render: (v: string) => <Text style={{ color: token.colorTextSecondary }}>{v}</Text> },
    { title: '角色', dataIndex: 'role', width: 120, render: (v: string) => <Text style={{ color: token.colorText }}>{v}</Text> },
    { title: '部门', dataIndex: 'dept', width: 100, render: (v: string) => <Text style={{ color: token.colorText }}>{v}</Text> },
    {
      title: '状态',
      dataIndex: 'status',
      width: 96,
      render: (v: StatusKey) => <Tag color={STATUS[v].preset}>{STATUS[v].text}</Tag>,
    },
    { title: '最近登录', dataIndex: 'login', render: (v: string) => <Text style={{ color: token.colorTextTertiary, fontSize: token.fontSizeSM }}>{v}</Text> },
  ];

  const rowSelection: TableRowSelection<User> = {
    type: 'checkbox',
    selectedRowKeys: keys,
    onChange: (k) => setKeys(k),
  };

  const counts = {
    active: USERS.filter((u) => u.status === 'active').length,
    leave: USERS.filter((u) => u.status === 'leave').length,
    disabled: USERS.filter((u) => u.status === 'disabled').length,
    pending: USERS.filter((u) => u.status === 'pending').length,
  };

  return (
    <View style={{ flex: 1, padding: token.paddingLG, gap: token.margin, backgroundColor: token.colorBgLayout }}>
      {/* 顶部标题 + 面包屑 */}
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: token.marginSM }}>
        <Icon name="database" size={18} color={token.colorPrimary} />
        <Text style={{ fontSize: token.fontSizeLG, fontWeight: '600', color: token.colorText }}>用户管理</Text>
        <Text style={{ fontSize: token.fontSizeSM, color: token.colorTextTertiary }}>系统设置 / 成员与权限</Text>
        <View style={{ flex: 1 }} />
        <Text style={{ fontSize: token.fontSizeSM, color: token.colorTextSecondary }}>共 {filtered.length} 条 / 全部 {USERS.length}</Text>
      </View>

      {/* KPI 概览条 */}
      <View style={{ flexDirection: 'row', gap: token.marginSM }}>
        <StatTile label="在职" value={counts.active} color={token.colorSuccess} token={token} />
        <StatTile label="休假" value={counts.leave} color={token.colorWarning} token={token} />
        <StatTile label="禁用" value={counts.disabled} color={token.colorError} token={token} />
        <StatTile label="待入职" value={counts.pending} color={token.colorInfo} token={token} />
      </View>

      {/* 工具栏 */}
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: token.marginSM }}>
        <Input value={kw} onChange={setKw} allowClear placeholder="搜索姓名 / 账号" style={{ width: 220 }} prefix={<Icon name="search" size={14} color={token.colorTextTertiary} />} />
        <Select options={STATUS_OPTIONS} value={status} onChange={(v) => setStatus(v as string | undefined)} allowClear placeholder="状态" style={{ width: 130 }} />
        <Select options={DEPT_OPTIONS} value={dept} onChange={(v) => setDept(v as string | undefined)} allowClear placeholder="部门" style={{ width: 140 }} />
        <View style={{ flex: 1 }} />
        {keys.length > 0 ? (
          <>
            <Text style={{ fontSize: token.fontSizeSM, color: token.colorTextSecondary }}>已选 {keys.length} 项</Text>
            <Button size="small" onPress={() => setKeys([])}>取消选择</Button>
            <Button size="small" danger>批量禁用</Button>
          </>
        ) : null}
        <Button type="primary" size="small">+ 新增用户</Button>
      </View>

      {/* 主体：左表格 + 右详情 */}
      <View style={{ flex: 1, minHeight: 0, flexDirection: 'row', gap: token.margin }}>
        <View onLayout={(e: { nativeEvent: { layout: { h: number } } }) => setTableH(e.nativeEvent.layout.h)} style={{ flex: 1, minWidth: 0, borderRadius: token.borderRadiusLG, borderWidth: token.lineWidth, borderColor: token.colorBorderSecondary, backgroundColor: token.colorBgContainer, overflow: 'hidden' }}>
          <Table<User>
            virtual
            virtualHeight={Math.max(200, tableH)}
            itemHeight={44}
            overscan={8}
            columns={columns}
            dataSource={filtered}
            rowKey={(r) => r.id}
            rowSelection={rowSelection}
            striped
            bordered
          />
        </View>
        <DetailPanel u={focused} token={token} />
      </View>
    </View>
  );
}
