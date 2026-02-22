import { GlobeIcon, KeyboardIcon, LanguagesIcon, MapPinIcon } from 'lucide-react';
import React from 'react';

import HoverableObjectName from '@features/layers/hovercard/HoverableObjectName';

import { KeyboardData } from '@entities/keyboard/KeyboardTypes';

import CardField from '@shared/containers/CardField';

interface Props {
  keyboard: KeyboardData;
}

const KeyboardCard: React.FC<Props> = ({ keyboard }) => {
  const {
    nameDisplay,
    platform,
    language,
    territory,
    inputWritingSystem,
    outputWritingSystem,
    variantTagCode,
  } = keyboard;

  const sameScript = keyboard.inputScriptCode === keyboard.outputScriptCode;

  return (
    <div>
      <h3>{nameDisplay}</h3>

      <CardField
        title="Platform"
        icon={KeyboardIcon}
        description="The keyboard platform this layout belongs to."
      >
        {platform}
      </CardField>

      {language != null && (
        <CardField
          title="Language"
          icon={LanguagesIcon}
          description="The language this keyboard is designed for."
        >
          <HoverableObjectName object={language} />
        </CardField>
      )}

      {inputWritingSystem != null && (
        <CardField
          title="Writing System"
          icon={GlobeIcon}
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

      {(territory != null || variantTagCode != null) && (
        <CardField
          title="Variation"
          icon={MapPinIcon}
          description="Territory or variant tag that further specifies this keyboard layout."
        >
          {territory != null && <HoverableObjectName object={territory} />}
          {territory != null && variantTagCode != null && ', '}
          {variantTagCode != null && <span>{variantTagCode}</span>}
        </CardField>
      )}
    </div>
  );
};

export default KeyboardCard;
