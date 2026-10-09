// UPLOAD：文件上传拖拽区。DemoPage 多段式，覆盖 基础 / 文件列表 / 限制数量+类型 / 禁用。
import React from 'react';
import { Upload, Button, Text, View, useToken, type UploadFile } from 'react-native-flux-desktop';
import { DemoPage, type DemoItem, type ApiRow, type TokenRow } from '../DemoPage';

/** 模拟文件数据 */
const MOCK_FILES: UploadFile[] = [
  { uid: '1', name: 'report-2024-Q3.pdf', size: 2458000 },
  { uid: '2', name: 'screenshot.png', size: 384200 },
  { uid: '3', name: 'data-export.csv', size: 15600 },
];

/** 基础：空拖拽区 */
function BasicDemo(): React.ReactElement {
  return <Upload />;
}

/** 预置文件列表 */
function WithFilesDemo(): React.ReactElement {
  const { token } = useToken();
  const [files, setFiles] = React.useState<UploadFile[]>(MOCK_FILES);
  return (
    <View>
      <Upload fileList={files} onChange={(info) => setFiles(info.fileList)} />
      <Text style={{ marginTop: token.marginXS, fontSize: token.fontSizeSM, color: token.colorTextSecondary }}>
        当前 {files.length} 个文件
      </Text>
    </View>
  );
}

/** 限制数量 + 类型 */
function LimitedDemo(): React.ReactElement {
  const [files, setFiles] = React.useState<UploadFile[]>([]);
  return (
    <View>
      <Upload
        fileList={files}
        onChange={(info) => setFiles(info.fileList)}
        maxCount={3}
        accept={['.png', '.jpg', '.gif']}
        hint="最多 3 张图片"
      />
      <View style={{ flexDirection: 'row', marginTop: token_margin(), gap: 8 }}>
        <Button type="primary" size="small" onPress={() => setFiles([...files, { uid: `sim-${Date.now()}`, name: `photo-${files.length + 1}.jpg`, size: 102400 }])}>
          模拟添加
        </Button>
      </View>
    </View>
  );
}
function token_margin() { return 8; }

/** 禁用 */
function DisabledDemo(): React.ReactElement {
  return <Upload disabled defaultFileList={[{ uid: 'd1', name: 'locked-file.xlsx', size: 50000 }]} />;
}

const DEMOS: DemoItem[] = [
  {
    name: '基础',
    desc: '空拖拽区，点击/拖入选文件',
    node: <BasicDemo />,
    code: [
      'import { Upload } from "react-native-flux-desktop";',
      '',
      '// 空拖拽区，点击 / 拖入选文件',
      '<Upload />',
    ].join('\n'),
  },
  {
    name: '预置列表',
    desc: 'defaultFileList 回显 + 移除',
    node: <WithFilesDemo />,
    code: [
      'import { Upload, type UploadFile } from "react-native-flux-desktop";',
      '',
      '// fileList 受控 + onChange 回写；可预置文件',
      "const MOCK: UploadFile[] = [{ uid: '1', name: 'report.pdf', size: 2458000 }];",
      'const [files, setFiles] = React.useState<UploadFile[]>(MOCK);',
      '<Upload fileList={files} onChange={(info) => setFiles(info.fileList)} />',
    ].join('\n'),
  },
  {
    name: '限制数量+类型',
    desc: 'maxCount=3 / accept 图片格式',
    node: <LimitedDemo />,
    code: [
      'import { Upload } from "react-native-flux-desktop";',
      '',
      '// maxCount 限制数量；accept 限定扩展名；hint 提示文案',
      '<Upload',
      '  fileList={files}',
      '  onChange={(info) => setFiles(info.fileList)}',
      '  maxCount={3}',
      '  accept={[\'.png\', \'.jpg\', \'.gif\']}',
      '  hint="最多 3 张图片"',
      '/>',
    ].join('\n'),
  },
  {
    name: '禁用',
    desc: 'disabled 灰色不可交互',
    node: <DisabledDemo />,
    code: [
      'import { Upload } from "react-native-flux-desktop";',
      '',
      '// disabled 灰色不可交互',
      '<Upload disabled defaultFileList={[{ uid: \'d1\', name: \'locked-file.xlsx\', size: 50000 }]} />',
    ].join('\n'),
  },
];

const API: ApiRow[] = [
  { name: 'fileList', desc: '受控文件列表', type: 'UploadFile[]', default: '–' },
  { name: 'defaultFileList', desc: '初始文件列表', type: 'UploadFile[]', default: '[]' },
  { name: 'onChange', desc: '列表变化回调', type: '(info) => void', default: '–' },
  { name: 'maxCount', desc: '最大文件数', type: 'number', default: '–' },
  { name: 'accept', desc: '允许的扩展名', type: 'string[]', default: '–' },
  { name: 'disabled', desc: '禁用', type: 'boolean', default: 'false' },
  { name: 'hint', desc: '拖拽区提示文案', type: 'ReactNode', default: '–' },
];

const TOKENS: TokenRow[] = [
  { name: 'colorBorder', desc: '虚线框色', default: '–' },
  { name: 'colorPrimary', desc: '拖入高亮/图标色', default: '#3b82f6' },
  { name: 'colorFillQuaternary', desc: '文件行底色', default: '–' },
];

export function UploadDemo(): React.ReactElement {
  return <DemoPage demos={DEMOS} api={API} tokens={TOKENS} />;
}
