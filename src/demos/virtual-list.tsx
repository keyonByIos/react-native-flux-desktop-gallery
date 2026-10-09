// 虚拟列表 VirtualList Demo：1 万行对照——开/关虚拟化，直观展示「每帧绘制节点数 O(总行)→O(可见行)」。
// 关闭时全量 dataSource.map（等价现 List，万行全进场景树）；开启时只渲染视口 ±overscan 行。
import React from 'react';
import { Segmented, View, Text, useToken, ScrollView, VirtualList, List, Table } from 'react-native-flux-desktop';
import { DemoPage, type DemoItem, type ApiRow, type TokenRow } from '../DemoPage';

const ROW_HEIGHT = 40;
const VIEWPORT_H = 480;
const TOTAL = 10000;

type VRow = { id: number; title: string; lines: number; height: number };
type Row = { id: number; name: string; tag: string };

// 确定性生成 1 万行（无随机，明暗/重渲染稳定）
const DATA: Row[] = Array.from({ length: TOTAL }, (_, i) => ({
  id: i + 1,
  name: `记录行 #${i + 1}`,
  tag: i % 3 === 0 ? '成功' : i % 3 === 1 ? '处理中' : '待办',
}));

// 变高数据集：每行 body 行数按 i%4 递增 → 行高不同；高度确定性算出供 getItemHeight 使用
const V_DATA: VRow[] = Array.from({ length: TOTAL }, (_, i) => {
  const lines = i % 4; // 0..3 → body 1..4 行
  return { id: i + 1, title: `事件 ${i + 1}`, lines, height: 24 + (lines + 1) * 18 + 16 };
});

/** 单行内容（虚拟化与全量共用） */
function RowView(props: { row: Row; index: number }): React.ReactElement {
  const { token } = useToken();
  const { row } = props;
  const tagColor =
    row.tag === '成功' ? token.colorSuccess : row.tag === '处理中' ? token.colorWarning : token.colorTextTertiary;
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        height: ROW_HEIGHT,
        paddingHorizontal: token.paddingSM,
        gap: token.marginSM,
        borderBottomWidth: 1,
        borderBottomColor: token.colorSplit,
        backgroundColor: props.index % 2 === 1 ? token.colorFillQuaternary : 'transparent',
      }}
    >
      <Text style={{ width: 64, fontSize: token.fontSize, color: token.colorTextTertiary }}>{row.id}</Text>
      <Text style={{ flex: 1, fontSize: token.fontSize, color: token.colorText }}>{row.name}</Text>
      <Text style={{ fontSize: token.fontSizeSM, color: tagColor }}>{row.tag}</Text>
    </View>
  );
}

/** 对照 demo：Segmented 切换 虚拟化 / 全量 */
function CompareDemo(): React.ReactElement {
  const { token } = useToken();
  // 默认虚拟化；FLUX_VLIST_MODE=full 仅供无头抓帧做「全量」对照量化（正常环境恒为 virtual）
  const [mode, setMode] = React.useState<'virtual' | 'full'>(
    process.env.FLUX_VLIST_MODE === 'full' ? 'full' : 'virtual',
  );

  return (
    <View style={{ gap: token.marginSM }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: token.marginSM }}>
        <Segmented
          value={mode}
          onChange={(v) => setMode(v as 'virtual' | 'full')}
          options={[
            { label: '虚拟化开启', value: 'virtual' },
            { label: '全量渲染（对照）', value: 'full' },
          ]}
        />
        <Text style={{ fontSize: token.fontSizeSM, color: token.colorTextTertiary }}>
          {mode === 'virtual'
            ? `VirtualList：每帧仅画 ≈ 可见行 + 2×overscan（约 ${Math.ceil(VIEWPORT_H / ROW_HEIGHT) + 12} 行）`
            : `全量：${TOTAL.toLocaleString()} 行全部进场景树`}
        </Text>
      </View>

      <View
        style={{
          height: VIEWPORT_H,
          borderWidth: 1,
          borderColor: token.colorBorderSecondary,
          borderRadius: token.borderRadiusLG,
          overflow: 'hidden',
        }}
      >
        {mode === 'virtual' ? (
          <VirtualList<Row>
            data={DATA}
            rowHeight={ROW_HEIGHT}
            height={VIEWPORT_H}
            overscan={6}
            renderItem={(row, index) => <RowView row={row} index={index} />}
          />
        ) : (
          <ScrollView style={{ flex: 1 }}>
            {DATA.map((row, index) => (
              <RowView key={index} row={row} index={index} />
            ))}
          </ScrollView>
        )}
      </View>
    </View>
  );
}

