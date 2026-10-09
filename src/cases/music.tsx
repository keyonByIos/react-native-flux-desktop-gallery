// cases/music.tsx —— 「音乐播放器 Music Player」整合案例。
// 左=播放列表（封面色块 + 曲名/艺术家/时长，当前曲高亮 + 均衡器条），右=现播（大封面 + 进度 Slider + 传输控制 + 音量 + 喜欢）。
// 真实本地交互：播放/暂停用 setInterval 每秒推进进度，到点自动切下一曲；上下曲、点选切歌、拖动进度、音量、喜欢均为真实状态。
// 数据为示例曲库（本类 App 无真实音频源，纯 UI/状态演示）。全走 token 明暗自适应。
import React from 'react';
import {
  View,
  Text,
  Pressable,
  Icon,
  Slider,
  ScrollView,
  useToken,
  type AliasToken,
} from 'react-native-flux-desktop';

const LIST_W = 348;

interface Track {
  id: string;
  title: string;
  artist: string;
  album: string;
  dur: number; // 秒
  color: string;
}

const TRACKS: Track[] = [
  { id: 't1', title: '夜航星', artist: '落日飞车', album: 'Romance of Fauna', dur: 253, color: '#7b5cff' },
  { id: 't2', title: 'Mellow Tide', artist: 'Cigarettes After Sex', album: 'Cry', dur: 288, color: '#2f7ed8' },
  { id: 't3', title: '山丘之上', artist: '陈粒', album: '小梦大半', dur: 231, color: '#13a67a' },
  { id: 't4', title: 'Sunflower', artist: 'Harry Styles', album: 'Fine Line', dur: 155, color: '#e8871e' },
  { id: 't5', title: '晚风不识字', artist: '任然', album: '谅解', dur: 244, color: '#d6407f' },
  { id: 't6', title: 'Cornfield Chase', artist: 'Hans Zimmer', album: 'Interstellar', dur: 127, color: '#4a5a7a' },
  { id: 't7', title: '霓虹甜心', artist: '马赛克', album: 'No.1', dur: 219, color: '#c0392b' },
  { id: 't8', title: 'Redbone', artist: 'Childish Gambino', album: 'Awaken', dur: 327, color: '#8a5a2b' },
];

function fmt(s: number): string {
  const m = Math.floor(s / 60);
  const ss = Math.floor(s % 60);
  return `${m}:${`${ss}`.padStart(2, '0')}`;
}

