function s(t,r){const e=[...t.containsTerritories??[]];if(r){const n=t.dependentTerritories??[];e.push(...n)}return[...e,...e.flatMap(n=>s(n,r))]}export{s as g};
