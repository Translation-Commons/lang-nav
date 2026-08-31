import{A as u,r as a,q as e,an as d}from"./index-CTpytAYz.js";import{f as l,a as h}from"./LanguagePluralGrid-UhmnNm59.js";/**
 * @license lucide-react v0.525.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const c=[["rect",{width:"18",height:"18",x:"3",y:"3",rx:"2",key:"afitv7"}],["path",{d:"M3 9h18",key:"1pudct"}],["path",{d:"M3 15h18",key:"5xshup"}],["path",{d:"M9 3v18",key:"fh3hqa"}],["path",{d:"M15 3v18",key:"14nvp0"}]],p=u("grid-3x3",c),f=({lang:s,showTooltips:i})=>{const[r,n]=a.useState(!1);if(!s)return null;const t=a.useMemo(()=>l(s),[s]);return!t||t.length===0?e.jsx(e.Fragment,{}):e.jsxs(e.Fragment,{children:[e.jsxs(d,{className:"cursor-pointer",pressed:r,onPressedChange:()=>n(o=>!o),variant:"outline",children:[e.jsx(p,{}),"show grid"]}),r&&e.jsx(h,{lang:s,showTooltips:i})]})};export{f as L};
