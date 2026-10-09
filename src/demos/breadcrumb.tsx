// BREADCRUMB：面包屑。统一走 DemoPage 多段式，覆盖 antd v5 items / separator / itemRender / params。
import React from 'react';
import { Breadcrumb, Text, View, useToken } from 'react-native-flux-desktop';
import type { BreadcrumbItem } from 'react-native-flux-desktop';
import { DemoPage, type DemoItem, type ApiRow, type TokenRow } from '../DemoPage';

const noop = (): void => {};

/** itemRender：把每一项渲染成主色胶囊，并用 params 拼出路径提示 */
function ItemRenderDemo(): React.ReactElement {
  const { token } = useToken();
  const items: BreadcrumbItem[] = [
    { title: '首页', onClick: noop },
    { title: '组件库', onClick: noop },
    { title: 'Breadcrumb' },
  ];
  return (
    <Breadcrumb
      items={items}
      params={{ base: 'flux' }}
      itemRender={(item, params, all, index) => {
        const last = index === all.length - 1;
        return (
          <View
            style={{
              paddingHorizontal: token.paddingXS,
              paddingVertical: token.paddingXXS,
              borderRadius: token.borderRadiusSM,
              backgroundColor: last ? 'transparent' : token.colorPrimaryBg,
            }}
          >
            <Text style={{ fontSize: token.fontSize, color: !last ? token.colorText : token.colorPrimary }}>
              {params.base}/{String(item.title)}
            </Text>
          </View>
        );
      }}
    />
  );
}

const DEMOS: DemoItem[] = [
  {
    name: '基础面包屑',
    desc: '末项为当前页（colorText、不可点），其余可点、按压高亮主色',
    node: (
      <Breadcrumb
        items={[{ title: '首页', onClick: noop }, { title: '组件库', onClick: noop }, { title: 'Breadcrumb' }]}
      />
    ),
    code: [
      'import { Breadcrumb } from "react-native-flux-desktop";',
      '',
      '// items 数组，末项为当前页（不可点）；传 onClick/href 即视为可点',
      "<Breadcrumb",
      "  items={[",
      "    { title: '首页', onClick: () => {} },",
      "    { title: '组件库', onClick: () => {} },",
      "    { title: 'Breadcrumb' },",
      '  ]}',
      '/>',
    ].join('\n'),
  },
  {
    name: '自定义分隔符',
    desc: 'separator 换全局分隔符；item.separator 单项覆盖',
    node: (
      <Breadcrumb
        separator=">"
        items={[
          { title: '一级', onClick: noop },
          { title: '二级', onClick: noop, separator: '★' },
          { title: '三级', onClick: noop },
          { title: '当前页' },
        ]}
      />
    ),
    code: [
      "// separator 换全局分隔符；item.separator 单项覆盖",
      '<Breadcrumb',
      '  separator=">"',
      '  items={[',
      "    { title: '一级', onClick: noop },",
      "    { title: '二级', onClick: noop, separator: '★' },",
      "    { title: '三级', onClick: noop },",
      "    { title: '当前页' },",
      '  ]}',
      '/>',
    ].join('\n'),
  },
  {
    name: 'itemRender 自定义渲染',
    desc: 'itemRender + params：每项渲染成主色胶囊并拼出路径',
    node: <ItemRenderDemo />,
    code: [
      '// itemRender + params：自定义每项渲染',
      '<Breadcrumb',
      '  items={items}',
      "  params={{ base: 'flux' }}",
      '  itemRender={(item, params, all, index) => {',
      '    const last = index === all.length - 1;',
      '    return <Text>{params.base}/{item.title}</Text>;',
      '  }}',
      '/>',
    ].join('\n'),
  },
  {
    name: '长路径自动换行',
    desc: '层级过多时 flexWrap 换行，不溢出容器',
    node: (
      <Breadcrumb
        style={{ maxWidth: 360 }}
        items={[
          { title: '根目录', onClick: noop },
          { title: 'src', onClick: noop },
          { title: 'ui', onClick: noop },
          { title: 'breadcrumb', onClick: noop },
          { title: 'components', onClick: noop },
          { title: 'index.tsx' },
        ]}
      />
    ),
    code: [
      '// 层级过多时 flexWrap 自动换行（约束 maxWidth 不溢出容器）',
      '<Breadcrumb',
      '  style={{ maxWidth: 360 }}',
      '  items={[',
      "    { title: '根目录', onClick: noop },",
      "    { title: 'src', onClick: noop },",
      "    { title: 'ui', onClick: noop },",
      "    { title: 'index.tsx' },",
      '  ]}',
      '/>',
    ].join('\n'),
  },
];

const API: ApiRow[] = [
  { name: 'items', desc: '面包屑项数组（末项为当前页）', type: 'BreadcrumbItem[]', default: '–' },
  { name: 'item.title', desc: '节点内容，可放图标 + 文本', type: 'ReactNode', default: '–' },
  { name: 'item.href / onClick', desc: '传入即视为可点', type: 'string / () => void', default: '–' },
  { name: 'item.separator', desc: '单项覆盖全局分隔符', type: 'ReactNode', default: '–' },
  { name: 'separator', desc: '全局分隔符', type: 'ReactNode', default: "'/'" },
  { name: 'itemRender', desc: '自定义每项渲染', type: '(item, params, items, i) => ReactNode', default: '–' },
  { name: 'params', desc: '透传给 itemRender 的参数', type: 'Record<string,string>', default: '{}' },
];

const TOKENS: TokenRow[] = [
  { name: 'colorText', desc: '当前页（末项）文字', default: '–' },
  { name: 'colorTextSecondary', desc: '可点项默认文字', default: '–' },
  { name: 'colorPrimary', desc: '可点项按压高亮', default: '#1677ff' },
  { name: 'colorTextQuaternary', desc: '分隔符', default: '–' },
];

export function BreadcrumbDemo(): React.ReactElement {
  return <DemoPage demos={DEMOS} api={API} tokens={TOKENS} />;
}
