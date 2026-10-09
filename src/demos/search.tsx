// SEARCH：搜索框。DemoPage 多段式，覆盖 基础 / 图标按钮 / 文字按钮 / loading / 尺寸与禁用。
import React from 'react';
import { Search, Text, View, useToken } from 'react-native-flux-desktop';
import { DemoPage, type DemoItem, type ApiRow, type TokenRow } from '../DemoPage';

/** 基础：回车或点放大镜触发 */
function BasicDemo(): React.ReactElement {
  const { token } = useToken();
  const [last, setLast] = React.useState('');
  return (
    <View style={{ gap: token.marginXS }}>
      <Search placeholder="输入关键词，回车搜索" onSearch={setLast} allowClear />
      <Text style={{ fontSize: token.fontSizeSM, color: token.colorTextSecondary }}>
        {last ? `搜索了：${last}` : '尚未触发搜索'}
      </Text>
    </View>
  );
}

/** 模拟异步搜索 + loading */
function LoadingDemo(): React.ReactElement {
  const { token } = useToken();
  const [loading, setLoading] = React.useState(false);
  const [hits, setHits] = React.useState<string | null>(null);
  const timer = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  React.useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);
  return (
    <View style={{ gap: token.marginXS }}>
      <Search
        placeholder="试试搜索 flux / yoga / skia"
        loading={loading}
        enterButton
        onSearch={(v) => {
          setLoading(true);
          setHits(null);
          if (timer.current) clearTimeout(timer.current);
          timer.current = setTimeout(() => {
            setLoading(false);
            setHits(v && /flux|yoga|skia/i.test(v) ? `命中「${v}」(1 条)` : `「${v || '空'}」无结果`);
          }, 1200);
        }}
      />
      {hits ? <Text style={{ fontSize: token.fontSizeSM, color: token.colorTextSecondary }}>{hits}</Text> : null}
    </View>
  );
}

/** 文字 enterButton */
function EnterButtonDemo(): React.ReactElement {
  const { token } = useToken();
  const [last, setLast] = React.useState('');
  return (
    <View style={{ gap: token.marginXS }}>
      <Search placeholder="点右侧按钮或回车" enterButton="搜一下" onSearch={setLast} />
      <Search placeholder="大尺寸 + 文字按钮" enterButton="搜索" size="large" onSearch={setLast} />
      <Text style={{ fontSize: token.fontSizeSM, color: token.colorTextSecondary }}>{last ? `最近触发：${last}` : '–'}</Text>
    </View>
  );
}

/** 受控 + 禁用 */
function ControlledDemo(): React.ReactElement {
  const { token } = useToken();
  const [v, setV] = React.useState('受控值');
  return (
    <View style={{ gap: token.marginXS }}>
      <Search value={v} onChange={setV} onSearch={() => undefined} />
      <Search defaultValue="禁用态" disabled enterButton />
      <Text style={{ fontSize: token.fontSizeSM, color: token.colorTextSecondary }}>当前受控值：{v || '(空)'}</Text>
    </View>
  );
}

const DEMOS: DemoItem[] = [
  {
    name: '基础用法',
    desc: '回车 / 点放大镜图标触发 onSearch，allowClear 一键清空',
    node: <BasicDemo />,
    code: [
      'import { Search } from "react-native-flux-desktop";',
      '',
      '// 回车 / 点放大镜图标触发 onSearch',
      '<Search placeholder="输入关键词，回车搜索" onSearch={setLast} allowClear />',
    ].join('\n'),
  },
  {
    name: '搜索按钮 + loading',
    desc: 'enterButton 附着按钮；loading 时图标旋转并拦截触发',
    node: <LoadingDemo />,
    code: [
      'import { Search } from "react-native-flux-desktop";',
      '',
      '// enterButton 附着按钮；loading 时图标旋转并拦截触发',
      '<Search',
      '  placeholder="试试搜索 flux / yoga / skia"',
      '  loading={loading}',
      '  enterButton',
      '  onSearch={(v) => setLoading(true)}',
      '/>',
    ].join('\n'),
  },
  {
    name: '文字按钮',
    desc: 'enterButton 传字符串，primary 按钮圆角贴合',
    node: <EnterButtonDemo />,
    code: [
      'import { Search } from "react-native-flux-desktop";',
      '',
      '// enterButton 传字符串，渲染为 primary 文字按钮',
      '<Search placeholder="点右侧按钮或回车" enterButton="搜一下" onSearch={setLast} />',
      '<Search placeholder="大尺寸 + 文字按钮" enterButton="搜索" size="large" onSearch={setLast} />',
    ].join('\n'),
  },
  {
    name: '受控 / 禁用',
    desc: 'value+onChange 透传 Input；disabled 全灰',
    node: <ControlledDemo />,
    code: [
      'import { Search } from "react-native-flux-desktop";',
      '',
      '// value + onChange 透传 Input；disabled 全灰',
      '<Search value={v} onChange={setV} onSearch={() => undefined} />',
      '<Search defaultValue="禁用态" disabled enterButton />',
    ].join('\n'),
  },
];

const API: ApiRow[] = [
  { name: 'onSearch', desc: '回车/点图标/点按钮触发', type: '(v: string) => void', default: '–' },
  { name: 'loading', desc: '搜索中：图标旋转 + 拦截触发', type: 'boolean', default: 'false' },
  { name: 'enterButton', desc: '附着按钮：true 图标 / 节点文字', type: 'boolean | ReactNode', default: '–' },
  { name: 'value / defaultValue', desc: '透传 Input 受控/非受控', type: 'string', default: "''" },
  { name: 'onChange', desc: '值变化（透传 Input）', type: '(v: string) => void', default: '–' },
  { name: 'size / disabled / allowClear', desc: '透传 Input 同名 API', type: '–', default: '–' },
];

const TOKENS: TokenRow[] = [
  { name: 'colorTextTertiary', desc: '放大镜图标色', default: '–' },
  { name: 'colorPrimary', desc: 'enterButton 主色（Button primary）', default: '#3b82f6' },
  { name: 'borderRadius', desc: '贴合处左/右圆角清零', default: '6' },
];

export function SearchDemo(): React.ReactElement {
  return <DemoPage demos={DEMOS} api={API} tokens={TOKENS} />;
}
