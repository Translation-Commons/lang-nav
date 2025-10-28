import fs from 'node:fs';
import process from 'node:process';

// Get the input data
const summaryPath = 'coverage/coverage-summary.json';
const inputItems = JSON.parse(fs.readFileSync(summaryPath, 'utf8'));

// Make the header row
const out = [];
out.push('### Test Coverage (Vitest)\n');
function printGenericRow(strings) {
  out.push(
    `| ${strings[0].padEnd(40)} | ${strings[1].padStart(7)} | ${strings[2].padStart(7)} | ${strings[3].padStart(
      7,
    )} | ${strings[4].padStart(7)} |`,
  );
}
function printPercent(num) {
  return num === 0 ? '0  ' : num.toFixed(1);
}
function printFileRow(path, coverage) {
  printGenericRow([
    `\`${path}\``,
    printPercent(coverage.lines.pct),
    printPercent(coverage.branches.pct),
    printPercent(coverage.functions.pct),
    printPercent(coverage.statements.pct),
  ]);
}
printGenericRow(['Path', 'Lines', 'Branches', 'Funcs', 'Stmts']);
printGenericRow(['-'.repeat(40), '------:', '------:', '------:', '------:']);

function addCoverage(a, b) {
  return Object.fromEntries(
    Object.entries(a).map(([key, aValues]) => {
      const bValues = b[key];
      const total = aValues.total + bValues.total;
      const covered = aValues.covered + bValues.covered;
      const skipped = aValues.skipped + bValues.skipped;
      const pct = total ? (covered / total) * 100 : 100;
      return [key, { total, covered, skipped, pct }];
    }),
  );
}

// Iterate through the input items to build the tree structure
const root = { name: '', coverage: inputItems.total, children: {}, ...inputItems.total, depth: 0 };
const currentWorkingDirectory = process.cwd();
Object.entries(inputItems).forEach(([name, coverage]) => {
  if (name === 'total') return;
  const pathComponents = name.slice(currentWorkingDirectory.length + 1).split('/');
  let currentNode = root;
  pathComponents.forEach((pathSegment, index) => {
    let nextNode = currentNode.children[pathSegment];
    if (!nextNode) {
      nextNode = { name: pathSegment, coverage, children: {}, depth: index };
    } else {
      nextNode.coverage = addCoverage(nextNode.coverage, coverage);
    }
    currentNode.children[pathSegment] = nextNode;
    currentNode = nextNode;
  });
});

// Print out the tree structure
function printNode(node) {
  if (node.name) {
    const parentPath = '\u00A0\u00A0'.repeat(node.depth);
    const fullPath = parentPath + (node.name || '');
    printFileRow(fullPath, node.coverage);
  }
  Object.values(node.children)
    .sort((a, b) => a.name.localeCompare(b.name))
    .forEach((child) => printNode(child));
}
printNode(root);

// Print to console (so scripts can either just show it or redirect to a file)
console.log(out.join('\n'));
