// 系统监控小部件取数层。
// 分层原则：整机 CPU / 系统内存走纯 Node `os` 模块（无原生依赖、Windows 通用），
//   进程内存 / 帧率 / 运行时长等「应用级」指标复用库的 systemStats 门面（单一数据源、不漂移）。
// 语义：全部即时快照，本模块内除 readCpu 的时间片差分基准外无状态、无定时器（定时器在 useSysMetrics 里）。
import os from 'os';
import React from 'react';
import { systemStats } from 'react-native-flux-desktop';

export interface SysMetrics {
  /** 整机 CPU 使用率 0-100（两次 os.cpus() 时间片差分） */
  cpu: number;
  /** 系统内存已用占比 0-100 */
  memPct: number;
  /** 系统内存已用 MB */
  memUsedMB: number;
  /** 系统内存总量 MB */
  memTotalMB: number;
  /** 主窗实时帧率 */
  fps: number;
  /** 进程常驻内存 RSS MB */
  rssMB: number;
  /** 进程运行时长 秒 */
  uptimeSec: number;
}

// 上一次 CPU 时间片累计（模块级基准；小部件全局唯一，跨开合复用同一基准即可）。
let prevCpu: { idle: number; total: number } | null = null;

/**
 * 整机 CPU 使用率：对 os.cpus() 各核时间片求 (1 - Δidle/Δtotal)。
 * 首次调用只播种基准返回 0，之后每次调用刷新基准 —— 故务必按固定节拍（默认 1s）调用。
 * 注意：Windows 上 os.loadavg() 不可用，只能走 cpus() 差分。
 */
export function readCpu(): number {
  const cpus = os.cpus();
  let idle = 0;
  let total = 0;
  for (const c of cpus) {
    const t = c.times;
    idle += t.idle + t.nice;
    total += t.user + t.nice + t.sys + t.idle + t.irq;
  }
  const cur = { idle, total };
  if (!prevCpu) {
    prevCpu = cur;
    return 0;
  }
  const dIdle = idle - prevCpu.idle;
  const dTotal = total - prevCpu.total;
  prevCpu = cur;
  if (dTotal <= 0) return 0;
  return Math.max(0, Math.min(100, Math.round((1 - dIdle / dTotal) * 100)));
}

/** 系统内存：os.totalmem/freemem → 已用占比 + MB（即时值，全系统口径非进程）。 */
export function readSysMem(): { pct: number; usedMB: number; totalMB: number } {
  const total = os.totalmem();
  const free = os.freemem();
  const used = total - free;
  const MB = 1024 * 1024;
  return {
    pct: total > 0 ? Math.round((used / total) * 100) : 0,
    usedMB: used / MB,
    totalMB: total / MB,
  };
}

/** 一次性组装当前指标快照（供 useSysMetrics 定时调用）。 */
export function readMetrics(): SysMetrics {
  const mem = readSysMem();
  const m = systemStats.memoryMB();
  return {
    cpu: readCpu(),
    memPct: mem.pct,
    memUsedMB: mem.usedMB,
    memTotalMB: mem.totalMB,
    fps: systemStats.fps(),
    rssMB: m.rss,
    uptimeSec: systemStats.uptimeSec(),
  };
}

/** 轮询取数的 hook：挂载即采一次，之后按 intervalMs 定时刷新，卸载即清定时器（勿漏，否则阻止进程退出）。 */
export function useSysMetrics(intervalMs = 1000): SysMetrics {
  const [m, setM] = React.useState<SysMetrics>(() => readMetrics());
  React.useEffect(() => {
    // 先播种 CPU 基准，令首个正式 tick 就能给出真实占用而非 0
    readCpu();
    const t = setInterval(() => setM(readMetrics()), intervalMs);
    return () => clearInterval(t);
  }, [intervalMs]);
  return m;
}

/** MB → 人类可读：≥1024 显示 GB（1 位小数），否则整数 MB。 */
export const fmtMem = (mb: number): string =>
  mb >= 1024 ? `${(mb / 1024).toFixed(1)}G` : `${Math.round(mb)}M`;

/** 运行时长格式化（与 PerfDetails 语义一致）。 */
export const fmtUptime = (sec: number): string => {
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return m >= 60 ? `${Math.floor(m / 60)}h${String(m % 60).padStart(2, '0')}m` : `${m}m${String(s).padStart(2, '0')}s`;
};
