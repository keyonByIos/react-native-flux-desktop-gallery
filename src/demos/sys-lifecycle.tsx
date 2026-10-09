// 系统 / 生命周期：最上面用一篇文档详解本自绘栈「从一次 setState 到屏幕上一帧」的完整渲染机制，
// 再用步骤条画出一帧的管线，最后给一个实时驱动重绘的小交互。
import React from 'react';
import { View, Text, Button, useToken } from 'react-native-flux-desktop';
import { Markdown } from 'react-native-flux-desktop-dev';
import { DemoPage, type DemoItem } from '../DemoPage';
import { StepFlow, type StepFlowItem } from './sys-steps';

/** 渲染机制详解文档（Markdown） */
const RENDER_DOC = `
本框架不依赖 Web 或任何原生控件树，而是**自研底座**：React 只负责产出「场景树」，真正画像素的是软件光栅器，再把整帧贴屏。整条链路是**即时模式 + CPU 全窗光栅**。

## 一、一次 setState 到一帧上屏

1. **触发**：setState / props 变化，react-reconciler 调度一次更新。
2. **提交**：reconciler 把变更应用到我们的场景树宿主实例。
3. **排帧**：提交完成后统一排帧，而不是每个节点各画各的。
4. **合帧**：以全局 16ms 节拍，把本轮「脏」窗口收集起来。
5. **重绘**：逐窗渲染一帧，遍历场景树做 diff。
6. **布局**：Yoga 按 Flexbox 计算每个节点的几何。
7. **光栅**：Skia 把布局结果软件光栅成 RGBA 位图。
8. **上屏**：把这一帧像素贴进自研底座的窗口表面缓冲，完成一次呈现。

> 只有内容真正变化的窗口才重绘，静止窗口不空烧 CPU。

## 二、全局事件泵：一条定时器泵所有窗口

多窗口共享进程内唯一的一条 16ms 定时器，取代「每窗各自定时器」的 N 倍重复泵。

- 协调器用引用计数申请 / 释放，全进程只在有活窗口时跑一条定时器。
- 每次 tick 驱动自研底座的全局事件循环，把这一轮所有窗口的事件一次性取出。
- 事件按窗口 id 反查、用该窗专属回调句柄回抛，每条事件携带来源窗口。
- 上层据此把鼠标 / 键盘 / 滚轮 / 文件拖放路由到对应窗口，命中各自的场景树。

## 三、窗口生命周期：创建 · 事件 · 销毁

- **创建**：申请一扇新窗，返回自增 id；建立绘制上下文与表面，登记进窗口表。
- **事件**：见上，全局泵按 id 路由。关闭请求时，先向 TS 侧发出 closed，再摘除该窗登记——顺序反了会把回调句柄先释放，closed 永远发不出、进程关不掉。
- **销毁**：采取「隐藏 + 摘表 + 释放像素」的妥协（表面缓冲的生命周期绑定进程，不做真正 drop）。
- **退进程**：TS 侧统计存活窗口，减到 0 才真正退出进程。

## 四、组件级生命周期在本栈的落点

React 标准 mount / update / unmount 语义不变，只是宿主是场景节点而非 DOM。

- **mount**：reconciler 建场景节点，首帧布局光栅；入场动画在挂载后补间。
- **update**：props / state 变化打脏标记，下一帧重绘；订阅全局配置后，任一窗口改配置都会触发本组件重渲染（跨窗同步）。
- **量测**：onLayout 在布局完成后回传偏移，供锚点目录跳转与联动高亮。
- **unmount**：摘场景节点并释放布局实例；关窗时把宿主从注册表与模态栈摘除。
`;

