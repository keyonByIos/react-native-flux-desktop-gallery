// 开发 / 内存监控 MemMonitor：process.memoryUsage() 定时采样，RSS/Heap/External 走势 + 明细 + GC/清空；floating 悬浮右下角。
import React from 'react';
import { View, Text } from 'react-native-flux-desktop';
import { MemMonitor } from 'react-native-flux-desktop-dev';
import { useToken } from 'react-native-flux-desktop';
import { DemoPage, type DemoItem, type ApiRow } from '../DemoPage';

function BasicDemo(): React.ReactElement {
  return (
    <View style={{ maxWidth: 560 }}>
      <MemMonitor />
    </View>
  );
}

function FastDemo(): React.ReactElement {
  return (
    <View style={{ maxWidth: 560 }}>
      <MemMonitor intervalMs={250} maxPoints={240} />
    </View>
  );
}

function WarnDemo(): React.ReactElement {
  const { token } = useToken();
  return (
    <View style={{ maxWidth: 560, gap: token.marginXS }}>
      <MemMonitor warnMB={1} defaultOpen={false} />
      <Text style={{ fontSize: token.fontSizeSM, color: token.colorTextTertiary }}>
        warnMB=1 令 RSS 恒超阈值 → 收起胶囊与标题图标转警示红；点胶囊重新展开
      </Text>
    </View>
  );
}

function FloatingDemo(): React.ReactElement {
  const { token } = useToken();
  return (
    <View
      style={{
        maxWidth: 560,
        height: 220,
        position: 'relative',
        borderRadius: token.borderRadiusLG,
        borderWidth: token.lineWidth,
        borderStyle: 'solid',
        borderColor: token.colorBorderSecondary,
        backgroundColor: token.colorFillQuaternary,
        padding: token.paddingSM,
      }}
    >
      <Text style={{ fontSize: token.fontSizeSM, color: token.colorTextTertiary }}>
        floating 模式：absolute + zIndex 浮层，悬浮在父容器（此舞台）右下角，不占文档流
      </Text>
      <MemMonitor floating intervalMs={500} />
    </View>
  );
}

const DEMOS: DemoItem[] = [
  {
    name: '实时面板',
    desc: '默认 1s 采样 × 120 点（2 分钟窗口）；RSS/Heap/External 三条面积走势 + 当前值/峰值 + heapTotal/arrayBuffers/uptime 明细',
    node: <BasicDemo />,
    code: [
      'import { MemMonitor } from "react-native-flux-desktop";',
      '',
      '// 默认 1s 采样 × 120 点；RSS/Heap/External 三条走势 + 明细',
      '<MemMonitor />',
    ].join('\n'),
  },
  {
    name: '快速采样',
    desc: 'intervalMs=250 + maxPoints=240：5 分钟窗口，捕捉瞬时分配毛刺（如每帧 canvas.data() 的 External 锯齿）',
    node: <FastDemo />,
    code: [
      'import { MemMonitor } from "react-native-flux-desktop";',
      '',
      '// intervalMs 采样间隔；maxPoints 历史点数',
      '<MemMonitor intervalMs={250} maxPoints={240} />',
    ].join('\n'),
  },
  {
    name: '警戒阈值 / 收起态',
    desc: 'RSS 超 warnMB 转红；收起成小胶囊只留 MEM 读数，点击展开',
    node: <WarnDemo />,
    code: [
      'import { MemMonitor } from "react-native-flux-desktop";',
      '',
      '// warnMB 超限转警示红；defaultOpen=false 初始收起为胶囊',
      '<MemMonitor warnMB={1} defaultOpen={false} />',
    ].join('\n'),
  },
  {
    name: '悬浮模式',
    desc: 'floating 悬浮父容器右下角——放在 Window 根节点末尾即整窗右下角常驻监控',
    node: <FloatingDemo />,
    code: [
      'import { MemMonitor } from "react-native-flux-desktop";',
      '',
      '// floating：absolute + right/bottom 悬浮父容器右下角，不占文档流',
      '<MemMonitor floating intervalMs={500} />',
    ].join('\n'),
  },
];

const API: ApiRow[] = [
  { name: 'intervalMs', desc: '采样间隔（毫秒）', type: 'number', default: '1000' },
  { name: 'maxPoints', desc: '历史点数（滚动窗口长度 = maxPoints × intervalMs）', type: 'number', default: '120' },
  { name: 'defaultOpen', desc: '初始展开；收起为小胶囊（MEM 读数），点击展开', type: 'boolean', default: 'true' },
  { name: 'floating', desc: '悬浮父容器右下角（absolute + right/bottom + zIndex 1080），不占文档流', type: 'boolean', default: 'false' },
  { name: 'warnMB', desc: 'RSS 警戒阈值 MB，超过图标/读数转 colorError', type: 'number', default: '300' },
  { name: 'GC 按钮', desc: '调 global.gc()——需以 `node --expose-gc` 启动，否则按钮显示需 --expose-gc 提示', type: '—', default: '—' },
];

const TOKENS: { name: string; desc: string }[] = [
  { name: 'colorBgElevated', desc: '面板/胶囊底色' },
  { name: 'colorWarning / colorPrimary / colorSuccess', desc: 'RSS / Heap / External 走势线色' },
  { name: 'colorError', desc: 'RSS 超 warnMB 的警示色' },
  { name: 'colorBorderSecondary / colorSplit', desc: '面板边框 / 明细区分隔线' },
];

export function MemMonitorDemo(): React.ReactElement {
  return <DemoPage demos={DEMOS} api={API} tokens={TOKENS} />;
}