export function MusicDemo(): React.ReactElement {
  const { token } = useToken();
  const [idx, setIdx] = React.useState(0);
  const [playing, setPlaying] = React.useState(true);
  const [pos, setPos] = React.useState(42);
  const [vol, setVol] = React.useState(70);
  const [liked, setLiked] = React.useState<Record<string, boolean>>({ t1: true });

  const cur = TRACKS[idx];

  const goto = (i: number): void => {
    setIdx(((i % TRACKS.length) + TRACKS.length) % TRACKS.length);
    setPos(0);
    setPlaying(true);
  };

  React.useEffect(() => {
    if (!playing) return;
    const t = setInterval(() => {
      setPos((p) => {
        if (p + 1 >= cur.dur) {
          setIdx((i) => (i + 1) % TRACKS.length);
          return 0;
        }
        return p + 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [playing, cur.dur]);

  const select = (i: number): void => {
    if (i === idx) {
      setPlaying((p) => !p);
      return;
    }
    setIdx(i);
    setPos(0);
    setPlaying(true);
  };

  return (
    <View style={{ flex: 1, flexDirection: 'row', backgroundColor: token.colorBgContainer }}>
      {/* 左：播放列表 */}
      <View style={{ width: LIST_W, borderRightWidth: token.lineWidth, borderRightColor: token.colorBorderSecondary }}>
        <View style={{ height: 56, flexDirection: 'row', alignItems: 'center', paddingHorizontal: token.paddingLG, gap: token.marginXS, borderBottomWidth: token.lineWidth, borderBottomColor: token.colorBorderSecondary }}>
          <Icon name="list" size={16} color={token.colorPrimary} />
          <Text style={{ fontSize: token.fontSize, fontWeight: '600', color: token.colorText }}>播放列表</Text>
          <View style={{ flex: 1 }} />
          <Text style={{ fontSize: 12, color: token.colorTextTertiary }}>{TRACKS.length} 首</Text>
        </View>
        <ScrollView style={{ flex: 1 }}>
          {TRACKS.map((t, i) => {
            const on = i === idx;
            return (
              <Pressable key={t.id} onPress={() => select(i)} style={{ flexDirection: 'row', alignItems: 'center', gap: token.marginSM, paddingHorizontal: token.padding, paddingVertical: 9, backgroundColor: on ? token.colorFillSecondary : 'transparent', cursor: 'pointer' }}>
                <View style={{ width: 36, height: 36, borderRadius: token.borderRadiusSM, alignItems: 'center', justifyContent: 'center', backgroundColor: t.color }}>
                  {on && playing ? <Equalizer token={token} /> : <Icon name="music" size={15} color="#fff" />}
                </View>
                <View style={{ flex: 1, minWidth: 0 }}>
                  <Text style={{ fontSize: 13, fontWeight: on ? '600' : '400', color: on ? token.colorPrimary : token.colorText }} numberOfLines={1}>{t.title}</Text>
                  <Text style={{ fontSize: 11, color: token.colorTextTertiary, marginTop: 1 }} numberOfLines={1}>{t.artist}</Text>
                </View>
                <Text style={{ fontSize: 11, color: token.colorTextQuaternary }}>{fmt(t.dur)}</Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      {/* 右：现播 */}
      <View style={{ flex: 1, minWidth: 0, alignItems: 'center', justifyContent: 'center', padding: token.paddingXL, gap: token.marginLG }}>
        {/* 大封面 */}
        <View style={{ width: 236, height: 236, borderRadius: token.borderRadiusLG * 2, alignItems: 'center', justifyContent: 'center', backgroundColor: cur.color }}>
          <View style={{ width: 168, height: 168, borderRadius: 84, borderWidth: 2, borderColor: 'rgba(255,255,255,0.35)', alignItems: 'center', justifyContent: 'center' }}>
            <View style={{ width: 56, height: 56, borderRadius: 28, backgroundColor: 'rgba(255,255,255,0.9)', alignItems: 'center', justifyContent: 'center' }}>
              <Icon name="music" size={26} color={cur.color} />
            </View>
          </View>
        </View>

        {/* 曲名 / 艺术家 */}
        <View style={{ alignItems: 'center', gap: 4 }}>
          <Text style={{ fontSize: token.fontSizeXL, fontWeight: '700', color: token.colorText }}>{cur.title}</Text>
          <Text style={{ fontSize: 13, color: token.colorTextSecondary }}>{cur.artist} · {cur.album}</Text>
        </View>

        {/* 进度 */}
        <View style={{ width: '82%', alignSelf: 'center' }}>
          <Slider min={0} max={cur.dur} value={pos} onChange={setPos} />
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 2 }}>
            <Text style={{ fontSize: 11, color: token.colorTextTertiary }}>{fmt(pos)}</Text>
            <Text style={{ fontSize: 11, color: token.colorTextTertiary }}>-{fmt(Math.max(0, cur.dur - pos))}</Text>
          </View>
        </View>

        {/* 传输控制 */}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: token.marginLG }}>
          <CtrlBtn token={token} name="sync" size={18} active={false} onPress={() => {}} />
          <CtrlBtn token={token} name="skipBack" size={22} onPress={() => goto(idx - 1)} />
          <Pressable onPress={() => setPlaying((p) => !p)} style={{ width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center', backgroundColor: token.colorPrimary, cursor: 'pointer' }}>
            <Icon name={playing ? 'pauseCircle-filled' : 'playCircle-filled'} size={40} color="#fff" />
          </Pressable>
          <CtrlBtn token={token} name="skipForward" size={22} onPress={() => goto(idx + 1)} />
          <Pressable onPress={() => setLiked((l) => ({ ...l, [cur.id]: !l[cur.id] }))} style={{ cursor: 'pointer' }}>
            <Icon name={liked[cur.id] ? 'heart-filled' : 'heart'} size={18} color={liked[cur.id] ? token.colorError : token.colorTextSecondary} />
          </Pressable>
        </View>

        {/* 音量 */}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: token.marginSM, width: '56%', alignSelf: 'center' }}>
          <Icon name="volume1" size={16} color={token.colorTextTertiary} />
          <View style={{ flex: 1 }}>
            <Slider min={0} max={100} value={vol} onChange={setVol} />
          </View>
          <Text style={{ fontSize: 11, color: token.colorTextTertiary, width: 28, textAlign: 'right' }}>{vol}</Text>
        </View>
      </View>
    </View>
  );
}

function Equalizer(props: { token: AliasToken }): React.ReactElement {
  const hs = [8, 14, 6, 11];
  return (
    <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 2, height: 16 }}>
      {hs.map((h, i) => (
        <View key={i} style={{ width: 3, height: h, borderRadius: 1.5, backgroundColor: '#fff' }} />
      ))}
    </View>
  );
}

function CtrlBtn(props: { token: AliasToken; name: string; size: number; active?: boolean; onPress: () => void }): React.ReactElement {
  const { token } = props;
  return (
    <Pressable onPress={props.onPress} style={{ width: 40, height: 40, alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
      <Icon name={props.name} size={props.size} color={props.active ? token.colorPrimary : token.colorTextSecondary} />
    </Pressable>
  );
}

export default MusicDemo;
