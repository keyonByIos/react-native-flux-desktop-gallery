// PAGE_LAYOUT：页级骨架 Layout（Header / Sider / Content / Footer）。统一走 DemoPage 三段式。
// 底色全走 token —— 换算法即换皮；含侧栏用 <Layout hasSider> 自动横向排布；Sider 可折叠（宽度缓动 + 箭头旋转）。
import React from 'react';
import { Layout, Text, View, Pressable, useToken } from 'react-native-flux-desktop';
import { DemoPage, type DemoItem, type ApiRow, type TokenRow } from '../DemoPage';

const { Header, Sider, Content, Footer } = Layout;

/** 迷你页面外框：给骨架一个固定视口，圆角边框模拟应用窗口 */
function Frame(props: { children: React.ReactNode; height?: number }): React.ReactElement {
  const { token } = useToken();
  return (
    <View
      style={{
        height: props.height ?? 320,
        borderRadius: token.borderRadiusLG,
        borderWidth: token.lineWidth,
        borderColor: token.colorBorderSecondary,
        overflow: 'hidden',
      }}
    >
      {props.children}
    </View>
  );
}

function Brand(): React.ReactElement {
  const { token } = useToken();
  return (
    <Text style={{ fontSize: token.fontSizeLG, fontWeight: '600', color: token.colorText }}>Flux Console</Text>
  );
}

function SiderNav(): React.ReactElement {
  const { token } = useToken();
  const item = (t: string, active?: boolean): React.ReactElement => (
    <Text
      style={{
        fontSize: token.fontSize,
        color: active ? token.colorPrimary : token.colorTextSecondary,
        marginBottom: token.marginSM,
      }}
    >
      {t}
    </Text>
  );
  return (
    <View style={{ padding: token.padding }}>
      {item('仪表盘', true)}
      {item('数据分析')}
      {item('系统设置')}
    </View>
  );
}

function BodyText(props: { children: React.ReactNode }): React.ReactElement {
  const { token } = useToken();
  return (
    <Text style={{ fontSize: token.fontSize, color: token.colorTextSecondary }}>{props.children}</Text>
  );
}

/** 基础：Header + Content + Footer（无侧栏，纵向） */
function BasicDemo(): React.ReactElement {
  const { token } = useToken();
  return (
    <Frame height={300}>
      <Layout>
        <Header>
          <Brand />
        </Header>
        <Content>
          <BodyText>Content 区域 flex:1，padding 走 paddingLG。</BodyText>
        </Content>
        <Footer>
          <Text style={{ fontSize: token.fontSizeSM, color: token.colorTextTertiary }}>©2026 Flux · Skia 自绘</Text>
        </Footer>
      </Layout>
    </Frame>
  );
}

/** 带侧栏：hasSider 横向排布，Sider 可折叠（非受控） */
function SiderDemo(): React.ReactElement {
  const { token } = useToken();
  return (
    <Frame height={340}>
      <Layout>
        <Header>
          <Brand />
        </Header>
        <Layout hasSider>
          <Sider collapsible>
            <SiderNav />
          </Sider>
          <Layout>
            <Content>
              <BodyText>hasSider 让本层 Layout 自动改为横向：左 Sider + 右内容列。</BodyText>
            </Content>
            <Footer>
              <Text style={{ fontSize: token.fontSizeSM, color: token.colorTextTertiary }}>Footer</Text>
            </Footer>
          </Layout>
        </Layout>
      </Layout>
    </Frame>
  );
}

/** 深色侧栏：theme="dark"，底色仍走 token（换暗色算法自动跟皮） */
function DarkSiderDemo(): React.ReactElement {
  return (
    <Frame height={320}>
      <Layout>
        <Layout hasSider>
          <Sider theme="dark" collapsible>
            <SiderNav />
          </Sider>
          <Layout>
            <Content>
              <BodyText>theme="dark"：侧栏底色改用 colorBgLayout，与内容区拉开层次，换算法仍自动跟皮。</BodyText>
            </Content>
          </Layout>
        </Layout>
      </Layout>
    </Frame>
  );
}

/** 受控折叠 + reverseArrow：外部 state 驱动，箭头反向 */
function ControlledDemo(): React.ReactElement {
  const { token } = useToken();
  const [collapsed, setCollapsed] = React.useState(false);
  return (
    <Frame height={320}>
      <Layout>
        <Layout hasSider>
          <Sider collapsible collapsed={collapsed} onCollapse={setCollapsed} reverseArrow trigger={null}>
            <SiderNav />
          </Sider>
          <Layout>
            <Content>
              <View style={{ gap: token.marginXS }}>
                <BodyText>trigger=null 去掉内置触发器，改由下方按钮受控切换。</BodyText>
                <PressButton label={collapsed ? '展开侧栏' : '收起侧栏'} onPress={() => setCollapsed(!collapsed)} />
              </View>
            </Content>
          </Layout>
        </Layout>
      </Layout>
    </Frame>
  );
}

