// cases/kanban.tsx —— 「看板 Kanban」整合案例（任务管理）。
// 四列泳道（待办/进行中/待评审/已完成）+ 任务卡（标签/优先级/负责人头像组/到期）；
// 交互：◀▶ 点选跨列移动、底部「+」经 Modal 新建、卡片右上删除；整块看板落 kv 持久化（重启回灌）。
// 用点选移动而非拖拽：case 独立窗未挂 DragLayer，拖拽 ghost 不生效，点选更稳。数据为示例任务（本类 App 无真实数据源）。
import React from 'react';
import {
  View,
  Text,
  Pressable,
  Icon,
  Input,
  Tag,
  Modal,
  Avatar,
  Progress,
  Segmented,
  useToken,
  kv,
  type AliasToken,
} from 'react-native-flux-desktop';

const KV_KEY = 'board.kanban';

type Pri = 'high' | 'mid' | 'low';
interface Card {
  id: string;
  title: string;
  tag: string;
  tagColor: string;
  pri: Pri;
  due: string;
  owners: string[];
}
interface Col {
  id: string;
  name: string;
  cards: Card[];
}

const PRI_COLOR: Record<Pri, string> = { high: '#f5222d', mid: '#fa8c16', low: '#52c41a' };
const PRI_LABEL: Record<Pri, string> = { high: '高', mid: '中', low: '低' };

const SEED: Col[] = [
  {
    id: 'backlog', name: '待办 Backlog', cards: [
      { id: 'c1', title: '设计令牌暗色对比度复核', tag: '设计', tagColor: '#eb2f96', pri: 'mid', due: '10-08', owners: ['林', '陈'] },
      { id: 'c2', title: 'VirtualList 万行压测', tag: '性能', tagColor: '#1677ff', pri: 'high', due: '10-05', owners: ['王'] },
      { id: 'c3', title: 'KV 加密落盘方案调研', tag: '架构', tagColor: '#722ed1', pri: 'low', due: '10-12', owners: ['陈', '李'] },
    ],
  },
  {
    id: 'doing', name: '进行中 Doing', cards: [
      { id: 'c4', title: '看板拖拽排序交互', tag: '前端', tagColor: '#13c2c2', pri: 'high', due: '10-03', owners: ['林'] },
      { id: 'c5', title: 'K 线 MACD 副图对齐', tag: '图表', tagColor: '#fa8c16', pri: 'mid', due: '10-04', owners: ['张', '王'] },
    ],
  },
  {
    id: 'review', name: '待评审 Review', cards: [
      { id: 'c6', title: '托盘小窗点外即关逻辑', tag: '桌面', tagColor: '#2f54eb', pri: 'mid', due: '10-02', owners: ['李'] },
    ],
  },
  {
    id: 'done', name: '已完成 Done', cards: [
      { id: 'c7', title: '命令面板 fzf 打分', tag: '前端', tagColor: '#13c2c2', pri: 'low', due: '09-28', owners: ['林', '陈'] },
      { id: 'c8', title: '文件管理器三栏预览', tag: '案例', tagColor: '#52c41a', pri: 'mid', due: '09-29', owners: ['王'] },
    ],
  },
];

function loadBoard(): Col[] {
  try {
    if (kv.available) {
      const r = kv.get('app', KV_KEY);
      const v = r?.value;
      if (Array.isArray(v) && v.length && v.every((c) => c && typeof c.id === 'string' && Array.isArray(c.cards))) {
        return v as Col[];
      }
    }
  } catch {
    /* 读失败回落示例数据 */
  }
  return SEED;
}

