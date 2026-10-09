// TEXTAREA：多行文本域。复用 Input 的键盘/IME/剪贴板/右键菜单链路，在此之上做二维光标编辑：
// Enter 换行（antd 默认，Shift+Enter 同样换行）；上下键按可视行移动并保留首选列；软换行折行逐行显示。
// 长按/拖选跨行选区、Ctrl/Cmd+A/C/X/V、右键菜单（剪切/复制/粘贴/全选/清空）均可用。
import React from 'react';
import { TextArea, View, Text, useToken } from 'react-native-flux-desktop';
import { DemoPage, type DemoItem, type ApiRow, type TokenRow } from '../DemoPage';

/** 受控：value + onChange 回显字数 */
function ControlledDemo(): React.ReactElement {
  const { token } = useToken();
  const [v, setV] = React.useState('第一行\n第二行：受控多行文本\n第三行');
  return (
    <View style={{ gap: token.marginXS }}>
      <TextArea value={v} onChange={setV} rows={4} style={{ width: 360 }} placeholder="受控多行输入" />
      <Text style={{ fontSize: token.fontSizeSM, color: token.colorTextSecondary }}>共 {v.split('\n').length} 段 / {v.length} 字</Text>
    </View>
  );
}

const DEMOS: DemoItem[] = [
  {
    name: '受控',
    desc: 'value + onChange 双向；快速连打不丢字（本地镜像 + 回灌识别）',
    node: <ControlledDemo />,
    code: [
      'import { TextArea } from "react-native-flux-desktop";',
      '',
      '// 受控：value + onChange 双向；快速连打不丢字',
      'const [v, setV] = React.useState("");',
      '<TextArea value={v} onChange={setV} rows={4} style={{ width: 360 }} />',
    ].join('\n'),
  },
  {
    name: '基础',
    desc: 'rows 决定初始行数；Enter 换行，点框聚焦后直接敲键盘',
    node: (
      <View style={{ gap: 16 }}>
        <TextArea placeholder="请输入内容（Enter 换行）" rows={3} style={{ width: 360 }} />
        <TextArea defaultValue={'预填两行\n第二行文本'} rows={3} style={{ width: 360 }} />
      </View>
    ),
    code: [
      '// rows 决定初始行数；Enter 换行（Shift+Enter 同）',
      '<TextArea placeholder="请输入内容（Enter 换行）" rows={3} style={{ width: 360 }} />',
      '<TextArea defaultValue={"预填两行\\n第二行文本"} rows={3} style={{ width: 360 }} />',
    ].join('\n'),
  },
  {
    name: '自适应高度',
    desc: 'autoSize 随内容增高；{minRows,maxRows} 钳制区间，超出后内部滚动',
    node: (
      <View style={{ gap: 16 }}>
        <TextArea autoSize placeholder="autoSize：从一行开始随内容增高" style={{ width: 360 }} />
        <TextArea autoSize={{ minRows: 2, maxRows: 4 }} defaultValue={'minRows:2, maxRows:4\n试着敲 Enter 增加行数\n超过 4 行后内部滚动'} style={{ width: 360 }} />
      </View>
    ),
    code: [
      '// autoSize 随内容增高；{minRows,maxRows} 钳制区间，超出后内部滚动',
      '<TextArea autoSize placeholder="autoSize：从一行开始随内容增高" style={{ width: 360 }} />',
      '<TextArea autoSize={{ minRows: 2, maxRows: 4 }} style={{ width: 360 }} />',
    ].join('\n'),
  },
  {
    name: '字数统计 / 上限',
    desc: 'showCount 右下角计数；maxLength 限制码点数（超出即红）',
    node: (
      <View style={{ gap: 16 }}>
        <TextArea showCount rows={3} style={{ width: 360 }} placeholder="实时统计字数" />
        <TextArea showCount maxLength={50} defaultValue="最多 50 个字符，输入超出会被截断。" rows={3} style={{ width: 360 }} />
      </View>
    ),
    code: [
      '// showCount 右下角计数；maxLength 限制码点数（超出即红）',
      '<TextArea showCount rows={3} style={{ width: 360 }} placeholder="实时统计字数" />',
      '<TextArea showCount maxLength={50} rows={3} style={{ width: 360 }} />',
    ].join('\n'),
  },
  {
    name: '状态',
    desc: 'status 校验描边 / allowClear 清除 / disabled / readOnly',
    node: (
      <View style={{ gap: 16 }}>
        <TextArea status="error" defaultValue="error 状态" rows={2} style={{ width: 360 }} />
        <TextArea allowClear defaultValue="聚焦后有值时右上角显示 ✕" rows={2} style={{ width: 360 }} />
        <View style={{ flexDirection: 'row', gap: 16 }}>
          <TextArea disabled defaultValue="disabled" rows={2} style={{ width: 170 }} />
          <TextArea readOnly defaultValue="read-only" rows={2} style={{ width: 170 }} />
        </View>
      </View>
    ),
    code: [
      '// status 校验描边 / allowClear 清除 / disabled / readOnly',
      '<TextArea status="error" defaultValue="error 状态" rows={2} style={{ width: 360 }} />',
      '<TextArea allowClear rows={2} style={{ width: 360 }} />',
      '<TextArea disabled rows={2} style={{ width: 170 }} />',
      '<TextArea readOnly rows={2} style={{ width: 170 }} />',
    ].join('\n'),
  },
  {
    name: '选区与剪贴板',
    desc: '鼠标拖选跨行 / Ctrl+A 全选 / C 复制 / X 剪切 / V 粘贴 / 右键上下文菜单',
    node: <TextArea rows={4} style={{ width: 420 }} placeholder={'在这段里拖动鼠标跨行选择，或全选后按 Ctrl+C 复制，右键弹菜单，Ctrl+V 粘贴多行文本'} />,
    code: [
      '// 选区与剪贴板：拖选跨行 / Ctrl+A 全选 / C 复制 / X 剪切 / V 粘贴 / 右键菜单',
      '<TextArea rows={4} style={{ width: 420 }} placeholder="在这段里拖动鼠标跨行选择" />',
    ].join('\n'),
  },
];

