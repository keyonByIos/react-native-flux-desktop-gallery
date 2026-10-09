// INFINITE SCROLL：无限滚动。DemoPage 多段式，覆盖 基础分页 / 失败重试 / 自定义文案。
import React from 'react';
import { InfiniteScroll, Text, View, useToken } from 'react-native-flux-desktop';
import { DemoPage, type DemoItem, type ApiRow, type TokenRow } from '../DemoPage';

/** 模拟一页数据：第 page 页起 count 条标题 */
function mockTitles(page: number, count: number): string[] {
  return Array.from({ length: count }, (_, i) => `第 ${(page - 1) * count + i + 1} 条 · 滚到 footer 附近自动追页`);
}

const TOTAL_PAGES = 5;
const PAGE_SIZE = 8;

/** 基础：翻到第 5 页后 hasMore=false，footer 落「没有更多」 */
function BasicDemo(): React.ReactElement {
  const { token } = useToken();
  const [titles, setTitles] = React.useState<string[]>(() => mockTitles(1, PAGE_SIZE));
  const [page, setPage] = React.useState(1);
  const [loading, setLoading] = React.useState(false);
  const hasMore = page < TOTAL_PAGES;

  const loadMore = (): void => {
    if (loading) return;
    setLoading(true);
    setTimeout(() => {
      setTitles((prev) => prev.concat(mockTitles(page + 1, PAGE_SIZE)));
      setPage((p) => p + 1);
      setLoading(false);
    }, 600);
  };

  return (
    <View style={{ height: 320, border: `1px solid ${token.colorBorderSecondary}`, borderRadius: token.borderRadiusLG, overflow: 'hidden' }}>
      <InfiniteScroll hasMore={hasMore} loading={loading} onLoadMore={loadMore}>
        {titles.map((t, i) => (
          <Row key={i} text={t} index={i} />
        ))}
      </InfiniteScroll>
    </View>
  );
}

function Row(props: { text: string; index: number }): React.ReactElement {
  const { token } = useToken();
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: token.marginSM,
        padding: token.paddingSM,
        borderBottomWidth: 1,
        borderBottomColor: token.colorSplit,
      }}
    >
      <View
        style={{
          width: 26,
          height: 26,
          borderRadius: 13,
          backgroundColor: token.colorFillSecondary,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Text style={{ fontSize: token.fontSizeSM, color: token.colorTextSecondary }}>{props.index + 1}</Text>
      </View>
      <Text style={{ fontSize: token.fontSize, color: token.colorText }}>{props.text}</Text>
    </View>
  );
}

/** 失败重试：第 3 页必失败，footer 出「加载失败 · 重试」 */
function ErrorDemo(): React.ReactElement {
  const { token } = useToken();
  const [titles, setTitles] = React.useState<string[]>(() => mockTitles(1, PAGE_SIZE));
  const [page, setPage] = React.useState(1);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState(false);
  const hasMore = page < TOTAL_PAGES;

  const load = (next: number): void => {
    if (loading) return;
    setLoading(true);
    setError(false);
    setTimeout(() => {
      setLoading(false);
      if (next === 3) {
        setError(true); // 固定让第 3 页失败，演示重试链路
        return;
      }
      setTitles((prev) => prev.concat(mockTitles(next, PAGE_SIZE)));
      setPage(next);
    }, 600);
  };

  return (
    <View style={{ gap: token.marginXS }}>
      <Text style={{ fontSize: token.fontSizeSM, color: token.colorTextTertiary }}>
        第 3 页被刻意置败；点 footer「重试」重新拉同一页
      </Text>
      <View style={{ height: 300, border: `1px solid ${token.colorBorderSecondary}`, borderRadius: token.borderRadiusLG, overflow: 'hidden' }}>
        <InfiniteScroll hasMore={hasMore} loading={loading} error={error} onLoadMore={() => load(page + 1)} onRetry={() => load(page)}>
          {titles.map((t, i) => (
            <Row key={i} text={t} index={i} />
          ))}
        </InfiniteScroll>
      </View>
    </View>
  );
}

