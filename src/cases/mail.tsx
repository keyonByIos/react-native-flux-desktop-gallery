// cases/mail.tsx —— 「邮件客户端 Mail」整合案例（三栏）。
// 左=文件夹（收件箱/星标/已发送/草稿/垃圾/归档，未读计数 Badge），中=邮件列表（发件人头像/主题/摘要/时间/附件/未读点），右=阅读区（正文 + 回复框）。
// 交互：切文件夹过滤、点邮件标已读并选中、星标切换、搜索过滤，均为真实本地状态。全走 token 明暗自适应。
// 三栏用 plain flex 行（本渲染器横向 ScrollView 不按行排布），列表/正文各自纵向 ScrollView。数据为示例邮件（本类 App 无真实邮箱源）。
import React from 'react';
import {
  View,
  Text,
  Pressable,
  Icon,
  Input,
  ScrollView,
  Avatar,
  Tag,
  useToken,
  type AliasToken,
} from 'react-native-flux-desktop';

const FOLDER_W = 208;
const LIST_W = 356;

type FolderId = 'inbox' | 'star' | 'sent' | 'draft' | 'spam' | 'archive';

interface Mail {
  id: string;
  folder: Exclude<FolderId, 'star'>;
  from: string;
  email: string;
  color: string;
  subject: string;
  preview: string;
  body: string[];
  time: string;
  unread: boolean;
  starred: boolean;
  attach: boolean;
}

const FOLDERS: { id: FolderId; name: string; icon: string }[] = [
  { id: 'inbox', name: '收件箱', icon: 'inbox' },
  { id: 'star', name: '星标', icon: 'star' },
  { id: 'sent', name: '已发送', icon: 'send' },
  { id: 'draft', name: '草稿', icon: 'save' },
  { id: 'spam', name: '垃圾邮件', icon: 'alertCircle' },
  { id: 'archive', name: '归档', icon: 'folder' },
];

