// DRAG demo：应用内拖拽（in-app DnD）—— useDrag / useDrop + 跟随光标 ghost（DragLayer）。
// 三段演示：基础拖放（高亮可落区）/ 类型过滤（type 不符不落）/ 列表拖拽排序（项既是源又是目标）。
import React from 'react';
import { View, Text, useToken, useDrag, useDrop } from 'react-native-flux-desktop';
import { DemoPage, type DemoItem, type ApiRow, type TokenRow } from '../DemoPage';

// ---- 基础：把一个方块拖进放置区，区内 isOver 高亮，落下属计数 ----
function DropBox(props: { onDropped: () => void }): React.ReactElement {
  const { token } = useToken();
  const [__drop, { isOver }] = useDrop({ onDrop: () => props.onDropped() });
  return (
    <View
      {...__drop}
      style={{
        width: 180,
        height: 110,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: token.borderRadiusLG,
        borderStyle: 'dashed',
        borderWidth: 2,
        borderColor: isOver ? token.colorPrimary : token.colorBorder,
        backgroundColor: isOver ? token.colorPrimaryBg : 'transparent',
      }}
    >
      <Text style={{ color: isOver ? token.colorPrimary : token.colorTextSecondary, fontSize: token.fontSize }}>
        {isOver ? '松开放下' : '拖到此处'}
      </Text>
    </View>
  );
}

function BasicDemo(): React.ReactElement {
  const { token } = useToken();
  const [count, setCount] = React.useState(0);
  const [__drag, { isDragging }] = useDrag({
    getDragData: () => ({ from: 'block' }),
    renderImage: () => <Text style={{ color: token.colorText }}>拖拽中…</Text>,
  });
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
      <View
        {...__drag}
        style={{
          width: 110,
          height: 70,
          marginRight: token.marginLG,
          justifyContent: 'center',
          alignItems: 'center',
          borderRadius: token.borderRadiusLG,
          backgroundColor: token.colorPrimary,
          opacity: isDragging ? 0.4 : 1,
          cursor: 'grab',
        }}
      >
        <Text style={{ color: token.colorTextLightSolid, fontSize: token.fontSize }}>拖我</Text>
      </View>
      <DropBox onDropped={() => setCount((c) => c + 1)} />
      <Text style={{ marginLeft: token.marginLG, color: token.colorTextSecondary }}>
        已放下 {count} 次
      </Text>
    </View>
  );
}

// ---- 类型过滤：两张卡片带不同 type，只有苹果类可落进篮子 ----
function FruitCard(props: { fruit: string; type: string }): React.ReactElement {
  const { token } = useToken();
  const [__drag, { isDragging }] = useDrag({
    getDragData: () => props.fruit,
    type: props.type,
    renderImage: () => <Text style={{ color: token.colorText }}>{props.fruit}</Text>,
  });
  return (
    <View
      {...__drag}
      style={{
        paddingVertical: token.paddingSM,
        paddingHorizontal: token.padding,
        marginRight: token.margin,
        borderRadius: token.borderRadiusLG,
        backgroundColor: token.colorFillSecondary,
        opacity: isDragging ? 0.4 : 1,
        cursor: 'grab',
      }}
    >
      <Text style={{ color: token.colorText, fontSize: token.fontSize }}>{props.fruit}</Text>
    </View>
  );
}

