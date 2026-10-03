import React from 'react';
import {Img, staticFile, spring, interpolate, Easing} from 'remotion';
import {C, SANS} from './ui';
import brand from './brand.json';

export const HANDLE: string = (brand as any).handle;
export const TAGLINE: string = (brand as any).tagline ?? '';
const AVATAR: string = (brand as any).avatar ?? 'avatar.jpg';

export const Avatar: React.FC<{size: number; ring?: string; style?: React.CSSProperties}> = ({size, ring = C.amber, style}) => (
  <div style={{width: size, height: size, borderRadius: size, overflow: 'hidden', flex: 'none', border: `${Math.max(3, size * 0.04)}px solid ${ring}`,
    boxShadow: `0 ${size * 0.06}px ${size * 0.2}px rgba(0,0,0,.45)`, background: C.panel2, ...style}}>
    <Img src={staticFile(AVATAR)} style={{width: '100%', height: '100%', objectFit: 'cover', display: 'block'}} />
  </div>
);

const cl = {extrapolateLeft: 'clamp' as const, extrapolateRight: 'clamp' as const};
/** rough width of the handle text at 30px/900 (latin ≈ 0.56em, CJK ≈ 1em) */
const handleWidth = (s: string, px = 30) => [...s].reduce((w, ch) => w + (ch.charCodeAt(0) > 0x2e80 ? px : px * 0.56), 0);

/**
 * Corner badge (top-right) with an intro: big avatar + name tag pops in over the panel,
 * holds ~1.1s, then flies into the corner and stays for the whole video.
 * `f` = absolute frame, `t0` = first frame after the cover.
 */
export const CornerBadge: React.FC<{f: number; t0: number}> = ({f, t0}) => {
  const lf = f - t0;
  const pop = spring({frame: lf, fps: 30, config: {stiffness: 170, damping: 13}});
  const fly = interpolate(lf, [34, 50], [0, 1], {...cl, easing: Easing.inOut(Easing.cubic)});
  const big = {x: 540, y: 820, s: 1};
  const small = {x: 1020 - handleWidth(HANDLE) - 12 - 30, y: 282, s: 0.23};
  const x = big.x + (small.x - big.x) * fly;
  const y = big.y + (small.y - big.y) * fly;
  const s = (big.s + (small.s - big.s) * fly) * (fly > 0 ? 1 : pop);
  const nameOpacity = 1 - interpolate(fly, [0, 0.5], [0, 1], cl);
  return (
    <>
      <div style={{position: 'absolute', right: 60, top: 252, display: 'flex', alignItems: 'center', gap: 12, opacity: fly >= 1 ? 1 : 0}}>
        <Avatar size={60} ring={C.amber} />
        <span style={{fontFamily: SANS, fontSize: 30, fontWeight: 900, color: C.text, letterSpacing: 1}}>{HANDLE}</span>
      </div>
      {fly < 1 ? (
        <>
          <div style={{position: 'absolute', left: 60, top: 548, width: 960, height: 700, borderRadius: 28, background: `rgba(11,14,17,${0.85 * (1 - fly)})`,
            opacity: interpolate(lf, [0, 4], [0, 1], cl)}} />
          <div style={{position: 'absolute', left: x, top: y, transform: `translate(-50%, -50%) scale(${s})`, display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
            <Avatar size={260} ring={C.amber} />
            <div style={{marginTop: 22, padding: '10px 34px', borderRadius: 999, background: C.amber, color: C.bg, fontFamily: SANS, fontSize: 52, fontWeight: 900, opacity: nameOpacity, whiteSpace: 'nowrap'}}>{HANDLE}</div>
          </div>
        </>
      ) : null}
    </>
  );
};

/** End card: big avatar, handle, tagline, "+ 关注" gets tapped into "已关注 ✓". `lf` = frames since start. */
export const FollowCard: React.FC<{lf: number}> = ({lf}) => {
  const p = spring({frame: lf, fps: 30, config: {stiffness: 160, damping: 14}});
  const done = lf >= 36;
  const press = lf >= 30 && lf < 36 ? 0.92 : 1;
  const dp = spring({frame: lf - 36, fps: 30, config: {stiffness: 220, damping: 12}});
  return (
    <div style={{position: 'absolute', inset: 0, background: `rgba(11,14,17,${0.92 * interpolate(lf, [0, 6], [0, 1], cl)})`}}>
      <div style={{position: 'absolute', left: 0, right: 0, top: 560, display: 'flex', flexDirection: 'column', alignItems: 'center', transform: `scale(${0.6 + 0.4 * p})`, opacity: p}}>
        <Avatar size={300} ring={C.amber} />
        <div style={{marginTop: 30, fontFamily: SANS, fontSize: 76, fontWeight: 900, color: C.text}}>{HANDLE}</div>
        {TAGLINE ? <div style={{marginTop: 6, fontFamily: SANS, fontSize: 34, fontWeight: 700, color: C.sub}}>{TAGLINE}</div> : null}
        <div style={{marginTop: 40, padding: '18px 70px', borderRadius: 999, fontFamily: SANS, fontSize: 48, fontWeight: 900,
          background: done ? C.panel2 : C.red, color: done ? C.text : '#fff', border: `3px solid ${done ? C.line : C.red}`,
          transform: `scale(${press * (done ? 0.9 + 0.1 * dp : 1)})`}}>{done ? '已关注 ✓' : '+ 关注'}</div>
      </div>
      {lf >= 26 && lf < 44 ? (
        <div style={{position: 'absolute', left: 540 - 40, top: 1130, width: 80, height: 80, borderRadius: 80, border: '4px solid #fff',
          opacity: interpolate(lf, [26, 44], [0.9, 0], cl), transform: `scale(${interpolate(lf, [26, 44], [0.5, 2.4], cl)})`}} />
      ) : null}
    </div>
  );
};
