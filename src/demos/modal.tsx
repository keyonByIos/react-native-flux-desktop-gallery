// MODAL demo：对齐 antd v5 hook 用法 —— `const [api, contextHolder] = modal.useModal()`，
// 把 contextHolder 就地渲染进相对定位舞台（本自绘栈无 portal，遮罩铺满最近的 relative 祖先），
// api.confirm/info/success/error/warning(config) 命令式弹框：onOk/onCancel 触发后自动关闭。
import React from 'react';
import { modal, Modal, Button, Space, View, Text, useToken } from 'react-native-flux-desktop';
import { DemoPage, type DemoItem, type ApiRow, type TokenRow } from '../DemoPage';

/** 承载对话框的相对定位舞台：contextHolder 的遮罩铺满此区域 */
function Stage(props: { children: React.ReactNode; height?: number }): React.ReactElement {
  const { token } = useToken();
  return (
    <View
      style={{
        position: 'relative',
        height: props.height ?? token.controlHeightLG * 8,
        borderRadius: token.borderRadiusLG,
        overflow: 'hidden',
        borderWidth: token.lineWidth,
        borderStyle: 'solid',
        borderColor: token.colorBorderSecondary,
        backgroundColor: token.colorFillQuaternary,
      }}
    >
      {props.children}
    </View>
  );
}

function Center(props: { children: React.ReactNode }): React.ReactElement {
  return (
    <View style={{ alignItems: 'center', justifyContent: 'center', height: '100%', gap: 8 }}>
      {props.children}
    </View>
  );
}

const content = '此对话框将执行不可逆的操作，是否继续？确定后系统会提交当前表单内容并锁定编辑。';

/** 基础确认框：api.confirm 带取消 + 确定，onOk 回调后自动关闭 */
function ConfirmHook(): React.ReactElement {
  const { token } = useToken();
  const [api, contextHolder] = modal.useModal();
  const [log, setLog] = React.useState('尚未操作');
  return (
    <Stage>
      {contextHolder}
      <Center>
        <Button
          type="primary"
          onClick={() =>
            api.confirm({
              title: '确认操作',
              content,
              okText: '确认',
              cancelText: '再想想',
              onOk: () => setLog('点击了确定'),
              onCancel: () => setLog('点击了取消'),
            })
          }
        >
          打开确认框
        </Button>
        <Text style={{ fontSize: 12, color: token.colorTextTertiary }}>{log}</Text>
      </Center>
    </Stage>
  );
}

/** 四种单按钮类型：info / success / error / warning（仅确定） */
function TypesHook(): React.ReactElement {
  const [api, contextHolder] = modal.useModal();
  return (
    <Stage>
      {contextHolder}
      <Center>
        <Space size="small" wrap style={{ justifyContent: 'center' }}>
          <Button onClick={() => api.info({ title: '提示', content: '一条普通信息对话框。' })}>info</Button>
          <Button onClick={() => api.success({ title: '完成', content: '操作已成功完成。' })}>success</Button>
          <Button onClick={() => api.error({ title: '出错', content: '操作未能完成，请重试。' })}>error</Button>
          <Button onClick={() => api.warning({ title: '警告', content: '此操作存在风险。' })}>warning</Button>
        </Space>
      </Center>
    </Stage>
  );
}

/** 危险操作：confirm + okDanger 确定按钮红色 */
function DangerHook(): React.ReactElement {
  const [api, contextHolder] = modal.useModal();
  return (
    <Stage>
      {contextHolder}
      <Center>
        <Button
          danger
          onClick={() =>
            api.confirm({
              title: '删除项目',
              content: '删除后不可恢复，确认删除该条目吗？',
              okText: '删除',
              okDanger: true,
            })
          }
        >
          危险确认框
        </Button>
      </Center>
    </Stage>
  );
}

