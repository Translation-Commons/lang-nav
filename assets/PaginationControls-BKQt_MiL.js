import{z as g,y as x,r as c,$ as h,q as e,H as m,a9 as b}from"./index-BOd18ZuQ.js";/**
 * @license lucide-react v0.525.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const j=[["polygon",{points:"19 20 9 12 19 4 19 20",key:"o2sva"}],["line",{x1:"5",x2:"5",y1:"19",y2:"5",key:"1ocqjk"}]],f=g("skip-back",j);/**
 * @license lucide-react v0.525.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const C=[["polygon",{points:"5 4 15 12 5 20 5 4",key:"16p6eg"}],["line",{x1:"19",x2:"19",y1:"5",y2:"19",key:"futhcm"}]],P=g("skip-forward",C);/**
 * @license lucide-react v0.525.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const v=[["line",{x1:"18",x2:"18",y1:"20",y2:"4",key:"cun8e5"}],["polygon",{points:"14,20 4,12 14,4",key:"ypakod"}]],S=g("step-back",v);/**
 * @license lucide-react v0.525.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const w=[["line",{x1:"6",x2:"6",y1:"4",y2:"20",key:"fy8qot"}],["polygon",{points:"10,4 20,12 10,20",key:"1mc1pf"}]],R=g("step-forward",w);function z(){const{page:o,limit:n}=x();return{getCurrentObjects:c.useCallback(t=>n<1||t.length<n?t:t.length<=n*(o-1)?t.slice(0,n):t.slice(n*(o-1),n*o),[o,n])}}const N=({itemCount:o})=>{const{page:n,limit:d,updatePageParams:t}=x(),a=d<1?1:Math.ceil(o/d),[s,i]=h.useState(n);c.useEffect(()=>{i(n)},[n]);const k=c.useCallback(()=>{i(1),t({page:1})},[t]),p=c.useCallback(l=>{const u=Math.min(Math.max((s||1)+l,1),a);i(u),t({page:u})},[t,s,a]),y=c.useCallback(()=>{i(a),t({page:a})},[t,a]);if(a<=1)return e.jsx(e.Fragment,{});const r={lineHeight:"1.5",padding:"0em 0.25em",fontSize:"1em",fontWeight:"normal",margin:"0 -0.125em",borderRadius:"0"};return e.jsxs(e.Fragment,{children:["Page:",e.jsxs("div",{className:"selector",style:{marginBottom:0,marginLeft:"0.5em",marginRight:"0.5em",display:"inline-flex",verticalAlign:"middle",alignItems:"normal"},children:[e.jsx("button",{onClick:k,disabled:s===1,style:{...r,borderRadius:"1em 0 0 1em"},children:e.jsx(f,{size:"1em",style:{display:"block"}})}),e.jsx(m,{disabled:s===1,hoverContent:e.jsxs(e.Fragment,{children:["Go to Previous Page.",e.jsx("br",{}),"Shortcut: Left Arrow Key ←"]}),onClick:()=>p(-1),style:r,children:e.jsx(S,{size:"1em",style:{display:"block"}})}),e.jsx("input",{className:!s||s===1?"empty":"",value:s||"",onChange:l=>l.target.value?i(parseInt(l.target.value)):i(void 0),onBlur:l=>t({page:Math.min(Math.max(parseInt(l.target.value),1),a)}),style:{...r,width:50,textAlign:"center"}}),s&&s>a&&e.jsx(m,{onClick:y,hoverContent:"This page number is out of range. Showing the first page instead. Click to go to the actually last page.",style:{margin:"none",padding:0,borderRadius:0},children:e.jsx(b,{size:"1em",style:{display:"block"}})}),e.jsx(m,{disabled:!s||s>=a,hoverContent:e.jsxs(e.Fragment,{children:["Go to Next Page.",e.jsx("br",{}),"Shortcut: Right Arrow Key →"]}),onClick:()=>p(1),style:r,children:e.jsx(R,{size:"1em",style:{display:"block"}})}),e.jsx("button",{onClick:y,disabled:s===a,style:{...r,borderRadius:"0 1em 1em 0"},children:e.jsx(P,{size:"1em",style:{display:"block"}})})]})]})};export{N as P,z as u};
