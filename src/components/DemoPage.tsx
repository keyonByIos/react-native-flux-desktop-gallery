// Demo 通用容器：仿 antd 组件文档页结构 ——
//   demo 区：文本标题在上、组件模块在下，不给 demo 区域加背景显色（暗色下贴近纯黑页底，避免灰块突兀）；
//   API / Token：文档表（首列参数名·token 变量加粗不着色）。
// 整体偏紧凑，页面留白交由 Gallery 控制。
import React from 'react';
import { View, Text, useToken, Icon, Pressable } from 'react-native-flux-desktop';
import { CodeBlock } from 'react-native-flux-desktop-dev';

export interface DemoItem {
  /** demo 小标题 */
  name: string;
  /** demo 说明（一句话） */
  desc?: string;
  /** 实时组件 */
  node: React.ReactNode;
  /** 关键示例代码（点标题行代码图标 → 在右侧抽屉展示；无抽屉上下文时就地内联展开）；不填则不显示代码入口 */
  code?: string;
  /** 代码语言（缺省 tsx），交给 CodeBlock 高亮 */
  codeLanguage?: string;
}

export interface ApiRow {
  name: string;
  desc: string;
  type: string;
  default?: string;
}

export interface TokenRow {
  name: string;
  desc: string;
  default?: string;
}

export interface DemoPageProps {
  /** 页首大标题（Gallery 顶部固定栏已展示组件名时，可省略以免重复） */
  title?: string;
  desc?: string;
  demos: DemoItem[];
  api?: ApiRow[];
  tokens?: TokenRow[];
}

/** 一个可锚定的章节：id + 标题 + 在滚动内容中的 Y 偏移（px） */
export interface DemoSection {
  id: string;
  title: string;
  y: number;
}

/** DemoPage → Shell 的锚点注册通道：DemoPage 测得各段偏移后回传，Shell 渲染右侧 Anchor 目录 */
export interface DemoNavCtx {
  register: (sections: DemoSection[]) => void;
}

export const DemoNavContext = React.createContext<DemoNavCtx | null>(null);

/** DemoPage → Shell 的代码抽屉通道：DemoCard 点代码图标时，请求在右侧抽屉里展示该 demo 的代码。
 *  （无 portal：抽屉须渲染在全窗 relative 祖先里，故由 Shell 根提供，而非 DemoPage 自身。） */
export interface CodeDrawerApi {
  openCode: (d: { title: string; code: string; language?: string }) => void;
}
export const CodeDrawerContext = React.createContext<CodeDrawerApi | null>(null);

/** 段标题：左侧主色竖条 + 标题 */
function SectionTitle(props: { children: React.ReactNode }): React.ReactElement {
  const { token } = useToken();
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', marginVertical: token.marginSM }}>
      <View
        style={{
          width: 3,
          height: token.fontSizeLG,
          borderRadius: 2,
          backgroundColor: token.colorPrimary,
          marginRight: token.marginXS,
        }}
      />
      <Text style={{ fontSize: token.fontSizeLG, fontWeight: '600', color: token.colorText }}>
        {props.children}
      </Text>
    </View>
  );
}

/** 单个 demo：标题行最左侧放代码图标（与标题垂直居中、只留符号），点击在右侧抽屉展示代码；无抽屉上下文时回退为就地内联展开 */
function DemoCard(props: { item: DemoItem }): React.ReactElement {
  const { token } = useToken();
  const { item } = props;
  const drawer = React.useContext(CodeDrawerContext);
  const [inlineOpen, setInlineOpen] = React.useState(false);
  const hasCode = typeof item.code === 'string' && item.code.length > 0;
  const onCode = (): void => {
    if (drawer) {
      drawer.openCode({ title: item.name, code: item.code as string, language: item.codeLanguage || 'tsx' });
    } else {
      setInlineOpen((v) => !v); // 回退：不在 Shell 下（无抽屉上下文）时就地展开
    }
  };
  return (
    <View style={{ marginBottom: token.marginLG }}>
      <View style={{ marginBottom: token.marginXS }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: token.marginXXS }}>
          <Text style={{ fontSize: token.fontSize, fontWeight: '600', color: token.colorText }}>
            {item.name}
          </Text>
          {hasCode ? (
            <Pressable
              onPress={onCode}
              style={{ cursor: 'pointer', flexDirection: 'row', alignItems: 'center', paddingVertical: 2, paddingRight: token.paddingXXS }}
            >
              <Icon name="code" size={16} color={token.colorTextSecondary} />
            </Pressable>
          ) : null}
        </View>
        {item.desc ? (
          <Text style={{ fontSize: token.fontSize, color: token.colorTextSecondary, marginTop: 2 }}>
            {item.desc}
          </Text>
        ) : null}
      </View>
      <View>{item.node}</View>
      {hasCode && !drawer && inlineOpen ? (
        <View style={{ marginTop: token.marginXS }}>
          <CodeBlock
            code={item.code as string}
            language={item.codeLanguage || 'tsx'}
            showLineNumbers
            fontSize={12.5}
          />
        </View>
      ) : null}
    </View>
  );
}

