import{j as i,m as r,a as n,s as o}from"./index-BM5jlvJD.js";const l=a=>({hidden:{y:-50,opacity:0},show:{y:0,opacity:1,transition:{type:"spring",duration:1.25,delay:a}}}),p=(a,t,s,e)=>({hidden:{x:a==="left"?100:a==="right"?-100:0,y:a==="up"?100:a==="down"?-100:0,opacity:0},show:{x:0,y:0,opacity:1,transition:{type:t,delay:s,duration:e,ease:"easeOut"}}}),y=(a,t,s,e)=>({hidden:{x:a==="left"?"-100%":a==="right"?"100%":0,y:a==="up"||a==="down"?"100%":0},show:{x:0,y:0,transition:{type:t,delay:s,duration:e,ease:"easeOut"}}}),d=(a,t)=>({hidden:{},show:{transition:{staggerChildren:a,delayChildren:t||0}}}),u=(a,t)=>function(){return i(r.section,{variants:d(),initial:"hidden",whileInView:"show",viewport:{once:!0,amount:.25},className:`${o.padding} max-w-7xl mx-auto relative z-0`,children:[n("span",{className:"hash-span",id:t,children:" "}),n(a,{})]})};export{u as S,p as f,y as s,l as t};
