import React from 'react';

import { LanguageScope } from '../../types/LanguageTypes';

export const LanguageScopesDescription: React.FC = () => {
  return (
    <>
      Languages may be classified with different scopes or granularities. For example, to some,
      <em>Germanic</em> is a language family, <em>German</em> is a language, and{' '}
      <em>Swiss German</em> is a dialect. However, some reputable sources argue that <em>German</em>{' '}
      is a macrolanguage and <em>Swiss German</em> is a language, reserving dialects for regional
      variants like <em>Swabian</em>. This resource will use the most common standard but you can
      change how languages are defined in the <strong>Language Definition</strong> setting.
      {Object.values(LanguageScope).map((scope) => {
        return (
          <div key={scope}>
            <label>{scope}:</label>
            {getLanguageScopeDescription(scope)}
          </div>
        );
      })}
    </>
  );
};

export function getLanguageScopeDescription(scope: LanguageScope): string {
  switch (scope) {
    case LanguageScope.Family:
      return 'A collection of similar languages -- usually they can trace a common origin, particularly a culture or ancestral language. Some language families are geographically defined and there may not be (or may not be accepted) genetic ancestry.';
    case LanguageScope.Macrolanguage:
      return 'A collection of languages and dialects that are grouped together as a single language, usually for practical purposes. For example, constituents of the macrolanguage may not be purely mutually intelligible, but the broader community can communicate together in many circumstances.';
    case LanguageScope.Language:
      return 'A language that is not a macrolanguage or dialect. It may be a standard language, a creole, or a pidgin. Different catalogs may disagree on what is a language versus a dialect or group of languages.';
    case LanguageScope.Dialect:
      return 'A subset of a language that has a distinct set of features (eg. phonetic or lexical) from the standard language. Dialects are usually but not certainly mutually intelligible with the standard form of the language or other dialects. In many cases speakers of a dialect often know the standard version of the language as well -- but that varies by area. Dialects are often more pronounced in speech than in writing.';
    case LanguageScope.SpecialCode:
      return 'Otherwise, a language entry may be a special distinction, like "unknown" [und] or "no attested code for this language" [mis].';
  }
}
