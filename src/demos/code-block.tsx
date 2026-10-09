// 开发 / 代码块：只读代码展示，零依赖轻量高亮 + 行号 + 复制 + 软换行。
// 颜色全部走语义 token → 明暗主题自适应；等宽体 'Flux Mono' 不含 CJK，代码内容以 ASCII 为主。
import React from 'react';
import { View, Text, Switch, useToken } from 'react-native-flux-desktop';
import { CodeBlock } from 'react-native-flux-desktop-dev';
import { DemoPage, type DemoItem, type ApiRow, type TokenRow } from '../DemoPage';

const CODE_TS = [
  '// 状态机：把事件流折叠成可序列化的快照',
  'export function reduce<S, E>(init: S, events: E[], step: (s: S, e: E) => S): S {',
  '  return events.reduce(step, init);',
  '}',
  '',
  'const COUNT = 1024;',
  'const isReady = (v: unknown): v is string => typeof v === "string" && v.length > 0;',
].join('\n');

const CODE_REACT = [
  "import React, { useState, useMemo } from 'react';",
  "import { Pressable, Text } from '../../components';",
  '',
  'export function Counter(props: { step?: number }) {',
  '  const step = props.step ?? 1;',
  '  const [count, setCount] = useState(0);',
  '  const label = useMemo(() => `count = ${count}`, [count]);',
  '  return (',
  '    <Pressable onPress={() => setCount((c) => c + step)}>',
  '      <Text>{label}</Text>',
  '    </Pressable>',
  '  );',
  '}',
].join('\n');

const CODE_JSON = [
  '{',
  '  "name": "react-native-flux-desktop",',
  '  "version": "0.1.0",',
  '  "private": true,',
  '  "engines": { "node": ">=18" },',
  '  "scripts": { "start": "tsc && node dist/example/Gallery.js" }',
  '}',
].join('\n');

const CODE_PY = [
  '# 快速幂：O(log n) 求 base ** exp % mod',
  'def pow_mod(base: int, exp: int, mod: int) -> int:',
  '    result = 1',
  '    while exp > 0:',
  '        if exp % 2 == 1:',
  '            result = result * base % mod',
  '        base = base * base % mod',
  '        exp >>= 1',
  '    return result',
  '',
  'print(pow_mod(2, 1000, 10**9 + 7))  # -> 688167934',
].join('\n');

const CODE_SH = [
  '#!/usr/bin/env bash',
  'set -euo pipefail',
  '',
  'ENTRY="dist/example/Gallery.js"',
  'if [ ! -f "$ENTRY" ]; then',
  '  echo "build first: npx tsc" >&2',
  '  exit 1',
  'fi',
  'node "$ENTRY" "$@"',
].join('\n');

const CODE_CSS = [
  '.flux-card {',
  '  border-radius: 8px;',
  '  padding: 16px 20px;',
  '  background: rgba(255, 255, 255, 0.04);',
  '  transition: border-color 0.2s ease;',
  '}',
  '',
  '@media (max-width: 640px) {',
  '  .flux-card { padding: 12px; }',
  '}',
].join('\n');

const CODE_GO = [
  '// worker pool: fan jobs out across N goroutines',
  'package main',
  '',
  'import "fmt"',
  '',
  'func worker(id int, jobs <-chan int, out chan<- string) {',
  '  for j := range jobs {',
  '    out <- fmt.Sprintf("worker %d did job %d", id, j)',
  '  }',
  '}',
].join('\n');

const CODE_RUST = [
  'use std::collections::HashMap;',
  '',
  'struct Registry {',
  '    items: HashMap<String, u32>,',
  '}',
  '',
  'impl Registry {',
  '    fn new() -> Self {',
  '        Registry { items: HashMap::new() }',
  '    }',
  '    fn insert(&mut self, k: String, v: u32) -> Option<u32> {',
  '        self.items.insert(k, v)',
  '    }',
  '}',
].join('\n');

const CODE_JAVA = [
  'import java.util.List;',
  'import java.util.stream.Collectors;',
  '',
  'public class Streams {',
  '    public static List<String> upper(List<String> in) {',
  '        return in.stream()',
  '            .filter(s -> s != null && !s.isEmpty())',
  '            .map(String::toUpperCase)',
  '            .collect(Collectors.toList());',
  '    }',
  '}',
].join('\n');

const CODE_SQL = [
  '-- top 10 active users by post count',
  "SELECT u.id, u.name, COUNT(p.id) AS posts",
  'FROM users u',
  'JOIN posts p ON p.author_id = u.id',
  "WHERE u.status = 'active'",
  'GROUP BY u.id, u.name',
  'ORDER BY posts DESC',
  'LIMIT 10;',
].join('\n');

