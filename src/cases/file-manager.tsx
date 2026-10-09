// cases/file-manager.tsx —— 「文件管理器 + 快速预览」整合案例（一期）。
// 三栏 Splitter：左=懒加载目录树(Tree) · 中=文件列表(VirtualList) · 右=按类型分派的快速预览。
// 数据全部走 file-manager-lib 的真实 fs 读取（纯 Node），不造假；图片预览用 <Image source=绝对路径>，
// 代码/文本用自绘 CodeView 纯文本预览（长行自动换行 + 行数上限；因库 CodeBlock 对 CJK 宽字符会撞行叠字，故不自绘逐 token 上色）。
import React from 'react';
import path from 'path';
import {
  View,
  Text,
  Image,
  Pressable,
  Icon,
  ScrollView,
  Splitter,
  Tree,
  VirtualList,
  useToken,
  writeClipboard,
  type TreeNode,
  type AliasToken,
} from 'react-native-flux-desktop';
import {
  listDir,
  subDirs,
  parentOf,
  isRoot,
  roots,
  homeDir,
  kindOf,
  readText,
  countItems,
  fmtSize,
  fmtDate,
  baseName,
  type FSEntry,
} from './file-manager-lib';

const { Panel } = Splitter;

// —— 纵向几何：整体高跟随窗口（外层 flex:1 + onLayout 实测喂给 VirtualList/预览）；下面是各固定条带高，DEFAULT_H 仅首帧兜底 ——
const DEFAULT_H = 560; // 首帧/无界父容器下的兜底高（实测后会被窗口可用高覆盖）
const HDR_H = 40; // 中栏顶栏（工具条）
const COL_H = 24; // 中栏列头
const FOOT_H = 26; // 中栏底栏
const ROW_H = 32; // 文件行高
const PV_H = 36; // 右栏标题
const ICON_SIZE = 16;

/** 图标名：目录/代码/文本/图片/其它（image 无专属图标，用 eye 代）。 */
function iconFor(e: FSEntry): string {
  if (e.isDir) return 'folder';
  const k = kindOf(e);
  if (k === 'code') return 'code';
  if (k === 'text') return 'fileText';
  if (k === 'image') return 'eye';
  return 'file';
}
function iconColor(e: FSEntry, token: AliasToken): string {
  if (e.isDir) return token.colorWarning;
  const k = kindOf(e);
  if (k === 'code') return token.colorPrimary;
  if (k === 'image') return token.colorSuccess;
  return token.colorTextTertiary;
}

/** 面包屑：把绝对路径拆成可点击的逐级段。 */
function trail(dir: string): { label: string; path: string }[] {
  const segs: { label: string; path: string }[] = [];
  if (process.platform === 'win32') {
    const m = dir.match(/^([A-Za-z]:\\)(.*)$/);
    if (m) {
      segs.push({ label: m[1], path: m[1] });
      let acc = m[1];
      for (const part of m[2].split('\\').filter(Boolean)) {
        acc = path.join(acc, part);
        segs.push({ label: part, path: acc });
      }
      return segs;
    }
    let acc = '';
    for (const part of dir.split('\\').filter(Boolean)) {
      acc = acc ? path.join(acc, part) : part;
      segs.push({ label: part, path: acc });
    }
    return segs;
  }
  segs.push({ label: '/', path: '/' });
  let acc = '';
  for (const part of dir.split('/').filter(Boolean)) {
    acc += '/' + part;
    segs.push({ label: part, path: acc });
  }
  return segs;
}

