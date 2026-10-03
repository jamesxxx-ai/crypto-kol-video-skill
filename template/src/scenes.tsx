import React from 'react';
import {useCurrentFrame, interpolate, Easing} from 'remotion';
/**
 * EXAMPLE scenes from the video 《同样是亏，爆仓比止损多亏多少？》 (examples/liq-vs-stoploss/video.json).
 * For a new video: rewrite this file — one component per scene id, timed with useBeat(k) = voice onset of chunk k.
 * Building blocks: ui.tsx (Card, Tab, Pill, Stamp, Check, Coin, Appear, pop, lin) and recipes in references/scene-recipes.md.
 */
import {C, MONO, Appear, Card, Tab, Pill, Stamp, Check, pop, lin, useBeat} from './ui';
import {HANDLE} from './brand';

const Row: React.FC<{l: string; r: React.ReactNode; col?: string}> = ({l, r, col}) => (
  <div style={{display: 'flex', justifyContent: 'space-between', fontSize: 27, fontWeight: 700, color: C.sub, marginTop: 8}}>
    <span>{l}</span><span style={{color: col ?? C.text, fontFamily: MONO, fontWeight: 800}}>{r}</span>
  </div>
);

/* ---------------- 0 Hook: two traders ---------------- */
export const Hook: React.FC = () => {
  const f = useCurrentFrame(); const b = useBeat();
  // price path: entry 100 -> falls to liq (95.4) by b(2)
  const prog = lin(f, 6, b(2), 0, 1, Easing.inOut(Easing.quad));
  const W = 900, H = 150; const y = (p: number) => 20 + ((100.6 - p) / 6) * H;
  const pts: string[] = []; const n = Math.max(2, Math.floor(prog * 60));
  for (let i = 0; i < n; i++) { const t = i / 59; pts.push(`${t * W},${y(100 - 4.6 * t + 0.7 * Math.sin(t * 17) * (1 - t))}`); }
  const loss = 920 * prog; // unrealised loss until trigger
  const card = (x: number, title: string, col: string, res: string, resCol: string, at: number, stamp: string, note: string) => (
    <Appear at={x === 0 ? 0 : 4} style={{position: 'absolute', left: x, top: 250}}>
      <Card x={0} y={0} w={465} h={450} style={{position: 'relative', padding: '0 0 0 0'}}>
        <Tab color={col}>{title}</Tab>
        <div style={{padding: '12px 26px'}}>
          <Row l="BTCUSDT 多" r="20x 逐仓" />
          <Row l="保证金" r="1000 U" />
          <Row l="浮动亏损" r={`-${Math.round(loss)} U`} col={C.red} />
          <div style={{fontSize: 24, color: C.sub, fontWeight: 700, marginTop: 10}}>{note}</div>
          <div style={{marginTop: 12, fontSize: 26, color: C.sub, fontWeight: 700, opacity: lin(f, at, at + 6)}}>最终亏损</div>
          <div style={{fontFamily: MONO, fontSize: 64, fontWeight: 800, color: resCol, opacity: lin(f, at, at + 6), lineHeight: 1.1}}>{res}</div>
        </div>
        <Stamp at={at} color={resCol} size={32} rot={-6} style={{right: 14, top: 12}}>{stamp}</Stamp>
      </Card>
    </Appear>
  );
  return (
    <>
      <Card x={0} y={0} w={960} h={230}>
        <div style={{display: 'flex', justifyContent: 'space-between', padding: '16px 28px 0', fontSize: 30, fontWeight: 900}}>
          <span>BTCUSDT 永续 <span style={{color: C.sub, fontSize: 24}}>· 示意</span></span>
          <span style={{fontFamily: MONO, color: C.red}}>{(-4.6 * prog).toFixed(2)}%</span>
        </div>
        <svg width={W} height={H + 30} style={{position: 'absolute', left: 30, top: 50, overflow: 'visible'}}>
          <line x1={0} x2={W} y1={y(95.4)} y2={y(95.4)} stroke={C.red} strokeWidth={3} strokeDasharray="12 8" />
          <text x={W - 130} y={y(95.4) - 10} fill={C.red} fontSize={26} fontWeight={900}>强平价</text>
          <polyline points={pts.join(' ')} fill="none" stroke={C.red} strokeWidth={6} strokeLinejoin="round" />
        </svg>
      </Card>
      {card(0, 'A · 不挂止损', C.red, '-1000U', C.red, b(2), '爆仓', '等系统强平')}
      {card(495, 'B · 挂止损', C.green, '-930U', C.green, b(4), '止损成交', '止损单先成交')}
      {f >= b(6) ? <div style={{position: 'absolute', inset: 0, background: `rgba(11,14,17,${lin(f, b(6), b(6, 6), 0, 0.55)})`, borderRadius: 28}} /> : null}
      <Stamp at={b(6)} color={C.amber} size={110} rot={-6} style={{left: 200, top: 280}}>多亏 70U</Stamp>
    </>
  );
};

