// MASONRY：瀑布流。统一走 DemoPage 三段式。用 Lorem Picsum 随机图做加载压力测试——
// 图未到时露 ImageBox 占位灰底，解码完成逐张“点亮”，可直观感受并发加载 + 重绘是否卡顿。
import React from 'react';
import { Masonry, ImageBox, type MasonryItem } from 'react-native-flux-desktop';
import { DemoPage, type DemoItem, type ApiRow, type TokenRow } from '../DemoPage';

/** 一组循环高度，制造错落感；seed 稳定，便于对比每次加载 */
const HEIGHTS = [160, 220, 180, 260, 200, 300, 240, 280, 150, 320];

function makeData(n: number, offset = 0): MasonryItem[] {
  return Array.from({ length: n }, (_, i) => {
    const height = HEIGHTS[(i + offset) % HEIGHTS.length];
    const seed = i + offset + 1;
    // 源图按列宽≈200 的宽高比请求，显示时 cover 裁切
    const src = `https://picsum.photos/seed/${seed}/320/${Math.round((320 * height) / 200)}`;
    return { key: seed, height, src, title: `#${seed}` };
  });
}

/** 基础：4 列纯图 */
function BasicDemo(): React.ReactElement {
  const data = makeData(48);
  return (
    <Masonry
      data={data}
      columns={4}
      gutter="small"
      renderItem={(it) => <ImageBox src={String(it.src)} width="100%" height="100%" radius={0} />}
    />
  );
}

/** 列数与间距：3 列 + 大间距 */
function ColumnsDemo(): React.ReactElement {
  const data = makeData(18, 100);
  return (
    <Masonry
      data={data}
      columns={3}
      gutter={[24, 24]}
      renderItem={(it) => <ImageBox src={String(it.src)} width="100%" height="100%" radius={0} />}
    />
  );
}

/** 带说明条：caption 压图 */
function CaptionDemo(): React.ReactElement {
  const data = makeData(12, 200);
  return (
    <Masonry
      data={data}
      columns={4}
      gutter="small"
      renderItem={(it) => (
        <ImageBox src={String(it.src)} width="100%" height="100%" radius={6} caption={String(it.title)} />
      )}
    />
  );
}

const DEMOS: DemoItem[] = [
  {
    name: '基础瀑布流',
    desc: '4 列 · 48 张随机图，最短列优先堆叠；感受并发解码 + 整场景重绘是否卡顿',
    node: <BasicDemo />,
    code: [
      'import { Masonry, ImageBox } from "react-native-flux-desktop";',
      '',
      '// data 每项含 height（分列依据）；renderItem 渲染单条',
      '<Masonry',
      '  data={items}            // [{ key, height, src }, ...]',
      '  columns={4}',
      '  gutter="small"',
      '  renderItem={(it) => <ImageBox src={it.src} width="100%" height="100%" radius={0} />}',
      '/>',
    ].join('\n'),
  },
  {
    name: '列数与间距',
    desc: 'columns 控列数，gutter 支持 [水平, 垂直]',
    node: <ColumnsDemo />,
    code: [
      '// columns 控列数；gutter 支持 [水平, 垂直]',
      '<Masonry data={items} columns={3} gutter={[24, 24]} renderItem={render} />',
    ].join('\n'),
  },
  {
    name: '带说明条',
    desc: 'renderItem 内自由组合（此处 ImageBox + caption）',
    node: <CaptionDemo />,
    code: [
      '// renderItem 内自由组合（此处 ImageBox + caption）',
      '<Masonry',
      '  data={items}',
      '  columns={4}',
      '  gutter="small"',
      '  renderItem={(it) => <ImageBox src={it.src} width="100%" height="100%" radius={6} caption={it.title} />}',
      '/>',
    ].join('\n'),
  },
];

const API: ApiRow[] = [
  { name: 'data', desc: '条目数组，每项需含 height（分列依据）', type: 'MasonryItem[]', default: '–' },
  { name: 'columns', desc: '列数', type: 'number', default: '4' },
  { name: 'gutter', desc: '间距，元组可分设横纵', type: 'number | 档 | [h, v]', default: "'middle'" },
  { name: 'renderItem', desc: '渲染单个条目（外层已按 height 定高）', type: '(item, index) => ReactNode', default: '–' },
  { name: 'item.height', desc: '条目高度 px，决定落入哪一列', type: 'number', default: '–' },
];

const TOKENS: TokenRow[] = [
  { name: 'marginLG / margin / marginSM', desc: 'gutter 命名档取值', default: '24 / 16 / 12' },
  { name: 'colorFillSecondary', desc: '图未加载时的占位底色（ImageBox）', default: '–' },
];

export function MasonryDemo(): React.ReactElement {
  return <DemoPage demos={DEMOS} api={API} tokens={TOKENS} />;
}
