// cases/db-mysql.tsx —— 「本地数据库查询 MySQL (Sequelize)」整合案例。
// 用 sequelize + mysql2 连本机 MySQL（默认 127.0.0.1:3306 root），跑真实 SQL 查询并把结果铺成表格。
// 同时作为打包回归用例：sequelize/mysql2 是纯 JS 依赖，打包时由 esbuild 内联进 app.cjs（不命中第三方原生通道），
// 用来验证「新增真实 npm 依赖 → 打包 → 打包环境里仍能 require 到并联网查询」这条主链路没被改坏。
// 依赖缺失/连不上均优雅降级：仅提示错误，不崩整窗。
import React from 'react';
import {
  View,
  Text,
  Pressable,
  Input,
  InputNumber,
  TextArea,
  Button,
  Tag,
  Icon,
  Table,
  ScrollView,
  useToken,
  type TableColumn,
} from 'react-native-flux-desktop';

type AnyRow = Record<string, any>;
type Status = 'idle' | 'connecting' | 'ok' | 'error';

interface ConnCfg {
  host: string;
  port: number;
  user: string;
  password: string;
  database: string;
}

const DEFAULT_CFG: ConnCfg = { host: '127.0.0.1', port: 3306, user: 'root', password: '', database: 'information_schema' };

const SIDEBAR_W = 288;

// 懒加载：缺失时组件内优雅降级（与 live.tsx 懒 require node-pty 同款思路）
function loadSeq(): any {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    return require('sequelize');
  } catch {
    return null;
  }
}

// 把单元格值安全转字符串（Date/Buffer/null/对象）
function fmtCell(v: any): string {
  if (v === null || v === undefined) return 'NULL';
  if (v instanceof Date) return v.toLocaleString();
  if (ArrayBuffer.isView(v)) return '<binary ' + (v as Uint8Array).byteLength + 'B>';
  if (typeof v === 'object') {
    try { return JSON.stringify(v); } catch { return String(v); }
  }
  return String(v);
}

// 字段包装（标签 + 控件）。必须定义在组件外：若内联在 render 里，每次 setState 重渲染都会产生新的
// Field 函数类型 → React 认作不同组件 → 卸载重挂载整棵子树 → 内部 Input 被重建 → 打一个字符就丢焦。
function Field(p: { label: string; children: React.ReactNode }): React.ReactElement {
  const { token } = useToken();
  return (
    <View style={{ marginBottom: token.marginSM }}>
      <Text style={{ fontSize: token.fontSizeSM, color: token.colorTextSecondary, marginBottom: 4 }}>{p.label}</Text>
      {p.children}
    </View>
  );
}

