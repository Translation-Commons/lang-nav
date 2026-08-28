import React from 'react';

import { SearchableField } from '@features/params/PageParamTypes';
import EntityFieldHighlightedByPageSearch from '@features/transforms/search/EntityFieldHighlightedByPageSearch';

import useCLDRXMLLink from '@entities/language/digitalsupport/useCLDRXMLLink';
import LanguageOtherNames, { getLanguageOtherNames } from '@entities/language/LanguageOtherNames';
import LanguageRetirementReason from '@entities/language/LanguageRetirementReason';
import { LanguageData, LanguageField, LanguageSource } from '@entities/language/LanguageTypes';
import LanguageWikipediaIdentityRow from '@entities/language/LanguageWikipediaEntry';
import { getCLDRWarningNotes } from '@entities/ui/CLDRWarningNotes';

import Deemphasized from '@shared/ui/Deemphasized';

import LanguageCodeDescriptionBySource from '@strings/LanguageCodeDescriptionBySource';

import DetailsSection from '../ui/DetailsSection';
import IdentityRow from '../ui/IdentityRow';

const LanguageIdentity: React.FC<{ lang: LanguageData }> = ({ lang }) => {
  const otherNames = getLanguageOtherNames(lang);
  const cldrLink = useCLDRXMLLink(lang);
  const cldrWarningNotes = getCLDRWarningNotes(lang);

  return (
    <DetailsSection title="Identity">
      <IdentityTable>
        <IdentityRow
          sourceLabel="LangNav System"
          name={
            <EntityFieldHighlightedByPageSearch ent={lang} field={SearchableField.NameDisplay} />
          }
          scope={lang.scope}
          code={lang.ID}
          codeDescription={
            <LanguageCodeDescriptionBySource languageSource={LanguageSource.Combined} />
          }
        />

        <IdentityRow
          sourceLabel="Glottolog"
          name={
            lang.Glottolog.code ? (
              <EntityFieldHighlightedByPageSearch
                ent={lang}
                field={SearchableField.NameGlottolog}
              />
            ) : (
              <Deemphasized>Not in Glottolog</Deemphasized>
            )
          }
          scope={lang.Glottolog.scope}
          code={lang.Glottolog.code}
          codeDescription={
            <LanguageCodeDescriptionBySource languageSource={LanguageSource.Glottolog} />
          }
          link={
            lang.Glottolog.code &&
            `https://glottolog.org/resource/languoid/id/${lang.Glottolog.code}`
          }
        />

        <IdentityRow
          sourceLabel="ISO"
          name={
            lang.ISO.name ? (
              <EntityFieldHighlightedByPageSearch ent={lang} field={SearchableField.NameISO} />
            ) : (
              <Deemphasized>Not in ISO catalog</Deemphasized>
            )
          }
          scope={lang.ISO.scope}
          code={lang.ISO.code}
          codeAlt={lang.ISO.code6391}
          codeWarning={
            lang.warnings &&
            lang.warnings[LanguageField.isoCode] && <LanguageRetirementReason lang={lang} />
          }
          codeDescription={
            <>
              <LanguageCodeDescriptionBySource languageSource={LanguageSource.ISO} />
              {lang.ISO.code6391 && (
                <div style={{ marginTop: '0.5em' }}>
                  There also is a 2-letter ISO 639-1 code for this language.
                </div>
              )}
            </>
          }
          link={lang.ISO.code && `https://iso639-3.sil.org/code/${lang.ISO.code}`}
        />
        {lang.ISO.code6392b && lang.ISO.code6392b !== lang.ISO.code && (
          <IdentityRow
            sourceLabel="ISO (Bibliographic)"
            name={
              lang.ISO.name ? (
                <EntityFieldHighlightedByPageSearch ent={lang} field={SearchableField.NameISO} />
              ) : (
                <Deemphasized>Not in ISO catalog</Deemphasized>
              )
            }
            scope={lang.ISO.scope}
            code={lang.ISO.code6392b}
            codeWarning="This should not be used, prefer the ISO 639-3 code."
            codeDescription={
              <>
                The ISO 639-2 standard supports 2 different options for some language codes:
                bibliographic or terminology. This was created to help support legacy library
                systems before widespread adoption of the standard ISO 639-3 codes. A handful of
                languages get these codes.
              </>
            }
            link="https://www.loc.gov/standards/iso639-2/php/code_list.php"
          />
        )}
        {lang.CLDR.code && (
          <IdentityRow
            sourceLabel="CLDR"
            name={
              lang.CLDR.name ? (
                <EntityFieldHighlightedByPageSearch ent={lang} field={SearchableField.NameCLDR} />
              ) : (
                <Deemphasized>Not in CLDR</Deemphasized>
              )
            }
            codeWarning={cldrWarningNotes.length ? cldrWarningNotes[0] : null} // showing just 1 note because there is some confusing overlap sometimes
            scope={lang.CLDR.scope}
            code={lang.CLDR.code?.replace('*', '')}
            codeDescription={
              <LanguageCodeDescriptionBySource languageSource={LanguageSource.CLDR} />
            }
            link={cldrLink || undefined}
          />
        )}
        {lang.nameFrench && <IdentityRow sourceLabel="French" name={lang.nameFrench} />}
        {otherNames.length > 0 && (
          <IdentityRow sourceLabel="Other names" name={<LanguageOtherNames lang={lang} />} />
        )}
        {lang.ISO.code && <LanguageWikipediaIdentityRow isoCode={lang.ISO.code} />}
      </IdentityTable>
    </DetailsSection>
  );
};

const IdentityTable: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [isExpanded, setIsExpanded] = React.useState(false);
  const childrenArray = React.Children.toArray(children);
  const visibleChildren = isExpanded ? children : childrenArray.slice(0, 3);

  return (
    <div className="overflow-x-auto rounded-xl border border-[color-mix(in_srgb,var(--color-button-secondary)_70%,transparent)]">
      <table className="w-full min-w-[640px] border-collapse text-left text-sm">
        <thead className="bg-[color-mix(in_srgb,var(--color-button-secondary)_14%,transparent)]">
          <tr className="border-b border-[color-mix(in_srgb,var(--color-button-secondary)_70%,transparent)]">
            <th className="p-1 text-xs font-bold uppercase tracking-[0.05em] text-[var(--color-text-secondary)]">
              Source
            </th>
            <th className="p-1 text-xs font-bold uppercase tracking-[0.05em] text-[var(--color-text-secondary)]">
              Name
            </th>
            <th className="p-1 text-xs font-bold uppercase tracking-[0.05em] text-[var(--color-text-secondary)]">
              Level
            </th>
            <th className="p-1 text-xs font-bold uppercase tracking-[0.05em] text-[var(--color-text-secondary)]">
              Code
            </th>
            <th className="p-1 text-xs font-bold uppercase tracking-[0.05em] text-[var(--color-text-secondary)]">
              Links
            </th>
          </tr>
        </thead>
        <tbody>
          {visibleChildren}
          {childrenArray.length > 3 && (
            <tr>
              <td colSpan={5}>
                <button
                  className="w-full text-sm text-[var(--color-text-secondary)] flat"
                  style={{ padding: '0 0.5em' }}
                  onClick={() => setIsExpanded(!isExpanded)}
                >
                  {isExpanded ? 'see less' : 'see more'}
                </button>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default LanguageIdentity;
