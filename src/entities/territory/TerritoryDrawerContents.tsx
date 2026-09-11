import React from 'react';

import DrawerDetailsField from '@widgets/details/ui/DrawerDetailsField';
import DrawerDetailsSection from '@widgets/details/ui/DrawerDetailsSection';

import HoverableEntityName from '@features/layers/hovercard/HoverableEntityName';
import EntityMap from '@features/map/EntityMap';
import LocalParamsProvider from '@features/params/LocalParamsProvider';
import { EntityType } from '@features/params/PageParamTypes';

import { numberToFixedUnlessSmall, numberToSigFigs } from '@shared/lib/numberUtils';
import CountOfPeople from '@shared/ui/CountOfPeople';

import getTerritoryDescendants from './getTerritoryDescendants';
import TerritoryDrawerDependencies from './TerritoryDrawerDependencies';
import TerritoryDrawerIdentity from './TerritoryDrawerIdentity';
import TerritoryDrawerLanguages from './TerritoryDrawerLanguages';
import { TerritoryData, TerritoryScope } from './TerritoryTypes';

type Props = {
  territory: TerritoryData;
};

const TerritoryDrawerContents: React.FC<Props> = ({ territory }) => {
  return (
    <div className="flex flex-col gap-3">
      <section className="overflow-hidden rounded-lg border border-border">
        <LocalParamsProvider overrides={{ limit: -1, entType: EntityType.Territory }}>
          <EntityMap
            maxWidth={400}
            allowColorBar={false}
            entities={[
              territory,
              ...getTerritoryDescendants(territory, territory.scope === TerritoryScope.Country),
            ]}
          />
        </LocalParamsProvider>
      </section>
      <TerritoryDrawerIdentity territory={territory} />

      <DrawerDetailsSection title="Attributes">
        <DrawerDetailsField label="Population">
          <CountOfPeople count={territory.pop.overall} />
        </DrawerDetailsField>
        {territory.literacyPercent && !Number.isNaN(territory.literacyPercent) && (
          <DrawerDetailsField label="Literacy">
            {territory.literacyPercent.toFixed(1)}%
          </DrawerDetailsField>
        )}
        {territory.landArea && (
          <DrawerDetailsField label="Land Area">
            {numberToSigFigs(territory.landArea, 3)?.toLocaleString()} km²
          </DrawerDetailsField>
        )}
        {territory.landArea && territory.pop.overall && (
          <DrawerDetailsField label="Density">
            {numberToFixedUnlessSmall(territory.pop.overall / territory.landArea, 3)} people/km²
          </DrawerDetailsField>
        )}
        {territory.sovereign && (
          <DrawerDetailsField label="Sovereign">
            <HoverableEntityName ent={territory.sovereign} />
          </DrawerDetailsField>
        )}
        <TerritoryDrawerDependencies territory={territory} />
        <TerritoryDrawerLanguages territory={territory} />
      </DrawerDetailsSection>
    </div>
  );
};

export default TerritoryDrawerContents;
