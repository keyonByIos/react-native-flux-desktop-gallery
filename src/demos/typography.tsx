// TYPOGRAPHY：排版。统一走 DemoPage 三段式（demo 列表 → API 表 → Token 表）。
// 标题阶梯由 fontSize 系列 token 派生，换算法自动整页缩放；含语义色、内联装饰、省略、禁用、链接。
import React from 'react';
import { Typography, View, Text, useToken } from 'react-native-flux-desktop';
import { DemoPage, type DemoItem, type ApiRow, type TokenRow } from '../DemoPage';

const { Title, Paragraph, Text: T, Link } = Typography;

/** 标题：level 1~5，字号逐级降档 */
function TitleDemo(): React.ReactElement {
  return (
    <View>
      <Title level={1}>H1 一级标题 🛰</Title>
      <Title level={2}>H2 二级标题 🚀</Title>
      <Title level={3}>H3 三级标题 ✈️</Title>
      <Title level={4}>H4 四级标题 💣</Title>
      <Title level={5}>H5 五级标题 🌟</Title>
    </View>
  );
}

/** 语义：type 走语义 token，Paragraph / Text 通用 */
function SemanticDemo(): React.ReactElement {
  return (
    <View>
      <Paragraph>默认段落 — 正文颜色 colorText，行高为 lineHeight 倍数。</Paragraph>
      <Paragraph type="secondary">secondary — 次要说明文字</Paragraph>
      <Paragraph type="success">success — 成功状态文本</Paragraph>
      <Paragraph type="warning">warning — 警告状态文本</Paragraph>
      <Paragraph type="danger">danger — 危险状态文本</Paragraph>
    </View>
  );
}

/** 内联装饰：strong / italic / underline / delete / mark / code 可自由组合 */
function DecorDemo(): React.ReactElement {
  const { token } = useToken();
  const Sep = () => <T style={{ color: token.colorTextTertiary }}> · </T>;
  return (
    <View style={{ gap: token.marginXS }}>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center' }}>
        <T strong>加粗</T>
        <Sep />
        <T italic>斜体</T>
        <Sep />
        <T underline>下划线</T>
        <Sep />
        <T delete>删除线</T>
        <Sep />
        <T mark>高亮标记</T>
        <Sep />
        <T code>const x = 1</T>
      </View>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center' }}>
        <T>组合：</T>
        <T strong type="danger">重要</T>
        <T> 提醒，</T>
        <T code>npm install</T>
        <T> 之前请先 </T>
        <T underline>阅读协议</T>
        <T>。</T>
      </View>
    </View>
  );
}

/** 省略：ellipsis.rows 超行折叠 */
function EllipsisDemo(): React.ReactElement {
  const long =
    'Typography 的字号阶梯全部由 fontSize 系列 token 派生：level 1 用 fontSizeXL + 2×sizeStep，逐级降档。换紧凑算法时整页标题会同步缩小，不需要改任何一处组件代码。这段文字超过两行，会被 ellipsis 折叠并在末尾补省略号。';
  return (
    <View style={{ maxWidth: 520 }}>
      <Paragraph ellipsis={{ rows: 2 }}>{long}</Paragraph>
    </View>
  );
}

/** 禁用：disabled 降为 colorTextQuaternary */
function DisabledDemo(): React.ReactElement {
  return (
    <View>
      <Title level={4} disabled>
        禁用标题
      </Title>
      <Paragraph disabled>禁用段落 — 文字统一降到最弱层级 colorTextQuaternary。</Paragraph>
      <T disabled>禁用内联文本</T>
    </View>
  );
}

/** 链接：colorLink 着色，hover 变主色 + 下划线，onClick 回调 */
function LinkDemo(): React.ReactElement {
  const [count, setCount] = React.useState(0);
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
      <Link href="https://ant.design" onClick={() => setCount((c) => c + 1)}>
        可点击链接
      </Link>
      <Link>默认链接</Link>
      <Link disabled>禁用链接</Link>
      <Text style={{ fontSize: 12, color: '#999' }}>（已点击 {count} 次）</Text>
    </View>
  );
}

