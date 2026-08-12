import{B as u,v as i,r as e,H as o}from"./index-CSvRDeLX.js";import{f as c,a}from"./LanguagePluralGrid-DVXNcooC.js";/**
 * @license lucide-react v0.525.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const m=[["rect",{width:"18",height:"18",x:"3",y:"3",rx:"2",key:"afitv7"}],["path",{d:"M3 9h18",key:"1pudct"}],["path",{d:"M3 15h18",key:"5xshup"}],["path",{d:"M9 3v18",key:"fh3hqa"}],["path",{d:"M15 3v18",key:"14nvp0"}]],h=u("grid-3x3",m),g=({lang:t,showTooltips:r})=>{const[n,l]=i.useState(!1);if(!t)return null;const s=i.useMemo(()=>c(t),[t]);return!s||s.length===0?e.jsx(e.Fragment,{}):e.jsxs(e.Fragment,{children:[e.jsxs(o,{hoverContent:e.jsxs(e.Fragment,{children:["click to persist",e.jsx(a,{lang:t,showTooltips:r})]}),style:{padding:"0.25em 0.5em",marginLeft:"0.5em"},onClick:()=>l(d=>!d),children:[e.jsx(h,{size:"1em",style:{marginRight:"0.25em",verticalAlign:"middle"}}),"examples"]}),n&&e.jsx(a,{lang:t,showTooltips:r})]})};export{g as L};