/** 自定义底部：footer 传任意节点（需自行调用 api.destroy 关闭） */
function FooterHook(): React.ReactElement {
  const [api, contextHolder] = modal.useModal();
  return (
    <Stage>
      {contextHolder}
      <Center>
        <Button
          onClick={() =>
            api.open({
              key: 'custom-footer',
              title: '自定义底部',
              content,
              footer: (
                <Space>
                  <Button type="text" onClick={() => api.destroy('custom-footer')}>
                    稍后处理
                  </Button>
                  <Button type="primary" onClick={() => api.destroy('custom-footer')}>
                    立即查看
                  </Button>
                </Space>
              ),
            })
          }
        >
          自定义底部按钮
        </Button>
      </Center>
    </Stage>
  );
}

/** 不可点遮罩关闭 + 显示右上角 ×：maskClosable=false, closable=true */
function NoMaskCloseHook(): React.ReactElement {
  const [api, contextHolder] = modal.useModal();
  return (
    <Stage>
      {contextHolder}
      <Center>
        <Button
          onClick={() =>
            api.info({
              title: '需手动关闭',
              content: '点遮罩不关闭，只能右上角 × 或确定。',
              maskClosable: false,
              closable: true,
            })
          }
        >
          禁止遮罩关闭
        </Button>
      </Center>
    </Stage>
  );
}

/** 自定义宽度：width 覆盖默认尺寸 */
function WidthHook(): React.ReactElement {
  const [api, contextHolder] = modal.useModal();
  return (
    <Stage>
      {contextHolder}
      <Center>
        <Button onClick={() => api.info({ title: '宽对话框', content, width: 520 })}>宽度 520</Button>
      </Center>
    </Stage>
  );
}

/** 声明式用法（向后兼容）：<Modal open> 常驻于舞台内 */
function Declarative(): React.ReactElement {
  const [open, setOpen] = React.useState(true);
  return (
    <Stage>
      <Center>
        <Button onClick={() => setOpen(true)}>重新打开</Button>
      </Center>
      {open ? (
        <Modal open title="声明式对话框" okText="知道了" footer={false} onOk={() => setOpen(false)} onCancel={() => setOpen(false)}>
          {content}
        </Modal>
      ) : null}
    </Stage>
  );
}

const DEMOS: DemoItem[] = [
  {
    name: '基础确认框',
    desc: 'const [api, ctx] = modal.useModal()；api.confirm(config)，onOk/onCancel 后自动关闭',
    node: <ConfirmHook />,
    code: [
      'import { modal, Button } from "react-native-flux-desktop";',
      '',
      'function Demo() {',
      '  const [api, contextHolder] = modal.useModal();',
      '  return (',
      '    <View style={{ position: "relative" }}>',
      '      {contextHolder}',
      '      <Button',
      '        type="primary"',
      '        onClick={() =>',
      '          api.confirm({',
      '            title: "确认操作",',
      '            content: "此操作不可逆，是否继续？",',
      '            okText: "确认",',
      '            cancelText: "再想想",',
      '            onOk: () => {},',
      '            onCancel: () => {},',
      '          })',
      '        }',
      '      >',
      '        打开确认框',
      '      </Button>',
      '    </View>',
      '  );',
      '}',
    ].join('\n'),
  },
  {
    name: '四种类型',
    desc: 'api.info / success / error / warning —— 单确定按钮，带类型默认图标',
    node: <TypesHook />,
    code: [
      '// 单确定按钮，带类型默认图标',
      'api.info({ title: "提示", content: "一条普通信息对话框。" });',
      'api.success({ title: "完成", content: "操作已成功完成。" });',
      'api.error({ title: "出错", content: "操作未能完成，请重试。" });',
      'api.warning({ title: "警告", content: "此操作存在风险。" });',
    ].join('\n'),
  },
  {
    name: '危险操作',
    desc: 'confirm + okDanger：确定按钮转红',
    node: <DangerHook />,
    code: [
      '// okDanger：确定按钮转红',
      'api.confirm({',
      '  title: "删除项目",',
      '  content: "删除后不可恢复，确认删除该条目吗？",',
      '  okText: "删除",',
      '  okDanger: true,',
      '});',
    ].join('\n'),
  },
  {
    name: '自定义底部',
    desc: 'footer 传任意节点，需自行 api.destroy(key) 关闭',
    node: <FooterHook />,
    code: [
      '// footer 传任意节点；需自行 api.destroy(key) 关闭',
      'api.open({',
      '  key: "custom-footer",',
      '  title: "自定义底部",',
      '  content: "…",',
      '  footer: (',
      '    <Space>',
      '      <Button type="text" onClick={() => api.destroy("custom-footer")}>稍后处理</Button>',
      '      <Button type="primary" onClick={() => api.destroy("custom-footer")}>立即查看</Button>',
      '    </Space>',
      '  ),',
      '});',
    ].join('\n'),
  },
  {
    name: '禁止遮罩关闭',
    desc: 'maskClosable=false 去点遮罩关闭；closable=true 显示右上角 ×',
    node: <NoMaskCloseHook />,
    code: [
      '// maskClosable=false 禁点遮罩关闭；closable=true 显示右上角 ×',
      'api.info({',
      '  title: "需手动关闭",',
      '  content: "点遮罩不关闭，只能右上角 × 或确定。",',
      '  maskClosable: false,',
      '  closable: true,',
      '});',
    ].join('\n'),
  },
  {
    name: '自定义宽度',
    desc: 'width 覆盖默认（controlHeightLG×8）',
    node: <WidthHook />,
    code: ['// width 覆盖默认宽度', 'api.info({ title: "宽对话框", content: "…", width: 520 });'].join('\n'),
  },
  {
    name: '声明式用法',
    desc: '<Modal open> 常驻对话框（向后兼容）',
    node: <Declarative />,
    code: [
      '// 声明式：<Modal open> 常驻（向后兼容）',
      'const [open, setOpen] = React.useState(true);',
      '{open ? (',
      '  <Modal',
      '    open',
      '    title="声明式对话框"',
      '    okText="知道了"',
      '    footer={false}',
      '    onOk={() => setOpen(false)}',
      '    onCancel={() => setOpen(false)}',
      '  >',
      '    对话框正文',
      '  </Modal>',
      ') : null}',
    ].join('\n'),
  },
];