/** 长按选中复制：仅开启 selectable 的 Text 可选（默认不可选中）；长按 500ms 或右键触发 */
function SelectableDemo(): React.ReactElement {
  const { token } = useToken();
  return (
    <View style={{ gap: token.marginXS }}>
      <Text selectable style={{ fontSize: token.fontSize, color: token.colorText }}>
        按住这段文字 500ms 或右键它，即可选中并复制：The quick brown fox jumps over the lazy dog. 中英混排多行文本时每行分别高亮，复制得到完整原文。
      </Text>
      <Text style={{ fontSize: token.fontSizeSM, color: token.colorTextSecondary }}>
        这一段没有开启 selectable，长按/右键均无反应（默认不可复制）。
      </Text>
    </View>
  );
}

/** 可复制：copyable 在文本/段落尾追加复制图标，点击写剪贴板并短暂变勾 */
function CopyableDemo(): React.ReactElement {
  const { token } = useToken();
  const [n, setN] = React.useState(0);
  return (
    <View style={{ gap: token.marginXS, maxWidth: 520 }}>
      <Paragraph copyable={{ onCopy: () => setN((c) => c + 1) }}>
        这段段落可复制 —— 点右侧图标写入剪贴板（已复制 {n} 次）。
      </Paragraph>
      <View style={{ flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap' }}>
        <T>订单号&nbsp;</T>
        <T copyable={{ text: 'SO-20260925-0041' }}>SO-20260925-0041</T>
      </View>
    </View>
  );
}

const DEMOS: DemoItem[] = [
  {
    name: '标题',
    desc: 'level 1~5，字号从 fontSizeXL / LG 派生，随算法整体缩放',
    node: <TitleDemo />,
    code: [
      'import { Typography } from "react-native-flux-desktop";',
      'const { Title } = Typography;',
      '',
      '// level 1~5，字号逐级降档（由 fontSizeXL/LG/SM token 派生，换算法整页同步缩放）',
      '<Title level={1}>H1 一级标题</Title>',
      '<Title level={2}>H2 二级标题</Title>',
      '<Title level={5}>H5 五级标题</Title>',
    ].join('\n'),
  },
  {
    name: '语义',
    desc: 'type：secondary / success / warning / danger，走语义 token',
    node: <SemanticDemo />,
    code: [
      'const { Paragraph } = Typography;',
      '',
      '// type 走语义 token：secondary 次要 / success 成功 / warning 警告 / danger 危险',
      '<Paragraph>默认段落 — 正文颜色 colorText</Paragraph>',
      '<Paragraph type="secondary">secondary — 次要说明文字</Paragraph>',
      '<Paragraph type="success">success — 成功状态文本</Paragraph>',
      '<Paragraph type="warning">warning — 警告状态文本</Paragraph>',
      '<Paragraph type="danger">danger — 危险状态文本</Paragraph>',
    ].join('\n'),
  },
  {
    name: '内联装饰',
    desc: 'strong / italic / underline / delete / mark / code，可组合',
    node: <DecorDemo />,
    code: [
      'const { Text: T } = Typography;',
      '',
      '// 内联装饰可自由叠加组合',
      '<T strong>加粗</T>',
      '<T italic>斜体</T>',
      '<T underline>下划线</T>',
      '<T delete>删除线</T>',
      '<T mark>高亮标记</T>',
      '<T code>const x = 1</T>',
      '',
      '// 组合：语义色 + 装饰同用',
      '<T strong type="danger">重要</T>',
    ].join('\n'),
  },
  {
    name: '省略',
    desc: 'ellipsis.rows 超行折叠、末尾补省略号',
    node: <EllipsisDemo />,
    code: [
      'const { Paragraph } = Typography;',
      '',
      '// ellipsis.rows 超行折叠并在末尾补省略号',
      '<Paragraph ellipsis={{ rows: 2 }}>{longText}</Paragraph>',
    ].join('\n'),
  },
  {
    name: '禁用',
    desc: 'disabled 统一降为 colorTextQuaternary',
    node: <DisabledDemo />,
    code: [
      'const { Title, Paragraph, Text: T } = Typography;',
      '',
      '// disabled 把文字统一降到最弱层级 colorTextQuaternary',
      '<Title level={4} disabled>禁用标题</Title>',
      '<Paragraph disabled>禁用段落</Paragraph>',
      '<T disabled>禁用内联文本</T>',
    ].join('\n'),
  },
  {
    name: '链接',
    desc: 'Link：colorLink 着色，hover 变主色 + 下划线，onClick 回调',
    node: <LinkDemo />,
    code: [
      'const { Link } = Typography;',
      '',
      '// colorLink 着色，hover 变主色 + 下划线',
      '<Link href="https://ant.design" onClick={() => setCount((c) => c + 1)}>',
      '  可点击链接',
      '</Link>',
      '<Link>默认链接</Link>',
      '<Link disabled>禁用链接</Link>',
    ].join('\n'),
  },
  {
    name: '长按选中',
    desc: 'selectable 开启后长按 500ms / 右键选中文本，菜单或 Ctrl+C 复制；默认不可选',
    node: <SelectableDemo />,
    code: [
      'import { Text } from "react-native-flux-desktop";',
      '',
      '// 仅开启 selectable 的 Text 可选（默认不可选中）：长按 500ms 或右键触发',
      '<Text selectable>按住这段文字 500ms 或右键它，即可选中并复制</Text>',
      '<Text>这一段没有开启 selectable，长按/右键均无反应</Text>',
    ].join('\n'),
  },
  {
    name: '可复制',
    desc: 'copyable：文本/段落尾追加复制图标，点击写剪贴板、图标短暂变勾',
    node: <CopyableDemo />,
    code: [
      'const { Paragraph, Text: T } = Typography;',
      '',
      '// copyable 在尾追加复制图标，点击写剪贴板并短暂变勾',
      '<Paragraph copyable={{ onCopy: () => setN((c) => c + 1) }}>',
      '  这段段落可复制',
      '</Paragraph>',
      '',
      '// 指定复制内容与实际显示不同：{ text }',
      '<T copyable={{ text: "SO-20260925-0041" }}>SO-20260925-0041</T>',
    ].join('\n'),
  },
];

const API: ApiRow[] = [
  { name: 'Title.level', desc: '标题级别，字号逐级降档', type: '1 | 2 | 3 | 4 | 5', default: '1' },
  { name: 'type', desc: '语义色（Title / Paragraph / Text 通用）', type: "'secondary' | 'success' | 'warning' | 'danger'", default: '–' },
  { name: 'strong / italic', desc: '加粗 / 斜体', type: 'boolean', default: 'false' },
  { name: 'underline / delete', desc: '下划线 / 删除线（可叠加）', type: 'boolean', default: 'false' },
  { name: 'mark', desc: '高亮底色 colorWarningBg', type: 'boolean', default: 'false' },
  { name: 'Text.code', desc: '行内代码小块（底色 colorFillTertiary）', type: 'boolean', default: 'false' },
  { name: 'Paragraph.ellipsis', desc: '超行省略', type: 'boolean | { rows }', default: '–' },
  { name: 'copyable', desc: '可复制（Text / Paragraph）：{ text, onCopy, tooltips } 或 true', type: 'boolean | CopyableConfig', default: 'false' },
  { name: 'disabled', desc: '禁用态，文字降为 colorTextQuaternary', type: 'boolean', default: 'false' },
  { name: 'Link.href / target', desc: '链接地址 / 打开方式（渲染管线暂仅占位）', type: 'string', default: '–' },
  { name: 'Link.onClick', desc: '点击回调', type: '() => void', default: '–' },
];

const TOKENS: TokenRow[] = [
  { name: 'fontSizeXL / LG / SM', desc: '标题阶梯与 code 字号来源', default: '20 / 16 / 12' },
  { name: 'lineHeight', desc: '正文与标题行高倍数', default: '1.5714' },
  { name: 'colorText / Secondary', desc: '正文 / 次要文字色', default: '–' },
  { name: 'colorSuccess / Warning / Error', desc: '语义色', default: '–' },
  { name: 'colorLink / colorPrimaryHover', desc: '链接常态 / hover 态色', default: '–' },
  { name: 'colorWarningBg', desc: 'mark 高亮底色', default: '–' },
  { name: 'colorFillTertiary', desc: 'code 小块底色', default: '–' },
  { name: 'colorTextQuaternary', desc: 'disabled 文字色', default: '–' },
];

export function TypographyDemo(): React.ReactElement {
  return <DemoPage demos={DEMOS} api={API} tokens={TOKENS} />;
}