// —————————————————————————— 左：懒加载目录树 ——————————————————————————
function DirTree(props: { dir: string; onPick: (p: string) => void }): React.ReactElement {
  const { token } = useToken();
  const rootPaths = React.useMemo(() => roots().map((r) => r.path), []);
  const [loaded, setLoaded] = React.useState<Record<string, string[]>>({});
  const [expanded, setExpanded] = React.useState<string[]>([]);

  const nodeFor = (p: string): TreeNode => {
    const kids = loaded[p];
    if (kids === undefined) {
      // 未加载：给一个不可选占位子节点，令展开箭头出现
      return { key: p, title: baseName(p), children: [{ key: `${p}\u0000ld`, title: '…', selectable: false }] };
    }
    if (kids.length === 0) return { key: p, title: baseName(p) };
    return { key: p, title: baseName(p), children: kids.map(nodeFor) };
  };
  const treeData = rootPaths.map(nodeFor);

  const onExpand = (keys: string[]): void => {
    setExpanded(keys);
    const need = keys.filter((k) => loaded[k] === undefined);
    if (need.length) {
      setLoaded((prev) => {
        const next = { ...prev };
        for (const k of need) next[k] = subDirs(k).map((e) => e.path);
        return next;
      });
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <View style={{ height: HDR_H, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8 }}>
        <Icon name="hardDrive" size={ICON_SIZE} color={token.colorTextSecondary} />
        <Text style={{ marginLeft: 6, fontSize: 13, fontWeight: '600', color: token.colorText }}>位置</Text>
      </View>
      <ScrollView style={{ flex: 1 }}>
        <Tree
          treeData={treeData}
          expandedKeys={expanded}
          onExpand={onExpand}
          selectedKeys={[props.dir]}
          onSelect={(keys) => {
            if (keys.length) props.onPick(keys[0]);
          }}
        />
      </ScrollView>
    </View>
  );
}

// —————————————————————————— 中：文件列表 ——————————————————————————
function FileRow(props: { e: FSEntry; selected: boolean; token: AliasToken; onPress: () => void }): React.ReactElement {
  const { e, token } = props;
  return (
    <Pressable
      onPress={props.onPress}
      style={{
        height: ROW_H,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 8,
        overflow: 'hidden',
        borderRadius: token.borderRadiusSM,
        backgroundColor: props.selected ? token.colorFillSecondary : 'transparent',
        cursor: 'pointer',
      }}
    >
      <Icon name={iconFor(e)} size={ICON_SIZE} color={iconColor(e, token)} />
      <Text style={{ marginLeft: 8, flex: 1, fontSize: 13, lineHeight: 18, color: token.colorText }}>{e.name}</Text>
      <Text style={{ width: 72, textAlign: 'right', fontSize: 12, lineHeight: 18, color: token.colorTextTertiary }}>
        {e.isDir ? '' : fmtSize(e.size)}
      </Text>
      <Text style={{ width: 116, textAlign: 'right', fontSize: 12, lineHeight: 18, color: token.colorTextQuaternary }}>
        {fmtDate(e.mtimeMs)}
      </Text>
    </Pressable>
  );
}

function FileList(props: {
  dir: string;
  nonce: number;
  listH: number;
  selected: FSEntry | null;
  onEnter: (p: string) => void;
  onPick: (e: FSEntry) => void;
}): React.ReactElement {
  const { token } = useToken();
  const entries = React.useMemo(() => listDir(props.dir), [props.dir, props.nonce]);

  const toolBtn = (icon: string, enabled: boolean, onPress: () => void): React.ReactElement => (
    <Pressable
      onPress={enabled ? onPress : undefined}
      style={{
        width: 26,
        height: 26,
        marginLeft: 4,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: token.borderRadiusSM,
        opacity: enabled ? 1 : 0.35,
        cursor: enabled ? 'pointer' : 'default',
      }}
    >
      <Icon name={icon} size={ICON_SIZE} color={token.colorTextSecondary} />
    </Pressable>
  );

  return (
    <View style={{ flex: 1 }}>
      {/* 工具条：上一级 / 主目录 / 刷新 + 计数 */}
      <View style={{ height: HDR_H, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8 }}>
        {toolBtn('arrowUp', !isRoot(props.dir), () => props.onEnter(parentOf(props.dir)))}
        {toolBtn('home', true, () => props.onEnter(homeDir()))}
        {toolBtn('refreshCw', true, () => props.onEnter(props.dir))}
        <View style={{ flex: 1 }} />
        <Text style={{ fontSize: 12, color: token.colorTextTertiary }}>
          {entries.length} 项 · {entries.filter((e) => e.isDir).length} 目录
        </Text>
      </View>
      {/* 列头 */}
      <View style={{ height: COL_H, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, borderBottomWidth: token.lineWidth, borderBottomColor: token.colorBorderSecondary }}>
        <Text style={{ fontSize: 11, color: token.colorTextTertiary }}>名称</Text>
        <View style={{ flex: 1 }} />
        <Text style={{ width: 72, textAlign: 'right', fontSize: 11, color: token.colorTextTertiary }}>大小</Text>
        <Text style={{ width: 116, marginLeft: 12, textAlign: 'right', fontSize: 11, color: token.colorTextTertiary }}>修改时间</Text>
      </View>
      {/* 列表（虚拟化） */}
      {entries.length ? (
        <VirtualList<FSEntry>
          data={entries}
          rowHeight={ROW_H}
          height={props.listH}
          overscan={6}
          renderItem={(e) => (
            <FileRow
              e={e}
              token={token}
              selected={props.selected?.path === e.path}
              onPress={() => (e.isDir ? props.onEnter(e.path) : props.onPick(e))}
            />
          )}
        />
      ) : (
        <View style={{ height: props.listH, alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ fontSize: 13, color: token.colorTextTertiary }}>空目录或无读取权限</Text>
        </View>
      )}
      {/* 底栏：当前路径 */}
      <View style={{ height: FOOT_H, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8 }}>
        <Text style={{ flex: 1, fontSize: 11, color: token.colorTextQuaternary }} numberOfLines={1}>
          {props.dir}
        </Text>
      </View>
    </View>
  );
}

// —————————————————————————— 右：快速预览 ——————————————————————————
function MetaRow(props: { label: string; value: string; token: AliasToken }): React.ReactElement {
  const { token } = props;
  return (
    <View style={{ flexDirection: 'row', paddingVertical: 4 }}>
      <Text style={{ width: 64, fontSize: 12, color: token.colorTextTertiary }}>{props.label}</Text>
      <Text style={{ flex: 1, fontSize: 12, color: token.colorText }}>{props.value}</Text>
    </View>
  );
}

/** 代码/文本预览：自绘单块等宽 Text（避开库 CodeBlock 对 CJK 宽字符的测宽撞行 bug），纵向滚动 + 行数上限。 */
function CodeView(props: { text: string; token: AliasToken; height: number; truncated: boolean }): React.ReactElement {
  const CAP = 3000;
  const lines = props.text.split('\n');
  const capped = lines.length > CAP;
  const shown = capped ? lines.slice(0, CAP).join('\n') : props.text;
  const noteStyle = { fontSize: 11, lineHeight: 18, color: props.token.colorWarning };
  return (
    <View style={{ height: props.height, paddingHorizontal: 8, paddingBottom: 8 }}>
      <ScrollView style={{ flex: 1 }}>
        <Text style={{ fontSize: 12, lineHeight: 18, color: props.token.colorText }}>{shown}</Text>
        {capped ? <Text style={noteStyle}>… 仅显示前 {CAP} 行</Text> : null}
        {!capped && props.truncated ? <Text style={noteStyle}>文件较大，仅预览前 256KB</Text> : null}
      </ScrollView>
    </View>
  );
}

function PreviewPane(props: { sel: FSEntry | null; dir: string; paneH: number }): React.ReactElement {
  const { token } = useToken();
  const sel = props.sel;
  const body = Math.max(120, props.paneH - PV_H); // 右栏内容高（标题条以下）

  const head = (title: string): React.ReactElement => (
    <View style={{ height: PV_H, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, borderBottomWidth: token.lineWidth, borderBottomColor: token.colorBorderSecondary }}>
      <Text style={{ flex: 1, fontSize: 13, fontWeight: '600', color: token.colorText }} numberOfLines={1}>
        {title}
      </Text>
      {sel ? (
        <Pressable
          onPress={() => writeClipboard(sel.path)}
          style={{ width: 24, height: 24, alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
        >
          <Icon name="copy" size={14} color={token.colorTextTertiary} />
        </Pressable>
      ) : null}
    </View>
  );

  if (!sel) {
    // 未选中文件：展示当前目录信息
    const n = countItems(props.dir);
    return (
      <View style={{ flex: 1 }}>
        {head('预览')}
        <View style={{ padding: 12 }}>
          <MetaRow label="位置" value={baseName(props.dir)} token={token} />
          <MetaRow label="路径" value={props.dir} token={token} />
          <MetaRow label="条目" value={n >= 0 ? `${n} 项` : '不可读'} token={token} />
          <Text style={{ marginTop: 16, fontSize: 12, lineHeight: 20, color: token.colorTextTertiary }}>
            点击左侧文件即可预览：图片直接显示，代码 / 文本以纯文本预览，其它显示元信息。
          </Text>
        </View>
      </View>
    );
  }

  const k = kindOf(sel);

  if (k === 'image') {
    return (
      <View style={{ flex: 1 }}>
        {head(sel.name)}
        <View style={{ flex: 1, padding: 8, alignItems: 'center', justifyContent: 'center' }}>
          <Image source={sel.path} resizeMode="contain" style={{ width: '100%', height: body - 24 }} />
        </View>
      </View>
    );
  }

  if (k === 'code' || k === 'text') {
    const r = readText(sel.path);
    if (r.error) {
      return (
        <View style={{ flex: 1 }}>
          {head(sel.name)}
          <View style={{ padding: 12 }}>
            <Text style={{ fontSize: 12, color: token.colorErrorText }}>无法读取该文件（权限或编码问题）。</Text>
          </View>
        </View>
      );
    }
    if (r.binary) {
      return (
        <View style={{ flex: 1 }}>
          {head(sel.name)}
          <View style={{ padding: 12 }}>
            <Text style={{ fontSize: 12, color: token.colorTextTertiary }}>疑似二进制文件，不做文本预览。</Text>
          </View>
        </View>
      );
    }
    return (
      <View style={{ flex: 1 }}>
        {head(sel.name)}
        <CodeView text={r.text} token={token} height={body - 8} truncated={r.truncated} />
      </View>
    );
  }

  // other / 文件元信息
  return (
    <View style={{ flex: 1 }}>
      {head(sel.name)}
      <View style={{ padding: 12 }}>
        <MetaRow label="类型" value={sel.ext ? `.${sel.ext}` : '未知'} token={token} />
        <MetaRow label="大小" value={fmtSize(sel.size)} token={token} />
        <MetaRow label="修改" value={fmtDate(sel.mtimeMs)} token={token} />
        <MetaRow label="路径" value={sel.path} token={token} />
      </View>
    </View>
  );
}

// —————————————————————————— 组装 ——————————————————————————
export function FileManagerDemo(): React.ReactElement {
  const { token } = useToken();
  const [dir, setDir] = React.useState<string>(() => homeDir());
  const [selected, setSelected] = React.useState<FSEntry | null>(null);
  const [nonce, setNonce] = React.useState(0);
  const [paneH, setPaneH] = React.useState(DEFAULT_H); // 三栏实测高（初帧兜底，onLayout 后跟随窗口）

  const enter = (p: string): void => {
    setDir(p);
    setSelected(null);
    setNonce((n) => n + 1);
  };

  const listH = Math.max(80, paneH - HDR_H - COL_H - FOOT_H); // 中栏列表可视高

  return (
    <View style={{ flex: 1, gap: token.marginSM }}>
      {/* 面包屑 */}
      <View style={{ flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        {trail(dir).map((s, i, arr) => (
          <React.Fragment key={s.path}>
            <Pressable onPress={() => enter(s.path)} style={{ paddingHorizontal: 4, paddingVertical: 2, cursor: 'pointer' }}>
              <Text style={{ fontSize: 12, color: i === arr.length - 1 ? token.colorText : token.colorLink }}>{s.label}</Text>
            </Pressable>
            {i < arr.length - 1 ? <Text style={{ fontSize: 12, color: token.colorTextQuaternary }}>›</Text> : null}
          </React.Fragment>
        ))}
      </View>

      {/* 三栏：flex:1 撑满可用高，onLayout 实测回喂 VirtualList/预览（无界父容器下保留 DEFAULT_H 兜底） */}
      <View
        onLayout={(e: { nativeEvent: { layout: { h: number } } }) => {
          const h = Math.round(e.nativeEvent.layout.h);
          if (h > 120) setPaneH((prev) => (prev === h ? prev : h));
        }}
        style={{ flex: 1, minHeight: 0, borderRadius: token.borderRadiusLG, borderWidth: token.lineWidth, borderColor: token.colorBorderSecondary, overflow: 'hidden' }}
      >
        <Splitter layout="horizontal" style={{ height: paneH }}>
          <Panel defaultSize={22} collapsible>
            <View style={{ flex: 1, backgroundColor: token.colorBgContainer }}>
              <DirTree dir={dir} onPick={enter} />
            </View>
          </Panel>
          <Panel defaultSize={46} collapsible>
            <View style={{ flex: 1, backgroundColor: token.colorBgContainer }}>
              <FileList dir={dir} nonce={nonce} listH={listH} selected={selected} onEnter={enter} onPick={setSelected} />
            </View>
          </Panel>
          <Panel defaultSize={32} collapsible>
            <View style={{ flex: 1, backgroundColor: token.colorBgContainer }}>
              <PreviewPane sel={selected} dir={dir} paneH={paneH} />
            </View>
          </Panel>
        </Splitter>
      </View>
    </View>
  );
}

export default FileManagerDemo;
