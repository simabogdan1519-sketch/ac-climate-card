// ╔═══════════════════════════════════════════════════════╗
// ║  ac-climate-card v3 — Cream Theme Edition             ║
// ║                                                       ║
// ║  Usage in Lovelace YAML:                              ║
// ║    type: custom:ac-climate-card                       ║
// ║    entity: climate.your_ac_entity                     ║
// ║    name: Aer Condiționat   (optional)                 ║
// ║    area: living            (optional)                 ║
// ║    show_power: true        (optional, default true)   ║
// ║    show_current_energy: true (optional, default true) ║
// ║    show_total_energy: true (optional, default true)   ║
// ║    show_temp_ext: true     (optional, default true)   ║
// ║    show_temp_int: true     (optional, default true)   ║
// ║                                                       ║
// ║  Notes:                                               ║
// ║   - Senzorii lipsă (unavailable/unknown) sunt ascunși ║
// ║     automat indiferent de flag.                       ║
// ║   - Setând show_* la false forțezi ascunderea         ║
// ║     chiar dacă entitatea există.                      ║
// ╚═══════════════════════════════════════════════════════╝

const CARD_VERSION = '3.0.0';

// ── Auto-discovery: given climate.prefix_xxx, find related sensors ──
function buildEntities(climateEntityId) {
  const prefix = climateEntityId.replace(/^climate\./, '');
  return {
    climate:       climateEntityId,
    power:         `sensor.${prefix}_power`,
    currentEnergy: `sensor.${prefix}_current_energy`,
    totalEnergy:   `sensor.${prefix}_total_energy`,
    tempExt:       `sensor.${prefix}_temperatura_exterioara`,
    tempInt:       `sensor.${prefix}_temperatura_interioara`,
  };
}

// ── Mode visual config — cream-friendly accent colors ──
const MODES = {
  cool:     { cls:'mode-cool', icon:'❄', label:'Răcire',     dispText:'COOL', rgb:'107,165,196', color:'#5a8fb0', light:'#7fb0cc', glow:'rgba(107,165,196,0.42)' },
  heat:     { cls:'mode-heat', icon:'🔥', label:'Încălzire',  dispText:'HEAT', rgb:'212,140,90',  color:'#b87545', light:'#d49260', glow:'rgba(212,140,90,0.42)' },
  fan_only: { cls:'mode-fan',  icon:'💨', label:'Ventilare',  dispText:'FAN',  rgb:'160,170,190', color:'#7a8aaa', light:'#a0b0c8', glow:'rgba(160,170,190,0.40)' },
  dry:      { cls:'mode-dry',  icon:'💧', label:'Dezumidif.', dispText:'DRY',  rgb:'130,180,180', color:'#5e9494', light:'#8ab8b8', glow:'rgba(130,180,180,0.42)' },
  auto:     { cls:'mode-auto', icon:'🔄', label:'Auto',       dispText:'AUTO', rgb:'111,174,127', color:'#5a9170', light:'#8fc99e', glow:'rgba(111,174,127,0.42)' },
  off:      { cls:'mode-off',  icon:'○',  label:'Oprit',      dispText:'OFF',  rgb:'173,181,160', color:'#9ca38b', light:'#c0c8b0', glow:'rgba(173,181,160,0.30)' },
};

