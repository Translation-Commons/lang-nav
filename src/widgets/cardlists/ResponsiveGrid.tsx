import React from 'react';

// A CSS grid of fixed-width 16.6rem (265.6px) tracks that matches the card-variants.html design
// showcase 1:1. `auto-fill` derives the column count from the container's OWN width (not the
// viewport), so the number per row tracks the space left by the filter/details panels and reflows
// live as they open, close, or drag-resize. Fixed tracks (not `minmax`) mean cards never grow,
// shrink, or squish. `justify-center` centers the whole track set, so the leftover space splits
// evenly into equal side gutters at EVERY column count (flex-wrap could only do this at the cap);
// a partial last row stays aligned to the track columns rather than orphan-centering on its own.
// `max-w-[107.1rem]` + `mx-auto` cap the grid at 6 columns on wide screens (6 x 16.6rem + 5 x 1.5rem
// gap-6 = 99.6 + 7.5 = 107.1rem) and center that capped block. `min(16.6rem,100%)` lets the track
// fall back to the container width below ~265px (e.g. 360px viewport with panels open) so the card
// stays a single readable column instead of overflowing. `w-full min-w-0` give the grid a DEFINITE
// inline size equal to its flex-scroll container (the DataPageBody region, which carries
// `scrollbar-gutter: stable both-edges` so the count stays scrollbar-stable); without it auto-fill
// would size to content and over-count the columns, clipping the last one off the right edge.
const ResponsiveGrid: React.FC<React.PropsWithChildren> = ({ children }) => {
  return (
    <div className="mx-auto grid w-full min-w-0 max-w-[107.1rem] justify-center gap-6 [grid-template-columns:repeat(auto-fill,min(16.6rem,100%))] [&>*]:max-w-full">
      {children}
    </div>
  );
};

export default ResponsiveGrid;
