// ╔═══════════════════════════════════════════════════════╗
// ║  ac-climate-card — Custom Lovelace Card               ║
// ║  Usage in Lovelace YAML:                              ║
// ║    type: custom:ac-climate-card                       ║
// ║    entity: climate.your_ac_entity                     ║
// ║    name: Aer Condiționat   (optional)                 ║
// ║    area: living            (optional)                 ║
// ╚═══════════════════════════════════════════════════════╝

const CARD_VERSION = '1.0.0';

// ── Auto-discovery: given climate.prefix_xxx, find related sensors ──
function buildEntities(climateEntityId) {
  // e.g. "climate.midea_ac_152832116516967" → prefix "midea_ac_152832116516967"
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

// ── Mode visual config ──
const MODES = {
  cool:     { cls:'mode-cool', icon:'❄️', label:'Răcire',     dispText:'COOL', progressGrad:'linear-gradient(90deg,#3b82f6,#93c5fd)' },
  heat:     { cls:'mode-heat', icon:'🔥', label:'Încălzire',  dispText:'HEAT', progressGrad:'linear-gradient(90deg,#f97316,#fdba74)' },
  fan_only: { cls:'mode-fan',  icon:'💨', label:'Ventilare',  dispText:'FAN',  progressGrad:'linear-gradient(90deg,#8b5cf6,#c4b5fd)' },
  dry:      { cls:'mode-dry',  icon:'💧', label:'Dezumidif.', dispText:'DRY',  progressGrad:'linear-gradient(90deg,#0891b2,#67e8f9)' },
  auto:     { cls:'mode-auto', icon:'🔄', label:'Auto',       dispText:'AUTO', progressGrad:'linear-gradient(90deg,#15803d,#86efac)' },
  off:      { cls:'mode-off',  icon:'○',  label:'Oprit',      dispText:'OFF',  progressGrad:'linear-gradient(90deg,#374151,#6b7280)' },
};

// ── Styles ──
const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@300;400;500&family=Syne:wght@400;600;700;800&display=swap');

  :host { display: block; font-family: 'Syne', sans-serif; }

  /* ══ CARD SHELL ══ */
  .card {
    background: #181c27; border: 1px solid #2a2f45; border-radius: 24px;
    padding: 24px 24px 22px; position: relative; overflow: visible;
  }
  .card::after {
    content: ''; position: absolute; inset: 0; border-radius: 24px;
    background: #181c27; border: 1px solid #2a2f45; z-index: -1;
    box-shadow: 0 24px 64px rgba(0,0,0,0.65);
  }
  .card::before {
    content: ''; position: absolute; top: -70px; left: 50%; transform: translateX(-50%);
    width: 320px; height: 140px;
    background: radial-gradient(ellipse, var(--card-before, rgba(96,165,250,.15)) 0%, transparent 70%);
    pointer-events: none; z-index: 0; transition: background .7s;
  }

  /* ── Header ── */
  .card-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; }
  .header-left { display: flex; align-items: center; gap: 10px; }
  .header-icon { width: 36px; height: 36px; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 18px;
    background: linear-gradient(135deg, var(--accent1, #60a5fa), var(--accent2, #2563eb));
    box-shadow: 0 4px 14px rgba(var(--gr,96),var(--gg,165),var(--gb,250),.5);
    transition: all .7s;
  }
  .header-title { font-size: 15px; font-weight: 700; color: #e8eaf6; }
  .header-sub   { font-size: 11px; color: #6b7280; font-family: 'DM Mono', monospace; }
  .status-badge {
    display: flex; align-items: center; gap: 6px; border-radius: 20px; padding: 4px 10px;
    font-size: 11px; font-family: 'DM Mono', monospace; transition: all .7s;
    background: var(--accent-bg, rgba(59,130,246,.1));
    border: 1px solid var(--accent-border, rgba(59,130,246,.35));
    color: var(--accent-color, #93c5fd);
  }
  .status-dot {
    width: 6px; height: 6px; border-radius: 50%; background: currentColor;
    animation: pdot 1.4s ease-in-out infinite;
  }
  @keyframes pdot { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.4;transform:scale(.6)} }

  /* ── Illustration ── */
  .machine-viewport { display: flex; justify-content: center; align-items: center; margin-bottom: 20px; padding-bottom: 58px; }
  .ac-scene  { position: relative; width: 300px; height: 148px; }
  .ac-body   {
    position: absolute; top: 0; left: 0; right: 0; height: 140px; border-radius: 18px;
    background: linear-gradient(160deg,#f8faff 0%,#edf0f8 18%,#e2e6f2 42%,#d6daea 68%,#c8cede 100%);
    border: 1px solid #bcc4d8;
    box-shadow: 0 22px 60px rgba(0,0,0,.55), 0 6px 18px rgba(0,0,0,.2),
      inset 0 2px 0 rgba(255,255,255,.95), inset 0 1px 6px rgba(255,255,255,.6),
      inset 0 -4px 12px rgba(0,0,0,.08), inset -5px 0 14px rgba(0,0,0,.05),
      inset 5px 0 12px rgba(255,255,255,.5);
    transition: filter .7s;
  }
  .ac-bevel { position:absolute;top:0;left:18px;right:18px;height:2px;border-radius:18px 18px 0 0;background:linear-gradient(90deg,transparent,rgba(255,255,255,.6) 20%,rgba(255,255,255,1) 50%,rgba(255,255,255,.6) 80%,transparent); }
  .ac-intake { position:absolute;top:14px;left:60px;right:106px;display:flex;flex-direction:column;gap:5px; }
  .ac-ig { height:2.5px;border-radius:1.5px;background:linear-gradient(90deg,transparent,rgba(0,0,0,.06) 10%,rgba(0,0,0,.2) 50%,rgba(0,0,0,.06) 90%,transparent);box-shadow:0 1.5px 0 rgba(255,255,255,.65); }
  .ac-leftpanel { position:absolute;left:0;top:0;bottom:0;width:50px;display:flex;flex-direction:column;justify-content:center;align-items:center;gap:12px;border-radius:18px 0 0 18px; }
  .ac-leds { display:flex;flex-direction:column;gap:9px;align-items:center; }
  .ac-led { width:9px;height:9px;border-radius:50%;position:relative; }
  .ac-led::after { content:'';position:absolute;top:2px;left:2px;width:3px;height:3px;border-radius:50%;background:rgba(255,255,255,.7); }
  .ac-led.g { background:radial-gradient(circle at 35% 30%,#a7f3d0,#10b981);box-shadow:0 0 0 2.5px rgba(16,185,129,.12),0 0 7px rgba(16,185,129,.9),0 0 18px rgba(16,185,129,.45); }
  .ac-led.b { background:radial-gradient(circle at 35% 30%,#bfdbfe,#3b82f6);box-shadow:0 0 0 2.5px rgba(59,130,246,.12),0 0 7px rgba(59,130,246,.9),0 0 18px rgba(59,130,246,.45);animation:ledblink 4s ease-in-out infinite; }
  .ac-led.off { background:radial-gradient(circle at 35% 30%,#d8dce8,#b4bacb);border:1px solid #a8b0c0;box-shadow:inset 0 1px 3px rgba(0,0,0,.18); }
  .ac-led.off::after { display:none; }
  @keyframes ledblink { 0%,45%,55%,100%{opacity:1} 50%{opacity:.12} }

  .ac-display {
    position:absolute;top:13px;right:10px;width:88px;height:64px;
    border-radius:12px;padding:9px 10px 8px;font-family:'DM Mono',monospace;
    text-align:center;overflow:hidden;transition:all .7s;
    background:linear-gradient(155deg,var(--dsp-bg1,#010a06),var(--dsp-bg2,#020e08));
    border:1px solid var(--dsp-border,#071a0e);
    color:var(--dsp-color,#34d399);
    box-shadow:inset 0 0 0 1px rgba(var(--gr,52),var(--gg,211),var(--gb,153),.07),
      inset 0 3px 12px rgba(0,0,0,1),
      0 0 16px rgba(var(--gr,52),var(--gg,211),var(--gb,153),.22),
      0 0 40px rgba(var(--gr,52),var(--gg,211),var(--gb,153),.08),
      0 4px 12px rgba(0,0,0,.4);
  }
  .ac-display::before { content:'';position:absolute;inset:0;border-radius:12px;background:repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,0,0,.12) 2px,rgba(0,0,0,.12) 3px);pointer-events:none;z-index:2; }
  .ac-display::after  { content:'';position:absolute;inset:0;border-radius:12px;background:radial-gradient(ellipse at 50% 30%,rgba(var(--gr,52),var(--gg,211),var(--gb,153),.12) 0%,transparent 70%);pointer-events:none;z-index:1;transition:background .7s; }
  .ac-dt { font-size:26px;font-weight:500;line-height:1;display:block;position:relative;z-index:3;color:var(--dsp-color,#34d399);text-shadow:0 0 10px var(--dsp-color,#34d399),0 0 24px rgba(var(--gr,52),var(--gg,211),var(--gb,153),.6);transition:all .7s; }
  .ac-dm { font-size:7px;letter-spacing:.18em;display:block;margin-top:5px;position:relative;z-index:3;color:var(--dsp-color,#34d399);opacity:.6;transition:all .7s; }

  .ac-divider { position:absolute;top:90px;left:50px;right:10px;height:1px;background:linear-gradient(90deg,rgba(0,0,0,.06),rgba(0,0,0,.14) 30%,rgba(0,0,0,.14) 70%,rgba(0,0,0,.06));box-shadow:0 1px 0 rgba(255,255,255,.5); }
  .ac-louvre-wrap { position:absolute;bottom:0;left:0;right:0;height:44px;border-radius:0 0 18px 18px;background:linear-gradient(180deg,rgba(0,0,0,.03),rgba(0,0,0,.1));border-top:1px solid rgba(0,0,0,.07);overflow:hidden;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:5px;padding:0 18px; }
  .ac-blade { height:5px;border-radius:4px;width:100%;position:relative;background:linear-gradient(180deg,rgba(220,228,244,0) 0%,rgba(195,205,225,.75) 30%,rgba(178,190,212,.85) 60%,rgba(162,174,198,.6) 100%);box-shadow:0 2px 0 rgba(255,255,255,.55),0 -1px 0 rgba(0,0,0,.1);animation:blade-sweep 3.2s ease-in-out infinite; }
  .ac-blade:nth-child(2){animation-delay:.3s} .ac-blade:nth-child(3){animation-delay:.6s;width:90%}
  .ac-blade::after { content:'';position:absolute;top:1px;left:8%;right:8%;height:1.5px;border-radius:2px;background:rgba(255,255,255,.55); }
  @keyframes blade-sweep { 0%{transform:perspective(80px) rotateX(-14deg) translateY(-1px)} 50%{transform:perspective(80px) rotateX(14deg) translateY(1px)} 100%{transform:perspective(80px) rotateX(-14deg) translateY(-1px)} }

  .ac-flow   { position:absolute;bottom:-46px;left:50%;transform:translateX(-50%);width:280px;height:48px;pointer-events:none; }
  .ac-stream { position:absolute;border-radius:3px;animation:astream linear infinite;transition:background .7s,box-shadow .7s; }
  @keyframes astream { 0%{opacity:0;transform:translateY(0) scaleX(.2)} 20%{opacity:.9} 70%{opacity:.4} 100%{opacity:0;transform:translateY(22px) scaleX(1.2)} }

  .ac-mist   { position:absolute;bottom:-52px;left:50%;transform:translateX(-50%);width:280px;height:54px;pointer-events:none; }
  .ac-mist-p { position:absolute;border-radius:50%;animation:mistdrop linear infinite;transition:background .7s,box-shadow .7s; }
  @keyframes mistdrop { 0%{transform:translateY(0) scale(.4);opacity:0} 12%{opacity:.7} 80%{opacity:.2} 100%{transform:translateY(54px) scale(2.2);opacity:0} }

  /* heat glow */
  .mode-heat .ac-mist-p { display: none; }
  .mode-heat .ac-glow {
    width:280px !important;height:50px !important;bottom:-24px !important;
    background:radial-gradient(ellipse,rgba(251,146,60,.38) 0%,rgba(239,68,68,.16) 45%,transparent 72%) !important;
    animation:heatpulse 2.4s ease-in-out infinite !important;
  }
  @keyframes heatpulse {
    0%,100% { opacity:.45; transform:translateX(-50%) scaleX(1) scaleY(1); }
    50%     { opacity:1;   transform:translateX(-50%) scaleX(1.10) scaleY(1.18); }
  }
  .mode-heat .ac-stream { animation: hstream linear infinite !important; }
  @keyframes hstream {
    0%  { opacity:0;transform:translateY(4px) scaleX(.2); }
    20% { opacity:.8; }
    70% { opacity:.3; }
    100%{ opacity:0;transform:translateY(-18px) scaleX(1.1); }
  }

  .ac-glow {
    position:absolute;bottom:-28px;left:50%;transform:translateX(-50%);
    width:240px;height:28px;pointer-events:none;
    transition:background 1s ease, width 1s ease, height 1s ease, bottom 1s ease;
  }

  /* OFF state */
  .mode-off .ac-body { filter: grayscale(.6) brightness(.85); }
  .mode-off .ac-flow, .mode-off .ac-mist, .mode-off .ac-glow { opacity: 0; transition: opacity .7s; }
  .mode-off .ac-blade { animation-play-state: paused; }
  .mode-off .ac-led.b, .mode-off .ac-led.g { background: #2a2f45 !important; box-shadow: none !important; }
  .mode-off .status-dot { animation: none; opacity: .3; }

  /* ── Stats ── */
  .stats { display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;margin-bottom:14px; }
  .stat  { background:#1e2335;border:1px solid #2a2f45;border-radius:12px;padding:10px 8px;text-align:center; }
  .stat-val { font-size:17px;font-weight:800;color:#e8eaf6;display:block;font-family:'DM Mono',monospace; }
  .stat-key { font-size:9px;color:#6b7280;text-transform:uppercase;letter-spacing:.06em;font-family:'DM Mono',monospace; }

  /* ── Sensor strip ── */
  .sensor-strip { display:flex;gap:8px;margin-bottom:14px; }
  .sensor-pill  { flex:1;background:#1e2335;border:1px solid #2a2f45;border-radius:10px;padding:7px 10px;display:flex;align-items:center;gap:7px; }
  .sensor-icon  { font-size:13px;opacity:.7; }
  .sensor-info  { display:flex;flex-direction:column; }
  .sensor-val   { font-size:13px;font-weight:700;color:#e8eaf6;font-family:'DM Mono',monospace;line-height:1.2; }
  .sensor-key   { font-size:8.5px;color:#4b5563;text-transform:uppercase;letter-spacing:.08em;font-family:'DM Mono',monospace; }

  /* ── Progress ── */
  .progress-section { margin-bottom:14px; }
  .prog-header { display:flex;align-items:center;justify-content:space-between;margin-bottom:7px; }
  .prog-label  { font-size:11px;color:#6b7280;font-family:'DM Mono',monospace;text-transform:uppercase;letter-spacing:.06em; }
  .prog-time   { font-size:11px;color:#e8eaf6;font-family:'DM Mono',monospace; }
  .progress-bar  { height:4px;background:#2a2f45;border-radius:4px;overflow:hidden; }
  .progress-fill { height:100%;border-radius:4px;position:relative;transition:width .8s ease,background .7s; }
  .progress-fill::after { content:'';position:absolute;right:0;top:0;bottom:0;width:30px;background:linear-gradient(90deg,transparent,rgba(255,255,255,.3));animation:shimmer 1.5s linear infinite; }
  @keyframes shimmer { 0%,100%{opacity:0} 50%{opacity:1} }

  /* ── Mode row ── */
  .mode-row { display:flex;gap:6px;margin-bottom:12px; }
  .mode-btn { flex:1;padding:7px 4px;border-radius:10px;border:1px solid #2a2f45;background:#1e2335;color:#4b5563;font-family:'DM Mono',monospace;font-size:9.5px;font-weight:500;cursor:pointer;transition:all .2s;text-align:center;letter-spacing:.04em; }
  .mode-btn:hover  { background:#252b3e;color:#9ca3af; }
  .mode-btn.active { color:var(--accent-color,#93c5fd);border-color:var(--accent-border,rgba(59,130,246,.4));background:var(--accent-bg,rgba(59,130,246,.1)); }

  /* ── Controls ── */
  .controls { display:flex;gap:8px; }
  .btn { flex:1;padding:10px 8px;border-radius:12px;border:1px solid #2a2f45;background:#1e2335;color:#e8eaf6;font-family:'Syne',sans-serif;font-size:11px;font-weight:600;cursor:pointer;transition:all .2s; }
  .btn:hover  { background:#252a3d;transform:translateY(-1px); }
  .btn:active { transform:scale(.97); }
  .btn.danger  { color:#f87171; }
  .btn.primary { border-color:var(--accent-border,rgba(59,130,246,.4));color:var(--accent-color,#93c5fd);background:var(--accent-bg,rgba(59,130,246,.08));transition:all .2s,border-color .7s,color .7s,background .7s; }
  .btn.temp    { font-size:16px;font-weight:700;max-width:44px;padding:10px 0; }

  /* ── Temp row ── */
  .temp-row     { display:flex;align-items:center;gap:10px;margin-bottom:12px; }
  .temp-display { flex:1;text-align:center;font-family:'DM Mono',monospace; }
  .temp-big     { font-size:28px;font-weight:500;color:#e8eaf6;line-height:1; }
  .temp-label   { font-size:9px;color:#4b5563;text-transform:uppercase;letter-spacing:.1em; }

  /* ── Theme vars (cool default) ── */
  :host {
    --accent-color:#93c5fd; --accent-border:rgba(59,130,246,.4); --accent-bg:rgba(59,130,246,.08);
    --accent1:#60a5fa; --accent2:#2563eb;
    --gr:96;--gg:165;--gb:250;
    --dsp-bg1:#010a06;--dsp-bg2:#020e08;--dsp-border:#071a0e;--dsp-color:#34d399;
    --stream1:rgba(147,197,253,.5);--stream2:rgba(186,222,255,.3);--stream-s:rgba(147,197,253,.3);
    --mist1:rgba(186,222,255,.65);--mist2:rgba(147,197,253,.2);--mist-s:rgba(147,197,253,.45);
    --glow-c:rgba(96,165,250,.25); --card-before:rgba(96,165,250,.15);
  }
  .mode-heat {
    --accent-color:#fdba74;--accent-border:rgba(251,146,60,.4);--accent-bg:rgba(251,146,60,.08);
    --accent1:#fb923c;--accent2:#c2410c;
    --gr:251;--gg:146;--gb:60;
    --dsp-bg1:#0a0401;--dsp-bg2:#0e0602;--dsp-border:#1a0c04;--dsp-color:#fb923c;
    --stream1:rgba(253,186,116,.55);--stream2:rgba(254,215,170,.3);--stream-s:rgba(251,146,60,.35);
    --mist1:rgba(254,215,170,.65);--mist2:rgba(253,186,116,.25);--mist-s:rgba(251,146,60,.45);
    --glow-c:rgba(251,146,60,.25);--card-before:rgba(251,146,60,.15);
  }
  .mode-fan {
    --accent-color:#c4b5fd;--accent-border:rgba(139,92,246,.4);--accent-bg:rgba(139,92,246,.08);
    --accent1:#a78bfa;--accent2:#6d28d9;
    --gr:167;--gg:139;--gb:250;
    --dsp-bg1:#06030f;--dsp-bg2:#08040f;--dsp-border:#120828;--dsp-color:#a78bfa;
    --stream1:rgba(196,181,253,.5);--stream2:rgba(221,214,254,.3);--stream-s:rgba(167,139,250,.3);
    --mist1:rgba(221,214,254,.65);--mist2:rgba(196,181,253,.2);--mist-s:rgba(167,139,250,.45);
    --glow-c:rgba(139,92,246,.22);--card-before:rgba(139,92,246,.13);
  }
  .mode-dry {
    --accent-color:#67e8f9;--accent-border:rgba(6,182,212,.4);--accent-bg:rgba(6,182,212,.08);
    --accent1:#22d3ee;--accent2:#0e7490;
    --gr:6;--gg:182;--gb:212;
    --dsp-bg1:#020a0c;--dsp-bg2:#030d10;--dsp-border:#071a1e;--dsp-color:#22d3ee;
    --stream1:rgba(103,232,249,.5);--stream2:rgba(165,243,252,.3);--stream-s:rgba(6,182,212,.3);
    --mist1:rgba(165,243,252,.65);--mist2:rgba(103,232,249,.2);--mist-s:rgba(6,182,212,.45);
    --glow-c:rgba(6,182,212,.22);--card-before:rgba(6,182,212,.13);
  }
  .mode-auto {
    --accent-color:#86efac;--accent-border:rgba(34,197,94,.4);--accent-bg:rgba(34,197,94,.08);
    --accent1:#4ade80;--accent2:#15803d;
    --gr:74;--gg:222;--gb:128;
    --dsp-bg1:#020a04;--dsp-bg2:#030c06;--dsp-border:#071a0c;--dsp-color:#4ade80;
    --stream1:rgba(134,239,172,.5);--stream2:rgba(187,247,208,.3);--stream-s:rgba(74,222,128,.3);
    --mist1:rgba(187,247,208,.65);--mist2:rgba(134,239,172,.2);--mist-s:rgba(74,222,128,.45);
    --glow-c:rgba(34,197,94,.22);--card-before:rgba(34,197,94,.13);
  }
  .mode-off {
    --accent-color:#6b7280;--accent-border:rgba(107,114,128,.3);--accent-bg:rgba(107,114,128,.05);
    --accent1:#9ca3af;--accent2:#4b5563;
    --card-before:transparent;
  }
`;

// ── HTML Template ──
const TEMPLATE = `
  <div class="card" id="card">
    <div class="card-header">
      <div class="header-left">
        <div class="header-icon" id="icon">❄️</div>
        <div>
          <div class="header-title" id="title">Aer Condiționat</div>
          <div class="header-sub"  id="sub">--</div>
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
          <div class="ac-intake">
            <div class="ac-ig"></div><div class="ac-ig"></div>
            <div class="ac-ig"></div><div class="ac-ig"></div>
            <div class="ac-ig"></div><div class="ac-ig"></div>
          </div>
          <div class="ac-leftpanel">
            <div class="ac-leds">
              <div class="ac-led g" id="ledG"></div>
              <div class="ac-led b" id="ledB"></div>
              <div class="ac-led off"></div>
            </div>
          </div>
          <div class="ac-display">
            <span class="ac-dt" id="dispTemp">--</span>
            <span class="ac-dm" id="dispMode">--</span>
          </div>
          <div class="ac-divider"></div>
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
      <button class="btn temp primary" id="btnMinus">−</button>
      <div class="temp-display">
        <div class="temp-big"   id="tempBig">--</div>
        <div class="temp-label">Temperatură setată</div>
      </div>
      <button class="btn temp primary" id="btnPlus">+</button>
    </div>

    <div class="mode-row" id="modeRow"></div>

    <div class="stats">
      <div class="stat"><span class="stat-val" id="statInt">--°</span><span class="stat-key">Cameră</span></div>
      <div class="stat"><span class="stat-val" id="statPow">-- W</span><span class="stat-key">Consum</span></div>
      <div class="stat"><span class="stat-val" id="statExt">--°</span><span class="stat-key">Exterior</span></div>
    </div>

    <div class="sensor-strip">
      <div class="sensor-pill">
        <span class="sensor-icon">⚡</span>
        <div class="sensor-info">
          <span class="sensor-val" id="sensorEnergy">-- kWh</span>
          <span class="sensor-key">Energie sesiune</span>
        </div>
      </div>
      <div class="sensor-pill">
        <span class="sensor-icon">📊</span>
        <div class="sensor-info">
          <span class="sensor-val" id="sensorTotal">-- kWh</span>
          <span class="sensor-key">Total energie</span>
        </div>
      </div>
    </div>

    <div class="progress-section">
      <div class="prog-header">
        <span class="prog-label" id="progLabel">--</span>
        <span class="prog-time"  id="progTime">--</span>
      </div>
      <div class="progress-bar">
        <div class="progress-fill" id="progFill" style="width:0%"></div>
      </div>
    </div>

    <div class="controls">
      <button class="btn danger"  id="btnOff">⏹ Off</button>
      <button class="btn primary" id="btnFan">💨 --</button>
      <button class="btn primary" id="btnSwing">↕ --</button>
    </div>
  </div>
`;

// ════════════════════════════════════════════
//  Custom Element
// ════════════════════════════════════════════
class AcClimateCard extends HTMLElement {

  // ── Called by HA to set config ──
  setConfig(config) {
    if (!config.entity) throw new Error('Trebuie să specifici "entity: climate.xxx"');
    this._config = config;
    this._entities = buildEntities(config.entity);
    if (!this.shadowRoot) {
      this.attachShadow({ mode: 'open' });
      this.shadowRoot.innerHTML = `<style>${STYLES}</style>${TEMPLATE}`;
      this._buildParticles();
      this._bindButtons();
    }
  }

  // ── Called by HA whenever any state changes ──
  set hass(hass) {
    this._hass = hass;
    this._render();
  }

  // ── Build airflow streams & mist once ──
  _buildParticles() {
    const flow = this.shadowRoot.getElementById('acFlow');
    [
      {l:'2%', w:42,h:2.5,t:2, d:0,   dur:1.9},
      {l:'14%',w:30,h:1.5,t:12,d:.28, dur:2.3},
      {l:'26%',w:52,h:2,  t:6, d:.55, dur:1.7},
      {l:'42%',w:35,h:3,  t:18,d:.12, dur:2.1},
      {l:'56%',w:46,h:1.5,t:8, d:.70, dur:1.8},
      {l:'70%',w:38,h:2.5,t:14,d:.38, dur:2.4},
      {l:'83%',w:28,h:2,  t:4, d:.85, dur:2.0},
    ].forEach(c => {
      const s = document.createElement('div');
      s.className = 'ac-stream';
      s.style.cssText = `left:${c.l};width:${c.w}px;height:${c.h}px;top:${c.t}px;animation-delay:${c.d}s;animation-duration:${c.dur}s;background:linear-gradient(90deg,transparent,var(--stream1),var(--stream2),transparent);box-shadow:0 0 6px var(--stream-s)`;
      flow.appendChild(s);
    });

    const mist = this.shadowRoot.getElementById('acMist');
    for (let i = 0; i < 22; i++) {
      const p = document.createElement('div');
      p.className = 'ac-mist-p';
      const sz = 2.5 + Math.random() * 4;
      p.style.cssText = `width:${sz}px;height:${sz}px;left:${4+Math.random()*92}%;animation-duration:${2.2+Math.random()*3}s;animation-delay:${Math.random()*3.5}s;background:radial-gradient(circle,var(--mist1),var(--mist2));box-shadow:0 0 8px var(--mist-s)`;
      mist.appendChild(p);
    }
  }

  // ── Wire up buttons ──
  _bindButtons() {
    const sr = this.shadowRoot;
    sr.getElementById('btnMinus').onclick  = () => this._adjustTemp(-1);
    sr.getElementById('btnPlus').onclick   = () => this._adjustTemp(1);
    sr.getElementById('btnOff').onclick    = () => this._toggleOff();
    sr.getElementById('btnFan').onclick    = () => this._cycleFan();
    sr.getElementById('btnSwing').onclick  = () => this._cycleSwing();
  }

  // ── Main render ──
  _render() {
    if (!this._hass || !this._config) return;
    const hass     = this._hass;
    const entities = this._entities;
    const sr       = this.shadowRoot;

    // ── Read climate state ──
    const climateState = hass.states[entities.climate];
    if (!climateState) return;

    const hvacMode   = climateState.state;                           // cool/heat/fan_only/dry/auto/off
    const setTemp    = climateState.attributes.temperature ?? '--';
    const curTemp    = climateState.attributes.current_temperature;
    const fanMode    = climateState.attributes.fan_mode ?? 'auto';
    const swingMode  = climateState.attributes.swing_mode ?? 'off';
    const hvacModes  = climateState.attributes.hvac_modes ?? Object.keys(MODES);
    const fanModes   = climateState.attributes.fan_modes  ?? ['auto','low','medium','high'];
    const swingModes = climateState.attributes.swing_modes ?? ['off','horizontal','vertical','both'];
    const minTemp    = climateState.attributes.min_temp ?? 16;
    const maxTemp    = climateState.attributes.max_temp ?? 30;

    // ── Read sensors (gracefully if missing) ──
    const power        = this._sensorVal(entities.power,        '0');
    const curEnergy    = this._sensorVal(entities.currentEnergy,'0.0');
    const totalEnergy  = this._sensorVal(entities.totalEnergy,  '--');
    const tempExt      = this._sensorVal(entities.tempExt,      '--');
    const tempInt      = this._sensorVal(entities.tempInt, curTemp ?? '--');

    const cfg   = MODES[hvacMode] || MODES.off;
    const isOff = hvacMode === 'off';
    const card  = sr.getElementById('card');

    // Card class (drives all CSS variable themes)
    card.className = `card ${cfg.cls}`;

    // Header
    sr.getElementById('icon').textContent     = isOff ? '○' : cfg.icon;
    sr.getElementById('title').textContent    = this._config.name ?? climateState.attributes.friendly_name ?? 'AC';
    sr.getElementById('sub').textContent      = this._config.area ?? climateState.attributes.friendly_name ?? '';
    sr.getElementById('badgeText').textContent = isOff ? 'Oprit' : `${cfg.label} · ${setTemp}°C`;

    // Display
    sr.getElementById('dispTemp').textContent = setTemp !== '--' ? `${setTemp}°C` : '--';
    sr.getElementById('dispMode').textContent = `${cfg.dispText} · ${fanMode.toUpperCase()}`;
    sr.getElementById('tempBig').textContent  = setTemp !== '--' ? `${setTemp}°C` : '--';

    // Mode buttons — built dynamically from hvac_modes
    this._renderModeRow(hvacModes, hvacMode);

    // Stats
    sr.getElementById('statInt').textContent     = tempInt !== '--' ? `${tempInt}°` : '--';
    sr.getElementById('statPow').textContent     = `${power} W`;
    sr.getElementById('statExt').textContent     = tempExt !== '--' ? `${tempExt}°` : '--';
    sr.getElementById('sensorEnergy').textContent = `${curEnergy} kWh`;
    sr.getElementById('sensorTotal').textContent  = `${totalEnergy} kWh`;

    // Progress
    const tInt = parseFloat(tempInt);
    const tSet = parseFloat(setTemp);
    let pct = 0;
    if (!isOff && !isNaN(tInt) && !isNaN(tSet)) {
      const gap    = Math.abs(tInt - tSet);
      const maxGap = maxTemp - minTemp;
      pct = Math.max(5, Math.min(95, (1 - gap / maxGap) * 100));
    }
    const fill = sr.getElementById('progFill');
    fill.style.width      = pct + '%';
    fill.style.background = cfg.progressGrad;
    sr.getElementById('progLabel').textContent = isOff ? 'Oprit' : cfg.label;
    sr.getElementById('progTime').textContent  = isOff ? '--' : `${tInt}° → ${tSet}°`;

    // Control button labels
    sr.getElementById('btnFan').textContent   = `💨 ${fanMode}`;
    sr.getElementById('btnSwing').textContent = `↕ ${swingMode}`;

    // Glow
    sr.getElementById('acGlow').style.background = `radial-gradient(ellipse,var(--glow-c) 0%,transparent 70%)`;

    // Store for button handlers
    this._hvacMode   = hvacMode;
    this._setTemp    = tSet;
    this._fanMode    = fanMode;
    this._swingMode  = swingMode;
    this._fanModes   = fanModes;
    this._swingModes = swingModes;
    this._minTemp    = minTemp;
    this._maxTemp    = maxTemp;
    this._hvacModes  = hvacModes;
  }

  _renderModeRow(hvacModes, active) {
    const row = this.shadowRoot.getElementById('modeRow');
    // Only rebuild if modes changed
    const key = hvacModes.join(',');
    if (this._lastModeKey === key) {
      // Just update active class
      row.querySelectorAll('.mode-btn').forEach(b =>
        b.classList.toggle('active', b.dataset.mode === active)
      );
      return;
    }
    this._lastModeKey = key;
    row.innerHTML = '';
    hvacModes.forEach(mode => {
      const cfg = MODES[mode] || { icon: mode, label: mode };
      const b = document.createElement('button');
      b.className = 'mode-btn' + (mode === active ? ' active' : '');
      b.dataset.mode = mode;
      b.textContent = mode === 'off' ? '⏹ Off' : `${cfg.icon} ${cfg.dispText || mode}`;
      b.onclick = () => this._setMode(mode);
      row.appendChild(b);
    });
  }

  // ── HA service calls ──
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
    const newTemp = Math.max(this._minTemp, Math.min(this._maxTemp, (this._setTemp || 22) + delta));
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

  // ── Helper: safely read sensor state ──
  _sensorVal(entityId, fallback = '--') {
    const s = this._hass?.states[entityId];
    if (!s || s.state === 'unavailable' || s.state === 'unknown') return fallback;
    return s.state;
  }

  // ── Required by HA for editor stub ──
  static getConfigElement() { return document.createElement('ac-climate-card-editor'); }
  static getStubConfig()    { return { entity: 'climate.your_ac_entity' }; }

  getCardSize() { return 6; }
}

customElements.define('ac-climate-card', AcClimateCard);

// ── Register with HACS/Lovelace ──
window.customCards = window.customCards || [];
window.customCards.push({
  type:        'ac-climate-card',
  name:        'AC Climate Card',
  description: 'Card vizual pentru climatizare cu auto-discovery senzori',
  preview:     true,
  documentationURL: 'https://github.com/YOUR_USER/ac-climate-card',
});

console.info(`%c AC-CLIMATE-CARD %c v${CARD_VERSION} `, 
  'background:#60a5fa;color:#000;font-weight:bold;padding:2px 6px;border-radius:3px 0 0 3px',
  'background:#1e2335;color:#93c5fd;font-weight:bold;padding:2px 6px;border-radius:0 3px 3px 0'
);