/** 自定义 footer 文案 */
function CustomTextDemo(): React.ReactElement {
  const { token } = useToken();
  const [count, setCount] = React.useState(6);
  const hasMore = count < 20;
  return (
    <View style={{ height: 260, border: `1px solid ${token.colorBorderSecondary}`, borderRadius: token.borderRadiusLG, overflow: 'hidden' }}>
      <InfiniteScroll
        hasMore={hasMore}
        loading={false}
        onLoadMore={() => setCount((c) => Math.min(20, c + 5))}
        loadingText="正在为你加载更多…"
        noMoreText="✓ 全部加载完毕"
        threshold={0.5}
      >
        {Array.from({ length: count }, (_, i) => (
          <Row key={i} text={`自定义文案条目 ${i + 1}`} index={i} />
        ))}
      </InfiniteScroll>
    </View>
  );
}

const DEMOS: DemoItem[] = [
  {
    name: '基础用法',
    desc: '滚近 footer 自动拉下一页（模拟 600ms 延迟），翻满 5 页落「没有更多」',
    node: <BasicDemo />,
    code: [
      'import { InfiniteScroll } from "react-native-flux-desktop";',
      '',
      '// 容器需有界高度；hasMore=false 时 footer 落「没有更多」',
      '<InfiniteScroll hasMore={hasMore} loading={loading} onLoadMore={loadMore}>',
      '  {titles.map((t, i) => <Row key={i} text={t} />)}',
      '</InfiniteScroll>',
    ].join('\n'),
  },
  {
    name: '失败与重试',
    desc: 'error 态 footer 显示错误文案 + 可点重试，重试成功后继续滚动加载',
    node: <ErrorDemo />,
    code: [
      '// error 态 footer 显错误文案 + 可点重试',
      '<InfiniteScroll',
      '  hasMore={hasMore}',
      '  loading={loading}',
      '  error={error}',
      '  onLoadMore={() => load(page + 1)}',
      '  onRetry={() => load(page)}',
      '>',
      '  {rows}',
      '</InfiniteScroll>',
    ].join('\n'),
  },
  {
    name: '自定义文案',
    desc: 'loadingText / noMoreText 全部可换，threshold 调触发灵敏度',
    node: <CustomTextDemo />,
    code: [
      '// loadingText / noMoreText 可换；threshold 调触发灵敏度',
      '<InfiniteScroll',
      '  hasMore={hasMore}',
      '  onLoadMore={loadMore}',
      '  loadingText="正在为你加载更多…"',
      '  noMoreText="✓ 全部加载完毕"',
      '  threshold={0.5}',
      '>',
      '  {rows}',
      '</InfiniteScroll>',
    ].join('\n'),
  },
];

const API: ApiRow[] = [
  { name: 'hasMore', desc: '是否还有下一页；false 时 footer 显示「没有更多」', type: 'boolean', default: '–' },
  { name: 'onLoadMore', desc: 'footer 接近视口底部时回调（一次接近只触发一次）', type: '() => void', default: '–' },
  { name: 'loading', desc: '加载中（footer 转圈）', type: 'boolean', default: 'false' },
  { name: 'error', desc: '上次加载失败，显示错误文案 + 重试', type: 'boolean', default: 'false' },
  { name: 'onRetry', desc: '点击「重试」回调', type: '() => void', default: '–' },
  { name: 'threshold', desc: '触发加载的剩余距离 / 视口高比例', type: 'number', default: '0.4' },
  { name: 'loadingText / noMoreText / errorText / retryText', desc: 'footer 四态文案', type: 'ReactNode', default: '内置中文' },
  { name: 'style / contentContainerStyle', desc: '滚动容器 / 内容容器样式（需给出有界高度）', type: 'ViewStyle', default: 'flex: 1' },
];

const TOKENS: TokenRow[] = [
  { name: 'fontSizeSM / colorTextTertiary', desc: 'footer 文案小字号与次要灰' },
  { name: 'colorPrimary', desc: '重试入口与转圈弧线着色' },
  { name: 'padding / marginXS', desc: 'footer 竖向留白与图标文字间距' },
];

export function InfiniteScrollDemo(): React.ReactElement {
  return <DemoPage demos={DEMOS} api={API} tokens={TOKENS} />;
}

export default InfiniteScrollDemo;
