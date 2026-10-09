// IO / 文件保存器：点击唤原生「另存为」对话框 → 写盘。内容支持 文本 / JSON(懒生成) / 二进制 dataURL。
// 覆盖 基础文本 / JSON 懒函数 / dataURL(PNG) / 禁用。保存需真实弹系统对话框，抓帧只截静置态。
import React from 'react';
import { FileSaver, View, Text, useToken } from 'react-native-flux-desktop';
import { DemoPage, type DemoItem, type ApiRow, type TokenRow } from '../DemoPage';

/** 一段极简 1x1 透明 PNG 的 dataURL，演示二进制写盘 */
const PNG_DATAURL =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAC0lEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';

/** 基础：写一段文本到 .txt */
function TextDemo(): React.ReactElement {
  const { token } = useToken();
  const [path, setPath] = React.useState<string | null>(null);
  return (
    <View style={{ width: '100%', gap: token.marginXS }}>
      <FileSaver
        data={'你好， Flux！\n这是 FileSaver 写出的第一段文本。\n生成时间：' + new Date().toISOString()}
        filename='flux-note.txt'
        accept={['.txt']}
        title="保存文本"
        onSaved={setPath}
      />
      {path ? (
        <Text style={{ fontSize: token.fontSizeSM, color: token.colorTextTertiary }}>回调路径：{path}</Text>
      ) : null}
    </View>
  );
}

/** JSON：懒函数——点保存时才生成内容（适合大/贵数据） */
function JsonDemo(): React.ReactElement {
  return (
    <View style={{ width: '100%' }}>
      <FileSaver
        data={() => JSON.stringify({ name: 'flux', ts: Date.now(), items: [1, 2, 3], ok: true }, null, 2)}
        filename="flux-data.json"
        accept={['.json']}
        title="导出 JSON（点击时生成）"
      />
    </View>
  );
}

/** 二进制：写一个真实 PNG（dataURL 解码后按字节落盘） */
function BinaryDemo(): React.ReactElement {
  return (
    <View style={{ width: '100%' }}>
      <FileSaver data={PNG_DATAURL} filename="pixel.png" accept={['.png']} title="保存 1×1 PNG" />
    </View>
  );
}

const DEMOS: DemoItem[] = [
  {
    name: '基础文本',
    desc: 'string 内容，accept 限定 .txt，成功后回显路径',
    node: <TextDemo />,
    code: [
      'import { FileSaver } from "react-native-flux-desktop";',
      '',
      '// 点按钮唤原生「另存为」→ 写盘；onSaved 回传最终路径',
      "<FileSaver data='你好， Flux！\\n第一段文本。' filename='flux-note.txt' accept={['.txt']} title=\"保存文本\" onSaved={setPath} />",
    ].join('\n'),
  },
  {
    name: 'JSON（懒函数）',
    desc: 'data 传函数，点保存时才求值生成内容（适合大/贵数据）',
    node: <JsonDemo />,
    code: [
      'import { FileSaver } from "react-native-flux-desktop";',
      '',
      '// data 传函数：点保存时才求值生成内容（适合大/贵数据）',
      "<FileSaver data={() => JSON.stringify({ name: 'flux', ts: Date.now() }, null, 2)} filename='flux-data.json' accept={['.json']} />",
    ].join('\n'),
  },
  {
    name: '二进制 dataURL',
    desc: 'dataURL 自动解码为字节写盘（此处一张 1×1 PNG）',
    node: <BinaryDemo />,
    code: [
      'import { FileSaver } from "react-native-flux-desktop";',
      '',
      '// dataURL 自动解码为字节写盘',
      "const PNG_DATAURL = 'data:image/png;base64,iVBORw0KGgo...';",
      "<FileSaver data={PNG_DATAURL} filename='pixel.png' accept={['.png']} title=\"保存 1×1 PNG\" />",
    ].join('\n'),
  },
  {
    name: '禁用',
    desc: 'disabled：按钮置灰不可点',
    node: (
      <View style={{ width: '100%' }}>
        <FileSaver disabled data="不可保存" filename="x.txt" title="不可保存" />
      </View>
    ),
    code: [
      'import { FileSaver } from "react-native-flux-desktop";',
      '',
      '// disabled：按钮置灰不可点',
      '<FileSaver disabled data="不可保存" filename="x.txt" title="不可保存" />',
    ].join('\n'),
  },
];

const API: ApiRow[] = [
  { name: 'data', desc: '内容：string / Buffer / Uint8Array / dataURL，或返回它们的（异步）函数', type: 'SaveSource', default: '–' },
  { name: 'filename', desc: '默认文件名（含扩展名），对话框预填', type: 'string', default: '–' },
  { name: 'accept', desc: '扩展名过滤，决定对话框保存类型下拉', type: 'string[]', default: '–' },
  { name: 'title / dialogTitle', desc: '按钮 / 对话框文案', type: 'string', default: "'保存文件'" },
  { name: 'disabled', desc: '禁用', type: 'boolean', default: 'false' },
  { name: 'onSaved', desc: '保存成功回调（回传最终绝对路径）', type: '(path) => void', default: '–' },
];

const TOKENS: TokenRow[] = [
  { name: 'colorSuccess / colorError', desc: '保存成功 / 失败状态色', default: 'alias' },
  { name: 'colorTextTertiary', desc: '静置提示文字', default: 'alias' },
];

export function IoFileSaverDemo(): React.ReactElement {
  return <DemoPage demos={DEMOS} api={API} tokens={TOKENS} />;
}