const CODE_HTML = [
  '<!-- 卡片组件骨架 -->',
  '<section class="flux-card" data-id="42">',
  '  <h2 id="title">Hello Flux</h2>',
  '  <p>自绘桌面栈的 HTML 高亮：标签名 / 属性 / 字符串。</p>',
  '  <img src="/logo.png" alt="logo" />',
  '</section>',
].join('\n');

const LONG_LINE = [
  'const payload = { id: 42, name: "flux", tags: ["ui", "chart", "dev"], ok: true, score: 98.5, nested: { a: 1, b: [2, 3, 4], c: "deep" } };',
  'console.log(JSON.stringify(payload, null, 2));',
].join('\n');

/** 语言切换：同一份示例码，切语言看分词规则差异 */
function LanguagesDemo(): React.ReactElement {
  const { token } = useToken();
  const [lang, setLang] = React.useState('ts');
  const langs = ['ts', 'json', 'python', 'bash', 'css', 'go', 'rust', 'java', 'sql', 'html'];
  const MAP: Record<string, string> = { json: CODE_JSON, python: CODE_PY, bash: CODE_SH, css: CODE_CSS, go: CODE_GO, rust: CODE_RUST, java: CODE_JAVA, sql: CODE_SQL, html: CODE_HTML };
  const code = MAP[lang] ?? CODE_TS;
  return (
    <View style={{ width: '100%', gap: token.marginSM }}>
      <View style={{ flexDirection: 'row', gap: token.marginXS, flexWrap: 'wrap' }}>
        {langs.map((l) => (
          <Text
            key={l}
            onPress={() => setLang(l)}
            style={{
              fontSize: token.fontSizeSM,
              paddingVertical: 3,
              paddingHorizontal: 10,
              borderRadius: token.borderRadiusSM,
              cursor: 'pointer',
              color: l === lang ? token.colorPrimary : token.colorTextSecondary,
            }}
          >
            {l}
          </Text>
        ))}
      </View>
      <CodeBlock code={code} language={lang} title={`example.${lang}`} />
    </View>
  );
}

/** 选项开关：行号 / 软换行 / 复制 */
function OptionsDemo(): React.ReactElement {
  const { token } = useToken();
  const [lines, setLines] = React.useState(true);
  const [wrap, setWrap] = React.useState(false);
  const [copy, setCopy] = React.useState(true);
  return (
    <View style={{ width: '100%', gap: token.marginSM }}>
      <View style={{ flexDirection: 'row', gap: token.marginLG, alignItems: 'center' }}>
        <View style={{ flexDirection: 'row', gap: token.marginXS, alignItems: 'center' }}>
          <Switch size="small" checked={lines} onChange={setLines} />
          <Text style={{ fontSize: token.fontSizeSM, color: token.colorTextSecondary }}>行号</Text>
        </View>
        <View style={{ flexDirection: 'row', gap: token.marginXS, alignItems: 'center' }}>
          <Switch size="small" checked={wrap} onChange={setWrap} />
          <Text style={{ fontSize: token.fontSizeSM, color: token.colorTextSecondary }}>软换行</Text>
        </View>
        <View style={{ flexDirection: 'row', gap: token.marginXS, alignItems: 'center' }}>
          <Switch size="small" checked={copy} onChange={setCopy} />
          <Text style={{ fontSize: token.fontSizeSM, color: token.colorTextSecondary }}>复制按钮</Text>
        </View>
      </View>
      <CodeBlock code={LONG_LINE} language="js" showLineNumbers={lines} wrap={wrap} copyable={copy} />
      <Text style={{ fontSize: token.fontSizeSM, color: token.colorTextTertiary }}>
        关掉软换行后长行按宽度裁剪（wrap=false）；打开则整行折回，行号仍占固定列宽。
      </Text>
    </View>
  );
}

/** 定高滚动：maxHeight 限定高度 */
function MaxHeightDemo(): React.ReactElement {
  const big = CODE_REACT + '\n\n' + CODE_PY + '\n\n' + CODE_SH;
  return (
    <View style={{ width: '100%' }}>
      <CodeBlock code={big} language="js" title="bundle.js" maxHeight={220} />
    </View>
  );
}

/** 行高亮 + 起始行号：文档聚焦关键行 */
function HighlightDemo(): React.ReactElement {
  const { token } = useToken();
  return (
    <View style={{ width: '100%', gap: token.marginSM }}>
      <CodeBlock code={CODE_REACT} language="tsx" title="counter.tsx" startLine={10} highlightLines={[17, 18, 19]} />
      <Text style={{ fontSize: token.fontSizeSM, color: token.colorTextTertiary }}>
        startLine 让行号从 10 起（对齐源文件真实行）；highlightLines 以主色底纹标出第 17–19 行。
      </Text>
    </View>
  );
}

