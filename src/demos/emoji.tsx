// EMOJI demo：自绘栈彩色 emoji 渲染（字体族回退路线）。
// 机制：registerFonts 注册系统彩色 emoji 字体，fontShorthand 在任意主字体后追加回退族 "Flux Emoji"，
// 于是「CJK/拉丁 + emoji」混排在一次 fillText 内由 Skia 逐字形回退，彩色 emoji 与正文同框、测量与绘制同步。
// 注：本文件所有 emoji 一律用 \u{} 转义书写，避免编辑器/工具链对 emoji 字面量的编码歧义。
import React from 'react';
import { View, Text, useToken } from 'react-native-flux-desktop';
import { DemoPage, type DemoItem, type ApiRow, type TokenRow } from '../DemoPage';

/** 一组 emoji 用等宽网格铺开，直观看彩色栅格化质量 */
function Grid(props: { items: string[] }): React.ReactElement {
  const { token } = useToken();
  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
      {props.items.map((e, i) => (
        <View
          key={i}
          style={{
            width: 44,
            height: 44,
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: token.borderRadius,
            backgroundColor: token.colorFillQuaternary,
          }}
        >
          <Text style={{ fontSize: 26 }}>{e}</Text>
        </View>
      ))}
    </View>
  );
}

function Cat(props: { title: string; items: string[] }): React.ReactElement {
  const { token } = useToken();
  return (
    <View style={{ marginBottom: token.marginSM }}>
      <Text style={{ color: token.colorTextTertiary, fontSize: token.fontSizeSM, marginBottom: 4 }}>{props.title}</Text>
      <Grid items={props.items} />
    </View>
  );
}

// ---- 分类总览 ----
function CategoriesDemo(): React.ReactElement {
  return (
    <View>
      <Cat
        title="表情"
        items={['\u{1F600}', '\u{1F602}', '\u{1F970}', '\u{1F60E}', '\u{1F914}', '\u{1F62D}', '\u{1F621}', '\u{1F973}', '\u{1F92F}', '\u{1F634}', '\u{1F922}', '\u{1F607}']}
      />
      <Cat
        title="手势"
        items={['\u{1F44D}', '\u{1F44E}', '\u{1F44C}', '\u270C\uFE0F', '\u{1F91E}', '\u{1F44F}', '\u{1F64C}', '\u{1F91D}', '\u{1F4AA}', '\u{1F446}', '\u261D\uFE0F', '\u{1F44B}']}
      />
      <Cat
        title="动物 / 食物"
        items={['\u{1F436}', '\u{1F98A}', '\u{1F43B}', '\u{1F43C}', '\u{1F981}', '\u{1F42E}', '\u{1F349}', '\u{1F354}', '\u{1F355}', '\u{1F32E}', '\u{1F366}', '\u2615']}
      />
      <Cat
        title="物体 / 符号"
        items={['\u{1F680}', '\u{1F4BB}', '\u{1F4F1}', '\u{1F4A1}', '\u{1F512}', '\u{1F4DA}', '\u2764\uFE0F', '\u{1F525}', '\u2728', '\u{1F389}', '\u2705', '\u26A0\uFE0F']}
      />
    </View>
  );
}

// ---- 混排：CJK + emoji + 拉丁同框，验证逐字形回退与换行对齐 ----
function MixedDemo(): React.ReactElement {
  const { token } = useToken();
  const p = { color: token.colorText, fontSize: token.fontSizeLG, lineHeight: 30 } as const;
  return (
    <View style={{ gap: token.marginXS, maxWidth: 460 }}>
      <Text style={p}>{'项目 \u{1F680} 上线成功 \u{1F389}，团队 \u{1F44F} 辛苦了 \u2764\uFE0F！'}</Text>
      <Text style={p}>{'今天 \u2600\uFE0F 适合穿 T 恤 \u{1F455} 出门 \u{1F6B6}，记得带伞 \u2602\uFE0F 以防阵雨 \u{1F327}\uFE0F。'}</Text>
      <Text style={{ ...p, fontWeight: '700' }}>{'加粗标题 \u{1F4CC} 里也能正常嵌入 emoji \u{1F516}'}</Text>
      <Text style={{ color: token.colorTextSecondary, fontSize: token.fontSize }}>
        {'状态：进行中 \u23F3 · 已完成 \u2705 · 有风险 \u26A0\uFE0F · 已阻塞 \u26D4'}
      </Text>
    </View>
  );
}

// ---- 尺寸跟随字号缩放（含 bold） ----
function SizesDemo(): React.ReactElement {
  const { token } = useToken();
  const sizes = [16, 24, 36, 56];
  return (
    <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: token.marginLG }}>
      {sizes.map((s) => (
        <View key={s} style={{ alignItems: 'center' }}>
          <Text style={{ fontSize: s }}>{'\u{1F680}'}</Text>
          <Text style={{ color: token.colorTextTertiary, fontSize: token.fontSizeSM }}>{s}px</Text>
        </View>
      ))}
      <View style={{ alignItems: 'center' }}>
        <Text style={{ fontSize: 36, fontWeight: '700' }}>{'\u{1F3AF}bold'}</Text>
        <Text style={{ color: token.colorTextTertiary, fontSize: token.fontSizeSM }}>粗体</Text>
      </View>
    </View>
  );
}