/** 变高行内容：标题 + 不定行摘要（行数 = lines+1，行高由数据显式给定） */
function VRowView(props: { row: VRow; index: number }): React.ReactElement {
  const { token } = useToken();
  const { row } = props;
  return (
    <View
      style={{
        paddingVertical: token.paddingXS,
        paddingHorizontal: token.paddingSM,
        borderBottomWidth: 1,
        borderBottomColor: token.colorSplit,
        backgroundColor: props.index % 2 === 1 ? token.colorFillQuaternary : 'transparent',
      }}
    >
      <Text style={{ fontSize: token.fontSize, fontWeight: '600', color: token.colorText }}>
        {row.id}. {row.title}
      </Text>
      {Array.from({ length: row.lines + 1 }, (_, k) => (
        <Text key={k} style={{ fontSize: token.fontSizeSM, color: token.colorTextSecondary, lineHeight: 18 }}>
          摘要 {k + 1} · 变高行按数据驱动行高窗口化，仅渲染视口 ±overscan 行
        </Text>
      ))}
    </View>
  );
}

/** 变高行 demo：不 clamp 行高，靠 onLayout 测量 + 累计偏移 + 二分定位窗口 */
function VariableDemo(): React.ReactElement {
  const { token } = useToken();
  return (
    <View
      style={{
        height: VIEWPORT_H,
        borderWidth: 1,
        borderColor: token.colorBorderSecondary,
        borderRadius: token.borderRadiusLG,
        overflow: 'hidden',
      }}
    >
      <VirtualList<VRow>
        data={V_DATA}
        rowHeight={80}
        height={VIEWPORT_H}
        variable
        getItemHeight={(i) => V_DATA[i].height}
        overscan={6}
        renderItem={(row, index) => <VRowView row={row} index={index} />}
      />
    </View>
  );
}

/** List virtual 模式：数据组件内建虚拟化，开启即 body 走 VirtualList（复用同一原语） */
function ListVirtualDemo(): React.ReactElement {
  const { token } = useToken();
  return (
    <List<Row>
      virtual
      virtualHeight={VIEWPORT_H}
      itemHeight={48}
      overscan={6}
      bordered
      dataSource={DATA}
      header={<Text style={{ fontSize: token.fontSize, fontWeight: '500', color: token.colorText }}>List virtual（万行）</Text>}
      renderItem={(row, index) => (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: token.marginSM }}>
          <Text style={{ width: 64, fontSize: token.fontSize, color: token.colorTextTertiary }}>{row.id}</Text>
          <Text style={{ flex: 1, fontSize: token.fontSize, color: token.colorText }}>{row.name}</Text>
          <Text
            style={{
              fontSize: token.fontSizeSM,
              color: row.tag === '成功' ? token.colorSuccess : row.tag === '处理中' ? token.colorWarning : token.colorTextTertiary,
            }}
          >
            {row.tag}
          </Text>
        </View>
      )}
    />
  );
}

/** Table virtual 模式：表头固定 + 表体走 VirtualList（行等高），万行表格不卡 */
function TableVirtualDemo(): React.ReactElement {
  const { token } = useToken();
  return (
    <Table<Row>
      virtual
      virtualHeight={VIEWPORT_H}
      itemHeight={44}
      overscan={6}
      striped
      bordered
      dataSource={DATA}
      columns={[
        { title: '序号', dataIndex: 'id', width: 88 },
        {
          title: '名称',
          dataIndex: 'name',
          render: (v) => <Text style={{ fontSize: token.fontSize, color: token.colorText }}>{String(v)}</Text>,
        },
        {
          title: '状态',
          dataIndex: 'tag',
          width: 120,
          render: (_v, row) => (
            <Text
              style={{
                fontSize: token.fontSizeSM,
                color: row.tag === '成功' ? token.colorSuccess : row.tag === '处理中' ? token.colorWarning : token.colorTextTertiary,
              }}
            >
              {row.tag}
            </Text>
          ),
        },
      ]}
    />
  );
}

