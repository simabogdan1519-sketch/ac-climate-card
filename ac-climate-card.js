/**
 * ac-climate-card.js — FULL FUNCTIONALITY + PREMIUM GLASS DESIGN
 */

const MODES_CFG = {
  cool:     { color: '#60a5fa', glow: 'rgba(96,165,250,0.25)', icon: '❄️', disp: 'COOL' },
  heat:     { color: '#fb923c', glow: 'rgba(251,146,60,0.25)', icon: '🔥', disp: 'HEAT' },
  fan_only: { color: '#a78bfa', glow: 'rgba(167,139,250,0.25)', icon: '💨', disp: 'FAN' },
  dry:      { color: '#22d3ee', glow: 'rgba(34,211,238,0.25)', icon: '💧', disp: 'DRY' },
  auto:     { color: '#4ade80', glow: 'rgba(74,222,128,0.25)', icon: '🔄', disp: 'AUTO' },
  off:      { color: '#9ca3af', glow: 'transparent', icon: '○', disp: 'OFF' }
};

function buildEntities(climateEntityId) {
  const prefix = climateEntityId.replace(/^climate\./, '');
  return {
    climate: climateEntityId,
    power: `sensor.${prefix}_power`,
    tempExt: `sensor.${prefix}_temperatura_exterioara`,
    tempInt: `sensor.${prefix}_temperatura_interioara`,
  };
}

class AcClimateCard extends HTMLElement {
  setConfig(config) {
    if (!config.entity) throw new Error('Definește entitatea!');
    this._config = config;
    this._entities = buildEntities(config.entity);
  }

  set hass(hass) {
    this._hass = hass;
    const state = hass.states[this._config.entity];
    if (!state) return;

    if (!this.shadowRoot) {
      this.attachShadow({ mode: 'open' });
      this.shadowRoot.innerHTML = this._getHtml();
      this._bindEvents();
    }
    this._update(state, hass);
  }

  _getHtml() {
    return `
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;500;700&family=DM+Mono:wght@500&display=swap');
        :host { --m-color: #60a5fa; --m-glow: rgba(96,165,250,0.3); }
        .card {
          background: linear-gradient(135deg, rgba(255,255,255,0.05), rgba(255,255,255,0.02));
          backdrop-filter: blur(25px) saturate(160%);
          border-radius: 32px; border: 1px solid rgba(255,255,255,0.1);
          padding: 24px; position: relative; color: #fff; font-family: 'DM Sans', sans-serif; overflow: hidden;
        }
        .card::before {
          content: ''; position: absolute; top: -10%; left: -10%; width: 120%; height: 120%;
          background: radial-gradient(circle at 20% 20%, var(--m-glow), transparent 40%);
          z-index: 0; pointer-events: none; transition: background 0.8s ease;
        }
        .header { position: relative; z-index: 2; display: flex; justify-content: space-between; margin-bottom: 10px; }
        .title { font-family: 'Syne', sans-serif; font-size: 20px; font-weight: 700; }
        
        /* SVG & Animation Area */
        .visual-area { position: relative; height: 130px; display: flex; justify-content: center; align-items: center; z-index: 1; }
        .ac-unit { 
            width: 220px; height: 60px; background: #fff; border-radius: 4px 4px 12px 12px; 
            position: relative; box-shadow: 0 10px 25px rgba(0,0,0,0.4); 
        }
        .ac-display-led {
            position: absolute; right: 12px; top: 12px; width: 48px; height: 32px;
            background: #000; border-radius: 6px; border: 1px solid #333;
            display: flex; flex-direction: column; align-items: center; justify-content: center;
        }
        .led-t { font-family: 'DM Mono', monospace; color: var(--m-color); font-size: 14px; text-shadow: 0 0 5px var(--m-color); }
        
        /* Flow SVG */
        .flow-svg { position: absolute; top: 60px; width: 200px; height: 50px; opacity: 0.4; }
        .air-path { fill: none; stroke: var(--m-color); stroke-width: 2; stroke-dasharray: 8, 12; animation: flowAnim 1.2s linear infinite; }
        @keyframes flowAnim { to { stroke-dashoffset: -20; } }

        /* Middle Controls */
        .temp-ctrl { position: relative; z-index: 2; display: flex; align-items: center; justify-content: center; gap: 30px; margin: 15px 0; }
        .temp-main { font-family: 'Syne', sans-serif; font-size: 48px; font-weight: 800; letter-spacing: -2px; }
        .btn-r { width: 48px; height: 48px; border-radius: 50%; border: 1px solid rgba(255,255,255,0.1); background: rgba(255,255,255,0.05); color: #fff; font-size: 22px; cursor: pointer; transition: 0.3s; }
        .btn-r:hover { border-color: var(--m-color); background: rgba(255,255,255,0.1); }

        /* Modes Row */
        .modes-row { display: flex; gap: 6px; overflow-x: auto; margin-bottom: 20px; z-index: 2; position: relative; padding: 2px; }
        .m-btn { flex: 1; padding: 10px 6px; border-radius: 12px; border: 1px solid rgba(255,255,255,0.05); background: rgba(255,255,255,0.02); color: rgba(255,255,255,0.4); font-size: 9px; font-weight: 700; cursor: pointer; white-space: nowrap; }
        .m-btn.active { background: var(--m-color); color: #000; border-color: var(--m-color); }

        /* Stats Grid */
        .stats { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 8px; z-index: 2; position: relative; margin-bottom: 20px; }
        .s-box { background: rgba(255,255,255,0.03); padding: 10px; border-radius: 16px; text-align: center; border: 1px solid rgba(255,255,255,0.05); }
        .s-label { font-size: 8px; color: rgba(255,255,255,0.3); text-transform: uppercase; margin-bottom: 2px; }
        .s-val { font-family: 'Syne', sans-serif; font-size: 15px; font-weight: 700; }

        /* Action Buttons */
        .actions { display: flex; gap: 8px; z-index: 2; position: relative; }
        .a-btn { flex: 1; padding: 12px; border-radius: 14px; border: 1px solid rgba(255,255,255,0.1); background: rgba(255,255,255,0.05); color: #fff; font-weight: 700; font-size: 11px; cursor: pointer; }
        .a-btn.on { border-color: var(--m-color); color: var(--m-color); }
      </style>
      
      <div class="card" id="c">
        <div class="header">
          <div>
            <div class="title" id="t">--</div>
            <div style="font-size: 10px; color: rgba(255,255,255,0.3)" id="sub">CLIMATE CONTROL</div>
          </div>
          <div id="badge" style="font-size: 10px; font-weight: 800; color: var(--m-color)">OPTIM</div>
        </div>

        <div class="visual-area">
          <div class="ac-unit">
            <div class="ac-display-led">
              <div class="led-t" id="l-t">--°</div>
              <div style="font-size: 6px; color: #555" id="l-m">OFF</div>
            </div>
          </div>
          <svg class="flow-svg" id="f-svg" viewBox="0 0 200 50">
            <path class="air-path" d="M20,10 Q60,40 100,10 T180,10" />
            <path class="air-path" d="M30,20 Q70,50 110,20 T190,20" style="animation-delay: -0.6s" />
          </svg>
        </div>

        <div class="temp-ctrl">
          <button class="btn-r" id="minus">−</button>
          <div class="temp-main" id="big-t">--°C</div>
          <button class="btn-r" id="plus">+</button>
        </div>

        <div class="modes-row" id="m-row"></div>

        <div class="stats">
          <div class="s-box"><div class="s-label">Interior</div><div class="s-val" id="s-in">--</div></div>
          <div class="s-box"><div class="s-label">Exterior</div><div class="s-val" id="s-ex">--</div></div>
          <div class="s-box"><div class="s-label">Consum</div><div class="s-val" id="s-pw">--</div></div>
        </div>

        <div class="actions">
          <button class="a-btn" id="pwr">POWER</button>
          <button class="a-btn" id="fan">FAN: AUTO</button>
          <button class="a-btn" id="swng">SWING</button>
        </div>
      </div>
    `;
  }