// ---- 序列与已知缺口 ----
function SequencesDemo(): React.ReactElement {
  const { token } = useToken();
  const row = (label: string, glyph: string, ok: boolean): React.ReactElement => (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 6 }}>
      <Text style={{ fontSize: 28, width: 96 }}>{glyph}</Text>
      <Text style={{ color: token.colorText, fontSize: token.fontSize, width: 170 }}>{label}</Text>
      <Text style={{ color: ok ? token.colorSuccess : token.colorWarning, fontSize: token.fontSizeSM }}>
        {ok ? '彩色合成 \u2705' : '缺口：见下'}
      </Text>
    </View>
  );
  return (
    <View>
      {row('ZWJ 家庭（4 人）', '\u{1F468}\u200D\u{1F469}\u200D\u{1F467}\u200D\u{1F466}', true)}
      {row('女性程序员 + 肤色', '\u{1F469}\u{1F3FD}\u200D\u{1F4BB}', true)}
      {row('竖大拇指 + 肤色', '\u{1F44D}\u{1F3FE}', true)}
      {row('键帽 1 2', '1\uFE0F\u20E32\uFE0F\u20E3', true)}
      {row('国旗 中国 / 美国', '\u{1F1E8}\u{1F1F3}\u{1F1FA}\u{1F1F8}', false)}
      <Text style={{ color: token.colorTextTertiary, fontSize: token.fontSizeSM, marginTop: 4 }}>
        国旗（区域指示符 U+1F1E6–U+1F1FF）Segoe UI Emoji 不含旗帜图，退化为字母对；需特判或配国旗 PNG。
      </Text>
    </View>
  );
}

const DEMOS: DemoItem[] = [
  {
    name: '分类总览',
    desc: '表情 / 手势 / 动物食物 / 物体符号四类彩色字形栅格化',
    node: <CategoriesDemo />,
    code: [
      '// 无需特殊组件：直接用 <Text> 渲染 emoji（建议用 \\u{} 转义避免编码歧义）',
      'import { Text } from "react-native-flux-desktop";',
      '',
      "<Text style={{ fontSize: 26 }}>{'\\u{1F600}\\u{1F44D}\\u{1F436}\\u{1F680}'}</Text>",
    ].join('\n'),
  },
  {
    name: '混排回退',
    desc: 'CJK + emoji + 拉丁同框：Skia 逐字形回退，正文走主字体、emoji 走彩色字体，换行对齐一致',
    node: <MixedDemo />,
    code: [
      '// CJK + emoji + 拉丁同框：一次 fillText 内逐字形回退，无需分段',
      "<Text style={{ fontSize: 16 }}>",
      "  {'项目 \\u{1F680} 上线成功 \\u{1F389}，团队 \\u{1F44F} 辛苦了'}",
      '</Text>',
    ].join('\n'),
  },
  {
    name: '尺寸缩放',
    desc: 'emoji 推进宽随 fontSize 缩放，bold 亦正常',
    node: <SizesDemo />,
    code: [
      '// emoji 推进宽随 fontSize 缩放，bold 亦正常',
      "<Text style={{ fontSize: 56 }}>{'\\u{1F680}'}</Text>",
      "<Text style={{ fontSize: 36, fontWeight: '700' }}>{'\\u{1F3AF}bold'}</Text>",
    ].join('\n'),
  },
  {
    name: '序列与缺口',
    desc: 'ZWJ 家庭 / 肤色 / 键帽合成正常；国旗退化为字母对（已知缺口）',
    node: <SequencesDemo />,
    code: [
      '// ZWJ 家庭 / 肤色 / 键帽合成正常；国旗（区域指示符）退化为字母对',
      "<Text>{'\\u{1F468}\\u200D\\u{1F469}\\u200D\\u{1F467}\\u200D\\u{1F466}'}</Text>  {/* 家庭 ✅ */}",
      "<Text>{'\\u{1F44D}\\u{1F3FE}'}</Text>  {/* 肤色 ✅ */}",
      "<Text>{'\\u{1F1E8}\\u{1F1F3}'}</Text>  {/* 国旗 ✕ 退化 */}",
    ].join('\n'),
  },
];

const API: ApiRow[] = [
  { name: 'registerFonts()', desc: '注册系统彩色 emoji 字体（Win seguiemj / mac Apple Color Emoji / linux Noto）', type: '() => void', default: '–' },
  { name: 'EMOJI_FAMILY', desc: '彩色 emoji 回退族别名 "Flux Emoji"', type: 'string', default: "'Flux Emoji'" },
  { name: 'fontShorthand(style)', desc: '主字体后追加回退族：…px "主字体", "Flux Emoji"', type: '(style) => string', default: '–' },
  { name: '无需分段', desc: 'measureText 与 fillText 走同一 ctx.font 回退列表，宽度与绘制自动同步', type: '–', default: '–' },
];

const TOKENS: TokenRow[] = [
  { name: 'fontSize / fontSizeLG', desc: 'emoji 随字号缩放（推进宽与彩色字形一致）', default: '–' },
  { name: 'colorFillQuaternary', desc: '分类网格单元格底色', default: '–' },
  { name: 'colorSuccess / colorWarning', desc: '序列演示「正常 / 缺口」标注色', default: '–' },
];

export function EmojiDemo(): React.ReactElement {
  return <DemoPage demos={DEMOS} api={API} tokens={TOKENS} />;
}