function TypedDemo(): React.ReactElement {
  const { token } = useToken();
  const [log, setLog] = React.useState('把水果拖进篮子');
  const [__drop, { isOver }] = useDrop({
    type: 'fruit',
    onDrop: (f: string) => setLog(`收到了「${f}」`),
    onDragLeave: () => undefined,
  });
  return (
    <View>
      <View style={{ flexDirection: 'row', marginBottom: token.margin }}>
        <FruitCard fruit="苹果" type="fruit" />
        <FruitCard fruit="香蕉" type="fruit" />
        <FruitCard fruit="螺丝刀" type="tool" />
      </View>
      <View
        {...__drop}
        style={{
          width: 240,
          height: 84,
          justifyContent: 'center',
          alignItems: 'center',
          borderRadius: token.borderRadiusLG,
          borderStyle: 'dashed',
          borderWidth: 2,
          borderColor: isOver ? token.colorSuccess : token.colorBorder,
          backgroundColor: isOver ? token.colorSuccessBg : 'transparent',
        }}
      >
        <Text style={{ color: token.colorTextSecondary, fontSize: token.fontSize }}>{log}</Text>
        <Text style={{ color: token.colorTextTertiary, fontSize: token.fontSizeSM, marginTop: 4 }}>
          type=fruit 才可落 ·「螺丝刀」被拒
        </Text>
      </View>
    </View>
  );
}

// ---- 排序：每项既是拖拽源又是放置目标。光标半区模型：停在目标行上半 → 插到其前（线在上沿）；
// 下半 → 插到其后（线在下沿）。线实时跟随光标，落点所见即所得。整行不高亮，避免“替换”误解。----
function SortRow(props: {
  label: string;
  onMove: (from: string, to: string, after: boolean) => void;
}): React.ReactElement {
  const { token } = useToken();
  const [__drag, { isDragging }] = useDrag({
    getDragData: () => props.label,
    renderImage: () => (
      <Text style={{ color: token.colorTextLightSolid, fontSize: token.fontSize }}>{props.label}</Text>
    ),
  });
  const [__drop, { isOver, position }] = useDrop({
    canDrop: (from: string) => from !== props.label,
    onDrop: (from: string, pos: 'before' | 'after') => props.onMove(from, props.label, pos === 'after'),
  });
  return (
    <View style={{ position: 'relative', marginVertical: 3 }}>
      <View
        {...__drag}
        {...__drop}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          height: 44,
          paddingHorizontal: token.paddingSM,
          borderRadius: token.borderRadius,
          backgroundColor: token.colorFillQuaternary,
          opacity: isDragging ? 0.35 : 1,
          cursor: 'grab',
        }}
      >
        <Text style={{ color: token.colorTextTertiary, marginRight: token.marginXS }}>≡</Text>
        <Text style={{ color: token.colorText, fontSize: token.fontSize }}>{props.label}</Text>
      </View>
      {isOver ? (
        <View
          style={{
            position: 'absolute',
            left: -4,
            right: -4,
            height: 3,
            borderRadius: 2,
            backgroundColor: token.colorPrimary,
            top: position === 'before' ? 0 : undefined,
            bottom: position === 'after' ? 0 : undefined,
          }}
        />
      ) : null}
    </View>
  );
}

function SortDemo(): React.ReactElement {
  const { token } = useToken();
  const [items, setItems] = React.useState(['香蕉', '苹果', '橙子', '葡萄', '西瓜']);
  const move = (from: string, to: string, after: boolean): void => {
    setItems((list) => {
      const next = list.slice();
      const fi = next.indexOf(from);
      const ti = next.indexOf(to);
      if (fi < 0 || ti < 0 || fi === ti) return list;
      // 删源后取目标新下标，after=true 插到它之后、否则之前，与插入线位置严格一致
      next.splice(fi, 1);
      const ti2 = next.indexOf(to);
      next.splice(after ? ti2 + 1 : ti2, 0, from);
      return next;
    });
  };
  return (
    <View style={{ maxWidth: 320 }}>
      <Text style={{ color: token.colorTextSecondary, fontSize: token.fontSizeSM, marginBottom: token.marginXS }}>
        按住任意行拖动，光标停在目标行上半→插到其前、下半→插到其后（蓝线实时跟随）
      </Text>
      {items.map((label) => (
        <SortRow key={label} label={label} onMove={move} />
      ))}
    </View>
  );
}

