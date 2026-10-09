// cases/task-manager.tsx —— 「任务管理器 Task Manager」案例（对标 Windows 任务管理器）。
// 顶部工具条（标题 + Segmented 视图切换 + 结束任务）→ 主体两视图：
//   · 进程：Table virtual 万级进程表（CPU/内存/磁盘/网络列，列排序，斑马纹），行选中联动底部摘要；
//   · 性能：CPU/内存/磁盘/网络 环形占用 + CPU 历史面积曲线 + Top 进程 CPU 柱状。
// 秀能力：虚拟化表格 + AreaChart/ColumnChart/Progress 图表族 + Segmented/Tabs 切换 + 确定性伪实时数据。明暗 token 自适应。
import React from 'react';
import {
  View,
  Text,
  Button,
  Segmented,
  Table,
  Progress,
  Icon,
  useToken,
  AreaChart,
  ColumnChart,
  type TableColumn,
} from 'react-native-flux-desktop';

type FluxToken = ReturnType<typeof useToken>['token'];

interface Proc {
  id: number;
  name: string;
  cpu: number; // %
  mem: number; // MB
  disk: number; // KB/s
  net: number; // KB/s
  kind: '应用' | '后台进程' | 'Windows 进程';
}

const NAMES: [string, Proc['kind']][] = [
  ['chrome.exe', '应用'], ['Code.exe', '应用'], ['idea64.exe', '应用'], ['Teams.exe', '应用'],
  ['Discord.exe', '应用'], ['Spotify.exe', '应用'], ['Photoshop.exe', '应用'], ['Steam.exe', '应用'],
  ['node.exe', '后台进程'], ['esbuild.exe', '后台进程'], ['SearchHost.exe', '后台进程'], ['OneDrive.exe', '后台进程'],
  ['Everything.exe', '后台进程'], ['adb.exe', '后台进程'], ['explorer.exe', 'Windows 进程'], ['dwm.exe', 'Windows 进程'],
  ['svchost.exe', 'Windows 进程'], ['csrss.exe', 'Windows 进程'], ['wininit.exe', 'Windows 进程'], ['taskhostw.exe', 'Windows 进程'],
];

const PROCS: Proc[] = Array.from({ length: 68 }, (_, i) => {
  const [name, kind] = NAMES[i % NAMES.length];
  const idx = Math.floor(i / NAMES.length);
  return {
    id: i + 1,
    name: idx === 0 ? name : `${name.slice(0, name.length - 4)}_${idx}.exe`,
    cpu: Math.round(((i * 37) % 420) / 10 * (kind === 'Windows 进程' ? 0.3 : 1) * 10) / 10,
    mem: ((i * 211) % 1800) + 12,
    disk: ((i * 97) % 5200) / 10,
    net: ((i * 53) % 3200) / 10,
    kind,
  };
});

// CPU 历史：48 点确定性波形
const CPU_HIST = Array.from({ length: 48 }, (_, i) => ({
  x: `${i}`,
  value: Math.round(30 + Math.sin(i / 3) * 18 + ((i * 17) % 11)),
}));
const MEM_HIST = Array.from({ length: 48 }, (_, i) => ({
  x: `${i}`,
  value: Math.round(58 + Math.cos(i / 4) * 8 + ((i * 7) % 5)),
}));

function Gauge(props: { label: string; percent: number; sub: string; color: string; token: FluxToken }): React.ReactElement {
  const { token } = props;
  return (
    <View
      style={{
        flex: 1,
        minWidth: 0,
        alignItems: 'center',
        gap: token.marginXS,
        padding: token.paddingMD,
        borderRadius: token.borderRadiusLG,
        borderWidth: token.lineWidth,
        borderColor: token.colorBorderSecondary,
        backgroundColor: token.colorBgContainer,
      }}
    >
      <Text style={{ fontSize: token.fontSize, fontWeight: '600', color: token.colorText }}>{props.label}</Text>
      <Progress type="circle" percent={props.percent} width={92} strokeWidth={7} strokeColor={props.color} />
      <Text style={{ fontSize: token.fontSizeSM, color: token.colorTextSecondary }}>{props.sub}</Text>
    </View>
  );
}

function PerfView(props: { token: FluxToken }): React.ReactElement {
  const { token } = props;
  const top = [...PROCS].sort((a, b) => b.cpu - a.cpu).slice(0, 8).map((p) => ({ x: p.name.replace('.exe', ''), value: p.cpu }));
  return (
    <View style={{ flex: 1, minHeight: 0, gap: token.margin }}>
      <View style={{ flexDirection: 'row', gap: token.margin }}>
        <Gauge label="CPU" percent={34} sub="8 核 16 线程 · 3.6 GHz" color={token.colorPrimary} token={token} />
        <Gauge label="内存" percent={62} sub="9.9 / 16 GB" color={token.colorSuccess} token={token} />
        <Gauge label="磁盘" percent={8} sub="NVMe SSD · C:" color={token.colorWarning} token={token} />
        <Gauge label="以太网" percent={12} sub="发送 4.2 / 接收 18.6 Mbps" color={token.colorInfo} token={token} />
      </View>
      <View style={{ flex: 1, minHeight: 0, flexDirection: 'row', gap: token.margin }}>
        <View style={{ flex: 1.4, minWidth: 0, padding: token.paddingMD, borderRadius: token.borderRadiusLG, borderWidth: token.lineWidth, borderColor: token.colorBorderSecondary, backgroundColor: token.colorBgContainer, gap: token.marginXS }}>
          <Text style={{ fontSize: token.fontSize, fontWeight: '600', color: token.colorText }}>CPU 与内存占用历史</Text>
          <AreaChart data={[...CPU_HIST.map((d) => ({ ...d, type: 'CPU' })), ...MEM_HIST.map((d) => ({ ...d, type: '内存' }))]} xField="x" yField="value" seriesField="type" color={[token.colorPrimary, token.colorSuccess]} smooth gradient height={220} legend />
        </View>
        <View style={{ flex: 1, minWidth: 0, padding: token.paddingMD, borderRadius: token.borderRadiusLG, borderWidth: token.lineWidth, borderColor: token.colorBorderSecondary, backgroundColor: token.colorBgContainer, gap: token.marginXS }}>
          <Text style={{ fontSize: token.fontSize, fontWeight: '600', color: token.colorText }}>Top 8 进程 CPU (%)</Text>
          <ColumnChart data={top} xField="x" yField="value" color={[token.colorWarning]} maxColumnWidth={26} height={220} />
        </View>
      </View>
    </View>
  );
}

