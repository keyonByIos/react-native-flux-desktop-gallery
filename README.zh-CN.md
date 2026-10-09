# react-native-flux-desktop-gallery（中文文档）

> 🖼️ 整个 `react-native-flux-desktop` 生态的可交互 demo 总览 —— 100+ 组件示例、图表、Web3、开发工具与整站案例，全部由自绘栈渲染（无浏览器）。

![版本](https://img.shields.io/badge/version-0.1.3-blue) ![类型](https://img.shields.io/badge/demo%20应用-ff69b4) ![运行时](https://img.shields.io/badge/%E7%BA%AFReact%C2%B7%E5%8E%9F%E7%94%9F%E5%83%8F%E7%B4%A0%C2%B7%E9%9D%9EElectron-8a2be2)

**消费：** `react-native-flux-desktop`（核心）· `-chart` · `-dev` · `-pro` · `-web3` · `-webview` —— 均以 `file:../…` 本地依赖接入，因此本应用就是"这些包如何组合成真实界面"的参考实现。

> 📦 这是一个 **demo 应用**，不是库。它标记为 `private`（不发 npm），存在的意义是让你读到每个组件的真实用法 —— 各包 README 里的截图都出自这里。

[English](./README.md)

---

## 界面一览

<table>
  <tr>
    <td align="center"><b>首页 · 系统总览</b><br/><img src="./assets/shot-hero.png" alt="首页" /></td>
    <td align="center"><b>仪表盘案例</b><br/><img src="./assets/shot-dashboard.png" alt="仪表盘" /></td>
  </tr>
  <tr>
    <td align="center"><b>设计 Token</b><br/><img src="./assets/shot-theme.png" alt="主题" /></td>
    <td align="center"><b>Web3 · 币种图标</b><br/><img src="./assets/shot-coin.png" alt="币种" /></td>
  </tr>
</table>

## 内容分区

左侧导航分为六段；顶栏可切换主题（明 / 暗）、密度、主色、**CPU / GPU** 渲染档位、DPR（100 / 150 / 200%），并实时显示 FPS / 内存：

| 分区 | 内容 |
| --- | --- |
| **系统 System** | 生命周期、渲染、字体、事件、窗口、多窗口、键值持久化、日志、托盘、系统方法 |
| **组件 Components** | 完整基础组件族 —— Button、Input、Select、Menu、Table、Modal、Drawer、Tabs、DatePicker、Tree、Upload、Form …（对齐 antd） |
| **Web3** | CoinIcon（560 币种）、Address、TokenPrice、PriceRange、NFTCard、Web3Avatar、币价实时看板 |
| **开发 Dev** | CodeBlock、Markdown、JsonViewer、DiffViewer、Terminal / LiveTerminal / SshTerminal、LogViewer、CommandPalette、RegexTester、CronParser、TimeConverter、内存 / 帧率监控 |
| **图表 Charts** | 基础 / 高阶 / 金融 / 关系图 —— 折线、柱状、K 线、旭日、矩形树、桑基、生态树、思维导图、组织架构、流程图 … |
| **案例 Cases** | 约二十个整站案例（仪表盘、后台 CRUD、看板、邮件、聊天、音乐、商城、钱包、文件管理、天气 …） |

## 快速开始

由于各包以 `file:../…` 链接，本应用期望这些同级目录**与它并列**放在同一个 workspace 下：

```
flux/
├─ react-native-flux-desktop/          # 核心（编译产物 dist）
├─ react-native-flux-desktop-chart/
├─ react-native-flux-desktop-dev/
├─ react-native-flux-desktop-pro/
├─ react-native-flux-desktop-web3/
├─ react-native-flux-desktop-webview/
├─ react-native-flux-desktop-packer/
└─ gallery/                            # ← 本仓库
```

```bash
cd gallery
npm install          # 解析上面 file:../ 的同级包
npm start            # 构建（tsc）+ 运行，CPU 渲染
npm run gpu          # 以 GPU 渲染模式运行
npm run dev          # 开发运行器
```

其他脚本：

| 脚本 | 作用 |
| --- | --- |
| `npm run pack` | 经 `flux-pack` 打包成自包含 `.exe`（Go 启动器 + `go:embed`） |
| `npm run dist` | 产出可分发目录（`tools/make-dist.js`） |
| `npm run vreg` / `vreg:update` / `vreg:all` | 视觉回归：抓帧并与基线比对 |

## 配置

应用级设置集中在 **`app.json`**：窗口 `icon`、`name`、`maxDpr`（封顶 2）、`fonts` 字体表（首帧前经 `registerFonts` 注册的系统字体）、`logger`，以及 `pack`（`mode: "sea"`）。完整的字体 / 资源模型见核心包 README。

## 说明

- **渲染**：顶栏可 CPU ⇄ GPU 切换（或 `npm run gpu`）；两者驱动完全相同的组件树。
- **字体**：demo 注册了若干 Windows 字体（黑体 / 楷体 / 仿宋 / 幼圆 / 华文行楷 / Arial / Consolas），用来演示全局 vs 局部字体体系与中文豆腐兜底链。
- **单独 clone**：若只 clone 本仓库，`npm install` 会因 `file:../…` 路径失败 —— 请把同级各包并列放好（见上方布局），或把它们改指到已发布的 npm 版本。

## 许可证

属 `react-native-flux-desktop` 项目（MIT）。本 gallery 应用为 `private`，以示例源码形式分发。

> English 版见 [README.md](./README.md)。