const DEMOS: DemoItem[] = [
  {
    name: '万行虚拟化对照',
    desc: `共 ${TOTAL.toLocaleString()} 行、行高 ${ROW_HEIGHT}px、视口 ${VIEWPORT_H}px。切「全量渲染」可感整树重建/滚动明显变重；「虚拟化开启」每帧绘制节点数下降 2~3 个数量级。`,
    node: <CompareDemo />,
    code: [
      'import { VirtualList } from "react-native-flux-desktop";',
      '',
      'const DATA = Array.from({ length: 10000 }, (_, i) => ({ id: i + 1, ... }));',
      '',
      '<VirtualList',
      '  data={DATA}',
      '  rowHeight={40}',
      '  height={480}',
      '  overscan={6}',
      '  renderItem={(row, index) => <RowView row={row} index={index} />}',
      '/>',
    ].join('\n'),
  },
  {
    name: 'List virtual 模式（组件内建）',
    desc: '数据组件 List 内建虚拟化：virtual + itemHeight/virtualHeight 即可把 body 换成 VirtualList（同一原语），header/footer/分隔线/斑马与 loading 遮罩照常。',
    node: <ListVirtualDemo />,
    code: [
      '<List',
      '  virtual',
      '  virtualHeight={480}',
      '  itemHeight={48}',
      '  dataSource={DATA}',
      '  renderItem={(row, index) => <RowContent row={row} index={index} />}',
      '/>',
    ].join('\n'),
  },
  {
    name: 'Table virtual 模式（表体虚拟化）',
    desc: '数据组件 Table 内建虚拟化：virtual + itemHeight/virtualHeight → 表头固定、表体走 VirtualList（同一原语）；斑马纹/外框/列宽与全量一致，万行不卡。',
    node: <TableVirtualDemo />,
    code: [
      '<Table',
      '  virtual',
      '  virtualHeight={480}',
      '  itemHeight={44}',
      '  dataSource={DATA}',
      '  striped',
      '  bordered',
      "  columns={[{ title: '序号', dataIndex: 'id', width: 88 }, ...]}",
      '/>',
    ].join('\n'),
  },
  {
    name: '变高行（数据驱动行高）',
    desc: '行高不一：由 getItemHeight(i) 逐行给高，累计偏移数组 + 二分定位窗口；每行显式定高（本栈内容自适应文本列测高不可靠，故行高由数据给出）。',
    node: <VariableDemo />,
    code: [
      'const V_DATA = Array.from({ length: 10000 }, (_, i) => {',
      '  const lines = i % 4;',
      '  return { id: i + 1, title: `事件 ${i + 1}`, lines, height: 24 + (lines + 1) * 18 + 16 };',
      '});',
      '',
      '<VirtualList',
      '  data={V_DATA}',
      '  rowHeight={80}   // 变高模式下的预估高（兼作 getItemHeight 缺省回退）',
      '  height={480}',
      '  variable',
      '  getItemHeight={(i) => V_DATA[i].height}   // 逐行取高，累计偏移 + 二分定位',
      '  renderItem={(row, index) => <VRowView row={row} index={index} />}',
      '/>',
    ].join('\n'),
  },
];

const API: ApiRow[] = [
  { name: 'data', desc: '全量数据数组', type: 'T[]', default: '–' },
  { name: 'rowHeight', desc: '固定模式=真实等高；变高模式=未测量行的预估占位高', type: 'number', default: '–' },
  { name: 'variable', desc: '变高行模式：配合 getItemHeight 逐行取高，窗口按累计偏移二分定位', type: 'boolean', default: 'false' },
  { name: 'getItemHeight', desc: '变高模式逐行取高（px）；缺省回退 rowHeight', type: '(index) => number', default: '–' },
  { name: 'renderItem', desc: '渲染单行，收 (item, 全局 index)', type: '(item, index) => ReactNode', default: '–' },
  { name: 'height', desc: '视口高度；缺省 flex:1 由外层给界', type: 'number', default: '–' },
  { name: 'overscan', desc: '视口上下各多渲染的行数（消滚动白边）', type: 'number', default: '6' },
  { name: 'style', desc: '透传 ScrollView 容器样式', type: 'StyleProp<ViewStyle>', default: '–' },
  { name: 'List.virtual', desc: '数据组件 List 内建虚拟化开关（body 走 VirtualList）', type: 'boolean', default: 'false' },
  { name: 'List.itemHeight / virtualHeight', desc: '虚拟化固定行高 / 视口高；配合 getItemHeight 可变高', type: 'number', default: '–' },
  { name: 'Table.virtual', desc: '表格内建虚拟化：表头固定 + 表体走 VirtualList（行等高）', type: 'boolean', default: 'false' },
  { name: 'Table.itemHeight', desc: '表体行高；缺省按密度自动估算（padV*2 + 行高）', type: 'number', default: '估算' },
];

const TOKENS: TokenRow[] = [
  { name: 'colorSplit', desc: '行底分隔线' },
  { name: 'colorFillQuaternary', desc: '斑马纹行底色' },
  { name: 'colorSuccess / colorWarning', desc: '标签语义色（示例）' },
];

export function VirtualListDemo(): React.ReactElement {
  return <DemoPage demos={DEMOS} api={API} tokens={TOKENS} />;
}

export default VirtualListDemo;
