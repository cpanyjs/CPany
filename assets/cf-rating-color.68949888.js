import{i as e}from"./index.c751d1f4.js";import{e as a,p as r,q as s,o as n,b as t,r as l,s as d,u as i}from"./vendor.5658d620.js";const o=a({props:{rating:{type:Number,required:!1},rank:{type:String,required:!1},disableLegendary:{type:Boolean,required:!1}},setup(a){const o=a,{rating:u,rank:p,disableLegendary:c}=r(o),g=s((()=>{const a=null==p?void 0:p.value;if(e(a))return a.replace(/ /g,"-");const r=null==u?void 0:u.value;return e(r)?r<1200?"newbie":r<1400?"pupil":r<1600?"specialist":r<1900?"expert":r<2100?"candidate-master":r<2400?"master":r<3e3||(null==c?void 0:c.value)?"grandmaster":"legendary-grandmaster":null}));return(e,a)=>(n(),t("span",{class:d(["cf-handle",i(g)])},[l(e.$slots,"default")],2))}});export{o as _};