  _bindEvents() {
    const s = this.shadowRoot;
    s.getElementById('minus').onclick = () => this._call('set_temperature', { temperature: this._curr - 1 });
    s.getElementById('plus').onclick = () => this._call('set_temperature', { temperature: this._curr + 1 });
    s.getElementById('pwr').onclick = () => this._call(this._state === 'off' ? 'turn_on' : 'turn_off');
    s.getElementById('fan').onclick = () => this._cycle('fan_mode', 'fan_modes');
    s.getElementById('swng').onclick = () => this._cycle('swing_mode', 'swing_modes');
  }

  _update(state, hass) {
    const mode = state.state;
    const cfg = MODES_CFG[mode] || MODES_CFG.off;
    this._curr = state.attributes.temperature;
    this._state = mode;

    const r = this.shadowRoot;
    r.host.style.setProperty('--m-color', cfg.color);
    r.host.style.setProperty('--m-glow', cfg.glow);

    r.getElementById('t').textContent = this._config.name || state.attributes.friendly_name;
    r.getElementById('big-t').textContent = `${this._curr}°C`;
    r.getElementById('l-t').textContent = `${this._curr}°`;
    r.getElementById('l-m').textContent = cfg.disp;
    
    r.getElementById('f-svg').style.display = mode === 'off' ? 'none' : 'block';
    r.getElementById('pwr').classList.toggle('on', mode !== 'off');
    r.getElementById('fan').textContent = `FAN: ${state.attributes.fan_mode || 'AUTO'}`;
    r.getElementById('swng').classList.toggle('on', state.attributes.swing_mode !== 'off');

    // Stats
    r.getElementById('s-in').textContent = `${state.attributes.current_temperature || '--'}°`;
    r.getElementById('s-ex').textContent = `${hass.states[this._entities.tempExt]?.state || '--'}°`;
    r.getElementById('s-pw').textContent = `${hass.states[this._entities.power]?.state || '0'}W`;

    this._renderModes(state.attributes.hvac_modes, mode);
  }

  _renderModes(modes, active) {
    const container = this.shadowRoot.getElementById('m-row');
    if (container.innerHTML !== '') {
        container.querySelectorAll('.m-btn').forEach(b => b.classList.toggle('active', b.dataset.m === active));
        return;
    }
    modes.forEach(m => {
      const b = document.createElement('button');
      b.className = `m-btn ${m === active ? 'active' : ''}`;
      b.dataset.m = m;
      b.textContent = (MODES_CFG[m]?.icon || '') + ' ' + m.toUpperCase();
      b.onclick = () => this._call('set_hvac_mode', { hvac_mode: m });
      container.appendChild(b);
    });
  }

  _call(svc, data = {}) {
    this._hass.callService('climate', svc, { entity_id: this._config.entity, ...data });
  }

  _cycle(attr, attrList) {
    const state = this._hass.states[this._config.entity];
    const list = state.attributes[attrList] || [];
    const current = state.attributes[attr];
    const next = list[(list.indexOf(current) + 1) % list.length];
    this._call(`set_${attr}`, { [attr]: next });
  }
}

customElements.define('ac-climate-card', AcClimateCard);