/** 通用表格：给定列宽（百分比）与行数据，斑马纹 + 表头底色 */
function DocTable(props: {
  cols: { label: string; flex: number }[];
  rows: string[][];
}): React.ReactElement {
  const { token } = useToken();
  const { cols, rows } = props;
  const cell = (text: string, i: number, head?: boolean): React.ReactElement => (
    <View key={i} style={{ flex: cols[i].flex, paddingRight: token.paddingXS }}>
      <Text
        style={{
          fontSize: token.fontSize,
          fontWeight: head || i === 0 ? '600' : '400',
          color: head || i === 0 ? token.colorText : token.colorTextSecondary,
        }}
      >
        {text}
      </Text>
    </View>
  );
  return (
    <View
      style={{
        borderWidth: token.lineWidth,
        borderColor: token.colorBorderSecondary,
        borderRadius: token.borderRadiusLG,
        overflow: 'hidden',
      }}
    >
      {/* 表头 */}
      <View
        style={{
          flexDirection: 'row',
          paddingVertical: token.paddingXS,
          paddingHorizontal: token.paddingSM,
          backgroundColor: token.colorFillQuaternary,
        }}
      >
        {cols.map((c, i) => cell(c.label, i, true))}
      </View>
      {rows.map((r, ri) => (
        <View
          key={ri}
          style={{
            flexDirection: 'row',
            paddingVertical: token.paddingXS,
            paddingHorizontal: token.paddingSM,
            borderTopWidth: token.lineWidth,
            borderColor: token.colorBorderSecondary,
            backgroundColor: ri % 2 === 1 ? token.colorFillQuaternary : 'transparent',
          }}
        >
          {r.map((c, ci) => cell(c, ci))}
        </View>
      ))}
    </View>
  );
}

export function DemoPage(props: DemoPageProps): React.ReactElement {
  const { token } = useToken();
  const nav = React.useContext(DemoNavContext);
  const { title, desc, demos, api, tokens } = props;

  // 各段 Y 偏移（相对本页内容容器）；onLayout 测得后回传 Shell，用于右侧锚点跳转与联动高亮
  const offs = React.useRef<Record<string, number>>({});
  const meta = React.useMemo(() => {
    const m: { id: string; title: string }[] = demos.map((d, i) => ({ id: `d${i}`, title: d.name }));
    if (api && api.length) m.push({ id: 'api', title: 'API' });
    if (tokens && tokens.length) m.push({ id: 'tokens', title: '主题变量（Token）' });
    return m;
  }, [demos, api, tokens]);

  const report = React.useCallback(() => {
    if (!nav) return;
    nav.register(meta.map((m) => ({ id: m.id, title: m.title, y: offs.current[m.id] ?? 0 })));
  }, [nav, meta]);

  const measure = React.useCallback(
    (id: string) => (e: { nativeEvent: { layout: { y: number } } }) => {
      offs.current[id] = e.nativeEvent.layout.y;
      report();
    },
    [report]
  );

  return (
    <View style={{ maxWidth: 860 }}>
      {/* 页首：组件名 + 简介（可选，顶部栏已展示时省略） */}
      {title ? (
        <Text style={{ fontSize: token.fontSizeXL, fontWeight: '600', color: token.colorText }}>
          {title}
        </Text>
      ) : null}
      {desc ? (
        <Text style={{ fontSize: token.fontSize, color: token.colorTextSecondary, marginTop: token.marginXS, lineHeight: token.lineHeight * token.fontSize }}>
          {desc}
        </Text>
      ) : null}
      {title || desc ? <View style={{ height: token.marginSM }} /> : null}

      {/* 上：代码演示（不单独列“代码演示”段标题，demo 本身即标题在上） */}
      {demos.map((d, i) => (
        <View key={i} onLayout={measure(`d${i}`)}>
          <DemoCard item={d} />
        </View>
      ))}

      {/* 中：API */}
      {api && api.length ? (
        <View onLayout={measure('api')}>
          <SectionTitle>API</SectionTitle>
          <DocTable
            cols={[
              { label: '参数', flex: 2.2 },
              { label: '说明', flex: 3.4 },
              { label: '类型', flex: 2.6 },
              { label: '默认值', flex: 1.8 },
            ]}
            rows={api.map((r) => [r.name, r.desc, r.type, r.default ?? '–'])}
          />
        </View>
      ) : null}

      {/* 下：Token */}
      {tokens && tokens.length ? (
        <View onLayout={measure('tokens')}>
          <View style={{ height: token.marginLG }} />
          <SectionTitle>主题变量（Token）</SectionTitle>
          <DocTable
            cols={[
              { label: 'token', flex: 2.8 },
              { label: '说明', flex: 4.2 },
              { label: '默认值', flex: 2 },
            ]}
            rows={tokens.map((t) => [t.name, t.desc, t.default ?? '–'])}
          />
        </View>
      ) : null}
      <View style={{ height: token.paddingLG }} />
    </View>
  );
}
