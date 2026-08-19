(function(){
'use strict';
var PEREIRA=[4.810,-75.695];
var TILE_DARK='https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';
var TILE_LIGHT='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
var loraNodes=[
{id:'GW1',name:'Centro',lat:4.8133,lng:-75.6961,type:'GW',range:3500},
{id:'GW2',name:'Dosquebradas',lat:4.839,lng:-75.673,type:'GW',range:3000},
{id:'GW3',name:'Cuba',lat:4.789,lng:-75.715,type:'GW',range:3000},
{id:'R1',name:'Circunvalar',lat:4.805,lng:-75.685,type:'RP',range:2500},
{id:'R2',name:'UTP',lat:4.792,lng:-75.689,type:'RP',range:2500},
{id:'R3',name:'Boston',lat:4.785,lng:-75.702,type:'RP',range:2500},
{id:'R4',name:'Kennedy',lat:4.82,lng:-75.705,type:'RP',range:2500},
{id:'R5',name:'Perla',lat:4.778,lng:-75.688,type:'RP',range:2500},
{id:'R6',name:'V.Santana',lat:4.795,lng:-75.668,type:'RP',range:2500},
{id:'R7',name:'Alamos',lat:4.828,lng:-75.688,type:'RP',range:2500}
];
// Routes follow real Pereira streets
var routes={
// TRUCK-001: Cra 7 north → Calle 21 east → Cra 8 south → Calle 17 west (Centro loop)
'TRUCK-001':[
[4.81290,-75.69610],[4.81320,-75.69590],[4.81370,-75.69560],[4.81420,-75.69540],
[4.81470,-75.69510],[4.81520,-75.69480],[4.81560,-75.69450],
[4.81580,-75.69400],[4.81570,-75.69350],[4.81560,-75.69300],[4.81540,-75.69250],
[4.81500,-75.69230],[4.81450,-75.69250],[4.81400,-75.69270],[4.81350,-75.69300],
[4.81310,-75.69330],[4.81280,-75.69370],[4.81260,-75.69420],[4.81250,-75.69470],
[4.81260,-75.69530],[4.81280,-75.69580],[4.81290,-75.69610]
],
// TRUCK-002: Av 30 de Agosto south → Calle 50 → Cra 10 north (Cuba / Sur)
'TRUCK-002':[
[4.79500,-75.70550],[4.79440,-75.70510],[4.79380,-75.70470],[4.79310,-75.70420],
[4.79250,-75.70380],[4.79200,-75.70340],[4.79150,-75.70280],
[4.79140,-75.70210],[4.79160,-75.70140],[4.79190,-75.70080],[4.79230,-75.70020],
[4.79280,-75.69980],[4.79340,-75.69960],[4.79400,-75.69990],[4.79440,-75.70060],
[4.79470,-75.70130],[4.79490,-75.70210],[4.79500,-75.70300],[4.79510,-75.70380],
[4.79510,-75.70460],[4.79500,-75.70550]
],
// EV-001: Circunvalar loop (Av Circunvalar → UTP → back via Cra 27)
'EV-001':[
[4.80820,-75.69150],[4.80740,-75.69100],[4.80650,-75.69030],[4.80560,-75.68960],
[4.80470,-75.68900],[4.80380,-75.68860],[4.80290,-75.68840],
[4.80200,-75.68870],[4.80150,-75.68940],[4.80120,-75.69020],[4.80130,-75.69100],
[4.80170,-75.69170],[4.80230,-75.69230],[4.80310,-75.69270],[4.80400,-75.69280],
[4.80490,-75.69260],[4.80580,-75.69230],[4.80660,-75.69200],[4.80740,-75.69170],
[4.80820,-75.69150]
],
// TRUCK-003: Autopista del Cafe → Dosquebradas → back via bridge
'TRUCK-003':[
[4.83450,-75.67830],[4.83380,-75.67900],[4.83300,-75.67980],[4.83210,-75.68050],
[4.83120,-75.68120],[4.83030,-75.68180],[4.82940,-75.68240],
[4.82860,-75.68300],[4.82790,-75.68360],[4.82750,-75.68420],[4.82770,-75.68350],
[4.82850,-75.68280],[4.82940,-75.68200],[4.83040,-75.68120],[4.83130,-75.68050],
[4.83220,-75.67980],[4.83310,-75.67910],[4.83390,-75.67860],[4.83450,-75.67830]
],
// EV-002: Cuba Industrial → Av de las Americas → Cra 11 (southwest loop)
'EV-002':[
[4.78900,-75.71100],[4.78950,-75.71030],[4.79010,-75.70960],[4.79070,-75.70890],
[4.79120,-75.70810],[4.79160,-75.70730],[4.79180,-75.70640],
[4.79150,-75.70560],[4.79100,-75.70510],[4.79030,-75.70520],[4.78960,-75.70570],
[4.78900,-75.70640],[4.78850,-75.70720],[4.78810,-75.70800],[4.78790,-75.70880],
[4.78800,-75.70960],[4.78830,-75.71030],[4.78870,-75.71080],[4.78900,-75.71100]
]
};
var vehicles=[
{id:'TRUCK-001',name:'Camion Norte',type:'ICE',speed:42,amps:15.2,bat:95,rssi:-72,status:'online'},
{id:'TRUCK-002',name:'Camion Sur',type:'ICE',speed:0,amps:0,bat:88,rssi:-85,status:'idle'},
{id:'EV-001',name:'Electrico Centro',type:'EV',speed:35,amps:42.5,bat:67,rssi:-68,status:'online'},
{id:'TRUCK-003',name:'Camion Dosquebradas',type:'ICE',speed:55,amps:18.7,bat:92,rssi:-78,status:'online'},
{id:'EV-002',name:'Electrico Cuba',type:'EV',speed:28,amps:38.1,bat:45,rssi:-82,status:'online'}
];
vehicles.forEach(function(v){v.route=routes[v.id];v.ri=0;v.t=0;v.lat=v.route[0][0];v.lng=v.route[0][1];v.heading=0;v.trail=[];});

var map=L.map('map-3d',{center:PEREIRA,zoom:14,zoomControl:false,attributionControl:false});
var darkTile=L.tileLayer(TILE_DARK,{maxZoom:18}).addTo(map);
var lightTile=L.tileLayer(TILE_LIGHT,{maxZoom:18});
var isDark=true;
L.control.zoom({position:'topright'}).addTo(map);

function truckSVG(co,h){
var a=h||0;
var ev=co==='#42A5F5';
var body=ev?co:'#FF9800',dk=ev?'#2979FF':'#E65100',lt=ev?'#90CAF9':'#FFE0B2',cab=ev?'#1565C0':'#BF360C';
return '<svg width="48" height="48" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">'+
'<g transform="rotate('+a+' 24 24)">'+
'<ellipse cx="24" cy="40" rx="14" ry="4" fill="rgba(0,0,0,.35)"/>'+
'<polygon points="10,18 10,34 24,38 24,22" fill="'+dk+'" stroke="rgba(0,0,0,.3)" stroke-width=".5"/>'+
'<polygon points="38,18 38,34 24,38 24,22" fill="'+body+'" stroke="rgba(0,0,0,.2)" stroke-width=".5" opacity=".85"/>'+
'<polygon points="10,18 24,14 38,18 24,22" fill="'+lt+'" stroke="rgba(255,255,255,.3)" stroke-width=".5" opacity=".5"/>'+
'<polygon points="14,19 24,16 34,19 24,22" fill="'+cab+'" stroke="rgba(255,255,255,.4)" stroke-width=".7" opacity=".9"/>'+
'<polygon points="17,19.5 24,17 28,19 24,21" fill="rgba(255,255,255,.18)"/>'+
'<rect x="9" y="30" width="5" height="3" rx="1.5" fill="#333" stroke="#555" stroke-width=".5"/>'+
'<rect x="34" y="30" width="5" height="3" rx="1.5" fill="#333" stroke="#555" stroke-width=".5"/>'+
'<rect x="9" y="20" width="5" height="3" rx="1.5" fill="#333" stroke="#555" stroke-width=".5"/>'+
'<rect x="34" y="20" width="5" height="3" rx="1.5" fill="#333" stroke="#555" stroke-width=".5"/>'+
'<line x1="24" y1="14" x2="24" y2="10" stroke="'+body+'" stroke-width="1.5" stroke-linecap="round"/>'+
'<circle cx="24" cy="9" r="2" fill="'+body+'" opacity=".8"/>'+
'<circle cx="24" cy="9" r="4" fill="'+body+'" opacity=".2"/>'+
'<line x1="14" y1="25" x2="14" y2="33" stroke="rgba(255,255,255,.1)" stroke-width=".5"/>'+
'<line x1="34" y1="25" x2="34" y2="33" stroke="rgba(255,255,255,.08)" stroke-width=".5"/>'+
'</g></svg>';
}

var coverageCircles=[],covVis=false;
loraNodes.forEach(function(n){
  var gw=n.type==='GW',sz=gw?20:14,co=gw?'#E040FB':'#FF9800';
  var ic=L.divIcon({className:'',html:'<div style="width:'+sz+'px;height:'+sz+'px;background:'+co+';border:2px solid rgba(255,255,255,.8);border-radius:50%;box-shadow:0 0 10px '+co+'"></div>',iconSize:[sz,sz],iconAnchor:[sz/2,sz/2]});
  L.marker([n.lat,n.lng],{icon:ic}).bindTooltip(n.name+' ('+n.type+')',{className:'vehicle-tip',direction:'top',offset:[0,-10]}).addTo(map);
  coverageCircles.push(L.circle([n.lat,n.lng],{radius:n.range,color:co,fillColor:co,fillOpacity:.06,weight:1,dashArray:gw?'':'5,5',interactive:false}));
});

var vMarkers={},vTrails={},sel=null;
vehicles.forEach(function(v){
  var co=v.type==='EV'?'#42A5F5':'#FF9800';
  vMarkers[v.id]=L.marker([v.lat,v.lng],{icon:L.divIcon({className:'',html:truckSVG(co,0),iconSize:[48,48],iconAnchor:[24,24]}),zIndexOffset:1000}).bindTooltip(v.name+' '+v.speed+' km/h',{className:'vehicle-tip',direction:'top',offset:[0,-28]}).addTo(map);
  vTrails[v.id]=L.polyline([],{color:co,weight:3,opacity:.6,dashArray:'6,4',lineCap:'round'}).addTo(map);
  L.polyline(v.route,{color:co,weight:1.5,opacity:.18,dashArray:'3,6'}).addTo(map);
});

function lerp(a,b,t){return a+(b-a)*t;}
function angB(a,b,c,d){return Math.atan2(d-b,c-a)*(180/Math.PI);}

function tick(){
  vehicles.forEach(function(v){
    if(v.status==='idle')return;
    v.t+=0.003+(v.speed/60)*0.008;
    if(v.t>=1){v.t=0;v.ri=(v.ri+1)%(v.route.length-1);}
    var f=v.route[v.ri],to=v.route[(v.ri+1)%v.route.length];
    v.lat=lerp(f[0],to[0],v.t);
    v.lng=lerp(f[1],to[1],v.t);
    v.heading=angB(f[0],f[1],to[0],to[1]);
    v.amps=Math.max(0,v.amps+(Math.random()-.5)*1.5);
    v.speed=v.status==='idle'?0:Math.max(5,v.speed+(Math.random()-.5)*4);
    v.rssi=Math.round(v.rssi+(Math.random()-.5)*3);
    var co=v.type==='EV'?'#42A5F5':'#FF9800';
    var mk=vMarkers[v.id];
    mk.setLatLng([v.lat,v.lng]);
    mk.setIcon(L.divIcon({className:'',html:truckSVG(co,v.heading),iconSize:[48,48],iconAnchor:[24,24]}));
    mk.setTooltipContent(v.name+' '+Math.round(v.speed)+' km/h');
    v.trail.push([v.lat,v.lng]);
    if(v.trail.length>120)v.trail.shift();
    vTrails[v.id].setLatLngs(v.trail);
  });
}
setInterval(tick,80);

function renderSidebar(){
  var h='';
  vehicles.forEach(function(v){
    var a=sel===v.id?' active':'';
    h+='<div class="vehicle-card'+a+'" data-vid="'+v.id+'">'
    +'<div class="vc-header"><span class="dot '+v.status+'"></span><span class="name">'+v.name+'</span><span class="type-tag '+v.type.toLowerCase()+'">'+v.type+'</span></div>'
    +'<div class="metric-row"><div class="metric amps"><div class="val">'+v.amps.toFixed(1)+'A</div><div class="lbl">Amps</div></div><div class="metric speed"><div class="val">'+Math.round(v.speed)+'</div><div class="lbl">km/h</div></div></div>'
    +'<div class="metric-row"><div class="metric bat"><div class="val">'+v.bat+'%</div><div class="lbl">Battery</div></div><div class="metric rssi"><div class="val">'+v.rssi+'</div><div class="lbl">RSSI</div></div></div>'
    +'<div class="vc-coords">'+v.lat.toFixed(5)+', '+v.lng.toFixed(5)+'</div></div>';
  });
  document.getElementById('vehicle-list').innerHTML=h;
  document.querySelectorAll('.vehicle-card').forEach(function(el){
    el.addEventListener('click',function(){
      var vid=this.getAttribute('data-vid');
      sel=sel===vid?null:vid;
      renderSidebar();
      if(sel){var v=vehicles.find(function(x){return x.id===vid;});map.flyTo([v.lat,v.lng],16,{duration:.8});}
      else{map.flyTo(PEREIRA,14,{duration:.6});}
    });
  });
}
renderSidebar();
setInterval(renderSidebar,500);

document.getElementById('btn-3d').addEventListener('click',function(){
  this.classList.toggle('active');
  document.getElementById('map-3d').classList.toggle('flat');
  setTimeout(function(){map.invalidateSize();},700);
});
document.getElementById('btn-coverage').addEventListener('click',function(){
  covVis=!covVis;this.classList.toggle('active');
  coverageCircles.forEach(function(c){if(covVis)c.addTo(map);else map.removeLayer(c);});
});
document.getElementById('btn-trails').addEventListener('click',function(){
  this.classList.toggle('active');
  var s=this.classList.contains('active');
  Object.keys(vTrails).forEach(function(k){if(s)vTrails[k].addTo(map);else map.removeLayer(vTrails[k]);});
});
document.getElementById('btn-dark').addEventListener('click',function(){
  this.classList.toggle('active');isDark=!isDark;
  if(isDark){map.removeLayer(lightTile);darkTile.addTo(map);}
  else{map.removeLayer(darkTile);lightTile.addTo(map);}
});
document.getElementById('time-range').addEventListener('input',function(){
  document.getElementById('time-display').textContent=this.value==100?'Live':Math.floor(this.value/4.17)+':00';
});

var cD=Array.from({length:30},function(){return Math.random()*25+5;});
var cC=document.getElementById('chart-canvas');
var cx=cC.getContext('2d');
function drawChart(){
  cD.push(Math.random()*25+5);if(cD.length>30)cD.shift();
  var W=cC.width,H=cC.height;cx.clearRect(0,0,W,H);
  cx.strokeStyle='#21262d';cx.lineWidth=.5;
  for(var g=0;g<4;g++){var gy=H*g/3;cx.beginPath();cx.moveTo(0,gy);cx.lineTo(W,gy);cx.stroke();}
  cx.beginPath();cx.moveTo(0,H);
  cD.forEach(function(v,i){cx.lineTo(i*W/29,H-(v/35)*H);});
  cx.lineTo(W,H);cx.closePath();
  var gr=cx.createLinearGradient(0,0,0,H);
  gr.addColorStop(0,'rgba(239,83,80,.3)');gr.addColorStop(1,'rgba(239,83,80,.02)');
  cx.fillStyle=gr;cx.fill();
  cx.strokeStyle='#ef5350';cx.lineWidth=2;cx.lineJoin='round';cx.beginPath();
  cD.forEach(function(v,i){var x=i*W/29,y=H-(v/35)*H;i===0?cx.moveTo(x,y):cx.lineTo(x,y);});
  cx.stroke();
  var last=cD[cD.length-1];cx.beginPath();cx.arc(W-1,H-(last/35)*H,3,0,Math.PI*2);cx.fillStyle='#ef5350';cx.fill();
}
drawChart();setInterval(drawChart,1500);

setInterval(function(){
  document.getElementById('s-on').textContent=vehicles.filter(function(v){return v.status!=='offline';}).length;
  document.getElementById('s-km').textContent=Math.round(120+Math.random()*15);
  document.getElementById('s-kw').textContent=Math.round(140+Math.random()*30);
},3000);

setTimeout(function(){map.invalidateSize();},300);
setTimeout(function(){map.invalidateSize();},1000);
console.log('IoT 3D Dashboard loaded');
})();
