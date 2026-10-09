// 开发 / 命令面板：⌘K 式模糊搜索 + ↑↓/Enter 键盘导航 + 命中高亮 + 分组，程序员工具类组件的入口形态。
// 演示聚焦编辑器风格命令集（含英文 keywords 别名），底部回执条显示最近一次选中的命令。
import React from 'react';
import { View, Text, type CommandItem } from 'react-native-flux-desktop';
import { CommandPalette } from 'react-native-flux-desktop-dev';
import { useToken } from 'react-native-flux-desktop';
import { DemoPage, type DemoItem, type ApiRow } from '../DemoPage';

// 命令集：分组 + 快捷键 hint + keywords（不参与显示，仅供模糊匹配）
const EDITOR_COMMANDS: CommandItem[] = [
  { id: 'open-file', group: '文件', label: 'Open File', hint: 'Ctrl+O', keywords: '打开文件 file open' },
  { id: 'save', group: '文件', label: 'Save', hint: 'Ctrl+S', keywords: '保存 save' },
  { id: 'save-all', group: '文件', label: 'Save All', hint: 'Ctrl+Shift+S', keywords: '全部保存 save all' },
  { id: 'close-tab', group: '文件', label: 'Close Tab', hint: 'Ctrl+W', keywords: '关闭标签 close tab' },
  { id: 'toggle-sidebar', group: '视图', label: 'Toggle Sidebar', hint: 'Ctrl+B', keywords: '侧边栏 sidebar toggle' },
  { id: 'toggle-terminal', group: '视图', label: 'Toggle Terminal', hint: 'Ctrl+`', keywords: '终端 terminal panel' },
  { id: 'zoom', group: '视图', label: 'Zen Mode', hint: '', keywords: '禅模式 focus zen' },
  { id: 'find', group: '编辑', label: 'Find', hint: 'Ctrl+F', keywords: '查找 find' },
  { id: 'replace', group: '编辑', label: 'Replace', hint: 'Ctrl+H', keywords: '替换 replace' },
  { id: 'format', group: '编辑', label: 'Format Document', hint: 'Shift+Alt+F', keywords: '格式化 format prettier' },
  { id: 'rename', group: '编辑', label: 'Rename Symbol', hint: 'F2', keywords: '重命名 rename symbol' },
  { id: 'goto-line', group: '导航', label: 'Go to Line', hint: 'Ctrl+G', keywords: '跳行 goto line' },
  { id: 'goto-symbol', group: '导航', label: 'Go to Symbol', hint: 'Ctrl+Shift+O', keywords: '符号 outline goto symbol' },
  { id: 'show-all', group: '导航', label: 'Show All Commands', hint: 'F1', keywords: '所有命令 commands palette' },
];

// 精简集：验证无分组时也不插小标题
const MINI_COMMANDS: CommandItem[] = [
  { id: 'copy', label: 'Copy Selection', hint: 'Ctrl+C' },
  { id: 'paste', label: 'Paste', hint: 'Ctrl+V' },
  { id: 'delete', label: 'Delete Line', hint: 'Ctrl+Shift+K' },
  { id: 'dup', label: 'Duplicate Line', hint: 'Shift+Alt+Down' },
];

/** demo 外层：铺满 + 底部回执条显示最近选中 */
function Block(props: { node: React.ReactNode }): React.ReactElement {
  return <View style={{ width: '100%' }}>{props.node}</View>;
}

function WithFeedback(props: { items: CommandItem[]; maxResults?: number }): React.ReactElement {
  const { token } = useToken();
  const [last, setLast] = React.useState<CommandItem | null>(null);
  return (
    <View style={{ width: '100%', gap: token.marginXS }}>
      <CommandPalette items={props.items} maxResults={props.maxResults} onSelect={setLast} />
      <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 4, minHeight: 20 }}>
        <Text style={{ fontSize: 12, color: token.colorTextTertiary }}>最近执行：</Text>
        <Text style={{ fontSize: 12, color: last ? token.colorSuccess : token.colorTextQuaternary, marginLeft: 4 }}>
          {last ? `${last.label}${last.hint ? ` (${last.hint})` : ''}` : '—（点击候选项或 Enter）'}
        </Text>
      </View>
    </View>
  );
}

const DEMOS: DemoItem[] = [
  {
    name: '命令面板（编辑器风格）',
    desc: '空查询显示全量 + 分组小标题；输入 "op" / "smb" / "终端" 体验 fzf 模糊打分与高亮；↑↓ 移动高亮、Enter 执行、Esc 清空',
    node: <Block node={<CommandPalette items={EDITOR_COMMANDS} autoFocus maxResults={10} />} />,
    code: [
      'import { CommandPalette, type CommandItem } from "react-native-flux-desktop";',
      '',
      '// 分组 + 快捷键 hint + keywords（仅供模糊匹配）',
      'const items: CommandItem[] = [',
      '  { id: \'save\', group: \'文件\', label: \'Save\', hint: \'Ctrl+S\', keywords: \'保存 save\' },',
      '  { id: \'find\', group: \'编辑\', label: \'Find\', hint: \'Ctrl+F\', keywords: \'查找 find\' },',
      '];',
      '<CommandPalette items={items} autoFocus maxResults={10} />',
    ].join('\n'),
  },
  {
    name: '带执行回执',
    desc: 'onSelect 回调把选中项抛给宿主（面板自身清空查询）；底部回执条显示最近一次执行',
    node: <WithFeedback items={MINI_COMMANDS} />,
    code: [
      'import { CommandPalette } from "react-native-flux-desktop";',
      '',
      '// onSelect 把选中项抛给宿主（执行后自动清空查询）',
      '<CommandPalette items={items} onSelect={(item) => run(item)} />',
    ].join('\n'),
  },
  {
    name: '限定候选数',
    desc: 'maxResults=3：只展示分数最高的前 3 条，适合弹出层空间受限的场景',
    node: <Block node={<CommandPalette items={EDITOR_COMMANDS} maxResults={3} placeholder="试试输入 save…" />} />,
    code: [
      'import { CommandPalette } from "react-native-flux-desktop";',
      '',
      '// maxResults 只展示分数最高的前 N 条',
      '<CommandPalette items={items} maxResults={3} placeholder="试试输入 save…" />',
    ].join('\n'),
  },
];

const API: ApiRow[] = [
  { name: 'items', desc: '命令集（id/label/hint/group/keywords）', type: 'CommandItem[]', default: '—' },
  { name: 'placeholder', desc: '输入框占位文案', type: 'string', default: "'输入命令…'" },
  { name: 'maxResults', desc: '最多展示候选数', type: 'number', default: '8' },
  { name: 'emptyText', desc: '有查询但零命中时的提示', type: 'string', default: "'无匹配命令'" },
  { name: 'autoFocus', desc: '挂载即聚焦输入框', type: 'boolean', default: 'false' },
  { name: 'onSelect', desc: '执行命令回调（执行后自动清空查询）', type: '(item) => void', default: '—' },
];

export function CommandPaletteDemo(): React.ReactElement {
  return <DemoPage demos={DEMOS} api={API} />;
}
