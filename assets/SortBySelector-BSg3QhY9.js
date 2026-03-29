import{y as r,x as o,q as a,S as i,ae as c,ag as e}from"./index-DqVEGnD5.js";import{g as h,T as y}from"./FieldApplicability-DSKlOTJN.js";/**
 * @license lucide-react v0.525.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const g=[["path",{d:"m3 16 4 4 4-4",key:"1co6wj"}],["path",{d:"M7 20V4",key:"1yoxec"}],["path",{d:"m21 8-4-4-4 4",key:"1c9v7m"}],["path",{d:"M17 4v16",key:"7dpous"}]],m=r("arrow-down-up",g);/**
 * @license lucide-react v0.525.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const u=[["path",{d:"M3 3v16a2 2 0 0 0 2 2h16",key:"c24i48"}],["rect",{x:"15",y:"5",width:"4",height:"12",rx:"1",key:"q8uenq"}],["rect",{x:"7",y:"8",width:"4",height:"9",rx:"1",key:"sr5ea"}]],x=r("chart-column-big",u);/**
 * @license lucide-react v0.525.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const v=[["path",{d:"M12 3v18",key:"108xh3"}],["path",{d:"M3 12h18",key:"1i2n21"}],["rect",{x:"3",y:"3",width:"18",height:"18",rx:"2",key:"h1oib"}]],k=r("grid-2x2",v);/**
 * @license lucide-react v0.525.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const M=[["path",{d:"M21 12h-8",key:"1bmf0i"}],["path",{d:"M21 6H8",key:"1pqkrb"}],["path",{d:"M21 18h-8",key:"1tm79t"}],["path",{d:"M3 6v4c0 1.1.9 2 2 2h3",key:"1ywdgy"}],["path",{d:"M3 10v6c0 1.1.9 2 2 2h3",key:"2wc746"}]],w=r("list-tree",M);/**
 * @license lucide-react v0.525.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const j=[["path",{d:"M14.106 5.553a2 2 0 0 0 1.788 0l3.659-1.83A1 1 0 0 1 21 4.619v12.764a1 1 0 0 1-.553.894l-4.553 2.277a2 2 0 0 1-1.788 0l-4.212-2.106a2 2 0 0 0-1.788 0l-3.659 1.83A1 1 0 0 1 3 19.381V6.618a1 1 0 0 1 .553-.894l4.553-2.277a2 2 0 0 1 1.788 0z",key:"169xi5"}],["path",{d:"M15 5.764v15",key:"1pn4in"}],["path",{d:"M9 3.236v15",key:"1uimfh"}]],b=r("map",j);/**
 * @license lucide-react v0.525.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const f=[["path",{d:"M9 3H5a2 2 0 0 0-2 2v4m6-6h10a2 2 0 0 1 2 2v4M9 3v18m0 0h10a2 2 0 0 0 2-2V9M9 21H5a2 2 0 0 1-2-2V9m0 0h18",key:"gugj83"}]],S=r("table-2",f),T=()=>{const{view:t,updatePageParams:n}=o();return a.jsx(i,{options:Object.values(e),selected:t,onChange:s=>n({view:s}),getOptionLabel:s=>B(s),getOptionDescription:s=>_(s),display:c.ButtonGroup,optionStyle:{width:"fit-content",display:"flex",alignItems:"center",justifyContent:"center",padding:"0.5rem"},selectorStyle:{gap:"0.25rem"}})};function _(t){const n=[e.Map,e.Reports].includes(t);return a.jsxs("div",{style:{display:"flex",flexDirection:"column",alignItems:"center",gap:"0.25rem"},children:[a.jsxs("span",{style:{display:"flex",gap:"0.125rem"},children:[t," ",n&&a.jsx("em",{children:"β"})]}),a.jsx("img",{src:V(t),width:180})]})}function V(t){switch(t){case e.CardList:return"/lang-nav/cardlist.png";case e.Hierarchy:return"/lang-nav/hierarchy.png";case e.Map:return"/lang-nav/map.png";case e.Table:return"/lang-nav/table.png";case e.Reports:return"/lang-nav/reports.png"}}function B(t){switch(t){case e.CardList:return a.jsx(k,{size:"1.2em"});case e.Hierarchy:return a.jsx(w,{size:"1.2em"});case e.Map:return a.jsx(b,{size:"1.2em"});case e.Table:return a.jsx(S,{size:"1.2em"});case e.Reports:return a.jsx(x,{size:"1.2em"})}}const D=({showLabel:t=!0})=>{const{sortBy:n,updatePageParams:s,objectType:p}=o(),l=h(y.Sort,p);return a.jsx(i,{selectorLabel:t?"Sort By":a.jsx(m,{size:"1.2em"}),selectorDescription:t?"Choose the order of items in the view.":void 0,options:l,onChange:d=>s({sortBy:d}),selected:n,display:c.Dropdown})};export{D as S,T as V};
