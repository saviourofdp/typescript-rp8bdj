// Import stylesheets
import './style.css';

import { dataView } from './dataView';

import * as d3 from 'd3';

const hierarchy = d3.hierarchy(dataView[0].matrix.columns.root);
const descendants = hierarchy.descendants();

let split = false;
const splitAtDepth = 3;

let output = [];

for (
  let depth = descendants[0].depth;
  depth <= descendants.filter((d) => d.height === 0)[0].depth;
  depth++
) {
  let outputRow = [];
  const row = descendants.filter((d) => d.depth === depth);
  let x = 1;
  for (let c = 0; c < row.length; c++) {
    const cell = row[c];
    const cellLowestDescendants = cell
      .descendants()
      .filter((d) => d.height === 0);
    const cellImmediateDescendants = cell
      .descendants()
      .filter((d) => d.height === cell.height - 1);
    const y = cell.depth + 1;

    let lowestDescendantCount = cellLowestDescendants.length;

    let span = lowestDescendantCount;

    let d = Array(1)
      .fill({
        span: span,
        x: x,
        y: y,
        depth: cell.depth,
        value: cell.data.value,
      })
      .flat();
      x += span;
    outputRow.push(d);

    // if (c < row.length - 1) {
    //   outputRow.push([{ x: x, y: y, span: 1, gap: true }]);
    //   x++;
    // }
  }
  
  output.push(outputRow.flat());
}

const columnWidth = 50;
const gapWidth = 10;

const splitRow = output[output.length - 1];
console.log(splitRow);
const gridColumns = splitRow
  .map((r) => (r.gap ? `${gapWidth}px` : `${columnWidth}px`))
  .join(' ');
const gridRows = Array(output.length).fill('40px').join(' ');
const data = output.flat();
d3.select('#app')
  .style('grid-template-columns', gridColumns)
  .style('grid-template-rows', gridRows)
  .selectAll('div.row')
  .data(data)
  .enter()
  .append('div')
  .classed('cell', true)
  .style('grid-column-start', (d) => d.x)
  .style('grid-column-end', (d) => d.x + d.span)
  .style('grid-row-start', (d, i) => d.y)
  .style('grid-row-end', (d, i) => d.y + 1)
  .html((d, i) => {
    if (/^http/.test(d.value)) {
      return `<img src="${d.value}" style="width:50px"/>`;
    }
    return d.gap ? null : d.value ?? i;
  });