export function DbMysqlDemo(): React.ReactElement {
  const { token } = useToken();
  const seq = React.useMemo(loadSeq, []);

  const [cfg, setCfg] = React.useState<ConnCfg>(DEFAULT_CFG);
  const [status, setStatus] = React.useState<Status>('idle');
  const [statusMsg, setStatusMsg] = React.useState<string>('未连接');
  const [cli, setCli] = React.useState<any>(null);
  const [sql, setSql] = React.useState<string>('SELECT TABLE_SCHEMA, TABLE_NAME, TABLE_ROWS\nFROM information_schema.TABLES\nORDER BY TABLE_ROWS DESC\nLIMIT 20');
  const [cols, setCols] = React.useState<TableColumn<AnyRow>[]>([]);
  const [rows, setRows] = React.useState<AnyRow[]>([]);
  const [querying, setQuerying] = React.useState<boolean>(false);
  const [queryMsg, setQueryMsg] = React.useState<string>('');
  const [elapsed, setElapsed] = React.useState<number>(0);
  const seqRef = React.useRef<any>(null);
  const [tableH, setTableH] = React.useState<number>(0);

  const patch = (p: Partial<ConnCfg>): void => setCfg((c) => ({ ...c, ...p }));

  const connect = async (): Promise<void> => {
    if (!seq) { setStatus('error'); setStatusMsg('sequelize 未安装（打包/依赖缺失）'); return; }
    setStatus('connecting'); setStatusMsg('连接中…');
    setCols([]); setRows([]); setQueryMsg('');
    try {
      if (seqRef.current) { try { await seqRef.current.close(); } catch { /* ignore */ } seqRef.current = null; }
      const { Sequelize } = seq;
      const inst = new Sequelize({
        dialect: 'mysql',
        host: cfg.host,
        port: Number(cfg.port) || 3306,
        username: cfg.user,
        password: cfg.password,
        database: cfg.database || undefined,
        logging: false,
        pool: { max: 1, min: 0 },
      });
      await inst.authenticate();
      seqRef.current = inst;
      setCli(inst);
      setStatus('ok');
      setStatusMsg(`已连接 ${cfg.user}@${cfg.host}:${cfg.port}/${cfg.database || '-'}`);
    } catch (e: any) {
      setStatus('error');
      setStatusMsg('连接失败：' + (e && e.message ? e.message : String(e)));
      setCli(null); seqRef.current = null;
    }
  };

  const runQuery = async (text?: string): Promise<void> => {
    const inst = seqRef.current;
    const q = (text ?? sql).trim();
    if (!inst) { setQueryMsg('请先连接数据库'); return; }
    if (!q) { setQueryMsg('SQL 为空'); return; }
    if (text != null) setSql(text);
    setQuerying(true); setQueryMsg('执行中…');
    const t0 = Date.now();
    try {
      const result = await inst.query(q, { raw: true });
      const list: AnyRow[] = Array.isArray(result) ? (result.length === 2 && !Array.isArray(result[0]) ? result : result[0]) : result;
      const data: AnyRow[] = Array.isArray(list) ? list : [];
      const keys = data.length ? Object.keys(data[0]) : [];
      const nextCols: TableColumn<AnyRow>[] = keys.map((k) => ({
        title: k,
        dataIndex: k,
        width: 180,
        // 单元格必须单行省略：cell 的 View 固定 width 但无 overflow 裁剪，长 URL（无空格不可断词）会横向
        // 溢到邻列、多行 description 换行超过 itemHeight 会纵向叠字。numberOfLines={1} 让 Text 按列宽截断加省略号，
        // 并把值里的换行/连续空白压成单空格确保真正单行。
        render: (v: any) => (
          <Text numberOfLines={1} style={{ fontSize: token.fontSizeSM, color: token.colorText, maxWidth: 180 }}>
            {fmtCell(v).replace(/\s+/g, ' ')}
          </Text>
        ),
      }));
      const capped = data.slice(0, 5000);
      setCols(nextCols);
      setRows(capped);
      setElapsed(Date.now() - t0);
      setQueryMsg(`返回 ${data.length} 行${data.length > capped.length ? `（仅展示前 ${capped.length}）` : ''}`);
    } catch (e: any) {
      setCols([]); setRows([]);
      setQueryMsg('查询失败：' + (e && e.message ? e.message : String(e)));
    } finally {
      setQuerying(false);
    }
  };

  const quick: { label: string; sql: string }[] = [
    { label: 'SHOW DATABASES', sql: 'SHOW DATABASES' },
    { label: '当前版本/时间', sql: 'SELECT VERSION() AS version, NOW() AS now, CURRENT_USER() AS user' },
    { label: '所有表(前30)', sql: 'SELECT TABLE_SCHEMA, TABLE_NAME, TABLE_ROWS FROM information_schema.TABLES LIMIT 30' },
    { label: '用户权限表', sql: 'SELECT User, Host FROM mysql.user LIMIT 30' },
  ];

  const statusTag =
    status === 'ok' ? { c: 'success', t: '已连接' } :
    status === 'connecting' ? { c: 'processing', t: '连接中' } :
    status === 'error' ? { c: 'error', t: '失败' } :
    { c: 'default', t: '未连接' };

  return (
    <View style={{ flex: 1, flexDirection: 'row', backgroundColor: token.colorBgLayout }}>
      {/* 左：连接面板 */}
      <View style={{ width: SIDEBAR_W, backgroundColor: token.colorBgContainer, borderRightWidth: 1, borderRightColor: token.colorBorderSecondary, padding: token.padding, gap: 2 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: token.marginMD }}>
          <Icon name="database2" size={16} color={token.colorPrimary} />
          <Text style={{ fontSize: token.fontSizeLG, fontWeight: '600', color: token.colorText }}>MySQL 连接</Text>
        </View>

        <Field label="主机 Host">
          <Input value={cfg.host} onChange={(v) => patch({ host: v })} style={{ width: '100%' }} placeholder="127.0.0.1" />
        </Field>
        <Field label="端口 Port">
          <InputNumber value={cfg.port} min={1} max={65535} onChange={(v) => patch({ port: Number(v) || 3306 })} style={{ width: 140 }} />
        </Field>
        <Field label="用户名 User">
          <Input value={cfg.user} onChange={(v) => patch({ user: v })} style={{ width: '100%' }} placeholder="root" />
        </Field>
        <Field label="密码 Password">
          <Input value={cfg.password} onChange={(v) => patch({ password: v })} style={{ width: '100%' }} placeholder="(留空)" />
        </Field>
        <Field label="数据库 Database">
          <Input value={cfg.database} onChange={(v) => patch({ database: v })} style={{ width: '100%' }} placeholder="information_schema" />
        </Field>

        <Button type="primary" onPress={() => { void connect(); }}>
          {status === 'connecting' ? '连接中…' : '连接 / Connect'}
        </Button>

        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: token.marginMD }}>
          <Tag color={statusTag.c}>{statusTag.t}</Tag>
        </View>
        <Text style={{ fontSize: token.fontSizeSM, color: status === 'error' ? token.colorError : token.colorTextSecondary, marginTop: 6 }}>
          {statusMsg}
        </Text>

        {!seq && (
          <Text style={{ fontSize: token.fontSizeSM, color: token.colorWarning, marginTop: token.marginMD }}>
            提示：未检测到 sequelize 依赖，本案例在开发/打包缺失时仅作占位。
          </Text>
        )}
      </View>

      {/* 右：SQL 编辑 + 结果 */}
      <View style={{ flex: 1, minWidth: 0, padding: token.paddingLG, gap: token.marginSM }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: token.marginSM }}>
          <Text style={{ fontSize: token.fontSizeLG, fontWeight: '600', color: token.colorText }}>SQL 查询</Text>
          <View style={{ flex: 1 }} />
          <Button type="primary" onPress={() => { void runQuery(); }}>
            {querying ? '执行中…' : '执行 ▶'}
          </Button>
        </View>

        <TextArea value={sql} onChange={setSql} rows={5} style={{ width: '100%' }} placeholder="输入 SQL，例如 SELECT * FROM xxx LIMIT 10" />

        {/* 快选查询 */}
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: token.marginXS }}>
          {quick.map((q) => (
            <Pressable
              key={q.label}
              onPress={() => { void runQuery(q.sql); }}
              style={{ paddingHorizontal: 10, paddingVertical: 5, borderRadius: token.borderRadiusSM, borderWidth: 1, borderColor: token.colorBorder, backgroundColor: token.colorFillQuaternary, cursor: 'pointer' }}
            >
              <Text style={{ fontSize: token.fontSizeSM, color: token.colorTextSecondary }}>{q.label}</Text>
            </Pressable>
          ))}
        </View>

        <View style={{ flexDirection: 'row', alignItems: 'center', gap: token.marginSM }}>
          <Text style={{ fontSize: token.fontSizeSM, color: token.colorTextSecondary }}>{queryMsg || '尚未执行查询'}</Text>
          {elapsed > 0 && <Tag color="processing">{elapsed} ms</Tag>}
        </View>

        {/* 结果表：必须虚拟化（Table virtual）——非虚拟化一次渲染数百行会把自绘节点撑爆、溢出成乱码；
            容器 onLayout 实测高喂 virtualHeight，overflow 裁剪，底色走 token.colorBgContainer 随主题 */}
        <View
          onLayout={(e: { nativeEvent: { layout: { h: number } } }) => setTableH(e.nativeEvent.layout.h)}
          style={{ flex: 1, minHeight: 0, borderRadius: token.borderRadiusLG, borderWidth: 1, borderColor: token.colorBorderSecondary, backgroundColor: token.colorBgContainer, overflow: 'hidden' }}
        >
          {cols.length ? (
            <Table<AnyRow>
              virtual
              virtualHeight={Math.max(200, tableH)}
              itemHeight={34}
              overscan={8}
              columns={cols}
              dataSource={rows}
              rowKey={(_r, i) => String(i)}
              size="small"
              bordered
              striped
            />
          ) : (
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
              <Icon name="database2" size={28} color={token.colorTextQuaternary} />
              <Text style={{ fontSize: token.fontSize, color: token.colorTextTertiary, marginTop: token.marginSM }}>
                {status === 'ok' ? '连接后执行查询，结果显示在此' : '先连接数据库，再执行查询'}
              </Text>
            </View>
          )}
        </View>
      </View>
    </View>
  );
}
