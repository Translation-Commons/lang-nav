import { InfoIcon, TriangleAlertIcon } from 'lucide-react';
import React from 'react';

import Hoverable from '@features/layers/hovercard/Hoverable';

import { LanguageScope } from '@entities/language/LanguageTypes';

import ExternalLink from '@shared/ui/ExternalLink';

import { getLanguageScopeDescription, getLanguageScopeLabel } from '@strings/LanguageScopeStrings';

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

export default IdentityRow;
