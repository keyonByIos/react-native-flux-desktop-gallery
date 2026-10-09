// TAG demo：DemoPage 多段式（预设色 / 无边框 / 自定义色 / 图标 / 可关闭 / CheckableTag）。
import React from 'react';
import { Tag, Space } from 'react-native-flux-desktop';
import { DemoPage, type DemoItem, type ApiRow, type TokenRow } from '../DemoPage';

/** 可关闭：本地维护可见列表 */
function ClosableDemo(): React.ReactElement {
  const [tags, setTags] = React.useState(['Tag 1', 'Tag 2', 'Tag 3']);
  return (
    <Space size="small" wrap>
      {tags.map((t) => (
        <Tag key={t} closable onClose={() => setTags(tags.filter((x) => x !== t))}>
          {t}
        </Tag>
      ))}
      {tags.length === 0 ? <Tag bordered={false}>已全部关闭</Tag> : null}
    </Space>
  );
}

/** CheckableTag 多选过滤 */
function CheckableDemo(): React.ReactElement {
  const [checked, setChecked] = React.useState<Record<string, boolean>>({ 技术: true, 生活: true });
  return (
    <Space size="small" wrap>
      {['技术', '生活', '科研', '英语', '数学'].map((t) => (
        <Tag.CheckableTag key={t} checked={!!checked[t]} onChange={(c) => setChecked((s) => ({ ...s, [t]: c }))}>
          {t}
        </Tag.CheckableTag>
      ))}
    </Space>
  );
}

const DEMOS: DemoItem[] = [
  {
    name: '预设色',
    desc: 'default / success / processing / error / warning 语义色',
    node: (
      <Space size="small" wrap>
        <Tag>default</Tag>
        <Tag color="success">success</Tag>
        <Tag color="processing">processing</Tag>
        <Tag color="error">error</Tag>
        <Tag color="warning">warning</Tag>
      </Space>
    ),
    code: [
      'import { Tag, Space } from "react-native-flux-desktop";',
      '',
      '// default / success / processing / error / warning 语义色',
      '<Space size="small" wrap>',
      '  <Tag>default</Tag>',
      '  <Tag color="success">success</Tag>',
      '  <Tag color="processing">processing</Tag>',
      '  <Tag color="error">error</Tag>',
      '  <Tag color="warning">warning</Tag>',
      '</Space>',
    ].join('\n'),
  },
  {
    name: '无边框',
    desc: 'bordered=false 仅保留底色',
    node: (
      <Space size="small" wrap>
        <Tag bordered={false}>borderless</Tag>
        <Tag bordered={false} color="success">success</Tag>
        <Tag bordered={false} color="error">error</Tag>
      </Space>
    ),
    code: [
      'import { Tag, Space } from "react-native-flux-desktop";',
      '',
      '// bordered=false 仅保留底色',
      '<Space size="small" wrap>',
      '  <Tag bordered={false}>borderless</Tag>',
      '  <Tag bordered={false} color="success">success</Tag>',
      '  <Tag bordered={false} color="error">error</Tag>',
      '</Space>',
    ].join('\n'),
  },
  {
    name: '自定义文字色',
    desc: '文字缺省对齐正文色；textColor 显式指定文字色',
    node: (
      <Space size="small" wrap>
        <Tag textColor="#eb2f96">Pink</Tag>
        <Tag textColor="#722ed1">Purple</Tag>
        <Tag textColor="#13c2c2">Cyan</Tag>
      </Space>
    ),
    code: [
      'import { Tag, Space } from "react-native-flux-desktop";',
      '',
      '// textColor 显式指定文字色',
      '<Space size="small" wrap>',
      '  <Tag textColor="#eb2f96">Pink</Tag>',
      '  <Tag textColor="#722ed1">Purple</Tag>',
      '  <Tag textColor="#13c2c2">Cyan</Tag>',
      '</Space>',
    ].join('\n'),
  },
  {
    name: '带图标',
    desc: 'icon 前置矢量图标',
    node: (
      <Space size="small" wrap>
        <Tag icon="check" color="success">通过</Tag>
        <Tag icon="clock" color="processing">进行中</Tag>
        <Tag icon="user">负责人</Tag>
        <Tag icon="star" color="warning">收藏</Tag>
      </Space>
    ),
    code: [
      'import { Tag, Space } from "react-native-flux-desktop";',
      '',
      '// icon 前置矢量图标',
      '<Space size="small" wrap>',
      '  <Tag icon="check" color="success">通过</Tag>',
      '  <Tag icon="clock" color="processing">进行中</Tag>',
      '  <Tag icon="user">负责人</Tag>',
      '  <Tag icon="star" color="warning">收藏</Tag>',
      '</Space>',
    ].join('\n'),
  },
  {
    name: '可关闭',
    desc: 'closable 显示关闭按钮，点击移除',
    node: <ClosableDemo />,
    code: [
      'import { Tag, Space } from "react-native-flux-desktop";',
      '',
      '// closable 显示关闭按钮，onClose 移除',
      '{tags.map((t) => (',
      '  <Tag key={t} closable onClose={() => setTags(tags.filter((x) => x !== t))}>',
      '    {t}',
      '  </Tag>',
      '))}',
    ].join('\n'),
  },
  {
    name: '可选中',
    desc: 'Tag.CheckableTag 点击切换选中（主色实底）',
    node: <CheckableDemo />,
    code: [
      'import { Tag, Space } from "react-native-flux-desktop";',
      '',
      '// Tag.CheckableTag 点击切换选中（主色实底）',
      '{types.map((t) => (',
      '  <Tag.CheckableTag key={t} checked={!!checked[t]} onChange={(c) => setChecked((s) => ({ ...s, [t]: c }))}>',
      '    {t}',
      '  </Tag.CheckableTag>',
      '))}',
    ].join('\n'),
  },
];

const API: ApiRow[] = [
  { name: 'color', desc: '预设语义色（控底/边）；文字色缺省对齐正文色', type: "TagPreset | string", default: "'default'" },
  { name: 'textColor', desc: '显式指定文字/图标色，缺省为 token.colorText', type: 'string', default: '–' },
  { name: 'bordered', desc: '是否显示边框', type: 'boolean', default: 'true' },
  { name: 'closable', desc: '是否可关闭', type: 'boolean', default: 'false' },
  { name: 'icon', desc: '前置图标', type: 'string | ReactNode', default: '–' },
  { name: 'onClose', desc: '关闭回调', type: '() => void', default: '–' },
  { name: 'onPress', desc: '点击回调', type: '() => void', default: '–' },
  { name: 'CheckableTag.checked', desc: '选中态', type: 'boolean', default: 'false' },
  { name: 'CheckableTag.onChange', desc: '选中变化', type: '(checked) => void', default: '–' },
];

const TOKENS: TokenRow[] = [
  { name: 'colorSuccessBg / Border / Text', desc: 'success 三件套', default: '语义派生' },
  { name: 'colorInfoBg / Border / Text', desc: 'processing 三件套', default: '语义派生' },
  { name: 'fontSizeSM', desc: '标签字号', default: '12' },
];

export function TagDemo(): React.ReactElement {
  return <DemoPage demos={DEMOS} api={API} tokens={TOKENS} />;
}
