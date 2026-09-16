import React, { useMemo } from 'react';

import { useDataContext } from '@features/data/context/useDataContext';
import { PageParamKey } from '@features/params/PageParamTypes';
import Field from '@features/transforms/fields/Field';

import { OrganizationData } from '@entities/org/OrganizationTypes';

import { useFilterLabels } from '../FilterLabels';
import { getSuggestionsFunction } from '../getSuggestionsFunction';
import useFilters from '../useFilters';

import EntityFilterSelector from './EntityFilterSelector';

type Props = {
  showButtons?: boolean;
};

const OrganizationFilterSelector: React.FC<Props> = ({ showButtons = true }) => {
  const { organizations } = useDataContext();
  const filters = useFilters();
  const filterLabels = useFilterLabels();

  const getSuggestions = useMemo(() => {
    const getMatchDistance = (org: OrganizationData): number => {
      let score = 0;
      if (!filters[Field.Territory](org)) score += 1;
      return score;
    };
    const getMatchGroup = (org: OrganizationData): string => {
      if (!filters[Field.Territory](org)) return 'not ' + filterLabels.territoryFilter;
      return '';
    };

    return getSuggestionsFunction(
      organizations.slice().sort((a, b) => b.censuses.length - a.censuses.length),
      getMatchDistance,
      getMatchGroup,
    );
  }, [organizations, filters, filterLabels]);

  return (
    <EntityFilterSelector
      getSuggestions={getSuggestions}
      pageParameter={PageParamKey.orgFilter}
      showButtons={showButtons}
    />
  );
};

export default OrganizationFilterSelector;
