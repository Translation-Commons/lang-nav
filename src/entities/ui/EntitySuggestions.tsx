import React from 'react';

import HoverableEntityName from '@features/layers/hovercard/HoverableEntityName';
import { EntityType } from '@features/params/PageParamTypes';

import getEntityFromID from '../lib/getEntityFromID';

const EntitySuggestions: React.FC<{ entType: EntityType }> = ({ entType }) => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: '1em',
        justifyContent: 'center',
        marginTop: '1em',
      }}
    >
      {getEntityIDs(entType).map((id) => (
        <HoverableEntityName key={id} ent={getEntityFromID(id)} format="button" />
      ))}
    </div>
  );
};

function getEntityIDs(entType: EntityType): string[] {
  switch (entType) {
    case EntityType.Census:
      return ['ca2021.1', 'ca2021.4', 'in2011c16.1', 'in2011c17.4'];
    case EntityType.Language:
      return ['eng', 'spa', 'fra', 'rus', 'zho', 'ara'];
    case EntityType.Locale:
      return ['eng_US', 'spa_419', 'fra_FR', 'rus_RU', 'arb_001', 'zho_Hans_CN', 'cmn_CN'];
    case EntityType.Territory:
      return ['US', 'MX', 'FR', 'RU', 'EG', 'CN'];
    case EntityType.Variant:
      return ['valencia', 'grclass', 'rumgr', 'pinyin'];
    case EntityType.WritingSystem:
      return ['Latn', 'Cyrl', 'Arab', 'Hans', 'Hant'];
    case EntityType.Keyboard:
      return [
        'gboard_eng_Latn_US',
        'gboard_spa_Latn_ES',
        'gboard_fra_Latn_FR',
        'gboard_ara_Arab_SA',
      ];
    case EntityType.Org:
      return [];
  }
}

export default EntitySuggestions;
