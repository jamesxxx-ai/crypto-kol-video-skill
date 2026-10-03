import React from 'react';
import {AbsoluteFill} from 'remotion';
import tl from './timeline.json';
import {C, SANS, MONO} from './ui';
import {Avatar, HANDLE} from './brand';
import {Logo} from './logo';
import {col, Part} from './colors';

export const Bg: React.FC = () => (
  <AbsoluteFill style={{background: C.bg}}>
    <AbsoluteFill style={{backgroundImage: `linear-gradient(${C.line}55 1px, transparent 1px), linear-gradient(90deg, ${C.line}55 1px, transparent 1px)`,
      backgroundSize: '60px 60px', maskImage: 'linear-gradient(180deg, transparent 0%, #000 25%, #000 70%, transparent 100%)', opacity: 0.5}} />
    <AbsoluteFill style={{background: `radial-gradient(900px 600px at 50% 45%, ${C.amber}14, transparent 70%)`}} />
  </AbsoluteFill>
);

type CoverCfg = {
  logos?: string[];             // names from logos.json shown on top
  kicker?: string;              // small grey line on top
  lines?: Part[];               // big title lines, each {t, c, size}
  badge?: string;               // tilted stamp
  badgeColor?: string;
  sub?: string;                 // one line of topics
  series?: string;              // e.g. "AI 复盘系列 #1"
};

/** Cover = first frame of the video and the exported cover PNG. Always carries avatar + handle. */
export const Cover: React.FC = () => {
  const cv: CoverCfg = (tl as any).cover ?? {};
  return (
    <AbsoluteFill style={{fontFamily: SANS, color: C.text}}>
      <Bg />
      <div style={{position: 'absolute', left: 50, right: 50, top: 230, textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
        {cv.logos?.length ? <div style={{display: 'flex', gap: 30, marginBottom: 40}}>{cv.logos.map((n) => <Logo key={n} name={n} h={90} />)}</div> : null}
        {cv.kicker ? <div style={{fontSize: 64, fontWeight: 900, color: C.sub}}>{cv.kicker}</div> : null}
        {(cv.lines ?? []).map((l, i) => (
          <div key={i} style={{fontSize: l.size ?? 150, fontWeight: 900, lineHeight: 1.15, color: col(l.c), fontFamily: /^[-+\d.%U$ ]+$/.test(l.t) ? MONO : SANS}}>{l.t}</div>
        ))}
        {cv.badge ? (
          <div style={{marginTop: 60, display: 'inline-block', fontSize: 80, fontWeight: 900, color: col(cv.badgeColor ?? 'red'), border: `8px solid ${col(cv.badgeColor ?? 'red')}`,
            borderRadius: 24, padding: '6px 40px', transform: 'rotate(-4deg)'}}>{cv.badge}</div>
        ) : null}
        {cv.sub ? <div style={{marginTop: 70, fontSize: 46, fontWeight: 700}}>{cv.sub}</div> : null}
        {cv.series ? <div style={{marginTop: 26, fontSize: 40, fontWeight: 700, color: C.sub}}>{cv.series}</div> : null}
        <div style={{marginTop: 60, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 22}}>
          <Avatar size={120} /><span style={{fontSize: 56, fontWeight: 900}}>{HANDLE}</span>
        </div>
      </div>
    </AbsoluteFill>
  );
};