/* ---------------- 1 Why: margin thermometer ---------------- */
export const Why: React.FC = () => {
  const f = useCurrentFrame(); const b = useBeat();
  const H = 500; const top = 150;
  const drain = lin(f, b(1, -10), b(2), 0, 1, Easing.inOut(Easing.quad));
  const bal = 1000 - 920 * drain;
  const gone = lin(f, b(5), b(5, 22));
  const remain = f >= b(5) ? 80 * (1 - gone) : bal;
  const hY = (v: number) => top + H * (1 - v / 1000);
  const mmY = hY(80);
  const flash = f >= b(2) && f < b(2, 24) && Math.floor((f - b(2)) / 4) % 2 === 0;
  return (
    <>
      <Card x={0} y={0} w={380} h={700}>
        <div style={{padding: '18px 24px', fontSize: 30, fontWeight: 900}}>逐仓保证金</div>
        <div style={{position: 'absolute', left: 120, top: top, width: 140, height: H, borderRadius: 20, background: C.panel2, border: `3px solid ${C.line}`, overflow: 'hidden'}}>
          <div style={{position: 'absolute', left: 0, right: 0, bottom: 0, height: (remain / 1000) * H, background: remain <= 80.5 ? C.amber : C.green, transition: 'none'}} />
        </div>
        <div style={{position: 'absolute', left: 20, right: 20, top: mmY - 2, height: 4, background: C.red, opacity: lin(f, b(1), b(1, 6))}} />
        <div style={{position: 'absolute', left: 24, top: mmY + 10, fontSize: 22, fontWeight: 900, color: C.red, opacity: lin(f, b(1), b(1, 6))}}>维持保证金线</div>
        <div style={{position: 'absolute', left: 0, right: 0, top: 76, textAlign: 'center', fontFamily: MONO, fontSize: 44, fontWeight: 800, color: remain <= 80.5 ? C.amber : C.text}}>{Math.round(remain)} U</div>
        {flash ? <div style={{position: 'absolute', inset: 0, background: C.red + '33'}} /> : null}
      </Card>
      <div style={{position: 'absolute', left: 410, top: 0, width: 550}}>
        <Appear at={b(0)}>
          <Card x={0} y={0} w={550} h={150} style={{position: 'relative', padding: '20px 26px', boxSizing: 'border-box'}}>
            <div style={{fontSize: 26, color: C.sub, fontWeight: 700}}>误区</div>
            <div style={{fontSize: 38, fontWeight: 900}}>亏到 <span style={{color: C.red}}>0</span> 才爆仓 <span style={{color: C.red}}>✕</span></div>
          </Card>
        </Appear>
        <Appear at={b(2)} style={{marginTop: 20}}>
          <Card x={0} y={0} w={550} h={150} style={{position: 'relative', padding: '20px 26px', boxSizing: 'border-box', borderColor: C.red}}>
            <div style={{fontSize: 26, color: C.sub, fontWeight: 700}}>真相</div>
            <div style={{fontSize: 36, fontWeight: 900}}>碰到<span style={{color: C.red}}>维持保证金线</span>就强平</div>
          </Card>
        </Appear>
        <Appear at={b(3)} style={{marginTop: 20}}>
          <Card x={0} y={0} w={550} h={340} style={{position: 'relative', padding: '20px 26px', boxSizing: 'border-box'}}>
            <div style={{fontSize: 30, fontWeight: 900}}>强平时还剩 <span style={{color: C.amber, fontFamily: MONO}}>80U</span>，去哪了？</div>
            <div style={{display: 'flex', gap: 16, marginTop: 30}}>
              {['清算费', '保险基金'].map((t, i) => (
                <div key={t} style={{flex: 1, padding: '22px 0', textAlign: 'center', borderRadius: 18, background: C.panel2, border: `3px solid ${f >= b(5) ? C.amber : C.line}`,
                  fontSize: 32, fontWeight: 900, transform: `scale(${f >= b(5) ? 0.9 + 0.1 * pop(f, b(5, i * 5)) : 1})`}}>{t}</div>
              ))}
            </div>
            <div style={{marginTop: 30, textAlign: 'center', opacity: lin(f, b(6), b(6, 6))}}>
              <span style={{fontSize: 30, color: C.sub, fontWeight: 700}}>你拿回 </span>
              <span style={{fontFamily: MONO, fontSize: 64, fontWeight: 800, color: C.red}}>0 U</span>
            </div>
          </Card>
        </Appear>
      </div>
      {/* flying coins from bar to boxes */}
      {f >= b(5) && f < b(5, 26) ? [0, 1, 2, 3, 4, 5].map((i) => {
        const t = lin(f, b(5, i * 2), b(5, i * 2 + 16), 0, 1, Easing.inOut(Easing.quad));
        const tx = i % 2 ? 860 : 620; const sx = 190, sy = 600, ty = 470;
        return <div key={i} style={{position: 'absolute', left: sx + (tx - sx) * t - 18, top: sy + (ty - sy) * t - 120 * Math.sin(t * Math.PI) - 18, width: 36, height: 36,
          borderRadius: 36, background: C.amber, boxShadow: `0 0 14px ${C.amber}`, opacity: t > 0 && t < 1 ? 1 : 0}} />;
      }) : null}
    </>
  );
};

