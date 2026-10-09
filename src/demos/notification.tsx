// NOTIFICATION：通知卡片。对齐 antd v5 hook 用法 —— `const [api, contextHolder] = notification.useNotification()`，
// 把 contextHolder 就地渲染进相对定位舞台（本自绘栈无 portal，锚到最近的 relative 祖先），
// api.open/success/error/warning/info(config) 命令式弹卡片：按 placement 停靠四角、多条竖向堆叠、duration 自动消失。
import React from 'react';
import { notification, Button, Space, View, Icon, useToken, type NotificationPlacement } from 'react-native-flux-desktop';
import { DemoPage, type DemoItem, type ApiRow, type TokenRow } from '../DemoPage';

/** 承载通知卡片的相对定位舞台：contextHolder 锚定到此容器的四角停靠 */
function Stage(props: { children: React.ReactNode; height?: number }): React.ReactElement {
  const { token } = useToken();
  return (
    <View
      style={{
        position: 'relative',
        height: props.height ?? token.controlHeightLG * 6,
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

/** 居中摆放触发按钮，卡片浮于四角 */
function Center(props: { children: React.ReactNode }): React.ReactElement {
  return (
    <View style={{ alignItems: 'center', justifyContent: 'center', height: '100%', gap: 8 }}>
      {props.children}
    </View>
  );
}

/** 基础用法：api.open 传 config（标题 + 描述） */
function BasicHook(): React.ReactElement {
  const [api, contextHolder] = notification.useNotification();
  return (
    <Stage>
      {contextHolder}
      <Center>
        <Button type="primary" onClick={() => api.open({ title: '通知标题', description: '这是一条通知的描述正文。' })}>
          打开通知
        </Button>
      </Center>
    </Stage>
  );
}

/** 四种类型：快捷方法 success/error/warning/info（首参收 config） */
function TypesHook(): React.ReactElement {
  const [api, contextHolder] = notification.useNotification();
  return (
    <Stage>
      {contextHolder}
      <Center>
        <Space size="small" wrap style={{ justifyContent: 'center' }}>
          <Button onClick={() => api.success({ title: '操作成功', description: '更改已保存到服务器。' })}>成功</Button>
          <Button onClick={() => api.error({ title: '提交失败', description: '请检查网络后重试。' })}>失败</Button>
          <Button onClick={() => api.warning({ title: '配额预警', description: '本月用量已达 90%。' })}>警告</Button>
          <Button onClick={() => api.info({ title: '系统通知', description: '将于今晚 02:00 维护。' })}>信息</Button>
        </Space>
      </Center>
    </Stage>
  );
}

/** 四个角落：config.placement 指定停靠角，同角多条自动竖向堆叠 */
function PlacementHook(): React.ReactElement {
  const [api, contextHolder] = notification.useNotification();
  const fire = (placement: NotificationPlacement): void => {
    api.open({ title: `placement=${placement}`, description: '卡片停靠到该角落。', placement });
  };
  return (
    <Stage>
      {contextHolder}
      <Center>
        <Space size="small" wrap style={{ justifyContent: 'center' }}>
          <Button onClick={() => fire('topLeft')}>topLeft</Button>
          <Button onClick={() => fire('topRight')}>topRight</Button>
          <Button onClick={() => fire('bottomLeft')}>bottomLeft</Button>
          <Button onClick={() => fire('bottomRight')}>bottomRight</Button>
        </Space>
      </Center>
    </Stage>
  );
}

/** 多条堆叠 + 清空：连续 open 分配不同 key，destroy() 一次清空 */
function StackHook(): React.ReactElement {
  const [api, contextHolder] = notification.useNotification();
  return (
    <Stage>
      {contextHolder}
      <Center>
        <Space size="small" wrap style={{ justifyContent: 'center' }}>
          <Button
            onClick={() => {
              api.success({ title: '第一条', description: '同角多条自动堆叠。' });
              api.info({ title: '第二条', description: '按打开顺序排列。' });
              api.warning({ title: '第三条', description: 'duration 后各自消失。' });
            }}
          >
            连续三条（堆叠）
          </Button>
          <Button danger onClick={() => api.destroy()}>
            清空全部
          </Button>
        </Space>
      </Center>
    </Stage>
  );
}

/** 带操作按钮：config.btn 底部操作区 */
function BtnHook(): React.ReactElement {
  const [api, contextHolder] = notification.useNotification();
  return (
    <Stage>
      {contextHolder}
      <Center>
        <Button
          onClick={() =>
            api.info({
              title: '发现新版本',
              description: 'v2.4.0 已发布，包含性能优化。',
              duration: 0,
              btn: (
                <Button type="primary" size="small" onClick={() => api.destroy()}>
                  立即更新
                </Button>
              ),
            })
          }
        >
          带操作按钮（常驻）
        </Button>
      </Center>
    </Stage>
  );
}

/** 自定义图标 / 关闭图标：config.icon 覆盖类型默认，closeIcon 覆盖 × */
function CustomIconHook(): React.ReactElement {
  const [api, contextHolder] = notification.useNotification();
  return (
    <Stage>
      {contextHolder}
      <Center>
        <Button
          onClick={() =>
            api.open({
              title: '感谢支持',
              description: '自定义左右图标。',
              icon: <Icon name="heart" size={20} color="#eb2f96" />,
              closeIcon: <Icon name="minus" size={16} color="#999" />,
            })
          }
        >
          自定义 heart 图标
        </Button>
      </Center>
    </Stage>
  );
}

/** 全局默认 + 同 key 替换：useNotification({placement,duration}) 定默认，同 key 再 open 就地更新 */
function OptionsHook(): React.ReactElement {
  const [api, contextHolder] = notification.useNotification({ placement: 'bottomRight', duration: 6000 });
  const run = (): void => {
    api.open({ key: 'progress', title: '下载中…', description: '0%' });
    let p = 0;
    const timer = setInterval(() => {
      p += 25;
      if (p >= 100) {
        clearInterval(timer);
        api.success({ key: 'progress', title: '下载完成', description: '100%' });
      } else {
        api.open({ key: 'progress', title: '下载中…', description: `${p}%` });
      }
    }, 700);
  };
  return (
    <Stage>
      {contextHolder}
      <Center>
        <Button onClick={run}>同 key 进度更新（右下 · 6s）</Button>
      </Center>
    </Stage>
  );
}

const DEMOS: DemoItem[] = [
  {
    name: '基础用法',
    desc: 'const [api, ctx] = notification.useNotification()；渲染 {ctx} 后用 api.open(config)',
    node: <BasicHook />,
    code: [
      'import { notification, Button } from "react-native-flux-desktop";',
      '',
      'function Demo() {',
      '  const [api, contextHolder] = notification.useNotification();',
      '  return (',
      '    <View style={{ position: "relative" }}>',
      '      {contextHolder}',
      '      <Button',
      '        type="primary"',
      '        onClick={() => api.open({ title: "通知标题", description: "这是一条通知的描述正文。" })}',
      '      >',
      '        打开通知',
      '      </Button>',
      '    </View>',
      '  );',
      '}',
    ].join('\n'),
  },
  {
    name: '四种类型',
    desc: 'api.success / error / warning / info，首参收 config（title + description）',
    node: <TypesHook />,
    code: [
      '// 类型快捷方法，首参收 config',
      'api.success({ title: "操作成功", description: "更改已保存到服务器。" });',
      'api.error({ title: "提交失败", description: "请检查网络后重试。" });',
      'api.warning({ title: "配额预警", description: "本月用量已达 90%。" });',
      'api.info({ title: "系统通知", description: "将于今晚 02:00 维护。" });',
    ].join('\n'),
  },
  {
    name: '四个角落',
    desc: 'config.placement 指定 topLeft / topRight / bottomLeft / bottomRight',
    node: <PlacementHook />,
    code: [
      '// placement 指定停靠角（默认 topRight）',
      'api.open({ title: "…", description: "…", placement: "topLeft" });',
      "api.open({ title: '…', placement: 'bottomRight' });",
    ].join('\n'),
  },
  {
    name: '多条堆叠与清空',
    desc: '连续 open 分配不同 key 同角堆叠；api.destroy() 一次清空',
    node: <StackHook />,
    code: [
      '// 不同 key 自动分配 → 同角多条竖向堆叠',
      'api.success({ title: "第一条", description: "同角多条自动堆叠。" });',
      'api.info({ title: "第二条", description: "按打开顺序排列。" });',
      '',
      '// api.destroy() 不传 key 清空全部',
      'api.destroy();',
    ].join('\n'),
  },
  {
    name: '带操作按钮',
    desc: 'config.btn 放底部操作区；duration=0 常驻',
    node: <BtnHook />,
    code: [
      '// btn 底部操作区；duration=0 常驻',
      'api.info({',
      '  title: "发现新版本",',
      '  description: "v2.4.0 已发布。",',
      '  duration: 0,',
      '  btn: <Button type="primary" size="small">立即更新</Button>,',
      '});',
    ].join('\n'),
  },
  {
    name: '自定义图标',
    desc: 'config.icon 覆盖类型默认图标，closeIcon 覆盖右上角 ×',
    node: <CustomIconHook />,
    code: [
      '// icon 覆盖类型默认图标，closeIcon 覆盖右上角 ×',
      'api.open({',
      '  title: "感谢支持",',
      '  description: "自定义左右图标。",',
      '  icon: <Icon name="heart" size={20} color="#eb2f96" />,',
      '  closeIcon: <Icon name="minus" size={16} color="#999" />,',
      '});',
    ].join('\n'),
  },
  {
    name: '全局默认 + 同 key 替换',
    desc: 'useNotification(options) 定默认；同 key 再 open 就地更新（进度条范式）',
    node: <OptionsHook />,
    code: [
      '// useNotification(options) 定全局默认',
      'const [api, ctx] = notification.useNotification({ placement: "bottomRight", duration: 6000 });',
      '',
      '// 同 key 再次 open 就地替换而非新增（进度条范式）',
      'api.open({ key: "progress", title: "下载中…", description: "0%" });',
      '// …定时推进…',
      'api.success({ key: "progress", title: "下载完成", description: "100%" });',
    ].join('\n'),
  },
];

const API: ApiRow[] = [
  { name: 'notification.useNotification()', desc: '返回 [api, contextHolder]；把 contextHolder 渲染进 relative 容器即锚点加载', type: '(options?) => [NotificationApi, ReactElement]', default: '–' },
  { name: 'contextHolder', desc: '浮层挂载点（按 placement 分四角停靠，铺满最近的 relative 祖先）', type: 'ReactNode', default: '–' },
  { name: 'api.open(config)', desc: '通用打开，返回该条 key', type: '(config: NotificationConfig) => Key', default: '–' },
  { name: 'api.success / error / info / warning', desc: '类型快捷方法：收 config，type 自动补', type: '(config) => Key', default: '–' },
  { name: 'api.destroy(key?)', desc: '传 key 关单条，不传清空全部', type: '(key?) => void', default: '–' },
  { name: 'config.title / description', desc: '标题行 / 描述正文', type: 'ReactNode', default: '–' },
  { name: 'config.placement', desc: '停靠角落（覆盖全局默认）', type: "'topRight'|'topLeft'|'bottomRight'|'bottomLeft'", default: "'topRight'" },
  { name: 'config.duration', desc: '自动关闭延时（ms），0 常驻', type: 'number', default: '4500' },
  { name: 'config.icon / closeIcon / btn', desc: '自定义图标 / 关闭图标 / 底部操作区', type: 'ReactNode', default: '–' },
  { name: 'config.key', desc: '唯一标识：同 key 再次 open 就地替换而非新增', type: 'React.Key', default: '自动生成' },
  { name: 'options（全局默认）', desc: 'placement / duration / top / bottom / maxCount', type: 'NotificationOptions', default: '–' },
];

const TOKENS: TokenRow[] = [
  { name: 'colorBgElevated', desc: '卡片底色', default: '浮层底色' },
  { name: 'colorSuccess', desc: 'success 强调色', default: '#52c41a' },
  { name: 'colorError', desc: 'error 强调色', default: '#ff4d4f' },
  { name: 'colorWarning', desc: 'warning 强调色', default: '#faad14' },
  { name: 'borderRadiusLG', desc: '圆角', default: '8' },
];

export function NotificationDemo(): React.ReactElement {
  return <DemoPage demos={DEMOS} api={API} tokens={TOKENS} />;
}
