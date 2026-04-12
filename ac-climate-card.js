/**
 * ac-climate-card.js — FULL VERSION
 * Glassmorphism + Animated SVG + Full Logic
 */

const MODES_CFG = {
  cool:     { color: '#60a5fa', glow: 'rgba(96,165,250,0.3)', icon: '❄️', disp: 'COOL' },
  heat:     { color: '#fb923c', glow: 'rgba(251,146,60,0.3)', icon: '🔥', disp: 'HEAT' },
  fan_only: { color: '#a78bfa', glow: 'rgba(167,139,250,0.3)', icon: '💨', disp: 'FAN' },
  dry:      { color: '#22d3ee', glow: 'rgba(34,211,238,0.3)', icon: '💧', disp: 'DRY' },
  auto:     { color: '#4ade80', glow: 'rgba(74,222,128,0.3)', icon: '🔄', disp: 'AUTO' },
  off:      { color: '#9ca3af', glow: 'transparent', icon: '○', disp: 'OFF' }
};

class AcClimateCard extends HTMLElement {
  setConfig(config) {
    if (!config.entity) throw new Error('Te rog definește entitatea climate!');
    this._config = config;
  }

  set hass(hass) {
    const entityId = this._config.entity;
    const state = hass.states[entityId];
    if (!state) return;

    if (!this.shadowRoot) {
      this._root = this.attachShadow({ mode: 'open' });
      this._root.innerHTML = this._getHtml();
      this._bindEvents();
    }

    this._updateDisplay(state, hass);
  }

  _getHtml() {
    return `
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;500;700&family=DM+Mono:wght@500&display=swap');
        
        :host { --card-br: 32px; --m-color: #60a5fa; --m-glow: rgba(96,165,250,0.3); }
        
        .card {
          background: linear-gradient(135deg, rgba(255,255,255,0.05), rgba(255,255,255,0.02));
          backdrop-filter: blur(25px) saturate(160%);
          -webkit-backdrop-filter: blur(25px) saturate(160%);
          border-radius: var(--card-br);
          border: 1px solid rgba(255,255,255,0.1);
          padding: 24px;
          position: relative;
          color: #fff;
          font-family: 'DM Sans', sans-serif;
          overflow: hidden;
        }

        .card::before {
          content: ''; position: absolute; top: -10%; left: -10%; width: 120%; height: 120%;
          background: radial-gradient(circle at 20% 20%, var(--m-glow), transparent 40%);
          z-index: 0; pointer-events: none; transition: background 0.8s ease;
        }

        .header { position: relative; z-index: 1; display: flex; justify-content: space-between; margin-bottom: 20px; }
        .title { font-family: 'Syne', sans-serif; font-size: 20px; font-weight: 700; }
        
        /* AC VISUAL */
        .ac-visual { position: relative; height: 120px; display: flex; justify-content: center; align-items: center; z-index: 1; }
        .ac-unit {
          width: 220px; height: 60px; background: rgba(255,255,255,0.9);
          border-radius: 8px 8px 15px 15px; position: relative;
          box-shadow: 0 10px 20px rgba(0,0,0,0.3);
        }
        .ac-display {
          position: absolute; right: 15px; top: 12px; width: 45px; height: 30px;
          background: #000; border-radius: 4px; display: flex; flex-direction: column;
          align-items: center; justify-content: center; border: 1px solid #333;
        }
        .led-temp { color: var(--m-color); font-family: 'DM Mono', monospace; font-size: 14px; text-shadow: 0 0 5px var(--m-color); }
        
        /* Airflow Animation */
        .flow-container { position: absolute; top: 60px; width: 180px; height: 40px; overflow: hidden; opacity: 0.5; }
        .air-line {
          stroke: var(--m-color); stroke-width: 2; fill: none;
          stroke-dasharray: 10, 20; animation: flow 1s linear infinite;
        }
        @keyframes flow { to { stroke-dashoffset: -30; } }

        /* Controls */
        .main-ctrl { position: relative; z-index: 1; display: flex; align-items: center; justify-content: center; gap: 30px; margin: 20px 0; }
        .temp-val { font-family: 'Syne', sans-serif; font-size: 48px; font-weight: 800; letter-spacing: -2px; }
        
        .btn-round {
          width: 50px; height: 50px; border-radius: 50%; border: 1px solid rgba(255,255,255,0.1);
          background: rgba(255,255,255,0.05); color: #fff; font-size: 24px; cursor: pointer; transition: 0.3s;
        }
        .btn-round:hover { border-color: var(--m-color); background: rgba(255,255,255,0.1); }

        .modes { display: flex; gap: 8px; overflow-x: auto; margin-bottom: 20px; z-index: 1; position: relative; }
        .mode-btn {
          flex: 1; padding: 10px; border-radius: 12px; border: 1px solid rgba(255,255,255,0.05);
          background: rgba(255,255,255,0.02); color: rgba(255,255,255,0.4); font-size: 10px; font-weight: 700; cursor: pointer;
        }
        .mode-btn.active { background: var(--m-color); color: #000; border-color: var(--m-color); }

        .stats { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px; z-index: 1; position: relative; }
        .stat-box { background: rgba(255,255,255,0.03); padding: 12px; border-radius: 16px; text-align: center; border: 1px solid rgba(255,255,255,0.05); }
        .stat-label { font-size: 8px; color: rgba(255,255,255,0.3); text-transform: uppercase; margin-bottom: 4px; }
        .stat-val { font-family: 'Syne', sans-serif; font-size: 16px; font-weight: 700; }
      </style>
      
      <div class="card" id="cardContainer">
        <div class="header">
          <div class="title" id="friendlyName">AC Living</div>
          <div id="statusBadge" style="font-size: 10px; font-weight: 800; color: var(--m-color)">OPTIM</div>
        </div>

        <div class="ac-visual">
          <div class="ac-unit">
            <div class="ac-display">
              <div class="led-temp" id="ledTemp">22°</div>
              <div style="font-size: 6px; color: #666" id="ledMode">COOL</div>
            </div>
          </div>
          <div class="flow-container" id="flowContainer">
            <svg width="180" height="40">
              <path class="air-line" d="M10,5 Q45,35 80,5 T150,5" />
              <path class="air-line" d="M20,15 Q55,45 90,15 T160,15" style="animation-delay: -0.5s" />
            </svg>
          </div>
        </div>

        <div class="main-ctrl">
          <button class="btn-round" id="btnMinus">−</button>
          <div class="temp-val" id="bigTemp">22°C</div>
          <button class="btn-round" id="btnPlus">+</button>
        </div>

        <div class="modes" id="modeSelector"></div>

        <div class="stats">
          <div class="stat-box"><div class="stat-label">Cameră</div><div class="stat-val" id="curTemp">--°</div></div>
          <div class="stat-box"><div class="stat-label">Exterior</div><div class="stat-val" id="extTemp">--°</div></div>
          <div class="stat-box"><div class="stat-label">Putere</div><div class="stat-val" id="pwrVal">--W</div></div>
        </div>
      </div>
    `;
  }

