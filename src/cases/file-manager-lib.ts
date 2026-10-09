// cases/file-manager-lib.ts —— 「文件管理器」取数层：纯 Node fs/path/os 读真实磁盘，无 UI、无造假。
// 承袭 sys-monitor 分层思路：所有 UI 只消费这里返回的结构化数据。fs 调用一律 try/catch（权限/坏软链/超长路径）。
import fs from 'fs';
import path from 'path';
import os from 'os';

/** 目录项：名/绝对路径/是否目录/字节/修改时间(ms)/小写扩展名(无点) */
export interface FSEntry {
  name: string;
  path: string;
  isDir: boolean;
  size: number;
  mtimeMs: number;
  ext: string;
}

export type Kind = 'image' | 'text' | 'code' | 'other';

const IMG_EXT = new Set(['png', 'jpg', 'jpeg', 'gif', 'bmp', 'webp', 'ico', 'tiff']);
const TXT_EXT = new Set(['txt', 'md', 'markdown', 'log', 'csv', 'ini', 'env', 'properties']);
const CODE_EXT = new Set([
  'js', 'jsx', 'ts', 'tsx', 'json', 'rs', 'py', 'go', 'java', 'c', 'h', 'cpp', 'hpp', 'cc',
  'css', 'scss', 'less', 'html', 'htm', 'xml', 'yaml', 'yml', 'sh', 'bash', 'php', 'rb',
  'sql', 'toml', 'vue', 'swift', 'kt', 'dart', 'lua', 'r', 'mjs', 'cjs',
]);

/** 主目录（默认落地位置）。 */
export function homeDir(): string {
  try {
    return os.homedir();
  } catch {
    return process.cwd();
  }
}

/** 根入口：Win 列存在的盘符 + 主目录；类 Unix 用 /。 */
export function roots(): { label: string; path: string }[] {
  const home = homeDir();
  if (process.platform === 'win32') {
    const out: { label: string; path: string }[] = [];
    for (const c of 'CDEFGHIJKLMNOPQRSTUVWXYZ') {
      const p = `${c}:\\`;
      try {
        if (fs.existsSync(p)) out.push({ label: p, path: p });
      } catch {
        /* 跳过不可访问盘符 */
      }
    }
    out.push({ label: `主目录 ${path.basename(home) || home}`, path: home });
    return out.length ? out : [{ label: home, path: home }];
  }
  return [{ label: '/', path: '/' }, { label: `主目录 ${path.basename(home) || home}`, path: home }];
}

/** 列目录（目录优先、按名排序）；读失败返回空数组而非抛错。 */
export function listDir(dir: string): FSEntry[] {
  let names: string[];
  try {
    names = fs.readdirSync(dir);
  } catch {
    return [];
  }
  const out: FSEntry[] = [];
  for (const name of names) {
    const fp = path.join(dir, name);
    let st: fs.Stats;
    try {
      st = fs.statSync(fp);
    } catch {
      continue; // 坏软链/权限：跳过该项
    }
    const isDir = st.isDirectory();
    out.push({
      name,
      path: fp,
      isDir,
      size: isDir ? 0 : st.size,
      mtimeMs: st.mtimeMs,
      ext: path.extname(name).toLowerCase().replace(/^\./, ''),
    });
  }
  out.sort((a, b) => (Number(b.isDir) - Number(a.isDir)) || a.name.localeCompare(b.name, undefined, { numeric: true }));
  return out;
}

/** 仅子目录（供左树懒加载）。 */
export function subDirs(dir: string): FSEntry[] {
  return listDir(dir).filter((e) => e.isDir);
}

/** 上一级；已到根则返回自身。 */
export function parentOf(p: string): string {
  const d = path.dirname(p);
  return d === p ? p : d;
}

/** 是否已到根（无上一级）。 */
export function isRoot(p: string): boolean {
  return parentOf(p) === p;
}

/** 按扩展名判定预览类型。 */
export function kindOf(e: FSEntry): Kind {
  if (e.isDir) return 'other';
  if (IMG_EXT.has(e.ext)) return 'image';
  if (CODE_EXT.has(e.ext)) return 'code';
  if (TXT_EXT.has(e.ext)) return 'text';
  return 'other';
}

/** CodeBlock 语言标签（映射到库支持的子集，未知回退纯文本 js 高亮）。 */
export function langOf(e: FSEntry): string {
  const x = e.ext;
  if (x === 'ts' || x === 'tsx' || x === 'mts' || x === 'cts') return 'ts';
  if (x === 'js' || x === 'jsx' || x === 'mjs' || x === 'cjs' || x === 'json') return 'js';
  if (x === 'py') return 'python';
  if (x === 'sh' || x === 'bash') return 'bash';
  if (x === 'rs') return 'rust';
  if (x === 'c' || x === 'h') return 'c';
  if (x === 'cpp' || x === 'hpp' || x === 'cc') return 'cpp';
  if (x === 'yml' || x === 'yaml') return 'yaml';
  if (x === 'md' || x === 'markdown') return 'md';
  return 'js';
}

export interface TextRead {
  text: string;
  truncated: boolean;
  binary: boolean;
  error: boolean;
}

/** 限字节读文本（默认上限 256KB）；含 NUL 视为二进制不外泄；读失败置 error。 */
export function readText(file: string, maxKB = 256): TextRead {
  let fd: number | null = null;
  try {
    const st = fs.statSync(file);
    const cap = maxKB * 1024;
    const len = Math.min(st.size, cap);
    const buf = Buffer.alloc(len);
    fd = fs.openSync(file, 'r');
    const rd = fs.readSync(fd, buf, 0, len, 0);
    const slice = buf.slice(0, rd);
    const probe = Math.min(rd, 8000);
    for (let i = 0; i < probe; i++) {
      if (slice[i] === 0) return { text: '', truncated: false, binary: true, error: false };
    }
    return { text: slice.toString('utf8'), truncated: st.size > cap, binary: false, error: false };
  } catch {
    return { text: '', truncated: false, binary: false, error: true };
  } finally {
    if (fd !== null) {
      try {
        fs.closeSync(fd);
      } catch {
        /* 忽略 */
      }
    }
  }
}

/** 目录内条目数（供文件夹预览）；失败返回 -1。 */
export function countItems(dir: string): number {
  try {
    return fs.readdirSync(dir).length;
  } catch {
    return -1;
  }
}

/** 人性化文件大小。 */
export function fmtSize(bytes: number): string {
  if (!bytes || bytes < 0) return '—';
  const u = ['B', 'KB', 'MB', 'GB', 'TB'];
  let i = 0;
  let n = bytes;
  while (n >= 1024 && i < u.length - 1) {
    n /= 1024;
    i++;
  }
  return `${i === 0 ? Math.round(n) : n.toFixed(1)} ${u[i]}`;
}

/** 人性化时间：YYYY-MM-DD HH:mm。 */
export function fmtDate(ms: number): string {
  const d = new Date(ms);
  const p = (x: number): string => String(x).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`;
}

/** 末段名；根（如 C:\ 或 /）回退整串。 */
export function baseName(p: string): string {
  const b = path.basename(p);
  return b || p;
}
