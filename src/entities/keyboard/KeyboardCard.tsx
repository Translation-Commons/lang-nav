import React from 'react';

import HoverableEntityName from '@features/layers/hovercard/HoverableEntityName';
import EntityFieldDisplay from '@features/transforms/fields/EntityFieldDisplay';
import Field from '@features/transforms/fields/Field';
import useActiveTransforms from '@features/transforms/useActiveTransforms';

import { KeyboardData } from '@entities/keyboard/KeyboardTypes';

import CardField from '@shared/containers/CardField';
import CommaSeparated from '@shared/ui/CommaSeparated';

interface Props {
  keyboard: KeyboardData;
}

const KeyboardCard: React.FC<Props> = ({ keyboard }) => {
  const {
    nameDisplay,
    platform,
    languages,
    territory,
    inputWritingSystem,
    outputWritingSystem,
    variant,
  } = keyboard;
  const extraFields = useActiveTransforms([
    Field.Name,
    Field.Platform,
    Field.LanguageList,
    Field.TerritoryPrimary,
    Field.WritingSystem,
    Field.OutputScript,
    Field.Variant,
  ]);

  const sameScript = keyboard.inputScriptCode === keyboard.outputScriptCode;
  const hasLanguages = languages != null && languages.length > 0;

  return (
    <div>
      <div style={{ fontSize: '1.5em', marginBottom: '0.5em' }}>{nameDisplay}</div>
      <CardField field={Field.Platform}>{platform}</CardField>

      {hasLanguages && (
        <CardField field={Field.LanguageList}>
          <CommaSeparated>
            {languages.map((lang) => (
              <HoverableEntityName key={lang.ID} ent={lang} />
            ))}
          </CommaSeparated>
        </CardField>
      )}

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

      {territory != null && (
        <CardField field={Field.TerritoryPrimary}>
          {territory != null && <HoverableEntityName ent={territory} />}
        </CardField>
      )}

      {variant != null && (
        <CardField field={Field.Variant}>
          {variant != null && <HoverableEntityName ent={variant} />}
        </CardField>
      )}

      {extraFields.map((field) => (
        <CardField key={field} field={field}>
          <EntityFieldDisplay ent={keyboard} field={field} />
        </CardField>
      ))}
    </div>
  );
};

export default KeyboardCard;
