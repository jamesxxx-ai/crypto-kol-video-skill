import React, {createContext, useContext} from 'react';
import {spring, interpolate, useCurrentFrame, Easing} from 'remotion';
import '@fontsource/noto-sans-sc/500.css';
import '@fontsource/noto-sans-sc/700.css';
import '@fontsource/noto-sans-sc/900.css';
import '@fontsource/jetbrains-mono/700.css';
import '@fontsource/jetbrains-mono/800.css';

export const C = {
  bg: '#0B0E11', panel: '#161A1E', panel2: '#1E2329', line: '#2B3139', text: '#EAECEF', sub: '#848E9C',
  green: '#0ECB81', red: '#F6465D', amber: '#F5B82E', hl: '#FFE14D', blue: '#3D8BFD',
};
export const SANS = '"Noto Sans SC", sans-serif';
export const MONO = '"JetBrains Mono", "Noto Sans SC", monospace';

export type Sub = {text: string; s: number; e: number; v: number};
export type SceneT = {id: string; title: string; start: number; end: number; subs: Sub[]};
export const SceneCtx = createContext<SceneT | null>(null);
/** local frame of the voice onset of chunk k (+off) */
export const useBeat = () => {
  const sc = useContext(SceneCtx)!;
  return (k: number, off = 0) => sc.subs[Math.min(k, sc.subs.length - 1)].v - sc.start + off;
};
export const useLen = () => { const sc = useContext(SceneCtx)!; return sc.end - sc.start; };

export const pop = (f: number, at: number, stiff = 170, damp = 14) =>
  spring({frame: f - at, fps: 30, config: {stiffness: stiff, damping: damp, mass: 0.8}});
export const lin = (f: number, a: number, b: number, from = 0, to = 1, ease = Easing.out(Easing.cubic)) =>
  interpolate(f, [a, b], [from, to], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: ease});

export const Appear: React.FC<{at: number; dy?: number; scale?: boolean; style?: React.CSSProperties; children: React.ReactNode}> =
  ({at, dy = 30, scale, style, children}) => {
    const f = useCurrentFrame();
    const p = pop(f, at);
    const o = lin(f, at, at + 6);
    return (
      <div style={{...style, opacity: o, transform: `${style?.transform ?? ''} translateY(${(1 - p) * dy}px) ${scale ? `scale(${0.6 + 0.4 * p})` : ''}`}}>
        {children}
      </div>
    );
  };

export const Card: React.FC<{x: number; y: number; w: number; h: number; style?: React.CSSProperties; children?: React.ReactNode}> =
  ({x, y, w, h, style, children}) => (
    <div style={{position: 'absolute', left: x, top: y, width: w, height: h, background: C.panel, borderRadius: 28,
      border: `2px solid ${C.line}`, boxShadow: '0 20px 50px rgba(0,0,0,.45)', overflow: 'hidden', ...style}}>{children}</div>
  );

export const Tab: React.FC<{color: string; children: React.ReactNode; style?: React.CSSProperties}> = ({color, children, style}) => (
  <div style={{display: 'flex', alignItems: 'center', gap: 14, padding: '20px 28px', borderBottom: `2px solid ${C.line}`,
    fontSize: 38, fontWeight: 900, color: C.text, ...style}}>
    <div style={{width: 12, height: 36, borderRadius: 6, background: color}} />{children}
  </div>
);

export const Pill: React.FC<{color: string; children: React.ReactNode; style?: React.CSSProperties; solid?: boolean}> = ({color, children, style, solid}) => (
  <span style={{display: 'inline-flex', alignItems: 'center', padding: '6px 20px', borderRadius: 999, fontWeight: 900,
    background: solid ? color : color + '22', color: solid ? '#0B0E11' : color, border: `2px solid ${color}`, ...style}}>{children}</span>
);

export const Stamp: React.FC<{at: number; color: string; children: React.ReactNode; size?: number; rot?: number; style?: React.CSSProperties}> =
  ({at, color, children, size = 64, rot = -8, style}) => {
    const f = useCurrentFrame();
    const p = pop(f, at, 260, 12);
    return (
      <div style={{position: 'absolute', opacity: lin(f, at, at + 3), transform: `rotate(${rot}deg) scale(${2.2 - 1.2 * p})`,
        border: `6px solid ${color}`, color, borderRadius: 20, padding: '8px 30px', fontSize: size, fontWeight: 900,
        background: 'rgba(11,14,17,.88)', whiteSpace: 'nowrap', ...style}}>{children}</div>
    );
  };

export const Check: React.FC<{ok: boolean; size?: number}> = ({ok, size = 44}) => (
  <div style={{width: size, height: size, borderRadius: size, background: ok ? C.green : C.red, color: '#0B0E11',
    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: size * 0.68, fontWeight: 900, flex: 'none'}}>
    {ok ? '✓' : '✕'}
  </div>
);

export const Coin: React.FC<{size?: number; style?: React.CSSProperties; color?: string; label?: string}> = ({size = 60, style, color = C.amber, label = '₮'}) => (
  <div style={{width: size, height: size, borderRadius: size, background: `radial-gradient(circle at 35% 30%, #fff6, ${color} 45%, ${color}cc)`,
    border: `4px solid ${color}`, boxShadow: `0 0 18px ${color}88`, display: 'flex', alignItems: 'center', justifyContent: 'center',
    color: '#0B0E11', fontWeight: 900, fontSize: size * 0.5, fontFamily: SANS, ...style}}>{label}</div>
);

// deterministic candles
export const makeCandles = (n: number, seed: number, path: (i: number) => number) => {
  let s = seed;
  const rnd = () => { s = (s * 16807) % 2147483647; return s / 2147483647; };
  const out: {o: number; c: number; h: number; l: number}[] = [];
  let prev = path(0);
  for (let i = 0; i < n; i++) {
    const target = path(i) + (rnd() - 0.5) * 1.6;
    const o = prev, c = target;
    out.push({o, c, h: Math.max(o, c) + rnd() * 1.2, l: Math.min(o, c) - rnd() * 1.2});
    prev = c;
  }
  return out;
};
