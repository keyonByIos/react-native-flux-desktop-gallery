// 系统 / 渲染：详解本自绘栈的两处运行时可调渲染档位——渲染后端（GPU 直呈 ↔ CPU 光栅）
// 与光栅分辨率（dpr 封顶）。二者正交：一个换「算力来源」，一个换「像素总量」。
// 顶栏右侧已放两个 Segmented 直调同一组接口，本页把机制、代价、接口一次讲清，并内嵌同款可交互控件。
import React from 'react';
import { View, Text, Segmented, useToken, Application } from 'react-native-flux-desktop';
import { Markdown } from 'react-native-flux-desktop-dev';
import { DemoPage, type DemoItem } from '../DemoPage';

/** 渲染档位总述（Markdown） */
const RENDER_DOC = `
本框架默认走 **CPU 全窗光栅 + 原生 scale 1:1 贴屏**（见「生命周期」）。在此之上有两处**运行时可调**的档位，互相正交：

- **渲染后端**：CPU 光栅（省内存）↔ GPU 直呈（更流畅，多占约 100MB 显存/内存）。换的是「谁来算像素」。
- **光栅分辨率（dpr 封顶）**：跟随原生 ↔ 100% / 150% / 200%。换的是「一共算多少像素」。

## 一、渲染后端：GPU 直呈 ↔ CPU 光栅

CPU 链路每帧末尾要 \`data()\` 把整幅位图读回再贴屏，这「present 整幅读回」约占全帧成本 70%（2560×1280@2 实测约 16ms/帧）。GPU 直呈把位图直接写进交换链，消掉这块读回，帧时降到约 5–8ms，代价是 GPU 纹理缓存 +约 100MB 内存（已设 128MB 硬预算封顶，属有界固有成本）。

⚠️ **切换需重启进程**：GPU 上下文在 native 建窗那一刻绑定，无法热切。故点顶栏「流畅 GPU / 省内存 CPU」→ 写持久化偏好 → 自动重启应用落地。

⚠️ **双闸**：GPU 是否启用有 JS、Rust 两道独立闸。偏好由 JS 侧读取，必须在**建窗之前**把结论回写 \`process.env.FLUX_GPU\`，Rust 侧 \`create_window\` 才会初始化 GL surface；否则 JS 建了 GPU 句柄却报 \`gpu: not initialized\` 静默降回 CPU。

## 二、光栅分辨率（dpr 封顶）

**这不是系统显示缩放**（那是 OS 级的，应用改不了），而是**内部光栅倍率**：以更低 dpr 画完整窗，再由原生贴屏时最近邻上采样回物理分辨率。

- **成本 ∝ dpr²**：present 读回、blit、光栅全部随像素总数平方变化。200%→100% 理论上把整帧成本砍到约 1/4，是比后端切换更直接的降载杠杆。
- **代价 = 清晰度**：低于原生 scale 封顶会触发非整数倍上采样 → 边缘阶梯锯齿（scale=2 屏封顶 1.5 时 2/1.5=1.333，实测斜线锯齿约恶化 12×）。200% 在 scale=2 屏即 1:1 无采样损失、最锐；100% 最糊最省。
- **可热切换**：\`host.dpr()\` 每帧现算，改偏好后 \`scheduleFrame()\` 排一帧，下帧 renderFrame 命中 faces 重建守卫（\`f0.dpr!==dpr\`）自动按新倍率重建 → 即时生效，无需重启。
- **优先级**：持久化偏好 \`resolution\`（非 0）**>** env \`FLUX_MAX_DPR\` **>** 跟随原生。偏好排在 env 前，因为 gallery 启动会用 app.json 的 \`maxDpr\` 无条件注入 env 作「应用缺省上限」，用户手选理应盖过它（与 GPU 的 env>偏好 相反：GPU 的 env 是纯调试开关，app 不默认注入）。
- ⚠️ **仅对 CPU 路生效**：GPU 直呈的 GL surface 尺寸绑死窗口物理尺寸（logical×原生 scale），JS 的 dpr 只改绘制变换、不改 surface。若 GPU 下把 dpr 封顶到低于原生，绘制区会小于 surface → 顶部/右缘露黑底与残帧。故 **GPU 模式一律恒用原生 dpr**，顶栏分辨率按钮在 GPU 下置灰（且 GPU 本已消掉 present 整幅读回，无需这根降载杠杆）。

## 三、对外接口（\`Application\`）

\`\`\`ts
// 渲染后端：写偏好 + 重启进程生效（GPU 上下文建窗时绑定，不可热切）
Application.setRenderer('gpu' | 'cpu'): void;

// 光栅分辨率：写偏好 + 排一帧即时生效（无需重启）
// pct：0=跟随原生 scale，100/150/200=把 dpr 封顶到 1.0/1.5/2.0
Application.setResolution(pct: number): void;

// 读当前档位（持久化偏好 App.prefs）
Application.config.getPrefs().renderer;   // 'gpu' | 'cpu'
Application.config.getPrefs().resolution; // 0 | 100 | 150 | 200
\`\`\`

两项都落 \`flux_app.kv\` 的系统层偏好，跨进程持久、重开回灌；缺省 \`renderer='cpu'\`、\`resolution=0\`（跟随原生）。
`;

