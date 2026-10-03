import React from 'react';
import {AbsoluteFill, Sequence, useCurrentFrame} from 'remotion';
import tl from './timeline.json';
import {C, SANS, SceneCtx, SceneT, lin, pop} from './ui';
import {CornerBadge, FollowCard} from './brand';
import {Cover, Bg} from './cover';
import {SCENES as COMP} from './scenes';
import {col, Part} from './colors';

type SceneX = SceneT & {chip?: string; title?: string; titleParts?: Part[]};
const T = tl as any;
const SCENES: SceneX[] = T.scenes;

const Header: React.FC<{sc: SceneX; idx: number; f: number}> = ({sc, idx, f}) => {
  const lf = f - sc.start;
  const p = pop(lf, 0, 200, 16);
  const n = SCENES.length - 1; // progress segments (hook excluded)
  const title = sc.title ?? '';
  const size = title.length > 9 ? 84 : title.length > 7 ? 96 : 108;
  return (
    <>
      <div style={{position: 'absolute', left: 60, top: 200, width: 960, display: 'flex', gap: n > 6 ? 10 : 12}}>
        {Array.from({length: n}).map((_, k) => {
          const i = k + 1;
          const fill = idx > i ? 1 : idx === i ? lin(f, sc.start, sc.end, 0.05, 1, (x) => x) : 0;
          return (
            <div key={i} style={{flex: 1, height: 12, borderRadius: 6, background: C.line, overflow: 'hidden'}}>
              <div style={{width: `${fill * 100}%`, height: '100%', background: C.amber}} />
            </div>
          );
        })}
      </div>
      {sc.chip ? (
        <div style={{position: 'absolute', left: 60, top: 250, opacity: lin(lf, 0, 6)}}>
          <span style={{fontSize: 36, fontWeight: 900, color: '#0B0E11', background: C.amber, borderRadius: 14, padding: '6px 22px'}}>{sc.chip}</span>
        </div>
      ) : null}
      <div style={{position: 'absolute', left: 60, right: 60, top: 322, fontSize: size, fontWeight: 900, color: C.text, letterSpacing: 2,
        transform: `translateX(${(1 - p) * -60}px)`, opacity: lin(lf, 0, 5), lineHeight: 1.15, whiteSpace: 'nowrap'}}>
        {sc.titleParts ? sc.titleParts.map((x, i) => <span key={i} style={{color: col(x.c), fontSize: x.size}}>{x.t}</span>) : title}
      </div>
    </>
  );
};

const Subtitle: React.FC<{text: string}> = ({text}) => {
  const parts = text.split(/(\[[^\]]+\])/).filter(Boolean);
  return (
    <div style={{position: 'absolute', left: 40, right: 40, top: 1290, textAlign: 'center', fontSize: 70, fontWeight: 900, lineHeight: 1.25,
      color: '#fff', WebkitTextStroke: '12px #000', paintOrder: 'stroke fill', letterSpacing: 1}}>
      {parts.map((p, i) => (p.startsWith('[') ? <span key={i} style={{color: C.hl}}>{p.slice(1, -1)}</span> : <span key={i}>{p}</span>))}
    </div>
  );
};

const Panel: React.FC<{len: number; last: boolean; children: React.ReactNode}> = ({len, last, children}) => {
  const f = useCurrentFrame();
  const inn = pop(f, 0, 180, 18);
  const out = last ? 0 : lin(f, len - 7, len, 0, 1);
  return (
    <div style={{position: 'absolute', left: 60, top: 548, width: 960, height: 700, opacity: lin(f, 0, 6) * (1 - out),
      transform: `translateX(${(1 - inn) * 120 - out * 120}px)`}}>{children}</div>
  );
};

export const Main: React.FC = () => {
  const f = useCurrentFrame();
  const PRE = T.pre ?? 0; const FOLLOW = T.followAt ?? 1e9;
  if (f < PRE) return <Cover />;                         // first frames = cover (Douyin picks frame 0)
  const idx = Math.max(0, SCENES.findIndex((s) => f >= s.start && f < s.end));
  const sc = SCENES[idx] ?? SCENES[SCENES.length - 1];
  const sub = sc.subs.find((s) => f >= s.s && f < s.e);
  return (
    <AbsoluteFill style={{fontFamily: SANS, color: C.text}}>
      <Bg />
      <Header sc={sc} idx={idx} f={f} />
      {SCENES.map((s, i) => {
        const Comp = COMP[s.id];
        if (!Comp) return null;
        return (
          <Sequence key={s.id} from={s.start} durationInFrames={s.end - s.start} layout="none">
            <SceneCtx.Provider value={s}>
              <Panel len={s.end - s.start} last={i === SCENES.length - 1}><Comp /></Panel>
            </SceneCtx.Provider>
          </Sequence>
        );
      })}
      <CornerBadge f={f} t0={PRE} />
      {sub && f < FOLLOW ? <Subtitle text={sub.text} /> : null}
      {f >= FOLLOW ? <FollowCard lf={f - FOLLOW} /> : null}
    </AbsoluteFill>
  );
};
