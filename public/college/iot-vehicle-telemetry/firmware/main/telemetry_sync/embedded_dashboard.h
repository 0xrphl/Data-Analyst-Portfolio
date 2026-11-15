/**
 * embedded_dashboard.h
 * Zero-CDN, Offline-Proof 30 Hz Real-Time Instrumentation Dashboard Served Directly by ESP32-S3
 */
#ifndef EMBEDDED_DASHBOARD_H
#define EMBEDDED_DASHBOARD_H

#include <Arduino.h>

const char KART_EMBEDDED_HTML[] PROGMEM = R"rawliteral(<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>ESP32-S3 Real-Time 3D Cube, SHT31 Chart &amp; GPS Telemetry</title>
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <style>
    *{box-sizing:border-box;margin:0;padding:0;font-family:'Segoe UI',system-ui,monospace}
    body{background:#060911;color:#f1f5f9;min-height:100vh;display:flex;flex-direction:column}
    header{background:#0d1322;border-bottom:1px solid #1e293b;display:flex;align-items:center;justify-content:space-between;padding:8px 14px;flex-wrap:wrap;gap:8px}
    .b{background:#0284c7;color:#fff;font-size:10px;font-weight:700;padding:3px 7px;border-radius:4px}
    .btn{background:#059669;color:#fff;border:none;font-size:11px;font-weight:700;padding:5px 10px;border-radius:5px;cursor:pointer;text-decoration:none}
    .btn.sec{background:#334155}
    .grid{flex:1;display:grid;grid-template-columns:1fr 1.15fr 355px;gap:8px;padding:8px}
    @media(max-width:1050px){.grid{grid-template-columns:1fr}}
    .col{display:flex;flex-direction:column;gap:8px}
    .box{position:relative;background:#0b1120;border:1px solid rgba(56,189,248,0.25);border-radius:10px;overflow:hidden;min-height:250px;flex:1;display:flex;flex-direction:column}
    .bhdr{display:flex;justify-content:space-between;align-items:center;padding:6px 10px;background:#0f172a;border-bottom:1px solid #1e293b;font-size:11px;font-weight:700;color:#94a3b8}
    canvas{width:100%;flex:1;display:block}
    .side{display:flex;flex-direction:column;gap:7px}
    .card{background:#0f172a;border:1px solid rgba(56,189,248,0.22);border-radius:10px;padding:9px}
    .lbl{font-size:10px;color:#94a3b8;text-transform:uppercase;font-weight:700;margin-bottom:5px;display:flex;justify-content:space-between}
    .g3{display:grid;grid-template-columns:repeat(3,1fr);gap:5px;text-align:center}
    .g4{display:grid;grid-template-columns:repeat(4,1fr);gap:4px;text-align:center}
    .p{background:#090d16;border:1px solid #1e293b;border-radius:6px;padding:5px 3px}
    .p .k{font-size:9px;color:#64748b;font-weight:700}
    .p .v{font-size:12.5px;font-weight:800;color:#38bdf8;margin-top:2px}
  </style>
</head>
<body>
  <header>
    <div><span class="b">ESP32-S3 REAL-TIME 30Hz</span> <b style="font-size:14px;margin-left:6px">3D BMI160 Cube + Live SHT31 Temp/Humidity Chart + RTC + GNSS</b></div>
    <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap">
      <button class="btn sec" onclick="tareCube()">Zero / Tare 3D Cube</button>
      <a class="btn" href="/cal">⚙ Calibrate All 4 Sensors</a>
      <div id="st" style="font-size:12px;color:#10b981;font-weight:700">Connecting...</div>
    </div>
  </header>
  <div class="grid">
    <div class="col">
      <div class="box">
        <div class="bhdr"><span>BMI160 6-DOF REAL-TIME 3D CUBE (30 Hz)</span><span id="hzLbl" style="color:#38bdf8">0 Hz</span></div>
        <canvas id="c3d"></canvas>
      </div>
      <div class="box" style="max-height:220px">
        <div class="bhdr"><span>MULTI-GNSS POSITION &amp; UTP RADAR (1 Hz)</span><span id="placeHdr" style="color:#f59e0b">SCANNING</span></div>
        <canvas id="cGps"></canvas>
      </div>
    </div>

    <div class="col">
      <div class="box">
        <div class="bhdr">
          <span>REAL-TIME SHT31, DS18B20 &amp; HUMIDITY CHART</span>
          <span><b style="color:#10b981">■ SHT °C</b> &nbsp;<b style="color:#f59e0b">■ DS18 °C</b> &nbsp;<b style="color:#38bdf8">■ %RH</b> &nbsp;<b style="color:#a78bfa">■ Dew</b></span>
        </div>
        <canvas id="cChart"></canvas>
      </div>
      <div class="card">
        <div class="lbl"><span>DS3231 Clock Battery Module + GPS Position Readout</span><span id="rtcBadge" style="color:#f59e0b">RTC CHK</span></div>
        <div class="g3">
          <div class="p"><div class="k">UTC Date &amp; Time</div><div class="v" id="utcTs" style="font-size:11px;color:#f8fafc">--</div></div>
          <div class="p"><div class="k">Colombia (UTC-5)</div><div class="v" id="colTs" style="color:#fde047">--</div></div>
          <div class="p"><div class="k">Boot # / SD CSV</div><div class="v" id="bootSd">--</div></div>
          <div class="p"><div class="k">GPS Latitude</div><div class="v" id="latV">--</div></div>
          <div class="p"><div class="k">GPS Longitude</div><div class="v" id="lonV">--</div></div>
          <div class="p"><div class="k">Alt / UTP Dist</div><div class="v" id="altUtp">--</div></div>
        </div>
      </div>
    </div>
    <div class="side">
      <div class="card">
        <div class="lbl"><span>Red SHT31 (IO40/39) + DS18B20 1-Wire</span><span id="crcLbl" style="color:#10b981">CRC OK</span></div>
        <div class="g4">
          <div class="p"><div class="k">SHT Temp</div><div class="v" id="stemp" style="color:#10b981">--</div></div>
          <div class="p"><div class="k">SHT %RH</div><div class="v" id="shum" style="color:#38bdf8">--</div></div>
          <div class="p"><div class="k">Dew/VPD</div><div class="v" id="sdew" style="color:#a78bfa;font-size:10px">--</div></div>
          <div class="p"><div class="k">DS18 Ctrl</div><div class="v" id="ds18t" style="color:#f59e0b">--</div></div>
        </div>
      </div>
      <div class="card">
        <div class="lbl"><span>48V DC Pack (INA226/228 IO6/7) + 18650</span><span id="wifiLbl">--</span></div>
        <div class="g4">
          <div class="p"><div class="k">48V Bus</div><div class="v" id="inaV" style="color:#facc15">-- V</div></div>
          <div class="p"><div class="k">48V Amps</div><div class="v" id="inaA" style="color:#38bdf8">-- A</div></div>
          <div class="p"><div class="k">48V Power</div><div class="v" id="inaW" style="color:#10b981">-- W</div></div>
          <div class="p"><div class="k">18650 V</div><div class="v" id="vb" style="color:#a78bfa">-- V</div></div>
        </div>
        <div class="g3" style="margin-top:4px">
          <div class="p"><div class="k">Energy Wh</div><div class="v" id="inaWh">-- Wh</div></div>
          <div class="p"><div class="k">BMI160 Temp</div><div class="v" id="gt" style="color:#f43f5e">-- °C</div></div>
          <div class="p"><div class="k">DS3231 Temp</div><div class="v" id="rt">-- °C</div></div>
        </div>
      </div>
      <div class="card">
        <div class="lbl"><span>3D Attitude &amp; BMI160 Gyro / Accel</span></div>
        <div class="g3" style="margin-bottom:5px">
          <div class="p"><div class="k">Roll</div><div class="v" id="ro">0.0°</div></div>
          <div class="p"><div class="k">Pitch</div><div class="v" id="pi">0.0°</div></div>
          <div class="p"><div class="k">Yaw</div><div class="v" id="ya">0.0°</div></div>
        </div>
        <div class="g3">
          <div class="p"><div class="k">Gx/Gy/Gz (°/s)</div><div class="v" id="gxyz" style="font-size:10.5px">0/0/0</div></div>
          <div class="p"><div class="k">Ax/Ay/Az (g)</div><div class="v" id="axyz" style="font-size:10.5px">0/0/1</div></div>
          <div class="p"><div class="k">PeakG / Vib</div><div class="v" id="pkv" style="font-size:10.5px">1.00g</div></div>
        </div>
      </div>
      <div class="card">
        <div class="lbl"><span>GNSS Satellites, SD &amp; Cloud</span></div>
        <div class="g3">
          <div class="p"><div class="k">Sats Use/View</div><div class="v" id="sa">0 / 0</div></div>
          <div class="p"><div class="k">SNR / HDOP</div><div class="v" id="snrh">0 dB</div></div>
          <div class="p"><div class="k">Cloud Sent</div><div class="v" id="cl">0</div></div>
        </div>
      </div>
      <div class="card">
        <div class="lbl"><span>10-Sensor Boot &amp; Live Self-Test</span><a href="/sd/list" target="_blank" style="color:#38bdf8;font-size:9px">SD CSVs ↗</a></div>
        <div class="g4" id="bist">
          <div class="p"><div class="k">Wi-Fi</div><div class="v" id="t-wifi">--</div></div>
          <div class="p"><div class="k">4G</div><div class="v" id="t-4g">--</div></div>
          <div class="p"><div class="k">GNSS</div><div class="v" id="t-gnss">--</div></div>
          <div class="p"><div class="k">INA48V</div><div class="v" id="t-ina">--</div></div>
          <div class="p"><div class="k">SHT31</div><div class="v" id="t-sht">--</div></div>
          <div class="p"><div class="k">DS18</div><div class="v" id="t-ds18">--</div></div>
          <div class="p"><div class="k">BMI160</div><div class="v" id="t-imu">--</div></div>
          <div class="p"><div class="k">18650</div><div class="v" id="t-bat">--</div></div>
          <div class="p"><div class="k">DS3231</div><div class="v" id="t-rtc">--</div></div>
          <div class="p"><div class="k">32G SD</div><div class="v" id="t-sd">--</div></div>
        </div>
      </div>
    </div>
  </div>
)rawliteral"

R"rawliteral(
  <script>
    const $=id=>document.getElementById(id);
    let roll=0,pitch=0,yaw=0,tRoll=0,tPitch=0,tYaw=0,pktCnt=0,wsAlive=false;
    const MAX_PT=120,histT=[],histH=[],histD=[],histDs=[],gpsTrail=[];
    function tareCube(){tRoll=roll;tPitch=pitch;tYaw=yaw;fetch('/cal/imu/tare',{method:'POST'}).catch(()=>{});}

    function fitCanvas(cv){
      const w=cv.clientWidth||320,h=cv.clientHeight||220;
      if(cv.width!==w||cv.height!==h){cv.width=w;cv.height=h;}
      return {ctx:cv.getContext('2d'),w,h};
    }

    // 1. Zero-CDN Real-Time 3D Perspective Cube + X/Y/Z Chassis Axes (60 FPS)
    const V=[[-1,-0.45,-1.3],[1,-0.45,-1.3],[1,0.45,-1.3],[-1,0.45,-1.3],[-1,-0.45,1.3],[1,-0.45,1.3],[1,0.45,1.3],[-1,0.45,1.3]];
    const F=[[0,1,2,3,'rgba(56,189,248,0.35)'],[4,5,6,7,'rgba(16,185,129,0.38)'],[0,4,7,3,'rgba(99,102,241,0.28)'],
             [1,5,6,2,'rgba(244,63,94,0.28)'],[3,2,6,7,'rgba(14,165,233,0.45)'],[0,1,5,4,'rgba(30,41,59,0.55)']];
    function rot3(x,y,z,rx,ry,rz){
      let cy=Math.cos(ry),sy=Math.sin(ry),x1=x*cy+z*sy,z1=-x*sy+z*cy;
      let cx=Math.cos(rx),sx=Math.sin(rx),y2=y*cx-z1*sx,z2=y*sx+z1*cx;
      let cz=Math.cos(rz),sz=Math.sin(rz);
      return [x1*cz-y2*sz, x1*sz+y2*cz, z2];
    }
    function draw3dCube(){
      const {ctx,w,h}=fitCanvas($('c3d'));
      ctx.clearRect(0,0,w,h);
      const rx=((pitch-tPitch)*Math.PI)/180, ry=((yaw-tYaw)*Math.PI)/180, rz=((roll-tRoll)*Math.PI)/180;
      const sc=Math.min(w,h)*0.34, cx=w/2, cy=h/2+8;
      ctx.strokeStyle='#1e293b';ctx.lineWidth=1;
      for(let i=-3;i<=3;i++){ctx.beginPath();ctx.moveTo(cx-130,cy+65+i*12);ctx.lineTo(cx+130,cy+65+i*12);ctx.stroke();}
      const P=V.map(v=>{const r=rot3(v[0],v[1],v[2],rx+0.32,ry-0.45,rz);const d=3.8/(3.8+r[2]);return [cx+r[0]*sc*d,cy-r[1]*sc*d,r[2]];});
      const order=F.map(f=>({f,z:(P[f[0]][2]+P[f[1]][2]+P[f[2]][2]+P[f[3]][2])/4})).sort((a,b)=>b.z-a.z);
      order.forEach(({f})=>{
        ctx.beginPath();ctx.moveTo(P[f[0]][0],P[f[0]][1]);
        for(let k=1;k<4;k++)ctx.lineTo(P[f[k]][0],P[f[k]][1]);
        ctx.closePath();ctx.fillStyle=f[4];ctx.fill();ctx.strokeStyle='#38bdf8';ctx.lineWidth=1.8;ctx.stroke();
      });
      [[1.6,0,0,'#f43f5e','X'],[0,1.2,0,'#10b981','Y'],[0,0,1.8,'#fde047','FWD']].forEach(a=>{
        const o=rot3(0,0,0,rx+0.32,ry-0.45,rz),e=rot3(a[0],a[1],a[2],rx+0.32,ry-0.45,rz);
        const d0=3.8/(3.8+o[2]),d1=3.8/(3.8+e[2]);
        ctx.beginPath();ctx.moveTo(cx+o[0]*sc*d0,cy-o[1]*sc*d0);ctx.lineTo(cx+e[0]*sc*d1,cy-e[1]*sc*d1);
        ctx.strokeStyle=a[3];ctx.lineWidth=2.5;ctx.stroke();
        ctx.fillStyle=a[3];ctx.font='bold 11px monospace';ctx.fillText(a[4],cx+e[0]*sc*d1+4,cy-e[1]*sc*d1);
      });
    }

    // 2. Real-Time Scrolling SHT31 Temp, Humidity & Dew Point Chart
    function drawChart(){
      const {ctx,w,h}=fitCanvas($('cChart'));
      ctx.clearRect(0,0,w,h);
      const padL=36,padR=36,padT=14,padB=20,pw=w-padL-padR,ph=h-padT-padB;
      ctx.strokeStyle='#1e293b';ctx.lineWidth=1;
      for(let i=0;i<=4;i++){
        const y=padT+(ph*i/4);ctx.beginPath();ctx.moveTo(padL,y);ctx.lineTo(w-padR,y);ctx.stroke();
        ctx.fillStyle='#10b981';ctx.font='10px monospace';ctx.fillText((45-i*10)+'°',4,y+3);
        ctx.fillStyle='#38bdf8';ctx.fillText((100-i*25)+'%',w-padR+4,y+3);
      }
      function line(arr,minV,maxV,col){
        if(arr.length<2)return;
        ctx.beginPath();
        arr.forEach((v,i)=>{
          const x=padL+(i/(MAX_PT-1))*pw, y=padT+ph-Math.max(0,Math.min(1,(v-minV)/(maxV-minV)))*ph;
          if(i===0)ctx.moveTo(x,y);else ctx.lineTo(x,y);
        });
        ctx.strokeStyle=col;ctx.lineWidth=2.2;ctx.stroke();
      }
      line(histT,5,55,'#10b981');
      line(histDs,5,55,'#f59e0b');
      line(histD,5,55,'#a78bfa');
      line(histH,0,100,'#38bdf8');
    }
)rawliteral"
R"rawliteral(
    // 3. Offline-Proof GPS Radar & UTP Benchmark Plot
    function drawGpsRadar(lat,lon,fix){
      const {ctx,w,h}=fitCanvas($('cGps'));
      ctx.clearRect(0,0,w,h);
      const cx=w/2,cy=h/2,rad=Math.min(w,h)*0.40;
      ctx.strokeStyle='#1e293b';ctx.lineWidth=1;
      [0.33,0.66,1].forEach(k=>{ctx.beginPath();ctx.arc(cx,cy,rad*k,0,Math.PI*2);ctx.stroke();});
      ctx.beginPath();ctx.moveTo(cx-rad,cy);ctx.lineTo(cx+rad,cy);ctx.moveTo(cx,cy-rad);ctx.lineTo(cx,cy+rad);ctx.stroke();
      ctx.fillStyle='#64748b';ctx.font='10px monospace';ctx.fillText('UTP REF (4.7952,-75.6886)',8,14);
      if(gpsTrail.length>1){
        ctx.beginPath();
        gpsTrail.forEach((p,i)=>{
          const dx=Math.max(-rad,Math.min(rad,(p[1]+75.6886)*111320*0.08));
          const dy=Math.max(-rad,Math.min(rad,(p[0]-4.7952)*110574*0.08));
          if(i===0)ctx.moveTo(cx+dx,cy-dy);else ctx.lineTo(cx+dx,cy-dy);
        });
        ctx.strokeStyle='#38bdf8';ctx.lineWidth=2;ctx.stroke();
      }
      const px=cx+Math.max(-rad,Math.min(rad,((lon||-75.6886)+75.6886)*111320*0.08));
      const py=cy-Math.max(-rad,Math.min(rad,((lat||4.7952)-4.7952)*110574*0.08));
      ctx.beginPath();ctx.arc(px,py,6,0,Math.PI*2);ctx.fillStyle=fix>=2?'#10b981':'#f59e0b';ctx.fill();
    }

    let lastChartMs=0;
    function ingest(d){
      pktCnt++;
      roll=d.roll||0;pitch=d.pitch||0;yaw=d.yaw||0;
      const now=Date.now();
      if(now-lastChartMs>=400){
        lastChartMs=now;
        if(d.sht_ok){
          histT.push(d.sht_temp||0);if(histT.length>MAX_PT)histT.shift();
          histH.push(d.sht_hum||0);if(histH.length>MAX_PT)histH.shift();
          histD.push(d.dew_point||0);if(histD.length>MAX_PT)histD.shift();
        }
        if(d.ds18_ok){histDs.push(d.ds18_ctrl||0);if(histDs.length>MAX_PT)histDs.shift();}
        drawChart();
        drawGpsRadar(d.lat,d.lon,d.fix||0);
      }
      if(d.fix>=2&&d.lat){gpsTrail.push([d.lat,d.lon]);if(gpsTrail.length>80)gpsTrail.shift();}
      $('stemp').innerText=d.sht_ok?(d.sht_temp||0).toFixed(2)+'°':'NO ACK';
      $('shum').innerText=d.sht_ok?(d.sht_hum||0).toFixed(1)+'%':'--';
      $('sdew').innerText=d.sht_ok?(d.dew_point||0).toFixed(1)+'°/'+(d.vpd_kpa||0).toFixed(2)+'k':'--';
      $('ds18t').innerText=d.ds18_ok?((d.ds18_ctrl||0).toFixed(2)+'° (IO'+d.ds18_pin+')'):'SCAN';
      $('crcLbl').innerText='CRC:'+(d.sht_crc_ok||0)+'/'+(d.sht_crc_err||0);
      $('inaV').innerText=d.ina_ok?(d.ina_v||0).toFixed(2)+'V':'NO ACK';
      $('inaA').innerText=d.ina_ok?(d.ina_a||0).toFixed(2)+'A':'--';
      $('inaW').innerText=d.ina_ok?(d.ina_w||0).toFixed(1)+'W':'--';
      $('inaWh').innerText=d.ina_ok?(d.ina_wh||0).toFixed(2)+'Wh':'--';
      $('vb').innerText=(d.vbat_v||0).toFixed(2)+'V';
      $('gt').innerText=(d.gyro_temp||0).toFixed(1)+'°C';
      $('rt').innerText=(d.rtc_temp||0).toFixed(2)+'°C';
      $('wifiLbl').innerText=(d.wifi_ssid||'AP')+' '+(d.rssi||0)+'dBm';
      $('ro').innerText=roll.toFixed(1)+'°';$('pi').innerText=pitch.toFixed(1)+'°';$('ya').innerText=yaw.toFixed(1)+'°';
      $('gxyz').innerText=(d.gx||0).toFixed(1)+'/'+(d.gy||0).toFixed(1)+'/'+(d.gz||0).toFixed(1);
      $('axyz').innerText=(d.ax||0).toFixed(2)+'/'+(d.ay||0).toFixed(2)+'/'+(d.az||0).toFixed(2);
      $('pkv').innerText=(d.peak_g||1).toFixed(2)+'g / '+(d.vib||0).toFixed(3);
      $('sa').innerText=(d.sats||0)+' / '+(d.sats_view||0);
      $('snrh').innerText=(d.cn0_max||0)+'dB / '+(d.hdop||99).toFixed(1);
      $('cl').innerText=(d.cloud||0);
      $('utcTs').innerText=(d.ts||'--').replace('T',' ');
      try{
        const dt=new Date(d.ts);
        if(!isNaN(dt.getTime())){
          const col=new Date(dt.getTime()-5*3600000);
          $('colTs').innerText=col.toISOString().substr(11,8);
        }
      }catch(_){}
      $('rtcBadge').innerText=d.rtc_ok?'DS3231 OK':(d.ntp_ok?'NTP UTC':'UPTIME');
      $('rtcBadge').style.color=d.rtc_ok?'#10b981':'#f59e0b';
      $('bootSd').innerText='#'+(d.boot||1)+' / '+(d.sd_kb||0)+'KB';
      $('latV').innerText=(d.lat||0).toFixed(6);$('lonV').innerText=(d.lon||0).toFixed(6);
      $('altUtp').innerText=(d.alt||0).toFixed(0)+'m | '+(d.utp_dist_m>=0?d.utp_dist_m.toFixed(0)+'m':'NoFix');
      const pl=['SCANNING SKY ('+(d.cn0_max||0)+' dBHz)','UTP CAMPUS CONFIRMED','PEREIRA METRO LOCK','GNSS 3D LOCK'];
      $('placeHdr').innerText=pl[d.place_ok||0];
      $('placeHdr').style.color=d.place_ok===1?'#10b981':(d.place_ok>=2?'#38bdf8':'#f59e0b');
    }

    function loop3d(){requestAnimationFrame(loop3d);draw3dCube();}loop3d();
    setInterval(()=>{$('hzLbl').innerText=pktCnt+' Hz';pktCnt=0;},1000);

    function connWs(){
      try{
        const ws=new WebSocket('ws://'+location.hostname+':81');
        ws.onopen=()=>{wsAlive=true;$('st').innerText='WS 30Hz LIVE (:81)';};
        ws.onmessage=e=>{wsAlive=true;ingest(JSON.parse(e.data));};
        ws.onclose=()=>{wsAlive=false;setTimeout(connWs,2000);};
        ws.onerror=()=>{wsAlive=false;};
      }catch(_){wsAlive=false;}
    }connWs();

    setInterval(async()=>{
      if(wsAlive)return;
      try{const r=await fetch('/status');const d=await r.json();$('st').innerText='HTTP LIVE (/status)';ingest(d);}catch(_){}
    },125);

    async function refreshBist(){
      try{
        const r=await fetch('/test');const t=await r.json();
        const setB=(id,o)=>{const el=$(id);if(el&&o){el.innerText=o.ok?'PASS':'CHK';el.style.color=o.ok?'#10b981':'#f59e0b';el.title=o.info||'';}};
        setB('t-wifi',t.wifi);setB('t-4g',t['4g_lte']);setB('t-gnss',t.gnss_gps);setB('t-ina',t.ina_48v_dc);
        setB('t-sht',t.sht31_env);setB('t-ds18',t.ds18b20_probe);
        setB('t-imu',t.gyro_bmi160);setB('t-bat',t.battery_18650);setB('t-rtc',t.rtc_ds3231);setB('t-sd',t.sd_32gb);
      }catch(_){}
    }
    refreshBist();setInterval(refreshBist,5000);
  </script>
</body>
</html>)rawliteral"
;

#endif