  _bindEvents() {
    this._root.getElementById('btnMinus').onclick = () => this._callService('set_temperature', { temperature: this._currentTemp - 1 });
    this._root.getElementById('btnPlus').onclick = () => this._callService('set_temperature', { temperature: this._currentTemp + 1 });
  }

  _updateDisplay(state, hass) {
    const mode = state.state;
    const cfg = MODES_CFG[mode] || MODES_CFG.off;
    this._currentTemp = state.attributes.temperature;

    const host = this.shadowRoot.host;
    host.style.setProperty('--m-color', cfg.color);
    host.style.setProperty('--m-glow', cfg.glow);

    this._root.getElementById('friendlyName').textContent = this._config.name || state.attributes.friendly_name;
    this._root.getElementById('bigTemp').textContent = `${this._currentTemp}°C`;
    this._root.getElementById('ledTemp').textContent = `${this._currentTemp}°`;
    this._root.getElementById('ledMode').textContent = cfg.disp;
    this._root.getElementById('curTemp').textContent = `${state.attributes.current_temperature}°`;
    
    // Vizibilitate flux aer
    this._root.getElementById('flowContainer').style.display = mode === 'off' ? 'none' : 'block';

    // Update Moduri
    const modeSelector = this._root.getElementById('modeSelector');
    if (modeSelector.innerHTML === '') {
      state.attributes.hvac_modes.forEach(m => {
        const btn = document.createElement('button');
        btn.className = `mode-btn ${m === mode ? 'active' : ''}`;
        btn.textContent = (MODES_CFG[m]?.icon || '') + ' ' + m.toUpperCase();
        btn.onclick = () => this._callService('set_hvac_mode', { hvac_mode: m });
        modeSelector.appendChild(btn);
      });
    } else {
      modeSelector.querySelectorAll('.mode-btn').forEach(btn => {
        btn.classList.toggle('active', btn.textContent.toLowerCase().includes(mode));
      });
    }
  }

  _callService(service, data) {
    this._hass.callService('climate', service, {
      entity_id: this._config.entity,
      ...data
    });
  }

  getCardSize() { return 5; }
}

customElements.define('ac-climate-card', AcClimateCard);