const SEED: Mail[] = [
  {
    id: 'm1', folder: 'inbox', from: '陈默', email: 'chenmo@flux.dev', color: '#52c41a',
    subject: 'KV 持久化接口已封好', preview: '你直接 kv.set / kv.get 就行，支持 json 与 string 两种类型…',
    body: ['看板与文件管理器的落盘都走这套接口，这块已经稳定，你可以放心在上面加字段。', 'kv.set("app", key, "json", obj) 会同步写入本地磁盘，重启后 loadBoard() 自动回灌，不用再手动持久化。', '读取侧统一走 kv.get，返回 { type, value } 或 null，记得对 null 做首启兜底，别直接解构。', '关于命名空间：不同案例用不同 key 前缀（board.kanban / board.fm…），避免互相覆盖，后面接云端同步也按这个划分。', '加密方案我下周给个草案，先按明文 json 跑通链路；如果里面要存敏感字段，先留好可扩展的编解码位。', '另外提醒一下，kv 是同步 API，别在渲染热路径里高频写，落盘前先 debounce，否则每帧都会拖 CPU。', '你先把这两个案例的落盘接上，跑一轮明暗双主题截图，有问题我们在周会上过。', '补一句：接云同步时把写入拆成“本地先写 + 后台上传”两段，断网时降级为仅本地，别把上传失败冒泡到 UI。', '测试样例我放了一个带附件的（周报那封），你可以拿它验证附件区的排版，以及滚到底部时回复框是否始终可见。'],
    time: '14:02', unread: true, starred: true, attach: false,
  },
  {
    id: 'm2', folder: 'inbox', from: '设计机器人', email: 'no-reply@design.io', color: '#eb2f96',
    subject: '本周设计令牌变更提醒（3 项）', preview: 'colorPrimary / borderRadiusLG / 暗色 colorFillSecondary 有调整…',
    body: ['变更 1：colorPrimary 微调饱和度，暗色下对比度 +4%。', '变更 2：borderRadiusLG 从 8 提升到 10，卡片更柔和。', '变更 3：暗色 colorFillSecondary 提亮一档，气泡更清晰。', '请在下次同步前核对你的案例是否引用了旧值。'],
    time: '13:20', unread: true, starred: false, attach: true,
  },
  {
    id: 'm3', folder: 'inbox', from: '林晚', email: 'linwan@flux.dev', color: '#1677ff',
    subject: 'Re: 音乐播放器交互细节', preview: '进度条拖动和自动切歌都很顺，均衡器动画能不能再快一点点？',
    body: ['刚试了下 music 案例，播放/暂停、上下曲、点选切歌都对。', '唯一想提的：左侧均衡器条跳动节奏稍慢，视觉上不够"活着"。', '不急，先把明暗两套主题截图发我归档。'],
    time: '11:47', unread: false, starred: true, attach: false,
  },
  {
    id: 'm4', folder: 'inbox', from: '运维告警', email: 'ops@flux.dev', color: '#fa8c16',
    subject: 'node-07 内存趋势周报', preview: '连续 7 天峰值 < 60%，扩容后稳定，无需处理。',
    body: ['本周 node-07 内存峰值 58%，均值 41%。', '自动扩容策略生效一次，负载已回落。', '无需人工介入。'],
    time: '09:15', unread: false, starred: false, attach: true,
  },
  {
    id: 'm5', folder: 'sent', from: '我 → 产品组', email: 'product@flux.dev', color: '#13c2c2',
    subject: 'Gallery 案例新增计划', preview: '本周补齐 Chat / Kanban / Music 三个整合案例…',
    body: ['同步一下进度：Chat、Kanban、Music 已完成并登记。', '下一步补 Mail / Checkout / Settings。', '所有案例统一走 token，明暗双主题抓帧复查。'],
    time: '昨天', unread: false, starred: false, attach: false,
  },
  {
    id: 'm6', folder: 'draft', from: '草稿', email: '', color: '#8c8c8c',
    subject: '（未命名草稿）', preview: '关于命令面板 fzf 打分的补充说明——',
    body: ['关于命令面板 fzf 打分的补充说明——', '（此处继续编辑…）'],
    time: '周一', unread: false, starred: false, attach: false,
  },
  {
    id: 'm7', folder: 'spam', from: '中奖通知', email: 'prize@spam.xyz', color: '#f5222d',
    subject: '恭喜您获得大奖，点击领取', preview: '【垃圾邮件已自动折叠，请勿点击任何链接】',
    body: ['该邮件已被判定为垃圾邮件。', '为演示安全，正文已脱敏，不提供任何可交互链接。'],
    time: '08:00', unread: true, starred: false, attach: false,
  },
  {
    id: 'm8', folder: 'archive', from: 'HR', email: 'hr@flux.dev', color: '#722ed1',
    subject: '季度团建安排（已归档）', preview: '时间地点确认邮件，归档留存。',
    body: ['团建时间：本月最后一个周五。', '本邮件已归档，仅作留存参考。'],
    time: '09-20', unread: false, starred: false, attach: false,
  },
];

function initials(name: string): string {
  return name.replace(/^我\s*→\s*/, '').slice(0, name.length >= 3 ? 2 : 1);
}