const DEMOS: DemoItem[] = [
  {
    name: '基础拖放',
    desc: 'useDrag 声明可拖起项，useDrop 声明接收区；isOver 高亮、ghost 跟随光标',
    node: <BasicDemo />,
    code: [
      'import { useDrag, useDrop, DragLayer } from "react-native-flux-desktop";',
      '',
      '// useDrag 声明拖拽源，useDrop 声明接收区',
      'const [dragBind] = useDrag({ getDragData: () => ({ id: 1 }) });',
      'const [dropBind, { isOver }] = useDrop({ onDrop: (item) => accept(item) });',
      '<View {...dragBind}>可拖起</View>',
      '<View {...dropBind} style={{ opacity: isOver ? 0.6 : 1 }}>放置区</View>',
      '// DragLayer 需挂在 Window 根，渲染跟随光标的 ghost',
    ].join('\n'),
  },
  {
    name: '类型过滤',
    desc: 'source/target 各给 type，只有同类型才可落（canDrop 另可自定义判定）',
    node: <TypedDemo />,
    code: [
      'import { useDrag, useDrop } from "react-native-flux-desktop";',
      '',
      '// source/target 各给 type，只有同类型才可落',
      'const [bind] = useDrag({ getDragData: () => ({ id: 1 }), type: \'fruit\' });',
      'const [dropBind, { isOver }] = useDrop({',
      '  type: \'fruit\',',
      '  canDrop: (item) => item.type === \'fruit\',',
      '  onDrop: (item) => accept(item),',
      '});',
    ].join('\n'),
  },
  {
    name: '列表拖拽排序',
    desc: '同一行既挂 __drag 又挂 __drop；光标停在目标行上半/下半决定插到其前/后，蓝色插入线实时跟随光标指示落点',
    node: <SortDemo />,
    code: [
      'import { useDrag, useDrop } from "react-native-flux-desktop";',
      '',
      '// 同一行既挂 useDrag 又挂 useDrop，实现拖拽排序',
      'const [dragBind] = useDrag({ getDragData: () => label });',
      'const [dropBind, { isOver }] = useDrop({ onDrop: (item) => move(item, label) });',
      '<View {...dragBind} {...dropBind}>{label}</View>',
    ].join('\n'),
  },
];

const API: ApiRow[] = [
  { name: 'useDrag', desc: '声明拖拽源，返回 [bind, { isDragging }]', type: '(options: UseDragOptions) => [DragBindProps, { isDragging: boolean }]', default: '–' },
  { name: 'useDrop', desc: '声明放置目标，返回 [bind, { isOver }]', type: '(options?: UseDropOptions) => [DropBindProps, { isOver: boolean }]', default: '–' },
  { name: 'getDragData', desc: '起拖时取拖拽携带的数据（useDrag）', type: '() => T', default: '必填' },
  { name: 'renderImage', desc: 'ghost 预览内容，缺省画通用半透明块', type: '(item) => ReactNode', default: '–' },
  { name: 'type', desc: '类型标识：源与目标相同才可落', type: 'string', default: '–' },
  { name: 'canDrop', desc: '自定义可否落（useDrop）', type: '(item) => boolean', default: 'true' },
  { name: 'onDrop', desc: '落到本目标时回调', type: '(item) => void', default: '–' },
  { name: 'onDragStart', desc: '起拖回调（越过位移阈值）', type: '(item) => void', default: '–' },
  { name: 'onDragEnd', desc: '结束回调：dropped / cancelled', type: '(item, result) => void', default: '–' },
  { name: 'DragLayer', desc: '拖拽预览浮层，须挂 Window 根', type: '() => ReactElement | null', default: '–' },
];

const TOKENS: TokenRow[] = [
  { name: 'colorPrimary / colorPrimaryBg', desc: 'ghost 默认块 / 可落高亮底色', default: '–' },
  { name: 'colorBorder / 2px', desc: '放置区虚线边框（宽固定 2）', default: '–' },
  { name: 'borderRadiusLG', desc: '拖拽块与放置区圆角', default: '8' },
];

export function DragDemo(): React.ReactElement {
  return <DemoPage demos={DEMOS} api={API} tokens={TOKENS} />;
}
