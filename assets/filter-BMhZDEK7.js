import{r as u,j as c,S as o,m,u as h,O as i,d as C,T as E}from"./index-BLfqyNAq.js";/**
 * @license lucide-react v0.525.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const k=e=>e.replace(/([a-z0-9])([A-Z])/g,"$1-$2").toLowerCase(),N=e=>e.replace(/^([A-Z])|[\s-_]+(\w)/g,(t,r,n)=>n?n.toUpperCase():r.toLowerCase()),f=e=>{const t=N(e);return t.charAt(0).toUpperCase()+t.slice(1)},w=(...e)=>e.filter((t,r,n)=>!!t&&t.trim()!==""&&n.indexOf(t)===r).join(" ").trim(),O=e=>{for(const t in e)if(t.startsWith("aria-")||t==="role"||t==="title")return!0};/**
 * @license lucide-react v0.525.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */var F={xmlns:"http://www.w3.org/2000/svg",width:24,height:24,viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:2,strokeLinecap:"round",strokeLinejoin:"round"};/**
 * @license lucide-react v0.525.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const A=u.forwardRef(({color:e="currentColor",size:t=24,strokeWidth:r=2,absoluteStrokeWidth:n,className:a="",children:s,iconNode:l,...g},p)=>u.createElement("svg",{ref:p,...F,width:t,height:t,stroke:e,strokeWidth:n?Number(r)*24/Number(t):r,className:w("lucide",a),...!s&&!O(g)&&{"aria-hidden":"true"},...g},[...l.map(([S,x])=>u.createElement(S,x)),...Array.isArray(s)?s:[s]]));/**
 * @license lucide-react v0.525.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const L=(e,t)=>{const r=u.forwardRef(({className:n,...a},s)=>u.createElement(A,{ref:s,iconNode:t,className:w(`lucide-${k(f(e))}`,`lucide-${e}`,n),...a}));return r.displayName=f(e),r};/**
 * @license lucide-react v0.525.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const $=[["path",{d:"M15 3h6v6",key:"1q9fwt"}],["path",{d:"M10 14 21 3",key:"gplh6r"}],["path",{d:"M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6",key:"a6xqqp"}]],D=L("external-link",$);/**
 * @license lucide-react v0.525.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const v=[["path",{d:"M18 6 6 18",key:"1bl5f8"}],["path",{d:"m6 6 12 12",key:"d8bk6v"}]],U=L("x",v);function M(e){return e.replace(/[.*+?^${}()|[\]\\]/g,"\\$&")}const P=({text:e,searchPattern:t})=>{if(t==="")return e;const r=M(t),n=e.match(new RegExp(`(^|.*\\P{L})(${r})(?:(.*\\P{L})(${r}))*?(.*)`,"iu"));return n?c.jsx(c.Fragment,{children:n.slice(1).map((a,s)=>s%2===0?a:c.jsx("span",{className:"highlighted",children:a},s))}):e},H=({object:e,field:t})=>{const{searchBy:r,searchString:n}=h(),a=n.toLowerCase();return r===t?c.jsx(d,{object:e,query:n,field:t}):r===o.AllNames&&[o.EngName,o.Endonym].includes(t)?c.jsx(d,{object:e,query:n,field:t}):r===o.NameOrCode&&[o.EngName,o.Code].includes(t)?c.jsx(d,{object:e,query:n,field:t}):y(e,t,a)},d=({object:e,field:t,query:r})=>c.jsx(P,{text:y(e,t,r),searchPattern:r.toLowerCase()});function y(e,t,r){switch(t){case o.AllNames:return e.names.filter(n=>m(n,(r==null?void 0:r.toLowerCase())??""))[0]??"";case o.Code:return e.codeDisplay;case o.Endonym:return e.nameEndonym??"";case o.EngName:return e.nameDisplay;case o.NameOrCode:return e.nameDisplay+" ["+e.codeDisplay+"]"}}function _(e,t,r){switch(e.type){case i.Language:return(e.populationCited??0)+0;case i.Locale:return e.populationSpeaking;case i.Census:return e.languageCount;case i.WritingSystem:return e.populationUpperBound+0;case i.Territory:return e.population;default:return 0}}function I(){const{searchBy:e,searchString:t}=h();return t==""?()=>!0:T(t.toLowerCase(),e)}function T(e,t){const r=e.toLowerCase();switch(t){case o.Code:case o.Endonym:case o.EngName:case o.NameOrCode:return n=>m(y(n,t),r);case o.AllNames:return n=>n.names.map(a=>m(a,r)).reduce((a,s)=>a||s,!1)}}function q(){var a,s;const{territoryFilter:e}=h(),t=e.split("["),r=(a=t[0])==null?void 0:a.toLowerCase().trim();let n="";return e.length===2?n=e.toUpperCase():e.length===3&&e.match(/^[0-9]{3}$/)?n=e:t.length>1&&(n=(s=t[1].split("]")[0])==null?void 0:s.toUpperCase()),u.useCallback(l=>{if(e=="")return!0;const g=B(l);return n!==""?g.some(p=>p.ID===n):g.some(p=>p.nameDisplay.toLowerCase().startsWith(r))},[e,n,r])}function B(e){switch(e.type){case i.Territory:return[e,e.parentUNRegion,e.sovereign].filter(t=>t!=null);case i.Locale:return[e.territory].filter(t=>t!=null);case i.Census:return[e.territory].filter(t=>t!=null);case i.Language:return e.locales.map(t=>t.territory).filter(t=>t!=null);case i.WritingSystem:return[e.territoryOfOrigin].filter(t=>t!=null)}}function Z(){const{languageScopes:e,territoryScopes:t}=h();function r(n){switch(n.type){case i.Language:return e.length==0||e.includes(n.scope??C.SpecialCode);case i.Territory:return t.length==0||t.includes(n.scope);case i.Locale:return R(n,e,t);case i.Census:case i.WritingSystem:return!0}}return r}function R(e,t,r){var s,l;const n=t.includes(((s=e.language)==null?void 0:s.scope)??C.SpecialCode),a=r.includes(((l=e.territory)==null?void 0:l.scope)??E.Country);return(t.length==0||n)&&(r.length==0||a)}function K(){const{page:e,limit:t}=h();return r=>t<1||r.length<t?r:r.slice(t*(e-1),t*e)}export{D as E,d as H,H as O,U as X,T as a,y as b,L as c,I as d,q as e,K as f,Z as g,_ as h};
