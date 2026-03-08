# AC Climate Card

Card vizual pentru Home Assistant cu animații, teme per mod și auto-discovery senzori Midea (sau orice AC cu convenție de denumire similară).

![preview](preview.png)

## Instalare via HACS

1. HACS → Frontend → ⋮ → **Custom repositories**
2. Adaugă URL-ul repo-ului, categorie **Lovelace**
3. Instalează **AC Climate Card**
4. Adaugă în `configuration.yaml` (dacă nu e deja):
   ```yaml
   lovelace:
     resources:
       - url: /hacsfiles/ac-climate-card/ac-climate-card.js
         type: module
   ```
   > Sau prin UI: Settings → Dashboards → ⋮ → Resources

## Instalare manuală

1. Copiază `ac-climate-card.js` în `config/www/ac-climate-card/`
2. Adaugă resource:
   ```yaml
   url: /local/ac-climate-card/ac-climate-card.js
   type: module
   ```

## Configurare

```yaml
type: custom:ac-climate-card
entity: climate.midea_ac_152832116516967
name: Aer Condiționat    # opțional, fallback: friendly_name din HA
area: living             # opțional, apare sub titlu
```

### Singurul câmp obligatoriu este `entity`.

Cardul detectează automat senzorii asociați pe baza prefixului entității climate:

| Senzor detectat | Entity ID dedus |
|---|---|
| Temperatură interioară | `sensor.{prefix}_temperatura_interioara` |
| Temperatură exterioară | `sensor.{prefix}_temperatura_exterioara` |
| Consum instant | `sensor.{prefix}_power` |
| Energie sesiune | `sensor.{prefix}_current_energy` |
| Energie totală | `sensor.{prefix}_total_energy` |

Dacă un senzor nu există, câmpul respectiv afișează `--` fără erori.

## Funcționalități

- **Teme dinamice** per mod (cool/heat/fan/dry/auto/off) — culori, display LCD, glow
- **Animații** — lamele, airflow streams, ceață la cool, puls portocaliu la heat
- **Controale full**: temperatură (−/+), mod HVAC, fan mode (ciclu), swing mode (ciclu), on/off
- **Date live**: temp interior/exterior, consum W, energie kWh sesiune + total
- **Progress bar** — distanța dintre temperatura curentă și cea setată
