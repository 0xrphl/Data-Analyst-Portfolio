/**
 * calibration_portal.h
 * Local IP SOTA Instrumentation & Calibration Workbench (/cal)
 * Served directly from ESP32-S3 PROGMEM for zero-dependency field/bench calibration at UTP or Home
 */
#ifndef CALIBRATION_PORTAL_H
#define CALIBRATION_PORTAL_H

#include <Arduino.h>

const char KART_CALIBRATION_HTML[] PROGMEM = R"rawliteral(<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>SHT31 & GNSS Instrumentation Calibration Lab</title>
<meta name="viewport" content="width=device-width,initial-scale=1">
<style>
  *{box-sizing:border-box;margin:0;padding:0;font-family:'Segoe UI',system-ui,monospace}
  body{background:#060911;color:#f1f5f9;padding:14px;max-width:1280px;margin:0 auto}
  header{display:flex;justify-content:space-between;align-items:center;background:#0f172a;border:1px solid #1e293b;border-radius:10px;padding:12px 16px;margin-bottom:12px;flex-wrap:wrap;gap:8px}
  .badge{background:#0284c7;color:#fff;font-size:11px;font-weight:700;padding:4px 8px;border-radius:5px}
  a.btn,button{background:#0284c7;color:#fff;border:none;padding:7px 12px;border-radius:6px;font-size:12px;font-weight:700;cursor:pointer;text-decoration:none;display:inline-block}
  button.sec{background:#334155}button.warn{background:#dc2626}button.ok{background:#059669}
  .grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(360px,1fr));gap:12px}
  .card{background:#0f172a;border:1px solid rgba(56,189,248,0.25);border-radius:10px;padding:14px}
  h2{font-size:13px;color:#38bdf8;text-transform:uppercase;letter-spacing:.5px;margin-bottom:10px;border-bottom:1px solid #1e293b;padding-bottom:6px}
  .kv{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-bottom:10px}
  .box{background:#090d16;border:1px solid #1e293b;border-radius:7px;padding:8px;text-align:center}
  .box .k{font-size:10px;color:#94a3b8;font-weight:700;text-transform:uppercase}
  .box .v{font-size:16px;font-weight:800;color:#f8fafc;margin-top:3px}
  label{display:block;font-size:11px;color:#cbd5e1;margin:6px 0 3px}
  input[type=number]{width:100%;background:#090d16;border:1px solid #334155;color:#fff;padding:6px 8px;border-radius:5px;font-size:13px}
  .row2{display:grid;grid-template-columns:1fr 1fr;gap:8px}
  pre{background:#090d16;border:1px solid #1e293b;border-radius:6px;padding:10px;font-size:11px;color:#a7f3d0;overflow-x:auto;max-height:240px;margin-top:8px}
</style>
</head>
<body>
<header>
  <div><span class="badge">INSTRUMENTATION LAB</span> <b style="margin-left:8px">Sensirion SHT31 (IO40/IO39) + SIM767x Multi-GNSS Calibration</b></div>
  <div style="display:flex;gap:8px;align-items:center">
    <span id="wifiBadge" style="font-size:12px;color:#10b981;font-weight:700">Polling...</span>
    <a class="btn sec" href="/">← Live 3D Dashboard</a>
  </div>
</header>

<div class="grid">
  <div class="card">
    <h2>1. Sensirion SHT31-DIS Live Metrology (SDA=40, SCL=39)</h2>
    <div class="kv">
      <div class="box"><div class="k">Raw Temp</div><div class="v" id="rawT">-- °C</div></div>
      <div class="box"><div class="k">Calibrated Temp</div><div class="v" id="calT" style="color:#10b981">-- °C</div></div>
      <div class="box"><div class="k">Dew Point</div><div class="v" id="dewT" style="color:#38bdf8">-- °C</div></div>
      <div class="box"><div class="k">Raw Humidity</div><div class="v" id="rawH">-- %RH</div></div>
      <div class="box"><div class="k">Calibrated RH</div><div class="v" id="calH" style="color:#10b981">-- %RH</div></div>
      <div class="box"><div class="k">VPD / Abs Hum</div><div class="v" id="vpd">-- kPa</div></div>
      <div class="box"><div class="k">Noise σT / σRH</div><div class="v" id="sigma">--</div></div>
      <div class="box"><div class="k">Condens. Margin</div><div class="v" id="margin">-- °C</div></div>
      <div class="box"><div class="k">CRC-8 OK / ERR</div><div class="v" id="crc">--</div></div>
    </div>
    <div class="kv">
      <div class="box"><div class="k">DS3231 RTC Temp</div><div class="v" id="rtcT">-- °C</div></div>
      <div class="box"><div class="k">BMI160 Die Temp</div><div class="v" id="bmiT">-- °C</div></div>
      <div class="box"><div class="k">Thermal Settled</div><div class="v" id="settle">--</div></div>
    </div>
    <div style="display:flex;gap:8px;flex-wrap:wrap">
      <button class="ok" onclick="runHeater()">Run 1.5s Heater Plausibility BIST</button>
      <button class="sec" onclick="loadDiag()">Refresh Hardware Bus Scan</button>
    </div>
  </div>
)rawliteral"
R"rawliteral(
  <div class="card">
    <h2>2. SHT31 Persistent NVS Calibration (ESP32-S3 Flash)</h2>
    <div style="font-size:11px;color:#94a3b8;margin-bottom:6px">
      Active Model: <code style="color:#38bdf8">T_cal = slope_T * T_raw + off_T</code> | <code style="color:#38bdf8">RH_cal = slope_H * RH_raw + off_H</code>
    </div>
    <label><b>A) Quick 1-Point Reference Trim</b> (Reference Thermometer °C &amp; Hygrometer %RH)</label>
    <div class="row2">
      <input type="number" step="0.01" id="refT" placeholder="Ref Temp (°C) e.g. 24.50">
      <input type="number" step="0.1"  id="refH" placeholder="Ref Humidity (%RH) e.g. 68.0">
    </div>
    <div style="margin-top:8px;display:flex;gap:8px;flex-wrap:wrap">
      <button onclick="apply1Pt()">Apply &amp; Save 1-Point Calibration</button>
      <button class="warn" onclick="resetCal()">Reset Factory (1.0 / 0.0)</button>
    </div>

    <label style="margin-top:12px"><b>B) Direct Slope / Offset Coefficients</b> (+ Optional PCB ΔT Coupling)</label>
    <div class="row2">
      <input type="number" step="0.0001" id="tSlope" placeholder="Temp Slope (1.0000)">
      <input type="number" step="0.01"   id="tOff"   placeholder="Temp Offset (0.00)">
      <input type="number" step="0.0001" id="hSlope" placeholder="Hum Slope (1.0000)">
      <input type="number" step="0.01"   id="hOff"   placeholder="Hum Offset (0.00)">
    </div>
    <label style="display:flex;align-items:center;gap:6px;margin-top:6px">
      <input type="checkbox" id="psyCpl"> Compensate RH via Magnus vapor ratio when Temp Offset ≠ 0
    </label>
    <div style="margin-top:8px">
      <button class="sec" onclick="applyManual()">Save Manual Coefficients</button>
    </div>
  </div>

  <div class="card">
    <h2>3. SIM767x Multi-GNSS &amp; Current Place Confirmation (UTP Pereira)</h2>
    <div class="kv">
      <div class="box"><div class="k">Fix Status</div><div class="v" id="gFix">--</div></div>
      <div class="box"><div class="k">Sats Used / View</div><div class="v" id="gSats">--</div></div>
      <div class="box"><div class="k">Peak SNR / HDOP</div><div class="v" id="gSnr">--</div></div>
      <div class="box"><div class="k">Latitude</div><div class="v" id="gLat">--</div></div>
      <div class="box"><div class="k">Longitude</div><div class="v" id="gLon">--</div></div>
      <div class="box"><div class="k">Altitude / Speed</div><div class="v" id="gAlt">--</div></div>
      <div class="box"><div class="k">Constellations</div><div class="v" id="gConst" style="font-size:12px">--</div></div>
      <div class="box"><div class="k">UTP Distance</div><div class="v" id="gUtp">--</div></div>
      <div class="box"><div class="k">Place Lock</div><div class="v" id="gPlace" style="color:#f59e0b">--</div></div>
    </div>
    <div style="display:flex;gap:8px;flex-wrap:wrap">
      <button onclick="gnssCmd('/gnss/agps')">Inject Assisted-GPS (AT+CAGPS)</button>
      <button class="sec" onclick="gnssCmd('/gnss/restart?mode=1')">Warm Restart</button>
      <button class="warn" onclick="gnssCmd('/gnss/restart?mode=0')">Cold Restart</button>
    </div>
  </div>

  <div class="card">
    <h2>4. BMI160 6-DOF Gyro + Accel &amp; DS3231 TCXO Clock Calibration</h2>
    <label><b>BMI160 Stationary Zero-Bias &amp; Level 1g Calibration</b> (Keep kart/board flat &amp; still for 0.8s)</label>
    <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:10px">
      <button class="ok" onclick="gnssCmd('/cal/imu/level')">Calibrate Gyro Bias + Level Accel (150 Samples)</button>
      <button class="sec" onclick="gnssCmd('/cal/imu/tare')">Tare 3D Cube (0°/0°/0°)</button>
      <button class="warn" onclick="gnssCmd('/cal/imu/reset')">Reset IMU Cal</button>
    </div>

    <label><b>DS3231 Battery Clock Atomic NTP Sync &amp; Crystal Aging Trim (Reg 0x10, 0.1 ppm/LSB)</b></label>
    <div class="row2">
      <input type="number" step="1" min="-128" max="127" id="rtcAge" placeholder="Aging LSB (-128..127, 0)">
      <input type="number" step="0.25" id="rtcToff" placeholder="RTC Temp Offset °C (0.00)">
    </div>
    <div style="margin-top:8px;display:flex;gap:8px;flex-wrap:wrap">
      <button onclick="gnssCmd('/cal/rtc/ntp')">Sync DS3231 to Atomic NTP &amp; Measure PPM Drift</button>
      <button class="sec" onclick="applyRtcTrim()">Save Aging LSB &amp; Temp Trim</button>
    </div>

    <label style="margin-top:10px"><b>GPS Geodetic Benchmark &amp; CEP50 Scatter Capture</b> (Default UTP: 4.79520, -75.68860, 1445m)</label>
    <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:6px">
      <input type="number" step="0.000001" id="gRefLat" value="4.795200">
      <input type="number" step="0.000001" id="gRefLon" value="-75.688600">
      <input type="number" step="0.1" id="gRefAlt" value="1445.0">
    </div>
    <div style="margin-top:8px;display:flex;gap:8px;flex-wrap:wrap">
      <button onclick="applyGpsRef()">Capture GPS Benchmark &amp; Compute CEP50</button>
      <button class="sec" onclick="loadSdList()">List Preserved SD CSVs</button>
    </div>
  </div>

  <div class="card">
    <h2>5. DS18B20 1-Wire Thermal Probe Calibration (Free Pins: IO15, IO6, IO7, IO16, IO8)</h2>
    <div class="kv">
      <div class="box"><div class="k">Active Pin / Probes</div><div class="v" id="dsPin">--</div></div>
      <div class="box"><div class="k">Controller T_ctrl</div><div class="v" id="dsCtrl" style="color:#f59e0b">-- °C</div></div>
      <div class="box"><div class="k">Motor T_motor</div><div class="v" id="dsMot">-- °C</div></div>
    </div>
    <div class="row2">
      <input type="number" step="0.01" id="dsRefT" placeholder="Ref Temp (°C) e.g. 0.00 or 28.0">
      <input type="number" step="1" id="dsGpio" placeholder="Pin (15, 6, 7, 16, or 8)">
    </div>
    <div style="margin-top:8px;display:flex;gap:8px;flex-wrap:wrap">
      <button onclick="applyDsRef()">Calibrate DS18B20 to Ref °C</button>
      <button class="ok" onclick="gnssCmd('/cal/ds18/shtsync')">Sync DS18B20 to SHT31 °C</button>
      <button class="sec" onclick="setDsPin()">Scan / Set Pin</button>
      <button class="sec" onclick="gnssCmd('/cal/ds18/swap')">Swap Ctrl/Motor</button>
      <button class="warn" onclick="gnssCmd('/cal/ds18/reset')">Reset DS18 Cal</button>
    </div>
  </div>

  <div class="card">
    <h2>6. TI INA226 / INA228 48V DC Battery Calibration (SDA=IO6, SCL=IO7)</h2>
    <div class="kv">
      <div class="box"><div class="k">Chip &amp; Bus V</div><div class="v" id="inaChipV" style="color:#facc15">--</div></div>
      <div class="box"><div class="k">Current / Shunt</div><div class="v" id="inaCurS" style="color:#38bdf8">--</div></div>
      <div class="box"><div class="k">Power / Energy</div><div class="v" id="inaPowE" style="color:#10b981">--</div></div>
    </div>
    <div class="row2">
      <input type="number" step="0.0001" id="inaShunt" placeholder="Shunt Ohms (e.g. 0.100 or 0.00075)">
      <input type="number" step="0.01" id="inaDiv" placeholder="VBUS Divider (1.0=INA228, 2.0=INA226)">
      <input type="number" step="0.01" id="inaRefV" placeholder="Multimeter Ref V (e.g. 51.40)">
      <input type="number" step="0.01" id="inaRefA" placeholder="Clamp Ref Amps (optional)">
    </div>
    <div style="margin-top:8px;display:flex;gap:8px;flex-wrap:wrap">
      <button class="ok" onclick="gnssCmd('/cal/ina/zero')">Zero Current Tare (0A)</button>
      <button onclick="applyInaShunt()">Save Shunt &amp; Divider</button>
      <button onclick="applyInaRef()">Calibrate V / A to Multimeter</button>
      <button class="sec" onclick="gnssCmd('/cal/ina/energy')">Reset Wh</button>
      <button class="warn" onclick="gnssCmd('/cal/ina/reset')">Reset INA</button>
    </div>
  </div>

  <div class="card" style="grid-column:1/-1">
    <h2>7. Live Multi-Sensor Calibration Certificates, Quad-Bus Scan &amp; Preserved SD CSVs</h2>
    <pre id="diagOut">Loading /diag hardware &amp; calibration report...</pre>
  </div>
</div>
)rawliteral"
R"rawliteral(
<script>
const $=id=>document.getElementById(id);
async function poll(){
  try{
    const r=await fetch('/status');const d=await r.json();
    $('wifiBadge').innerText='SSID: '+(d.wifi_ssid||'AP')+' ('+(d.rssi||0)+'dBm) | Cloud: '+(d.cloud||0);
    $('rawT').innerText=(d.sht_raw_t??0).toFixed(2)+' °C';
    $('calT').innerText=(d.sht_temp??0).toFixed(2)+' °C';
    $('dewT').innerText=(d.dew_point??0).toFixed(2)+' °C';
    $('rawH').innerText=(d.sht_raw_h??0).toFixed(2)+' %';
    $('calH').innerText=(d.sht_hum??0).toFixed(2)+' %';
    $('vpd').innerText=(d.vpd_kpa??0).toFixed(2)+' kPa / '+(d.abs_hum??0).toFixed(1)+'g';
    $('sigma').innerText='±'+(d.sht_sig_t??0).toFixed(3)+'C / ±'+(d.sht_sig_h??0).toFixed(2)+'%';
    $('margin').innerText=(d.cond_margin??0).toFixed(1)+' °C';
    $('margin').style.color=(d.cond_margin??10)<2.0?'#ef4444':'#38bdf8';
    $('crc').innerText=(d.sht_crc_ok??0)+' / '+(d.sht_crc_err??0);
    $('rtcT').innerText=(d.rtc_temp??0).toFixed(2)+' °C';
    $('bmiT').innerText=(d.gyro_temp??0).toFixed(1)+' °C';
    $('settle').innerText=d.sht_settled?'SETTLED':'WARMING';
    $('settle').style.color=d.sht_settled?'#10b981':'#f59e0b';

    $('gFix').innerText=d.fix>=2?(d.fix+'D LOCK'):'SEARCHING';
    $('gFix').style.color=d.fix>=2?'#10b981':'#f59e0b';
    $('gSats').innerText=(d.sats||0)+' / '+(d.sats_view||0);
    $('gSnr').innerText=(d.cn0_max||0)+' dBHz | '+(d.hdop??99).toFixed(1);
    $('gLat').innerText=(d.lat||0).toFixed(6);
    $('gLon').innerText=(d.lon||0).toFixed(6);
    $('gAlt').innerText=(d.alt||0).toFixed(1)+'m | '+(d.spd||0).toFixed(1)+'km/h';
    $('gConst').innerText='G:'+(d.gps_sv||0)+' B:'+(d.bds_sv||0)+' R:'+(d.glo_sv||0)+' E:'+(d.gal_sv||0);
    $('gUtp').innerText=(d.utp_dist_m>=0)?(d.utp_dist_m.toFixed(0)+' m'):'Wait Fix';
    const pl=['UNCONFIRMED (NO FIX)','UTP CAMPUS CONFIRMED','PEREIRA METRO','VALID GNSS FIX'];
    $('gPlace').innerText=pl[d.place_ok||0];
    $('gPlace').style.color=(d.place_ok===1)?'#10b981':(d.place_ok>=2?'#38bdf8':'#f59e0b');
    $('dsPin').innerText=d.ds18_ok?('GPIO '+d.ds18_pin+' ('+d.ds18_cnt+'x)'):'Auto-Scan';
    $('dsCtrl').innerText=d.ds18_ok?(d.ds18_ctrl||0).toFixed(2)+' °C':'No Probe';
    $('dsMot').innerText=(d.ds18_cnt>=2)?(d.ds18_mot||0).toFixed(2)+' °C':'--';
    const cn=d.ina_chip===2?'INA228':(d.ina_chip===1?'INA226':'NO ACK');
    $('inaChipV').innerText=d.ina_ok?(cn+' '+(d.ina_v||0).toFixed(2)+'V'):'NO ACK (IO6/7)';
    $('inaCurS').innerText=d.ina_ok?((d.ina_a||0).toFixed(2)+'A / '+(d.ina_shunt_mv||0).toFixed(2)+'mV'):'--';
    $('inaPowE').innerText=d.ina_ok?((d.ina_w||0).toFixed(1)+'W / '+(d.ina_wh||0).toFixed(2)+'Wh'):'--';
  }catch(e){}
}
async function loadDiag(){
  try{
    const r=await fetch('/diag');const j=await r.json();
    $('diagOut').innerText=JSON.stringify(j,null,2);
    if(j.calibration){
      $('tSlope').value=j.calibration.temp_slope;
      $('tOff').value=j.calibration.temp_offset;
      $('hSlope').value=j.calibration.hum_slope;
      $('hOff').value=j.calibration.hum_offset;
      $('psyCpl').checked=!!j.calibration.psychro_coupling;
    }
  }catch(e){}
}
async function apply1Pt(){
  const rt=$('refT').value,rh=$('refH').value;
  const r=await fetch('/cal/onepoint?ref_temp='+encodeURIComponent(rt)+'&ref_hum='+encodeURIComponent(rh),{method:'POST'});
  $('diagOut').innerText=await r.text();loadDiag();poll();
}
async function applyManual(){
  const q='t_slope='+$('tSlope').value+'&t_off='+$('tOff').value+'&h_slope='+$('hSlope').value+'&h_off='+$('hOff').value+'&psy='+($('psyCpl').checked?1:0);
  const r=await fetch('/cal/params?'+q,{method:'POST'});
  $('diagOut').innerText=await r.text();loadDiag();poll();
}
async function resetCal(){
  const r=await fetch('/cal/reset',{method:'POST'});
  $('diagOut').innerText=await r.text();loadDiag();poll();
}
async function runHeater(){
  $('diagOut').innerText='Running 1.5s CMOSens Heater Plausibility Pulse...';
  const r=await fetch('/cal/heater',{method:'POST'});
  $('diagOut').innerText=await r.text();poll();
}
async function gnssCmd(u){
  $('diagOut').innerText='Executing '+u+' ...';
  const r=await fetch(u,{method:'POST'});
  $('diagOut').innerText=await r.text();poll();
}
async function applyRtcTrim(){
  const a=$('rtcAge').value||0,t=$('rtcToff').value||0;
  const r=await fetch('/cal/rtc/trim?aging='+encodeURIComponent(a)+'&t_off='+encodeURIComponent(t),{method:'POST'});
  $('diagOut').innerText=await r.text();poll();
}
async function applyGpsRef(){
  const q='lat='+$('gRefLat').value+'&lon='+$('gRefLon').value+'&alt='+$('gRefAlt').value;
  const r=await fetch('/cal/gps/ref?'+q,{method:'POST'});
  $('diagOut').innerText=await r.text();poll();
}
async function loadSdList(){
  const r=await fetch('/sd/list');
  $('diagOut').innerText=JSON.stringify(await r.json(),null,2);
}
async function applyDsRef(){
  const rt=$('dsRefT').value;
  const r=await fetch('/cal/ds18/onepoint?idx=0&ref_temp='+encodeURIComponent(rt),{method:'POST'});
  $('diagOut').innerText=await r.text();poll();
}
async function setDsPin(){
  const g=$('dsGpio').value||'';
  const r=await fetch('/cal/ds18/pin'+(g?('?gpio='+encodeURIComponent(g)):''),{method:'POST'});
  $('diagOut').innerText=await r.text();poll();
}
async function applyInaShunt(){
  const sh=$('inaShunt').value,dv=$('inaDiv').value;
  let q=[];if(sh)q.push('shunt='+encodeURIComponent(sh));if(dv)q.push('div='+encodeURIComponent(dv));
  const r=await fetch('/cal/ina/shunt?'+q.join('&'),{method:'POST'});
  $('diagOut').innerText=await r.text();poll();
}
async function applyInaRef(){
  const rv=$('inaRefV').value,ra=$('inaRefA').value;
  const r=await fetch('/cal/ina/ref?ref_v='+encodeURIComponent(rv)+'&ref_a='+encodeURIComponent(ra),{method:'POST'});
  $('diagOut').innerText=await r.text();poll();
}
setInterval(poll,1000);poll();loadDiag();
</script>
</body>
</html>)rawliteral"
;

#endif
