// cases/sys-monitor.tsx —— 「系统监控托盘小部件」案例演示页。
// 两种唤起形态同源：本页内嵌预览的就是小部件本体（SysMonitorBody）；
//   点「弹出独立小窗」= 复现托盘右键菜单「系统监控」的无边框置顶弹窗（同一 openSysMonitor）。
// 取数全部即时快照：整机 CPU/内存走纯 Node os，进程 RSS/帧率/运行时长走库 systemStats，全走 token 明暗自适应。
import React from 'react';
import { View, Text, Card, Button, Icon, Space, useToken } from 'react-native-flux-desktop';
import { SysMonitorBody, openSysMonitor } from '../window/SysMonitor';

function FeatureRow(props: { icon: string; title: string; desc: string }): React.ReactElement {
  const { token } = useToken();
  return (
    <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: token.marginXS }}>
      <Icon name={props.icon} size={token.fontSizeLG} color={token.colorPrimary} />
      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: token.fontSize, lineHeight: 22, fontWeight: '600', color: token.colorText }}>{props.title}</Text>
        <Text style={{ fontSize: token.fontSizeSM, lineHeight: 20, color: token.colorTextSecondary }}>{props.desc}</Text>
      </View>
    </View>
  );
}

export function SysMonitorDemo(): React.ReactElement {
  const { token } = useToken();
  return (
    <View style={{ gap: token.marginLG, maxWidth: 720 }}>
      {/* 标题区 */}
      <View style={{ gap: token.marginXS }}>
        <Text style={{ fontSize: token.fontSizeXL, lineHeight: Math.round(token.fontSizeXL * 1.4), fontWeight: '700', color: token.colorText }}>
          系统监控托盘小部件
        </Text>
        <Text style={{ fontSize: token.fontSize, lineHeight: 22, color: token.colorTextSecondary }}>
          常驻系统托盘的迷你性能面板：整机 CPU 使用率、系统内存占用、实时帧率一屏速览。
          从托盘图标右键菜单「系统监控」唤出，为无边框置顶小窗，点外面即关。
        </Text>
      </View>

      {/* 预览 + 操作 */}
      <Card>
        <View style={{ gap: token.margin }}>
          <Text style={{ fontSize: token.fontSizeSM, lineHeight: 20, color: token.colorTextTertiary }}>内嵌预览（与托盘弹窗同款本体；下例为静态展示，弹出小窗后标题栏可拖、右上有钉住/关闭）</Text>
          <View style={{ alignSelf: 'flex-start' }}>
            <SysMonitorBody controls={false} />
          </View>
          <Space>
            <Button type="primary" onClick={() => openSysMonitor()}>弹出独立小窗</Button>
            <Button onClick={() => openSysMonitor()}>再次点击 = 收起（toggle）</Button>
          </Space>
        </View>
      </Card>

      {/* 能力说明 */}
      <Card title="这个 Demo 展示了什么">
        <View style={{ gap: token.marginSM }}>
          <FeatureRow
            icon="cpu"
            title="纯 JS 取整机指标，无原生依赖"
            desc="CPU 使用率对 os.cpus() 两次时间片差分求得（Windows 上 os.loadavg 不可用），系统内存走 os.totalmem/freemem。"
          />
          <FeatureRow
            icon="monitor"
            title="无边框置顶小窗 + 点外即关"
            desc="复用托盘弹窗范式：decorations:false + alwaysOnTop + 显式定位到图标上方 + 失焦/点外自动关闭；已开则 toggle 收起。"
          />
          <FeatureRow
            icon="dashboard"
            title="软栅格下的稳态几何"
            desc="窗口高与内容用同一套常量逐项对账，圆角外露容器底色而非黑边；token 只用于颜色，明暗/紧凑换肤不破坏布局。"
          />
          <FeatureRow
            icon="activity"
            title="单一数据源不漂移"
            desc="进程 RSS / 帧率 / 运行时长直接复用库 systemStats 门面，与顶栏监控、性能详情窗同源。"
          />
          <FeatureRow
            icon="move"
            title="无边框拖动 + 钉住常驻 + 显隐"
            desc="拖标题栏即可移动小窗（库无 OS 级 drag 原语，用局部坐标「抓取点跟随光标」法 + host.setPosition 实现）；点锁图标在「悬浮即关」与「常驻桌面」间切换；托盘再次点「系统监控」= 收起。"
          />
          <FeatureRow
            icon="anchor"
            title="停靠四角 + 状态落 kv 持久化"
            desc="底部「停靠」行一键把小窗瞬移到屏幕四角（自动避开任务栏）；钉住态与落点写入 flux_app.kv，重启应用后仍在原位、原模式。"
          />
        </View>
      </Card>

      <Text style={{ fontSize: token.fontSizeSM, lineHeight: 20, color: token.colorTextTertiary }}>
        提示：托盘唤起路径需重启 gallery 实例后，右击系统托盘图标 → 「系统监控」体验真实无边框小窗；本页按钮弹出的是同一开窗逻辑。
      </Text>
    </View>
  );
}

export default SysMonitorDemo;
