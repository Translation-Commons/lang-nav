import { InfoIcon, TriangleAlertIcon } from 'lucide-react';
import React from 'react';

import Hoverable from '@features/layers/hovercard/Hoverable';
import { SearchableField } from '@features/params/PageParamTypes';
import ObjectFieldHighlightedByPageSearch from '@features/transforms/search/ObjectFieldHighlightedByPageSearch';

import LanguageOtherNames, { getLanguageOtherNames } from '@entities/language/LanguageOtherNames';
import LanguageRetirementReason from '@entities/language/LanguageRetirementReason';
import {
  LanguageData,
  LanguageField,
  LanguageScope,
  LanguageSource,
} from '@entities/language/LanguageTypes';

import Deemphasized from '@shared/ui/Deemphasized';
import ExternalLink from '@shared/ui/ExternalLink';

import LanguageCodeDescriptionBySource from '@strings/LanguageCodeDescriptionBySource';
import { getLanguageScopeDescription, getLanguageScopeLabel } from '@strings/LanguageScopeStrings';

import DetailsSection from '../ui/DetailsSection';

const LanguageIdentity: React.FC<{ lang: LanguageData }> = ({ lang }) => {
  const otherNames = getLanguageOtherNames(lang);

  return (
    <DetailsSection title="Language Identity">
      <IdentityTable>
        <IdentityRow
          sourceLabel="LangNav System"
          name={
            <ObjectFieldHighlightedByPageSearch object={lang} field={SearchableField.NameDisplay} />
          }
          scope={lang.scope}
          code={lang.ID}
          codeDescription={
            <LanguageCodeDescriptionBySource languageSource={LanguageSource.Combined} />
          }
        />

        {lang.Glottolog.code && (
          <IdentityRow
            sourceLabel="Glottolog"
            name={
              lang.Glottolog.code ? (
                <ObjectFieldHighlightedByPageSearch
                  object={lang}
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
        )}

        <IdentityRow
          sourceLabel="ISO"
          name={
            lang.ISO.name ? (
              <ObjectFieldHighlightedByPageSearch object={lang} field={SearchableField.NameISO} />
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
        {(lang.CLDR.code || lang.CLDR.name) && (
          <IdentityRow
            sourceLabel="CLDR"
            name={
              lang.CLDR.name ? (
                <ObjectFieldHighlightedByPageSearch
                  object={lang}
                  field={SearchableField.NameCLDR}
                />
              ) : (
                <Deemphasized>Not in CLDR</Deemphasized>
              )
            }
            scope={lang.CLDR.scope}
            code={lang.CLDR.code}
            codeDescription={
              <LanguageCodeDescriptionBySource languageSource={LanguageSource.CLDR} />
            }
            link={`https://github.com/unicode-org/cldr/blob/main/common/main/${lang.CLDR.code}.xml`}
          />
        )}

        {(lang.Ethnologue.code || lang.Ethnologue.name) && (
          <IdentityRow
            sourceLabel="Ethnologue"
            name={
              lang.Ethnologue.name ? (
                <ObjectFieldHighlightedByPageSearch
                  object={lang}
                  field={SearchableField.NameEthnologue}
                />
              ) : (
                <Deemphasized>Not in Ethnologue</Deemphasized>
              )
            }
            scope={lang.Ethnologue.scope}
            code={lang.Ethnologue.code}
            link={`https://www.ethnologue.com/language/${lang.Ethnologue.code}`}
          />
        )}
        {lang.nameFrench && <IdentityRow sourceLabel="French" name={lang.nameFrench} />}
        {otherNames.length > 0 && (
          <IdentityRow sourceLabel="Other names" name={<LanguageOtherNames lang={lang} />} />
        )}
        {lang.ISO.code && (
          <IdentityRow
            sourceLabel="Wikipedia"
            name="???"
            link={`https://en.wikipedia.org/wiki/ISO_639:${lang.ISO.code}`}
          />
        )}
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

const IdentityRow: React.FC<{
  sourceLabel: string;
  name: React.ReactNode;
  code?: React.ReactNode;
  codeAlt?: string;
  codeWarning?: React.ReactNode;
  codeDescription?: React.ReactNode;
  link?: string;
  scope?: LanguageScope;
}> = ({ sourceLabel, name, code, codeAlt, codeDescription, codeWarning, link, scope }) => {
  return (
    <tr className="border-b border-[color-mix(in_srgb,var(--color-button-secondary)_45%,transparent)] last:border-b-0">
      <td className="px-1 py-1 align-top">
        <div className="font-semibold">{sourceLabel}</div>
      </td>
      <td className="px-1 py-1 align-top" colSpan={sourceLabel === 'Other names' ? 4 : 1}>
        {name}
      </td>
      <td className="px-1 py-1 align-top">
        {scope && (
          <>
            {getLanguageScopeLabel(scope)}{' '}
            <Hoverable hoverContent={getLanguageScopeDescription(scope)}>
              <InfoIcon className="h-3.5 w-3.5 text-[var(--color-text-secondary)]" />
            </Hoverable>
          </>
        )}
      </td>
      <td className="px-1 py-1 align-top">
        {code && (
          <div className="inline-flex items-center gap-1.5 text-sm">
            <code className="rounded bg-[color-mix(in_srgb,var(--color-button-secondary)_14%,transparent)] px-1.5 py-0.5 text-xs">
              {code}
            </code>
            {codeAlt && (
              <code className="rounded bg-[color-mix(in_srgb,var(--color-button-secondary)_14%,transparent)] px-1.5 py-0.5 text-xs">
                {codeAlt}
              </code>
            )}
            {codeWarning && (
              <Hoverable hoverContent={codeWarning}>
                <TriangleAlertIcon className="h-3.5 w-3.5 text-[var(--color-text-secondary)]" />
              </Hoverable>
            )}
            {codeDescription && (
              <Hoverable hoverContent={codeDescription}>
                <InfoIcon className="h-3.5 w-3.5 text-[var(--color-text-secondary)]" />
              </Hoverable>
            )}
          </div>
        )}
      </td>
      <td className="px-1 py-1 align-top">{link && <ExternalLink href={link} showDomainOnly />}</td>
    </tr>
  );
};

export default LanguageIdentity;
