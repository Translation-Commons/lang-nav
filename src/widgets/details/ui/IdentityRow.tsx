import React from 'react';

import { LanguageScope } from '@entities/language/LanguageTypes';

import ContextIcon from '@shared/ui/ContextIcon';
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
  if (sourceLabel === 'Other names') {
    return (
      <tr className="border-b border-[color-mix(in_srgb,var(--color-button-secondary)_45%,transparent)] last:border-b-0">
        <td className="px-1 py-1 align-top">
          <div className="font-semibold">{sourceLabel}</div>
        </td>
        <td className="px-1 py-1 align-top" colSpan={sourceLabel === 'Other names' ? 4 : 1}>
          {name}
        </td>
      </tr>
    );
  }

  return (
    <tr className="border-b border-[color-mix(in_srgb,var(--color-button-secondary)_45%,transparent)] last:border-b-0">
      <td className="px-1 py-1 align-top">
        <div className="font-semibold">{sourceLabel}</div>
      </td>
      <td className="px-1 py-1 align-top">{name}</td>
      <td className="px-1 py-1 align-top">
        {scope && (
          <>
            {getLanguageScopeLabel(scope)}{' '}
            <ContextIcon>{getLanguageScopeDescription(scope)}</ContextIcon>
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
            {codeWarning && <ContextIcon severity="warning">{codeWarning}</ContextIcon>}
            {codeDescription && <ContextIcon>{codeDescription}</ContextIcon>}
          </div>
        )}
      </td>
      <td className="px-1 py-1 align-top">{link && <ExternalLink href={link} showDomainOnly />}</td>
    </tr>
  );
};

export default IdentityRow;
