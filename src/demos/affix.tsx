// AFFIX：滚动钉顶。DemoPage 多段式，覆盖 基础钉顶 / offset 下移 / 钉住状态回调。
// 交互提示：本栈无全局滚动监听，沿用 BackTop 管线——外层 ScrollView onScroll 把偏移喂给 scrollY。
import React from 'react';
import { Affix, Button, ScrollView, Space, Text, View, useToken } from 'react-native-flux-desktop';
import { DemoPage, type DemoItem, type ApiRow, type TokenRow } from '../DemoPage';

/** 长内容填充块 */
function Block({ i, h = 56 }: { i: number; h?: number }): React.ReactElement {
  const { token } = useToken();
  return (
    <View
      style={{
        height: h,
        marginBottom: 8,
        borderRadius: token.borderRadius,
        backgroundColor: i % 2 ? token.colorFillQuaternary : token.colorFillTertiary,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Text style={{ fontSize: token.fontSizeSM, color: token.colorTextTertiary }}>内容块 {i + 1}</Text>
    </View>
  );
}

/** 钉顶演示：内滚容器 + 顶部 Affix 工具条（「滚一下」按钮受控推偏移，验证钉住态） */
function AffixDemoBox(props: { offset?: boolean; onFlag?: (v: boolean) => void; pinBtn?: boolean }): React.ReactElement {
  const { token } = useToken();
  const [sy, setSy] = React.useState(0);
  const [seed, setSeed] = React.useState<number | undefined>(undefined);
  // 受控 scrollY 变更不会触发 onScroll（host 只在滚轮路径报），故推偏移时同步直改 sy
  const push = (v: number): void => {
    setSy(v);
    setSeed(v);
  };
  return (
    <View style={{ maxWidth: 520 }}>
      <ScrollViewLike sy={sy} setSy={setSy} seed={seed}>
        <Affix offset={props.offset ? 24 : 0} scrollY={sy} onAffix={props.onFlag}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingVertical: token.paddingXS,
              paddingHorizontal: token.paddingSM,
            }}
          >
            <Text style={{ fontSize: token.fontSize, fontWeight: '600', color: token.colorText }}>
              {props.offset ? 'offset=24 钉在视口顶下 24px' : '我是工具条，滚过顶边就钉住'}
            </Text>
            <Space size={8}>
              {props.pinBtn ? (
                <Button size="small" onPress={() => push(200)}>
                  滚一下
                </Button>
              ) : null}
              <Button size="small" type="primary">
                操作
              </Button>
              <Button size="small">另存</Button>
            </Space>
          </View>
        </Affix>
        {Array.from({ length: 12 }, (_, i) => (
          <Block key={i} i={i} />
        ))}
      </ScrollViewLike>
    </View>
  );
}

// 局部内滚容器（滚动偏移喂回 Affix；seed 短暂受控推一段偏移后释放，见受控 scrollY 复位坑）
function ScrollViewLike(props: {
  sy: number;
  setSy: (v: number) => void;
  seed?: number;
  children: React.ReactNode;
}): React.ReactElement {
  const { token } = useToken();
  const [controlled, setControlled] = React.useState(true);
  React.useEffect(() => {
    if (props.seed === undefined) return;
    setControlled(true);
    const t = setTimeout(() => setControlled(false), 300);
    return () => clearTimeout(t);
  }, [props.seed]);
  return (
    <ScrollView
      style={{
        height: 300,
        borderWidth: token.lineWidth,
        borderColor: token.colorBorderSecondary,
        borderRadius: token.borderRadiusLG,
      }}
      scrollY={controlled ? props.seed : undefined}
      onScroll={(e): void => props.setSy(e.nativeEvent.contentOffset.y)}
    >
      {props.children}
    </ScrollView>
  );
}

/** 带状态文字演示：onAffix 点亮提示 */
function FlagDemo(): React.ReactElement {
  const { token } = useToken();
  const [flag, setFlag] = React.useState(false);
  return (
    <View>
      <Text style={{ fontSize: token.fontSizeSM, color: flag ? token.colorPrimary : token.colorTextSecondary }}>
        {flag ? '● 已钉住' : '○ 未钉住'}
      </Text>
      <View style={{ marginTop: token.marginXS }}>
        <AffixDemoBox onFlag={setFlag} />
      </View>
    </View>
  );
}

const DEMOS: DemoItem[] = [
  {
    name: '基础',
    desc: '内滚容器里向下滚，工具条到达顶边后钉住（背景+投影浮于内容上）',
    node: <AffixDemoBox />,
    code: [
      'import { Affix, ScrollView } from "react-native-flux-desktop";',
      '',
      '// 外层 ScrollView onScroll 把偏移喂给 scrollY；滚过顶边即钉住',
      '<ScrollView onScroll={(e) => setSy(e.nativeEvent.contentOffset.y)}>',
      '  <Affix scrollY={sy}>',
      '    <Toolbar />',
      '  </Affix>',
      '  {contentBlocks}',
      '</ScrollView>',
    ].join('\n'),
  },
  {
    name: 'offset',
    desc: 'offset=24 钉在视口顶下方 24px 处；点工具条「滚一下」受控推偏移验证钉住态',
    node: <AffixDemoBox offset pinBtn />,
    code: [
      'import { Affix } from "react-native-flux-desktop";',
      '',
      '// offset=24 钉在视口顶下方 24px 处',
      '<Affix offset={24} scrollY={sy}>',
      '  <Toolbar />',
      '</Affix>',
    ].join('\n'),
  },
  {
    name: 'onAffix 回调',
    desc: '钉住状态变化回传，可联动外部 UI',
    node: <FlagDemo />,
    code: [
      'import { Affix } from "react-native-flux-desktop";',
      '',
      '// onAffix 回传钉住状态，可联动外部 UI',
      '<Affix scrollY={sy} onAffix={(affixed) => setFlag(affixed)}>',
      '  <Toolbar />',
      '</Affix>',
    ].join('\n'),
  },
];

const API: ApiRow[] = [
  { name: 'offset', desc: '钉住时距容器顶距离', type: 'number', default: '0' },
  { name: 'scrollY', desc: '外层 ScrollView 当前偏移（onScroll 喂入）', type: 'number', default: '0' },
  { name: 'onAffix', desc: '钉住状态变化回调', type: '(affixed: boolean) => void', default: '–' },
];

const TOKENS: TokenRow[] = [
  { name: 'colorBgContainer', desc: '钉住浮层底', default: '容器背景' },
  { name: 'borderRadius', desc: '浮层圆角', default: '4' },
];

export function AffixDemo(): React.ReactElement {
  return <DemoPage demos={DEMOS} api={API} tokens={TOKENS} />;
}
