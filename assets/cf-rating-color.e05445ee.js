import{d as c,z as i,x as f,E as s,o as p,e as m,s as d,S as g,h as _}from"./index.75d77b1c.js";const k=c({__name:"cf-rating-color",props:{rating:null,rank:null,disableLegendary:{type:Boolean}},setup(o){const l=o,{rating:n,rank:t,disableLegendary:a}=i(l),u=f(()=>{const r=t==null?void 0:t.value;if(s(r))return r.replace(/ /g,"-");const e=n==null?void 0:n.value;return s(e)?e<1200?"newbie":e<1400?"pupil":e<1600?"specialist":e<1900?"expert":e<2100?"candidate-master":e<2400?"master":e<3e3||a!=null&&a.value?"grandmaster":"legendary-grandmaster":null});return(r,e)=>(p(),m("span",{class:g(["cf-handle",_(u)])},[d(r.$slots,"default")],2))}});export{k as _};