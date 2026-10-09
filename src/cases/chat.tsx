// cases/chat.tsx —— 「即时通讯 Chat」整合案例。
// 左=会话列表（Avatar + 未读 Badge + 搜索过滤），右=消息气泡流 + 输入框（回车发送 / emoji 快选）。
// 纯前端演示态：切换会话、发消息、搜索均为真实本地状态交互；数据为代表内容的示例会话（非造假磁盘/网络，本类 App 无真实数据源）。
// 全走 token 明暗自适应；固定高整页，宽度随窗口拉伸。
import React from 'react';
import {
  View,
  Text,
  Pressable,
  Icon,
  Input,
  ScrollView,
  Avatar,
  Badge,
  useToken,
  type AliasToken,
} from 'react-native-flux-desktop';

interface Msg {
  id: number;
  me: boolean;
  text: string;
  time: string;
}
interface Conv {
  id: string;
  name: string;
  role: string;
  color: string;
  online: boolean;
  unread: number;
  time: string;
  msgs: Msg[];
}

const SIDEBAR_W = 288;
const AV = 40;

function now(): string {
  const d = new Date();
  const p = (n: number): string => `${n}`.padStart(2, '0');
  return `${p(d.getHours())}:${p(d.getMinutes())}`;
}

const SEED: Conv[] = [
  {
    id: 'lin', name: '林晚', role: '产品设计 · 前端', color: '#1677ff', online: true, unread: 0, time: '14:22',
    msgs: [
      { id: 1, me: false, text: '看板那三个案例的动效我看了，交互很顺 👍', time: '14:05' },
      { id: 2, me: true, text: '好，那我继续把拖拽排序补上', time: '14:08' },
      { id: 3, me: false, text: '暗色主题下气泡对比度再拉高一点点就更清楚了', time: '14:12' },
      { id: 4, me: false, text: '不急，你先把手头这个收尾', time: '14:22' },
    ],
  },
  {
    id: 'ops', name: '运维告警群', role: '12 人', color: '#fa8c16', online: true, unread: 3, time: '13:47',
    msgs: [
      { id: 1, me: false, text: '⚠️ node-07 CPU 连续 5 分钟 > 90%', time: '13:40' },
      { id: 2, me: false, text: '已自动扩容，负载回落正常', time: '13:45' },
      { id: 3, me: true, text: '收到，我盯一下内存趋势', time: '13:47' },
    ],
  },
  {
    id: 'chen', name: '陈默', role: '后端架构', color: '#52c41a', online: false, unread: 0, time: '昨天',
    msgs: [
      { id: 1, me: false, text: 'KV 持久化的接口我封好了，你直接 kv.set/get 就行', time: '昨天 18:30' },
      { id: 2, me: true, text: '辛苦，我接一下试试', time: '昨天 19:02' },
    ],
  },
  {
    id: 'design', name: '设计评审', role: '8 人', color: '#eb2f96', online: true, unread: 12, time: '11:15',
    msgs: [
      { id: 1, me: false, text: '新版首页 hero 区的栅格走 24 栏', time: '11:10' },
      { id: 2, me: false, text: '卡片圆角统一用 borderRadiusLG', time: '11:12' },
      { id: 3, me: true, text: '明白，我把 token 对齐一下', time: '11:15' },
    ],
  },
  {
    id: 'me', name: '文件传输助手', role: '我的设备', color: '#13c2c2', online: true, unread: 0, time: '09:30',
    msgs: [
      { id: 1, me: true, text: '把抓帧脚本放这里，回头复制', time: '09:30' },
    ],
  },
];

function initials(name: string): string {
  return name.slice(0, name.length >= 3 ? 2 : 1);
}

