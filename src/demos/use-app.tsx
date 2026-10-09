// 全局调用 App.useApp()：antd v5 风格 —— <App> 包裹主窗后，任意后代组件用
// `const { message, modal, notification } = App.useApp()` 拿命令式句柄，无需各自再写
// useMessage()/useNotification() 与渲染 contextHolder。三个 holder 已由 <App> 统一渲染，
// 浮层就地锚到最近的 relative 祖先（= 窗口内容根），故消息顶部居中、通知停靠角落、对话框居中覆盖整窗。
import React from 'react';
import { App, Button, Space, View, Text, Icon, useToken } from 'react-native-flux-desktop';
import { DemoPage, type DemoItem, type ApiRow, type TokenRow } from '../DemoPage';

/** 基础：三类型快捷方法，一行代码即弹 */
function BasicGlobal(): React.ReactElement {
  const { message, modal, notification } = App.useApp();
  return (
    <Space size="small" wrap>
      <Button type="primary" onClick={() => message.success('操作成功（message）')}>
        message.success
      </Button>
      <Button onClick={() => notification.info({ title: ' Flux 通知', description: '无需 contextHolder，全局句柄直接弹出' })}>
        notification.info
      </Button>
      <Button
        onClick={() =>
          modal.confirm({
            title: '确认删除？',
            content: '删除后不可恢复，是否继续？',
            okText: '删除',
            okDanger: true,
            onOk: () => message.warning('已删除'),
          })
        }
      >
        modal.confirm
      </Button>
    </Space>
  );
}

/** message 全类型：快捷方法首参可为 content 字符串，或直接传 config 对象 */
function MessageTypes(): React.ReactElement {
  const { message } = App.useApp();
  return (
    <Space size="small" wrap>
      <Button onClick={() => message.success('成功')}>success</Button>
      <Button onClick={() => message.error('失败')}>error</Button>
      <Button onClick={() => message.warning('警告')}>warning</Button>
      <Button onClick={() => message.info('信息')}>info</Button>
      <Button
        onClick={() =>
          message.open({ content: '自定义 heart 图标', icon: <Icon name="heart" size={18} color="#eb2f96" /> })
        }
      >
        自定义图标
      </Button>
    </Space>
  );
}

/** notification 四角停靠：placement 逐条指定，多条自动堆叠 */
function NotificationPlacements(): React.ReactElement {
  const { notification } = App.useApp();
  const fire = (placement: 'topLeft' | 'topRight' | 'bottomLeft' | 'bottomRight'): void => {
    notification.success({
      title: `${placement}`,
      description: '停靠到该角落，多条竖向堆叠，按 duration 自动消失',
      placement,
      duration: 3000,
    });
  };
  return (
    <Space size="small" wrap>
      <Button onClick={() => fire('topLeft')}>topLeft</Button>
      <Button onClick={() => fire('topRight')}>topRight</Button>
      <Button onClick={() => fire('bottomLeft')}>bottomLeft</Button>
      <Button onClick={() => fire('bottomRight')}>bottomRight</Button>
    </Space>
  );
}

/** modal 各类型：confirm 带取消，info/success/error/warning 单按钮 */
function ModalTypes(): React.ReactElement {
  const { modal } = App.useApp();
  return (
    <Space size="small" wrap>
      <Button onClick={() => modal.info({ title: '提示', content: '一条普通信息对话框' })}>info</Button>
      <Button onClick={() => modal.success({ title: '完成', content: '操作已成功完成' })}>success</Button>
      <Button onClick={() => modal.error({ title: '出错', content: '操作未能完成，请重试' })}>error</Button>
      <Button onClick={() => modal.warning({ title: '警告', content: '此操作存在风险' })}>warning</Button>
      <Button
        danger
        onClick={() =>
          modal.confirm({
            title: '危险操作',
            content: '确定要执行吗？',
            okText: '确定',
            okDanger: true,
            onOk: () => {},
          })
        }
      >
        confirm（危险）
      </Button>
    </Space>
  );
}

/** loading → 完成：message 同 key 替换，演示命令式句柄复用 */
function LoadingFlow(): React.ReactElement {
  const { message } = App.useApp();
  const run = (): void => {
    const key = message.loading('提交中…', 0);
    setTimeout(() => message.open({ key, content: '提交完成', type: 'success', duration: 2000 }), 1600);
  };
  return <Button onClick={run}>点击：loading → success（同 key 替换）</Button>;
}

/** 说明：句柄来自 Context，无需在组件内渲染 holder */
function ContextNote(): React.ReactElement {
  const { token } = useToken();
  return (
    <View style={{ padding: token.padding, borderRadius: token.borderRadiusLG, backgroundColor: token.colorFillQuaternary }}>
      <Text style={{ color: token.colorTextSecondary, fontSize: token.fontSize, lineHeight: token.lineHeight * token.fontSize }}>
        本页所有浮层都由入口处的 &lt;App&gt; 统一挂载 holder；子组件只需 App.useApp() 取句柄，无需各自 useMessage() 并渲染 contextHolder。
      </Text>
    </View>
  );
}

