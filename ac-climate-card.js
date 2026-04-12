/**
 * ac-climate-card.js — PREMIUM GLASS EDITION
 * Design: Expert Minimalist / Glassmorphism
 */

const MODES_THEME = {
  cool:     { color: '#60a5fa', glow: 'rgba(96,165,250,0.3)', label: 'COOL' },
  heat:     { color: '#fb923c', glow: 'rgba(251,146,60,0.3)', label: 'HEAT' },
  fan_only: { color: '#a78bfa', glow: 'rgba(167,139,250,0.3)', label: 'FAN' },
  dry:      { color: '#22d3ee', glow: 'rgba(34,211,238,0.3)', label: 'DRY' },
  auto:     { color: '#4ade80', glow: 'rgba(74,222,128,0.3)', label: 'AUTO' },
  off:      { color: '#9ca3af', glow: 'transparent', label: 'OFF' }
};

class AcClimateCard extends HTMLElement {
  setConfig(config) {
    if (!config.entity) throw new Error('Specificați entitatea climate.');
    this._config = config;
  }

  set hass(hass) {
    this._hass = hass;
    const entityId = this._config.entity;
    const state = hass.states[entityId];
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
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;500;700&display=swap');
        
        :host { --m-color: #60a5fa; --m-glow: rgba(96,165,250,0.3); }

        .card {
          background: linear-gradient(135deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02));
          backdrop-filter: blur(35px) saturate(170%);
          -webkit-backdrop-filter: blur(35px) saturate(170%);
          border-radius: 32px;
          border: 1px solid rgba(255,255,255,0.12);
          padding: 24px;
          position: relative;
          color: #fff;
          font-family: 'DM Sans', sans-serif;
          overflow: hidden;
        }

        /* Glow dinamic de fundal - matching cu cardul anterior */
        .card::before {
          content: ''; position: absolute; top: -15%; left: -10%; width: 130%; height: 130%;
          background: radial-gradient(circle at 20% 20%, var(--m-glow), transparent 45%);
          z-index: 0; pointer-events: none; transition: background 0.8s ease;
        }

        .header { position: relative; z-index: 2; display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 25px; }
        .title { font-family: 'Syne', sans-serif; font-size: 22px; font-weight: 800; letter-spacing: -0.5px; }
        .badge { font-size: 10px; font-weight: 800; padding: 4px 12px; border-radius: 20px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); color: var(--m-color); transition: 0.5s; }

        /* Vizualizare Abstractă Expert */
        .ac-visual-container { position: relative; height: 140px; display: flex; justify-content: center; align-items: center; z-index: 1; }
        
        .ac-unit-abstract {
          width: 240px; height: 50px; 
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 12px;
          position: relative;
          display: flex; align-items: center; justify-content: flex-end; padding-right: 15px;
          box-shadow: inset 0 2px 10px rgba(0,0,0,0.2);
        }

        .led-screen {
          width: 55px; height: 32px; background: #000; border-radius: 6px;
          border: 1px solid rgba(255,255,255,0.1); display: flex; flex-direction: column; align-items: center; justify-content: center;
          box-shadow: 0 0 20px var(--m-glow);
        }
        .led-t { color: var(--m-color); font-family: 'Syne', sans-serif; font-size: 15px; }

        /* Animație Airflow Abstractă (fără linii urâte) */
        .air-glow {
          position: absolute; top: 60px; width: 180px; height: 60px;
          background: radial-gradient(ellipse at top, var(--m-glow), transparent 70%);
          filter: blur(15px); opacity: 0; transition: 1s;
          animation: pulseGlow 3s ease-in-out infinite;
        }
        @keyframes pulseGlow { 0%, 100% { opacity: 0.2; transform: scaleY(0.8); } 50% { opacity: 0.6; transform: scaleY(1.2); } }

        /* Central Temp */
        .temp-row { position: relative; z-index: 2; display: flex; align-items: center; justify-content: center; gap: 35px; margin-bottom: 30px; }
        .temp-main { font-family: 'Syne', sans-serif; font-size: 52px; font-weight: 800; letter-spacing: -3px; }
        
        .btn-action {
          width: 54px; height: 54px; border-radius: 50%; border: 1px solid rgba(255,255,255,0.1);
          background: rgba(255,255,255,0.05); color: #fff; font-size: 24px; cursor: pointer; transition: 0.3s;
          display: flex; align-items: center; justify-content: center;
        }
        .btn-action:hover { border-color: var(--m-color); background: rgba(255,255,255,0.1); transform: translateY(-2px); }

        /* Control Grid */
        .modes-grid { display: flex; gap: 8px; margin-bottom: 25px; overflow-x: auto; padding-bottom: 5px; z-index: 2; position: relative; }
        .mode-item {
          flex: 1; min-width: 65px; padding: 12px 5px; border-radius: 14px; border: 1px solid rgba(255,255,255,0.05);
          background: rgba(255,255,255,0.03); color: rgba(255,255,255,0.4); font-size: 9px; font-weight: 700; cursor: pointer; text-align: center; transition: 0.3s;
        }
        .mode-item.active { background: var(--m-color); color: #000; border-color: var(--m-color); box-shadow: 0 10px 20px var(--m-glow); }

        /* Stats & Secondary Controls */
        .stats-row { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px; margin-bottom: 20px; z-index: 2; position: relative; }
        .stat-card { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.05); padding: 12px; border-radius: 18px; text-align: center; }
        .stat-label { font-size: 8px; text-transform: uppercase; color: rgba(255,255,255,0.3); margin-bottom: 4px; letter-spacing: 1px; }
        .stat-val { font-family: 'Syne', sans-serif; font-size: 16px; font-weight: 700; }

