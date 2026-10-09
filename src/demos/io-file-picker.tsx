// IO / 文件选择器：点击（原生对话框）+ 拖拽（OS 文件拖入窗口）双录入。
// 覆盖 基础拖拽 / 按钮形态 / 扩展名过滤 / 禁用。拖拽需从资源管理器把文件拖进本窗口。
import React from 'react';
import { FilePicker, View, Text, useToken } from 'react-native-flux-desktop';
import { DemoPage, type DemoItem, type ApiRow, type TokenRow } from '../DemoPage';

/** 基础：多选拖拽区，回显已选数量 */
function BasicDemo(): React.ReactElement {
  const { token } = useToken();
  const [files, setFiles] = React.useState<string[]>([]);
  return (
    <View style={{ width: '100%', gap: token.marginXS }}>
      <FilePicker
        multiple
        value={files}
        onChange={setFiles}
        title="点击选择文件，或拖拽到此处"
        hint="支持多选 · 可从资源管理器拖入"
      />
      <Text style={{ fontSize: token.fontSizeSM, color: token.colorTextSecondary }}>
        已选 {files.length} 个文件
      </Text>
    </View>
  );
}

/** 预置列表：展示文件名 + 大小 + 逐项移除（用仓库内真实文件，截图可见体积） */
function PrefillDemo(): React.ReactElement {
  const base = 'D:/project/react-native-flux/desktop-source';
  const [files, setFiles] = React.useState<string[]>([base + '/package.json', base + '/tsconfig.json']);
  return (
    <View style={{ width: '100%' }}>
      <FilePicker multiple variant="button" value={files} onChange={setFiles} title="选择文件" />
    </View>
  );
}

const DEMOS: DemoItem[] = [
  {
    name: '基础（拖拽区）',
    desc: 'multiple + 受控回显，点击或拖入均可',
    node: <BasicDemo />,
    code: [
      'import { FilePicker } from "react-native-flux-desktop";',
      '',
      '// multiple + 受控 value/onChange；点击或从资源管理器拖入',
      "const [files, setFiles] = React.useState<string[]>([]);",
      '<FilePicker',
      '  multiple',
      '  value={files}',
      '  onChange={setFiles}',
      '  title="点击选择文件，或拖拽到此处"',
      '  hint="支持多选"',
      '/>',
    ].join('\n'),
  },
  {
    name: '按钮形态',
    desc: 'variant="button"，紧凑触发 + 已选列表（含文件大小、逐项移除）',
    node: <PrefillDemo />,
    code: [
      'import { FilePicker } from "react-native-flux-desktop";',
      '',
      '// variant=button 紧凑触发，下方列已选文件',
      '<FilePicker multiple variant="button" value={files} onChange={setFiles} title="选择文件" />',
    ].join('\n'),
  },
  {
    name: '扩展名过滤',
    desc: 'accept 限定可选类型（对话框与拖拽落下均过滤）',
    node: (
      <View style={{ width: '100%' }}>
        <FilePicker accept={['.png', '.jpg', '.gif']} title="选择图片" hint="仅 png / jpg / gif" />
      </View>
    ),
    code: [
      'import { FilePicker } from "react-native-flux-desktop";',
      '',
      '// accept 限定扩展名，对话框与拖拽落下均过滤',
      '<FilePicker accept={[\'.png\', \'.jpg\', \'.gif\']} title="选择图片" hint="仅 png / jpg / gif" />',
    ].join('\n'),
  },
  {
    name: '禁用',
    desc: 'disabled：点击与拖拽均失效，列表只读',
    node: (
      <View style={{ width: '100%' }}>
        <FilePicker disabled defaultFiles={['D:/示例文档/report.pdf']} title="不可选择" />
      </View>
    ),
    code: [
      'import { FilePicker } from "react-native-flux-desktop";',
      '',
      '// disabled：点击与拖拽均失效，列表只读',
      '<FilePicker disabled defaultFiles={[\'D:/示例文档/report.pdf\']} title="不可选择" />',
    ].join('\n'),
  },
];

const API: ApiRow[] = [
  { name: 'value / defaultFiles', desc: '受控 / 非受控已选路径', type: 'string[]', default: '–' },
  { name: 'multiple', desc: '允许多选', type: 'boolean', default: 'false' },
  { name: 'accept', desc: '扩展名过滤，如 [".png"]', type: 'string[]', default: '–' },
  { name: 'variant', desc: '形态：拖拽区 / 按钮', type: "'drag' | 'button'", default: "'drag'" },
  { name: 'title / hint', desc: '主 / 副提示文案', type: 'string', default: '–' },
  { name: 'disabled', desc: '禁用', type: 'boolean', default: 'false' },
  { name: 'onChange', desc: '选中项变化（新增/移除/清空）', type: '(files) => void', default: '–' },
];

const TOKENS: TokenRow[] = [
  { name: 'colorBorder / colorPrimary', desc: '拖拽区静置 / 悬停高亮描边', default: 'alias' },
  { name: 'colorPrimaryBg / colorFillQuaternary', desc: '拖拽区高亮 / 静置底色', default: 'alias' },
  { name: 'borderRadiusLG', desc: '圆角', default: 'alias' },
];

export function IoFilePickerDemo(): React.ReactElement {
  return <DemoPage demos={DEMOS} api={API} tokens={TOKENS} />;
}