const API: ApiRow[] = [
  { name: 'value / defaultValue', desc: '受控 / 非受控文本', type: 'string', default: '–' },
  { name: 'placeholder', desc: '空占位文字', type: 'string', default: '–' },
  { name: 'rows', desc: '固定显示行数（非 autoSize）', type: 'number', default: '3' },
  { name: 'autoSize', desc: '随内容增高 / 行数区间', type: "boolean | {minRows,maxRows}", default: 'false' },
  { name: 'showCount', desc: '右下角字数统计', type: 'boolean', default: 'false' },
  { name: 'maxLength', desc: '最大字符数（码点）', type: 'number', default: '–' },
  { name: 'allowClear', desc: '聚焦有值时显示清除', type: 'boolean', default: 'false' },
  { name: 'status', desc: '校验状态', type: "'error' | 'warning'", default: '–' },
  { name: 'disabled / readOnly', desc: '禁用 / 只读', type: 'boolean', default: 'false' },
  { name: 'onChange', desc: '文本变化', type: '(v: string) => void', default: '–' },
];

const TOKENS: TokenRow[] = [
  { name: 'fontSize / lineHeight', desc: '正文与行高（决定每可视行高）', default: '14 / 1.5714' },
  { name: 'paddingSM', desc: '内容内边距', default: '12' },
  { name: 'colorPrimary', desc: '聚焦态描边', default: '主色' },
  { name: 'colorPrimaryBg', desc: '选区底色', default: '主色浅底' },
];

export function TextAreaDemo(): React.ReactElement {
  return <DemoPage demos={DEMOS} api={API} tokens={TOKENS} />;
}
