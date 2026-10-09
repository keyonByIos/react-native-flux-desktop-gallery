// MESSAGE：全局浮层提示。对齐 antd v5 最新 hook 用法 —— message.useMessage() 返回 [api, contextHolder]，
// 把 contextHolder 就地渲染进组件（锚点加载）。本自绘栈无 portal，contextHolder 绝对定位铺满最近的
// relative 祖先（Stage），顶部居中堆叠多条、按 duration 自动消失。
import React from 'react';
import { message, Button, Space, View, Icon, useToken } from 'react-native-flux-desktop';
import { DemoPage, type DemoItem, type ApiRow, type TokenRow } from '../DemoPage';

/** 承载浮层提示的相对定位舞台：contextHolder 锚定到此容器顶部居中 */
function Stage(props: { children: React.ReactNode }): React.ReactElement {
  const { token } = useToken();
  return (
    <View
      style={{
        position: 'relative',
        minHeight: token.controlHeightLG * 3,
        padding: token.padding,
        borderRadius: token.borderRadiusLG,
        borderWidth: token.lineWidth,
        borderStyle: 'solid',
        borderColor: token.colorBorderSecondary,
        backgroundColor: token.colorFillQuaternary,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {props.children}
    </View>
  );
}

/** 基础用法：与 antd 文档同款 —— 一个按钮触发一条 info */
function BasicHook(): React.ReactElement {
  const [api, contextHolder] = message.useMessage();
  return (
    <Stage>
      {contextHolder}
      <Button type="primary" onClick={() => api.info('Hello, Flux!')}>
        Display normal message
      </Button>
    </Stage>
  );
}

/** 各类型 + 多条堆叠：不同 key 自动分配，同时触发即竖向堆叠 */
function TypesHook(): React.ReactElement {
  const [api, contextHolder] = message.useMessage();
  return (
    <Stage>
      {contextHolder}
      <Space size="small" wrap style={{ justifyContent: 'center' }}>
        <Button onClick={() => api.success('操作成功')}>成功</Button>
        <Button onClick={() => api.error('操作失败')}>失败</Button>
        <Button onClick={() => api.warning('请注意风险')}>警告</Button>
        <Button onClick={() => api.info('一条普通提示')}>信息</Button>
        <Button
          onClick={() => {
            api.success('第一条');
            api.info('第二条');
            api.warning('第三条');
          }}
        >
          连续三条（堆叠）
        </Button>
      </Space>
    </Stage>
  );
}

/** 加载→完成：同 key 二次 open 就地替换（loading 常驻，完成后转 success） */
function LoadingHook(): React.ReactElement {
  const [api, contextHolder] = message.useMessage();
  const run = (): void => {
    const key = api.loading('加载中…', 0);
    setTimeout(() => api.open({ key, content: '加载完成', type: 'success', duration: 2000 }), 1800);
  };
  return (
    <Stage>
      {contextHolder}
      <Button onClick={run}>点击：loading → success（同 key 替换）</Button>
    </Stage>
  );
}

/** 自定义图标：open 传 icon 覆盖类型默认图标 */
function CustomIconHook(): React.ReactElement {
  const [api, contextHolder] = message.useMessage();
  return (
    <Stage>
      {contextHolder}
      <Button
        onClick={() =>
          api.open({
            content: '感谢你的支持',
            icon: <Icon name="heart" size={18} color="#eb2f96" />,
          })
        }
      >
        自定义 heart 图标
      </Button>
    </Stage>
  );
}

/** 常驻与清空：duration=0 不自动消失，api.destroy() 一次性清空全部 */
function PersistentHook(): React.ReactElement {
  const [api, contextHolder] = message.useMessage();
  return (
    <Stage>
      {contextHolder}
      <Space size="small" wrap style={{ justifyContent: 'center' }}>
        <Button onClick={() => api.open({ content: '常驻提示（duration=0）', type: 'info', duration: 0 })}>常驻</Button>
        <Button onClick={() => api.destroy()}>清空全部</Button>
      </Space>
    </Stage>
  );
}

const DEMOS: DemoItem[] = [
  {
    name: '基础用法',
    desc: 'const [api, ctx] = message.useMessage()；渲染 {ctx} 后用 api.info(...)',
    node: <BasicHook />,
    code: [
      'import { message, Button } from "react-native-flux-desktop";',
      '',
      'function Demo() {',
      '  const [api, contextHolder] = message.useMessage();',
      '  return (',
      '    <View style={{ position: "relative" }}>',
      '      {contextHolder}  {/* 锚点：绝对定位铺满最近的 relative 祖先 */}',
      '      <Button type="primary" onClick={() => api.info("Hello, Flux!")}>',
      '        Display normal message',
      '      </Button>',
      '    </View>',
      '  );',
      '}',
    ].join('\n'),
  },
  {
    name: '各类提示',
    desc: 'api.success / error / warning / info / loading；连续触发自动竖向堆叠',
    node: <TypesHook />,
    code: [
      '// 类型快捷方法',
      'api.success("操作成功");',
      'api.error("操作失败");',
      'api.warning("请注意风险");',
      'api.info("一条普通提示");',
      '',
      '// 不同 key 自动分配 → 连续触发即竖向堆叠',
      'api.success("第一条"); api.info("第二条"); api.warning("第三条");',
    ].join('\n'),
  },
  {
    name: '加载→完成',
    desc: 'loading 传 duration=0 常驻，用同一 key 再 open 就地替换为 success',
    node: <LoadingHook />,
    code: [
      '// loading(duration=0) 常驻；拿返回的 key 再 open 同 key → 就地替换',
      'const run = () => {',
      '  const key = api.loading("加载中…", 0);',
      '  setTimeout(() => api.open({ key, content: "加载完成", type: "success", duration: 2000 }), 1800);',
      '};',
    ].join('\n'),
  },
  {
    name: '自定义图标',
    desc: 'api.open({ content, icon }) 覆盖类型默认图标',
    node: <CustomIconHook />,
    code: [
      'import { Icon } from "react-native-flux-desktop";',
      '',
      '// open 传 icon 覆盖默认类型图标',
      'api.open({',
      '  content: "感谢你的支持",',
      '  icon: <Icon name="heart" size={18} color="#eb2f96" />,',
      '});',
    ].join('\n'),
  },
  {
    name: '常驻与清空',
    desc: 'duration=0 不自动消失；api.destroy() 一次性清空消息栈',
    node: <PersistentHook />,
    code: [
      '// duration=0 常驻不自动消失',
      'api.open({ content: "常驻提示（duration=0）", type: "info", duration: 0 });',
      '// destroy() 一次性清空当前 holder 的全部消息',
      'api.destroy();',
    ].join('\n'),
  },
];

const API: ApiRow[] = [
  { name: 'message.useMessage()', desc: '返回 [messageApi, contextHolder]；把 contextHolder 渲染进组件即锚点加载', type: '() => [MessageApi, ReactElement]', default: '–' },
  { name: 'contextHolder', desc: '浮层挂载点（绝对定位铺满最近的 relative 祖先）', type: 'ReactNode', default: '–' },
  { name: 'api.open(config)', desc: '通用打开，返回该条 key', type: '(config: MessageConfig) => Key', default: '–' },
  { name: 'api.success / error / info / warning / loading', desc: '类型快捷方法：(content, duration?, onClose?) 或直接传 config', type: '(content, duration?, onClose?) => Key', default: '–' },
  { name: 'api.destroy()', desc: '清空当前 holder 的全部消息', type: '() => void', default: '–' },
  { name: 'config.content', desc: '提示内容', type: 'ReactNode', default: '–' },
  { name: 'config.type', desc: '提示类型（决定默认图标与配色）', type: "'success'|'error'|'info'|'warning'|'loading'", default: "'info'" },
  { name: 'config.icon', desc: '自定义图标（覆盖类型默认）', type: 'ReactNode', default: '–' },
  { name: 'config.duration', desc: '自动关闭延时（ms），0 常驻', type: 'number', default: '3000' },
  { name: 'config.key', desc: '唯一标识：同 key 再次触发就地替换而非新增', type: 'React.Key', default: '自动生成' },
];

const TOKENS: TokenRow[] = [
  { name: 'colorBgElevated', desc: '气泡底色', default: '浮层底色' },
  { name: 'colorSuccess', desc: 'success 图标色', default: '#52c41a' },
  { name: 'colorError', desc: 'error 图标色', default: '#ff4d4f' },
  { name: 'colorWarning', desc: 'warning 图标色', default: '#faad14' },
];

export function MessageDemo(): React.ReactElement {
  return <DemoPage demos={DEMOS} api={API} tokens={TOKENS} />;
}
