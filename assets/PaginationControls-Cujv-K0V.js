import{z as a,y as c,r as d,q as e,H as r,ae as m}from"./index-Ct3xvAJi.js";/**
 * @license lucide-react v0.525.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const p=[["polygon",{points:"19 20 9 12 19 4 19 20",key:"o2sva"}],["line",{x1:"5",x2:"5",y1:"19",y2:"5",key:"1ocqjk"}]],y=a("skip-back",p);/**
 * @license lucide-react v0.525.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const u=[["polygon",{points:"5 4 15 12 5 20 5 4",key:"16p6eg"}],["line",{x1:"19",x2:"19",y1:"5",y2:"19",key:"futhcm"}]],x=a("skip-forward",u);/**
 * @license lucide-react v0.525.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const h=[["line",{x1:"18",x2:"18",y1:"20",y2:"4",key:"cun8e5"}],["polygon",{points:"14,20 4,12 14,4",key:"ypakod"}]],k=a("step-back",h);/**
 * @license lucide-react v0.525.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const b=[["line",{x1:"6",x2:"6",y1:"4",y2:"20",key:"fy8qot"}],["polygon",{points:"10,4 20,12 10,20",key:"1mc1pf"}]],j=a("step-forward",b);function C(){const{page:o,limit:t}=c();return{getCurrentObjects:d.useCallback(s=>t<1||s.length<t?s:s.length<=t*(o-1)?s.slice(0,t):s.slice(t*(o-1),t*o),[o,t])}}const P=({itemCount:o})=>{const{page:t,limit:l,updatePageParams:s}=c(),n=l<1?1:Math.ceil(o/l);if(n<=1)return e.jsx(e.Fragment,{});const i={lineHeight:"1.5",padding:"0em 0.25em",fontSize:"1em",fontWeight:"normal",margin:"0 -0.125em",borderRadius:"0"};return e.jsxs(e.Fragment,{children:["Page:",e.jsxs("div",{className:"selector",style:{marginBottom:0,marginLeft:"0.5em",marginRight:"0.5em",display:"inline-flex",verticalAlign:"middle",alignItems:"normal"},children:[e.jsx("button",{onClick:()=>s({page:1}),disabled:t===1,style:{...i,borderRadius:"1em 0 0 1em"},children:e.jsx(y,{size:"1em",style:{display:"block"}})}),e.jsx(r,{disabled:t===1,hoverContent:e.jsxs(e.Fragment,{children:["Go to Previous Page.",e.jsx("br",{}),"Shortcut: Left Arrow Key ←"]}),onClick:()=>s({page:Math.max(1,t-1)}),style:i,children:e.jsx(k,{size:"1em",style:{display:"block"}})}),e.jsx("input",{className:t===1?"empty":"",min:1,max:n,value:t,onChange:g=>s({page:parseInt(g.target.value)}),style:{...i,width:50,textAlign:"center"}}),t>n&&e.jsx(r,{onClick:()=>s({page:n}),hoverContent:"This page number is out of range. Showing the first page instead. Click to go to the actually last page.",style:{margin:"none",padding:0,borderRadius:0},children:e.jsx(m,{size:"1em",style:{display:"block"}})}),e.jsx(r,{disabled:t>=n,hoverContent:e.jsxs(e.Fragment,{children:["Go to Next Page.",e.jsx("br",{}),"Shortcut: Right Arrow Key →"]}),onClick:()=>s({page:Math.min(n,t+1)}),style:i,children:e.jsx(j,{size:"1em",style:{display:"block"}})}),e.jsx("button",{onClick:()=>s({page:n}),disabled:t===n,style:{...i,borderRadius:"0 1em 1em 0"},children:e.jsx(x,{size:"1em",style:{display:"block"}})})]})]})};export{P,C as u};
