import React, { useMemo } from 'react';

import CardInCardList from '@widgets/cardlists/CardInCardList';
import ResponsiveGrid from '@widgets/cardlists/ResponsiveGrid';

import { useDataContext } from '@features/data/context/useDataContext';
import useEntities from '@features/data/context/useEntities';
import HoverableEntityName from '@features/layers/hovercard/HoverableEntityName';
import LimitInput from '@features/pagination/LimitInput';
import PaginationControls from '@features/pagination/PaginationControls';
import usePagination from '@features/pagination/usePagination';
import { EntityType } from '@features/params/PageParamTypes';
import useFilteredEntities from '@features/transforms/filtering/useFilteredEntities';

import { LanguageData } from '@entities/language/LanguageTypes';

import Deemphasized from '@shared/ui/Deemphasized';

const ReportLanguagesDubious: React.FC = () => {
  const { getLanguage, getTerritory, getWritingSystem } = useDataContext();
  const ents = useEntities(EntityType.Language) as LanguageData[];
  const filteredLangs = useFilteredEntities({ useScope: false, inputEnts: ents }).filteredEntities;
  const langs = useMemo(
    () => filteredLangs.filter((lang) => lang.codeDisplay.match('xx.-|^[0-9]')),
    [filteredLangs],
  );
  const { getCurrentEntities } = usePagination<LanguageData>();

  return (
    <>
      These languages have strange language codes and maybe should be removed from the list of
      languages. Some possibilities are:
      <ol>
        <li>
          It may be a dialect that doesn&apos;t have a standard ISO code. There may be a glottocode
          instead -- in that case it&apos;s probably redundant.
        </li>
        <li>
          If it is a combination of a language + territory, it is probably a locale incorrectly
          saved to the language list. Add the locale if it does not yet exist then remove the entry
          from the language list.
        </li>
        <li>
          If it is a combination of a language + writing system, it is probably there to represent
          an non-standard writing system used to write that language. We have not yet imported
          writing system alternatives so we cannot add that data yet.
        </li>
      </ol>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1em', marginTop: '1em' }}>
        <LimitInput />
        <div>
          <PaginationControls itemCount={langs.length} />
        </div>
      </div>
      <div style={{ marginTop: '1em', marginBottom: '1em' }}>
        <ResponsiveGrid>
          {getCurrentEntities(langs).map((lang) => {
            const codePieces = lang.codeDisplay.split(/-|_/);
            const relatedEntities = codePieces
              .map(
                (partialCode) =>
                  getLanguage(partialCode) ??
                  getTerritory(partialCode) ??
                  getWritingSystem(partialCode),
              )
              .filter((entity) => entity != null);
            // TODO if its a language + territory, check if the locale exists
            // TODO check if there is an IANA variant.
            return (
              <CardInCardList key={lang.ID} ent={lang}>
                <div>
                  <label>Names:</label>
                  {lang.nameDisplay}
                </div>
                <div>
                  <label>Language Code:</label>
                  {lang.codeDisplay}
                </div>
                <div>
                  <label>Population:</label>
                  {lang.pop.overall || <Deemphasized>no population</Deemphasized>}
                </div>
                <div>
                  <label>Potentially related entities:</label>
                  <ul style={{ margin: 0 }}>
                    {relatedEntities.length > 0 ? (
                      relatedEntities.map((entity) => (
                        <li key={entity.ID}>
                          <HoverableEntityName ent={entity} labelSource="code" />
                        </li>
                      ))
                    ) : (
                      <Deemphasized>none</Deemphasized>
                    )}
                  </ul>
                </div>
              </CardInCardList>
            );
          })}
        </ResponsiveGrid>
      </div>
    </>
  );
};

export default ReportLanguagesDubious;