export function KanbanDemo(): React.ReactElement {
  const { token } = useToken();
  const [cols, setCols] = React.useState<Col[]>(loadBoard);
  const [addTarget, setAddTarget] = React.useState<number | null>(null);
  const [nt, setNt] = React.useState('');
  const [nTag, setNTag] = React.useState('');
  const [nPri, setNPri] = React.useState<Pri>('mid');

  React.useEffect(() => {
    try {
      if (kv.available) kv.set('app', KV_KEY, 'json', cols);
    } catch {
      /* 写失败忽略 */
    }
  }, [cols]);

  const total = cols.reduce((s, c) => s + c.cards.length, 0);
  const done = cols[cols.length - 1]?.cards.length ?? 0;
  const percent = total ? Math.round((done / total) * 100) : 0;

  const move = (ci: number, cardId: string, dir: -1 | 1): void => {
    const to = ci + dir;
    if (to < 0 || to >= cols.length) return;
    setCols((prev) => {
      const next = prev.map((c) => ({ ...c, cards: [...c.cards] }));
      const from = next[ci].cards.find((k) => k.id === cardId);
      if (!from) return prev;
      next[ci].cards = next[ci].cards.filter((k) => k.id !== cardId);
      next[to].cards.push(from);
      return next;
    });
  };

  const remove = (ci: number, cardId: string): void => {
    setCols((prev) => prev.map((c, i) => (i === ci ? { ...c, cards: c.cards.filter((k) => k.id !== cardId) } : c)));
  };

  const openAdd = (ci: number): void => {
    setAddTarget(ci);
    setNt('');
    setNTag('');
    setNPri('mid');
  };

  const submitAdd = (): void => {
    const title = nt.trim();
    if (!title || addTarget == null) {
      setAddTarget(null);
      return;
    }
    const card: Card = {
      id: `u${Date.now()}`,
      title,
      tag: nTag.trim() || '任务',
      tagColor: token.colorPrimary,
      pri: nPri,
      due: '—',
      owners: ['我'],
    };
    setCols((prev) => prev.map((c, i) => (i === addTarget ? { ...c, cards: [...c.cards, card] } : c)));
    setAddTarget(null);
  };

  return (
    <View style={{ flex: 1, backgroundColor: token.colorBgContainer }}>
      {/* 顶部统计条 */}
      <View style={{ height: 64, flexDirection: 'row', alignItems: 'center', paddingHorizontal: token.paddingLG, gap: token.marginLG, borderBottomWidth: token.lineWidth, borderBottomColor: token.colorBorderSecondary }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: token.marginXS }}>
          <Icon name="columns" size={18} color={token.colorPrimary} />
          <Text style={{ fontSize: token.fontSizeLG, fontWeight: '600', color: token.colorText }}>项目看板</Text>
        </View>
        <View style={{ flex: 1 }} />
        <Text style={{ fontSize: 12, color: token.colorTextSecondary }}>共 {total} 张 · 完成 {done}</Text>
        <View style={{ width: 160 }}>
          <Progress percent={percent} size="small" showInfo={false} />
        </View>
        <Pressable onPress={() => setCols(SEED)} style={{ flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, height: 28, borderRadius: token.borderRadius, borderWidth: token.lineWidth, borderColor: token.colorBorderSecondary, cursor: 'pointer' }}>
          <Icon name="reload" size={13} color={token.colorTextSecondary} />
          <Text style={{ fontSize: 12, color: token.colorTextSecondary }}>重置</Text>
        </Pressable>
      </View>

      {/* 列：plain flex 行等分自适应（本渲染器横向 ScrollView 不按行排布，改用已验证稳健范式） */}
      <View style={{ flex: 1, flexDirection: 'row', padding: token.paddingLG, gap: token.margin }}>
        {cols.map((col, ci) => (
          <View key={col.id} style={{ flex: 1, minWidth: 0, backgroundColor: token.colorFillQuaternary, borderRadius: token.borderRadiusLG, padding: token.paddingSM }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 4, paddingVertical: 6, gap: token.marginXS }}>
              <Text style={{ flex: 1, fontSize: token.fontSize, fontWeight: '600', color: token.colorText }}>{col.name}</Text>
              <View style={{ minWidth: 20, paddingHorizontal: 6, height: 18, borderRadius: 9, alignItems: 'center', justifyContent: 'center', backgroundColor: token.colorFillSecondary }}>
                <Text style={{ fontSize: 11, color: token.colorTextSecondary }}>{col.cards.length}</Text>
              </View>
            </View>
            <View style={{ gap: token.marginXS }}>
              {col.cards.map((card) => (
                <KanbanCard key={card.id} token={token} card={card} ci={ci} first={ci === 0} last={ci === cols.length - 1} onMove={move} onRemove={remove} />
              ))}
            </View>
            <Pressable onPress={() => openAdd(ci)} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4, height: 34, marginTop: token.marginXS, borderRadius: token.borderRadius, borderWidth: token.lineWidth, borderStyle: 'dashed', borderColor: token.colorBorder, cursor: 'pointer' }}>
              <Icon name="plus" size={14} color={token.colorTextSecondary} />
              <Text style={{ fontSize: 12, color: token.colorTextSecondary }}>添加任务</Text>
            </Pressable>
          </View>
        ))}
      </View>

      {/* 新建任务弹窗 */}
      <Modal open={addTarget != null} title={addTarget != null ? `添加到「${cols[addTarget]?.name}」` : '新建任务'} onOk={submitAdd} onCancel={() => setAddTarget(null)} width={420} okText="添加">
        <View style={{ gap: token.marginSM, paddingVertical: token.marginXS }}>
          <View>
            <Text style={{ fontSize: 12, color: token.colorTextSecondary, marginBottom: 4 }}>任务标题</Text>
            <Input value={nt} onChange={setNt} placeholder="要做什么？" autoFocus />
          </View>
          <View>
            <Text style={{ fontSize: 12, color: token.colorTextSecondary, marginBottom: 4 }}>标签</Text>
            <Input value={nTag} onChange={setNTag} placeholder="如 前端 / 设计 / 性能" />
          </View>
          <View>
            <Text style={{ fontSize: 12, color: token.colorTextSecondary, marginBottom: 6 }}>优先级</Text>
            <Segmented
              value={nPri}
              onChange={(v) => setNPri(v as Pri)}
              options={[
                { label: '高', value: 'high' },
                { label: '中', value: 'mid' },
                { label: '低', value: 'low' },
              ]}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
}

