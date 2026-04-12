/**
 * ac-climate-card.js — Glassmorphism Edition (Option 1 Matching)
 */

const CARD_VERSION = '1.2.0';

function buildEntities(climateEntityId) {
  const prefix = climateEntityId.replace(/^climate\./, '');
  return {
    climate: climateEntityId,
    power: `sensor.${prefix}_power`,
    currentEnergy: `sensor.${prefix}_current_energy`,
    totalEnergy: `sensor.${prefix}_total_energy`,
    tempExt: `sensor.${prefix}_temperatura_exterioara`,
    tempInt: `sensor.${prefix}_temperatura_interioara`,
  };
}

const MODES_CFG = {
  cool:     { color: '#60a5fa', glow: 'rgba(96,165,250,0.25)', icon: '❄️', label: 'Răcire' },
  heat:     { color: '#fb923c', glow: 'rgba(251,146,60,0.25)', icon: '🔥', label: 'Încălzire' },
  fan_only: { color: '#a78bfa', glow: 'rgba(167,139,250,0.25)', icon: '💨', label: 'Ventilare' },
  dry:      { color: '#22d3ee', glow: 'rgba(34,211,238,0.25)', icon: '💧', label: 'Dezumidif.' },
  auto:     { color: '#4ade80', glow: 'rgba(74,222,128,0.25)', icon: '🔄', label: 'Auto' },
  off:      { color: '#9ca3af', glow: 'transparent', icon: '○', label: 'Oprit' }
};

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;500;700&family=DM+Mono:wght@500&display=swap');

  :host { display: block; --card-br: 32px; }

  .card {
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.05), rgba(255, 255, 255, 0.02));
    backdrop-filter: blur(25px) saturate(160%);
    -webkit-backdrop-filter: blur(25px) saturate(160%);
    border-radius: var(--card-br);
    border: 1px solid rgba(255, 255, 255, 0.1);
    padding: 24px;
    position: relative;
    overflow: hidden;
    font-family: 'DM Sans', sans-serif;
    color: #fff;
    box-shadow: 0 20px 40px rgba(0,0,0,0.4);
  }

  /* Glow discret de fundal - identic cu cardul de senzori */
  .card::before {
    content: ''; position: absolute; top: -15%; left: -10%; width: 130%; height: 130%;
    background: radial-gradient(circle at 20% 20%, var(--mode-glow, rgba(96,165,250,0.2)), transparent 45%);
    pointer-events: none; z-index: 0; transition: background 0.8s ease;
  }

  .hdr { display: flex; justify-content: space-between; position: relative; z-index: 2; margin-bottom: 25px; }
  .room { font-family: 'Syne', sans-serif; font-weight: 700; font-size: 20px; letter-spacing: -0.5px; }
  .status-tag { 
    font-size: 10px; font-weight: 800; padding: 4px 12px; border-radius: 20px; 
    background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1);
    color: var(--mode-color); letter-spacing: 1px; transition: color 0.5s;
  }

  /* Vizualizare Centrala */
  .ac-visual {
    position: relative; z-index: 2; display: flex; flex-direction: column; align-items: center; margin-bottom: 25px;
  }
  .ac-unit-glass {
    width: 240px; height: 60px; background: rgba(255,255,255,0.03); 
    border: 1px solid rgba(255,255,255,0.08); border-radius: 16px;
    position: relative; display: flex; align-items: center; justify-content: flex-end; padding-right: 15px;
  }
  .ac-screen {
    width: 60px; height: 35px; background: #000; border-radius: 6px;
    border: 1px solid rgba(255,255,255,0.1); display: flex; flex-direction: column; 
    align-items: center; justify-content: center; box-shadow: 0 0 10px var(--mode-glow);
  }
  .led-temp { font-family: 'DM Mono', monospace; font-size: 18px; color: var(--mode-color); }
  
  /* Temp Controls */
  .temp-row { display: flex; align-items: center; justify-content: center; gap: 30px; margin-bottom: 25px; position: relative; z-index: 2; }
  .temp-val { font-family: 'Syne', sans-serif; font-size: 48px; font-weight: 800; letter-spacing: -2px; }
  .btn-circle {
    width: 50px; height: 50px; border-radius: 50%; border: 1px solid rgba(255,255,255,0.1);
    background: rgba(255,255,255,0.05); color: #fff; font-size: 24px; cursor: pointer;
    display: flex; align-items: center; justify-content: center; transition: 0.3s;
  }
  .btn-circle:hover { border-color: var(--mode-color); background: rgba(255,255,255,0.1); }

  /* Grid Statistici */
  .stats-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px; margin-bottom: 20px; position: relative; z-index: 2; }
  .stat-box { 
    background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.05); 
    padding: 12px 8px; border-radius: 18px; text-align: center;
  }
  .stat-label { font-size: 8px; text-transform: uppercase; color: rgba(255,255,255,0.3); letter-spacing: 1px; margin-bottom: 4px; }
  .stat-value { font-family: 'Syne', sans-serif; font-size: 16px; font-weight: 700; }

  /* Rand Butoane Mode */
  .modes-row { display: flex; gap: 6px; margin-bottom: 20px; position: relative; z-index: 2; overflow-x: auto; padding-bottom: 4px; }
  .mode-btn {
    flex: 1; min-width: 60px; padding: 10px 5px; border-radius: 12px; border: 1px solid rgba(255,255,255,0.05);
    background: rgba(255,255,255,0.02); color: rgba(255,255,255,0.4); font-size: 9px; font-weight: 700;
    cursor: pointer; transition: 0.3s; text-align: center;
  }
  .mode-btn.active { background: var(--mode-color); color: #000; border-color: var(--mode-color); }

  /* Footer Controls */
  .footer-actions { display: flex; gap: 10px; position: relative; z-index: 2; }
  .btn-action {
    flex: 1; padding: 12px; border-radius: 14px; border: 1px solid rgba(255,255,255,0.1);
    background: rgba(255,255,255,0.05); color: #fff; font-weight: 700; font-size: 11px; cursor: pointer;
  }
  .btn-action.active { border-color: var(--mode-color); color: var(--mode-color); }
`;

const TEMPLATE = `
  <div class="card" id="card">
    <div class="hdr">
      <div>
        <div class="room" id="title">--</div>
        <div style="font-size: 10px; color: rgba(255,255,255,0.3); letter-spacing: 1px;" id="sub">CLIMATE CONTROL</div>
      </div>
      <div class="status-tag" id="badge">--</div>
    </div>

    <div class="ac-visual">
      <div class="ac-unit-glass">
        <div class="ac-screen">
          <div class="led-temp" id="dispTemp">--</div>
          <div style="font-size: 6px; opacity: 0.5;" id="dispMode">OFF</div>
        </div>
      </div>
      <div id="flowLine" style="margin-top: 10px; width: 160px; height: 1px; background: linear-gradient(90deg, transparent, var(--mode-color), transparent); opacity: 0.2;"></div>
    </div>

    <div class="temp-row">
      <button class="btn-circle" id="btnMinus">−</button>
      <div class="temp-val" id="tempBig">--°C</div>
      <button class="btn-circle" id="btnPlus">+</button>
    </div>

    <div class="modes-row" id="modeRow"></div>

    <div class="stats-grid">
      <div class="stat-box"><div class="stat-label">Interior</div><div class="stat-value" id="statInt">--</div></div>
      <div class="stat-box"><div class="stat-label">Consum</div><div class="stat-value" id="statPow">--</div></div>
      <div class="stat-box"><div class="stat-label">Exterior</div><div class="stat-value" id="statExt">--</div></div>
    </div>

    <div class="footer-actions">
      <button class="btn-action" id="btnPower">POWER</button>
      <button class="btn-action" id="btnFan">--</button>
    </div>
  </div>
`;

class AcClimateCard extends HTMLElement {
  setConfig(config) {
    if (!config.entity) throw new Error('Specificați o entitate climate.');
    this._config = config;
    this._entities = buildEntities(config.entity);
    if (!this.shadowRoot) {
      this.attachShadow({ mode: 'open' });
      this.shadowRoot.innerHTML = `<style>${STYLES}</style>${TEMPLATE}`;
      this._bindEvents();
    }
  }

  set hass(hass) {
    this._hass = hass;
    this._render();
  }

  _bindEvents() {
    const s = this.shadowRoot;
    s.getElementById('btnMinus').onclick = () => this._adjustTemp(-1);
    s.getElementById('btnPlus').onclick = () => this._adjustTemp(1);
    s.getElementById('btnPower').onclick = () => this._togglePower();
    s.getElementById('btnFan').onclick = () => this._cycleFan();
  }

  _render() {
    if (!this._hass || !this._config) return;
    const state = this._hass.states[this._entities.climate];
    if (!state) return;

    const s = this.shadowRoot;
    const mode = state.state;
    const cfg = MODES_CFG[mode] || MODES_CFG.off;
    const setTemp = state.attributes.temperature || '--';
    
    // Update CSS Variables for Glow
    const card = s.getElementById('card');
    card.style.setProperty('--mode-color', cfg.color);
    card.style.setProperty('--mode-glow', cfg.glow);

    // Header & Badge
    s.getElementById('title').textContent = this._config.name || state.attributes.friendly_name;
    s.getElementById('badge').textContent = mode.toUpperCase();
    s.getElementById('badge').style.color = cfg.color;

    // Center Display
    s.getElementById('tempBig').textContent = `${setTemp}°C`;
    s.getElementById('dispTemp').textContent = `${setTemp}°`;
    s.getElementById('dispMode').textContent = mode.toUpperCase();

    // Stats
    s.getElementById('statInt').textContent = `${state.attributes.current_temperature || '--'}°`;
    s.getElementById('statPow').textContent = `${this._getVal(this._entities.power, '0')}W`;
    s.getElementById('statExt').textContent = `${this._getVal(this._entities.tempExt, '--')}°`;

    // Mode Buttons
    this._renderModes(state.attributes.hvac_modes, mode);

    // Footer
    const btnFan = s.getElementById('btnFan');
    btnFan.textContent = `FAN: ${state.attributes.fan_mode?.toUpperCase() || 'AUTO'}`;
    s.getElementById('btnPower').className = `btn-action ${mode !== 'off' ? 'active' : ''}`;
  }

  _renderModes(modes, active) {
    const container = this.shadowRoot.getElementById('modeRow');
    if (this._lastModes === JSON.stringify(modes)) {
      container.querySelectorAll('.mode-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.mode === active);
      });
      return;
    }
    this._lastModes = JSON.stringify(modes);
    container.innerHTML = '';
    modes.forEach(m => {
      const btn = document.createElement('button');
      btn.className = `mode-btn ${m === active ? 'active' : ''}`;
      btn.dataset.mode = m;
      btn.textContent = (MODES_CFG[m]?.icon || '') + ' ' + m.toUpperCase();
      btn.onclick = () => this._setHvacMode(m);
      container.appendChild(btn);
    });
  }

  _getVal(entity, fallback) {
    const s = this._hass.states[entity];
    return (s && s.state !== 'unknown') ? s.state : fallback;
  }

  _setHvacMode(mode) {
    this._hass.callService('climate', 'set_hvac_mode', {
      entity_id: this._entities.climate,
      hvac_mode: mode
    });
  }

  _adjustTemp(delta) {
    const state = this._hass.states[this._entities.climate];
    const newTemp = (state.attributes.temperature || 22) + delta;
    this._hass.callService('climate', 'set_temperature', {
      entity_id: this._entities.climate,
      temperature: newTemp
    });
  }

  _togglePower() {
    const state = this._hass.states[this._entities.climate];
    const service = state.state === 'off' ? 'turn_on' : 'turn_off';
    this._hass.callService('climate', service, { entity_id: this._entities.climate });
  }

  _cycleFan() {
    const state = this._hass.states[this._entities.climate];
    const modes = state.attributes.fan_modes || [];
    const current = state.attributes.fan_mode;
    const next = modes[(modes.indexOf(current) + 1) % modes.length];
    this._hass.callService('climate', 'set_fan_mode', {
      entity_id: this._entities.climate,
      fan_mode: next
    });
  }

  getCardSize() { return 5; }
}

customElements.define('ac-climate-card', AcClimateCard);
