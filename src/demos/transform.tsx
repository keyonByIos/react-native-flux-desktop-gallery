// TRANSFORM：验证绘制期 2D 变换。上半区是静态 transform（抓帧即终态，直接看绘制对不对），
// 下半区是入场组件（挂载播放、落位后停住）。transform 不影响布局，故每个色块放在固定「舞台」里，
// 旋转/缩放只动视觉、不挤开兄弟。
import React from 'react';
import { View, Text, useToken, MoveIn, ScaleIn, RotateIn } from 'react-native-flux-desktop';
import type { TransformArray } from 'react-native-flux-desktop';

function Swatch(props: { label: string; transform?: TransformArray; origin?: string; color: string }): React.ReactElement {
  const { token } = useToken();
  const { label, transform, origin, color } = props;
  return (
    <View style={{ width: 150, alignItems: 'center' }}>
      {/* 舞台：固定尺寸，色块在其中居中，overflow 可见让旋转/缩放露出来 */}
      <View style={{ width: 120, height: 120, alignItems: 'center', justifyContent: 'center' }}>
        <View
          style={{
            width: 96,
            height: 96,
            borderRadius: token.borderRadiusLG,
            backgroundColor: color,
            transform,
            transformOrigin: origin,
          }}
        />
      </View>
      <Text style={{ marginTop: token.marginXS, fontSize: token.fontSizeSM, color: token.colorTextSecondary }}>{label}</Text>
    </View>
  );
}

function Section(props: { title: string; children: React.ReactNode }): React.ReactElement {
  const { token } = useToken();
  return (
    <View style={{ marginBottom: token.marginXL }}>
      <Text style={{ fontSize: token.fontSizeLG, fontWeight: '600', color: token.colorText, marginBottom: token.margin }}>
        {props.title}
      </Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: token.marginLG, alignItems: 'flex-start' }}>
        {props.children}
      </View>
    </View>
  );
}

export function TransformDemo(): React.ReactElement {
  const { token } = useToken();
  const c = {
    primary: token.colorPrimary,
    success: token.colorSuccess,
    warning: token.colorWarning,
    error: token.colorError,
    info: token.colorInfo,
  };
  return (
    <View style={{ paddingTop: token.padding }}>
      <Section title="基础变换（各自独立）">
        <Swatch label="原样" color={c.primary} />
        <Swatch label="rotate 25°" color={c.success} transform={[{ rotate: '25deg' }]} />
        <Swatch label="scale 1.35" color={c.warning} transform={[{ scale: 1.35 }]} />
        <Swatch label="skewX 22°" color={c.info} transform={[{ skewX: '22deg' }]} />
        <Swatch label="translate 28,18" color={c.error} transform={[{ translateX: 28 }, { translateY: 18 }]} />
      </Section>

      <Section title="变换原点 transformOrigin（rotate 45°）">
        <Swatch label="左上 0 0" color={c.primary} transform={[{ rotate: '45deg' }]} origin="0 0" />
        <Swatch label="中心(默认)" color={c.success} transform={[{ rotate: '45deg' }]} origin="50% 50%" />
        <Swatch label="右下 100% 100%" color={c.warning} transform={[{ rotate: '45deg' }]} origin="100% 100%" />
      </Section>

      <Section title="组合：translate + rotate + scale">
        <Swatch label="T·R·S" color={c.info} transform={[{ translateX: 10 }, { rotate: '-15deg' }, { scale: 1.2 }]} />
        <Swatch label="S·R·T(顺序不同)" color={c.error} transform={[{ scale: 1.2 }, { rotate: '-15deg' }, { translateX: 10 }]} />
      </Section>

      <Section title="子树继承：父 transform 带动整棵子树">
        <View style={{ width: 150, alignItems: 'center' }}>
          <View
            style={{
              width: 130,
              padding: token.padding,
              gap: token.marginXS,
              borderRadius: token.borderRadiusLG,
              backgroundColor: token.colorFillTertiary,
              transform: [{ rotate: '-9deg' }],
            }}
          >
            <View style={{ height: 18, borderRadius: token.borderRadius, backgroundColor: c.primary }} />
            <View style={{ height: 18, width: '70%', borderRadius: token.borderRadius, backgroundColor: c.success }} />
            <View style={{ height: 18, width: '45%', borderRadius: token.borderRadius, backgroundColor: c.warning }} />
          </View>
          <Text style={{ marginTop: token.marginXS, fontSize: token.fontSizeSM, color: token.colorTextSecondary }}>
            三条子块随父容器一起倾斜
          </Text>
        </View>
      </Section>

      <Section title="入场组件（落位后停住）">
        <MoveIn direction="up">
          <Swatch label="MoveIn up" color={c.primary} />
        </MoveIn>
        <ScaleIn from={0.5}>
          <Swatch label="ScaleIn" color={c.warning} />
        </ScaleIn>
        <RotateIn from={-120}>
          <Swatch label="RotateIn" color={c.success} />
        </RotateIn>
      </Section>
    </View>
  );
}
