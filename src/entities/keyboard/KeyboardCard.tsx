import React from 'react';

import HoverableObjectName from '@features/layers/hovercard/HoverableObjectName';
import Field from '@features/transforms/fields/Field';

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

  const sameScript = keyboard.inputScriptCode === keyboard.outputScriptCode;
  const hasLanguages = languages != null && languages.length > 0;

  return (
    <div>
      <div style={{ fontSize: '1.5em', marginBottom: '0.5em' }}>{nameDisplay}</div>
      <CardField
        title="Platform"
        field={Field.Platform}
        description="The keyboard platform this layout belongs to."
      >
        {platform}
      </CardField>

      {hasLanguages && (
        <CardField
          title="Language"
          field={Field.Language}
          description="The language(s) this keyboard is designed for."
        >
          <CommaSeparated>
            {languages.map((lang) => (
              <HoverableObjectName key={lang.ID} object={lang} />
            ))}
          </CommaSeparated>
        </CardField>
      )}

      {inputWritingSystem != null && (
        <CardField
          title="Writing System"
          field={Field.WritingSystem}
          description={
            sameScript
              ? 'The writing system used by this keyboard.'
              : 'The input and output writing systems for this keyboard.'
          }
        >
          {sameScript ? (
            <HoverableObjectName object={inputWritingSystem} />
          ) : (
            <>
              <HoverableObjectName object={inputWritingSystem} />
              {' → '}
              {outputWritingSystem != null && <HoverableObjectName object={outputWritingSystem} />}
            </>
          )}
        </CardField>
      )}

      {(territory != null || variant != null) && (
        <CardField
          title="Variation"
          field={Field.Variant}
          description="Territory or variant that further specifies this keyboard layout."
        >
          <CommaSeparated>
            {territory != null && <HoverableObjectName object={territory} />}
            {variant != null && <HoverableObjectName object={variant} />}
          </CommaSeparated>
        </CardField>
      )}
    </div>
  );
};

export default KeyboardCard;
