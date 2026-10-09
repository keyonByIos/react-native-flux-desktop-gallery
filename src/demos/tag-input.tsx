// TAG-INPUT：可编辑标签输入。DemoPage 多段式，覆盖 基础 / 受控 / 限数+去重 / 禁用 / 自定义分隔符。
import React from 'react';
import { TagInput, Text, View, useToken } from 'react-native-flux-desktop';
import { DemoPage, type DemoItem, type ApiRow, type TokenRow } from '../DemoPage';

/** 基础：非受控 */
function BasicDemo(): React.ReactElement {
  const { token } = useToken();
  const [count, setCount] = React.useState(2);
  return (
    <View>
      <TagInput defaultValue={['React', 'Desktop']} onChange={(t) => setCount(t.length)} />
      <Text style={{ marginTop: token.marginXS, fontSize: token.fontSizeSM, color: token.colorTextSecondary }}>
        当前 {count} 个标签，输入后回车或逗号添加
      </Text>
    </View>
  );
}

/** 受控模式 */
function ControlledDemo(): React.ReactElement {
  const { token } = useToken();
  const [tags, setTags] = React.useState<string[]>(['京', '沪', '穗'].map((s) => s + '出发'));
  return (
    <View>
      <TagInput value={tags} onChange={setTags} placeholder="城市名" />
      <Text style={{ marginTop: token.marginXS, fontSize: token.fontSizeSM, color: token.colorTextSecondary }}>
        {tags.length ? tags.join(' · ') : '(空)'} —— 受控，外部可读取全部标签
      </Text>
    </View>
  );
}

function MaxDemo(): React.ReactElement {
  const { token } = useToken();
  const [tags, setTags] = React.useState<string[]>(['唯一']);
  return (
    <View>
      <TagInput
        value={tags}
        onChange={setTags}
        max={4}
        allowDuplicate={false}
        placeholder="最多 4 个，重复自动忽略"
      />
      <Text style={{ marginTop: token.marginXS, fontSize: token.fontSizeSM, color: token.colorTextSecondary }}>
        已达上限时输入框自动隐藏
      </Text>
    </View>
  );
}

/** 禁用 */
function DisabledDemo(): React.ReactElement {
  return <TagInput defaultValue={['只读', '标签']} disabled />;
}

/** 自定义分隔符（空格） */
function SeparatorDemo(): React.ReactElement {
  return <TagInput separators={[' ', ';']} defaultValue={['分号分隔']} placeholder="空格或分号分隔" />;
}

const DEMOS: DemoItem[] = [
  {
    name: '基础用法',
    desc: '非受控，回车/逗号确认，点 × 移除',
    node: <BasicDemo />,
    code: [
      'import { TagInput } from "react-native-flux-desktop";',
      '',
      '// 非受控，回车/逗号确认，点 × 移除',
      '<TagInput defaultValue={[\'React\', \'Desktop\']} onChange={(t) => setCount(t.length)} />',
    ].join('\n'),
  },
  {
    name: '受控模式',
    desc: 'value + onChange，外部读取标签数组',
    node: <ControlledDemo />,
    code: [
      'import { TagInput } from "react-native-flux-desktop";',
      '',
      '// value + onChange，外部读取标签数组',
      'const [tags, setTags] = useState<string[]>([\'京出发\', \'沪出发\']);',
      '<TagInput value={tags} onChange={setTags} placeholder="城市名" />',
    ].join('\n'),
  },
  {
    name: '限数 + 去重',
    desc: 'max=4 + allowDuplicate=false',
    node: <MaxDemo />,
    code: [
      'import { TagInput } from "react-native-flux-desktop";',
      '',
      '// max 限数 + allowDuplicate=false 去重，达上限自动隐藏输入框',
      '<TagInput value={tags} onChange={setTags} max={4} allowDuplicate={false} placeholder="最多 4 个" />',
    ].join('\n'),
  },
  {
    name: '禁用',
    desc: 'disabled 隐藏输入框、标签不可删',
    node: <DisabledDemo />,
    code: [
      'import { TagInput } from "react-native-flux-desktop";',
      '',
      '// disabled 隐藏输入框、标签不可删',
      '<TagInput defaultValue={[\'只读\', \'标签\']} disabled />',
    ].join('\n'),
  },
  {
    name: '自定义分隔符',
    desc: "separators=[' ', ';']",
    node: <SeparatorDemo />,
    code: [
      'import { TagInput } from "react-native-flux-desktop";',
      '',
      '// separators 自定义输入时触发拆分的分隔符',
      '<TagInput separators={[\' \', \';\']} defaultValue={[\'分号分隔\']} placeholder="空格或分号分隔" />',
    ].join('\n'),
  },
];

const API: ApiRow[] = [
  { name: 'value / defaultValue', desc: '标签数组（受控/非受控）', type: 'string[]', default: '[]' },
  { name: 'onChange', desc: '标签变化回调', type: '(tags: string[]) => void', default: '–' },
  { name: 'max', desc: '最大标签数', type: 'number', default: '–' },
  { name: 'allowDuplicate', desc: '是否允许重复', type: 'boolean', default: 'false' },
  { name: 'separators', desc: '输入时触发拆分的分隔符', type: 'string[]', default: "['', '，']" },
  { name: 'placeholder', desc: '空态占位文案', type: 'string', default: "'输入后回车添加'" },
  { name: 'disabled', desc: '禁用', type: 'boolean', default: 'false' },
];

const TOKENS: TokenRow[] = [
  { name: 'controlHeight', desc: '容器最小高', default: '32' },
  { name: 'colorPrimary', desc: '聚焦边框色', default: '#3b82f6' },
  { name: 'marginXXS', desc: '标签间距', default: '4' },
];

export function TagInputDemo(): React.ReactElement {
  return <DemoPage demos={DEMOS} api={API} tokens={TOKENS} />;
}