const DEMOS: DemoItem[] = [
  {
    name: '全局句柄概览',
    desc: 'App.useApp() 取 message / modal / notification，一行即弹（浮层锚到窗口内容根）',
    node: <ContextNote />,
    code: [
      '// 入口处用 <App> 包裹主窗（统一挂载 holder）',
      '<App>',
      '  <MyPage />',
      '</App>',
      '',
      '// 任意后代组件直接取句柄，无需各自 useMessage()',
      'function MyPage() {',
      '  const { message, modal, notification } = App.useApp();',
      '  return <Button onClick={() => message.success("操作成功")}>点我</Button>;',
      '}',
    ].join('\n'),
  },
  {
    name: '三类型并排',
    desc: '分别触发 message.success / notification.info / modal.confirm',
    node: <BasicGlobal />,
    code: [
      'const { message, modal, notification } = App.useApp();',
      '',
      "message.success('操作成功（message）');",
      "notification.info({ title: ' Flux 通知', description: '无需 contextHolder。' });",
      'modal.confirm({',
      '  title: "确认删除？",',
      '  content: "删除后不可恢复。",',
      '  okDanger: true,',
      '  onOk: () => message.warning("已删除"),',
      '});',
    ].join('\n'),
  },
  {
    name: 'message 全类型',
    desc: '快捷方法首参传 content 字符串，或直接传 config（自定义 icon）',
    node: <MessageTypes />,
    code: [
      "message.success('成功'); message.error('失败'); message.warning('警告'); message.info('信息');",
      '',
      '// 或直接传 config（自定义 icon）',
      'message.open({ content: "自定义 heart 图标", icon: <Icon name="heart" size={18} color="#eb2f96" /> });',
    ].join('\n'),
  },
  {
    name: 'notification 四角',
    desc: 'config.placement 指定 topLeft/topRight/bottomLeft/bottomRight，多条堆叠',
    node: <NotificationPlacements />,
    code: [
      '// placement 逐条指定停靠角，多条自动堆叠',
      'notification.success({',
      '  title: "topLeft",',
      '  description: "停靠到该角落。",',
      '  placement: "topLeft",',
      '  duration: 3000,',
      '});',
    ].join('\n'),
  },
  {
    name: 'modal 各类型',
    desc: 'info / success / error / warning 单按钮，confirm 带取消 + okDanger',
    node: <ModalTypes />,
    code: [
      "modal.info({ title: '提示', content: '一条普通信息对话框' });",
      "modal.success({ title: '完成', content: '操作已成功完成' });",
      "modal.error({ title: '出错', content: '操作未能完成' });",
      "modal.warning({ title: '警告', content: '此操作存在风险' });",
      'modal.confirm({ title: "危险操作", content: "确定要执行吗？", okDanger: true });',
    ].join('\n'),
  },
  {
    name: 'loading → 完成',
    desc: 'message.loading 常驻，用同一 key 再 open 就地替换为 success',
    node: <LoadingFlow />,
    code: [
      '// loading 常驻（duration=0），同 key 再 open 就地替换',
      "const key = message.loading('提交中…', 0);",
      'setTimeout(() => {',
      '  message.open({ key, content: "提交完成", type: "success", duration: 2000 });',
      '}, 1600);',
    ].join('\n'),
  },
];

const API: ApiRow[] = [
  { name: '<App> props', desc: '包裹组件；message / notification / modal 传全局默认（component 暂不实现）', type: '(props: AppProps) => ReactElement', default: '–' },
  { name: 'App.useApp()', desc: '读取最近 <App> 提供的三个命令式句柄；必须在 <App> 内调用', type: '() => { message, modal, notification }', default: '–' },
  { name: 'message.success(content)', desc: '类型快捷方法 success/error/info/warning/loading：收 content 或 config', type: '(content|config, ...) => Key', default: '–' },
  { name: 'notification.open(config)', desc: '四类型快捷方法皆收 config：title / description / placement / duration / btn', type: '(config: NotificationConfig) => Key', default: '–' },
  { name: 'modal.confirm(config)', desc: '命令式对话框：title / content / okText / cancelText / onOk / onCancel / okDanger', type: '(config: ModalConfig) => Key', default: '–' },
  { name: '*.destroy(key?)', desc: '关单条或不传清空；message.destroy() 清空全部消息', type: '(key?) => void', default: '–' },
];

const TOKENS: TokenRow[] = [
  { name: 'colorBgElevated', desc: 'message / notification 卡片底色', default: '浮层底色' },
  { name: 'colorSuccess / colorError / colorWarning / colorInfo', desc: '类型图标主色', default: '语义色' },
  { name: 'zIndex（message 1080 / modal 1000）', desc: '浮层绘制层级，painter 两趟提升', default: '–' },
];

export function UseAppDemo(): React.ReactElement {
  return <DemoPage demos={DEMOS} api={API} tokens={TOKENS} />;
}