const DEMOS: DemoItem[] = [
  {
    name: '多语言高亮',
    desc: '点语言标签切换：js / json / python / bash / css / go / rust / java / sql / html 分词上色',
    node: <LanguagesDemo />,
    code: [
      'import { CodeBlock } from "react-native-flux-desktop";',
      '',
      '// language 切换分词规则：js/ts/json/python/bash/css/go/rust/java/sql/html',
      "<CodeBlock code={SOURCE} language=\"python\" title=\"demo.py\" />",
    ].join('\n'),
  },
  {
    name: '行高亮 / 起始行号',
    desc: 'startLine 偏移行号 + highlightLines 主色底纹聚焦关键行',
    node: <HighlightDemo />,
    code: [
      'import { CodeBlock } from "react-native-flux-desktop";',
      '',
      '// startLine 偏移行号；highlightLines 主色底纹高亮关键行（1-based）',
      "<CodeBlock code={SOURCE} language=\"js\" startLine={10} highlightLines={[12, 13]} />",
    ].join('\n'),
  },
  {
    name: 'React 源码',
    desc: 'JSX + 模板串 + 箭头函数；等宽体对齐由 ' + "'Flux Mono'" + ' 保证',
    node: <Block node={<CodeBlock code={CODE_REACT} language="tsx" title="counter.tsx" />} />,
    code: [
      'import { CodeBlock } from "react-native-flux-desktop";',
      '',
      '// JSX 感知分词：标签/属性/模板串/箭头函数均上色',
      "<CodeBlock code={CODE_REACT} language=\"tsx\" title=\"counter.tsx\" />",
    ].join('\n'),
  },
  {
    name: '选项开关',
    desc: 'showLineNumbers / wrap / copyable 实时切换',
    node: <OptionsDemo />,
    code: [
      'import { CodeBlock } from "react-native-flux-desktop";',
      '',
      '// showLineNumbers 行号列；wrap 软换行；copyable 右上角复制',
      "<CodeBlock code={SOURCE} language=\"js\" showLineNumbers wrap={false} copyable />",
    ].join('\n'),
  },
  {
    name: '定高裁剪',
    desc: 'maxHeight 限定高度，超出裁剪（文档侧长代码常用）',
    node: <MaxHeightDemo />,
    code: [
      'import { CodeBlock } from "react-native-flux-desktop";',
      '',
      '// maxHeight 限定高度，超出裁剪（文档侧长代码常用）',
      "<CodeBlock code={LONG_SOURCE} language=\"js\" maxHeight={200} />",
    ].join('\n'),
  },
];

/** 包一层保证 demo 宽度铺满 */
function Block(props: { node: React.ReactNode }): React.ReactElement {
  return <View style={{ width: '100%' }}>{props.node}</View>;
}

const API: ApiRow[] = [
  { name: 'code', desc: '代码正文（\\n 分行，自动规整 CRLF）', type: 'string', default: '–' },
  { name: 'language', desc: '语言：js/ts/json/python/bash/css/go/rust/java/c/cpp/php/ruby/sql/yaml/html/xml', type: 'string', default: "'js'" },
  { name: 'startLine', desc: '行号起始偏移（对齐源文件真实行）', type: 'number', default: '1' },
  { name: 'highlightLines', desc: '高亮行号数组（1-based，含 startLine 偏移后的显示行号）', type: 'number[]', default: '–' },
  { name: 'title', desc: '头部左侧文件名 / 标题', type: 'ReactNode', default: '–' },
  { name: 'showLineNumbers', desc: '是否显示行号列', type: 'boolean', default: 'true' },
  { name: 'copyable', desc: '右上角复制按钮（写剪贴板 + 2s 已复制回执）', type: 'boolean', default: 'true' },
  { name: 'wrap', desc: '软换行；false 则长行单行裁剪', type: 'boolean', default: 'true' },
  { name: 'fontSize', desc: '正文字号（行高 = fontSize × 1.65）', type: 'number', default: '13' },
  { name: 'maxHeight', desc: '限定最大高并裁剪溢出', type: 'number', default: '–' },
];

const TOKENS: TokenRow[] = [
  { name: 'keyword', desc: '取 colorPrimary（主题色）', default: '–' },
  { name: 'string', desc: '取 colorSuccess', default: '–' },
  { name: 'number', desc: '取 colorWarning', default: '–' },
  { name: 'boolean', desc: 'true / false / null / undefined 取 colorError', default: '–' },
  { name: 'func', desc: '后紧跟 ( 的标识符，取 colorInfo', default: '–' },
  { name: 'comment', desc: '取 colorTextQuaternary + 斜体', default: '–' },
  { name: 'background', desc: '头部 colorFillTertiary、正文 colorFillQuaternary', default: '–' },
];

export function CodeBlockDemo(): React.ReactElement {
  return <DemoPage demos={DEMOS} api={API} tokens={TOKENS} />;
}
