import{A as p,x,r as l,R as m,q as e,B as h,C as c}from"./index-BPm2QGYr.js";import{a as j}from"./LimitInput-CrPhTumE.js";/**
 * @license lucide-react v0.525.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const P=[["polygon",{points:"19 20 9 12 19 4 19 20",key:"o2sva"}],["line",{x1:"5",x2:"5",y1:"19",y2:"5",key:"1ocqjk"}]],C=p("skip-back",P);/**
 * @license lucide-react v0.525.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const f=[["polygon",{points:"5 4 15 12 5 20 5 4",key:"16p6eg"}],["line",{x1:"19",x2:"19",y1:"5",y2:"19",key:"futhcm"}]],b=p("skip-forward",f);/**
 * @license lucide-react v0.525.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const v=[["line",{x1:"18",x2:"18",y1:"20",y2:"4",key:"cun8e5"}],["polygon",{points:"14,20 4,12 14,4",key:"ypakod"}]],N=p("step-back",v);/**
 * @license lucide-react v0.525.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const _=[["line",{x1:"6",x2:"6",y1:"4",y2:"20",key:"fy8qot"}],["polygon",{points:"10,4 20,12 10,20",key:"1mc1pf"}]],B=p("step-forward",_);function M(){const{page:o,limit:a}=x();return{getCurrentEntities:l.useCallback(t=>a<1||t.length<a?t:t.length<=a*(o-1)?t.slice(0,a):t.slice(a*(o-1),a*o),[o,a])}}const S=({itemCount:o})=>{const{page:a,limit:u,updatePageParams:t}=x(),n=u<1?1:Math.ceil(o/u),[s,i]=m.useState(a);l.useEffect(()=>{i(a)},[a]);const y=l.useCallback(()=>{i(1),t({page:1})},[t]),d=l.useCallback(r=>{const g=Math.min(Math.max((s||1)+r,1),n);i(g),t({page:g})},[t,s,n]),k=l.useCallback(()=>{i(n),t({page:n})},[t,n]);return n<=1?e.jsx(e.Fragment,{}):e.jsx("span",{className:"inline text-nowrap",children:e.jsxs(h,{children:[e.jsx(c,{disabled:!0,variant:"outline",children:"Page"}),e.jsx(c,{className:"cursor-pointer",disabled:s===1,onClick:y,variant:"secondary",children:e.jsx(C,{})}),e.jsx(c,{className:"cursor-pointer",disabled:s===1,onClick:()=>d(-1),variant:"secondary",children:e.jsx(N,{})}),e.jsx(j,{value:s||"",onChange:r=>r.target.value?i(parseInt(r.target.value)):i(void 0),onBlur:r=>t({page:Math.min(Math.max(parseInt(r.target.value),1),n)}),style:{width:50,textAlign:"center"}}),e.jsx(c,{className:"cursor-pointer",disabled:!s||s>=n,onClick:()=>d(1),variant:"secondary",children:e.jsx(B,{})}),e.jsx(c,{className:"cursor-pointer",disabled:s===n,onClick:k,variant:"secondary",children:e.jsx(b,{})}),e.jsxs(c,{disabled:!0,variant:"outline",children:["/ ",n]})]})})};export{S as P,M as u};
