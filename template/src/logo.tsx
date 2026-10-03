import React from 'react';
import {Img, staticFile} from 'remotion';
import logos from './logos.json';
import {C} from './ui';

/**
 * Official logo from public/ (declared in logos.json: {"binance": {"file": "binance.png", "label": "币安 Binance", "square": true}}).
 * Without a file a dashed placeholder is shown — never draw an imitation of a brand logo.
 */
export const Logo: React.FC<{name: string; h: number; style?: React.CSSProperties}> = ({name, h, style}) => {
  const cfg = (logos as Record<string, any>)[name];
  if (!cfg || !cfg.file) {
    return (
      <div style={{height: h, minWidth: h * 2.6, padding: `0 ${h * 0.3}px`, borderRadius: h * 0.2, border: `2px dashed ${C.sub}`, color: C.sub, display: 'flex',
        alignItems: 'center', justifyContent: 'center', fontSize: h * 0.32, fontWeight: 900, boxSizing: 'border-box', ...style}}>{name.toUpperCase()} LOGO</div>
    );
  }
  if (cfg.square) {
    return (
      <div style={{display: 'flex', alignItems: 'center', gap: h * 0.25, ...style}}>
        <Img src={staticFile(cfg.file)} style={{height: h, width: h, borderRadius: h * 0.22, display: 'block'}} />
        {cfg.label ? <span style={{fontSize: h * 0.5, fontWeight: 900, color: C.text, letterSpacing: 1, fontFamily: '"Noto Sans SC", sans-serif'}}>{cfg.label}</span> : null}
      </div>
    );
  }
  return <Img src={staticFile(cfg.file)} style={{height: h, width: 'auto', objectFit: 'contain', display: 'block', ...style}} />;
};
