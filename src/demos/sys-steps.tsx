// 系统文档专用「步骤流」：编号竖排时间线，关键步骤用主色实心徽标 + 主色标题特殊着色（无行背景色）。
// 对齐 Steps 竖向时间线的整洁观感，用于渲染管线 / KV 写入路径等流程说明。
import React from 'react';
import { View, Text, useToken } from 'react-native-flux-desktop';

export interface StepFlowItem {
  /** 步骤标题 */
  title: string;
  /** 步骤补充说明 */
  desc?: string;
  /** 关键步骤：徽标实心主色 + 主色加粗标题（不加行背景） */
  important?: boolean;
}

/** 编号竖排时间线：左栏编号徽标 + 贯穿连接线，右栏标题/说明；important 徽标与标题主色高亮。 */
export function StepFlow(props: { steps: StepFlowItem[] }): React.ReactElement {
  const { token } = useToken();
  const { steps } = props;
  const railW = 30;
  const badge = 26;
  return (
    <View>
      {steps.map((s, i) => {
        const last = i === steps.length - 1;
        const imp = s.important === true;
        return (
          <View key={i} style={{ flexDirection: 'row' }}>
            {/* 左栏：编号徽标 + 向下连接线（贯穿到下一节点） */}
            <View style={{ width: railW, alignItems: 'center' }}>
              <View
                style={{
                  width: badge,
                  height: badge,
                  borderRadius: badge / 2,
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: imp ? token.colorPrimary : 'transparent',
                  borderWidth: token.lineWidth,
                  borderColor: imp ? token.colorPrimary : token.colorBorder,
                }}
              >
                <Text
                  style={{
                    fontSize: token.fontSizeSM,
                    fontWeight: '700' as const,
                    // 对齐 Badge 居中范式：行高 = 圆圈内径（去掉上下边框带），
                    // 使 textBaseline='middle' 的字形中线落在圆心，数字竖直居中
                    lineHeight: badge - token.lineWidth * 2,
                    textAlign: 'center' as const,
                    color: imp ? token.colorTextOnPrimaryBackground : token.colorTextSecondary,
                  }}
                >
                  {String(i + 1)}
                </Text>
              </View>
              {!last ? (
                <View style={{ width: token.lineWidth, flex: 1, backgroundColor: token.colorBorderSecondary }} />
              ) : null}
            </View>
            {/* 右栏：标题 + 说明（行距用 paddingBottom 统一，末行不留） */}
            <View style={{ flex: 1, marginLeft: token.marginSM, paddingTop: 2, paddingBottom: last ? 0 : token.marginLG }}>
              <Text
                style={{
                  fontSize: token.fontSizeLG,
                  fontWeight: imp ? ('700' as const) : ('600' as const),
                  color: imp ? token.colorPrimary : token.colorText,
                  lineHeight: Math.round(token.fontSizeLG * 1.4),
                }}
              >
                {s.title}
              </Text>
              {s.desc ? (
                <Text
                  style={{
                    fontSize: token.fontSize,
                    color: token.colorTextSecondary,
                    marginTop: token.marginXXS,
                    lineHeight: Math.round(token.fontSize * 1.6),
                  }}
                >
                  {s.desc}
                </Text>
              ) : null}
            </View>
          </View>
        );
      })}
    </View>
  );
}