        .footer-btns { display: flex; gap: 10px; z-index: 2; position: relative; }
        .f-btn { 
          flex: 1; padding: 14px; border-radius: 16px; border: 1px solid rgba(255,255,255,0.1);
          background: rgba(255,255,255,0.05); color: #fff; font-weight: 700; font-size: 11px; cursor: pointer; transition: 0.3s;
        }
        .f-btn.active { border-color: var(--m-color); color: var(--m-color); background: rgba(255,255,255,0.08); }
      </style>

      <div class="card">
        <div class="header">
          <div>
            <div class="title" id="friendly_name">--</div>
            <div style="font-size: 10px; opacity: 0.3; letter-spacing: 1px;">PREMIUM CLIMATE</div>
          </div>
          <div class="badge" id="status_badge">OFF</div>
        </div>

        <div class="ac-visual-container">
          <div class="air-glow" id="air_glow"></div>
          <div class="ac-unit-abstract">
            <div class="led-screen">
              <div class="led-t" id="led_temp">--</div>
              <div style="font-size: 6px; opacity: 0.4;" id="led_mode">--</div>
            </div>
          </div>
        </div>

        <div class="temp-row">
          <button class="btn-action" id="temp_down">−</button>
          <div class="temp-main" id="target_temp">--°C</div>
          <button class="btn-action" id="temp_up">+</button>
        </div>

        <div class="modes-grid" id="modes_container"></div>

        <div class="stats-row">
          <div class="stat-card"><div class="stat-label">Interior</div><div class="stat-val" id="cur_temp">--</div></div>
          <div class="stat-card"><div class="stat-label">Exterior</div><div class="stat-val" id="ext_temp">--</div></div>
          <div class="stat-card"><div class="stat-label">Consum</div><div class="stat-val" id="pwr_usage">--</div></div>
        </div>

        <div class="footer-btns">
          <button class="f-btn" id="pwr_btn">POWER</button>
          <button class="f-btn" id="fan_btn">FAN: --</button>
          <button class="f-btn" id="swing_btn">SWING</button>
        </div>
      </div>
    `;
  }

  _bindEvents() {
    const s = this.shadowRoot;
    s.getElementById('temp_down').onclick = () => this._changeTemp(-1);
    s.getElementById('temp_up').onclick = () => this._changeTemp(1);
    s.getElementById('pwr_btn').onclick = () => this._callService(this._hvacMode === 'off' ? 'turn_on' : 'turn_off');
    s.getElementById('fan_btn').onclick = () => this._cycleAttr('fan_mode', 'fan_modes');
    s.getElementById('swing_btn').onclick = () => this._cycleAttr('swing_mode', 'swing_modes');
  }

  _update(state, hass) {
    const r = this.shadowRoot;
    const attr = state.attributes;
    const mode = state.state;
    const theme = MODES_THEME[mode] || MODES_THEME.off;
    this._hvacMode = mode;
    this._targetTemp = attr.temperature;

    // CSS Vars
    r.host.style.setProperty('--m-color', theme.color);
    r.host.style.setProperty('--m-glow', theme.glow);

    // Header & Visuals
    r.getElementById('friendly_name').textContent = this._config.name || attr.friendly_name;
    r.getElementById('status_badge').textContent = mode.toUpperCase();
    r.getElementById('led_temp').textContent = `${attr.temperature || '--'}°`;
    r.getElementById('led_mode').textContent = theme.label;
    r.getElementById('target_temp').textContent = `${attr.temperature || '--'}°C`;
    r.getElementById('air_glow').style.display = mode === 'off' ? 'none' : 'block';

    // Stats (Auto-mapping logic)
    const prefix = this._config.entity.replace('climate.', '');
    r.getElementById('cur_temp').textContent = `${attr.current_temperature || '--'}°`;
    r.getElementById('ext_temp').textContent = `${hass.states[`sensor.${prefix}_temperatura_exterioara`]?.state || '--'}°`;
    r.getElementById('pwr_usage').textContent = `${hass.states[`sensor.${prefix}_power`]?.state || '0'}W`;

    // Buttons State
    r.getElementById('pwr_btn').classList.toggle('active', mode !== 'off');
    r.getElementById('fan_btn').textContent = `FAN: ${attr.fan_mode?.toUpperCase() || '--'}`;
    r.getElementById('swing_btn').classList.toggle('active', attr.swing_mode !== 'off');

    this._renderModes(attr.hvac_modes, mode);
  }

  _renderModes(modes, active) {
    const container = this.shadowRoot.getElementById('modes_container');
    if (container.innerHTML !== '') {
      container.querySelectorAll('.mode-item').forEach(el => el.classList.toggle('active', el.dataset.m === active));
      return;
    }
    modes.forEach(m => {
      const el = document.createElement('button');
      el.className = `mode-item ${m === active ? 'active' : ''}`;
      el.dataset.m = m;
      el.textContent = (MODES_THEME[m]?.icon || '') + ' ' + m.toUpperCase();
      el.onclick = () => this._callService('set_hvac_mode', { hvac_mode: m });
      container.appendChild(el);
    });
  }

  _callService(service, data = {}) {
    this._hass.callService('climate', service, { entity_id: this._config.entity, ...data });
  }

  _changeTemp(delta) {
    this._callService('set_temperature', { temperature: this._targetTemp + delta });
  }

  _cycleAttr(attr, listAttr) {
    const state = this._hass.states[this._config.entity];
    const list = state.attributes[listAttr] || [];
    const current = state.attributes[attr];
    const next = list[(list.indexOf(current) + 1) % list.length];
    this._callService(`set_${attr}`, { [attr]: next });
  }
}

customElements.define('ac-climate-card', AcClimateCard);
