import React from 'react';

import HoverableObjectName from '@features/layers/hovercard/HoverableObjectName';

import { KeyboardData } from '@entities/keyboard/KeyboardTypes';

import DetailsField from '@shared/containers/DetailsField';
import DetailsSection from '@shared/containers/DetailsSection';
import Deemphasized from '@shared/ui/Deemphasized';

type Props = {
  keyboard: KeyboardData;
};

const KeyboardDetails: React.FC<Props> = ({ keyboard }) => {
  const {
    platform,
    languageCode,
    language,
    territoryCode,
    territory,
    inputScriptCode,
    outputScriptCode,
    inputWritingSystem,
    outputWritingSystem,
    variantTagCode,
  } = keyboard;

  const sameScript = inputScriptCode === outputScriptCode;

  return (
    <div className="Details">
      <DetailsSection title="Definition">
        <DetailsField title="Platform">{platform}</DetailsField>

        <DetailsField title="Language">
          {language ? (
            <HoverableObjectName object={language} />
          ) : (
            <span>
              {languageCode} <Deemphasized>[language not in database]</Deemphasized>
            </span>
          )}
        </DetailsField>

        {(territory || territoryCode) && (
          <DetailsField title="Territory">
            {territory ? (
              <HoverableObjectName object={territory} />
            ) : (
              <span>
                {territoryCode} <Deemphasized>[territory not in database]</Deemphasized>
              </span>
            )}
          </DetailsField>
        )}

        {sameScript ? (
          <DetailsField title="Writing System">
            {inputWritingSystem ? (
              <HoverableObjectName object={inputWritingSystem} />
            ) : (
              <span>
                {inputScriptCode} <Deemphasized>[writing system not in database]</Deemphasized>
              </span>
            )}
          </DetailsField>
        ) : (
          <>
            <DetailsField title="Input Script">
              {inputWritingSystem ? (
                <HoverableObjectName object={inputWritingSystem} />
              ) : (
                <span>
                  {inputScriptCode} <Deemphasized>[writing system not in database]</Deemphasized>
                </span>
              )}
            </DetailsField>
            <DetailsField title="Output Script">
              {outputWritingSystem ? (
                <HoverableObjectName object={outputWritingSystem} />
              ) : (
                <span>
                  {outputScriptCode} <Deemphasized>[writing system not in database]</Deemphasized>
                </span>
              )}
            </DetailsField>
          </>
        )}

        {variantTagCode && <DetailsField title="Variant">{variantTagCode}</DetailsField>}
      </DetailsSection>

      <DetailsSection title="Connections">
        {keyboard.locale ? (
          <DetailsField title="Locale">
            <HoverableObjectName object={keyboard.locale} />
          </DetailsField>
        ) : null}
      </DetailsSection>
    </div>
  );
};

export default KeyboardDetails;