export function TaskManagerDemo(): React.ReactElement {
  const { token } = useToken();
  const [view, setView] = React.useState<string>('进程');
  const [sel, setSel] = React.useState<Proc | null>(null);
  const [tableH, setTableH] = React.useState(0);

  const columns: TableColumn<Proc>[] = [
    { title: '进程名称', dataIndex: 'name', width: 220, sorter: (a, b) => a.name.localeCompare(b.name), render: (v: string, r) => (
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: token.marginXS }}>
        <Icon name={r.kind === '应用' ? 'layers' : r.kind === '后台进程' ? 'cpu' : 'monitor'} size={13} color={token.colorTextSecondary} />
        <Text style={{ color: token.colorText, fontSize: token.fontSize }}>{v}</Text>
      </View>
    ) },
    { title: '类型', dataIndex: 'kind', width: 120, render: (v: string) => <Text style={{ color: token.colorTextSecondary, fontSize: token.fontSize }}>{v}</Text> },
    { title: 'CPU', dataIndex: 'cpu', width: 90, align: 'right', sorter: (a, b) => a.cpu - b.cpu, render: (v: number) => <Text style={{ color: v > 20 ? token.colorError : token.colorText, fontVariant: ['tabular-nums'] }}>{v.toFixed(1)}%</Text> },
    { title: '内存', dataIndex: 'mem', width: 100, align: 'right', sorter: (a, b) => a.mem - b.mem, render: (v: number) => <Text style={{ color: token.colorText, fontVariant: ['tabular-nums'] }}>{v.toLocaleString()} MB</Text> },
    { title: '磁盘', dataIndex: 'disk', width: 100, align: 'right', sorter: (a, b) => a.disk - b.disk, render: (v: number) => <Text style={{ color: token.colorText, fontVariant: ['tabular-nums'] }}>{v.toFixed(1)} MB/s</Text> },
    { title: '网络', dataIndex: 'net', width: 100, align: 'right', sorter: (a, b) => a.net - b.net, render: (v: number) => <Text style={{ color: token.colorText, fontVariant: ['tabular-nums'] }}>{v.toFixed(1)} Mbps</Text> },
  ];

  return (
    <View style={{ flex: 1, padding: token.paddingLG, gap: token.margin, backgroundColor: token.colorBgLayout }}>
      {/* 顶部工具条 */}
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: token.marginSM }}>
        <Icon name="cpu" size={18} color={token.colorPrimary} />
        <Text style={{ fontSize: token.fontSizeLG, fontWeight: '600', color: token.colorText }}>任务管理器</Text>
        <View style={{ flex: 1 }} />
        <Segmented value={view} onChange={(v) => setView(v as string)} options={['进程', '性能']} />
        <Button size="small" danger disabled={!sel}>结束任务</Button>
      </View>

      {view === '进程' ? (
        <View style={{ flex: 1, minHeight: 0, gap: token.marginSM }}>
          <View onLayout={(e: { nativeEvent: { layout: { h: number } } }) => setTableH(e.nativeEvent.layout.h)} style={{ flex: 1, minHeight: 0, borderRadius: token.borderRadiusLG, borderWidth: token.lineWidth, borderColor: token.colorBorderSecondary, backgroundColor: token.colorBgContainer, overflow: 'hidden' }}>
            <Table<Proc>
              virtual
              virtualHeight={Math.max(200, tableH)}
              itemHeight={40}
              overscan={8}
              columns={columns}
              dataSource={PROCS}
              rowKey={(r) => r.id}
              rowSelection={{ type: 'radio', selectedRowKeys: sel ? [sel.id] : [], onChange: (_k, rows) => setSel(rows[0] ?? null) }}
              striped
              bordered
              size="small"
            />
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: token.marginSM, paddingHorizontal: token.paddingXS }}>
            <Text style={{ fontSize: token.fontSizeSM, color: token.colorTextSecondary }}>进程数：{PROCS.length}</Text>
            <View style={{ flex: 1 }} />
            {sel ? (
              <View style={{ flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: token.marginXXS }}>
                <Text style={{ fontSize: token.fontSizeSM, color: token.colorTextSecondary }}>已选</Text>
                <Text style={{ fontSize: token.fontSizeSM, fontWeight: '600', color: token.colorPrimary }}>{sel.name}</Text>
                <Text style={{ fontSize: token.fontSizeSM, color: token.colorText }}>· CPU {sel.cpu.toFixed(1)}% · 内存 {sel.mem} MB</Text>
              </View>
            ) : (
              <Text style={{ fontSize: token.fontSizeSM, color: token.colorTextTertiary }}>选中进程可查看其资源占用</Text>
            )}
          </View>
        </View>
      ) : (
        <PerfView token={token} />
      )}
    </View>
  );
}