// ── Styles ──
const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif&family=Quicksand:wght@500;600;700&family=Space+Mono:wght@400;700&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  :host { display: block; }

  /* ══ CARD SHELL ══ */
  .card-wrap {
    max-width: 480px;
    margin: 0 auto;
  }
  .card {
    background: linear-gradient(175deg, #f5f1ea 0%, #ede6db 100%);
    border-radius: 26px;
    padding: 18px 18px 20px;
    position: relative;
    overflow: hidden;
    color: #3a3530;
    font-family: 'Quicksand', sans-serif;
    box-shadow:
      0 2px 4px rgba(0,0,0,0.04),
      0 8px 24px rgba(0,0,0,0.08),
      0 24px 48px rgba(0,0,0,0.06);

    --accent-color: var(--mode-color, #9ca38b);
    --accent-light: var(--mode-light, #c0c8b0);
    --accent-glow:  var(--mode-glow,  rgba(173,181,160,0.30));
    --accent-rgb:   var(--mode-rgb,   173,181,160);
  }

  /* Mode-specific CSS variables */
  .card.mode-cool { --mode-color:#5a8fb0; --mode-light:#7fb0cc; --mode-glow:rgba(107,165,196,0.42); --mode-rgb:107,165,196; }
  .card.mode-heat { --mode-color:#b87545; --mode-light:#d49260; --mode-glow:rgba(212,140,90,0.42);  --mode-rgb:212,140,90; }
  .card.mode-fan  { --mode-color:#7a8aaa; --mode-light:#a0b0c8; --mode-glow:rgba(160,170,190,0.40); --mode-rgb:160,170,190; }
  .card.mode-dry  { --mode-color:#5e9494; --mode-light:#8ab8b8; --mode-glow:rgba(130,180,180,0.42); --mode-rgb:130,180,180; }
  .card.mode-auto { --mode-color:#5a9170; --mode-light:#8fc99e; --mode-glow:rgba(111,174,127,0.42); --mode-rgb:111,174,127; }
  .card.mode-off  { --mode-color:#9ca38b; --mode-light:#c0c8b0; --mode-glow:rgba(173,181,160,0.30); --mode-rgb:173,181,160; }

  /* Ambient glow halo */
  .card::before {
    content: '';
    position: absolute; top: -40px; left: 50%; transform: translateX(-50%);
    width: 320px; height: 200px;
    background: radial-gradient(ellipse at center, var(--accent-glow) 0%, transparent 65%);
    opacity: 0; pointer-events: none; z-index: 0;
    transition: opacity 0.9s, background 0.5s;
    filter: blur(22px);
  }
  .card.on::before { opacity: 0.5; animation: ambientPulse 4s ease-in-out infinite; }
  @keyframes ambientPulse {
    0%,100% { opacity: 0.35; }
    50%     { opacity: 0.65; }
  }

  /* ── Header ── */
  .card-header {
    display: flex; justify-content: space-between; align-items: center;
    margin-bottom: 12px;
    position: relative; z-index: 2;
    gap: 10px;
  }
  .header-left {
    display: flex; align-items: center; gap: 10px;
    min-width: 0; flex: 1;
  }

  .header-icon {
    width: 36px; height: 36px; border-radius: 10px;
    display: flex; align-items: center; justify-content: center;
    font-size: 18px; flex-shrink: 0;
    background: rgba(255,255,255,0.65);
    border: 1px solid rgba(0,0,0,0.07);
    box-shadow: 0 2px 5px rgba(0,0,0,0.05), inset 0 1px 0 rgba(255,255,255,0.7);
    transition: all 0.5s;
  }
  .card.on .header-icon {
    background: rgba(var(--accent-rgb), 0.13);
    border-color: rgba(var(--accent-rgb), 0.4);
    box-shadow: 0 0 14px rgba(var(--accent-rgb), 0.28), inset 0 1px 0 rgba(255,255,255,0.4);
  }

  .header-title-wrap { min-width: 0; }
  .header-title {
    font-family: 'Instrument Serif', serif;
    font-size: 20px; font-weight: 400; color: #2a2520;
    line-height: 1.1;
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  }
  .header-sub {
    font-size: 10px; color: #9a9080;
    font-family: 'Space Mono', monospace;
    letter-spacing: 0.5px;
    margin-top: 2px;
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  }
  .header-sub:empty { display: none; }

  .status-badge {
    display: flex; align-items: center; gap: 6px;
    padding: 5px 11px; border-radius: 20px;
    font-size: 11px; font-weight: 700; letter-spacing: 0.3px;
    background: rgba(255,255,255,0.65);
    border: 1px solid rgba(0,0,0,0.07);
    color: #6b6259;
    box-shadow: 0 2px 5px rgba(0,0,0,0.05), inset 0 1px 0 rgba(255,255,255,0.7);
    transition: all 0.5s;
    flex-shrink: 0;
    white-space: nowrap;
  }
  .card.on .status-badge {
    background: rgba(var(--accent-rgb), 0.13);
    border-color: rgba(var(--accent-rgb), 0.4);
    color: var(--accent-color);
    box-shadow: 0 0 12px rgba(var(--accent-rgb), 0.22), inset 0 1px 0 rgba(255,255,255,0.4);
  }
  .status-dot {
    width: 6px; height: 6px; border-radius: 50%;
    background: currentColor;
  }
  .card.on .status-dot { animation: dotPulse 1.6s ease-in-out infinite; }
  .card.mode-off .status-dot { opacity: 0.4; }
  @keyframes dotPulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.4;transform:scale(.65)} }

  /* ══ AC SCENE ══ */
  .machine-viewport {
    display: flex; justify-content: center; align-items: center;
    margin: 6px 0 16px;
    padding-bottom: 54px;
    position: relative; z-index: 1;
  }
  .ac-scene {
    position: relative;
    width: 280px; height: 116px;
  }

  /* ── AC Body ── */
  .ac-body {
    position: absolute; top: 0; left: 0; right: 0;
    height: 116px; border-radius: 20px;
    background:
      radial-gradient(ellipse at 30% 12%, rgba(255,255,255,0.85) 0%, transparent 55%),
      linear-gradient(165deg, #fdf5e2 0%, #f5ead0 40%, #ecddb8 75%, #e0cfa0 100%);
    border: 1px solid rgba(180,140,80,0.18);
    box-shadow:
      inset 0 2px 4px rgba(255,255,255,0.9),
      inset 0 -10px 18px rgba(180,140,80,0.18),
      inset -8px 0 16px rgba(180,140,80,0.10),
      inset  8px 0 14px rgba(255,255,255,0.30),
      0  4px 10px rgba(120,90,50,0.10),
      0 12px 22px rgba(120,90,50,0.14),
      0 24px 40px rgba(120,90,50,0.16);
    transition: box-shadow 0.7s, filter 0.7s;
  }
  .card.on .ac-body {
    box-shadow:
      inset 0 2px 4px rgba(255,255,255,0.9),
      inset 0 -10px 18px rgba(180,140,80,0.18),
      inset -8px 0 16px rgba(180,140,80,0.10),
      inset  8px 0 14px rgba(255,255,255,0.30),
      0  4px 10px rgba(120,90,50,0.10),
      0 12px 22px rgba(120,90,50,0.14),
      0 24px 40px rgba(120,90,50,0.16),
      0  0  45px var(--accent-glow);
  }
  .card.mode-off .ac-body { filter: brightness(0.96) saturate(0.85); }

  /* Top bevel */
  .ac-bevel {
    position: absolute; top: 0; left: 20px; right: 20px; height: 2px;
    border-radius: 20px 20px 0 0;
    background: linear-gradient(90deg,
      transparent,
      rgba(255,255,255,0.7) 20%,
      rgba(255,255,255,1) 50%,
      rgba(255,255,255,0.7) 80%,
      transparent);
  }
  .ac-body::before {
    content: ''; position: absolute;
    left: 7px; top: 14px; bottom: 14px; width: 2px;
    background: linear-gradient(180deg,
      transparent,
      rgba(255,255,255,0.55) 30%,
      rgba(255,255,255,0.55) 70%,
      transparent);
    border-radius: 2px; filter: blur(0.5px);
  }
  .ac-body::after {
    content: ''; position: absolute;
    top: 7px; left: 22%; right: 22%; height: 1.5px;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.7), transparent);
    border-radius: 50%; filter: blur(0.8px);
  }

  /* ── DISPLAY ── */
  .ac-display {
    position: absolute;
    top: 16px; left: 50%; transform: translateX(-50%);
    width: 68px; height: 68px;
    background: radial-gradient(circle at 32% 28%, #3a2a1f 0%, #1a1108 68%, #050200 100%);
    border-radius: 50%;
    display: flex; flex-direction: column;
    align-items: center; justify-content: center;
    border: 3px solid #f5ead0;
    overflow: hidden; cursor: pointer;
    box-shadow:
      inset 0 3px 7px rgba(0,0,0,0.75),
      inset 0 -2px 4px var(--accent-glow),
      0 4px 10px rgba(0,0,0,0.22);
    transition: box-shadow 0.5s;
    z-index: 4;
  }
  .ac-display::before {
    content: ''; position: absolute; top: 5px; left: 10px;
    width: 22px; height: 10px;
    background: linear-gradient(135deg, rgba(255,255,255,0.22), transparent);
    border-radius: 50%; transform: rotate(-28deg); filter: blur(2px); z-index: 3;
  }
  .display-scan {
    position: absolute; top: 0; left: -50%; width: 50%; height: 100%;
    background: linear-gradient(90deg, transparent, var(--accent-color), transparent);
    opacity: 0; pointer-events: none; z-index: 1;
  }
  .card.on .display-scan { animation: displayScan 3.5s ease-in-out infinite; }
  @keyframes displayScan {
    0%   { left:-50%; opacity:0;    }
    18%  { opacity:.14; }
    55%  { left:100%; opacity:.14; }
    100% { left:100%; opacity:0;    }
  }
  .ac-dt {
    font-family: 'Space Mono', monospace;
    font-size: 17px; font-weight: 700; letter-spacing: 0.4px;
    color: var(--accent-color); line-height: 1; z-index: 2;
    text-shadow: 0 0 8px var(--accent-glow);
    transition: color 0.5s, text-shadow 0.5s;
  }
  .card.mode-off .ac-dt { color: #6b6259; text-shadow: none; }
  .ac-dm {
    font-family: 'Space Mono', monospace;
    font-size: 6px; letter-spacing: 1.2px;
    color: var(--accent-color); margin-top: 4px;
    opacity: 0.65; z-index: 2;
    transition: color 0.5s;
  }
  .card.mode-off .ac-dm { color: #6b6259; opacity: 0.45; }
  .card.on .ac-dt { animation: textGlow 2.4s ease-in-out infinite; }
  @keyframes textGlow {
    0%,100% { text-shadow: 0 0 4px var(--accent-glow); }
    50%     { text-shadow: 0 0 9px var(--accent-color), 0 0 16px var(--accent-glow); }
  }
  .disp-divider {
    width: 32px; height: 1px;
    background: var(--accent-color);
    margin: 3px 0;
    opacity: 0.35;
  }

  /* ── DOT GRID ── */
  .dot-grid-wrap {
    position: absolute;
    top: 30px; left: 12px; right: 12px;
    height: 38px;
    display: flex; justify-content: space-between; align-items: center;
    pointer-events: none; z-index: 2;
  }
  .dot-grid {
    display: grid;
    grid-template-columns: repeat(9, 1fr);
    grid-template-rows: repeat(5, 1fr);
    gap: 2px;
    width: 78px; height: 36px;
  }
  .dot {
    aspect-ratio: 1;
    background: #c5b8a5;
    border-radius: 1.5px;
    box-shadow: inset 0 1px 0 rgba(255,255,255,0.3);
    transition: background 0.4s;
  }
  .dot.accent {
    background: var(--accent-color);
    box-shadow: inset 0 1px 0 rgba(255,255,255,0.45), 0 0 4px var(--accent-glow);
  }
  .card.on .dot.accent { animation: dotAccPulse 3.2s ease-in-out infinite; }
  @keyframes dotAccPulse {
    0%,100% { background: var(--accent-color); }
    50%     { background: var(--accent-light); box-shadow: inset 0 1px 0 rgba(255,255,255,0.5), 0 0 6px var(--accent-color); }
  }

  /* ── STATUS LEDS ── */
  .ac-leds {
    position: absolute;
    top: 18px; right: 14px;
    display: flex; gap: 5px;
    z-index: 3;
  }
  .ac-led {
    width: 5px; height: 5px; border-radius: 50%;
    transition: all 0.5s;
  }
  .ac-led.g {
    background: radial-gradient(circle at 35% 30%, #a7f3d0, #10b981);
    box-shadow: 0 0 0 2px rgba(16,185,129,0.12), 0 0 5px rgba(16,185,129,0.7);
  }
  .ac-led.b {
    background: radial-gradient(circle at 35% 30%, #bfdbfe, var(--accent-color));
    box-shadow: 0 0 0 2px rgba(var(--accent-rgb),0.15), 0 0 5px rgba(var(--accent-rgb),0.7);
    animation: ledBlink 4s ease-in-out infinite;
  }
  .ac-led.dim { background: rgba(180,140,80,0.4); }
  .card.mode-off .ac-led { box-shadow: none !important; opacity: 0.4; }
  .card.mode-off .ac-led.b { animation: none; }
  @keyframes ledBlink { 0%,45%,55%,100%{opacity:1} 50%{opacity:.15} }

  /* ── WiFi ── */
  .ac-wifi {
    position: absolute;
    top: 12px; left: 14px;
    width: 14px; height: 11px;
    z-index: 3;
    opacity: 0.85;
    transition: opacity 0.5s;
  }
  .card.mode-off .ac-wifi { opacity: 0.35; }

  /* ── LOUVRE ── */
  .ac-louvre-wrap {
    position: absolute; bottom: 0; left: 0; right: 0;
    height: 32px;
    border-radius: 0 0 20px 20px;
    background: linear-gradient(180deg, rgba(180,140,80,0.04), rgba(180,140,80,0.12));
    border-top: 1px solid rgba(180,140,80,0.15);
    overflow: hidden;
    display: flex; flex-direction: column;
    align-items: center; justify-content: center;
    gap: 3.5px; padding: 0 22px;
  }
  .ac-blade {
    height: 3.5px; border-radius: 3px; width: 100%;
    position: relative;
    background: linear-gradient(180deg,
      rgba(245,234,208,0) 0%,
      rgba(220,200,160,0.7) 30%,
      rgba(195,170,125,0.85) 60%,
      rgba(170,140,95,0.55) 100%);
    box-shadow: 0 1.5px 0 rgba(255,250,235,0.5), 0 -1px 0 rgba(120,85,40,0.1);
    animation: bladeSweep 3.4s ease-in-out infinite;
  }
  .ac-blade:nth-child(2) { animation-delay: 0.3s; }
  .ac-blade:nth-child(3) { animation-delay: 0.6s; width: 90%; }
  .ac-blade::after {
    content: '';
    position: absolute; top: 1px; left: 8%; right: 8%; height: 1px;
    border-radius: 1px;
    background: rgba(255,250,235,0.5);
  }
  @keyframes bladeSweep {
    0%   { transform: perspective(80px) rotateX(-12deg) translateY(-1px); }
    50%  { transform: perspective(80px) rotateX(12deg)  translateY(1px);  }
    100% { transform: perspective(80px) rotateX(-12deg) translateY(-1px); }
  }
  .card.mode-off .ac-blade { animation-play-state: paused; opacity: 0.6; }

  /* ── AIRFLOW STREAMS ── */
  .ac-flow {
    position: absolute;
    bottom: -42px; left: 50%; transform: translateX(-50%);
    width: 240px; height: 44px;
    pointer-events: none;
  }
  .ac-stream {
    position: absolute;
    border-radius: 3px;
    animation: aStream linear infinite;
    transition: background 0.7s, box-shadow 0.7s;
  }
  @keyframes aStream {
    0%   { opacity: 0; transform: translateY(0) scaleX(0.2); }
    20%  { opacity: 0.9; }
    70%  { opacity: 0.4; }
    100% { opacity: 0; transform: translateY(22px) scaleX(1.2); }
  }
  .card.mode-off .ac-flow { opacity: 0; transition: opacity 0.7s; }
  .card.mode-heat .ac-stream { animation: hStream linear infinite !important; }
  @keyframes hStream {
    0%   { opacity: 0; transform: translateY(4px) scaleX(0.2); }
    20%  { opacity: 0.8; }
    70%  { opacity: 0.3; }
    100% { opacity: 0; transform: translateY(-18px) scaleX(1.1); }
  }

  /* ── MIST ── */
  .ac-mist {
    position: absolute;
    bottom: -48px; left: 50%; transform: translateX(-50%);
    width: 240px; height: 50px;
    pointer-events: none;
  }
  .ac-mist-p {
    position: absolute;
    border-radius: 50%;
    animation: mistDrop linear infinite;
    transition: background 0.7s, box-shadow 0.7s;
  }
  @keyframes mistDrop {
    0%   { transform: translateY(0) scale(0.4); opacity: 0; }
    12%  { opacity: 0.7; }
    80%  { opacity: 0.2; }
    100% { transform: translateY(50px) scale(2.2); opacity: 0; }
  }
  .card.mode-off .ac-mist { opacity: 0; transition: opacity 0.7s; }
  .card.mode-heat .ac-mist-p { display: none; }
  .card.mode-fan  .ac-mist-p { display: none; }

  /* ── HEAT GLOW ── */
  .ac-glow {
    position: absolute;
    bottom: -24px; left: 50%; transform: translateX(-50%);
    width: 210px; height: 26px;
    pointer-events: none;
    background: radial-gradient(ellipse, var(--accent-glow) 0%, transparent 70%);
    transition: background 1s ease, width 1s ease, height 1s ease, bottom 1s ease;
  }
  .card.mode-heat .ac-glow {
    width: 250px !important; height: 46px !important; bottom: -22px !important;
    background: radial-gradient(ellipse,
      rgba(212,140,90,0.45) 0%,
      rgba(184,117,69,0.20) 45%,
      transparent 72%) !important;
    animation: heatPulse 2.4s ease-in-out infinite !important;
  }
  @keyframes heatPulse {
    0%,100% { opacity: 0.45; transform: translateX(-50%) scaleX(1) scaleY(1); }
    50%     { opacity: 1;    transform: translateX(-50%) scaleX(1.08) scaleY(1.18); }
  }
  .card.mode-off .ac-glow { opacity: 0; transition: opacity 0.7s; }

  /* ══ TEMP ROW ══ */
  .temp-row {
    display: flex; align-items: center; gap: 10px;
    margin-bottom: 12px;
    background: rgba(255,255,255,0.58);
    border: 1px solid rgba(0,0,0,0.045);
    border-radius: 18px;
    padding: 10px 14px;
    box-shadow: 0 2px 7px rgba(0,0,0,0.045), inset 0 1px 0 rgba(255,255,255,0.65);
    position: relative; overflow: hidden;
  }
  .temp-row::before {
    content: ''; position: absolute; top: 0; left: 0; right: 0; height: 2px;
    background: var(--accent-color); opacity: 0;
    transition: opacity 0.5s;
  }
  .card.on .temp-row::before { opacity: 0.55; }

  .temp-display {
    flex: 1; text-align: center;
    font-family: 'Instrument Serif', serif;
  }
  .temp-big {
    font-size: 32px; font-weight: 400;
    color: var(--accent-color); line-height: 1;
    letter-spacing: -0.5px;
    transition: color 0.5s;
  }
  .card.mode-off .temp-big { color: #6b6259; }
  .temp-label {
    font-family: 'Quicksand', sans-serif;
    font-size: 9px; font-weight: 700;
    color: #b0a898;
    text-transform: uppercase;
    letter-spacing: 1.1px;
    margin-top: 2px;
  }

  .btn-temp {
    width: 40px; height: 40px;
    border-radius: 50%;
    background: rgba(255,255,255,0.65);
    border: 1px solid rgba(0,0,0,0.07);
    color: var(--accent-color);
    font-family: 'Quicksand', sans-serif;
    font-size: 20px; font-weight: 600;
    cursor: pointer;
    display: flex; align-items: center; justify-content: center;
    box-shadow: 0 2px 5px rgba(0,0,0,0.05), inset 0 1px 0 rgba(255,255,255,0.7);
    transition: all 0.2s;
    flex-shrink: 0;
  }
  .btn-temp:hover:not(:disabled) { background: rgba(255,255,255,0.95); transform: translateY(-1px); }
  .btn-temp:active:not(:disabled) { transform: scale(0.95); }
  .btn-temp:disabled { color: #b0a898; cursor: not-allowed; opacity: 0.6; }

  /* ══ MODE ROW ══ */
  .mode-row {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(0, 1fr));
    gap: 5px;
    margin-bottom: 12px;
  }
  .mode-btn {
    padding: 9px 4px;
    border-radius: 12px;
    border: 1px solid rgba(0,0,0,0.07);
    background: rgba(255,255,255,0.55);
    color: #8a7f72;
    font-family: 'Quicksand', sans-serif;
    font-size: 10px; font-weight: 700;
    cursor: pointer; text-align: center; line-height: 1.3;
    transition: all 0.2s;
    box-shadow: 0 2px 4px rgba(0,0,0,0.04), inset 0 1px 0 rgba(255,255,255,0.55);
    letter-spacing: 0.3px;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .mode-btn:hover {
    background: rgba(255,255,255,0.88);
    color: #2a2520;
  }
  .mode-btn.active {
    background: linear-gradient(140deg,
      rgba(var(--accent-rgb), 0.18) 0%,
      rgba(var(--accent-rgb), 0.08) 100%);
    border-color: rgba(var(--accent-rgb), 0.4);
    color: var(--accent-color);
    box-shadow: 0 4px 10px rgba(var(--accent-rgb), 0.18), inset 0 1px 0 rgba(255,255,255,0.45);
  }

  /* ══ STATS GRID — dynamic columns ══ */
  .stats {
    display: grid;
    gap: 6px;
    margin-bottom: 12px;
  }
  .stats[data-count="1"] { grid-template-columns: 1fr; }
  .stats[data-count="2"] { grid-template-columns: 1fr 1fr; }
  .stats[data-count="3"] { grid-template-columns: 1fr 1fr 1fr; }
  .stats:empty { display: none; margin-bottom: 0; }

  .stat {
    background: rgba(255,255,255,0.58);
    border: 1px solid rgba(0,0,0,0.045);
    border-radius: 14px;
    padding: 10px 6px;
    text-align: center;
    box-shadow: 0 2px 5px rgba(0,0,0,0.04), inset 0 1px 0 rgba(255,255,255,0.65);
  }
  .stat-val {
    font-family: 'Space Mono', monospace;
    font-size: 15px; font-weight: 700;
    color: #2a2520;
    display: block;
    line-height: 1.1;
  }
  .stat-key {
    font-family: 'Quicksand', sans-serif;
    font-size: 8.5px; font-weight: 700;
    color: #b0a898;
    text-transform: uppercase;
    letter-spacing: 0.9px;
    margin-top: 4px;
  }

  /* ══ SENSOR PILLS ══ */
  .sensor-strip {
    display: grid;
    gap: 6px;
    margin-bottom: 12px;
  }
  .sensor-strip[data-count="1"] { grid-template-columns: 1fr; }
  .sensor-strip[data-count="2"] { grid-template-columns: 1fr 1fr; }
  .sensor-strip:empty { display: none; margin-bottom: 0; }

  .sensor-pill {
    background: rgba(255,255,255,0.58);
    border: 1px solid rgba(0,0,0,0.045);
    border-radius: 14px;
    padding: 9px 11px;
    display: flex; align-items: center; gap: 8px;
    box-shadow: 0 2px 5px rgba(0,0,0,0.04), inset 0 1px 0 rgba(255,255,255,0.65);
    min-width: 0;
  }
  .sensor-icon {
    font-size: 14px;
    color: var(--accent-color);
    transition: color 0.5s;
    flex-shrink: 0;
  }
  .card.mode-off .sensor-icon { color: #b0a898; }
  .sensor-info { display: flex; flex-direction: column; min-width: 0; flex: 1; }
  .sensor-val {
    font-family: 'Space Mono', monospace;
    font-size: 12px; font-weight: 700;
    color: #2a2520; line-height: 1.2;
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  }
  .sensor-key {
    font-family: 'Quicksand', sans-serif;
    font-size: 8px; font-weight: 700;
    color: #b0a898;
    text-transform: uppercase;
    letter-spacing: 0.8px;
    margin-top: 2px;
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  }

  /* ══ PROGRESS BAR ══ */
  .progress-section {
    margin-bottom: 12px;
    transition: opacity 0.5s, max-height 0.5s, margin-bottom 0.5s;
    overflow: hidden;
    max-height: 50px;
  }
  .progress-section.hidden {
    opacity: 0;
    max-height: 0;
    margin-bottom: 0;
    pointer-events: none;
  }
  .prog-header {
    display: flex; align-items: center; justify-content: space-between;
    margin-bottom: 6px;
  }
  .prog-label {
    font-family: 'Quicksand', sans-serif;
    font-size: 9px; font-weight: 700;
    color: #b0a898;
    text-transform: uppercase;
    letter-spacing: 1px;
  }
  .prog-time {
    font-family: 'Space Mono', monospace;
    font-size: 10px; font-weight: 700;
    color: var(--accent-color);
    transition: color 0.5s;
  }
  .progress-bar {
    height: 4px;
    background: rgba(0,0,0,0.07);
    border-radius: 3px;
    overflow: hidden;
  }
  .progress-fill {
    height: 100%;
    border-radius: 3px;
    background: linear-gradient(90deg, var(--accent-color), var(--accent-light));
    transition: width 0.8s ease, background 0.5s;
    position: relative;
  }
  .progress-fill::after {
    content: ''; position: absolute;
    right: 0; top: 0; bottom: 0; width: 30px;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.5));
    animation: shimmer 1.8s linear infinite;
  }
  @keyframes shimmer {
    0%,100% { opacity: 0; }
    50%     { opacity: 1; }
  }

  /* ══ CONTROLS ══ */
  .controls { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 6px; }
  .btn {
    padding: 10px 6px;
    border-radius: 13px;
    border: 1px solid rgba(0,0,0,0.07);
    background: rgba(255,255,255,0.55);
    color: #8a7f72;
    font-family: 'Quicksand', sans-serif;
    font-size: 10.5px; font-weight: 700;
    cursor: pointer;
    transition: all 0.2s;
    box-shadow: 0 2px 4px rgba(0,0,0,0.04), inset 0 1px 0 rgba(255,255,255,0.55);
    letter-spacing: 0.3px;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .btn:hover:not(:disabled) { background: rgba(255,255,255,0.88); color: #2a2520; transform: translateY(-1px); }
  .btn:active:not(:disabled) { transform: scale(0.97); }
  .btn:disabled { opacity: 0.5; cursor: not-allowed; }
  .btn.danger { color: #c04a28; border-color: rgba(192,74,40,0.18); }
  .btn.danger:hover:not(:disabled) { background: rgba(192,74,40,0.06); }
  .btn.success { color: #4a8a5c; border-color: rgba(74,138,92,0.22); }
  .btn.success:hover:not(:disabled) { background: rgba(74,138,92,0.07); }
  .btn.primary {
    background: linear-gradient(140deg,
      rgba(var(--accent-rgb), 0.16) 0%,
      rgba(var(--accent-rgb), 0.07) 100%);
    border-color: rgba(var(--accent-rgb), 0.35);
    color: var(--accent-color);
    box-shadow: 0 4px 8px rgba(var(--accent-rgb), 0.15), inset 0 1px 0 rgba(255,255,255,0.45);
  }
  .btn.primary:hover:not(:disabled) {
    background: linear-gradient(140deg,
      rgba(var(--accent-rgb), 0.22) 0%,
      rgba(var(--accent-rgb), 0.10) 100%);
  }
`;

// ── HTML Template ──
const TEMPLATE = `
  <div class="card-wrap">
    <div class="card mode-off" id="card">

      <div class="card-header">
        <div class="header-left">
          <div class="header-icon" id="icon">○</div>
          <div class="header-title-wrap">
            <div class="header-title" id="title">Aer Condiționat</div>
            <div class="header-sub"  id="sub"></div>
          </div>
        </div>
        <div class="status-badge" id="badge">
          <span class="status-dot"></span>
          <span id="badgeText">--</span>
        </div>
      </div>

      <div class="machine-viewport">
        <div class="ac-scene">
          <div class="ac-body">
            <div class="ac-bevel"></div>

            <svg class="ac-wifi" viewBox="0 0 14 11" fill="none">
              <path d="M2 6.5 Q 7 2 12 6.5" stroke="rgba(120,85,40,0.7)" stroke-width="1" stroke-linecap="round"/>
              <path d="M4 8 Q 7 5.5 10 8" stroke="rgba(120,85,40,0.55)" stroke-width="1" stroke-linecap="round"/>
              <circle cx="7" cy="9.5" r="0.9" fill="rgba(120,85,40,0.85)"/>
            </svg>

            <div class="ac-leds">
              <div class="ac-led g" id="ledG"></div>
              <div class="ac-led b" id="ledB"></div>
              <div class="ac-led dim"></div>
            </div>

            <div class="ac-display" id="display">
              <div class="display-scan"></div>
              <span class="ac-dt" id="dispTemp">--°</span>
              <div class="disp-divider"></div>
              <span class="ac-dm" id="dispMode">--</span>
            </div>

            <div class="dot-grid-wrap">
              <div class="dot-grid" id="dotGridL"></div>
              <div class="dot-grid" id="dotGridR"></div>
            </div>

            <div class="ac-louvre-wrap">
              <div class="ac-blade"></div>
              <div class="ac-blade"></div>
              <div class="ac-blade"></div>
            </div>
          </div>

          <div class="ac-glow" id="acGlow"></div>
          <div class="ac-flow" id="acFlow"></div>
          <div class="ac-mist" id="acMist"></div>
        </div>
      </div>

      <div class="temp-row">
        <button class="btn-temp" id="btnMinus">−</button>
        <div class="temp-display">
          <div class="temp-big"   id="tempBig">--°</div>
          <div class="temp-label">Temperatură setată</div>
        </div>
        <button class="btn-temp" id="btnPlus">+</button>
      </div>

      <div class="mode-row" id="modeRow"></div>

      <div class="stats" id="stats"></div>

      <div class="sensor-strip" id="sensorStrip"></div>

      <div class="progress-section" id="progressSection">
        <div class="prog-header">
          <span class="prog-label" id="progLabel">--</span>
          <span class="prog-time"  id="progTime">--</span>
        </div>
        <div class="progress-bar">
          <div class="progress-fill" id="progFill" style="width:0%"></div>
        </div>
      </div>

      <div class="controls">
        <button class="btn" id="btnPower">⏻ --</button>
        <button class="btn primary" id="btnFan">💨 --</button>
        <button class="btn primary" id="btnSwing">↕ --</button>
      </div>
    </div>
  </div>
`;

// ════════════════════════════════════════════
//  Custom Element
// ════════════════════════════════════════════
class AcClimateCard extends HTMLElement {

  setConfig(config) {
    if (!config.entity) throw new Error('Trebuie să specifici "entity: climate.xxx"');
    this._config = {
      show_power: true,
      show_current_energy: true,
      show_total_energy: true,
      show_temp_ext: true,
      show_temp_int: true,
      ...config,
    };
    this._entities = buildEntities(config.entity);
    if (!this.shadowRoot) {
      this.attachShadow({ mode: 'open' });
      this.shadowRoot.innerHTML = `<style>${STYLES}</style>${TEMPLATE}`;
      this._buildDots();
      this._buildParticles();
      this._bindButtons();
    }
  }

  set hass(hass) {
    this._hass = hass;
    this._render();
  }

  _buildDots() {
    const sr = this.shadowRoot;
    [sr.getElementById('dotGridL'), sr.getElementById('dotGridR')].forEach(grid => {
      // 9 cols x 5 rows = 45 dots per side
      for (let i = 0; i < 45; i++) {
        const d = document.createElement('div');
        d.className = 'dot';
        if (Math.random() < 0.22) d.classList.add('accent');
        grid.appendChild(d);
      }
    });
  }

  _buildParticles() {
    const flow = this.shadowRoot.getElementById('acFlow');
    [
      {l:'4%', w:36,h:2.5,t:2, d:0,   dur:1.9},
      {l:'16%',w:28,h:1.5,t:12,d:.28, dur:2.3},
      {l:'28%',w:44,h:2,  t:6, d:.55, dur:1.7},
      {l:'44%',w:32,h:3,  t:18,d:.12, dur:2.1},
      {l:'58%',w:40,h:1.5,t:8, d:.70, dur:1.8},
      {l:'72%',w:32,h:2.5,t:14,d:.38, dur:2.4},
      {l:'84%',w:24,h:2,  t:4, d:.85, dur:2.0},
    ].forEach(c => {
      const s = document.createElement('div');
      s.className = 'ac-stream';
      s.style.cssText = `left:${c.l};width:${c.w}px;height:${c.h}px;top:${c.t}px;animation-delay:${c.d}s;animation-duration:${c.dur}s;background:linear-gradient(90deg,transparent,rgba(var(--accent-rgb),0.55),rgba(var(--accent-rgb),0.3),transparent);box-shadow:0 0 6px rgba(var(--accent-rgb),0.35)`;
      flow.appendChild(s);
    });

    const mist = this.shadowRoot.getElementById('acMist');
    for (let i = 0; i < 18; i++) {
      const p = document.createElement('div');
      p.className = 'ac-mist-p';
      const sz = 2.5 + Math.random() * 3.5;
      p.style.cssText = `width:${sz}px;height:${sz}px;left:${4+Math.random()*92}%;animation-duration:${2.2+Math.random()*3}s;animation-delay:${Math.random()*3.5}s;background:radial-gradient(circle,rgba(var(--accent-rgb),0.65),rgba(var(--accent-rgb),0.2));box-shadow:0 0 8px rgba(var(--accent-rgb),0.45)`;
      mist.appendChild(p);
    }
  }

  _bindButtons() {
    const sr = this.shadowRoot;
    sr.getElementById('btnMinus').onclick  = () => this._adjustTemp(-1);
    sr.getElementById('btnPlus').onclick   = () => this._adjustTemp(1);
    sr.getElementById('btnPower').onclick  = () => this._toggleOff();
    sr.getElementById('btnFan').onclick    = () => this._cycleFan();
    sr.getElementById('btnSwing').onclick  = () => this._cycleSwing();
  }

  // ── Sensor availability ──
  _hasSensor(entityId) {
    const s = this._hass?.states[entityId];
    if (!s) return false;
    if (s.state === 'unavailable' || s.state === 'unknown') return false;
    return true;
  }

  _sensorVal(entityId, fallback = '--') {
    const s = this._hass?.states[entityId];
    if (!s || s.state === 'unavailable' || s.state === 'unknown') return fallback;
    return s.state;
  }

  // ── Main render ──
  _render() {
    if (!this._hass || !this._config) return;
    const hass     = this._hass;
    const entities = this._entities;
    const cfg      = this._config;
    const sr       = this.shadowRoot;

    const climateState = hass.states[entities.climate];
    if (!climateState) return;

    const hvacMode   = climateState.state;
    const setTemp    = climateState.attributes.temperature ?? '--';
    const curTemp    = climateState.attributes.current_temperature;
    const fanMode    = climateState.attributes.fan_mode ?? 'auto';
    const swingMode  = climateState.attributes.swing_mode ?? 'off';
    const hvacModes  = climateState.attributes.hvac_modes ?? Object.keys(MODES);
    const fanModes   = climateState.attributes.fan_modes  ?? ['auto','low','medium','high'];
    const swingModes = climateState.attributes.swing_modes ?? ['off','horizontal','vertical','both'];
    const minTemp    = climateState.attributes.min_temp ?? 16;
    const maxTemp    = climateState.attributes.max_temp ?? 30;

    // Compute which sensors are visible (flag + actually has data)
    const show = {
      tempInt: cfg.show_temp_int && (this._hasSensor(entities.tempInt) || curTemp != null),
      tempExt: cfg.show_temp_ext && this._hasSensor(entities.tempExt),
      power:   cfg.show_power && this._hasSensor(entities.power),
      curEng:  cfg.show_current_energy && this._hasSensor(entities.currentEnergy),
      totEng:  cfg.show_total_energy && this._hasSensor(entities.totalEnergy),
    };

    const tempInt = show.tempInt ? this._sensorVal(entities.tempInt, curTemp ?? '--') : null;
    const tempExt = show.tempExt ? this._sensorVal(entities.tempExt, '--') : null;
    const power   = show.power   ? this._sensorVal(entities.power,   '0')  : null;
    const curEng  = show.curEng  ? this._sensorVal(entities.currentEnergy, '0.0') : null;
    const totEng  = show.totEng  ? this._sensorVal(entities.totalEnergy,   '--')  : null;

    const modeCfg = MODES[hvacMode] || MODES.off;
    const isOff   = hvacMode === 'off';
    const card    = sr.getElementById('card');

    card.className = `card ${modeCfg.cls}` + (isOff ? '' : ' on');

    // Header
    sr.getElementById('icon').textContent      = isOff ? '○' : modeCfg.icon;
    sr.getElementById('title').textContent     = cfg.name ?? climateState.attributes.friendly_name ?? 'AC';
    sr.getElementById('sub').textContent       = cfg.area ?? '';
    sr.getElementById('badgeText').textContent = isOff ? 'Oprit' : `${modeCfg.label} · ${setTemp}°C`;

    // Display
    sr.getElementById('dispTemp').textContent = setTemp !== '--' ? `${setTemp}°` : '--°';
    sr.getElementById('dispMode').textContent = isOff ? 'OFF' : `${modeCfg.dispText} · ${String(fanMode).toUpperCase()}`;
    sr.getElementById('tempBig').textContent  = setTemp !== '--' ? `${setTemp}°` : '--°';

    // Temp buttons disabled when off
    sr.getElementById('btnMinus').disabled = isOff;
    sr.getElementById('btnPlus').disabled  = isOff;

    // Mode buttons
    this._renderModeRow(hvacModes, hvacMode);

    // Stats — build dynamically based on enabled flags
    this._renderStats({ tempInt, power, tempExt, show });

    // Sensor pills — only energy ones
    this._renderSensors({ curEng, totEng, show });

    // Progress — hidden when off
    const progressSection = sr.getElementById('progressSection');
    if (isOff) {
      progressSection.classList.add('hidden');
    } else {
      progressSection.classList.remove('hidden');
      const tInt = parseFloat(tempInt);
      const tSet = parseFloat(setTemp);
      let pct = 0;
      if (!isNaN(tInt) && !isNaN(tSet)) {
        const gap    = Math.abs(tInt - tSet);
        const maxGap = maxTemp - minTemp;
        pct = Math.max(5, Math.min(95, (1 - gap / maxGap) * 100));
      } else {
        pct = 50; // fallback when no internal temp
      }
      sr.getElementById('progFill').style.width = pct + '%';
      sr.getElementById('progLabel').textContent = modeCfg.label;
      sr.getElementById('progTime').textContent =
        (!isNaN(tInt) && !isNaN(tSet))
          ? `${tInt}° → ${tSet}°`
          : `Țintă ${tSet}°`;
    }

    // Controls — clearer labels
    const btnPower = sr.getElementById('btnPower');
    btnPower.textContent = isOff ? '⏻ Pornește' : '⏻ Oprește';
    btnPower.className = 'btn ' + (isOff ? 'success' : 'danger');

    const btnFan   = sr.getElementById('btnFan');
    const btnSwing = sr.getElementById('btnSwing');
    btnFan.textContent   = `💨 ${fanMode}`;
    btnSwing.textContent = `↕ ${swingMode}`;
    btnFan.disabled   = isOff;
    btnSwing.disabled = isOff;

    // Store for handlers
    this._hvacMode   = hvacMode;
    this._setTemp    = parseFloat(setTemp);
    this._fanMode    = fanMode;
    this._swingMode  = swingMode;
    this._fanModes   = fanModes;
    this._swingModes = swingModes;
    this._minTemp    = minTemp;
    this._maxTemp    = maxTemp;
  }

  _renderStats({ tempInt, power, tempExt, show }) {
    const stats = this.shadowRoot.getElementById('stats');
    const items = [];
    if (show.tempInt) items.push({ k:'Cameră',   v: tempInt !== '--' && tempInt !== null ? `${tempInt}°` : '--' });
    if (show.power)   items.push({ k:'Consum',   v: `${power} W` });
    if (show.tempExt) items.push({ k:'Exterior', v: tempExt !== '--' && tempExt !== null ? `${tempExt}°` : '--' });

    stats.dataset.count = items.length;
    const key = items.map(i => i.k).join('|');
    if (this._lastStatsKey !== key) {
      this._lastStatsKey = key;
      stats.innerHTML = items.map(i =>
        `<div class="stat"><span class="stat-val">${i.v}</span><span class="stat-key">${i.k}</span></div>`
      ).join('');
    } else {
      // just update values
      const vals = stats.querySelectorAll('.stat-val');
      items.forEach((it, idx) => { if (vals[idx]) vals[idx].textContent = it.v; });
    }
  }

  _renderSensors({ curEng, totEng, show }) {
    const strip = this.shadowRoot.getElementById('sensorStrip');
    const items = [];
    if (show.curEng) items.push({ icon:'⚡', k:'Energie sesiune', v:`${curEng} kWh` });
    if (show.totEng) items.push({ icon:'📊', k:'Total energie',   v:`${totEng} kWh` });

    strip.dataset.count = items.length;
    const key = items.map(i => i.k).join('|');
    if (this._lastSensorsKey !== key) {
      this._lastSensorsKey = key;
      strip.innerHTML = items.map(i => `
        <div class="sensor-pill">
          <span class="sensor-icon">${i.icon}</span>
          <div class="sensor-info">
            <span class="sensor-val">${i.v}</span>
            <span class="sensor-key">${i.k}</span>
          </div>
        </div>
      `).join('');
    } else {
      const vals = strip.querySelectorAll('.sensor-val');
      items.forEach((it, idx) => { if (vals[idx]) vals[idx].textContent = it.v; });
    }
  }

  _renderModeRow(hvacModes, active) {
    const row = this.shadowRoot.getElementById('modeRow');
    const key = hvacModes.join(',');
    if (this._lastModeKey === key) {
      row.querySelectorAll('.mode-btn').forEach(b =>
        b.classList.toggle('active', b.dataset.mode === active)
      );
      return;
    }
    this._lastModeKey = key;
    row.innerHTML = '';
    hvacModes.forEach(mode => {
      const cfg = MODES[mode] || { icon: mode, dispText: mode };
      const b = document.createElement('button');
      b.className = 'mode-btn' + (mode === active ? ' active' : '');
      b.dataset.mode = mode;
      b.textContent = mode === 'off' ? '⏹ Off' : `${cfg.icon} ${cfg.dispText || mode}`;
      b.onclick = () => this._setMode(mode);
      row.appendChild(b);
    });
  }

  _callService(domain, service, data) {
    this._hass.callService(domain, service, data);
  }

  _setMode(mode) {
    if (mode === 'off') {
      this._callService('climate', 'turn_off', { entity_id: this._entities.climate });
    } else {
      this._callService('climate', 'set_hvac_mode', {
        entity_id: this._entities.climate,
        hvac_mode: mode,
      });
    }
  }

  _adjustTemp(delta) {
    if (this._hvacMode === 'off') return;
    const base = isNaN(this._setTemp) ? 22 : this._setTemp;
    const newTemp = Math.max(this._minTemp, Math.min(this._maxTemp, base + delta));
    this._callService('climate', 'set_temperature', {
      entity_id: this._entities.climate,
      temperature: newTemp,
    });
  }

  _toggleOff() {
    if (this._hvacMode === 'off') {
      this._callService('climate', 'turn_on', { entity_id: this._entities.climate });
    } else {
      this._callService('climate', 'turn_off', { entity_id: this._entities.climate });
    }
  }

  _cycleFan() {
    if (!this._fanModes || this._hvacMode === 'off') return;
    const idx = this._fanModes.indexOf(this._fanMode);
    const next = this._fanModes[(idx + 1) % this._fanModes.length];
    this._callService('climate', 'set_fan_mode', {
      entity_id: this._entities.climate,
      fan_mode: next,
    });
  }

  _cycleSwing() {
    if (!this._swingModes || this._hvacMode === 'off') return;
    const idx = this._swingModes.indexOf(this._swingMode);
    const next = this._swingModes[(idx + 1) % this._swingModes.length];
    this._callService('climate', 'set_swing_mode', {
      entity_id: this._entities.climate,
      swing_mode: next,
    });
  }

  static getConfigElement() { return document.createElement('ac-climate-card-editor'); }
  static getStubConfig()    { return { entity: 'climate.your_ac_entity' }; }

  getCardSize() { return 7; }
}

customElements.define('ac-climate-card', AcClimateCard);

window.customCards = window.customCards || [];
window.customCards.push({
  type:        'ac-climate-card',
  name:        'AC Climate Card',
  description: 'Card vizual cu temă cream pentru climatizare cu senzori opționali',
  preview:     true,
  documentationURL: 'https://github.com/YOUR_USER/ac-climate-card',
});

console.info(`%c AC-CLIMATE-CARD %c v${CARD_VERSION} CREAM `,
  'background:#d4b878;color:#3a2818;font-weight:bold;padding:2px 6px;border-radius:3px 0 0 3px',
  'background:#3a2818;color:#f5ead0;font-weight:bold;padding:2px 6px;border-radius:0 3px 3px 0'
);
