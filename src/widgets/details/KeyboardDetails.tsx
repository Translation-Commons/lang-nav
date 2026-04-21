import React from 'react';

import HoverableObjectName from '@features/layers/hovercard/HoverableObjectName';

import { KeyboardData } from '@entities/keyboard/KeyboardTypes';

import DetailsField from '@shared/containers/DetailsField';
import DetailsSection from '@shared/containers/DetailsSection';
import CommaSeparated from '@shared/ui/CommaSeparated';
import Deemphasized from '@shared/ui/Deemphasized';

type Props = {
  keyboard: KeyboardData;
};

const KeyboardDetails: React.FC<Props> = ({ keyboard }) => {
  const {
    platform,
    languageCodes,
    languages,
    territoryCode,
    territory,
    inputScriptCode,
    outputScriptCode,
    inputWritingSystem,
    outputWritingSystem,
    variantCode,
    downloads,
    totalDownloads,
    platformSupport,
    locales,
  } = keyboard;

  const sameScript = inputScriptCode === outputScriptCode;

  return (
    <div className="Details">
      <DetailsSection title="Definition">
        <DetailsField title="Platform">{platform}</DetailsField>

        <DetailsField title="Language">
          {languages && languages.length > 0 ? (
            <CommaSeparated>
              {languages.map((lang) => (
                <HoverableObjectName key={lang.ID} object={lang} />
              ))}
            </CommaSeparated>
          ) : (
            <span>
              {languageCodes.join(', ')} <Deemphasized>[language not in database]</Deemphasized>
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

        {variantCode && <DetailsField title="Variant">{variantCode}</DetailsField>}
        {platformSupport && platformSupport.length > 0 && (
          <DetailsField title="Platforms">{platformSupport.join(', ')}</DetailsField>
        )}

        {downloads != null && (
          <DetailsField title="Downloads (month)">{downloads.toLocaleString()}</DetailsField>
        )}

        {totalDownloads != null && (
          <DetailsField title="Downloads (total)">{totalDownloads.toLocaleString()}</DetailsField>
        )}
      </DetailsSection>

      <DetailsSection title="Connections">
        {locales && locales.length > 0 && (
          <DetailsField title="Locale">
            <CommaSeparated>
              {locales.map((locale) => (
                <HoverableObjectName key={locale.ID} object={locale} />
              ))}
            </CommaSeparated>
          </DetailsField>
        )}
      </DetailsSection>
    </div>
  );
};

export default KeyboardDetails;
