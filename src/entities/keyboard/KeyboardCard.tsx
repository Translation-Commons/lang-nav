import React from 'react';

import CardEntityField from '@widgets/cardlists/CardEntityField';
import CardExtraFields from '@widgets/cardlists/CardExtraFields';
import CardField from '@widgets/cardlists/CardField';

import HoverableEntityName from '@features/layers/hovercard/HoverableEntityName';
import Field from '@features/transforms/fields/Field';

import type { KeyboardData } from '@entities/keyboard/KeyboardTypes';

import CommaSeparated from '@shared/ui/CommaSeparated';

interface Props {
  keyboard?: KeyboardData;
}

const KeyboardCard: React.FC<Props> = ({ keyboard }) => {
  const { languages, inputWritingSystem, outputWritingSystem } = keyboard ?? {};
  const sameScript = keyboard?.inputScriptCode === keyboard?.outputScriptCode;
  const hasLanguages = languages != null && languages.length > 0;

  return (
    <>
      <CardEntityField field={Field.Platform} ent={keyboard} />

      {hasLanguages && (
        <CardField field={Field.LanguageList}>
          <CommaSeparated>
            {languages.map((lang) => (
              <HoverableEntityName key={lang.ID} ent={lang} />
            ))}
          </CommaSeparated>
        </CardField>
      )}

      {keyboard == null && <CardEntityField field={Field.WritingSystem} />}
      {inputWritingSystem != null && (
        <CardField field={Field.WritingSystem}>
          {sameScript ? (
            <HoverableEntityName ent={inputWritingSystem} />
          ) : (
            <>
              <HoverableEntityName ent={inputWritingSystem} />
              {' → '}
              {outputWritingSystem != null && <HoverableEntityName ent={outputWritingSystem} />}
            </>
          )}
        </CardField>
      )}

      {keyboard?.territory != null && (
        <CardField field={Field.TerritoryPrimary}>
          <HoverableEntityName ent={keyboard.territory} />
        </CardField>
      )}

      {keyboard?.variant != null && (
        <CardField field={Field.Variant}>
          <HoverableEntityName ent={keyboard.variant} />
        </CardField>
      )}

      <CardExtraFields
        ent={keyboard}
        excludeFields={[
          Field.Name,
          Field.Platform,
          Field.LanguageList,
          Field.TerritoryPrimary,
          Field.WritingSystem,
          Field.OutputScript,
          Field.Variant,
        ]}
      />
    </>
  );
};

export default KeyboardCard;
