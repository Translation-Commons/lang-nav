import React from 'react';

import { LanguageData } from '../LanguageTypes';

const cldrLinkExistsCache = new Map<string, string>();

function useCLDRXMLLink(lang: LanguageData): string {
  const code = lang.CLDR?.code?.replace('*', '');

  const [niceURL, setNiceURL] = React.useState<string>(() =>
    code ? (cldrLinkExistsCache.get(code) ?? '') : '',
  );

  React.useEffect(() => {
    if (!code) {
      setNiceURL('');
      return;
    }

    const cached = cldrLinkExistsCache.get(code);
    if (cached !== undefined) {
      setNiceURL(cached);
      return;
    }

    let cancelled = false;
    setNiceURL('');

    const niceURL = `https://github.com/unicode-org/cldr/blob/main/common/main/${code}.xml`;
    const rawURL = `https://raw.githubusercontent.com/unicode-org/cldr/main/common/main/${code}.xml`;

    fetch(rawURL, { method: 'HEAD' })
      .then((response) => {
        const fileExists = response.ok;
        cldrLinkExistsCache.set(code, fileExists ? niceURL : '');
        if (!cancelled) setNiceURL(fileExists ? niceURL : '');
      })
      .catch(() => {
        cldrLinkExistsCache.set(code, '');
        if (!cancelled) setNiceURL('');
      });

    return () => {
      cancelled = true;
    };
  }, [code]);

  return niceURL;
}

export default useCLDRXMLLink;
