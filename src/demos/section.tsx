// 各组件 demo 的统一外壳：一张 Card，顶部小标题，内部放该组件的示例。
import React from 'react';
import { Card, Text, useToken } from 'react-native-flux-desktop';

export function Section(props: { title: string; children?: React.ReactNode }): React.ReactElement {
  const { token } = useToken();
  const { title, children } = props;
  return (
    <Card style={{ marginBottom: token.margin }}>
      <Text style={{ fontSize: 12, letterSpacing: 1, color: token.colorTextTertiary, marginBottom: token.marginSM }}>
        {title}
      </Text>
      {children}
    </Card>
  );
}
