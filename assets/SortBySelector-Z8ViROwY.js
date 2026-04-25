import{z as r,r as h,ak as y,y as o,q as a,S as i,ab as c,af as t}from"./index-BOd18ZuQ.js";import{g as u,T as m}from"./FieldApplicability-KVn3-Orp.js";/**
 * @license lucide-react v0.525.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const g=[["path",{d:"m3 16 4 4 4-4",key:"1co6wj"}],["path",{d:"M7 20V4",key:"1yoxec"}],["path",{d:"m21 8-4-4-4 4",key:"1c9v7m"}],["path",{d:"M17 4v16",key:"7dpous"}]],x=r("arrow-down-up",g);/**
 * @license lucide-react v0.525.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const v=[["path",{d:"M3 3v16a2 2 0 0 0 2 2h16",key:"c24i48"}],["rect",{x:"15",y:"5",width:"4",height:"12",rx:"1",key:"q8uenq"}],["rect",{x:"7",y:"8",width:"4",height:"9",rx:"1",key:"sr5ea"}]],w=r("chart-column-big",v);/**
 * @license lucide-react v0.525.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const k=[["path",{d:"M12 3v18",key:"108xh3"}],["path",{d:"M3 12h18",key:"1i2n21"}],["rect",{x:"3",y:"3",width:"18",height:"18",rx:"2",key:"h1oib"}]],M=r("grid-2x2",k);/**
 * @license lucide-react v0.525.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const j=[["path",{d:"M21 12h-8",key:"1bmf0i"}],["path",{d:"M21 6H8",key:"1pqkrb"}],["path",{d:"M21 18h-8",key:"1tm79t"}],["path",{d:"M3 6v4c0 1.1.9 2 2 2h3",key:"1ywdgy"}],["path",{d:"M3 10v6c0 1.1.9 2 2 2h3",key:"2wc746"}]],b=r("list-tree",j);/**
 * @license lucide-react v0.525.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const f=[["path",{d:"M14.106 5.553a2 2 0 0 0 1.788 0l3.659-1.83A1 1 0 0 1 21 4.619v12.764a1 1 0 0 1-.553.894l-4.553 2.277a2 2 0 0 1-1.788 0l-4.212-2.106a2 2 0 0 0-1.788 0l-3.659 1.83A1 1 0 0 1 3 19.381V6.618a1 1 0 0 1 .553-.894l4.553-2.277a2 2 0 0 1 1.788 0z",key:"169xi5"}],["path",{d:"M15 5.764v15",key:"1pn4in"}],["path",{d:"M9 3.236v15",key:"1uimfh"}]],S=r("map",f);/**
 * @license lucide-react v0.525.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const _=[["path",{d:"M9 3H5a2 2 0 0 0-2 2v4m6-6h10a2 2 0 0 1 2 2v4M9 3v18m0 0h10a2 2 0 0 0 2-2V9M9 21H5a2 2 0 0 1-2-2V9m0 0h18",key:"gugj83"}]],P=r("table-2",_),D=()=>{const e=h.useContext(y);if(!e)throw new Error("useFilterPanel must be used within FilterPanelProvider");return e},L=()=>{const{view:e,updatePageParams:n}=o();return a.jsx(i,{options:Object.values(t),selected:e,onChange:s=>n({view:s}),getOptionLabel:s=>z(s),getOptionDescription:s=>C(s),display:c.ButtonGroup,optionStyle:{width:"fit-content",display:"flex",alignItems:"center",justifyContent:"center",padding:"0.5rem"},selectorStyle:{gap:"0.25rem"}})};function C(e){const n=[t.Map,t.Reports].includes(e);return a.jsxs("div",{style:{display:"flex",flexDirection:"column",alignItems:"center",gap:"0.25rem"},children:[a.jsxs("span",{style:{display:"flex",gap:"0.125rem"},children:[e," ",n&&a.jsx("em",{children:"β"})]}),a.jsx("img",{src:V(e),width:180})]})}function V(e){switch(e){case t.CardList:return"/lang-nav/cardlist.png";case t.Hierarchy:return"/lang-nav/hierarchy.png";case t.Map:return"/lang-nav/map.png";case t.Table:return"/lang-nav/table.png";case t.Reports:return"/lang-nav/reports.png"}}function z(e){switch(e){case t.CardList:return a.jsx(M,{size:"1.2em"});case t.Hierarchy:return a.jsx(b,{size:"1.2em"});case t.Map:return a.jsx(S,{size:"1.2em"});case t.Table:return a.jsx(P,{size:"1.2em"});case t.Reports:return a.jsx(w,{size:"1.2em"})}}const N=({showLabel:e=!0})=>{const{sortBy:n,updatePageParams:s,objectType:p}=o(),l=u(m.Sort,p);return a.jsx(i,{selectorLabel:e?"Sort By":a.jsx(x,{size:"1.2em"}),selectorDescription:e?"Choose the order of items in the view.":void 0,options:l,onChange:d=>s({sortBy:d}),selected:n,display:c.Dropdown})};export{N as S,L as V,D as u};