function KanbanCard(props: {
  token: AliasToken;
  card: Card;
  ci: number;
  first: boolean;
  last: boolean;
  onMove: (ci: number, id: string, dir: -1 | 1) => void;
  onRemove: (ci: number, id: string) => void;
}): React.ReactElement {
  const { token, card } = props;
  return (
    <View style={{ backgroundColor: token.colorBgContainer, borderRadius: token.borderRadius, borderWidth: token.lineWidth, borderColor: token.colorBorderSecondary, padding: token.paddingSM, gap: token.marginXS }}>
      <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 6 }}>
        <Text style={{ flex: 1, fontSize: 13, lineHeight: 19, color: token.colorText }}>{card.title}</Text>
        <Pressable onPress={() => props.onRemove(props.ci, card.id)} style={{ cursor: 'pointer', padding: 1 }}>
          <Icon name="delete" size={13} color={token.colorTextQuaternary} />
        </Pressable>
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: token.marginXS }}>
        <Tag color={card.tagColor} textColor="#fff" style={{ margin: 0 }}>{card.tag}</Tag>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}>
          <View style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: PRI_COLOR[card.pri] }} />
          <Text style={{ fontSize: 11, color: token.colorTextTertiary }}>{PRI_LABEL[card.pri]}</Text>
        </View>
        <View style={{ flex: 1 }} />
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}>
          <Icon name="clock2" size={11} color={token.colorTextTertiary} />
          <Text style={{ fontSize: 11, color: token.colorTextTertiary }}>{card.due}</Text>
        </View>
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <Avatar.Group max={3} size={22}>
          {card.owners.map((o, i) => (
            <Avatar key={i} size={22} shape="circle" backgroundColor={AV_COLORS[i % AV_COLORS.length]}>{o}</Avatar>
          ))}
        </Avatar.Group>
        <View style={{ flex: 1 }} />
        <MoveBtn token={token} name="skipBack" disabled={props.first} onPress={() => props.onMove(props.ci, card.id, -1)} />
        <MoveBtn token={token} name="skipForward" disabled={props.last} onPress={() => props.onMove(props.ci, card.id, 1)} />
      </View>
    </View>
  );
}

const AV_COLORS = ['#1677ff', '#52c41a', '#fa8c16', '#eb2f96', '#13c2c2'];

function MoveBtn(props: { token: AliasToken; name: string; disabled: boolean; onPress: () => void }): React.ReactElement {
  const { token } = props;
  return (
    <Pressable
      onPress={props.disabled ? undefined : props.onPress}
      style={{ width: 22, height: 22, marginLeft: 4, alignItems: 'center', justifyContent: 'center', borderRadius: token.borderRadiusSM, opacity: props.disabled ? 0.3 : 1, cursor: props.disabled ? 'default' : 'pointer' }}
    >
      <Icon name={props.name} size={13} color={token.colorTextSecondary} />
    </Pressable>
  );
}

export default KanbanDemo;