/** 内嵌可交互控件：与顶栏同一组接口，切档实时生效 / 重启 */
function RenderCtl(): React.ReactElement {
  const { token } = useToken();
  // 订阅系统配置：分辨率热切换只排绘制帧、不重渲染 React，需自订阅才能刷新高亮。
  const [, bump] = React.useReducer((x: number) => x + 1, 0);
  React.useEffect(() => Application.config.subscribe(() => bump()), []);
  const renderer = Application.config.getPrefs().renderer ?? 'cpu';
  const resolution = Application.config.getPrefs().resolution ?? 0;
  const lbl = { fontSize: token.fontSizeSM, color: token.colorTextTertiary } as const;
  return (
    <View style={{ gap: token.margin, flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center' }}>
      <View style={{ gap: token.marginXS }}>
        <Text style={lbl}>渲染后端（切换会重启应用）</Text>
        <Segmented
          value={renderer}
          onChange={(v) => Application.setRenderer(v as 'gpu' | 'cpu')}
          options={[
            { label: '流畅 GPU', value: 'gpu' },
            { label: '省内存 CPU', value: 'cpu' },
          ]}
        />
      </View>
      <View style={{ gap: token.marginXS }}>
        <Text style={lbl}>光栅分辨率（即时生效，无需重启）</Text>
        <Segmented
          value={String(resolution)}
          onChange={(v) => Application.setResolution(Number(v))}
          disabled={renderer === 'gpu'}
          options={[
            { label: '跟随', value: '0' },
            { label: '100%', value: '100' },
            { label: '150%', value: '150' },
            { label: '200%', value: '200' },
          ]}
        />
      </View>
    </View>
  );
}

const DEMOS: DemoItem[] = [
  {
    name: '渲染档位总述',
    desc: 'GPU↔CPU 后端 + dpr 封顶分辨率：两处正交的运行时可调档位，讲清机制 / 代价 / 接口',
    node: <Markdown content={RENDER_DOC} />,
    code: [
      '// 渲染后端：写偏好 + 重启（GPU 上下文建窗时绑定，不可热切）',
      'Application.setRenderer("gpu");',
      '',
      '// 光栅分辨率：写偏好 + 排一帧即时生效（靠 faces 重建守卫下帧落地）',
      'Application.setResolution(150); // dpr 封顶 1.5',
      '',
      '// 读当前档位（App.prefs 持久化）',
      'Application.config.getPrefs().renderer;',
      'Application.config.getPrefs().resolution;',
    ].join('\n'),
  },
  {
    name: '实时：两处档位切换',
    desc: '与顶栏右侧同一组接口。后端切换会重启应用；分辨率切换即时生效（配合顶栏 FpsMonitor / MemMonitor 观察帧率与内存变化）。',
    node: <RenderCtl />,
    code: [
      'import { Application, Segmented } from "react-native-flux-desktop";',
      '',
      'const renderer = Application.config.getPrefs().renderer;',
      '<Segmented value={renderer}',
      '  onChange={(v) => Application.setRenderer(v)}',
      '  options={[{ label: "流畅 GPU", value: "gpu" }, { label: "省内存 CPU", value: "cpu" }]} />',
      '',
      'const resolution = Application.config.getPrefs().resolution;',
      '<Segmented value={String(resolution)}',
      '  onChange={(v) => Application.setResolution(Number(v))}',
      '  options={[/* 跟随 / 100% / 150% / 200% */]} />',
    ].join('\n'),
  },
];

export function SysRenderDemo(): React.ReactElement {
  return <DemoPage demos={DEMOS} />;
}