export function MailDemo(): React.ReactElement {
  const { token } = useToken();
  const [mails, setMails] = React.useState<Mail[]>(SEED);
  const [folder, setFolder] = React.useState<FolderId>('inbox');
  const [selId, setSelId] = React.useState<string>('m1');
  const [q, setQ] = React.useState('');

  const inFolder = folder === 'star' ? mails.filter((m) => m.starred) : mails.filter((m) => m.folder === folder);
  const list = q.trim()
    ? inFolder.filter((m) => m.subject.includes(q.trim()) || m.from.includes(q.trim()))
    : inFolder;
  const sel = mails.find((m) => m.id === selId && list.some((x) => x.id === m.id)) ?? list[0];

  const unreadCount = (id: FolderId): number => {
    const base = id === 'star' ? mails.filter((m) => m.starred) : mails.filter((m) => m.folder === id);
    return base.filter((m) => m.unread).length;
  };

  const openMail = (id: string): void => {
    setSelId(id);
    setMails((prev) => prev.map((m) => (m.id === id ? { ...m, unread: false } : m)));
  };

  const toggleStar = (id: string): void => {
    setMails((prev) => prev.map((m) => (m.id === id ? { ...m, starred: !m.starred } : m)));
  };

  const folderName = FOLDERS.find((f) => f.id === folder)?.name ?? '';

  return (
    <View style={{ flex: 1, flexDirection: 'row', backgroundColor: token.colorBgContainer }}>
      {/* 左：文件夹 */}
      <View style={{ width: FOLDER_W, borderRightWidth: token.lineWidth, borderRightColor: token.colorBorderSecondary, padding: token.paddingSM }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: token.marginXS, paddingHorizontal: 8, paddingVertical: 8 }}>
          <Icon name="mail" size={16} color={token.colorPrimary} />
          <Text style={{ fontSize: token.fontSize, fontWeight: '600', color: token.colorText }}>邮箱</Text>
        </View>
        <View style={{ gap: 2 }}>
          {FOLDERS.map((f) => {
            const on = f.id === folder;
            const uc = unreadCount(f.id);
            return (
              <Pressable key={f.id} onPress={() => setFolder(f.id)} style={{ flexDirection: 'row', alignItems: 'center', gap: token.marginSM, paddingHorizontal: 10, paddingVertical: 8, borderRadius: token.borderRadius, backgroundColor: on ? token.colorFillSecondary : 'transparent', cursor: 'pointer' }}>
                <Icon name={f.icon} size={15} color={on ? token.colorPrimary : token.colorTextSecondary} />
                <Text style={{ flex: 1, fontSize: 13, fontWeight: on ? '600' : '400', color: on ? token.colorPrimary : token.colorText }}>{f.name}</Text>
                {uc > 0 ? <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: token.colorPrimary }} /> : null}
              </Pressable>
            );
          })}
        </View>
      </View>

      {/* 中：邮件列表 */}
      <View style={{ width: LIST_W, borderRightWidth: token.lineWidth, borderRightColor: token.colorBorderSecondary }}>
        <View style={{ padding: token.padding, paddingBottom: token.paddingXS, gap: token.marginXS }}>
          <Text style={{ fontSize: token.fontSizeLG, fontWeight: '600', color: token.colorText }}>{folderName}</Text>
          <Input value={q} onChange={setQ} placeholder="搜索主题 / 发件人" size="small" allowClear prefix={<Icon name="search" size={14} color={token.colorTextTertiary} />} />
        </View>
        <ScrollView style={{ flex: 1, minHeight: 0 }}>
          {list.map((m) => {
            const on = sel?.id === m.id;
            return (
              <Pressable key={m.id} onPress={() => openMail(m.id)} style={{ flexDirection: 'row', gap: token.marginSM, padding: token.padding, paddingVertical: 11, borderBottomWidth: token.lineWidth, borderBottomColor: token.colorBorderSecondary, backgroundColor: on ? token.colorFillSecondary : 'transparent', cursor: 'pointer' }}>
                <View style={{ alignItems: 'center', paddingTop: 2 }}>
                  <Avatar size={36} shape="circle" backgroundColor={m.color}>{initials(m.from)}</Avatar>
                </View>
                <View style={{ flex: 1, minWidth: 0 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <Text style={{ flex: 1, fontSize: 13, fontWeight: m.unread ? '700' : '500', color: token.colorText }} numberOfLines={1}>{m.from}</Text>
                    {m.attach ? <Icon name="download" size={12} color={token.colorTextQuaternary} /> : null}
                    <Text style={{ fontSize: 11, color: token.colorTextTertiary }}>{m.time}</Text>
                  </View>
                  <Text style={{ fontSize: 13, fontWeight: m.unread ? '600' : '400', color: token.colorText, marginTop: 2 }} numberOfLines={1}>{m.subject}</Text>
                  <Text style={{ fontSize: 12, color: token.colorTextTertiary, marginTop: 2 }} numberOfLines={1}>{m.preview}</Text>
                </View>
                <Pressable onPress={() => toggleStar(m.id)} style={{ alignSelf: 'flex-start', padding: 2, cursor: 'pointer' }}>
                  <Icon name="star" size={15} color={m.starred ? '#faad14' : token.colorTextQuaternary} />
                </Pressable>
              </Pressable>
            );
          })}
          {!list.length ? (
            <View style={{ padding: token.paddingLG, alignItems: 'center' }}>
              <Text style={{ fontSize: 12, color: token.colorTextTertiary }}>该文件夹为空</Text>
            </View>
          ) : null}
        </ScrollView>
      </View>

      {/* 右：阅读区 */}
      <View style={{ flex: 1, minWidth: 0 }}>
        {sel ? (
          <View style={{ flex: 1 }}>
            <View style={{ paddingHorizontal: token.paddingLG, paddingTop: token.paddingLG, paddingBottom: token.padding, borderBottomWidth: token.lineWidth, borderBottomColor: token.colorBorderSecondary, gap: token.marginXS }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: token.marginSM }}>
                <Text style={{ flex: 1, fontSize: token.fontSizeLG, fontWeight: '600', color: token.colorText }} numberOfLines={1}>{sel.subject}</Text>
                <ReadAction token={token} name="edit" />
                <ReadAction token={token} name="star" active={sel.starred} on onPress={() => toggleStar(sel.id)} />
                <ReadAction token={token} name="inbox" />
                <ReadAction token={token} name="delete" />
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: token.marginSM }}>
                <Avatar size={32} shape="circle" backgroundColor={sel.color}>{initials(sel.from)}</Avatar>
                <View style={{ flex: 1, minWidth: 0 }}>
                  <Text style={{ fontSize: 13, color: token.colorText }}>{sel.from}{sel.email ? ` <${sel.email}>` : ''}</Text>
                </View>
                <Text style={{ fontSize: 12, color: token.colorTextTertiary }}>{sel.time}</Text>
              </View>
            </View>
            <View style={{ flex: 1, minHeight: 0 }}>
              <ScrollView style={{ flex: 1, minHeight: 0, padding: token.paddingMD }} contentContainerStyle={{ paddingVertical: token.paddingLG + token.margin, paddingHorizontal: token.paddingLG + token.marginSM, gap: token.marginLG, justifyContent: 'flex-start' }}>
              {sel.body.map((p, i) => (
                <Text key={i} style={{ fontSize: 14, lineHeight: 24, color: token.colorText, maxWidth: 640 }}>{p}</Text>
              ))}
              {sel.attach ? (
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: token.marginXS, padding: token.paddingSM, borderRadius: token.borderRadius, borderWidth: token.lineWidth, borderColor: token.colorBorderSecondary, alignSelf: 'flex-start' }}>
                  <Icon name="download" size={14} color={token.colorPrimary} />
                  <Text style={{ fontSize: 12, color: token.colorTextSecondary }}>附件 · 周报.pdf</Text>
                  <Tag color={token.colorPrimary} textColor="#fff" style={{ margin: 0 }}>2.1 MB</Tag>
                </View>
              ) : null}
            </ScrollView>
            </View>
            <View style={{ borderTopWidth: token.lineWidth, borderTopColor: token.colorBorderSecondary, padding: token.padding, gap: token.marginXS }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: token.marginSM }}>
                <Icon name="send" size={15} color={token.colorTextSecondary} />
                <Text style={{ fontSize: 12, color: token.colorTextTertiary }}>回复给 {sel.from}</Text>
              </View>
              <Input placeholder="输入回复内容…" suffix={<Icon name="edit" size={15} color={token.colorTextTertiary} />} />
            </View>
          </View>
        ) : (
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="mail" size={40} color={token.colorTextQuaternary} />
            <Text style={{ fontSize: 13, color: token.colorTextTertiary, marginTop: token.marginSM }}>选择一封邮件阅读</Text>
          </View>
        )}
      </View>
    </View>
  );
}

function ReadAction(props: { token: AliasToken; name: string; active?: boolean; on?: boolean; onPress?: () => void }): React.ReactElement {
  const { token } = props;
  return (
    <Pressable onPress={props.onPress} style={{ width: 30, height: 30, alignItems: 'center', justifyContent: 'center', borderRadius: token.borderRadius, cursor: 'pointer' }}>
      <Icon name={props.name} size={16} color={props.active ? '#faad14' : token.colorTextSecondary} />
    </Pressable>
  );
}

export default MailDemo;