function PressButton(props: { label: string; onPress: () => void }): React.ReactElement {
  const { token } = useToken();
  return (
    <Pressable
      onPress={props.onPress}
      style={{
        alignSelf: 'flex-start',
        paddingHorizontal: token.paddingSM,
        paddingVertical: token.paddingXXS,
        borderRadius: token.borderRadius,
        borderWidth: token.lineWidth,
        borderColor: token.colorPrimary,
        cursor: 'pointer',
      }}
    >
      <Text style={{ fontSize: token.fontSizeSM, color: token.colorPrimary }}>{props.label}</Text>
    </Pressable>
  );
}

const DEMOS: DemoItem[] = [
  {
    name: '基础骨架',
    desc: 'Header + Content + Footer，无侧栏时纵向堆叠',
    node: <BasicDemo />,
    code: [
      'import { Layout } from "react-native-flux-desktop";',
      'const { Header, Content, Footer } = Layout;',
      '',
      '// 无侧栏：纵向堆叠；底色全走 token',
      '<Layout>',
      '  <Header>品牌栏</Header>',
      '  <Content>flex:1 主体区</Content>',
      '  <Footer>©2026 Flux</Footer>',
      '</Layout>',
    ].join('\n'),
  },
  {
    name: '带侧栏',
    desc: '<Layout hasSider> 自动横向：左可折叠 Sider + 右内容列',
    node: <SiderDemo />,
    code: [
      'const { Header, Sider, Content, Footer } = Layout;',
      '',
      '// hasSider 让本层 Layout 改为横向：左 Sider + 右内容列',
      '<Layout>',
      '  <Header>品牌栏</Header>',
      '  <Layout hasSider>',
      '    <Sider collapsible>导航</Sider>',
      '    <Layout>',
      '      <Content>主体区</Content>',
      '      <Footer>Footer</Footer>',
      '    </Layout>',
      '  </Layout>',
      '</Layout>',
    ].join('\n'),
  },
  {
    name: '深色侧栏',
    desc: 'theme="dark"：侧栏改用 colorBgLayout 拉开层次，底色仍全走 token',
    node: <DarkSiderDemo />,
    code: [
      '// theme="dark"：侧栏底色改用 colorBgLayout，换算法仍自动跟皮',
      '<Layout hasSider>',
      '  <Sider theme="dark" collapsible>导航</Sider>',
      '  <Layout>',
      '    <Content>主体区</Content>',
      '  </Layout>',
      '</Layout>',
    ].join('\n'),
  },
  {
    name: '受控折叠',
    desc: 'collapsed/onCollapse 受控 + trigger=null + reverseArrow',
    node: <ControlledDemo />,
    code: [
      '// collapsed/onCollapse 受控；trigger=null 去内置触发器；reverseArrow 箭头反向',
      "const [collapsed, setCollapsed] = React.useState(false);",
      '<Sider',
      '  collapsible',
      '  collapsed={collapsed}',
      '  onCollapse={setCollapsed}',
      '  reverseArrow',
      '  trigger={null}',
      '>',
      '  导航',
      '</Sider>',
      "<Button onPress={() => setCollapsed(!collapsed)}>{collapsed ? '展开' : '收起'}</Button>",
    ].join('\n'),
  },
];

const API: ApiRow[] = [
  { name: 'Layout.hasSider', desc: '子项含 Sider 时置 true，自动横向排布', type: 'boolean', default: 'false' },
  { name: 'Header.height', desc: '顶栏高度', type: 'number', default: 'controlHeightLG×2' },
  { name: 'Sider.theme', desc: '侧栏配色（均走 token）', type: "'light' | 'dark'", default: "'light'" },
  { name: 'Sider.width / collapsedWidth', desc: '展开 / 折叠宽度', type: 'number', default: '×6 / ×1.4' },
  { name: 'Sider.collapsible', desc: '显示底部折叠触发器', type: 'boolean', default: 'false' },
  { name: 'Sider.defaultCollapsed', desc: '非受控初始折叠态', type: 'boolean', default: 'false' },
  { name: 'Sider.collapsed / onCollapse', desc: '受控折叠态 / 切换回调', type: 'boolean / (b)=>void', default: '–' },
  { name: 'Sider.reverseArrow', desc: '触发箭头反向', type: 'boolean', default: 'false' },
  { name: 'Sider.trigger', desc: '传 null 隐藏内置触发器', type: 'null', default: '–' },
];

const TOKENS: TokenRow[] = [
  { name: 'colorBgLayout', desc: 'Layout 外层底色 / dark Sider 底色', default: '–' },
  { name: 'colorBgContainer', desc: 'Header / light Sider / Footer 底色', default: '–' },
  { name: 'colorBorderSecondary', desc: '区块分隔边框色', default: '–' },
  { name: 'controlHeightLG', desc: 'Header 高度与 Sider 宽度基准', default: '48' },
  { name: 'paddingLG / padding', desc: 'Content/Footer 与 Sider 内边距', default: '24 / 16' },
];

export function PageLayoutDemo(): React.ReactElement {
  return <DemoPage demos={DEMOS} api={API} tokens={TOKENS} />;
}