const API: ApiRow[] = [
  { name: 'modal.useModal()', desc: '返回 [api, contextHolder]；把 contextHolder 渲染进 relative 容器即锚点加载', type: '() => [ModalApi, ReactElement]', default: '–' },
  { name: 'contextHolder', desc: '浮层挂载点（遮罩铺满最近的 relative 祖先，多条按打开顺序叠放）', type: 'ReactNode', default: '–' },
  { name: 'api.confirm(config)', desc: '确认框：取消 + 确定双按钮', type: '(config: ModalConfig) => Key', default: '–' },
  { name: 'api.info / success / error / warning', desc: '单确定按钮，带类型默认图标', type: '(config) => Key', default: '–' },
  { name: 'api.open(config)', desc: '通用打开（type 缺省 confirm）', type: '(config: ModalConfig) => Key', default: '–' },
  { name: 'api.destroy(key?)', desc: '传 key 关单条，不传清空全部', type: '(key?) => void', default: '–' },
  { name: 'config.title / content', desc: '标题 / 正文', type: 'ReactNode', default: '–' },
  { name: 'config.okText / cancelText', desc: '按钮文案', type: 'ReactNode', default: '确定 / 取消' },
  { name: 'config.okType / okDanger', desc: '确定按钮类型 / 危险色', type: "ButtonType | boolean", default: "'primary' / false" },
  { name: 'config.onOk / onCancel', desc: '回调，触发后自动关闭', type: '() => void', default: '–' },
  { name: 'config.maskClosable / closable', desc: '点遮罩关闭 / 右上角 × ', type: 'boolean', default: 'true / false' },
  { name: 'config.width / footer', desc: '宽度 / 底部（false 隐藏）', type: 'number | ReactNode | false', default: '–' },
];

const TOKENS: TokenRow[] = [
  { name: 'colorBgElevated', desc: '面板底色', default: '浮层底色' },
  { name: 'colorBgMask', desc: '遮罩色', default: '半透明黑' },
  { name: 'borderRadiusLG', desc: '圆角', default: '8' },
  { name: 'paddingLG', desc: '内边距', default: '24' },
];

export function ModalDemo(): React.ReactElement {
  return <DemoPage demos={DEMOS} api={API} tokens={TOKENS} />;
}
