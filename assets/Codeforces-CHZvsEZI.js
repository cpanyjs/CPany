import{L as P,d as j,s as O,C as k,v as m,F as $,e as f,g as E,f as C,t as V,h as L,i as x,P as p,V as B,o as y,D}from"./index-Cc-lLLcQ.js";import{l as H}from"./load-Bav7-mWT.js";import{c as F}from"./codeforces-BeZ4E3OT.js";import{_ as M,h as J,f as G}from"./Contest.vue_vue_type_script_setup_true_lang-CXwnASDc.js";import"./c-table-B5Gf5T_P.js";import"./user-link.vue_vue_type_script_setup_true_lang-D-ZGsYJ_.js";import"./cf-rating-color.vue_vue_type_script_setup_true_lang-DRbCCW_c.js";import"./nc-rating-color.vue_vue_type_script_setup_true_lang-W3OTeqpb.js";function K(){const o=P("loading");return{start(){o.value=!0},end(){o.value=!1}}}const W=H(F),_=new Map;for(const o of W)o.type.startsWith("codeforces")&&_.set(o.id,o);function q(o){return _.get(+o)??null}const S="https://codeforces.com/api/",z={key:0},Q={key:1,class:"divide-y"},X={class:"pt-2"},re=j({__name:"Codeforces",setup(o){const h=O(),I=k(),r=m(null),d=m(!1),T=m(!1),{start:N,end:w}=K(),l=m(!1),u=async s=>{if(l.value)return;l.value=!0;const a=new URL(S+"contest.standings");a.searchParams.append("contestId",""+s.id),a.searchParams.append("handles",J.map(({h:e})=>e).join(";")),a.searchParams.append("showUnofficial","true");const{result:n}=await(await fetch(a.toString())).json();let i=0;s.problems=n.problems;for(const e of n.problems)e.problemUrl=`https://codeforces.com/contest/${e.contestId}/problem/${e.index}`;s.standings=[];for(const e of n.rows){if(e.party.participantType!==p.CONTESTANT&&e.party.participantType!==p.VIRTUAL&&e.party.participantType!==p.OUT_OF_COMPETITION&&e.party.participantType!==p.PRACTICE)continue;e.party.participantType!==p.PRACTICE&&i++;const A=e.problemResults.reduce((t,c)=>c.points===0?t:t+(c.bestSubmissionTimeSeconds??0)+20*(c.rejectedAttemptCount??0),0),v=e.party.participantTime??s.startTime;s.standings.push({author:{members:e.party.members.map(t=>t.handle),teamName:e.party.teamName??G(e.party.members[0].handle),participantTime:v,participantType:e.party.participantType},rank:e.rank,solved:e.problemResults.filter(t=>t.points>0).length,penalty:A,submissions:e.problemResults.map((t,c)=>{const b=t.bestSubmissionTimeSeconds+v,g=t.bestSubmissionTimeSeconds;return t.points>0?{id:-1,creationTime:b,relativeTime:g,problemIndex:c,verdict:B.OK,dirty:t.rejectedAttemptCount}:t.rejectedAttemptCount>0?{id:-1,creationTime:b,relativeTime:g,problemIndex:c,dirty:t.rejectedAttemptCount}:null}).filter(t=>t!==null)})}s.participantNumber=i,l.value=!1},R=async s=>{const a=new URL(S+"contest.list"),n="codeforces/contest.list",{result:i}=sessionStorage.getItem(n)?{result:JSON.parse(sessionStorage.getItem(n))}:await(await fetch(a.toString())).json();sessionStorage.getItem(n)||sessionStorage.setItem(n,JSON.stringify(i));for(const e of i)if(e.id===s)return{type:"codeforces",name:e.name,startTime:e.startTimeSeconds,duration:e.durationSeconds,participantNumber:0,id:e.id,phase:e.phase,contestUrl:`https://codeforces.com/contest/${e.id}`,standingsUrl:`https://codeforces.com/contest/${e.id}/standings`}},U=()=>{u(r.value)};return $(()=>h.params,async s=>{if(s.id){N();const a=q(+s.id);if(a!==null)r.value=a,await u(r.value),document.title=`${a.name} - CPany`;else{const n=await R(+s.id);if(n)T.value=!0,r.value=n,await u(r.value),document.title=`${n.name} - CPany`;else{d.value=!0;const e=setTimeout(()=>I.replace({name:"Home"}),3e3);D(()=>clearTimeout(e))}}w()}},{immediate:!0}),(s,a)=>(y(),f("div",null,[r.value&&!d.value?(y(),f("div",z,[E(M,{contest:r.value,dynamic:T.value,onRefresh:U},null,8,["contest","dynamic"])])):d.value?(y(),f("div",Q,[a[0]||(a[0]=C("h2",{class:"mb-2"},"错误",-1)),C("p",X,"未找到 ID 为 "+V(L(h).params.id)+" 的 Codeforces 比赛",1)])):x("v-if",!0)]))}});export{re as default};