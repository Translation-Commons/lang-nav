import React from 'react';

import DetailsField from '@widgets/details/ui/DetailsField';
import DetailsSection from '@widgets/details/ui/DetailsSection';

import HoverableEntityName from '@features/layers/hovercard/HoverableEntityName';

import CommaSeparated from '@shared/ui/CommaSeparated';
import Deemphasized from '@shared/ui/Deemphasized';

import { KeyboardData } from './KeyboardTypes';

type Props = {
  keyboard: KeyboardData;
};

const KeyboardDetails: React.FC<Props> = ({ keyboard }) => {
  const {
    inputTech,
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
        <DetailsField title="Language">
          {languages && languages.length > 0 ? (
            <CommaSeparated>
              {languages.map((lang) => (
                <HoverableEntityName key={lang.ID} ent={lang} />
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
              <HoverableEntityName ent={territory} />
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
              <HoverableEntityName ent={inputWritingSystem} />
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
                <HoverableEntityName ent={inputWritingSystem} />
              ) : (
                <span>
                  {inputScriptCode} <Deemphasized>[writing system not in database]</Deemphasized>
                </span>
              )}
            </DetailsField>
            <DetailsField title="Output Script">
              {outputWritingSystem ? (
                <HoverableEntityName ent={outputWritingSystem} />
              ) : (
                <span>
                  {outputScriptCode} <Deemphasized>[writing system not in database]</Deemphasized>
                </span>
              )}
            </DetailsField>
          </>
        )}

        {variantCode && <DetailsField title="Variant">{variantCode}</DetailsField>}

        <DetailsField title="Input Technology">
          <HoverableEntityName ent={inputTech} />
        </DetailsField>
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
                <HoverableEntityName key={locale.ID} ent={locale} />
              ))}
            </CommaSeparated>
          </DetailsField>
        )}
      </DetailsSection>
    </div>
  );
};

export default KeyboardDetails;
