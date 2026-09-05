import { useState } from 'react';

import { EntityData } from '@entities/types/DataTypes';

import MiniCard from './MiniCard';

type Props = {
  ents: EntityData[];
};

function MiniCardList({ ents }: Props) {
  const [showAll, setShowAll] = useState(false);
  const lastEntShown = showAll ? ents.length : ents.length > 12 ? 11 : ents.length;

  // TODO: vertical middle?
  return (
    <div className="@container">
      <div className="grid gap-6 grid-cols-1 @xs:grid-cols-2 @sm:grid-cols-3 @md:grid-cols-4 @lg:grid-cols-4 @xl:grid-cols-6">
        {ents.slice(0, lastEntShown).map((d) => (
          <div className="shadow-sm rounded-md p-4 hover:bg-accent cursor-pointer" key={d.ID}>
            <MiniCard ent={d} />
          </div>
        ))}
        {ents.length > 12 && (
          <div
            role="button"
            className="shadow-sm rounded-md p-4 flex justify-center text-center items-center  hover:bg-accent cursor-pointer"
            onClick={() => setShowAll((prev) => !prev)}
          >
            {showAll ? (
              'show less'
            ) : (
              <>
                +{ents.length - 11}
                <br />
                show all
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default MiniCardList;