/* ---------------- 2 Table ---------------- */
const BARS = [
  {at: 6, l: '5x', v: 17.5, txt: '≈17U'},
  {at: 7, l: '10x', v: 35, txt: '35U'},
  {at: 8, l: '20x', v: 70, txt: '70U'},
  {at: 9, l: '100x', v: 350, txt: '350U'},
];
export const Table: React.FC = () => {
  const f = useCurrentFrame(); const b = useBeat();
  const part = (at: number, children: React.ReactNode, col: string) => (
    <span style={{display: 'inline-block', padding: '6px 14px', borderRadius: 12, background: f >= at ? col + '33' : 'transparent',
      border: `3px solid ${f >= at ? col : C.line}`, color: f >= at ? C.text : C.sub, transition: 'none'}}>{children}</span>
  );
  return (
    <>
      <Card x={0} y={0} w={960} h={190} style={{padding: '22px 26px', boxSizing: 'border-box'}}>
        <div style={{fontSize: 28, color: C.sub, fontWeight: 700}}>爆仓比止损多亏的钱 ≈</div>
        <div style={{display: 'flex', alignItems: 'center', gap: 12, marginTop: 16, fontSize: 32, fontWeight: 900, flexWrap: 'nowrap'}}>
          {part(b(0), '仓位价值', C.blue)}<span>×</span>{part(b(1), <>维持保证金率 <span style={{fontFamily: MONO, color: C.amber, opacity: lin(f, b(3), b(3, 6))}}>0.4%</span></>, C.amber)}
          <span>−</span>{part(b(4), <>手续费 <span style={{fontFamily: MONO, color: C.green, opacity: lin(f, b(4), b(4, 6))}}>0.05%</span></>, C.green)}
        </div>
      </Card>
      <Appear at={b(2)} style={{position: 'absolute', left: 0, top: 210}}>
        <Card x={0} y={0} w={960} h={490} style={{position: 'relative', padding: '22px 30px', boxSizing: 'border-box'}}>
          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
            <span style={{fontSize: 32, fontWeight: 900}}>保证金 <span style={{fontFamily: MONO, color: C.amber}}>1000U</span> 时，爆仓多亏</span>
            <Pill color={C.red} style={{fontSize: 24, opacity: lin(f, b(2), b(2, 6))}}>杠杆越高越多</Pill>
          </div>
          <div style={{marginTop: 20}}>
            {BARS.map((r) => {
              const at = b(r.at);
              return (
                <div key={r.l} style={{display: 'flex', alignItems: 'center', height: 74, opacity: lin(f, at - 2, at + 4, 0.18, 1)}}>
                  <div style={{width: 110, fontFamily: MONO, fontSize: 36, fontWeight: 800}}>{r.l}</div>
                  <div style={{flex: 1}}><div style={{width: `${(r.v / 350) * 100 * lin(f, at, at + 18)}%`, minWidth: f >= at ? 10 : 0, height: 42, borderRadius: 10,
                    background: r.v >= 300 ? C.red : r.v >= 60 ? C.amber : C.green}} /></div>
                  <div style={{width: 160, textAlign: 'right', fontFamily: MONO, fontSize: 44, fontWeight: 800, color: r.v >= 300 ? C.red : C.text}}>{f >= at ? r.txt : ''}</div>
                </div>
              );
            })}
          </div>
          <div style={{fontSize: 21, color: C.sub, fontWeight: 700, marginTop: 14}}>以 BTC 维持保证金率约 0.4% 估算，实际按仓位档位，以币安分档表为准；吃单费率 VIP0</div>
        </Card>
      </Appear>
      <Stamp at={b(10)} color={C.red} size={60} rot={-6} style={{left: 380, top: 470}}>本金 1/3 没了</Stamp>
    </>
  );
};