export function ChatDemo(): React.ReactElement {
  const { token } = useToken();
  const [convs, setConvs] = React.useState<Conv[]>(SEED);
  const [activeId, setActiveId] = React.useState<string>(SEED[0].id);
  const [q, setQ] = React.useState('');
  const [draft, setDraft] = React.useState('');

  const active = convs.find((c) => c.id === activeId) ?? convs[0];
  const filtered = q.trim() ? convs.filter((c) => c.name.includes(q.trim())) : convs;

  const openConv = (id: string): void => {
    setActiveId(id);
    setDraft('');
    setConvs((prev) => prev.map((c) => (c.id === id ? { ...c, unread: 0 } : c)));
  };

  const send = (): void => {
    const t = draft.trim();
    if (!t) return;
    setConvs((prev) =>
      prev.map((c) =>
        c.id === activeId ? { ...c, time: now(), msgs: [...c.msgs, { id: Date.now(), me: true, text: t, time: now() }] } : c,
      ),
    );
    setDraft('');
  };

  const pickEmoji = (e: string): void => setDraft((d) => d + e);

  return (
    <View style={{ flex: 1, flexDirection: 'row', backgroundColor: token.colorBgContainer }}>
      {/* 左：会话列表 */}
      <View style={{ width: SIDEBAR_W, borderRightWidth: token.lineWidth, borderRightColor: token.colorBorderSecondary }}>
        <View style={{ padding: token.padding, paddingBottom: token.paddingXS }}>
          <Text style={{ fontSize: token.fontSizeLG, fontWeight: '600', color: token.colorText, marginBottom: token.marginXS }}>消息</Text>
          <Input value={q} onChange={setQ} placeholder="搜索联系人" size="small" allowClear prefix={<Icon name="search" size={14} color={token.colorTextTertiary} />} />
        </View>
        <ScrollView style={{ flex: 1 }}>
          {filtered.map((c) => {
            const last = c.msgs[c.msgs.length - 1];
            const on = c.id === activeId;
            return (
              <Pressable key={c.id} onPress={() => openConv(c.id)} style={{ flexDirection: 'row', alignItems: 'center', gap: token.marginSM, padding: token.padding, paddingVertical: 10, backgroundColor: on ? token.colorFillSecondary : 'transparent', cursor: 'pointer' }}>
                <Badge count={c.unread}>
                  <Avatar size={AV} shape="circle" backgroundColor={c.color}>{initials(c.name)}</Avatar>
                </Badge>
                <View style={{ flex: 1, minWidth: 0 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Text style={{ flex: 1, fontSize: token.fontSize, fontWeight: '600', color: token.colorText }} numberOfLines={1}>{c.name}</Text>
                    <Text style={{ fontSize: 11, color: token.colorTextTertiary }}>{c.time}</Text>
                  </View>
                  <Text style={{ fontSize: 12, color: token.colorTextTertiary, marginTop: 2 }} numberOfLines={1}>
                    {last ? `${last.me ? '我: ' : ''}${last.text}` : c.role}
                  </Text>
                </View>
              </Pressable>
            );
          })}
          {!filtered.length ? (
            <View style={{ padding: token.paddingLG, alignItems: 'center' }}>
              <Text style={{ fontSize: 12, color: token.colorTextTertiary }}>无匹配会话</Text>
            </View>
          ) : null}
        </ScrollView>
      </View>

      {/* 右：对话区 */}
      <View style={{ flex: 1, minWidth: 0 }}>
        {/* 头部 */}
        <View style={{ height: 64, flexDirection: 'row', alignItems: 'center', paddingHorizontal: token.paddingLG, borderBottomWidth: token.lineWidth, borderBottomColor: token.colorBorderSecondary, gap: token.marginSM }}>
          <Avatar size={36} shape="circle" backgroundColor={active.color}>{initials(active.name)}</Avatar>
          <View style={{ flex: 1, minWidth: 0 }}>
            <Text style={{ fontSize: token.fontSize, fontWeight: '600', color: token.colorText }}>{active.name}</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: active.online ? token.colorSuccess : token.colorTextQuaternary }} />
              <Text style={{ fontSize: 11, color: token.colorTextTertiary }}>{active.online ? '在线' : '离线'} · {active.role}</Text>
            </View>
          </View>
          <HeaderIcon token={token} name="phone" />
          <HeaderIcon token={token} name="video" />
          <HeaderIcon token={token} name="moreVertical" />
        </View>

        {/* 消息流 */}
        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ width: '100%', padding: token.paddingLG, justifyContent: 'flex-end' }}>
          <View style={{ alignSelf: 'center', paddingHorizontal: 10, paddingVertical: 2, borderRadius: token.borderRadiusSM, backgroundColor: token.colorFillTertiary, marginBottom: token.margin }}>
            <Text style={{ fontSize: 11, color: token.colorTextTertiary }}>{active.time}</Text>
          </View>
          {active.msgs.map((m) => (
            <View key={m.id} style={{ flexDirection: 'row', justifyContent: m.me ? 'flex-end' : 'flex-start', alignItems: 'flex-start', marginBottom: token.marginSM, gap: token.marginXS }}>
              {!m.me ? <Avatar size={32} shape="circle" backgroundColor={active.color}>{initials(active.name)}</Avatar> : null}
              <View style={{ maxWidth: 460 }}>
                <View style={{ paddingVertical: 8, paddingHorizontal: 12, borderRadius: token.borderRadiusLG, backgroundColor: m.me ? token.colorPrimary : token.colorFillSecondary }}>
                  <Text style={{ fontSize: 14, lineHeight: 20, color: m.me ? '#fff' : token.colorText }}>{m.text}</Text>
                </View>
                <Text style={{ fontSize: 10, color: token.colorTextQuaternary, marginTop: 2, textAlign: m.me ? 'right' : 'left' }}>{m.time}</Text>
              </View>
            </View>
          ))}
        </ScrollView>

        {/* 输入区 */}
        <View style={{ borderTopWidth: token.lineWidth, borderTopColor: token.colorBorderSecondary, padding: token.padding, gap: token.marginXS }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: token.marginXS }}>
            {['👍', '❤️', '😄', '', '🙏'].map((e) => (
              <Pressable key={e} onPress={() => pickEmoji(e)} style={{ cursor: 'pointer', paddingHorizontal: 4 }}>
                <Text style={{ fontSize: 18 }}>{e}</Text>
              </Pressable>
            ))}
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: token.marginSM }}>
            <View style={{ flex: 1 }}>
              <Input
                value={draft}
                onChange={setDraft}
                placeholder="输入消息，回车发送"
                onKeyDown={(k) => { if (k === 'Enter') send(); }}
                suffix={<Icon name="smile" size={16} color={token.colorTextTertiary} />}
              />
            </View>
            <Pressable onPress={send} style={{ flexDirection: 'row', alignItems: 'center', gap: 6, height: 32, paddingHorizontal: 16, borderRadius: token.borderRadius, backgroundColor: draft.trim() ? token.colorPrimary : token.colorFill, cursor: 'pointer' }}>
              <Icon name="send" size={14} color={draft.trim() ? '#fff' : token.colorTextTertiary} />
              <Text style={{ fontSize: 13, color: draft.trim() ? '#fff' : token.colorTextTertiary }}>发送</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </View>
  );
}

function HeaderIcon(props: { token: AliasToken; name: string }): React.ReactElement {
  const { token } = props;
  return (
    <Pressable style={{ width: 30, height: 30, alignItems: 'center', justifyContent: 'center', borderRadius: token.borderRadius, cursor: 'pointer' }}>
      <Icon name={props.name} size={17} color={token.colorTextSecondary} />
    </Pressable>
  );
}

export default ChatDemo;
