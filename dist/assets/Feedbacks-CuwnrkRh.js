import{u as p,j as t,a as e,s,m,l as h}from"./index-BM5jlvJD.js";import{L as b}from"./Linkedinlogo-xIWIpnXi.js";import{S as g,t as u,f}from"./SectionWrapper-DVNI3rYu.js";const w="/assets/email-O2yIuCk0.png",N="/assets/recomendation-Cw499r7y.png",k=({index:n,testimonial:i,name:a,designation:l,company:o,image:x,url:c,doc:r,email:d})=>t(m.div,{variants:f("","spring",n*.5,.75),className:"bg-black-200 p-5 sm:p-10 rounded-3xl w-full xs:w-[320px]",children:[t("div",{className:"flex items-center gap-2",children:[e("p",{className:"text-white font-black text-[36px] sm:text-[48px] mb-0 leading-none",children:'"'}),t("div",{className:"flex ml-auto gap-2",children:[c&&e("button",{className:"bg-tertiary p-1.5 sm:p-2 rounded-xl outline-none text-white font-bold flex items-center",onClick:()=>window.open(c,"_blank"),children:e("img",{src:b,alt:"LinkedIn",className:"w-6 h-6 sm:w-8 sm:h-8"})}),d&&e("button",{className:"bg-tertiary p-1.5 sm:p-2 rounded-xl outline-none text-white font-bold flex items-center",onClick:()=>{window.open(`mailto:${d}`,"_blank")},children:e("img",{src:w,alt:"Email",className:"w-6 h-6 sm:w-8 sm:h-8"})}),r&&e("button",{className:"bg-tertiary p-1.5 sm:p-2 rounded-xl outline-none text-white font-bold flex items-center",onClick:()=>{window.open(r,"_blank")},children:e("img",{src:N,alt:"View Document",className:"w-6 h-6 sm:w-8 sm:h-8"})})]})]}),t("div",{className:"mt-1",children:[e("p",{className:"text-white tracking-wider text-[16px] sm:text-[18px]",children:i}),t("div",{className:"mt-7 flex justify-between items-center gap-1",children:[t("div",{className:"flex-1 flex flex-col",children:[t("p",{className:"text-white font-medium text-[16px]",children:[e("span",{className:"blue-text-gradient",children:"@"})," ",a]}),t("p",{className:"mt-1 text-secondary text-[12px]",children:[l," of ",o]})]}),e("img",{src:x,alt:`feedback_by-${a}`,className:"w-10 h-10 rounded-full object-cover"})]})]})]}),v=()=>{const{currentLanguage:n,t:i}=p();return t("div",{className:"mt-12 bg-black-100 rounded-[20px]",children:[e("div",{className:`bg-tertiary rounded-2xl ${s.padding} min-h-[300px]`,children:t(m.div,{variants:u(),children:[e("p",{className:s.sectionSubText,children:"What others say"}),e("h2",{className:s.sectionHeadText,children:"Testimonials."})]})}),e("div",{className:`-mt-20 pb-14 ${s.paddingX} flex flex-wrap gap-7`,children:h[n].map((a,l)=>e(k,{index:l,...a},a.name))})]})},L=g(v,"");export{L as default};