/** 一帧管线的步骤流数据（对应文档第一节八个阶段；关键阶段特殊着色） */
const PIPELINE: StepFlowItem[] = [
  { title: 'setState / props 变化', desc: 'React 调度一次更新' },
  { title: 'reconciler 提交', desc: '变更写入场景树宿主' },
  { title: '统一排帧', desc: '提交完成后一次性排帧' },
  { title: '全局 16ms 合帧', desc: '收集本轮脏窗口，一条定时器泵所有窗', important: true },
  { title: '逐窗 renderFrame', desc: '遍历场景树 diff' },
  { title: 'Yoga 布局', desc: 'Flexbox 计算几何' },
  { title: 'Skia 软件光栅', desc: '把布局画成 RGBA 位图（CPU 全窗光栅）', important: true },
  { title: 'present 上屏', desc: '贴进自研底座的窗口表面缓冲', important: true },
];

/** 实时帧驱动小样：点按钮改 state → 观察重绘；渲染计数在函数体内自增（每次 commit 即 +1） */
function ReframeDemo(): React.ReactElement {
  const { token } = useToken();
  const [n, setN] = React.useState(0);
  const renders = React.useRef(0);
  renders.current += 1; // 每次 React 真正执行本组件函数体（含更新）都会计数
  const big = { fontSize: 30, fontWeight: '800' as const, color: token.colorPrimary };
  const lbl = { fontSize: token.fontSizeSM, color: token.colorTextTertiary };
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: token.marginXL, flexWrap: 'wrap' }}>
      <View>
        <Text style={lbl}>当前计数（改它即触发一帧）</Text>
        <Text style={big}>{n}</Text>
      </View>
      <View>
        <Text style={lbl}>本组件已渲染次数</Text>
        <Text style={{ ...big, color: token.colorText }}>{renders.current}</Text>
      </View>
      <View>
        <Text style={lbl}>最近一次更新时刻</Text>
        <Text style={{ fontSize: token.fontSize, color: token.colorText }}>{n === 0 ? '—' : new Date().toLocaleTimeString()}</Text>
      </View>
      <View style={{ flexDirection: 'row', gap: token.marginXS }}>
        <Button type="primary" onClick={() => setN((v) => v + 1)}>+1 触发重绘</Button>
        <Button onClick={() => setN(0)}>归零</Button>
      </View>
    </View>
  );
}

const DEMOS: DemoItem[] = [
  {
    name: '渲染机制详解',
    desc: '一篇文档讲清「自研底座 + 即时模式 + CPU 全窗光栅」的完整链路',
    node: <Markdown content={RENDER_DOC} />,
    code: [
      'import { Markdown } from "react-native-flux-desktop";',
      '',
      '// Markdown 组件直接渲染一段机制文档',
      '<Markdown content={RENDER_DOC} />',
    ].join('\n'),
  },
  {
    name: '一帧的旅程（渲染管线）',
    desc: '把上面第一节的八个阶段画成编号步骤流 —— 高亮的是本自绘栈区别于普通 React 应用的关键环节',
    node: <StepFlow steps={PIPELINE} />,
    code: [
      'import { Steps } from "react-native-flux-desktop";',
      '',
      '// 管线八阶段：触发→提交→排帧→合帧→重绘→布局→光栅→贴屏',
      '<Steps',
      '  current={PIPELINE.length - 1}',
      '  items={PIPELINE.map((s) => ({ title: s.title, description: s.desc }))}',
      '/>',
    ].join('\n'),
  },
  {
    name: '实时：驱动一帧重绘',
    desc: '点按钮改 state，观察「渲染计数」随每次提交 +1 —— 每一次都是上面那条管线跑了一遍。',
    node: <ReframeDemo />,
    code: [
      'import { useState, useRef } from "react";',
      'import { View, Text, Button, useToken } from "react-native-flux-desktop";',
      '',
      '// setState 触发 reconciler 提交，进而排帧重绘',
      'const [n, setN] = useState(0);',
      'const renders = useRef(0);',
      'renders.current += 1; // 每次函数体执行都计一次',
      '<Button type="primary" onClick={() => setN((v) => v + 1)>+1 触发重绘</Button>',
    ].join('\n'),
  },
];

export function SysLifecycleDemo(): React.ReactElement {
  return <DemoPage demos={DEMOS} />;
}
