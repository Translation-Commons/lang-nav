import React from 'react';

import { useDataContext } from '@features/data/context/useDataContext';
import HoverableEntityName from '@features/layers/hovercard/HoverableEntityName';

import { LanguageData, LanguageScope } from '@entities/language/LanguageTypes';

import ExternalLink from '@shared/ui/ExternalLink';

import { getLanguageScopeLabel } from '@strings/LanguageScopeStrings';

const LanguageTaxonomyTable: React.FC = () => {
  const { getLanguage } = useDataContext();
  return (
    <table className="w-fit mx-auto [&_td:nth-child(n+2)]:text-center [&_td]:px-2 [&_td:nth-child(2n+3)]:font-mono [&_td:nth-child(2n+3)]:text-xs">
      <thead>
        <tr>
          <th></th>
          <th>Our Framework</th>
          <th colSpan={2}>
            <ExternalLink href="https://glottolog.org/"> Glottolog</ExternalLink>
          </th>
          <th colSpan={2}>
            <ExternalLink href="https://iso639-3.sil.org/code_tables/639/data"> ISO</ExternalLink>
          </th>
        </tr>
        <tr>
          <th>Name</th>
          <th>Level</th>
          <th>Code</th>
          <th>Level</th>
          <th>Code</th>
          <th>Level</th>
        </tr>
      </thead>
      <tbody>
        <LanguageTaxonomyRow lang={getLanguage('scc')} />
        <tr>
          <td colSpan={6} className="py-2">
            <hr />
          </td>
        </tr>
        <LanguageTaxonomyRow lang={getLanguage('sout2974')} />
      </tbody>
    </table>
  );
};

function LanguageTaxonomyRow({ lang }: { lang: LanguageData | undefined }) {
  if (!lang) return null;
  return (
    <>
      <LanguageTaxonomyRow lang={lang.parentLanguage} />
      <tr>
        <td>
          <HoverableEntityName ent={lang} />
        </td>
        <td>{getScopeLabel(lang.Combined.scope)}</td>
        <td>{lang.Glottolog.code ?? '—'}</td>
        <td>{getScopeLabel(lang.Glottolog.scope)}</td>
        <td>{lang.ISO.code ?? '—'}</td>
        <td>{getScopeLabel(lang.ISO.scope)}</td>
      </tr>
    </>
  );
}

function getScopeLabel(scope?: LanguageScope) {
  if (!scope) return '—';
  if (scope === LanguageScope.Family) return 'Family';
  if (scope === LanguageScope.Language) return 'Language';
  return getLanguageScopeLabel(scope);
}

export default LanguageTaxonomyTable;