/* ---------------- 3 How ---------------- */
export const How: React.FC = () => {
  const f = useCurrentFrame(); const b = useBeat();
  const step = (n: number, at: number, title: string, body: React.ReactNode, y: number, h: number) => (
    <Appear at={at} style={{position: 'absolute', left: 0, top: y}}>
      <Card x={0} y={0} w={960} h={h} style={{position: 'relative', padding: '18px 26px', boxSizing: 'border-box'}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 16}}>
          <div style={{width: 52, height: 52, borderRadius: 52, background: C.amber, color: C.bg, fontSize: 32, fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>{n}</div>
          <div style={{fontSize: 36, fontWeight: 900}}>{title}</div>
        </div>
        {body}
      </Card>
    </Appear>
  );
  const liqDrift = lin(f, b(8), b(8, 24));
  return (
    <>
      <Appear at={b(0)} style={{position: 'absolute', left: 0, right: 0, top: 0, textAlign: 'center'}}>
        <Pill color={C.green} solid style={{fontSize: 40}}>兜底止损 · 三个要点</Pill>
      </Appear>
      {step(1, b(3), '触发价：标记价格', (
        <div style={{display: 'flex', gap: 14, marginTop: 16}}>
          {['最新价格', '标记价格'].map((t, i) => (
            <div key={t} style={{flex: 1, padding: '12px 0', textAlign: 'center', borderRadius: 14, fontSize: 30, fontWeight: 900,
              background: i === 1 && f >= b(3, 8) ? C.green + '33' : C.panel2, border: `3px solid ${i === 1 && f >= b(3, 8) ? C.green : C.line}`, color: i === 1 ? C.text : C.sub}}>
              {i === 1 && f >= b(3, 8) ? '● ' : '○ '}{t}</div>
          ))}
          <div style={{flex: 1.2, alignSelf: 'center', fontSize: 24, color: C.sub, fontWeight: 700, opacity: lin(f, b(4), b(4, 6))}}>强平也看标记价格</div>
        </div>
      ), 80, 180)}
      {step(2, b(5), '离强平价留 0.2~0.3%', (
        <div style={{position: 'relative', height: 120, marginTop: 6}}>
          <div style={{position: 'absolute', left: 0, right: 0, top: 30, height: 4, background: C.green}} />
          <div style={{position: 'absolute', right: 0, top: -4, fontSize: 24, fontWeight: 900, color: C.green}}>止损触发价</div>
          <div style={{position: 'absolute', left: 0, right: 0, top: 96, height: 4, background: C.red}} />
          <div style={{position: 'absolute', right: 0, top: 66, fontSize: 24, fontWeight: 900, color: C.red}}>强平价</div>
          <div style={{position: 'absolute', left: 30, top: 38, width: 4, height: 54, background: C.amber, opacity: lin(f, b(6), b(6, 6))}} />
          <div style={{position: 'absolute', left: 50, top: 46, fontSize: 28, fontWeight: 900, color: C.amber, opacity: lin(f, b(6), b(6, 6))}}>滑点缓冲区</div>
        </div>
      ), 280, 190)}
      {step(3, b(7), '资金费率会让强平价上移', (
        <div style={{display: 'flex', alignItems: 'center', gap: 14, marginTop: 18, fontSize: 30, fontWeight: 900}}>
          <span style={{padding: '10px 16px', background: C.panel2, borderRadius: 14}}>资金费率</span><span>→</span>
          <span style={{padding: '10px 16px', background: C.panel2, borderRadius: 14}}>保证金 <span style={{color: C.red}}>↓</span></span><span style={{opacity: lin(f, b(8), b(8, 6))}}>→</span>
          <span style={{padding: '10px 16px', background: C.red + '33', border: `3px solid ${C.red}`, borderRadius: 14, opacity: lin(f, b(8), b(8, 6)),
            transform: `translateY(${-14 * liqDrift}px)`}}>强平价 ↑</span>
          <span style={{marginLeft: 'auto', opacity: lin(f, b(9), b(9, 6)), color: C.amber}}>隔几天看一眼</span>
        </div>
      ), 490, 210)}
    </>
  );
};

/* ---------------- 4 Outro ---------------- */
export const Outro: React.FC = () => {
  const f = useCurrentFrame(); const b = useBeat();
  const lv = [
    {p: 0, t: '开仓价', c: C.sub, at: 0},
    {p: 1, t: '正常止损：单笔最多亏总资金 2%', c: C.green, at: b(4)},
    {p: 3.2, t: '兜底止损：最后一道保险', c: C.amber, at: b(1)},
    {p: 3.6, t: '强平价', c: C.red, at: 0},
  ];
  const yOf = (p: number) => 60 + p * 130;
  return (
    <>
      <Card x={0} y={0} w={960} h={600}>
        <div style={{position: 'absolute', left: 60, top: 40, width: 6, height: 500, background: C.line, borderRadius: 3}} />
        {lv.map((l, i) => (
          <div key={i} style={{position: 'absolute', left: 40, right: 30, top: yOf(l.p) - 20, display: 'flex', alignItems: 'center', gap: 20,
            opacity: l.at ? lin(f, l.at, l.at + 6) : 1, transform: `translateX(${l.at ? (1 - pop(f, l.at)) * 40 : 0}px)`}}>
            <div style={{width: 46, height: 46, borderRadius: 46, background: l.c, flex: 'none'}} />
            <div style={{flex: 1, height: 4, background: l.c, opacity: 0.6}} />
            <div style={{fontSize: 32, fontWeight: 900, color: l.c, whiteSpace: 'nowrap'}}>{l.t}</div>
          </div>
        ))}
        <Appear at={b(2)} style={{position: 'absolute', right: 30, top: yOf(3.2) - 66}}>
          <Pill color={C.red} style={{fontSize: 26}}>不是真正的止损</Pill>
        </Appear>
        <Appear at={b(5)} style={{position: 'absolute', left: 140, top: yOf(1) + 60, display: 'flex', alignItems: 'center', gap: 14}}>
          <Check ok size={52} /><span style={{fontSize: 36, fontWeight: 900, color: C.green}}>根本走不到强平线</span>
        </Appear>
      </Card>
      <div style={{position: 'absolute', left: 0, top: 625, width: 960, textAlign: 'center', fontSize: 22, color: C.sub, fontWeight: 700, opacity: lin(f, b(6), b(6, 8))}}>
        {HANDLE} · 数值为估算，以币安官方为准 · 不构成投资建议
      </div>
    </>
  );
};

/** scene id (video.json) → component */
export const SCENES: Record<string, React.FC> = {'00_hook': Hook, '01_why': Why, '02_table': Table, '03_how': How, '04_outro': Outro};
