import React from 'react';

// Fixed-width cards that wrap to fill the row's OWN width (a flex container), not the viewport, so
// the number per row tracks the space left by the filter/details panels and reflows live as they
// open, close, or drag-resize. Cards never grow, shrink, or squish. `max-w-[88rem]` caps the row
// at 6 columns on wide screens (6 x 13rem cards + gaps) and `mx-auto` centers that capped block in
// the view region so surplus width splits evenly on both sides; rows stay start-aligned inside the
// block so cards line up in columns (a partial last row aligns under the row above rather than
// centering on its own). `max-w-full` lets a card fall back to the container width around 360px so
// it stays a single readable column instead of overflowing.
const ResponsiveGrid: React.FC<React.PropsWithChildren> = ({ children }) => {
  return (
    <div className="mx-auto flex max-w-[88rem] flex-wrap justify-start gap-6 [&>*]:w-[13rem] [&>*]:max-w-full [&>*]:shrink-0">
      {children}
    </div>
  );
};

export default ResponsiveGrid;
