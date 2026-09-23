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
          <th>Name</th>
          <th>Our Framework</th>
          <th colSpan={2}>
            <ExternalLink href="https://glottolog.org/"> Glottolog</ExternalLink>
          </th>
          <th colSpan={2}>
            <ExternalLink href="https://iso639-3.sil.org/code_tables/639/data"> ISO</ExternalLink>
          </th>
        </tr>
        <tr>
          <th></th>
          <th></th>
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
        <tr>
          <td colSpan={6} className="py-2">
            <hr />
          </td>
        </tr>
        <tr>
          <td>Indo-European</td>
          <td>Family</td>
          <td>indo1319</td>
          <td>Family</td>
          <td>ine</td>
          <td>Family</td>
        </tr>
        <tr>
          <td>Classical Indo-European</td>
          <td>Branch</td>
          <td>clas1257</td>
          <td>Family</td>
          <td colSpan={2} className="text-muted-foreground text-center">
            —
          </td>
        </tr>
        <tr>
          <td>Balto-Slavic</td>
          <td>Branch</td>
          <td>balt1263</td>
          <td>Family</td>
          <td colSpan={2} className="text-muted-foreground text-center">
            —
          </td>
        </tr>
        <tr>
          <td>Slavic</td>
          <td>Branch</td>
          <td>sla</td>
          <td>Family</td>
          <td>sla</td>
          <td>Family</td>
        </tr>
        <tr>
          <td>South Slavic</td>
          <td>Branch</td>
          <td>zls</td>
          <td>Family</td>
          <td>zls</td>
          <td>Family</td>
        </tr>
        <tr>
          <td>Western South Slavic</td>
          <td>Branch</td>
          <td>west2804</td>
          <td>Family</td>
          <td colSpan={2} className="text-muted-foreground text-center">
            —
          </td>
        </tr>
        <tr>
          <td>Serbo-Croatian</td>
          <td>Macrolanguage</td>
          <td>hbs</td>
          <td>Family</td>
          <td>hbs</td>
          <td>Macrolanguage</td>
        </tr>
        <tr>
          <td>Shtokavski</td>
          <td>Variety</td>
          <td>shto1241</td>
          <td>Family</td>
          <td colSpan={2} className="text-muted-foreground text-center">
            —
          </td>
        </tr>
        <tr>
          <td>New Shtokavian</td>
          <td>Variety</td>
          <td>news1236</td>
          <td>Family</td>
          <td colSpan={2} className="text-muted-foreground text-center">
            —
          </td>
        </tr>
        <tr>
          <td>Eastern Herzegovinian Shtokavian</td>
          <td>Variety</td>
          <td>east2821</td>
          <td>Family</td>
          <td colSpan={2} className="text-muted-foreground text-center">
            —
          </td>
        </tr>
        <tr>
          <td>Serbian</td>
          <td>Language</td>
          <td>serb1264</td>
          <td>Dialect</td>
          <td>srp / sr</td>
          <td>Language</td>
        </tr>
        <tr>
          <td>Serbian (Bibliographic)</td>
          <td>Deprecated</td>
          <td colSpan={2} className="text-muted-foreground text-center">
            —
          </td>
          <td>scc</td>
          <td>Retired</td>
        </tr>
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
